/**
 * diagnostics — tests
 *
 * The modality and panel lists are checked against the real DashboardView.jsx.
 * They cannot be imported — they live inside a component function — so the
 * risk is this module quietly not reading a modality the dashboard offers, and
 * that is what these assert.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const diagnostics = require('./diagnostics');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (err) { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); }
}

const UI_PATH = path.join(__dirname, '..', '..', 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx');
const DB_PATH = path.join(__dirname, '..', 'k9rehab.db');

/** A `const name = ["a","b"]` array out of the real dashboard source. */
function listFromUI(name) {
  const src = fs.readFileSync(UI_PATH, 'utf8');
  const m = new RegExp(`const\\s+${name}\\s*=\\s*\\[([^\\]]*)\\]`).exec(src);
  assert.ok(m, `could not find "${name}" in the dashboard source`);
  return m[1].split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
}

const D = (obj) => diagnostics.read(obj);

console.log('\ndiagnostics\n');

// ------------------------------------------------------------- the two lists

test('the modality list is populated and has no duplicates', () => {
  // Before V3 this compared the module against the lists in DashboardView.jsx,
  // because that was where they lived and the risk was the module falling
  // behind the screen. In V3 the module OWNS them and the API serves them to
  // the screen, so the screen has no list to fall behind — and parsing the JSX
  // would now find nothing.
  //
  // What still matters: a duplicate would make two studies indistinguishable,
  // and an empty list would silently offer nothing.
  const m = diagnostics.IMAGING_MODALITIES;
  assert.ok(m.length >= 6, `only ${m.length} modalities`);
  assert.strictEqual(new Set(m).size, m.length, 'a duplicated modality');
  assert.ok(m.includes('Radiograph (X-Ray)') && m.includes('MRI'));
});

test('the lab panel list is populated and has no duplicates', () => {
  const p = diagnostics.LAB_PANELS;
  assert.ok(p.length >= 4, `only ${p.length} panels`);
  assert.strictEqual(new Set(p).size, p.length, 'a duplicated panel');
  assert.ok(p.includes('CBC'));
});

test('the dashboard panel no longer declares its own diagnostics fields', () => {
  // The remaining risk after V3 is the opposite of the old one: somebody
  // adding a field straight into the panel again, which would save nowhere.
  const src = fs.readFileSync(UI_PATH, 'utf8');
  const lines = src.split(/\r?\n/);
  const start = lines.findIndex((l) => /^function DiagnosticsPanel/.test(l));
  assert.ok(start > 0, 'DiagnosticsPanel not found in the dashboard source');
  let end = start + 1;
  while (end < lines.length && !/^function /.test(lines[end])) end++;
  const body = lines.slice(start, end).join('\n');

  const hardcoded = [...body.matchAll(/<F\s+label="([^"]+)"/g)].map((m) => m[1]);
  assert.deepStrictEqual(hardcoded, [],
    `the panel declares its own fields again — they would save nowhere:\n      ${hardcoded.join('\n      ')}`);
  assert.ok(/patients\/\$\{patientId\}\/diagnostics/.test(body),
    'the panel no longer calls the diagnostics endpoint');
});

// ------------------------------------------------------------ current format

test('the current one-key-per-item shape is read', () => {
  const r = D({
    'diagnostics::Imaging Radiograph (X-Ray)': 'performed',
    'diagnostics::Lab Performed': 'true',
    'diagnostics::Lab CBC': 'true',
    'diagnostics::Lab Date': '2026-04-15',
  });
  assert.strictEqual(r.format, 'current');
  assert.deepStrictEqual(r.imaging.map((i) => i.modality), ['Radiograph (X-Ray)']);
  assert.deepStrictEqual(r.labs, ['CBC']);
  assert.strictEqual(r.notes.lab_date, '2026-04-15');
});

test('a CLEARED box is not reported as performed', () => {
  // The difference between "we did not image this" and "we imaged this" is the
  // whole content of the field. An empty string is a box somebody cleared.
  const r = D({
    'diagnostics::Imaging Radiograph (X-Ray)': 'performed',
    'diagnostics::Imaging MRI': '',
    'diagnostics::Lab CBC': 'true',
    'diagnostics::Lab Urinalysis': '',
  });
  assert.deepStrictEqual(r.imaging.map((i) => i.modality), ['Radiograph (X-Ray)']);
  assert.deepStrictEqual(r.labs, ['CBC']);
});

test('a box holding a NON-tick value is not reported as performed', () => {
  // The case an empty string never reaches: `blank()` returns early, so only a
  // present-but-negative value exercises the tick test at all. "declined" and
  // "false" are recorded answers, and neither one means the study was done.
  const r = D({
    'diagnostics::Imaging Radiograph (X-Ray)': 'performed',
    'diagnostics::Imaging MRI': 'declined',
    'diagnostics::Imaging CT Scan': 'false',
    'diagnostics::Lab CBC': 'true',
    'diagnostics::Lab Urinalysis': 'false',
    'diagnostics::Lab Thyroid Panel': 'declined',
  });
  assert.deepStrictEqual(r.imaging.map((i) => i.modality), ['Radiograph (X-Ray)'],
    'a modality recorded as declined must not read as performed');
  assert.deepStrictEqual(r.labs, ['CBC'],
    'a panel recorded as declined must not read as run');
});

test('"true" as a string is a tick, and "false" is not', () => {
  assert.strictEqual(diagnostics.ticked('true'), true);
  assert.strictEqual(diagnostics.ticked('performed'), true);
  assert.strictEqual(diagnostics.ticked('false'), false);
  assert.strictEqual(diagnostics.ticked(''), false);
  assert.strictEqual(diagnostics.ticked(null), false);
});

// ------------------------------------------------------------- legacy format

test('the legacy delimited shape is read', () => {
  const r = D({
    'diagnostics::Imaging': 'Radiograph (X-Ray)||CT Scan',
    'diagnostics::Laboratory Work': 'CBC||Chemistry Panel',
  });
  assert.strictEqual(r.format, 'legacy');
  assert.deepStrictEqual(r.imaging.map((i) => i.modality), ['Radiograph (X-Ray)', 'CT Scan']);
  assert.deepStrictEqual(r.labs, ['CBC', 'Chemistry Panel']);
});

test('findings attach to the modality they belong to', () => {
  // "Radiograph (X-Ray)" is recorded under "Radiograph Findings" — the
  // parenthetical is dropped, and a lookup on the full label finds nothing.
  const r = D({
    'diagnostics::Imaging': 'Radiograph (X-Ray)||MRI',
    'diagnostics::Radiograph Findings': 'Bilateral coxofemoral OA.',
    'diagnostics::MRI Findings': 'T13-L1 disc extrusion.',
  });
  const byModality = Object.fromEntries(r.imaging.map((i) => [i.modality, i.findings]));
  assert.strictEqual(byModality['Radiograph (X-Ray)'], 'Bilateral coxofemoral OA.');
  assert.strictEqual(byModality.MRI, 'T13-L1 disc extrusion.');
  assert.deepStrictEqual(r.unmatchedFindings, []);
});

test('a findings key is matched on the full name or the name without its bracket, and nothing looser', () => {
  assert.deepStrictEqual(
    diagnostics.findingsKeysFor('Radiograph (X-Ray)'),
    ['Radiograph (X-Ray) Findings', 'Radiograph Findings'],
    'exactly two spellings — a first-word match would also claim another study'
  );
  assert.deepStrictEqual(
    diagnostics.findingsKeysFor('Nuclear Scintigraphy'),
    ['Nuclear Scintigraphy Findings'],
    '"Nuclear Findings" is a different study and must not be a candidate'
  );

  // The full-name spelling still works where a record uses it.
  const r = D({
    'diagnostics::Imaging': 'Nuclear Scintigraphy',
    'diagnostics::Nuclear Scintigraphy Findings': 'Increased uptake, right tarsus.',
  });
  assert.strictEqual(r.imaging[0].findings, 'Increased uptake, right tarsus.');
  assert.deepStrictEqual(r.unmatchedFindings, []);
});

test('a finding with no study attached is REPORTED, not dropped', () => {
  // A radiologist's report is still a finding even if nobody ticked the box.
  const r = D({
    'diagnostics::Imaging': 'MRI',
    'diagnostics::Ultrasound Findings': 'Partial CCL tear, 40% fibre disruption.',
  });
  assert.strictEqual(r.unmatchedFindings.length, 1);
  assert.strictEqual(r.unmatchedFindings[0].field, 'Ultrasound Findings');
  assert.ok(r.unmatchedFindings[0].stated.includes('CCL tear'));
});

// -------------------------------------------------------------- both / edges

test('a part-migrated record reports BOTH rather than hiding one half', () => {
  const r = D({
    'diagnostics::Imaging MRI': 'performed',
    'diagnostics::Imaging': 'Radiograph (X-Ray)',
  });
  assert.strictEqual(r.format, 'both');
  assert.deepStrictEqual(r.imaging.map((i) => i.modality).sort(), ['MRI', 'Radiograph (X-Ray)']);
});

test('a modality recorded in both shapes is not counted twice', () => {
  const r = D({
    'diagnostics::Imaging Radiograph (X-Ray)': 'performed',
    'diagnostics::Imaging': 'Radiograph (X-Ray)',
  });
  assert.strictEqual(r.imaging.length, 1);
});

test('a lab panel in both shapes is not listed twice', () => {
  const r = D({
    'diagnostics::Lab CBC': 'true',
    'diagnostics::Laboratory Work': 'CBC||Urinalysis',
  });
  assert.deepStrictEqual(r.labs, ['CBC', 'Urinalysis']);
});

test('nothing recorded is null, not an empty shell', () => {
  assert.strictEqual(D({}), null);
  assert.strictEqual(D('{not json'), null);
  assert.strictEqual(D(undefined), null);
  assert.strictEqual(D({ 'diagnostics::Imaging MRI': '' }), null,
    'a cleared box on its own is not a diagnostics record');
});

test('a note on its own is still a record', () => {
  const r = D({ 'diagnostics::Clinical Notes': 'Lab work WNL' });
  assert.ok(r, 'a clinical note is diagnostics content');
  assert.strictEqual(r.notes.clinical, 'Lab work WNL');
});

test('empty segments in a delimited list are dropped', () => {
  const r = D({ 'diagnostics::Imaging': 'MRI||' });
  assert.strictEqual(r.imaging.length, 1);
});

// -------------------------------------------------------------- real records

test('all five real records read, and the formats are what they should be', () => {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const rows = db.prepare('SELECT name, dashboard_data FROM patients ORDER BY id').all();
  assert.ok(rows.length >= 5, `expected the real patient set, got ${rows.length}`);

  let read = 0;
  for (const row of rows) {
    const r = diagnostics.read(row.dashboard_data);
    if (!r) continue;
    read += 1;
    assert.ok(['current', 'legacy', 'both'].includes(r.format), `${row.name}: ${r.format}`);
    assert.deepStrictEqual(r.unmatchedFindings, [],
      `${row.name}: findings with no study — ${r.unmatchedFindings.map((u) => u.field).join(', ')}`);
  }
  assert.ok(read >= 5, `expected diagnostics on every patient, read ${read}`);
});

test("the only clinician-entered record is in the CURRENT shape", () => {
  // Every legacy-shaped value in this database is verbatim from
  // seed-demo-patients.js. If a record entered through the dashboard ever
  // comes back as legacy, the dashboard has started writing the old keys again.
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const row = db.prepare('SELECT dashboard_data FROM patients WHERE name = ?').get('Louie');
  assert.ok(row, 'Louie is the only non-seeded record and the test needs him');
  assert.strictEqual(diagnostics.read(row.dashboard_data).format, 'current');
});

console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
if (failures.length) { console.log('FAILED'); process.exit(1); }
