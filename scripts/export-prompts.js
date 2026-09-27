#!/usr/bin/env node
/**
 * Write the storyboard prompts out for drawing BY HAND in ChatGPT.
 *
 *   node scripts/export-prompts.js --patient=33     # every exercise in their program
 *   node scripts/export-prompts.js --missing        # everything with no drawing yet
 *   node scripts/export-prompts.js --codes=PROM_STIFLE,SIT_STAND
 *
 * WHY THIS EXISTS
 *
 * Sal, 2026-09-26: "rather not add credits at all". The image API is out of
 * credits and he would rather not top it up, so the frames get drawn in
 * ChatGPT by hand. ChatGPT has no API — it is a chat window — so the
 * generator cannot drive it. This is the bridge: the exact prompts the
 * pipeline WOULD have sent, in order, written out to paste.
 *
 * THE PROMPTS ARE NOT REWRITTEN FOR HUMANS.
 *
 * They are byte-for-byte what `storyboard-image-gen` builds, from the same
 * `buildPrompt` / `buildRefPrompt`. A friendlier paraphrase here would be a
 * second source of truth for what the drawings show, and the hand-drawn
 * frames would drift from the rendered ones the first time either changed.
 *
 * FRAME 1 IS THE REFERENCE FOR THE REST, and the instructions say so on
 * every frame. That is how the series keeps the same dog — without it, six
 * frames of one exercise come back as six different animals.
 *
 * Writes nothing into the asset tree. `import-frames.js` does that, after
 * the drawings exist.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const DB_PATH = process.env.K9_DB || path.join(BACKEND, 'k9rehab.db');
const OUT_DIR = path.join(ROOT, 'output', 'prompt-packs');

const gen = require(path.join(BACKEND, 'storyboard-image-gen'));
const storyboards = require(path.join(BACKEND, 'storyboard-references'));
const media = require(path.join(BACKEND, 'v2', 'exercise-media'));

const args = process.argv.slice(2);
const getArg = (k) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split('=').slice(1).join('=') : null;
};

const PATIENT = getArg('patient');
const ONLY = (getArg('codes') || '').split(',').map((s) => s.trim()).filter(Boolean);
const MISSING_ONLY = args.includes('--missing');

const rule = (c = '-') => console.log('  ' + c.repeat(74));

/** Every exercise code prescribed to a patient, from their live handoff. */
function codesForPatient(patientId) {
  const raw = new DatabaseSync(DB_PATH);
  const row = raw.prepare(
    `SELECT handoff_payload_json FROM beau_handoffs
      WHERE patient_id = ? AND status = 'ACTIVE'
      ORDER BY handed_off_at DESC LIMIT 1`
  ).get(Number(patientId));
  if (!row) {
    // A patient with no handoff is not an error worth a stack trace — say
    // what is missing and stop.
    console.error(`\n  Patient ${patientId} has no active B.E.A.U. handoff, so there is`);
    console.error('  no prescribed exercise list to draw.\n');
    process.exit(1);
  }
  const payload = JSON.parse(row.handoff_payload_json);
  return [...new Set((payload.exercises || []).map((e) => e.exercise_code))].sort();
}

function chosenCodes() {
  if (ONLY.length) return ONLY;
  if (PATIENT) return codesForPatient(PATIENT);
  if (MISSING_ONLY) {
    const all = require(path.join(BACKEND, 'all-exercises'));
    const list = all.ALL_EXERCISES || all.allExercises || all;
    return list.map((e) => e.code).filter((c) => media.framesOnDisk(c).length === 0).sort();
  }
  console.error('\n  Nothing selected. Use --patient=<id>, --codes=A,B or --missing.\n');
  process.exit(1);
  return [];
}

/** The pack for one exercise, as markdown. */
function packFor(code) {
  const record = media.libraryRecord(code);
  const sb = storyboards.getOrGenerateStoryboard(code, record || undefined);
  if (!sb || !Array.isArray(sb.frames) || !sb.frames.length) return null;

  const species = String(code).toUpperCase().startsWith('FELINE') ? 'FELINE' : 'CANINE';
  const category = (record && record.category) || null;
  const breed = gen.breedFor(category, null, species, code);
  const anchor = gen.anchorNumber(sb);
  const existing = new Set(media.framesOnDisk(code).map((f) => f.number));

  const lines = [];
  lines.push(`# ${code} — ${sb.exercise_name || code}`);
  lines.push('');
  lines.push(`**Model:** ${breed} (${species.toLowerCase()}) · **Frames:** ${sb.frames.length}`);
  lines.push('');
  lines.push('Draw these in order. **Frame ' + anchor + ' first** — every other frame is drawn');
  lines.push('by attaching frame ' + anchor + ' as a reference image, which is what keeps the same');
  lines.push('dog across the series. Without it you get six different animals.');
  lines.push('');
  lines.push('Save each result to your Downloads folder, then file them with:');
  lines.push('');
  lines.push('```');
  lines.push(`node scripts/import-frames.js --code=${code} --apply`);
  lines.push('```');
  lines.push('');

  const ordered = [...sb.frames].sort((a, b) => a.frame_number - b.frame_number);
  // The anchor first, because everything else references it.
  ordered.sort((a, b) => (a.frame_number === anchor ? -1 : b.frame_number === anchor ? 1 : 0));

  for (const frame of ordered) {
    const n = frame.frame_number;
    const isAnchor = n === anchor;
    const prompt = isAnchor
      ? gen.buildPrompt(sb, frame, breed, species, code)
      : gen.buildRefPrompt(sb, frame, breed, species, code);

    lines.push('---');
    lines.push('');
    lines.push(`## Frame ${n}${isAnchor ? '  — DRAW THIS ONE FIRST' : ''}`
      + (existing.has(n) ? '  · a drawing already exists, redraw only if replacing it' : ''));
    lines.push('');
    lines.push(isAnchor
      ? '**Attach:** nothing.'
      : `**Attach:** your finished frame ${anchor} image, so the dog stays the same.`);
    lines.push('');
    lines.push('**Prompt — paste exactly as-is:**');
    lines.push('');
    lines.push('```text');
    lines.push(prompt);
    lines.push('```');
    lines.push('');
    lines.push(`**Save as:** \`frame-${n}\` (any of .png .webp .jpg — the importer keeps the real format)`);
    lines.push('');
  }

  return { text: lines.join('\n'), frames: sb.frames.length, breed, anchor };
}

(function main() {
  const codes = chosenCodes();
  console.log('');
  console.log('  PROMPT PACKS FOR HAND-DRAWING');
  rule('=');

  fs.mkdirSync(OUT_DIR, { recursive: true });

  let written = 0, skipped = 0, frames = 0;
  const index = ['# Prompt packs', '', 'Draw these in ChatGPT and file them with `import-frames.js`.', ''];

  for (const code of codes) {
    const pack = packFor(code);
    if (!pack) {
      console.log(`  skip  ${code.padEnd(20)} no storyboard to draw from`);
      skipped += 1;
      continue;
    }
    const file = path.join(OUT_DIR, `${code}.md`);
    fs.writeFileSync(file, pack.text);
    const have = media.framesOnDisk(code).length;
    console.log(`  ok    ${code.padEnd(20)} ${String(pack.frames).padStart(2)} frame(s)  ${pack.breed}`
      + (have ? `   (${have} already drawn)` : ''));
    index.push(`- [${code}](./${code}.md) — ${pack.frames} frames, ${pack.breed}`);
    written += 1;
    frames += pack.frames;
  }

  fs.writeFileSync(path.join(OUT_DIR, 'README.md'), index.join('\n') + '\n');

  rule('=');
  console.log(`\n  ${written} pack(s), ${frames} frame(s) to draw${skipped ? `, ${skipped} skipped` : ''}`);
  console.log(`  ${OUT_DIR}\n`);
})();
