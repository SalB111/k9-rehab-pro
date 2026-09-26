#!/usr/bin/env node
/**
 * V3 block state — the three columns that decide whether a block is MERGED.
 *
 *   node scripts/block-state.js
 *
 * READ ONLY. It writes nothing.
 *
 * The template in commit `9e8f407` says: give the block one real home, point
 * BOTH SCREENS at it, fold the old copies in. A block is merged only when all
 * three hold, and for months the table in CLAUDE.md checked only the first:
 *
 *   1. it has its own table
 *   2. nothing reads the blob for its fields — the engine least of all
 *   3. the PANEL writes the store, not `dashboard_data`
 *
 * Column 3 is the one that kept being skipped, and it is the one that decides
 * whether a clinician's edit reaches the protocol. On 2026-09-25 this script
 * showed that `client` had been called MERGED while its panel still wrote
 * every demographic into the blob, and that `treatment` had the engine on the
 * store and the panel on the blob — the one state where the screen and the
 * engine disagree by construction.
 *
 * This exists as a script rather than a command in CLAUDE.md because the
 * one-liner version needed enough backslash escaping that the shell mangled
 * it, and a document telling you to run a broken command is worse than a
 * document saying nothing.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const DB_PATH = process.env.K9_DB || path.join(BACKEND, 'k9rehab.db');
const DASHBOARD = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'DashboardView.jsx');

const bridge = require(path.join(BACKEND, 'v2', 'dashboard-bridge'));
const db = new DatabaseSync(DB_PATH, { readOnly: true });

/** block -> the tables that own it. Empty means not migrated. */
const TABLES = {
  equipment: ['clinic_capabilities'],
  metrics: ['visit_measurements'],
  client: ['patient_client_details'],
  home: ['patient_home_environment'],
  goals: ['patient_goals', 'patient_goal_items'],
  diagnostics: ['patient_diagnostic_studies'],
  treatment: ['patient_procedures', 'patient_treatment_status'],
  assessment: [],
  conditioning: [],
  global: [],
  helsinki: [],
};

// ── panels ────────────────────────────────────────────────────────────────
const jsx = fs.readFileSync(DASHBOARD, 'utf8');
const panels = [];
const panelRe = /^function ([A-Za-z]+)Panel\(\)/gm;
let m;
while ((m = panelRe.exec(jsx)) !== null) panels.push({ block: m[1].toLowerCase(), start: m.index });
if (panels.length < 5) {
  console.error('\n  Only ' + panels.length + ' panels found in DashboardView.jsx — the reader is broken, not the code.\n');
  process.exit(1);
}
for (let i = 0; i < panels.length; i++) {
  panels[i].end = i + 1 < panels.length ? panels[i + 1].start : jsx.length;
  panels[i].body = jsx.slice(panels[i].start, panels[i].end);
}

function panelWrites(block) {
  const p = panels.find((q) => q.block === block);
  if (!p) return null;
  const labels = [...p.body.matchAll(/<F\s[^>]*?label="([^"]+)"/g)].map((x) => x[1]);
  const updates = [...p.body.matchAll(new RegExp('update\\("' + block + '::([^"]+)"', 'g'))]
    .map((x) => x[1]);
  const readsV3 = new RegExp('/' + block + '`|/' + block + "'|\\}/" + block).test(p.body);
  return { labels, updates: [...new Set(updates)], readsV3 };
}

/**
 * THE FOURTH TEST, added 2026-09-26.
 *
 * MERGED was three tests — own table, engine off the blob, panel off the
 * blob — and none asked whether some OTHER SCREEN still reads the block's
 * blob keys. The Protocol Summary did, for goals and treatment, and both
 * blocks passed all three tests while that page showed Haley nothing at all
 * and showed Winston a weight-bearing status his own record had superseded
 * eight hours earlier.
 *
 * A panel reading its OWN block's keys is the third test's business. This
 * counts everybody else.
 */
function foreignReads(block) {
  const re = new RegExp('"' + block + '::([^"]+)"', 'g');
  const out = [];
  for (const p of panels) {
    if (p.block === block) continue;
    const body = p.body.split('\n')
      .filter((l) => { const t = l.trim(); return !t.startsWith('//') && !t.startsWith('*'); })
      .join('\n');
    for (const hit of body.matchAll(re)) {
      // A WRITE belongs to the owning panel and is already counted by
      // panelWrites. Only a READ by somebody else belongs here.
      if (body.includes('update("' + block + '::' + hit[1] + '"')) continue;
      out.push({ panel: p.block + 'Panel', key: block + '::' + hit[1] });
    }
  }
  return out;
}

// ── engine inputs still sourced from each block's blob keys ───────────────
const engineFrom = {};
for (const e of bridge.MAP) {
  for (const k of e.keys) {
    const b = k.split('::')[0];
    (engineFrom[b] = engineFrom[b] || new Set()).add(e.to + (e.gate ? ' [GATE]' : ''));
  }
}

console.log('');
console.log('  V3 BLOCK STATE   (read only)');
console.log('  ' + '='.repeat(86));
console.log('  block          own table(s)                    engine   panel writes blob               other screens');
console.log('  ' + '-'.repeat(86));

const notMerged = [];
for (const block of Object.keys(TABLES)) {
  const rows = TABLES[block].map((tbl) => {
    try { return tbl + '=' + db.prepare(`SELECT COUNT(*) c FROM ${tbl}`).get().c; }
    catch { return tbl + '=MISSING'; }
  });
  const w = panelWrites(block);
  const engine = engineFrom[block] ? engineFrom[block].size : 0;
  const writes = w ? (w.labels.length + w.updates.length) : 0;
  const foreign = foreignReads(block);

  console.log('  ' + block.padEnd(15)
    + (rows.length ? rows.join(' ') : '—').padEnd(32)
    + String(engine).padEnd(9)
    + (w ? `${w.labels.length} <F> + ${w.updates.length} update()${w.readsV3 ? ' (reads V3)' : ''}` : 'no panel').padEnd(32)
    + (TABLES[block].length
      ? (foreign.length ? String(foreign.length) + ' !' : '0')
      : '—'));

  if (TABLES[block].length && (engine > 0 || writes > 0 || foreign.length > 0)) {
    notMerged.push({ block, engine, writes, w, foreign });
  }
}

console.log('');
console.log('  ENGINE INPUTS STILL READ FROM THE BLOB');
console.log('  ' + '-'.repeat(86));
for (const b of Object.keys(engineFrom).sort()) {
  console.log('  ' + b.padEnd(15) + [...engineFrom[b]].sort().join(', '));
}

if (notMerged.length) {
  console.log('');
  console.log('  BLOCKS WITH A TABLE THAT ARE NOT FULLY MERGED');
  console.log('  ' + '-'.repeat(86));
  for (const n of notMerged) {
    console.log('  ' + n.block);
    if (n.engine) console.log('      engine still reads ' + n.engine + ' input(s) from its blob keys');
    if (n.writes) {
      console.log('      panel still writes ' + n.writes + ' field(s) to the blob:');
      for (const l of [...n.w.labels, ...n.w.updates]) console.log('          ' + l);
      console.log('      Some of these may be fields the store never claimed rather than');
      console.log('      un-rewired copies. Check each against the store\'s column list.');
    }
    if (n.foreign && n.foreign.length) {
      console.log('      ' + n.foreign.length + ' blob key(s) read by ANOTHER screen:');
      for (const f of n.foreign) console.log('          ' + f.panel + '  <-  ' + f.key);
      console.log('      The store owns these. Whatever that screen shows is whatever was');
      console.log('      left in the blob, which stops being true the moment anyone edits');
      console.log('      the block. This is how the Protocol Summary came to show Winston a');
      console.log('      weight-bearing status his own record had already superseded.');
    }
  }
}
console.log('');
