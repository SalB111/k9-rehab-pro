/**
 * Who may approve a protocol — tests
 *
 * WHAT THIS PROTECTS
 *
 * Approval and handoff to B.E.A.U. at Home are gated on
 * `authority.resolveApprovalAuthority`, which reads the clinician_credentials
 * TABLE. The Settings tab was a single free-text "clinician identity" form
 * writing to React state: it saved nothing, described the wrong thing (one
 * person typing, rather than the practice's clinicians), and a clinician
 * entered there could never approve a protocol with nothing on screen saying
 * so. The only way to see the truth was `node v2/access.js status`.
 *
 * Two claims have to keep holding:
 *
 *   1. THE SCREEN AGREES WITH THE GATE. A roster that says someone can
 *      approve when the gate would refuse is worse than no roster — it is a
 *      confident wrong answer about who may prescribe.
 *   2. IT SAYS WHY NOT, AND WHEN A CREDENTIAL LAPSES. credentialUsable()
 *      checks valid_until, so authority disappears on a date nobody is
 *      watching unless the screen counts it down.
 *
 *   node v2/clinician-credentials-home.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const authority = require('./authority');

const ROOT = path.join(__dirname, '..', '..');
const TAB = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'settings', 'TabClinician.jsx');
const SETTINGS_STATE = path.join(ROOT, 'k9-rehab-frontend', 'src', 'pages', 'settings', 'useSettingsState.js');
const REAL_DB = path.join(__dirname, '..', 'k9rehab.db');

const live = (p) => fs.readFileSync(p, 'utf8')
  .split('\n')
  .filter((l) => {
    const t = l.trim();
    return !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
  })
  .join('\n');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve().then(fn)
    .then(() => { passed += 1; console.log(`  ✓ ${name}`); })
    .catch((err) => { failures.push({ name, err }); console.log(`  ✗ ${name}\n      ${err.message}`); });
}

function openDb() {
  const raw = new DatabaseSync(REAL_DB, { readOnly: true });
  return {
    raw,
    db: {
      get: async (sql, p = []) => raw.prepare(sql).get(...p),
      all: async (sql, p = []) => raw.prepare(sql).all(...p),
      run: async () => { throw new Error('read-only'); },
    },
  };
}

(async () => {
  console.log('\nclinician-credentials-home\n');

  // ── the tab talks to the real thing ──────────────────────────────────────

  await test('the tab reads the roster from the server', () => {
    const src = live(TAB);
    assert.ok(/\/v2\/users/.test(src), 'the tab does not load /v2/users');
    assert.ok(/\/v2\/credentials/.test(src), 'the tab cannot add a credential');
    assert.ok(/\/v2\/users\/\$\{u\.id\}\/role/.test(src), 'the tab cannot set a role');
  });

  await test('the fake client-side clinician state is gone', () => {
    const src = live(SETTINGS_STATE);
    assert.ok(
      !/const \[clinician, setClinician\] = useState/.test(src),
      'useSettingsState holds a clinician object again — it saves nothing and '
      + 'duplicates the user record'
    );
    assert.ok(
      !/^\s*clinician, setClinician,\s*$/m.test(src),
      'the hook still returns clinician/setClinician, which are no longer '
      + 'defined — a ReferenceError the build cannot see. That already took the '
      + 'dashboard down once today.'
    );
  });

  await test('it shows WHY somebody cannot approve, not just that they cannot', () => {
    const src = live(TAB);
    // THE CONDITION, not the word. Checking that "u.explanation" appears
    // anywhere passed against a mutation that replaced the guard with
    // `{false && (` — the identifier survived inside the div it no longer
    // rendered. Fifth time today a substring assertion has missed a real
    // regression; assert the expression, not its vocabulary.
    assert.ok(
      /!u\.can_approve && u\.explanation/.test(src),
      'the roster renders no explanation when somebody is refused. "Cannot '
      + 'approve" with no reason sends an administrator back to the CLI to find '
      + 'out what is missing.'
    );
  });

  await test('it counts down an expiring credential', () => {
    const src = live(TAB);
    assert.ok(/daysUntil/.test(src), 'expiry is not computed at all');
    assert.ok(
      /EXPIRED/.test(src) && /expires in/.test(src),
      'an expiring credential is shown as a bare date. credentialUsable() '
      + 'checks valid_until, so authority vanishes on a day nobody is watching '
      + 'unless the screen says how close it is.'
    );
  });

  await test('a non-admin is told to ask, not shown a wall of errors', () => {
    const src = live(TAB);
    assert.ok(
      /403/.test(src) && /administrator/i.test(src),
      'the tab does not handle being opened by a non-admin — four of its five '
      + 'routes are admin-only'
    );
  });

  // ── the screen and the gate must agree ───────────────────────────────────

  await test('every credential the tab offers as approving really is', () => {
    const src = live(TAB);
    const m = /const APPROVING = \[([^\]]*)\]/.exec(src);
    assert.ok(m, 'the tab does not declare which credentials grant authority');
    const offered = m[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean);

    const real = [...authority.APPROVING_CREDENTIALS];
    const wrong = offered.filter((c) => !real.includes(c));
    assert.deepStrictEqual(
      wrong, [],
      `the tab marks these as granting approval and the gate disagrees: ${wrong.join(', ')}`
    );
    const missing = real.filter((c) => !offered.includes(c));
    assert.deepStrictEqual(
      missing, [],
      `the gate accepts these and the tab never offers them: ${missing.join(', ')}`
    );
  });

  await test('the credentials listed as "recorded only" grant nothing', () => {
    const src = live(TAB);
    const m = /const OTHER_CREDENTIALS = \[([^\]]*)\]/.exec(src);
    if (!m) return;
    const other = m[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean);
    const lying = other.filter((c) => authority.APPROVING_CREDENTIALS.has(c));
    assert.deepStrictEqual(
      lying, [],
      `these are offered as "recorded only" but DO grant approval: ${lying.join(', ')}`
    );
  });

  await test('LIVE — the roster the screen would show matches the gate', async () => {
    // The claim the screen makes, checked against the thing that decides.
    // Driven through resolveApprovalAuthority, which is what /v2/users calls
    // and what the approve route calls.
    if (!fs.existsSync(REAL_DB)) { console.log('      (no live database — skipped)'); return; }
    const { raw, db } = openDb();
    const users = await db.all('SELECT id, username, role FROM users ORDER BY id');
    const rows = [];
    for (const u of users) {
      const check = await authority.resolveApprovalAuthority(db, { actor: u });
      rows.push({ ...u, allowed: check.allowed, basis: check.basis, reason: check.reason });
    }
    raw.close();

    assert.ok(rows.length > 0, 'no users at all');
    // Anyone allowed must carry a basis; anyone refused must carry a reason.
    // A verdict with neither cannot be explained to a clinician.
    for (const r of rows) {
      if (r.allowed) {
        assert.ok(r.basis, `${r.username} can approve but on no stated basis`);
      } else {
        assert.ok(r.reason, `${r.username} is refused with no reason given`);
        assert.ok(
          authority.explainDenial(r.reason, r),
          `${r.username} is refused with reason "${r.reason}" and no written explanation`
        );
      }
    }
    console.log(`      ${rows.filter((r) => r.allowed).length} of ${rows.length} can approve`);
  });

  await test('LIVE — an expired credential does not still grant authority', async () => {
    if (!fs.existsSync(REAL_DB)) { console.log('      (no live database — skipped)'); return; }
    const { raw, db } = openDb();
    const creds = await db.all('SELECT * FROM clinician_credentials');
    raw.close();
    const now = new Date();
    for (const c of creds) {
      if (!c.valid_until) continue;
      const expired = new Date(c.valid_until) < now;
      const usable = authority.credentialUsable(c, now).usable;
      if (expired) {
        assert.ok(
          !usable,
          `credential ${c.id} (${c.credential}) expired on ${c.valid_until} and is `
          + 'still being treated as usable'
        );
      }
    }
  });

  if (failures.length) {
    console.error(`\nFAILED ${failures.length} of ${passed + failures.length}\n`);
    process.exit(1);
  }
  console.log(`\nclinician-credentials-home: ${passed} passed\n`);
})();
