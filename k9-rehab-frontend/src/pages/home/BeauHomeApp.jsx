import React, { useCallback, useEffect, useState } from "react";
import {
  FiAlertOctagon, FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle,
  FiHome, FiMessageSquare, FiVideo,
} from "react-icons/fi";
import * as beau from "./beauApi";

// ─────────────────────────────────────────────
// B.E.A.U. HOME — the client app
//
// A different audience from every other screen in this product. A pet owner is
// doing this on a phone, in a hallway, with a dog. So:
//
//   - one exercise at a time, never a list to parse
//   - large targets, plain words, no clinical vocabulary
//   - the stop conditions are on screen WHILE they do it, not buried in a
//     handout — an owner who does not know when to stop is the risk the whole
//     red-flag mechanism exists to manage
//   - the questions at the end are three taps, because a long form after every
//     session is a form that stops being filled in, and then the clinic goes
//     blind
//
// Nothing here can change the prescription. It reports what happened.
// ─────────────────────────────────────────────

const ui = {
  page: {
    minHeight: "100vh", background: "#F7F9FB", color: "#0F1B2A",
    fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    padding: "20px 16px 40px", maxWidth: 560, margin: "0 auto",
  },
  card: {
    background: "#fff", borderRadius: 16, padding: 20,
    boxShadow: "0 1px 3px rgba(15,27,42,0.08)", border: "1px solid #E6EBF0",
  },
  primary: {
    width: "100%", padding: "16px 20px", fontSize: 17, fontWeight: 700,
    borderRadius: 12, border: "none", cursor: "pointer",
    background: "#0EA5E9", color: "#fff",
  },
  secondary: {
    width: "100%", padding: "14px 20px", fontSize: 15, fontWeight: 600,
    borderRadius: 12, cursor: "pointer",
    background: "#fff", color: "#44566C", border: "1px solid #D6DEE6",
  },
  danger: {
    width: "100%", padding: "14px 20px", fontSize: 15, fontWeight: 700,
    borderRadius: 12, cursor: "pointer",
    background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5",
  },
  h1: { fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.3px" },
  muted: { fontSize: 14, color: "#64748B", lineHeight: 1.5 },
};

export default function BeauHomeApp() {
  const [patient, setPatient] = useState(beau.getStoredPatient());
  const [programme, setProgramme] = useState(null);
  const [screen, setScreen] = useState(beau.getToken() ? "loading" : "code");
  const [session, setSession] = useState(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true); setError(null);
    try {
      const data = await beau.getProgramme();
      setProgramme(data);
      setPatient(data.patient);
      setScreen("today");
      beau.recordEngagement("HEP_VIEWED");
    } catch (e) {
      if (e.status === 401) { setScreen("code"); setError(null); }
      else if (e.status === 404) { setProgramme(null); setScreen("none"); }
      else setError(e.message);
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    if (beau.getToken()) { beau.recordEngagement("APP_OPENED"); load(); }
  }, [load]);

  // ── Code ────────────────────────────────────────────────────────────────
  if (screen === "code") {
    return <CodeScreen onDone={() => { beau.recordEngagement("APP_OPENED"); load(); }} />;
  }

  if (screen === "loading" || (busy && !programme)) {
    return <div style={ui.page}><p style={ui.muted}>Loading…</p></div>;
  }

  if (screen === "none") {
    return (
      <div style={ui.page}>
        <Header patient={patient} />
        <div style={{ ...ui.card, textAlign: "center" }}>
          <FiHome size={30} style={{ color: "#94A3B8" }} />
          <h2 style={{ fontSize: 18, marginTop: 12 }}>No exercises yet</h2>
          <p style={ui.muted}>
            Your clinic hasn't sent a home programme yet. They'll let you know when it's ready.
          </p>
        </div>
      </div>
    );
  }

  const exercises = programme?.exercises || [];

  // ── Start a session ─────────────────────────────────────────────────────
  const begin = async () => {
    setBusy(true); setError(null);
    try {
      const created = await beau.startSession(
        new Date().toISOString().slice(0, 10),
        programme.current_week
      );
      setSession(created);
      setIndex(0);
      setScreen("exercise");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const logAndAdvance = async (log) => {
    setBusy(true); setError(null);
    try {
      const row = session.exercises[index];
      const updated = await beau.logExercise(session.id, row.id, log);
      setSession(updated);
      if (index + 1 < session.exercises.length) setIndex(index + 1);
      else setScreen("questions");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const finish = async (summary) => {
    setBusy(true); setError(null);
    try {
      await beau.completeSession(session.id, summary);
      setScreen("done");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={ui.page}>
      <Header patient={patient} />
      {error && <Banner tone="error" onDismiss={() => setError(null)}>{error}</Banner>}

      {screen === "today" && (
        <TodayScreen
          programme={programme}
          exercises={exercises}
          busy={busy}
          onBegin={begin}
          onMessage={() => setScreen("message")}
        />
      )}

      {screen === "exercise" && session && (
        <ExerciseScreen
          /* Remount per exercise. Without a key React reuses the instance and
             the "something's wrong" panel stays open, pre-filled with the last
             exercise's text — an owner could re-submit it against the wrong
             exercise without noticing. */
          key={session.exercises[index].id}
          exercise={session.exercises[index]}
          detail={exercises.find((e) => e.exercise_code === session.exercises[index].exercise_code)}
          position={index + 1}
          total={session.exercises.length}
          busy={busy}
          onLog={logAndAdvance}
          onBack={() => (index > 0 ? setIndex(index - 1) : setScreen("today"))}
        />
      )}

      {screen === "questions" && (
        <QuestionsScreen busy={busy} onFinish={finish} />
      )}

      {screen === "done" && (
        <DoneScreen
          programme={programme}
          sessionId={session?.id}
          onHome={() => { setSession(null); load(); }}
        />
      )}

      {screen === "message" && (
        <MessageScreen
          busy={busy}
          onSend={async (text) => {
            setBusy(true);
            try { await beau.sendMessage(text, session?.id); setScreen("sent"); }
            catch (e) { setError(e.message); } finally { setBusy(false); }
          }}
          onCancel={() => setScreen("today")}
        />
      )}

      {screen === "sent" && (
        <div style={{ ...ui.card, textAlign: "center" }}>
          <FiCheckCircle size={30} style={{ color: "#16A34A" }} />
          <h2 style={{ fontSize: 18, marginTop: 12 }}>Message sent</h2>
          <p style={ui.muted}>Your clinic will see this with {patient?.name}'s records.</p>
          <button style={{ ...ui.secondary, marginTop: 16 }} onClick={() => setScreen("today")}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────

function Header({ patient }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, color: "#0EA5E9" }}>
        B.E.A.U. AT HOME
      </div>
      {patient?.name && (
        <h1 style={{ ...ui.h1, marginTop: 4 }}>{patient.name}</h1>
      )}
    </div>
  );
}

function CodeScreen({ onDone }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setError(null);
    try { await beau.enterCode(code); onDone(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={ui.page}>
      <Header />
      <div style={ui.card}>
        <h2 style={{ fontSize: 19, margin: 0 }}>Enter your code</h2>
        <p style={{ ...ui.muted, marginTop: 8 }}>
          Your clinic gave you a code for your dog's exercise programme.
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && code && submit()}
          placeholder="XXXX-XXXX-XXXX"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          style={{
            width: "100%", marginTop: 16, padding: "16px 14px",
            fontSize: 20, letterSpacing: 2, textAlign: "center",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            border: `1px solid ${error ? "#FCA5A5" : "#D6DEE6"}`,
            borderRadius: 12, background: "#fff", color: "#0F1B2A",
          }}
        />
        {error && (
          <p style={{ fontSize: 14, color: "#DC2626", marginTop: 10 }}>{error}</p>
        )}
        <button
          style={{ ...ui.primary, marginTop: 16, opacity: !code || busy ? 0.5 : 1 }}
          disabled={!code || busy}
          onClick={submit}
        >
          {busy ? "Checking…" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function TodayScreen({ programme, exercises, busy, onBegin, onMessage }) {
  // Engine WARNINGs are clinician diagnostics — "No affected region selected —
  // defaulting to Generalized" means nothing to an owner and reads as something
  // being wrong with their dog. Only instructions written FOR the owner are
  // shown; the per-exercise stop conditions carry the rest, at the moment they
  // matter.
  const restrictions = (programme.restrictions || [])
    .filter((r) => r.type !== "WARNING")
    .slice(0, 3);
  const videos = programme.video_requests || [];

  return (
    <>
      <div style={ui.card}>
        <div style={{ fontSize: 13, color: "#64748B" }}>
          {[`Week ${programme.current_week} of ${programme.total_weeks}`, programme.frequency]
            .filter(Boolean)
            .join(" · ")}
        </div>
        <h2 style={{ fontSize: 20, marginTop: 6, marginBottom: 4 }}>Today's exercises</h2>
        <p style={ui.muted}>
          {exercises.length} exercise{exercises.length === 1 ? "" : "s"} — about
          {" "}{Math.max(5, exercises.length * 4)} minutes.
        </p>

        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          {exercises.map((e, i) => (
            <div
              key={e.exercise_code}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10, background: "#F7F9FB",
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 999, background: "#0EA5E9", color: "#fff",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {e.exercise_name || e.exercise_code}
              </span>
            </div>
          ))}
        </div>

        <button style={{ ...ui.primary, marginTop: 18 }} disabled={busy} onClick={onBegin}>
          {busy ? "Starting…" : "Start"} <FiArrowRight size={16} style={{ verticalAlign: -2 }} />
        </button>
      </div>

      {videos.length > 0 && (
        <div style={{ ...ui.card, marginTop: 12, borderColor: "#BFDBFE", background: "#EFF6FF" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <FiVideo size={18} style={{ color: "#2563EB", flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ fontSize: 15 }}>Your clinic asked for a video</strong>
              {videos.map((v) => (
                <p key={v.id} style={{ ...ui.muted, marginTop: 4 }}>
                  {v.request_note || `Please film ${v.exercise_code}.`}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {restrictions.length > 0 && (
        <div style={{ ...ui.card, marginTop: 12 }}>
          <strong style={{ fontSize: 14 }}>Things to keep in mind</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, ...ui.muted }}>
            {restrictions.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r.detail}</li>)}
          </ul>
        </div>
      )}

      {programme.approved_by && (
        <p style={{ ...ui.muted, textAlign: "center", marginTop: 16, fontSize: 13 }}>
          Approved by {programme.approved_by.name}
          {programme.approved_by.credential ? `, ${programme.approved_by.credential}` : ""}
        </p>
      )}

      <button style={{ ...ui.secondary, marginTop: 12 }} onClick={onMessage}>
        <FiMessageSquare size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
        Message the clinic
      </button>
    </>
  );
}

function ExerciseScreen({ exercise, detail, position, total, busy, onLog, onBack }) {
  const [stopping, setStopping] = useState(false);
  const [what, setWhat] = useState("");
  const [severity, setSeverity] = useState("MODERATE");

  const stops = beau.stopConditions(detail);
  const kit = beau.equipmentList(detail);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 4 }}
        >
          <FiArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, height: 6, background: "#E6EBF0", borderRadius: 999 }}>
          <div style={{
            width: `${(position / total) * 100}%`, height: "100%",
            background: "#0EA5E9", borderRadius: 999,
          }} />
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
          {position}/{total}
        </span>
      </div>

      <div style={ui.card}>
        <h2 style={{ fontSize: 21, margin: 0 }}>
          {exercise.exercise_name || exercise.exercise_code}
        </h2>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#0EA5E9", marginTop: 8 }}>
          {[exercise.prescribed_sets, exercise.prescribed_reps && `${exercise.prescribed_reps} reps`]
            .filter(Boolean).join(" · ") || "As shown by your clinic"}
        </p>

        {kit.length > 0 && (
          <p style={{ ...ui.muted, marginTop: 10 }}>
            <strong>You'll need:</strong> {kit.join(", ")}
          </p>
        )}

        {/* On screen while they do it — not in a handout in a drawer. */}
        {stops.length > 0 && (
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 12,
            background: "#FEF2F2", border: "1px solid #FCA5A5",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#DC2626", fontWeight: 700, fontSize: 14 }}>
              <FiAlertOctagon size={16} /> Stop if you see
            </div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14, color: "#7F1D1D", lineHeight: 1.5 }}>
              {stops.map((s, i) => <li key={i} style={{ marginBottom: 3 }}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>

      {!stopping ? (
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <button
            style={{ ...ui.primary, opacity: busy ? 0.5 : 1 }}
            disabled={busy}
            onClick={() => onLog({ completed: true, difficulty: "JUST_RIGHT" })}
          >
            <FiCheck size={17} style={{ verticalAlign: -3, marginRight: 6 }} /> Done
          </button>
          <button
            style={ui.secondary}
            disabled={busy}
            onClick={() => onLog({ completed: false, partial: true, skipped_reason: "Tried but could not finish" })}
          >
            Tried, couldn't finish
          </button>
          <button
            style={ui.secondary}
            disabled={busy}
            onClick={() => onLog({ completed: false, skipped_reason: "Skipped today" })}
          >
            Skip this one
          </button>
          <button style={ui.danger} disabled={busy} onClick={() => setStopping(true)}>
            <FiAlertOctagon size={15} style={{ verticalAlign: -2, marginRight: 6 }} />
            Something's wrong
          </button>
        </div>
      ) : (
        <div style={{ ...ui.card, marginTop: 14, borderColor: "#FCA5A5" }}>
          <strong style={{ fontSize: 16 }}>What did you see?</strong>
          <p style={{ ...ui.muted, marginTop: 6 }}>
            This goes straight to your clinic.
          </p>
          <textarea
            rows={3}
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="e.g. He yelped and held the leg up"
            style={{
              width: "100%", marginTop: 10, padding: 12, fontSize: 15,
              border: "1px solid #D6DEE6", borderRadius: 10, resize: "vertical",
            }}
          />
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {beau.SEVERITY_CHOICES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSeverity(s.value)}
                style={{
                  padding: "12px 14px", fontSize: 14, textAlign: "left", borderRadius: 10,
                  cursor: "pointer", fontWeight: severity === s.value ? 700 : 500,
                  border: `1px solid ${severity === s.value ? "#DC2626" : "#D6DEE6"}`,
                  background: severity === s.value ? "#FEF2F2" : "#fff",
                  color: severity === s.value ? "#DC2626" : "#44566C",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            style={{ ...ui.danger, marginTop: 14, opacity: !what.trim() || busy ? 0.5 : 1 }}
            disabled={!what.trim() || busy}
            onClick={() => onLog({
              completed: false, partial: true,
              red_flag_observed: what.trim(), red_flag_severity: severity,
              difficulty: "TOO_HARD",
            })}
          >
            Tell the clinic
          </button>
          <button style={{ ...ui.secondary, marginTop: 8 }} onClick={() => setStopping(false)}>
            Cancel
          </button>
        </div>
      )}
    </>
  );
}

function QuestionsScreen({ busy, onFinish }) {
  const [difficulty, setDifficulty] = useState(null);
  const [pain, setPain] = useState(null);
  const [notes, setNotes] = useState("");

  return (
    <div style={ui.card}>
      <h2 style={{ fontSize: 20, margin: 0 }}>How did that go?</h2>
      <p style={{ ...ui.muted, marginTop: 6 }}>Three quick questions.</p>

      <p style={{ fontWeight: 700, fontSize: 15, marginTop: 20, marginBottom: 8 }}>
        How was it for him overall?
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {beau.DIFFICULTY_CHOICES.map((d) => (
          <button
            key={d.value}
            onClick={() => setDifficulty(d.value)}
            style={{
              padding: "14px", fontSize: 15, textAlign: "left", borderRadius: 10, cursor: "pointer",
              fontWeight: difficulty === d.value ? 700 : 500,
              border: `1px solid ${difficulty === d.value ? "#0EA5E9" : "#D6DEE6"}`,
              background: difficulty === d.value ? "#EFF6FF" : "#fff",
            }}
          >
            <span style={{ marginRight: 8 }}>{d.emoji}</span>{d.label}
          </button>
        ))}
      </div>

      <p style={{ fontWeight: 700, fontSize: 15, marginTop: 22, marginBottom: 4 }}>
        Any discomfort afterwards?
      </p>
      {/* An owner's impression, and labelled as such everywhere it is shown to
          the clinic. It is not a clinical pain score. */}
      <p style={{ ...ui.muted, marginBottom: 10, fontSize: 13 }}>
        0 = completely comfortable, 10 = very sore
      </p>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            onClick={() => setPain(n)}
            style={{
              width: 42, height: 42, borderRadius: 10, fontSize: 15, cursor: "pointer",
              fontWeight: pain === n ? 700 : 500,
              border: `1px solid ${pain === n ? "#0EA5E9" : "#D6DEE6"}`,
              background: pain === n ? "#0EA5E9" : "#fff",
              color: pain === n ? "#fff" : "#44566C",
            }}
          >
            {n}
          </button>
        ))}
      </div>

      <p style={{ fontWeight: 700, fontSize: 15, marginTop: 22, marginBottom: 8 }}>
        Anything you want to tell the clinic?
      </p>
      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional"
        style={{
          width: "100%", padding: 12, fontSize: 15,
          border: "1px solid #D6DEE6", borderRadius: 10, resize: "vertical",
        }}
      />

      <button
        style={{ ...ui.primary, marginTop: 20, opacity: !difficulty || busy ? 0.5 : 1 }}
        disabled={!difficulty || busy}
        onClick={() => onFinish({
          overall_difficulty: difficulty,
          owner_pain_rating: pain,
          owner_notes: notes.trim() || null,
        })}
      >
        {busy ? "Sending…" : "Finish"}
      </button>
    </div>
  );
}

function DoneScreen({ programme, sessionId, onHome }) {
  const videos = programme?.video_requests || [];
  const [sent, setSent] = useState(false);

  return (
    <div style={{ ...ui.card, textAlign: "center" }}>
      <FiCheckCircle size={40} style={{ color: "#16A34A" }} />
      <h2 style={{ fontSize: 22, marginTop: 14, marginBottom: 6 }}>All done</h2>
      <p style={ui.muted}>Your clinic can see this now.</p>

      {videos.length > 0 && !sent && (
        <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: "#EFF6FF", textAlign: "left" }}>
          <strong style={{ fontSize: 15 }}>Send the video they asked for?</strong>
          <p style={{ ...ui.muted, marginTop: 4 }}>
            {videos[0].request_note || `A short clip of ${videos[0].exercise_code}.`}
          </p>
          <button
            style={{ ...ui.secondary, marginTop: 10 }}
            onClick={async () => {
              // Capture and upload belong to the host app's media pipeline; this
              // records that a clip was provided and links it to the session.
              const ref = window.prompt("Paste a link to your video (or type a filename)");
              if (!ref) return;
              try {
                await beau.submitVideo(videos[0].id, ref, sessionId, null);
                setSent(true);
              } catch { /* surfaced on the next load */ }
            }}
          >
            <FiVideo size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Send a video
          </button>
        </div>
      )}
      {sent && <p style={{ ...ui.muted, marginTop: 14, color: "#16A34A" }}>Video sent. Thank you.</p>}

      <button style={{ ...ui.primary, marginTop: 22 }} onClick={onHome}>Back to today</button>
    </div>
  );
}

function MessageScreen({ busy, onSend, onCancel }) {
  const [text, setText] = useState("");
  return (
    <div style={ui.card}>
      <h2 style={{ fontSize: 19, margin: 0 }}>Message your clinic</h2>
      <p style={{ ...ui.muted, marginTop: 6 }}>
        This is added to your dog's records. For anything urgent, phone the clinic.
      </p>
      <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What would you like them to know?"
        style={{
          width: "100%", marginTop: 12, padding: 12, fontSize: 15,
          border: "1px solid #D6DEE6", borderRadius: 10, resize: "vertical",
        }}
      />
      <button
        style={{ ...ui.primary, marginTop: 14, opacity: !text.trim() || busy ? 0.5 : 1 }}
        disabled={!text.trim() || busy}
        onClick={() => onSend(text.trim())}
      >
        Send
      </button>
      <button style={{ ...ui.secondary, marginTop: 8 }} onClick={onCancel}>Cancel</button>
    </div>
  );
}

function Banner({ tone, children, onDismiss }) {
  const colour = tone === "error" ? { bg: "#FEF2F2", border: "#FCA5A5", fg: "#DC2626" }
    : { bg: "#F0FDF4", border: "#86EFAC", fg: "#16A34A" };
  return (
    <div style={{
      display: "flex", gap: 10, padding: 14, borderRadius: 12, marginBottom: 14,
      background: colour.bg, border: `1px solid ${colour.border}`, fontSize: 14,
    }}>
      <div style={{ flex: 1, color: colour.fg }}>{children}</div>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", cursor: "pointer",
        color: colour.fg, fontSize: 18, lineHeight: 1,
      }}>×</button>
    </div>
  );
}
