#!/usr/bin/env node
/**
 * File hand-drawn storyboard frames into the asset tree.
 *
 *   node scripts/import-frames.js --code=STRETCH_ILIO              # dry run
 *   node scripts/import-frames.js --code=STRETCH_ILIO --apply
 *   node scripts/import-frames.js --code=PROM_HIP --frames=6 --apply
 *   node scripts/import-frames.js --code=X --from="C:/somewhere" --apply
 *
 * WHY THIS EXISTS
 *
 * Sal, 2026-09-26: "rather not add credits at all". The frames get drawn by
 * hand in ChatGPT from the packs `export-prompts.js` writes. This is the
 * other half — taking what lands in Downloads and putting it where the app
 * reads from, named correctly, with the manifest updated so a future API run
 * does not re-render work that was done by hand.
 *
 * HOW FILES ARE MATCHED TO FRAMES, in order of preference
 *
 *   1. The file is already called `frame-3.png` — then it is frame 3.
 *      Unambiguous, and worth doing if you can be bothered to rename.
 *   2. `--frames=2,5,6` names the frame numbers, and the files are taken in
 *      MODIFIED-TIME order to match. Drawn in order, filed in order.
 *   3. Nothing given: the missing frames are filled in ascending order from
 *      the oldest unmatched file.
 *
 * IT SHOWS YOU THE MAPPING AND WRITES NOTHING UNTIL YOU SAY SO. Guessing
 * which download is which frame is exactly the kind of thing that silently
 * puts step 5 where step 2 belongs, and a clinical instruction out of order
 * is worse than a missing one.
 *
 * It never overwrites an existing frame without --force.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');

const gen = require(path.join(BACKEND, 'storyboard-image-gen'));
const storyboards = require(path.join(BACKEND, 'storyboard-references'));
const media = require(path.join(BACKEND, 'v2', 'exercise-media'));

const args = process.argv.slice(2);
const getArg = (k) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split('=').slice(1).join('=') : null;
};

const CODE = media.safeCode(getArg('code'));
const FROM = getArg('from') || path.join(os.homedir(), 'Downloads');
const FRAMES = (getArg('frames') || '').split(',').map((s) => Number(s.trim())).filter(Boolean);
const APPLY = args.includes('--apply');
const FORCE = args.includes('--force');

const IMAGE_RE = /\.(png|webp|jpe?g)$/i;
const rule = (c = '-') => console.log('  ' + c.repeat(74));

if (!CODE) {
  console.error('\n  --code=<EXERCISE_CODE> is required.\n');
  process.exit(1);
}

(function main() {
  console.log('');
  console.log(`  IMPORT FRAMES — ${CODE}${APPLY ? '   [APPLY]' : '   [dry run]'}`);
  console.log(`  from ${FROM}`);
  rule('=');

  const record = media.libraryRecord(CODE);
  const sb = storyboards.getOrGenerateStoryboard(CODE, record || undefined);
  if (!sb || !Array.isArray(sb.frames) || !sb.frames.length) {
    console.error(`\n  ${CODE} has no storyboard, so there is nothing to file frames against.\n`);
    process.exit(1);
  }

  const wanted = sb.frames.map((f) => f.frame_number).sort((a, b) => a - b);
  const present = new Set(media.framesOnDisk(CODE).map((f) => f.number));
  const missing = wanted.filter((n) => !present.has(n));

  console.log(`  storyboard has ${wanted.length} frame(s); ${present.size} already drawn`);
  if (!missing.length && !FORCE) {
    console.log('\n  Nothing missing. Use --force with --frames=N to replace a frame.\n');
    return;
  }

  let files;
  try {
    files = fs.readdirSync(FROM)
      .filter((f) => IMAGE_RE.test(f))
      .map((f) => ({ name: f, full: path.join(FROM, f), mtime: fs.statSync(path.join(FROM, f)).mtimeMs }))
      .sort((a, b) => a.mtime - b.mtime);
  } catch (e) {
    console.error(`\n  Could not read ${FROM}: ${e.message}\n`);
    process.exit(1);
  }

  if (!files.length) {
    console.error(`\n  No image files in ${FROM}.\n`);
    process.exit(1);
  }

  // ── match ───────────────────────────────────────────────────────────────
  const plan = [];
  const used = new Set();

  // 1. explicitly named frame-N.*
  for (const f of files) {
    const m = /^frame-(\d+)\.(png|webp|jpe?g)$/i.exec(f.name);
    if (!m) continue;
    plan.push({ n: Number(m[1]), file: f, how: 'named' });
    used.add(f.name);
  }

  const rest = files.filter((f) => !used.has(f.name));
  const targets = (FRAMES.length ? FRAMES : missing).filter((n) => !plan.some((p) => p.n === n));

  // 2/3. oldest-first against the frame numbers still to fill
  for (let i = 0; i < targets.length && i < rest.length; i++) {
    plan.push({ n: targets[i], file: rest[i], how: FRAMES.length ? 'by --frames order' : 'by time order' });
  }

  plan.sort((a, b) => a.n - b.n);

  if (!plan.length) {
    console.error('\n  Nothing to file. Name the files frame-N.png, or pass --frames=.\n');
    process.exit(1);
  }

  // ── show it ─────────────────────────────────────────────────────────────
  const dir = path.join(media.FRAME_ROOT, CODE);
  console.log('');
  let blocked = 0;
  for (const p of plan) {
    const ext = path.extname(p.file.name).toLowerCase().replace('.jpeg', '.jpg');
    const dest = `frame-${p.n}${ext}`;
    const exists = present.has(p.n);
    const stop = exists && !FORCE;
    if (stop) blocked += 1;
    console.log(
      `  ${stop ? 'SKIP ' : 'file '} frame ${String(p.n).padStart(2)}  <-  ${p.file.name}`
      + `  (${p.how})${stop ? '   already drawn; --force to replace' : ''}`
    );
    p.dest = dest;
    p.stop = stop;
  }

  const doable = plan.filter((p) => !p.stop);
  rule();

  if (!APPLY) {
    console.log(`\n  ${doable.length} frame(s) would be filed${blocked ? `, ${blocked} skipped` : ''}.`);
    console.log('  Dry run — nothing written. Check the mapping above, then re-run with --apply.\n');
    return;
  }
  if (!doable.length) {
    console.log('\n  Nothing to write.\n');
    return;
  }

  // ── write ───────────────────────────────────────────────────────────────
  fs.mkdirSync(dir, { recursive: true });

  const manifestPath = path.join(dir, 'manifest.json');
  let manifest = { frames: {} };
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { /* new */ }
  manifest.frames = manifest.frames || {};

  const species = String(CODE).startsWith('FELINE') ? 'FELINE' : 'CANINE';
  manifest.species = manifest.species || species;
  manifest.breed = manifest.breed
    || gen.breedFor((record && record.category) || null, null, species, CODE);

  // Which frames were drawn by hand rather than rendered. Recorded because a
  // record that cannot say where a clinical illustration came from is a
  // record that cannot be audited — and because these cost an hour each and
  // should not be silently re-rendered later.
  manifest.hand_drawn = Array.isArray(manifest.hand_drawn) ? manifest.hand_drawn : [];

  const anchor = gen.anchorNumber(sb);
  for (const p of doable) {
    fs.copyFileSync(p.file.full, path.join(dir, p.dest));

    // Any other extension for the same frame would now be a duplicate the
    // reader has to choose between. Remove it.
    for (const ext of ['.png', '.webp', '.jpg']) {
      const other = path.join(dir, `frame-${p.n}${ext}`);
      if (ext !== path.extname(p.dest) && fs.existsSync(other)) fs.unlinkSync(other);
    }

    // The same hash the API renderer would record. The image WAS drawn from
    // this prompt — by hand rather than by the API — so recording it is
    // accurate, and it stops a later run re-rendering over the top.
    const frame = sb.frames.find((f) => f.frame_number === p.n);
    if (frame) {
      const prompt = p.n === anchor
        ? gen.buildPrompt(sb, frame, manifest.breed, manifest.species, CODE)
        : gen.buildRefPrompt(sb, frame, manifest.breed, manifest.species, CODE);
      manifest.frames[p.n] = gen.promptHash(prompt);
    }
    if (!manifest.hand_drawn.includes(p.n)) manifest.hand_drawn.push(p.n);

    console.log(`  wrote  ${p.dest}`);
  }

  manifest.hand_drawn.sort((a, b) => a - b);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const now = media.framesOnDisk(CODE).map((f) => f.number);
  rule();
  console.log(`\n  ${CODE} now has ${now.length} of ${wanted.length} frame(s): ${now.join(', ')}`);
  const stillMissing = wanted.filter((n) => !now.includes(n));
  if (stillMissing.length) console.log(`  still to draw: ${stillMissing.join(', ')}`);
  console.log('');
})();
