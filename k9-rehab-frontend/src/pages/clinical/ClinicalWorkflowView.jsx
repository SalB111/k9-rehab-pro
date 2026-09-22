import React, { useCallback, useEffect, useState } from "react";
import { FiAlertCircle, FiArrowLeft, FiCheck, FiPlus, FiRefreshCw, FiSettings } from "react-icons/fi";
import api from "../../api/axios";
import C from "../../constants/colors";
import ClinicalSnapshot from "./ClinicalSnapshot";
import TodaysUpdate from "./TodaysUpdate";
import RecommendationReview from "./RecommendationReview";
import NewPatient from "./NewPatient";
import SafetyGates from "./SafetyGates";
import * as v2 from "./v2api";

// ─────────────────────────────────────────────
// CLINICAL WORKFLOW (V2)
//
//   Select patient -> Snapshot -> Today's update -> Recommendation
//                  -> Review -> Approve -> Send home
//
// Replaces the seven-step wizard outright. Registering a patient is eight
// fields here; the wizard asked 186 before a protocol appeared.
//
// The clinician is never asked to re-enter what the record already knows.
// Everything the engine needs beyond those eight fields is proposed from the
// record and the clinic's equipment profile, and the safety gates — the
// values that fail UNSAFE if omitted — are confirmed rather than typed.
// ─────────────────────────────────────────────

const STEPS = [
  { id: "patient", label: "Patient" },
  { id: "snapshot", label: "Clinical snapshot" },
  { id: "update", label: "Today's update" },
  { id: "review", label: "Review & approve" },
];

const EMPTY_ASSESSMENT = {
  pain_score: null, lameness_grade: null, weight_bearing_status: null,
  mobility_level: null, gait_quality: null, treatment_approach: null,
  mmt_grade: null, ivdd_grade: null, oa_stage: null,
  neuro_proprioception: null, neuro_withdrawal: null,
  neuro_deep_pain: null, neuro_motor_grade: null,
  incision_status: null, complications_noted: null,
  crate_rest_required: null, e_collar_required: null,
  overall_change: null, clinical_observation: null,
};

/**
 * Assessment field  ->  engine input.
 *
 * The proposal speaks the engine's language (weightBearingStatus); the form
 * speaks the record's (weight_bearing_status). Same facts, two vocabularies,
 * and this is the only place that knows both — the pre-fill and the source
 * badges are derived from it, so they cannot drift apart.
 */
const FIELD_TO_ENGINE = {
  pain_score: "painScore",
  lameness_grade: "lamenessGrade",
  mobility_level: "mobilityLevel",
  treatment_approach: "treatmentApproach",
  weight_bearing_status: "weightBearingStatus",
  mmt_grade: "mmtGrade",
  ivdd_grade: "ivddGrade",
  oa_stage: "oaStage",
  neuro_proprioception: "neuroProprioception",
  neuro_withdrawal: "neuroWithdrawal",
  neuro_deep_pain: "neuroDeepPain",
  neuro_motor_grade: "neuroMotorGrade",
  incision_status: "incisionStatus",
  complications_noted: "complicationsNoted",
  crate_rest_required: "crateRestRequired",
  e_collar_required: "eCollarRequired",
};

/**
 * Pre-fill today's assessment from the proposal.
 *
 * Only fields the proposal actually settled are carried across. A gate it
 * could not derive stays null rather than arriving as a confident-looking
 * default — "Not assessed" is a truthful thing for a clinician to see, and a
 * wrong value that looks filled-in is not.
 */
function assessmentFromProposal(proposal) {
  const p = (proposal && proposal.proposed) || {};
  const out = { ...EMPTY_ASSESSMENT };
  for (const [formKey, engineKey] of Object.entries(FIELD_TO_ENGINE)) {
    out[formKey] = p[engineKey] === undefined ? null : p[engineKey];
  }
  return out;
}

/**
 * Where each pre-filled value came from, and why.
 *
 * A clinician correcting a value should be able to see at a glance whether
 * they are overriding the record, a rule, or a cautious placeholder nobody
 * has looked at yet. Those are three different acts and they deserve three
 * different labels.
 */
function sourcesFromProposal(proposal) {
  if (!proposal) return {};
  const why = (proposal.summary && proposal.summary.why) || {};
  const gateByField = new Map((proposal.gates || []).map((g) => [g.field, g]));
  const out = {};

  for (const [formKey, engineKey] of Object.entries(FIELD_TO_ENGINE)) {
    const gate = gateByField.get(engineKey);
    if (gate) {
      out[formKey] = {
        source: "gate",
        why: gate.why,
        carried: gate.carriedForward === true,
      };
    } else if (why[engineKey]) {
      out[formKey] = { source: "derived", why: why[engineKey] };
    } else if (proposal.proposed && proposal.proposed[engineKey] !== null
               && proposal.proposed[engineKey] !== undefined
               && proposal.proposed[engineKey] !== "") {
      out[formKey] = { source: "record", why: "Read from the patient record." };
    }
  }
  return out;
}

export default function ClinicalWorkflowView({ setView, patient: initialPatient }) {
  const [step, setStep] = useState(() => {
    // The sidebar's "New patient" button asks for the registration form
    // directly. Read once and clear, so a later visit lands on the picker.
    try {
      if (localStorage.getItem("k9_open_new_patient")) {
        localStorage.removeItem("k9_open_new_patient");
        return "new-patient";
      }
    } catch { /* private browsing — fall through */ }
    return initialPatient ? "snapshot" : "patient";
  });
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(initialPatient || null);
  const [snapshot, setSnapshot] = useState(null);
  const [authority, setAuthority] = useState(null);

  const [assessment, setAssessment] = useState(EMPTY_ASSESSMENT);
  const [measurements, setMeasurements] = useState([]);
  const [version, setVersion] = useState(null);
  const [videoRequests, setVideoRequests] = useState([]);
  const [access, setAccess] = useState(null);
  const [issuedCode, setIssuedCode] = useState(null);

  // What the system already knows, and which gates need a person.
  const [proposal, setProposal] = useState(null);
  const [gateConfirmations, setGateConfirmations] = useState({});

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Already on this screen when the sidebar button is pressed: setView is a
  // no-op, so the event is what moves us.
  useEffect(() => {
    const onNew = () => {
      try { localStorage.removeItem("k9_open_new_patient"); } catch { /* ignore */ }
      setError(null); setNotice(null); setStep("new-patient");
    };
    window.addEventListener("k9-new-patient", onNew);
    return () => window.removeEventListener("k9-new-patient", onNew);
  }, []);

  // ── Load patients + this user's approval authority once ────────────────
  useEffect(() => {
    api.get("/patients")
      .then((r) => setPatients(r.data?.data || []))
      .catch((e) => setError(v2.describeError(e)));
    v2.getApprovalAuthority()
      .then(setAuthority)
      .catch(() => setAuthority({ allowed: false, explanation: "Could not determine approval authority." }));
  }, []);

  const loadSnapshot = useCallback(async (patientId) => {
    setBusy(true); setError(null);
    try {
      const [snap, videos, homeAccess] = await Promise.all([
        v2.getSnapshot(patientId),
        v2.listVideoRequests(patientId).catch(() => []),
        v2.getHomeAccess(patientId).catch(() => null),
      ]);
      setSnapshot(snap);
      setVideoRequests(videos || []);
      setAccess(homeAccess);
    } catch (e) {
      setError(v2.describeError(e));
    } finally {
      setBusy(false);
    }
  }, []);

  /**
   * Answer a concern raised by the practitioner or reported by the owner.
   *
   * Answering reloads the snapshot rather than patching state locally: a
   * SCHEDULED recheck stays outstanding until the patient is actually seen, and
   * the server is the authority on that, not the screen.
   */
  const respondToRecheck = async (recheckId, status, response) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      await v2.respondToRecheck(recheckId, status, response);
      setNotice("Response recorded.");
      await loadSnapshot(patient.id);
    } catch (e) {
      setError(v2.describeError(e));
    } finally {
      setBusy(false);
    }
  };

  /**
   * Issue a client access code.
   *
   * Shown once, here, and never recoverable: the database stores only a hash.
   * A client who loses it gets a new one, which ends the old.
   */
  const issueAccess = async () => {
    setBusy(true); setError(null);
    try {
      const issued = await v2.issueHomeAccess(patient.id);
      setIssuedCode(issued.code);
      await loadSnapshot(patient.id);
    } catch (e) {
      setError(v2.describeError(e));
    } finally { setBusy(false); }
  };

  const requestVideo = async () => {
    const exercise = window.prompt(
      "Which exercise should the client film? (exercise code, or leave blank for general)"
    );
    if (exercise === null) return;
    setBusy(true); setError(null);
    try {
      await v2.requestVideo(patient.id, {
        version_id: snapshot?.active_protocol?.version_id,
        exercise_code: exercise || null,
        note: "Requested from the patient snapshot",
      });
      setNotice("Video requested. The client will see it in B.E.A.U. Home.");
      await loadSnapshot(patient.id);
    } catch (e) {
      setError(v2.describeError(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (patient?.id) loadSnapshot(patient.id);
  }, [patient?.id, loadSnapshot]);

  const selectPatient = async (p) => {
    setPatient(p);
    setVersion(null);
    setMeasurements([]);
    setIssuedCode(null);
    setGateConfirmations({});
    setAssessment(EMPTY_ASSESSMENT);
    setStep("snapshot");

    // Pre-fill today's assessment from what the record already supports, so
    // the clinician corrects rather than types. Failure is not fatal: they
    // simply get the empty form they had before.
    try {
      const prop = await v2.getIntakeProposal(p.id);
      setProposal(prop);
      setAssessment(assessmentFromProposal(prop));
    } catch {
      setProposal(null);
    }
  };

  const createPatient = async (body) => {
    setBusy(true); setError(null);
    try {
      const created = await v2.createPatient(body);
      await api.get("/patients").then((r) => setPatients(r.data.data || r.data || []));
      await selectPatient(created);
      setNotice(`${created.name} registered. Confirm the clinical picture below.`);
    } catch (e) {
      setError(v2.describeError(e));
    } finally {
      setBusy(false);
    }
  };

  // ── Visit -> assessment -> measurements -> recommendation ──────────────
  const generate = async () => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const visit = await v2.createVisit(patient.id, {
        visit_date: new Date().toISOString().slice(0, 10),
        visit_type: snapshot?.visit_count ? "RECHECK" : "INITIAL",
      });

      await v2.recordAssessment(visit.id, assessment);

      for (const m of measurements) {
        if (m.value_numeric === "" || m.value_numeric === null) continue;
        await v2.recordMeasurement(visit.id, { ...m, value_numeric: Number(m.value_numeric) });
      }

      const generated = await v2.generateRecommendation(visit.id, {
        protocol_length_weeks: 6,
        frequency: "2x/week",
      });

      // Generation alone is not review. Move it explicitly so approval is a
      // deliberate act rather than a side effect of pressing "generate".
      const reviewed = await v2.setVersionStatus(generated.id, "REVIEW");
      setVersion({ ...reviewed, unstated_clinic_capabilities: generated.unstated_clinic_capabilities });
      setStep("review");
    } catch (e) {
      setError(v2.describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const approve = async (note) => {
    setBusy(true); setError(null);
    try {
      setVersion(await v2.approveVersion(version.id, note, gateConfirmations));
      setNotice("Protocol approved and recorded.");
      loadSnapshot(patient.id);
    } catch (e) {
      setError(v2.describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const handoff = async () => {
    setBusy(true); setError(null);
    try {
      await v2.handoffVersion(version.id);
      setVersion(await v2.getVersion(version.id));
      setNotice("Sent to B.E.A.U. Home. The owner's app now holds this version.");
      loadSnapshot(patient.id);
    } catch (e) {
      setError(v2.describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const removeExercise = async (rowId) => {
    setBusy(true); setError(null);
    try {
      setVersion(await v2.removeExercise(version.id, rowId, "clinician review"));
    } catch (e) {
      setError(v2.describeError(e));
    } finally {
      setBusy(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto", overflowY: "auto", height: "100%" }}>
      <Header setView={setView} patient={patient} onChangePatient={() => setStep("patient")} />

      <StepBar step={step} setStep={setStep} hasPatient={!!patient} hasVersion={!!version} />

      {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}
      {notice && (
        <Banner tone="ok" icon={FiCheck} onDismiss={() => setNotice(null)}>{notice}</Banner>
      )}

      {step === "patient" && (
        <PatientPicker
          patients={patients}
          onSelect={selectPatient}
          onNew={() => { setError(null); setNotice(null); setStep("new-patient"); }}
        />
      )}

      {step === "new-patient" && (
        <NewPatient
          onCreate={createPatient}
          onCancel={() => setStep("patient")}
          busy={busy}
        />
      )}

      {step === "snapshot" && patient && (
        <>
          <ClinicalSnapshot
            snapshot={snapshot}
            patient={patient}
            canRespond={authority?.allowed === true}
            onRespondToRecheck={respondToRecheck}
            onRequestVideo={snapshot?.active_protocol ? requestVideo : null}
            videoRequests={videoRequests}
            access={access}
            onIssueAccess={issueAccess}
            issuedCode={issuedCode}
            busy={busy}
          />
          <Actions>
            <button style={btn.primary} onClick={() => setStep("update")}>
              Record today's visit
            </button>
            <button style={btn.ghost} onClick={() => loadSnapshot(patient.id)} disabled={busy}>
              <FiRefreshCw size={13} /> Refresh
            </button>
          </Actions>
        </>
      )}

      {step === "update" && patient && (
        <>
          <TodaysUpdate
            assessment={assessment}
            setAssessment={setAssessment}
            sources={sourcesFromProposal(proposal)}
            measurements={measurements}
            setMeasurements={setMeasurements}
            hasBaseline={snapshot?.has_baseline}
          />
          <Actions>
            <button style={btn.primary} onClick={generate} disabled={busy}>
              {busy ? "Generating…" : "Generate recommendation"}
            </button>
            <button style={btn.ghost} onClick={() => setStep("snapshot")}>Back</button>
          </Actions>
        </>
      )}

      {step === "review" && version && (
        <>
          <SafetyGates
            gates={version?.safety_gates || []}
            values={version?.engine_input || {}}
            confirmed={gateConfirmations}
            readOnly={version?.status === "APPROVED" || version?.status === "HANDED_OFF"}
            onConfirm={(field, on) =>
              setGateConfirmations((prev) => ({ ...prev, [field]: on }))
            }
          />
          <RecommendationReview
            version={version}
            authority={authority}
            onApprove={approve}
            onHandoff={handoff}
            onRemoveExercise={removeExercise}
            busy={busy}
          />
          <Actions>
            <button style={btn.ghost} onClick={() => setStep("snapshot")}>
              Back to patient
            </button>
          </Actions>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────

function Header({ setView, patient, onChangePatient }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <button style={btn.ghost} onClick={() => setView("dashboard")}>
        <FiArrowLeft size={13} /> Dashboard
      </button>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Clinical Workflow</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {patient && (
          <button style={btn.ghost} onClick={onChangePatient}>Change patient</button>
        )}
        {/* Reachable from the workflow because that is where a clinician
            discovers they cannot approve, or that equipment is undeclared. */}
        <button style={btn.ghost} onClick={() => setView("clinical-admin")}>
          <FiSettings size={13} /> Access & equipment
        </button>
      </div>
    </div>
  );
}

function StepBar({ step, setStep, hasPatient, hasVersion }) {
  const reachable = (id) =>
    id === "patient" ||
    (hasPatient && (id === "snapshot" || id === "update")) ||
    (hasVersion && id === "review");

  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
      {STEPS.map((s, i) => {
        const active = s.id === step;
        const ok = reachable(s.id);
        return (
          <button
            key={s.id}
            onClick={() => ok && setStep(s.id)}
            disabled={!ok}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 13px",
              fontSize: 12, fontWeight: 600, borderRadius: 999, cursor: ok ? "pointer" : "default",
              border: `1px solid ${active ? C.teal : C.border}`,
              background: active ? C.tealLight : C.surface,
              color: active ? C.tealDark : ok ? C.textMid : C.textLight,
            }}
          >
            <span
              style={{
                width: 18, height: 18, borderRadius: 999, fontSize: 10,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: active ? C.teal : C.border,
                color: active ? "#fff" : C.textMid,
              }}
            >
              {i + 1}
            </span>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function PatientPicker({ patients, onSelect, onNew }) {
  const [q, setQ] = useState("");
  const filtered = patients.filter((p) =>
    `${p.name} ${p.breed} ${p.condition} ${p.client_name}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      {onNew && (
        <button
          onClick={onNew}
          style={{
            width: "100%", padding: "11px 14px", marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            border: "none", borderRadius: 8, background: C.teal, color: "#fff",
          }}
        >
          <FiPlus size={15} /> Register a new patient
        </button>
      )}

      <input
        placeholder="Search patients…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px", fontSize: 14, marginBottom: 12,
          border: `1px solid ${C.border}`, borderRadius: 8,
          background: C.surface, color: C.text,
        }}
      />
      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 14px", textAlign: "left", cursor: "pointer",
              border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface,
            }}
          >
            <span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span>
              <span style={{ fontSize: 12, color: C.textMid, marginLeft: 8 }}>
                {[p.breed, p.condition].filter(Boolean).join(" · ")}
              </span>
            </span>
            <span style={{ fontSize: 12, color: C.textLight }}>{p.client_name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ fontSize: 13, color: C.textLight, padding: 12 }}>No patients match.</div>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({ error, onDismiss }) {
  // 409 means the request was valid and permitted but conflicts with the
  // current clinical state — a different message from "you typed something wrong".
  const conflict = error.status === 409;
  const forbidden = error.status === 403;
  return (
    <Banner tone={forbidden ? "warn" : "error"} icon={FiAlertCircle} onDismiss={onDismiss}>
      <strong>
        {conflict ? "This protocol has moved on" : forbidden ? "Not permitted" : "Could not complete"}
      </strong>
      <div style={{ marginTop: 3 }}>{error.message}</div>
      {error.warnings?.length > 0 && (
        <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
          {error.warnings.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      )}
    </Banner>
  );
}

function Banner({ tone, icon: Icon, children, onDismiss }) {
  const palette = {
    ok: { bg: C.greenBg, border: C.green, fg: C.green },
    warn: { bg: C.amberBg, border: C.amber, fg: C.amber },
    error: { bg: C.redBg, border: C.red, fg: C.red },
  }[tone];

  return (
    <div
      style={{
        display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14,
        padding: "12px 14px", borderRadius: 8, fontSize: 13,
        background: palette.bg, border: `1px solid ${palette.border}`, color: C.text,
      }}
    >
      <Icon size={16} style={{ color: palette.fg, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>{children}</div>
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, fontSize: 16, lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}

function Actions({ children }) {
  return <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>{children}</div>;
}

const btn = {
  primary: {
    padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6,
    border: "none", cursor: "pointer", background: C.teal, color: "#fff",
  },
  ghost: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 14px", fontSize: 13, fontWeight: 600, borderRadius: 6,
    border: `1px solid ${C.border}`, cursor: "pointer",
    background: C.surface, color: C.textMid,
  },
};
