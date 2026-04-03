import { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://k9-rehab-pro-production.up.railway.app/api";

// ── Breed lists ──
const CANINE_BREEDS = [
  "Akita","Australian Cattle Dog","Australian Shepherd","Basset Hound","Beagle",
  "Belgian Malinois","Bernese Mountain Dog","Bichon Frise","Bloodhound","Border Collie",
  "Boston Terrier","Boxer","Brittany","Bulldog","Cane Corso",
  "Cavalier King Charles Spaniel","Chesapeake Bay Retriever","Chihuahua","Cocker Spaniel","Collie",
  "Dachshund","Doberman Pinscher","English Springer Spaniel","French Bulldog",
  "German Shepherd","German Shorthaired Pointer","Golden Retriever","Great Dane","Greyhound",
  "Havanese","Irish Setter","Jack Russell Terrier","Labrador Retriever","Maltese",
  "Mastiff","Miniature American Shepherd","Miniature Schnauzer","Newfoundland",
  "Pembroke Welsh Corgi","Pit Bull Terrier","Pomeranian","Poodle (Miniature)","Poodle (Standard)",
  "Rhodesian Ridgeback","Rottweiler","Saint Bernard","Shetland Sheepdog","Shih Tzu",
  "Siberian Husky","Staffordshire Bull Terrier","Vizsla","Weimaraner",
  "West Highland White Terrier","Yorkshire Terrier","Mixed Breed / Other",
];

const FELINE_BREEDS = [
  "Abyssinian","American Shorthair","Bengal","Birman","British Shorthair","Burmese",
  "Chartreux","Devon Rex","Egyptian Mau","Himalayan","Maine Coon","Manx",
  "Norwegian Forest Cat","Ocicat","Persian","Ragdoll","Russian Blue","Scottish Fold",
  "Siamese","Siberian","Sphynx","Tonkinese","Turkish Angora","Turkish Van",
  "Domestic Shorthair (DSH)","Domestic Longhair (DLH)","Domestic Medium Hair (DMH)",
  "Mixed Breed / Other",
];

// ── Household equipment options ──
const HOME_EQUIPMENT = [
  "Towels (rolled)", "Pillows / cushions", "Couch / sofa", "Stairs (indoor)",
  "Non-slip mat / yoga mat", "Tennis ball / toys", "Leash", "Harness / sling",
  "Treats / food rewards", "Ramp (makeshift)", "Blankets", "Laundry basket",
  "Broomstick / PVC pipe", "Books (for step-overs)", "Chair / stool",
];

const CANINE_CONDITIONS = [
  "Post-surgery recovery (TPLO, ACL, etc.)",
  "Hip dysplasia", "Arthritis / joint stiffness",
  "Back injury / IVDD", "Limping / lameness",
  "Senior dog mobility issues", "Weight management",
  "General fitness / conditioning", "Muscle weakness",
  "Balance problems", "Elbow dysplasia", "Soft tissue injury",
  "Patellar luxation", "Other",
];

const FELINE_CONDITIONS = [
  "Post-surgery recovery (FHO, fracture, amputation)",
  "Degenerative joint disease (DJD / arthritis)",
  "Back injury / IVDD", "Limping / lameness",
  "Senior cat mobility issues", "Weight management",
  "General fitness / conditioning", "Muscle weakness",
  "Balance problems / vestibular", "Aortic thromboembolism recovery",
  "Post-amputation adaptation", "Other",
];

import WelcomeSplash from "./WelcomeSplash";

function App() {
  const [view, setView] = useState("splash"); // splash → intake → chat
  const [pet, setPet] = useState({ name: "", species: "canine", breed: "", age: "", weight: "", condition: "", details: "", equipment: [] });
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState("");
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, stream]);

  // ── Build owner-safe system context ──
  function buildPetContext() {
    const speciesLabel = pet.species === "feline" ? "cat" : "dog";
    return `The pet owner has provided this information about their ${speciesLabel}:
- Name: ${pet.name || "Not provided"}
- Species: ${pet.species === "feline" ? "Feline (cat)" : "Canine (dog)"}
- Breed: ${pet.breed || "Not specified"}
- Age: ${pet.age || "Unknown"} years
- Weight: ${pet.weight || "Unknown"} ${pet.species === "feline" ? "lbs" : "lbs"}
- Condition: ${pet.condition || "Not specified"}
- Details: ${pet.details || "None"}
- Equipment at home: ${pet.equipment.length > 0 ? pet.equipment.join(", ") : "Basic household items only"}

CRITICAL RULES FOR THIS CONVERSATION:
- You are speaking to a PET OWNER, not a veterinary professional.
- The patient is a ${speciesLabel.toUpperCase()}. ${pet.species === "feline" ? "Use feline-specific exercises from the K9 Rehab Pro feline library (FELINE_* codes). Cats require fear-free, consent-based, low-stress handling. Sessions should be shorter (2-5 minutes). Use wand toys and treats for motivation. Monitor respiratory effort." : "Use canine exercises appropriate for home settings."}
- Use simple, clear language. No clinical jargon.
- Only suggest exercises that are SAFE for home use with household items.
- Always include clear safety warnings and when to stop.
- Every response must include: "If your ${speciesLabel} shows signs of pain, stops the exercise, or you're unsure, contact your veterinarian immediately."
- Never diagnose. Never prescribe medication. Never replace veterinary care.
- Be warm, encouraging, and reassuring.
- Focus on gentle, conservative exercises appropriate for home.
- Reference real exercises from the K9 Rehab Pro evidence-based library.`;
  }

  // ── Send chat message ──
  async function send(txt) {
    const t = txt || input.trim();
    if (!t || loading) return;
    setInput("");
    setLoading(true);
    setStream("");

    const newMsgs = [...msgs, { role: "user", content: t }];
    setMsgs(newMsgs);

    // Inject pet context into first message
    const systemContext = newMsgs.length <= 1 ? buildPetContext() + "\n\nOwner's question: " + t : t;
    const apiMessages = newMsgs.length <= 1
      ? [{ role: "user", content: systemContext }]
      : newMsgs.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${API}/beau/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          patient: {
            name: pet.name,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            condition: pet.condition,
            notes: `HOME EXERCISE PROGRAM. Equipment: ${pet.equipment.join(", ")}. Owner details: ${pet.details}`,
          },
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.type === "delta" && d.text) {
                full += d.text;
                setStream(full);
              }
            } catch {}
          }
        }
      }
      setStream("");
      setMsgs([...newMsgs, { role: "assistant", content: full }]);
    } catch {
      setStream("");
      setMsgs(p => [...p, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    }
    setLoading(false);
  }

  // ── Simple markdown renderer ──
  function renderMd(t) {
    if (!t) return "";
    let h = "";
    let code = false;
    for (const raw of t.split("\n")) {
      if (raw.startsWith("```")) { h += code ? "</pre>" : '<pre class="bg-navy/5 border border-border rounded-lg p-3 my-2 text-xs overflow-x-auto">'; code = !code; continue; }
      if (code) { h += esc(raw) + "\n"; continue; }
      const ln = esc(raw);
      if (ln.startsWith("### ")) { h += `<h4 class="text-teal font-bold mt-3 mb-1 text-sm">${ln.slice(4)}</h4>`; continue; }
      if (ln.startsWith("## ")) { h += `<h3 class="text-navy font-bold mt-4 mb-1 text-base">${ln.slice(3)}</h3>`; continue; }
      if (ln.startsWith("# ")) { h += `<h2 class="text-navy font-bold mt-4 mb-2 text-lg">${ln.slice(2)}</h2>`; continue; }
      let l = ln.replace(/\*\*(.*?)\*\*/g, '<strong class="text-navy">$1</strong>');
      l = l.replace(/\*(.*?)\*/g, '<em class="text-text-light">$1</em>');
      l = l.replace(/`([^`]+)`/g, '<code class="bg-navy/5 px-1 rounded text-xs text-teal">$1</code>');
      if (l.match(/^[-•]\s/)) { h += `<div class="ml-4 my-0.5 leading-relaxed">• ${l.replace(/^[-•]\s/, "")}</div>`; continue; }
      if (l.match(/^\d+\.\s/)) { h += `<div class="ml-4 my-0.5 leading-relaxed">${l}</div>`; continue; }
      if (l.trim()) h += `<p class="my-1 leading-relaxed">${l}</p>`;
    }
    if (code) h += "</pre>";
    return h;
  }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  // ═══════════════════════════════════════════════════════
  // CINEMATIC SPLASH
  // ═══════════════════════════════════════════════════════
  if (view === "splash") {
    return <WelcomeSplash onEnter={() => setView("intake")} />;
  }

  // ═══════════════════════════════════════════════════════
  // PET INTAKE FORM
  // ═══════════════════════════════════════════════════════
  if (view === "intake") {
    return (
      <div className="min-h-screen bg-bg p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🐾</span>
            <div>
              <h1 className="text-xl font-bold text-navy">Tell us about your {pet.species === "feline" ? "cat" : "dog"}</h1>
              <p className="text-sm text-text-light">This helps B.E.A.U. recommend safe exercises</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
            {/* Species toggle */}
            <div>
              <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Species *</label>
              <div className="flex gap-0 rounded-xl overflow-hidden border border-border">
                {[
                  { key: "canine", label: "🐕 Dog", emoji: "🐕" },
                  { key: "feline", label: "🐈 Cat", emoji: "🐈" },
                ].map(sp => (
                  <button key={sp.key} type="button"
                    onClick={() => setPet(p => ({ ...p, species: sp.key, condition: "", breed: "" }))}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${
                      pet.species === sp.key
                        ? "bg-teal text-white"
                        : "bg-bg text-text-light hover:bg-teal/5"
                    }`}>
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">{pet.species === "feline" ? "Cat's" : "Dog's"} Name *</label>
                <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  value={pet.name} onChange={e => setPet({ ...pet, name: e.target.value })} placeholder="e.g. Max" />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Breed</label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  value={pet.breed} onChange={e => setPet({ ...pet, breed: e.target.value })}>
                  <option value="">Select breed...</option>
                  {(pet.species === "feline" ? FELINE_BREEDS : CANINE_BREEDS).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Age (years)</label>
                <input type="number" className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  value={pet.age} onChange={e => setPet({ ...pet, age: e.target.value })} placeholder="e.g. 7" />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Weight (lbs)</label>
                <input type="number" className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  value={pet.weight} onChange={e => setPet({ ...pet, weight: e.target.value })} placeholder="e.g. 65" />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">What's going on with your {pet.species === "feline" ? "cat" : "dog"}? *</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                value={pet.condition} onChange={e => setPet({ ...pet, condition: e.target.value })}>
                <option value="">Select a condition...</option>
                {(pet.species === "feline" ? FELINE_CONDITIONS : CANINE_CONDITIONS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Tell us more (optional)</label>
              <textarea className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
                rows={3} value={pet.details} onChange={e => setPet({ ...pet, details: e.target.value })}
                placeholder="e.g. Had TPLO surgery 4 weeks ago, still limping slightly on left back leg..." />
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">What do you have at home? (select all)</label>
              <div className="flex flex-wrap gap-2">
                {HOME_EQUIPMENT.map(item => {
                  const selected = pet.equipment.includes(item);
                  return (
                    <button key={item} type="button"
                      onClick={() => setPet(p => ({
                        ...p,
                        equipment: selected ? p.equipment.filter(e => e !== item) : [...p.equipment, item],
                      }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? "bg-teal text-white border-teal"
                          : "bg-bg text-text-light border-border hover:border-teal/50"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Safety notice */}
            <div className="bg-amber/5 border border-amber/20 rounded-lg p-3">
              <p className="text-xs text-amber font-medium">
                ⚠️ B.E.A.U. AI Home provides general exercise guidance only. It does not diagnose conditions
                or replace veterinary care. Always follow your veterinarian's instructions.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setView("intake")}
                className="px-5 py-2.5 rounded-lg border border-border text-sm text-text-light hover:bg-bg transition-all">
                Back
              </button>
              <button
                onClick={() => { if (pet.name && pet.condition) setView("chat"); }}
                disabled={!pet.name || !pet.condition}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-teal to-blue text-white font-bold text-sm
                  disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal/20 transition-all"
              >
                Start Chatting with B.E.A.U. →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // CHAT VIEW
  // ═══════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Header */}
      <div className="bg-navy text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🐾</span>
          <div>
            <div className="text-sm font-bold">B.E.A.U. AI Home</div>
            <div className="text-[10px] text-text-light">
              {pet.name} &middot; {pet.condition}
            </div>
          </div>
        </div>
        <button onClick={() => { setView("intake"); setMsgs([]); setStream(""); }}
          className="text-xs text-text-light hover:text-white border border-white/20 rounded-lg px-3 py-1.5 transition-all">
          New Session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Welcome message */}
        {msgs.length === 0 && !loading && (
          <div className="max-w-lg mx-auto text-center py-8 animate-[fadeIn_0.5s_ease]">
            <div className="text-4xl mb-3">🐾</div>
            <h2 className="text-lg font-bold text-navy mb-2">Hi! I'm B.E.A.U.</h2>
            <p className="text-sm text-text-light mb-6 leading-relaxed">
              I'll help you find safe home exercises for <strong className="text-navy">{pet.name}</strong>.
              Ask me anything about home rehabilitation!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                `What home exercises are safe for ${pet.name}?`,
                `How can I help ${pet.name} with ${pet.condition}?`,
                `What exercises can I do with just ${pet.species === "feline" ? "wand toys and treats" : "towels and treats"}?`,
                `How do I know if my ${pet.species === "feline" ? "cat" : "dog"} is in pain during exercise?`,
              ].map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-left text-xs p-3 bg-surface border border-border rounded-lg hover:border-teal/50 hover:bg-teal/5 transition-all text-text-light">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-gradient-to-br from-navy to-navy-mid text-white rounded-br-sm"
                : "bg-surface border border-border text-text rounded-bl-sm"
            }`}>
              {m.role === "assistant"
                ? <div dangerouslySetInnerHTML={{ __html: renderMd(m.content) }} />
                : m.content
              }
            </div>
          </div>
        ))}

        {/* Streaming */}
        {stream && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-surface border border-border text-sm leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: renderMd(stream) }} />
              <span className="inline-block w-1 h-3.5 bg-teal ml-0.5 animate-[blink_0.6s_step-end_infinite] align-text-bottom rounded-sm" />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !stream && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-surface border border-border flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-teal rounded-full animate-[pulse_1.2s_ease_infinite]"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface p-3 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea ref={taRef}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
              placeholder:text-text-light/50"
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Ask about home exercises for ${pet.name} (${pet.species === "feline" ? "cat" : "dog"})...`}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-teal text-white rounded-xl font-bold text-sm
              disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal/90 transition-all shrink-0">
            Send
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[9px] text-text-light/40">
            B.E.A.U. AI Home &middot; Not a substitute for veterinary care &middot; &copy; 2025-2026 Salvatore Bonanno
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
