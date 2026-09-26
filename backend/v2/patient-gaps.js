'use strict';

/**
 * WHAT IS MISSING, AND WHAT IT COSTS
 *
 * The generator does not fail loudly on an incomplete record. It reasons from
 * whatever it is given, and an absent field is not neutral:
 *
 *   - `condition` empty          -> the engine falls back to 'Conditioning',
 *                                   which is a different protocol entirely.
 *   - `surgery_date` empty       -> a post-operative patient has no recovery
 *                                   phase, so the protocol cannot be staged.
 *   - `medical_history` empty    -> the contraindication keyword scan runs over
 *     `current_medications`         an empty string and finds nothing, which
 *     `special_instructions`        reads exactly like "no contraindications".
 *   - a clinic capability unstated -> that therapy is WITHHELD from every
 *                                   protocol, silently, for every patient.
 *
 * None of that shows up as an error. The protocol generates, looks complete,
 * and is thinner or differently-shaped than the case called for.
 *
 * This module answers one question for a patient: what does the generator not
 * know, what will it do about it, and — where the V1 clinical record already
 * holds the answer — what would it say if asked.
 *
 * IT PROPOSES. It does not write, and it does not decide. A suggestion drawn
 * from the V1 record is shown with its source so the person fixing the record
 * can see what they are accepting.
 */

const bridge = require('./dashboard-bridge');

/**
 * What a missing field costs, worst first.
 *
 *   BLOCKS    the engine refuses outright.
 *   DEGRADES  it generates, reasoning from less than it should.
 *   WITHHOLDS an enablement gate is unstated, so therapy is removed.
 */
const SEVERITY = { BLOCKS: 'BLOCKS', DEGRADES: 'DEGRADES', WITHHOLDS: 'WITHHOLDS' };

const ORDER = { BLOCKS: 0, DEGRADES: 1, WITHHOLDS: 2 };

/**
 * Record-level fields the generator reads.
 *
 * Deliberately NOT the per-visit safety gates. Those are confirmed at the
 * assessment by the clinician in front of the animal, which is where they
 * belong — this is about the standing record being incomplete before anyone
 * gets that far.
 */
const FIELDS = [
  {
    column: 'name', engine: 'patientName', label: 'Patient name',
    severity: SEVERITY.BLOCKS,
    why: 'The engine refuses to generate without it.',
  },
  {
    column: 'client_name', engine: 'clientLastName', label: 'Client name',
    severity: SEVERITY.BLOCKS,
    why: 'The engine requires a client name and refuses to generate without one.',
  },
  {
    column: 'condition', engine: 'diagnosis', label: 'Condition',
    severity: SEVERITY.BLOCKS,
    why: 'Everything is reasoned from this. With no condition the engine falls '
       + 'back to a general conditioning protocol, and the safety gates for the '
       + 'real presentation are never raised.',
  },
  {
    column: 'affected_region', engine: 'affectedRegion', label: 'Affected region',
    severity: SEVERITY.DEGRADES,
    why: 'Selects the protocol type alongside the condition. Without it the '
       + 'protocol is not localised to the limb or segment being treated.',
  },
  {
    column: 'surgery_date', engine: 'surgeryDate', label: 'Surgery date',
    severity: SEVERITY.DEGRADES,
    onlyIf: (p) => isSurgical(p),
    why: 'This reads as a surgical case. Without a date the recovery phase '
       + 'cannot be calculated, and every post-operative restriction is '
       + 'proposed as still active.',
  },
  {
    column: 'medical_history', engine: 'medicalHistory', label: 'Medical history',
    severity: SEVERITY.DEGRADES,
    why: 'Scanned for contraindications and post-operative complications. '
       + 'Empty is indistinguishable from "nothing to report".',
  },
  {
    column: 'current_medications', engine: 'currentMedications', label: 'Current medications',
    severity: SEVERITY.DEGRADES,
    why: 'Scanned for contraindications. Empty reads as "no medications".',
  },
  {
    column: 'special_instructions', engine: 'specialInstructions', label: 'Special instructions',
    severity: SEVERITY.DEGRADES,
    why: 'Scanned for contraindications. Anything a protocol must respect that '
       + 'the other fields do not carry belongs here.',
  },
  {
    column: 'weight', engine: 'weight', label: 'Weight',
    severity: SEVERITY.DEGRADES,
    why: 'Carried into the protocol and the clinical record. Recorded in pounds.',
    isMissing: (v) => !Number.isFinite(Number(v)) || Number(v) <= 0,
  },
  {
    column: 'age', engine: 'age', label: 'Age',
    severity: SEVERITY.DEGRADES,
    why: 'Carried into the protocol and the clinical record.',
    isMissing: (v) => !Number.isFinite(Number(v)) || Number(v) <= 0,
  },

  // ── The four that could not be missing until 2026-09-26 ──────────────────
  //
  // Patient registration DEFAULTED these: lameness 0, BCS 5, pain 5/10,
  // mobility "Moderate". Every one is a real clinical finding, so the column
  // was never empty and there was never a gap to report — the invented value
  // stood in for the assessment and nothing said so.
  //
  // Worse, the record could not correct it. intake-proposal fills a column
  // from the clinical record only when the column is EMPTY, so a registered
  // patient whose assessment said NRS 2 went on being read as 5.
  //
  // With the defaults gone these are genuinely absent until somebody assesses
  // them, which is what they should have been all along, and a clinician is
  // now told rather than shown a number nobody produced.
  //
  // NOTE the default `missing()` is used deliberately for all four: ZERO IS A
  // REAL FINDING here. Lameness 0 is a sound dog and pain 0 is a comfortable
  // one — neither is an absence, and the numeric `isMissing` used for weight
  // and age above would wrongly report both as unrecorded.
  {
    column: 'pain_level', engine: 'painScore', label: 'Pain score',
    severity: SEVERITY.DEGRADES,
    why: 'Drives restriction in the engine — 8 or above forces comfort-focused '
       + 'care and a phase lock. An unstated pain score is not a comfortable dog.',
  },
  {
    column: 'lameness_grade', engine: 'lamenessGrade', label: 'Lameness grade',
    severity: SEVERITY.DEGRADES,
    why: 'Grade 5 applies the non-weight-bearing exclusions on its own. '
       + 'Unstated is not the same as sound.',
  },
  {
    column: 'mobility_level', engine: 'mobilityLevel', label: 'Mobility level',
    severity: SEVERITY.DEGRADES,
    why: 'Read for the weight-bearing gate and for which safety gates apply at '
       + 'all — a non-ambulatory patient is asked the whole neurological set.',
  },
  {
    column: 'body_condition_score', engine: 'bodyConditionScore', label: 'Body condition score',
    severity: SEVERITY.DEGRADES,
    why: 'Carried into the protocol and into weight-management advice.',
  },
];

/** Does this record describe something post-operative? */
function isSurgical(patient) {
  const text = `${patient?.condition || ''} ${patient?.affected_region || ''}`.toLowerCase();
  return /post.?op|tplo|tta|repair|osteotomy|ectomy|otomy|arthrodesis|amputation|stabilis|stabiliz/
    .test(text);
}

/** Empty by this field's own definition; a zero age is missing, a zero pain is not. */
function missing(field, value) {
  if (field.isMissing) return field.isMissing(value);
  return value === null || value === undefined || String(value).trim() === '';
}

/**
 * What the generator does not know about this patient.
 *
 * @param {Object} patient        the row, columns and dashboard_data
 * @param {Object} [capabilities] from clinicStore.getCapabilities — `unstated`
 *                                is the list of equipment nobody has answered
 * @returns {{ ready: boolean, blocking: number, gaps: Array, fromRecord: number }}
 */
function findGaps(patient, capabilities) {
  const v1 = bridge.readDashboard(patient || {});
  const gaps = [];

  for (const field of FIELDS) {
    if (field.onlyIf && !field.onlyIf(patient)) continue;
    const value = patient ? patient[field.column] : undefined;
    if (!missing(field, value)) continue;

    // The V1 clinical record may already hold it. Offered, never applied:
    // the person fixing the record sees the value AND where it came from, and
    // decides. A suggestion silently written is just a second way to be wrong.
    const suggested = v1.values[field.engine];
    const prov = v1.provenance[field.engine];

    gaps.push({
      column: field.column,
      engine: field.engine,
      label: field.label,
      severity: field.severity,
      why: field.why,
      suggestion: suggested === undefined || suggested === null ? null : {
        value: suggested,
        source: prov ? prov.key : null,
        raw: prov ? prov.raw : null,
      },
    });
  }

  // Equipment. An unstated capability is not a neutral unknown — the engine
  // treats it as unavailable and removes the therapy from every protocol.
  for (const key of (capabilities && capabilities.unstated) || []) {
    gaps.push({
      column: null,
      engine: key,
      label: CAPABILITY_LABEL[key] || key.replace(/_/g, ' '),
      severity: SEVERITY.WITHHOLDS,
      clinic: true,
      why: 'Nobody has said whether the practice has this. Until someone does, '
         + 'the engine withholds it from every protocol for every patient.',
      suggestion: null,
    });
  }

  gaps.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  const blocking = gaps.filter((g) => g.severity === SEVERITY.BLOCKS).length;
  return {
    ready: blocking === 0,
    blocking,
    gaps,
    fromRecord: gaps.filter((g) => g.suggestion).length,
    v1Present: v1.present,
    conflicts: bridge.disagreements(patient || {}, bridge.COMPARABLE),
  };
}

const CAPABILITY_LABEL = {
  aquatic_access: 'Aquatic access',
  modality_uwtm: 'Underwater treadmill',
  modality_laser: 'Therapeutic laser',
  modality_tens: 'TENS',
  modality_nmes: 'NMES',
  modality_therapeutic_us: 'Therapeutic ultrasound',
  modality_pulsed_emf: 'Pulsed EMF',
  modality_shockwave: 'Shockwave',
  modality_cryotherapy: 'Cryotherapy',
  modality_heat_therapy: 'Heat therapy',
};

module.exports = { findGaps, FIELDS, SEVERITY, isSurgical, CAPABILITY_LABEL };
