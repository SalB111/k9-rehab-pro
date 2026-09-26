# Decisions waiting for Sal

Written 2026-09-26 during an unattended session. Everything here is something
I could not decide without inventing a clinical value or taking a risk that
needed a person watching. Nothing in this list is blocked on work — it is
blocked on a judgement.

Ordered by what unblocks the most.

---

## 1. Which blocks does an INTAKE actually require?  **clinical**

`backend/v2/patient-block-state.js` → `STAGE_REQUIREMENTS`, present and
**empty on purpose**.

The dashboard now knows which stage a patient is at — *No visit opened*,
*Intake*, *Admitted*, *In programme* — and says so on the patient screen.
What it does **not** do is hide or require anything by stage, because that
needs your list: at an intake visit, which blocks must be filled before the
patient can be admitted, and which are simply not expected yet?

Your flow, as you described it: client comes in, vet examines, nurse takes
vitals, vet diagnoses and calls surgical or non-surgical — then admission the
following week, and B.E.A.U. metrics are added then.

**What I need:** two lists. Roughly *"at INTAKE, these blocks are expected:
… ; everything else is not"*, and the same for ADMISSION. As soon as those
exist, a block that is empty at intake stops reading as a problem, which is
the thing you originally asked for.

While the list is empty nothing is wrongly flagged, so this is safe to leave.

---

## 2. Should activity restrictions exclude exercises?  **clinical**

Found while making the treatment store the single home for them.

`getExcludedCodes` (protocol-generator.js:867) keyword-scans
`specialInstructions`, but **all 18 `CONTRAINDICATION_MAP` keywords are
comorbidity terms** — `cardiac`, `seizure`, `cancer`, `pregnant`, `implant`,
`non-ambulatory`. Probed against real order text:

| you write | exercises excluded |
|---|---|
| `no impact exercises` | none |
| `no stairs` | none |
| `no jumping` | none |
| `crate rest` | none |
| `harness only` | none |

So writing *"no impact exercises"* does not remove impact exercises from the
generated protocol. Impact and jumping appear only as advisory prose attached
to each protocol definition, never as logic.

**This is not a safety hole** — every protocol carries its contraindication
text and none is valid without your review and sign-off. But it is a gap
between what the field implies and what the engine does, and you should decide
it rather than discover it.

**What I need:** whether restriction wording should drive exclusion at all,
and if so which phrases map to which exercise codes. That is clinical
authorship — I will not write those rules.

---

## 3. Run the schema migration  **not clinical, but needs you present**

`node scripts/migrate-drop-finding-defaults.js --commit`

The `patients` table still defaults `lameness_grade 0`, `body_condition_score
5`, `pain_level 5`, `mobility_level 'Moderate'` — every one a real clinical
finding, invented for any insert that omits the column. This is the same
fabrication I removed from `server.js` in `3516874`, surviving one layer down
in the schema. Found by `scripts/drive-flow.js`.

Fixed already for fresh installs. The **live** table needs a rebuild, and
**19 foreign keys point into `patients`** — which is why I did not do it with
nobody watching.

The script backs up, runs SQLite's documented 12-step rebuild in a
transaction, compares a per-row fingerprint before and after, runs
`PRAGMA foreign_key_check`, and rolls back on any mismatch. Dry run is clean.

**Do it with the backend stopped**, then `npm run verify` and flip the
`[KNOWN]` test in `backend/v2/no-fabricated-findings.test.js`.

No live code path omits those columns today, so nothing is being fabricated
right now. The exposure is a future insert path.

---

## 4. Deep pain perception is missing for Louie and Haley  **clinical**

`neuroDeepPain` is a **safety gate** that blocks protocol generation when
absent. Neither patient has `assessment::Deep Pain Perception` recorded, so
no finding reaches the engine for either. The audit lists this as known and
accepted; it needs the finding recorded, which is yours.

---

## 5. Bella's mobility reads as a leftover default  **clinical, small**

You confirmed her `Moderate` is her real finding. But her assessment is
silent on mobility, so the column is **indistinguishable from the fabricated
`Moderate`** that Louie was carrying. Any future audit will either ignore it
or flag it wrongly.

One line in her assessment record makes it durable. I have not touched it.

---

## 6. The nutrition panel reads BCS from the blob  **design, small**

`metrics` moved MERGED → **PARTIAL** when the fourth MERGED test was added:
`PetCareNutritionPanel` reads `metrics::BCS (1–9)` from `dashboard_data`
while `visit_measurements` owns measurements.

Practical effect today: **Louie's BCS of 6, which you gave me, will not show
in the nutrition panel** — his blob has no BCS key. The column has it; the
panel does not look there.

**What I need:** is BCS a measurement that belongs in the store, or a
separate fact the nutrition panel owns? Then I can repoint one or the other.

---

## 7. Still open, lower priority

- **`client` block is PARTIAL.** Demographics — name, sex, species, breed,
  phone, email, referring vet — are still written to the blob by the panel,
  and four engine inputs still read `client::` keys. The design says
  demographics go through `PUT /api/patients/:id`; the panel does not.
- **`assessment` block is untouched.** 10 engine inputs still come from the
  blob, including `neuroDeepPain` **[GATE]**.
- **One orphaned row in `visit_assessments`.** Known and accepted; nobody has
  decided what to do with it.
- **Louie and Haley have no `visits` row at all.** The dashboard never opens
  one. Should saving an intake open a visit automatically, or should that be
  an explicit action? Design question with a clinical edge — a visit is a
  billable, auditable event.
- **Six `.claude/worktrees` gitlinks** show as phantom deletions in
  `git status`. Documented in the workspace CLAUDE.md; the clean fix is
  gitignore + `git rm --cached`, deliberately not smuggled into another
  commit.

---

## What I did while you were out

Six commits, all pushed, `verify` green on every one (31/31 now, was 26/26).

- **Protocol Summary** was reading a blob two blocks had already left. Winston
  showed *Partial weight bearing* while his record said *Full* — a superseded
  value presented as current, on the sign-off page.
- **MERGED became four tests**, adding *"no other screen reads the blob"*.
  `scripts/block-state.js` measures it. That fourth test is what found the
  nutrition/BCS case in item 6.
- **Activity restrictions have one home** — the treatment store — with the
  column as a mirror and the second entry box removed from New/Edit Patient.
- **`scripts/drive-flow.js`** walks a throwaway patient from registration to
  the B.E.A.U. handoff payload in 26 steps and deletes it afterwards. It
  found the schema defaults in item 3.
- **The block dots were lying.** They counted blob keys, so Haley's Home and
  Goals cards read as untouched while both stores held her record.
- **The five other patients' records were corrected** — Louie's four values
  from you, and the three merged activity-order sets you confirmed. The audit
  went from five clinician items to **"Nothing needs a person."**

### Two mistakes of mine worth knowing about

**I shipped a backend that could not boot.** A comment I added to the patients
DDL contained backticks; the DDL lives inside a JS template literal, so the
module stopped parsing. My syntax check was `node -e require(...) | head -2 &&
echo "syntax ok"` — `head` exits 0 regardless, so it printed success over a
stack trace. I let a pipe decide the outcome, which I had already been caught
doing once in this project.

Worse: **`verify` said 30/30 with the backend dead.** Nothing in the suite
loaded that module. `scripts/syntax-check.js` now runs `node --check` over all
166 files as the first check, and it is proven against that exact bug.

**Two of my tests passed while protecting nothing.** One asserted a behaviour
that my own explanatory comment satisfied; one could not tell the primary code
path from its fallback. Both were caught by mutation testing, not by running
them. Every guard I added this session has been mutation-tested since.

### Verified by Sal, 2026-09-26

Both UI changes have now been looked at by a person and both are correct:
Haley's **Home and Goals dots are green** (they showed nothing at all
before, as if the blocks were untouched), and the **banner reads "No visit
opened"**.

That gap cost something first, and it is worth recording why. I could not
open the app — it needs a login, the seeded test accounts have no usable
password by design, and I would not fabricate a credential to look at my own
work. So I shipped the block-state effect referencing `saved` before it was
declared, which threw on mount and took the whole dashboard down behind the
error boundary. `vite build` passed, because a temporal dead zone violation
only fails at run time and this frontend has no linter. **Sal found it by
pressing Enter.**

There is now a check for that class — every `useState` name used in a hook
dependency array must be declared before it, scoped per function — but the
general point stands: a build passing says nothing about whether the page
runs, and I had no way to find that out myself.
