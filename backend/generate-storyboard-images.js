// ============================================================================
// Storyboard image generator — photorealistic per-frame images from the
// evidence-based (Millis & Levine) step data, saved as STATIC assets the
// frontend serves from /assets/storyboard/<code>/frame-<n>.png.
//
// Usage (from backend/):
//   OPENAI_API_KEY must be valid in the environment (.env).
//   node generate-storyboard-images.js                 # rich storyboards only (>= MIN_FRAMES)
//   node generate-storyboard-images.js --min-frames=1  # include thin auto-gen stubs
//   node generate-storyboard-images.js --codes=SIT_STAND,PROM_STIFLE
//   node generate-storyboard-images.js --all           # every exercise with a storyboard
// Re-runnable: skips frames whose PNG already exists.
// ============================================================================
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const { ALL_EXERCISES } = require("./all-exercises");
const sbRef = require("./storyboard-references");

const args = process.argv.slice(2);
const getArg = (k, d) => { const a = args.find(x => x.startsWith(`--${k}=`)); return a ? a.split("=")[1] : d; };
const MIN_FRAMES = parseInt(getArg("min-frames", args.includes("--all") ? "1" : "2"), 10);
const ONLY_CODES = (getArg("codes", "") || "").split(",").map(s => s.trim()).filter(Boolean);
const MODEL = getArg("model", "gpt-image-1");
const SIZE = getArg("size", "1024x1024");
const QUALITY = getArg("quality", "medium");
// Soft green "active muscle" glow (green = go/working, not red = pain/stop).
const GLOW = getArg("glow", 'a soft, light luminous emerald-green glow (subtle, low opacity, a calm "this muscle is actively working" indicator)');

// Curated breed per exercise category — chosen to draw beautifully in pencil
// (short-coat, well-defined builds) while keeping clinical relevance + variety.
// Override everything with --breed=... if needed.
const FORCE_BREED = getArg("breed", "");
const BREED_BY_CATEGORY = {
  "Canine Strength (Zink)": "Belgian Malinois",
  "Sport Conditioning": "Border Collie",
  "Balance & Proprioception": "Weimaraner",
  "Post-Surgical": "Labrador Retriever",
  "Neurological Rehabilitation": "Dachshund",
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
function breedFor(category) {
  return FORCE_BREED || BREED_BY_CATEGORY[category] || "Labrador Retriever";
}
function muscleRegions(frame) {
  return (frame.svg_indicators || []).filter(i => i.type === "muscle_highlight").map(i => i.region).filter(Boolean);
}

const OUT_ROOT = path.resolve(__dirname, "../k9-rehab-frontend/public/assets/storyboard");

if (!process.env.OPENAI_API_KEY) {
  console.error("FATAL: OPENAI_API_KEY is not set. Put a valid key in backend/.env and re-run.");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Strip the storyboard's baked-in breed/build (e.g. "Pembroke Welsh Corgi (28 lbs, ...)")
// so it doesn't fight the chosen athletic breed and produce two dogs.
function clean(text, modelBreed) {
  if (!text) return "";
  let t = String(text).replace(/\([^)]*\)/g, " ");          // drop parentheticals (weights/builds)
  if (modelBreed) t = t.split(modelBreed).join("the dog");   // replace the model breed name
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
  ].filter(Boolean).join(" ");
}

function pickExercises() {
  const seen = new Set();
  const list = [];
  for (const e of ALL_EXERCISES) {
    if (seen.has(e.code)) continue;
    if (ONLY_CODES.length && !ONLY_CODES.includes(e.code)) continue;
    const sb = sbRef.getOrGenerateStoryboard ? sbRef.getOrGenerateStoryboard(e.code, e) : sbRef.STORYBOARD_LIBRARY[e.code];
    if (!sb || !Array.isArray(sb.frames) || sb.frames.length < MIN_FRAMES) continue;
    seen.add(e.code);
    list.push({ code: e.code, sb, category: e.category });
  }
  return list;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const targets = pickExercises();
  const totalFrames = targets.reduce((n, t) => n + t.sb.frames.length, 0);
  console.log(`Model: ${MODEL} ${SIZE} ${QUALITY} | exercises: ${targets.length} | frames: ${totalFrames}`);
  let made = 0, skipped = 0, failed = 0, n = 0;

  for (const { code, sb, category } of targets) {
    const breed = breedFor(category);
    const dir = path.join(OUT_ROOT, code);
    fs.mkdirSync(dir, { recursive: true });
    for (const frame of sb.frames) {
      n++;
      const out = path.join(dir, `frame-${frame.frame_number}.png`);
      if (fs.existsSync(out) && fs.statSync(out).size > 1000) { skipped++; continue; }
      const prompt = buildPrompt(sb, frame, breed);
      try {
        const res = await openai.images.generate({ model: MODEL, prompt, size: SIZE, quality: QUALITY, n: 1 });
        const b64 = res.data?.[0]?.b64_json;
        if (!b64) throw new Error("no b64_json in response");
        fs.writeFileSync(out, Buffer.from(b64, "base64"));
        made++;
        console.log(`  [${n}/${totalFrames}] ✓ ${code} (${breed}) frame ${frame.frame_number}`);
      } catch (err) {
        failed++;
        console.warn(`  [${n}/${totalFrames}] ✗ ${code} frame ${frame.frame_number}: ${err.message}`);
        if (/rate|429/i.test(err.message)) await sleep(8000);
      }
      await sleep(1200); // gentle pacing
    }
  }
  console.log(`\nDone. made=${made} skipped=${skipped} failed=${failed}. Output: ${OUT_ROOT}`);
})();
