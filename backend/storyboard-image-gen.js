// ============================================================================
// Storyboard pencil-sketch image generation — SHARED source of truth.
// Used by:
//   • generate-storyboard-images.js  (CLI batch pre-render → Vercel static)
//   • server.js  GET /api/storyboards/:code/frame/:n.png  (lazy on-demand)
//
// Style: elegant graphite pencil sketch, one curated model per species+category,
// soft GREEN "active muscle" glow (green = working, not red = pain).
//
// Three invariants this module now enforces:
//   1. SPECIES  — the caller must say what animal this is. No canine default.
//   2. CACHE    — every cached PNG is keyed by a hash of the exact prompt that
//                 produced it, so copy edits can never leave a stale image
//                 illustrating a step that changed underneath it.
//   3. SERIES   — frames 2..N are drawn as edits of frame 1, so one exercise
//                 yields one animal in one style instead of N unrelated images.
// ============================================================================
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const OpenAI = require("openai");
const { toFile } = require("openai");

const {
  BREED_BY_CATEGORY,
  FELINE_BREED_BY_CATEGORY,
  CANINE_DEFAULT,
  FELINE_DEFAULT,
} = require("./storyboard-image-gen-breeds");

const { validateBeforeGenerate, StoryboardValidationError } = require("./storyboard-validate");

// gpt-image-2 (2026) is OpenAI's current image model and is markedly better at
// holding a subject consistent across a series — which is exactly what a
// step-by-step exercise handout needs. It supports v1/images/edits with one or
// more reference images, so the frame-1-as-reference chain below works on it
// unchanged. All three are env-overridable so the model can be rolled forward
// or back without a code change.
const MODEL = process.env.STORYBOARD_IMAGE_MODEL || "gpt-image-2";
const SIZE = process.env.STORYBOARD_IMAGE_SIZE || "1024x1024";
const QUALITY = process.env.STORYBOARD_IMAGE_QUALITY || "medium";

// Soft green "active muscle" glow (green = go/working, never red = pain/stop).
const GLOW =
  'a soft, light luminous emerald-green glow (subtle, low opacity, a calm "this muscle is actively working" indicator)';

// ── Species helpers ─────────────────────────────────────────────────────────
function isFeline(species, code) {
  return String(species || "").toUpperCase() === "FELINE" ||
         String(code || "").toUpperCase().startsWith("FELINE");
}

// The species noun used throughout the prompt. Getting this wrong is the whole
// bug class: the prompt used to say "dog" unconditionally.
function nounFor(feline) {
  return feline ? "cat" : "dog";
}

function breedFor(category, force, species, code) {
  if (force) return force;
  if (isFeline(species, code)) {
    return FELINE_BREED_BY_CATEGORY[category] || FELINE_DEFAULT;
  }
  return BREED_BY_CATEGORY[category] || CANINE_DEFAULT;
}

function muscleRegions(frame) {
  return (frame.svg_indicators || [])
    .filter((i) => i.type === "muscle_highlight")
    .map((i) => i.region)
    .filter(Boolean);
}

// Strip the storyboard's baked-in breed/build (e.g. "Pembroke Welsh Corgi (28 lbs, ...)")
// so it doesn't fight the chosen drawing model and produce two animals.
function clean(text, modelBreed, noun) {
  if (!text) return "";
  const n = noun || "dog";
  let t = String(text).replace(/\([^)]*\)/g, " "); // drop parentheticals (weights/builds)
  if (modelBreed) {
    // Replace "the <Breed>" before bare "<Breed>", otherwise the article is
    // duplicated ("the the cat") — a pre-existing bug in the canine path too.
    t = t.split("the " + modelBreed).join("the " + n);
    t = t.split("The " + modelBreed).join("The " + n);
    t = t.split(modelBreed).join("the " + n);
  }
  // Source storyboard copy is written canine-first. For feline patients the
  // species words must be rewritten or the sketch prompt contradicts itself.
  if (n === "cat") {
    t = t.replace(/\bdogs\b/g, "cats").replace(/\bDogs\b/g, "Cats")
         .replace(/\bdog\b/g, "cat").replace(/\bDog\b/g, "Cat")
         .replace(/\bcanine\b/g, "feline").replace(/\bCanine\b/g, "Feline");
  }
  return t.replace(/\s+/g, " ").trim();
}

/**
 * WHO IS IN THE PICTURE.  `[Sal, 2026-09-26]`
 *
 * "I FEEL ONLY HANDS ARMS OF THE ASSISTANT AND FOCUS ON THE DOG AND EXERCISE"
 *
 * The prompt used to say "A person gently assisting", which draws a whole
 * human being. Two things go wrong with that. The person competes with the
 * animal for the eye, so an owner looking for the dog's POSITION reads a
 * drawing of somebody kneeling. And a full figure is where this class of
 * model fails worst — faces, hands and bodies are exactly what it renders
 * badly, which is most of why Sal's verdict on the first batch was "pics are
 * not great".
 *
 * Hands and forearms carry all the clinical information that matters: where
 * the support goes, which joint is held, how the limb is guided. Nothing
 * above the elbow tells an owner anything.
 */
// The handler_action sentences were written for a clinician and describe a
// whole body — "Kneeling at patient's side", "Standing behind the patient".
// Fed in unqualified they contradict the rule below inside the same prompt,
// and a prompt that argues with itself is how a model splits the difference
// and draws half a person. The lead-in tells it which half to keep.
const HANDS_ONLY =
  "Only the assistant's HANDS AND FOREARMS appear, entering the frame to " +
  "assist. NO face, NO head, NO torso, NO legs, NO full human figure — " +
  "hands and forearms only, drawn simply so they support the composition " +
  "rather than compete with it.";

/** The animal is the subject. Everything else serves it. */
const FOCUS =
  "Composition: the animal is the clear subject, large in frame and fully " +
  "visible, with the exercise movement unmistakable at a glance.";

const FELINE_ANCHOR =
  "The subject is a CAT, not a dog. Feline anatomy and proportions throughout: " +
  "short muzzle, upright triangular ears, long flexible spine, retractable claws, long tail.";

function buildPrompt(sb, frame, breed, species, code) {
  const bm = sb.breed_model?.breed;
  const feline = isFeline(species, code);
  const noun = nounFor(feline);
  const mus = muscleRegions(frame);
  const glow = mus.length
    ? `Gently highlight the ${mus.join(" and ")} muscle group(s) with ${GLOW}, indicating the muscles actively being worked in this step, softly blended into the drawing; the rest of the ${noun} stays a clean graphite pencil sketch.`
    : "";
  return [
    `Elegant hand-drawn graphite pencil sketch illustration for a veterinary rehabilitation client handout.`,
    `A single ${breed} (well-proportioned, anatomically accurate, natural coat) performing the exercise "${sb.exercise_name}".`,
    feline ? FELINE_ANCHOR : "",
    `This step "${frame.frame_title}": ${clean(frame.frame_description, bm, noun)}.`,
    clean(frame.dog_action, bm, noun) ? `The ${noun}: ${clean(frame.dog_action, bm, noun)}.` : "",
    clean(frame.handler_action, bm, noun) ? `Assisting hands — draw ONLY the hands and forearms, ignoring any body position this sentence mentions: ${clean(frame.handler_action, bm, noun)}.` : "",
    HANDS_ONLY,
    glow,
    FOCUS,
    `Style: refined confident pencil line work with soft shading, plain white background, ONE ${noun} only, anatomically clear and clinically plausible posture, warm and friendly, easy to understand at a glance, professional medical-illustration quality.`,
    `No text, labels, arrows, captions, diagrams, or watermarks — just the drawing. No full human figure and no face anywhere in the image.`,
  ]
    .filter(Boolean)
    .join(" ");
}

// Prompt used when drawing a LATER frame as an edit of the series' first frame.
// The reference image carries the animal and the style; this text carries only
// what changed. Without this, every frame was an independent generation and the
// subject drifted — different dog, different rendering, sometimes photoreal.
function buildRefPrompt(sb, frame, breed, species, code) {
  const bm = sb.breed_model?.breed;
  const feline = isFeline(species, code);
  const noun = nounFor(feline);
  const mus = muscleRegions(frame);
  const glow = mus.length
    ? `Gently highlight the ${mus.join(" and ")} muscle group(s) with ${GLOW}.`
    : "";
  return [
    `Using the attached image as the visual reference, draw the NEXT step of the same illustrated series.`,
    `Keep the SAME ${breed} — identical coat, markings, build and face — and the SAME graphite pencil sketch style, line weight and plain white background.`,
    feline ? FELINE_ANCHOR : "",
    `Only the pose and action change. This step "${frame.frame_title}": ${clean(frame.frame_description, bm, noun)}.`,
    clean(frame.dog_action, bm, noun) ? `The ${noun}: ${clean(frame.dog_action, bm, noun)}.` : "",
    clean(frame.handler_action, bm, noun) ? `Assisting hands — draw ONLY the hands and forearms, ignoring any body position this sentence mentions: ${clean(frame.handler_action, bm, noun)}.` : "",
    HANDS_ONLY,
    glow,
    FOCUS,
    `ONE ${noun} only, anatomically clear and clinically plausible posture.`,
    `No text, labels, arrows, captions, diagrams, or watermarks — just the drawing. No full human figure and no face anywhere in the image.`,
  ]
    .filter(Boolean)
    .join(" ");
}

// ── Lazy OpenAI client (don't crash module load when no key present) ──
let _openai = null;
function client() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}
// Test seam: lets the suite drive the pipeline without network or an API key.
function __setClient(c) { _openai = c; }

// Runtime disk cache (Railway). Persists for the life of the deploy; a redeploy
// clears it and the first opener regenerates. Pre-rendering via the CLI bakes
// images into the Vercel static layer permanently (preferred for hot exercises).
const CACHE_ROOT = process.env.STORYBOARD_CACHE_ROOT
  ? path.resolve(process.env.STORYBOARD_CACHE_ROOT)
  : path.resolve(__dirname, ".cache", "storyboard");

// The cache key includes a hash of the exact prompt. If the storyboard copy,
// the species, or the prompt template changes, the key changes and a stale
// image can no longer be served for a step it no longer depicts.
function promptHash(prompt) {
  return crypto.createHash("sha1").update(String(prompt)).digest("hex").slice(0, 10);
}

function cachePath(code, frameNumber, hash) {
  const name = hash ? `frame-${frameNumber}-${hash}.png` : `frame-${frameNumber}.png`;
  return path.join(CACHE_ROOT, code, name);
}

function readCached(code, frameNumber, hash) {
  try {
    const p = cachePath(code, frameNumber, hash);
    if (fs.existsSync(p) && fs.statSync(p).size > 1000) return fs.readFileSync(p);
  } catch { /* ignore */ }
  return null;
}

function writeCache(code, frameNumber, hash, buffer) {
  try {
    fs.mkdirSync(path.join(CACHE_ROOT, code), { recursive: true });
    fs.writeFileSync(cachePath(code, frameNumber, hash), buffer);
  } catch { /* cache write best-effort */ }
}

// Lowest frame number is the series anchor — every other frame is drawn from it.
function anchorNumber(sb) {
  return Math.min(...sb.frames.map((f) => f.frame_number));
}

function b64Of(res) {
  const b64 = res?.data?.[0]?.b64_json;
  if (!b64) throw new Error("no b64_json in image response");
  return Buffer.from(b64, "base64");
}

// Model generations differ on which size/quality values they accept. If the API
// rejects one, retry once with the model's own defaults instead of failing —
// a slightly different image beats no handout.
function isParamError(err) {
  const m = String((err && err.message) || "");
  return /invalid|unsupported|unknown/i.test(m) && /(size|quality)/i.test(m);
}

async function callImages(openai, op, params) {
  try {
    return await openai.images[op](params);
  } catch (err) {
    if (!isParamError(err)) throw err;
    const { size, quality, ...rest } = params;
    console.warn(`[storyboard] ${MODEL} rejected size/quality (${err.message}) — retrying with model defaults`);
    return await openai.images[op](rest);
  }
}

// Pure, cheap, no API call: the version token for a frame's artwork. Same
// inputs as the disk-cache key, so "the cache changed" and "the URL changed"
// stay in lockstep. The client appends this as ?v= so a browser that cached a
// wrong image under an immutable URL is forced to fetch the corrected one.
function frameVersion({ code, sb, frame, category, force, species }) {
  const breed = breedFor(category, force, species, code);
  const anchorNo = anchorNumber(sb);
  const anchorFrame = sb.frames.find((f) => f.frame_number === anchorNo);
  const anchorHash = promptHash(buildPrompt(sb, anchorFrame, breed, species, code));
  if (frame.frame_number === anchorNo) return anchorHash;
  return promptHash(`${buildRefPrompt(sb, frame, breed, species, code)}|ref:${anchorHash}`);
}

// Version token for every frame in a storyboard: { [frame_number]: hash }.
function storyboardVersions({ code, sb, category, force, species }) {
  const out = {};
  for (const frame of sb.frames) {
    out[frame.frame_number] = frameVersion({ code, sb, frame, category, force, species });
  }
  return out;
}

// De-dupe concurrent anchor renders: if six frames of one exercise are requested
// at once they must share ONE frame-1, not race six of them.
const _anchorInFlight = new Map();

async function renderAnchor({ code, sb, category, force, species }) {
  const anchorNo = anchorNumber(sb);
  const anchorFrame = sb.frames.find((f) => f.frame_number === anchorNo);
  const breed = breedFor(category, force, species, code);
  const prompt = buildPrompt(sb, anchorFrame, breed, species, code);
  validateBeforeGenerate({ code, sb, frame: anchorFrame, breed, species, prompt });
  const hash = promptHash(prompt);

  const cached = readCached(code, anchorNo, hash);
  if (cached) return { buffer: cached, hash, cached: true, mode: "generate" };

  const openai = client();
  if (!openai) throw new Error("OPENAI_API_KEY not configured");
  const res = await callImages(openai, "generate", { model: MODEL, prompt, size: SIZE, quality: QUALITY, n: 1 });
  const buffer = b64Of(res);
  writeCache(code, anchorNo, hash, buffer);
  return { buffer, hash, cached: false, mode: "generate" };
}

function anchorOnce(args) {
  const key = args.code;
  let task = _anchorInFlight.get(key);
  if (!task) {
    task = renderAnchor(args).finally(() => _anchorInFlight.delete(key));
    _anchorInFlight.set(key, task);
  }
  return task;
}

// Generate (or serve cached) one frame's PNG. Returns { buffer, cached, mode }
// or throws (StoryboardValidationError for bad input, Error for API failures).
async function getFrameImage({ code, sb, frame, category, force, species }) {
  const breed = breedFor(category, force, species, code);
  const prompt = buildPrompt(sb, frame, breed, species, code);

  // The gate runs BEFORE any spend. A wrong-species render costs money and
  // ships a clinically wrong handout; both are worse than a 502.
  validateBeforeGenerate({ code, sb, frame, breed, species, prompt });

  const anchorNo = anchorNumber(sb);

  // ── The series anchor: an ordinary generation ──
  if (frame.frame_number === anchorNo) {
    const r = await anchorOnce({ code, sb, category, force, species });
    return { buffer: r.buffer, cached: r.cached, mode: r.mode };
  }

  // ── Every later frame is an edit of the anchor ──
  const anchor = await anchorOnce({ code, sb, category, force, species });
  const refPrompt = buildRefPrompt(sb, frame, breed, species, code);
  validateBeforeGenerate({ code, sb, frame, breed, species, prompt: refPrompt });

  // Chain the anchor's hash in: if frame 1 changes, every frame after it
  // invalidates too. Otherwise frame 3 would keep referencing a dog that the
  // series no longer contains.
  const hash = promptHash(`${refPrompt}|ref:${anchor.hash}`);
  const cached = readCached(code, frame.frame_number, hash);
  if (cached) return { buffer: cached, cached: true, mode: "reference" };

  const openai = client();
  if (!openai) throw new Error("OPENAI_API_KEY not configured");

  try {
    const file = await toFile(anchor.buffer, `frame-${anchorNo}.png`, { type: "image/png" });
    const res = await callImages(openai, "edit", {
      model: MODEL, image: file, prompt: refPrompt, size: SIZE, quality: QUALITY, n: 1,
    });
    const buffer = b64Of(res);
    writeCache(code, frame.frame_number, hash, buffer);
    return { buffer, cached: false, mode: "reference" };
  } catch (err) {
    // Reference editing is an enhancement, not a dependency. If the edits
    // endpoint is unavailable, fall back to a standalone generation rather
    // than failing the handout — style may drift, content stays correct.
    console.warn(`[storyboard] reference edit failed for ${code} frame ${frame.frame_number}: ${err.message} — falling back to generate`);
    const fbHash = promptHash(prompt);
    const fbCached = readCached(code, frame.frame_number, fbHash);
    if (fbCached) return { buffer: fbCached, cached: true, mode: "generate-fallback" };
    const res = await callImages(openai, "generate", { model: MODEL, prompt, size: SIZE, quality: QUALITY, n: 1 });
    const buffer = b64Of(res);
    writeCache(code, frame.frame_number, fbHash, buffer);
    return { buffer, cached: false, mode: "generate-fallback" };
  }
}

module.exports = {
  GLOW,
  FELINE_ANCHOR,
  BREED_BY_CATEGORY,
  FELINE_BREED_BY_CATEGORY,
  isFeline,
  nounFor,
  breedFor,
  muscleRegions,
  clean,
  buildPrompt,
  buildRefPrompt,
  promptHash,
  cachePath,
  anchorNumber,
  frameVersion,
  storyboardVersions,
  getFrameImage,
  StoryboardValidationError,
  CACHE_ROOT,
  IMAGE_MODEL: MODEL,
  __setClient,
};
