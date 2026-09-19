#!/usr/bin/env node
/**
 * K9 Clinical Workflow V2 — access administration
 *
 * The owner of a system must never be locked out of it. Approval authority is
 * deliberately restricted, which means there has to be a way to grant, inspect
 * and repair that authority without hand-writing SQL.
 *
 *   node v2/access.js status
 *   node v2/access.js whoami sal
 *   node v2/access.js grant sal admin
 *   node v2/access.js credential sal CCRP --license 12345 --until 2030-01-01
 *   node v2/access.js revoke-credential 3
 *   node v2/access.js capabilities --all
 *   node v2/access.js capabilities --set modality_laser=true,aquatic_access=false
 *
 * Run from the backend directory. Uses whichever provider DB_PROVIDER selects,
 * so it operates on the same database the server does.
 *
 * NOTE ON CREDENTIALS
 * A credential recorded here is an assertion that someone checked a certificate.
 * This tool cannot verify one. In a hospital deployment that verification is a
 * human step with a real document, and the record exists so an audit can ask who
 * performed it.
 */

'use strict';

require('dotenv').config({ override: true });

const path = require('path');
const db = require(path.join(__dirname, '..', 'db-provider'));
const authority = require('./authority');
const clinicStore = require('./clinic-store');
const schema = require('./schema');

const ROLES = {
  admin: 'Full system access. Can approve (recorded as ADMINISTRATIVE, distinct from a clinical signature), manage credentials and clinic equipment.',
  veterinarian: 'Approves by LICENSURE.',
  vet: 'Alias of veterinarian.',
  rehab_practitioner: 'Approves ONLY while holding a current CCRP/CCRT.',
  technician: 'Records assessments and measurements. Cannot approve.',
  user: 'No clinical authority.',
  owner: 'Pet owner. No clinical authority.',
};

function parseFlags(args) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) { flags[key] = next; i++; }
      else flags[key] = true;
    } else positional.push(args[i]);
  }
  return { flags, positional };
}

async function findUser(username) {
  const row = await db.get(`SELECT id, username, role FROM users WHERE username = ?`, [username]);
  if (!row) throw new Error(`No user '${username}'. Run: node v2/access.js status`);
  return row;
}

// ---------------------------------------------------------------------------

async function cmdStatus() {
  const users = await db.all(`SELECT id, username, role FROM users ORDER BY id`);
  const creds = await db.all(`SELECT * FROM clinician_credentials ORDER BY user_id, id`);

  console.log('\nUSERS');
  console.log('─'.repeat(72));
  for (const u of users) {
    const check = await authority.resolveApprovalAuthority(db, { actor: u });
    const mine = creds.filter((c) => c.user_id === u.id);
    const mark = check.allowed ? 'CAN APPROVE' : 'cannot approve';
    console.log(
      `  ${String(u.id).padEnd(4)}${u.username.padEnd(24)}${(u.role || '—').padEnd(20)}${mark}` +
      (check.allowed ? ` (${check.basis.toLowerCase()})` : ` (${check.reason})`)
    );
    for (const c of mine) {
      console.log(
        `        credential: ${c.credential}` +
        (c.license_number ? ` #${c.license_number}` : '') +
        ` · ${c.status}` +
        (c.valid_until ? ` · expires ${String(c.valid_until).slice(0, 10)}` : ' · no expiry')
      );
    }
  }

  const clinic = await db.get(`SELECT id FROM clinics ORDER BY id LIMIT 1`);
  const clinicId = clinic ? clinic.id : 1;
  const caps = await clinicStore.getCapabilities(db, clinicId);

  console.log('\nCLINIC EQUIPMENT (clinic ' + clinicId + ')');
  console.log('─'.repeat(72));
  for (const key of clinicStore.CAPABILITY_KEYS) {
    const v = caps.capabilities[key];
    const label = v === true ? 'available' : v === false ? 'not available' : 'NOT STATED — therapy withheld';
    console.log(`  ${key.padEnd(26)}${label}`);
  }
  if (caps.unstated.length) {
    console.log(
      `\n  ${caps.unstated.length} unstated. Exercises needing these are withheld from every ` +
      `recommendation.\n  Fix: node v2/access.js capabilities --all`
    );
  }
  console.log('');
}

async function cmdWhoami(username) {
  const user = await findUser(username);
  const check = await authority.resolveApprovalAuthority(db, { actor: user });
  console.log(`\n  ${user.username} (id ${user.id}) · role: ${user.role}`);
  if (check.allowed) {
    console.log(`  CAN approve — basis: ${check.basis}` +
      (check.credential ? ` (${check.credential.credential})` : ''));
  } else {
    console.log(`  CANNOT approve — ${check.reason}`);
    console.log(`  ${authority.explainDenial(check.reason, user)}`);
  }
  console.log('');
}

async function cmdGrant(username, role) {
  if (!role || !ROLES[role]) {
    console.log('\nUnknown role. Available:\n');
    for (const [r, desc] of Object.entries(ROLES)) console.log(`  ${r.padEnd(20)}${desc}`);
    console.log('');
    process.exitCode = 1;
    return;
  }
  const user = await findUser(username);
  await db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, user.id]);
  console.log(`\n  ${user.username}: ${user.role} -> ${role}`);
  await cmdWhoami(username);
}

async function cmdCredential(username, credential, flags) {
  const user = await findUser(username);
  const code = String(credential || '').toUpperCase();
  if (!authority.APPROVING_CREDENTIALS.has(code)) {
    console.log(`\n  '${code}' does not confer approval authority.`);
    console.log(`  Recognised: ${[...authority.APPROVING_CREDENTIALS].join(', ')}\n`);
    process.exitCode = 1;
    return;
  }

  const row = await authority.addCredential(db, {
    userId: user.id,
    credential: code,
    licenseNumber: flags.license || null,
    issuingBody: flags.body || null,
    validFrom: flags.from || null,
    validUntil: flags.until || null,
    verifiedBy: user.id,
  });

  console.log(`\n  Recorded ${code} for ${user.username} (credential id ${row.id})`);
  if (!flags.until) {
    console.log('  No expiry set. Real certificates expire — pass --until YYYY-MM-DD.');
  }
  console.log('  This records that a certificate was checked. It does not verify one.');
  await cmdWhoami(username);
}

async function cmdRevokeCredential(id) {
  const row = await db.get(`SELECT * FROM clinician_credentials WHERE id = ?`, [id]);
  if (!row) { console.log(`\n  No credential ${id}\n`); process.exitCode = 1; return; }
  await db.run(`UPDATE clinician_credentials SET status = 'REVOKED' WHERE id = ?`, [id]);
  console.log(`\n  Credential ${id} (${row.credential}) revoked.`);
  console.log('  Past approvals that relied on it remain valid — they were legitimate when made.\n');
}

async function cmdCapabilities(flags) {
  const clinic = await db.get(`SELECT id FROM clinics ORDER BY id LIMIT 1`);
  const clinicId = clinic ? clinic.id : 1;
  const actor = await db.get(`SELECT id, username, role FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`);
  if (!actor) { console.log('\n  No admin user to attribute the change to.\n'); process.exitCode = 1; return; }

  let capabilities = null;
  if (flags.all) {
    capabilities = Object.fromEntries(clinicStore.CAPABILITY_KEYS.map((k) => [k, true]));
  } else if (flags.none) {
    capabilities = Object.fromEntries(clinicStore.CAPABILITY_KEYS.map((k) => [k, false]));
  } else if (flags.set) {
    capabilities = {};
    for (const pair of String(flags.set).split(',')) {
      const [k, v] = pair.split('=');
      if (!clinicStore.CAPABILITY_KEYS.includes(k)) {
        console.log(`\n  Unknown capability '${k}'.`);
        console.log(`  Available: ${clinicStore.CAPABILITY_KEYS.join(', ')}\n`);
        process.exitCode = 1;
        return;
      }
      capabilities[k] = v === 'true';
    }
  }

  if (capabilities) {
    await clinicStore.setCapabilities(db, { clinicId, capabilities, actor });
    console.log(`\n  Updated clinic ${clinicId} equipment (as ${actor.username}).`);
  }

  const caps = await clinicStore.getCapabilities(db, clinicId);
  console.log('');
  for (const key of clinicStore.CAPABILITY_KEYS) {
    const v = caps.capabilities[key];
    console.log(`  ${key.padEnd(26)}${v === true ? 'available' : v === false ? 'not available' : 'NOT STATED'}`);
  }
  console.log('');
}

function usage() {
  console.log(`
K9 Clinical Workflow V2 — access administration

  node v2/access.js status
      Every user, whether they can approve and why not, plus clinic equipment.

  node v2/access.js whoami <username>
  node v2/access.js grant <username> <role>
  node v2/access.js credential <username> <CCRP|CCRT|DVM|VMD|BVSC|CCRV> [--license N] [--body NAME] [--from DATE] [--until DATE]
  node v2/access.js revoke-credential <id>
  node v2/access.js capabilities [--all | --none | --set key=true,key=false]

Roles:
${Object.entries(ROLES).map(([r, d]) => `  ${r.padEnd(20)}${d}`).join('\n')}
`);
}

// ---------------------------------------------------------------------------

(async () => {
  const [command, ...rest] = process.argv.slice(2);
  const { flags, positional } = parseFlags(rest);

  if (!command || command === 'help' || flags.help) { usage(); return; }

  try {
    await db.initialize();
    // Safe on every run; also repairs a database that predates a schema change.
    await schema.applyAll(db, { logger: { log() {}, warn() {} } });

    switch (command) {
      case 'status': await cmdStatus(); break;
      case 'whoami': await cmdWhoami(positional[0]); break;
      case 'grant': await cmdGrant(positional[0], positional[1]); break;
      case 'credential': await cmdCredential(positional[0], positional[1], flags); break;
      case 'revoke-credential': await cmdRevokeCredential(positional[0]); break;
      case 'capabilities': await cmdCapabilities(flags); break;
      default:
        console.log(`\n  Unknown command '${command}'`);
        usage();
        process.exitCode = 1;
    }
  } catch (err) {
    console.error(`\n  ${err.message}\n`);
    process.exitCode = 1;
  } finally {
    if (typeof db.close === 'function') await db.close().catch(() => {});
  }
})();
