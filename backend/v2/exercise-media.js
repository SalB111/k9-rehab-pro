/**
 * K9 Clinical Workflow V2 — exercise media for B.E.A.U. at Home
 *
 * Sal, 2026-09-26: "WHAT I WANT TO ADD TO THIS WHICH IT SHOULD HAVE IS THE
 * STORYBOOK OR ATTACH VIDEO ON HOW TO PERFORM THE PRESCRIBED EXERCISES IN
 * BEAU AT HOME. K9 REHAB PRO HAS THEM IN THE EXERCISE LIBRARY".
 *
 * An owner reading "Passive Range of Motion - Stifle, 10-15 reps" and nothing
 * else is being asked to perform a clinical movement from its name. The
 * drawings exist; they were simply never shown to the person doing the work.
 *
 * WHAT IS ACTUALLY THERE, measured 2026-09-26 — and it is much less than
 * CLAUDE.md claims:
 *
 *   - 260 exercise folders under k9-rehab-frontend/public/assets/storyboard
 *   - 39 of them hold real frame PNGs; the other 221 hold {"frames":{}}
 *   - the narrated scripts come from storyboard-references, which generates
 *     them per exercise; the PNGs are what is scarce, not the text
 *   - VIDEO_LIBRARY has 2 entries and NEITHER carries a file or a URL, so
 *     there is no video to attach to anything. Nothing here pretends
 *     otherwise — see `video` in the returned shape, always an empty list.
 *
 * WHY THE IMAGES ARE NOT BEHIND THE OWNER TOKEN
 *
 * A frame is a pencil drawing of an anonymous model dog performing a named
 * exercise. It carries no patient, no owner, no clinic and no finding — the
 * clinician app already serves the identical files unauthenticated from its
 * own public directory. WHICH exercises a given dog was prescribed is the
 * confidential part, and that stays behind the token in `/my-program`.
 *
 * WHAT THIS REFUSES TO DO
 *
 *   * It never invents a frame. An exercise with no drawing returns an empty
 *     list and the app says so. A stock photo or a similar exercise's frames
 *     would be a WRONG demonstration of a prescribed clinical movement, which
 *     is worse than no picture — CLAUDE.md, Anti-Hallucination Rules.
 *
 *   * It never lets an owner token browse the library. The code must be in
 *     that patient's own handed-off program or the answer is 404. A
 *     patient-scoped token that can enumerate all 260 exercises is not
 *     patient-scoped.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const storyboards = require('../storyboard-references');

/** Where the batch renderer writes, and where the clinician app reads from. */
const FRAME_ROOT = path.resolve(
  __dirname, '..', '..', 'k9-rehab-frontend', 'public', 'assets', 'storyboard'
);

/**
 * Which file types count as a frame.
 *
 * PNG is what the API renderer writes. The others are here because Sal is
 * drawing the missing frames by hand in ChatGPT rather than adding API
 * credits, and a browser download comes back as whatever that app chose —
 * frequently WebP. Renaming a WebP to .png would make the file lie about its
 * own format; accepting the real extension costs one regex.
 */
const FRAME_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg'];
// `\\d` and `\\.`, not `\d` and `\.`: inside a template literal a backslash
// before a non-special character is dropped, which silently produced
// /^frame-(d+).(png|webp)$/ and matched nothing. Every exercise came back
// with zero frames and the app said "no illustration" for all 260.
const FRAME_RE = new RegExp(`^frame-(\\d+)\\.(${FRAME_EXTENSIONS.join('|')})$`, 'i');

/** Public path for a frame. Served statically — see the header. */
const framePath = (code, file) => `/assets/storyboard/${code}/${file}`;

/** Only ever a bare exercise code. Nothing user-supplied reaches the disk. */
function safeCode(code) {
  const c = String(code || '').toUpperCase();
  return /^[A-Z0-9_]{1,64}$/.test(c) ? c : null;
}

/**
 * Which frame PNGs exist on disk for this exercise.
 *
 * The DISK is the authority, not the manifest. A manifest lists the hash of
 * the prompt each frame was rendered from and can name a frame whose file was
 * never written — the run that failed tonight on "no credits remaining" would
 * have left exactly that if it had written the manifest first. Reading the
 * directory cannot claim a picture that is not there.
 */
function framesOnDisk(code, root = FRAME_ROOT) {
  const dir = path.join(root, code);
  let names;
  try { names = fs.readdirSync(dir); } catch { return []; }

  // Keyed by number so a leftover frame-2.webp beside a newer frame-2.png
  // cannot produce the same step twice. PNG wins, being what the renderer
  // writes; anything else is a hand-placed file.
  const byNumber = new Map();
  for (const name of names) {
    const m = FRAME_RE.exec(name);
    if (!m) continue;
    const n = Number(m[1]);
    const isPng = m[2].toLowerCase() === 'png';
    if (!byNumber.has(n) || isPng) byNumber.set(n, name);
  }
  return [...byNumber.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([number, file]) => ({ number, file }));
}

/**
 * The library record for a code.
 *
 * Lazy, and cached by require: all-exercises prints its own count on load and
 * the server has already paid for it. Resolved HERE rather than passed in by
 * the route, so there is one answer to "what is this exercise" rather than
 * one per caller.
 */
let _byCode = null;
function libraryRecord(code) {
  if (!_byCode) {
    _byCode = new Map();
    try {
      const all = require('../all-exercises');
      const list = all.ALL_EXERCISES || all.allExercises || all;
      for (const e of (Array.isArray(list) ? list : [])) _byCode.set(e.code, e);
    } catch { /* leave the map empty; a missing library is not a crash */ }
  }
  return _byCode.get(code) || null;
}

/**
 * The drawings and the words that go with them, for one exercise.
 *
 * The library record is what the storyboard generator needs — without it
 * `getOrGenerateStoryboard` returns null for everything it has not
 * hand-authored, which is 256 of the 260. That is the mistake that made me
 * tell Sal only four exercises had storyboards.
 */
function storyboardFor(code, { root = FRAME_ROOT } = {}) {
  const clean = safeCode(code);
  if (!clean) return null;

  // `root` is a seam for tests, and it earns its place: the claim that the
  // DISK decides — not the manifest — cannot be proved against the real
  // assets, where the two agree everywhere. Mutation testing caught that:
  // swapping this to read the manifest left the suite green.
  const numbers = framesOnDisk(clean, root);

  let script = null;
  try { script = storyboards.getOrGenerateStoryboard(clean, libraryRecord(clean) || undefined); }
  catch { script = null; }

  const byNumber = new Map(
    ((script && script.frames) || []).map((f) => [f.frame_number, f])
  );

  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(root, clean, 'manifest.json'), 'utf8'));
  } catch { manifest = {}; }

  const frames = numbers.map(({ number: n, file }) => {
    const f = byNumber.get(n) || {};
    return {
      number: n,
      url: framePath(clean, file),
      title: f.frame_title || null,
      description: f.frame_description || null,
      // What the handler does. This is the instruction an owner acts on, and
      // it is the reason a picture alone is not enough.
      handler_action: f.handler_action || null,
      dog_action: f.dog_action || null,
      safety: f.safety_notes || null,
      seconds: f.duration_seconds || null,
    };
  });

  return {
    exercise_code: clean,
    // The model in the drawings, so an owner is not confused by a dog that
    // looks nothing like theirs.
    model_breed: manifest.breed || (script && script.breed_model && script.breed_model.breed) || null,
    species: manifest.species || null,
    frames,
    // Said out loud rather than left as an empty array to interpret.
    has_illustration: frames.length > 0,
    // There is no footage in this repo — 2 VIDEO_LIBRARY entries, neither
    // with a file or URL. Always empty until that changes, and never a
    // placeholder player over nothing.
    video: [],
    client_script: (script && script.client_script) || null,
  };
}

module.exports = {
  storyboardFor, framesOnDisk, framePath, FRAME_ROOT, safeCode, libraryRecord,
  FRAME_EXTENSIONS, FRAME_RE,
};
