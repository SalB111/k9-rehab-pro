// ============================================================================
// Storyboard pencil-sketch image generation — SHARED source of truth.
// Used by:
//   • generate-storyboard-images.js  (CLI batch pre-render → Vercel static)
//   • server.js  GET /api/storyboards/:code/frame/:n.png  (lazy on-demand)
//
// Style: elegant graphite pencil sketch, one curated breed per category,
// soft GREEN "active muscle" glow (green = working, not red = pain).
// ============================================================================
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const MODEL = "gpt-image-1";
const SIZE = "1024x1024";
const QUALITY = "medium";

// Soft green "active muscle" glow (green = go/working, never red = pain/stop).
const GLOW =
  'a soft, light luminous emerald-green glow (subtle, low opacity, a calm "this muscle is actively working" indicator)';

// Curated breed per exercise category — chosen to draw beautifully in pencil
// (clean, well-defined builds) while keeping clinical relevance + variety.
// Keys MUST match the exercise category strings exactly.
const BREED_BY_CATEGORY = {
  "Canine Strength (Zink)": "Belgian Malinois",
  "Sport Conditioning": "Border Collie",
  "Balance & Proprioception": "Weimaraner",
  "Post-Surgical": "Labrador Retriever",
  "Neurological Rehab": "Dachshund",
  "Hydrotherapy": "Golden Retriever",
  "Geriatric Care": "German Shepherd",
  "Complementary Therapy": "Vizsla",
  "Strengthening": "Rottweiler",
  "Therapeutic Modalities": "Boxer",
  "Pediatric Rehabilitation": "Great Dane",
  "Active Assisted": "Doberman Pinscher",
  "Passive Therapy": "French Bulldog",
  "Palliative Care": "Greyhound",
  "Breed-Specific": "Staffordshire Bull Terrier",
  "Manual Therapy": "Greyhound",
  "Functional Training": "American Pit Bull Terrier",
  "Aquatic Therapy": "Labrador Retriever",
};

function breedFor(category, force) {
  return force || BREED_BY_CATEGORY[category] || "Labrador Retriever";
}

function muscleRegions(frame) {
  return (frame.svg_indicators || [])
    .filter((i) => i.type === "muscle_highlight")
    .map((i) => i.region)
    .filter(Boolean);
}

// Strip the storyboard's baked-in breed/build (e.g. "Pembroke Welsh Corgi (28 lbs, ...)")
// so it doesn't fight the chosen drawing breed and produce two dogs.
function clean(text, modelBreed) {
  if (!text) return "";
  let t = String(text).replace(/\([^)]*\)/g, " "); // drop parentheticals (weights/builds)
  if (modelBreed) t = t.split(modelBreed).join("the dog"); // replace the model breed name
  return t.replace(/\s+/g, " ").trim();
}

function buildPrompt(sb, frame, breed) {
  const bm = sb.breed_model?.breed;
  const mus = muscleRegions(frame);
  const glow = mus.length
    ? `Gently highlight the ${mus.join(" and ")} muscle group(s) with ${GLOW}, indicating the muscles actively being worked in this step, softly blended into the drawing; the rest of the dog stays a clean graphite pencil sketch.`
    : "";
  return [
    `Elegant hand-drawn graphite pencil sketch illustration for a veterinary rehabilitation client handout.`,
    `A single ${breed} dog (well-proportioned, anatomically accurate, natural coat) performing the exercise "${sb.exercise_name}".`,
    `This step "${frame.frame_title}": ${clean(frame.frame_description, bm)}.`,
    clean(frame.dog_action, bm) ? `The dog: ${clean(frame.dog_action, bm)}.` : "",
    clean(frame.handler_action, bm) ? `A person gently assisting: ${clean(frame.handler_action, bm)}.` : "",
    glow,
    `Style: refined confident pencil line work with soft shading, plain white background, ONE dog only, anatomically clear and clinically plausible posture, warm and friendly, easy to understand at a glance, professional medical-illustration quality.`,
    `No text, labels, arrows, captions, diagrams, or watermarks — just the drawing.`,
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

// Runtime disk cache (Railway). Persists for the life of the deploy; a redeploy
// clears it and the first opener regenerates. Pre-rendering via the CLI bakes
// images into the Vercel static layer permanently (preferred for hot exercises).
const CACHE_ROOT = path.resolve(__dirname, ".cache", "storyboard");

function cachePath(code, frameNumber) {
  return path.join(CACHE_ROOT, code, `frame-${frameNumber}.png`);
}

function readCached(code, frameNumber) {
  try {
    const p = cachePath(code, frameNumber);
    if (fs.existsSync(p) && fs.statSync(p).size > 1000) return fs.readFileSync(p);
  } catch { /* ignore */ }
  return null;
}

// Generate (or serve cached) one frame's PNG. Returns { buffer, cached } or
// throws if generation isn't possible (no key / no data / API error).
async function getFrameImage({ code, sb, frame, category, force }) {
  const cached = readCached(code, frame.frame_number);
  if (cached) return { buffer: cached, cached: true };

  const openai = client();
  if (!openai) throw new Error("OPENAI_API_KEY not configured");

  const breed = breedFor(category, force);
  const prompt = buildPrompt(sb, frame, breed);
  const res = await openai.images.generate({ model: MODEL, prompt, size: SIZE, quality: QUALITY, n: 1 });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("no b64_json in image response");
  const buffer = Buffer.from(b64, "base64");

  try {
    fs.mkdirSync(path.join(CACHE_ROOT, code), { recursive: true });
    fs.writeFileSync(cachePath(code, frame.frame_number), buffer);
  } catch { /* cache write best-effort */ }

  return { buffer, cached: false };
}

module.exports = {
  GLOW,
  BREED_BY_CATEGORY,
  breedFor,
  muscleRegions,
  clean,
  buildPrompt,
  getFrameImage,
  CACHE_ROOT,
  IMAGE_MODEL: MODEL,
};
