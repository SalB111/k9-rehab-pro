import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

// ─── Constants ──────────────────────────────────────────────────────────────
const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/beau/chat`;

const SIDEBAR_TABS = [
  { key: "plan", label: "Plan", icon: "📋" },
  { key: "progress", label: "Progress", icon: "📈" },
  { key: "guide", label: "Guide", icon: "📖" },
  { key: "suggest", label: "Suggest", icon: "💡" },
];

const SPECIES_OPTIONS = ["Dog", "Cat"];
const SIZE_OPTIONS = ["Small (<20 lbs)", "Medium (20–50 lbs)", "Large (50–90 lbs)", "Giant (90+ lbs)"];
const CONDITION_OPTIONS = [
  "Post-TPLO / CCL Surgery",
  "IVDD (Intervertebral Disc Disease)",
  "Osteoarthritis",
  "Hip Dysplasia",
  "Luxating Patella (post-op)",
  "Fracture Recovery",
  "Geriatric Mobility",
  "Obesity / Weight Management",
  "General Deconditioning",
  "Soft Tissue Injury",
  "Other",
];
const MOBILITY_OPTIONS = [
  "Normal — moves freely",
  "Mild — slight limp, mostly mobile",
  "Moderate — noticeable limp, avoids some activity",
  "Severe — reluctant to walk, needs support",
  "Non-ambulatory — cannot walk unassisted",
];
const PAIN_OPTIONS = ["0 — No pain", "1–2 — Mild", "3–4 — Moderate", "5–6 — Significant", "7–8 — Severe", "9–10 — Extreme"];
const EQUIPMENT_OPTIONS = [
  "None",
  "Cavaletti rails",
  "Balance disc / wobble board",
  "Physio ball",
  "Resistance band",
  "Ramp / stairs",
  "Underwater treadmill (clinic access)",
  "Therapy pool (clinic access)",
];

// ─── System Prompt Builder ──────────────────────────────────────────────────
function buildSystemPrompt(intake) {
  const {
    petName, species, breed, age, weight, size,
    condition, conditionOther, surgery, surgeryDate, surgeryWeeksAgo,
    mobility, painLevel, vetName, medications,
    equipment, goals, additionalNotes,
  } = intake;

  const conditionText = condition === "Other" ? conditionOther : condition;
  const surgeryInfo = surgery
    ? `Surgery: Yes — ${surgeryDate ? `Date: ${surgeryDate}` : "date not provided"}${surgeryWeeksAgo ? `, approximately ${surgeryWeeksAgo} weeks ago` : ""}.`
    : "Surgery: No recent surgery reported.";
  const equipmentList = (equipment || []).filter(Boolean).join(", ") || "None specified";
  const goalsList = goals || "General recovery and improved mobility";

  return `You are B.E.A.U. (Biomedical Evidence-Based Assessment Utility) — Home Edition.

You are a warm, knowledgeable, and encouraging virtual rehabilitation guide for pet owners managing their pet's recovery at home. You were created by Salvatore Bonanno, a Certified Canine Rehabilitation Nurse with 30 years of veterinary experience.

IMPORTANT SCOPE RULES — you MUST follow these:
- You are a HOME REHABILITATION GUIDE, not a veterinarian.
- You NEVER diagnose conditions, prescribe medications, or replace veterinary care.
- You provide gentle at-home exercises, lifestyle modifications, and recovery guidance.
- If the owner describes symptoms that suggest an emergency (sudden paralysis, uncontrolled bleeding, seizures, respiratory distress, extreme pain), you MUST tell them to contact their veterinarian or emergency clinic IMMEDIATELY and stop providing exercise guidance.
- If pain is reported as 7+ out of 10, advise the owner to consult their veterinarian before continuing exercises.
- Always remind the owner that your suggestions should be confirmed by their veterinarian.

PATIENT PROFILE:
- Name: ${petName || "Not provided"}
- Species: ${species || "Dog"}
- Breed: ${breed || "Not specified"}
- Age: ${age || "Unknown"}
- Weight: ${weight || "Unknown"}${size ? ` (${size})` : ""}
- Condition: ${conditionText || "Not specified"}
- ${surgeryInfo}
- Current Mobility: ${mobility || "Not assessed"}
- Pain Level: ${painLevel || "Not assessed"}
- Veterinarian: ${vetName || "Not specified"}
- Current Medications: ${medications || "None reported"}
- Available Equipment: ${equipmentList}
- Owner Goals: ${goalsList}
- Additional Notes: ${additionalNotes || "None"}

COMMUNICATION STYLE:
- Speak warmly and encouragingly, like a trusted rehabilitation nurse talking to a pet parent.
- Use plain language — avoid heavy medical jargon unless asked.
- Be specific with exercises: describe body position, duration, repetitions, and frequency.
- Organize responses with clear sections and bullet points when listing exercises.
- Always include safety cues (what to watch for, when to stop).
- When suggesting exercises, note the difficulty level (gentle / moderate / active).
- Celebrate small wins and encourage consistency.

RESPONSE STRUCTURE (when providing exercise plans):
1. Warm greeting referencing the pet by name
2. Brief context acknowledgment
3. Exercise recommendations (with clear instructions)
4. Safety reminders
5. Encouragement and next-step suggestion

If this is the first message, introduce yourself warmly, acknowledge the patient profile, and ask if the owner is ready to get started with a home exercise plan.`;
}

// ─── Auth Modal ─────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose, onSwitch, onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && !name) {
      setError("Name is required.");
      return;
    }
    // Simulate auth — in production this hits a real endpoint
    onAuth({ email, name: name || email.split("@")[0], mode });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">
          &times;
        </button>
        <h2 className="text-2xl font-bold text-[#0F4C81] mb-1">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {mode === "login"
            ? "Sign in to save your pet's progress"
            : "Join B.E.A.U. Home to track your pet's recovery"}
        </p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent outline-none"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0F4C81] text-white font-semibold py-2.5 rounded-lg hover:bg-[#0d3f6b] transition-colors"
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={onSwitch} className="text-[#0EA5E9] font-medium hover:underline">
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Intake Form ────────────────────────────────────────────────────────────
function IntakeForm({ onSubmit }) {
  const [form, setForm] = useState({
    petName: "",
    species: "Dog",
    breed: "",
    age: "",
    weight: "",
    size: "",
    condition: "",
    conditionOther: "",
    surgery: false,
    surgeryDate: "",
    surgeryWeeksAgo: "",
    mobility: "",
    painLevel: "",
    vetName: "",
    medications: "",
    equipment: [],
    goals: "",
    additionalNotes: "",
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleEquipment(item) {
    setForm((prev) => {
      const eq = prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item];
      return { ...prev, equipment: eq };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.petName.trim()) return;
    onSubmit(form);
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent outline-none bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🐾</div>
        <h1 className="text-3xl font-bold text-[#0F4C81]">B.E.A.U. Home</h1>
        <p className="text-gray-500 mt-2">
          Your pet's personalized rehabilitation guide — powered by 30 years of clinical expertise.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
        <h2 className="text-lg font-semibold text-[#0F4C81] border-b pb-3">Patient Intake</h2>

        {/* Row 1: Name, Species, Breed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Pet Name *</label>
            <input className={inputCls} value={form.petName} onChange={(e) => update("petName", e.target.value)} placeholder="e.g. Beau" required />
          </div>
          <div>
            <label className={labelCls}>Species</label>
            <select className={inputCls} value={form.species} onChange={(e) => update("species", e.target.value)}>
              {SPECIES_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Breed</label>
            <input className={inputCls} value={form.breed} onChange={(e) => update("breed", e.target.value)} placeholder="e.g. Golden Retriever" />
          </div>
        </div>

        {/* Row 2: Age, Weight, Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Age</label>
            <input className={inputCls} value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="e.g. 7 years" />
          </div>
          <div>
            <label className={labelCls}>Weight</label>
            <input className={inputCls} value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="e.g. 65 lbs" />
          </div>
          <div>
            <label className={labelCls}>Size</label>
            <select className={inputCls} value={form.size} onChange={(e) => update("size", e.target.value)}>
              <option value="">Select size...</option>
              {SIZE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className={labelCls}>Primary Condition</label>
          <select className={inputCls} value={form.condition} onChange={(e) => update("condition", e.target.value)}>
            <option value="">Select condition...</option>
            {CONDITION_OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
          {form.condition === "Other" && (
            <input className={`${inputCls} mt-2`} value={form.conditionOther} onChange={(e) => update("conditionOther", e.target.value)} placeholder="Describe the condition..." />
          )}
        </div>

        {/* Surgery */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.surgery} onChange={(e) => update("surgery", e.target.checked)} className="rounded border-gray-300 text-[#0EA5E9] focus:ring-[#0EA5E9]" />
            Recent surgery
          </label>
          {form.surgery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className={labelCls}>Surgery Date</label>
                <input type="date" className={inputCls} value={form.surgeryDate} onChange={(e) => update("surgeryDate", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Weeks Since Surgery</label>
                <input type="number" className={inputCls} value={form.surgeryWeeksAgo} onChange={(e) => update("surgeryWeeksAgo", e.target.value)} placeholder="e.g. 4" />
              </div>
            </div>
          )}
        </div>

        {/* Mobility & Pain */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Current Mobility</label>
            <select className={inputCls} value={form.mobility} onChange={(e) => update("mobility", e.target.value)}>
              <option value="">Select...</option>
              {MOBILITY_OPTIONS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Pain Level</label>
            <select className={inputCls} value={form.painLevel} onChange={(e) => update("painLevel", e.target.value)}>
              <option value="">Select...</option>
              {PAIN_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Vet & Meds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Veterinarian Name</label>
            <input className={inputCls} value={form.vetName} onChange={(e) => update("vetName", e.target.value)} placeholder="e.g. Dr. Smith" />
          </div>
          <div>
            <label className={labelCls}>Current Medications</label>
            <input className={inputCls} value={form.medications} onChange={(e) => update("medications", e.target.value)} placeholder="e.g. Carprofen, Gabapentin" />
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className={labelCls}>Available Equipment</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => toggleEquipment(eq)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.equipment.includes(eq)
                    ? "bg-[#0EA5E9] text-white border-[#0EA5E9]"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#0EA5E9]"
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Goals & Notes */}
        <div>
          <label className={labelCls}>Recovery Goals</label>
          <textarea className={`${inputCls} h-20 resize-none`} value={form.goals} onChange={(e) => update("goals", e.target.value)} placeholder="e.g. Return to walking 30 minutes daily, climb stairs again..." />
        </div>
        <div>
          <label className={labelCls}>Additional Notes</label>
          <textarea className={`${inputCls} h-20 resize-none`} value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} placeholder="Anything else B.E.A.U. should know..." />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0F4C81] text-white font-semibold py-3 rounded-xl hover:bg-[#0d3f6b] transition-colors text-base"
        >
          Start B.E.A.U. Home Session
        </button>

        <p className="text-xs text-center text-gray-400 mt-2">
          B.E.A.U. Home is a rehabilitation guide — not a substitute for veterinary care.
          Always consult your veterinarian before starting any exercise program.
        </p>
      </form>
    </div>
  );
}

// ─── Chat Message ───────────────────────────────────────────────────────────
function ChatMessage({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && <div className="w-8 h-8 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0 mt-1">B</div>}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[#0F4C81] text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

// ─── Sidebar Panel ──────────────────────────────────────────────────────────
function SidebarPanel({ activeTab, intake, messages }) {
  const petName = intake?.petName || "your pet";

  if (activeTab === "plan") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-[#0F4C81]">Recovery Plan</h3>
        <p className="text-sm text-gray-600">
          {intake?.condition
            ? `Active plan for ${petName} — ${intake.condition === "Other" ? intake.conditionOther : intake.condition}`
            : "Complete the intake form to generate a plan."}
        </p>
        {intake?.condition && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-800 mb-1">Phase</p>
              <p className="text-sm text-blue-700">Home Recovery — Active</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
              <p className="text-xs font-medium text-green-800 mb-1">Focus</p>
              <p className="text-sm text-green-700">Gentle mobilization & comfort</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-800 mb-1">Frequency</p>
              <p className="text-sm text-amber-700">Ask B.E.A.U. for your schedule</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "progress") {
    const sessionCount = messages.filter((m) => m.role === "user").length;
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-[#0F4C81]">Progress Tracker</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#0F4C81]">{sessionCount}</p>
            <p className="text-xs text-gray-500">Questions Asked</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#10B981]">1</p>
            <p className="text-xs text-gray-500">Sessions</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Sign in to save progress across sessions and track {petName}'s recovery over time.
        </p>
      </div>
    );
  }

  if (activeTab === "guide") {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-[#0F4C81]">Quick Guide</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            <span className="text-lg">🐾</span>
            <div>
              <p className="font-medium text-gray-700">Getting Started</p>
              <p className="text-gray-500 text-xs">Ask B.E.A.U. for a daily exercise plan based on your pet's condition.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-lg">⚡</span>
            <div>
              <p className="font-medium text-gray-700">Exercise Tips</p>
              <p className="text-gray-500 text-xs">Ask about proper form, duration, or modifications for specific exercises.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-lg">🚨</span>
            <div>
              <p className="font-medium text-gray-700">When to Stop</p>
              <p className="text-gray-500 text-xs">If your pet shows signs of pain, limping, or reluctance — stop and rest.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-lg">📞</span>
            <div>
              <p className="font-medium text-gray-700">Call Your Vet</p>
              <p className="text-gray-500 text-xs">For sudden changes, worsening symptoms, or any concerns — always consult your vet.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "suggest") {
    const suggestions = [
      `What gentle exercises can I do with ${petName} today?`,
      `How do I know if ${petName} is in too much pain to exercise?`,
      `Can you give me a weekly schedule for ${petName}?`,
      `What signs of improvement should I look for?`,
      `How should I modify exercises if ${petName} seems tired?`,
      `What warm-up should I do before exercises?`,
    ];
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-[#0F4C81]">Suggested Questions</h3>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="w-full text-left text-sm px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-[#0EA5E9]/10 text-gray-700 hover:text-[#0F4C81] transition-colors border border-transparent hover:border-[#0EA5E9]/30"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BeauHomeView({ setView }) {
  const { i18n: i18nInst } = useTranslation();
  const [intake, setIntake] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("plan");
  const [showAuth, setShowAuth] = useState(null); // null | "login" | "signup"
  const [user, setUser] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input after intake
  useEffect(() => {
    if (intake && inputRef.current) inputRef.current.focus();
  }, [intake]);

  // Send initial greeting after intake
  const handleIntakeSubmit = useCallback(async (formData) => {
    setIntake(formData);
    const systemPrompt = buildSystemPrompt(formData);
    const initialMessages = [{ role: "user", content: `Hi B.E.A.U.! I just filled out ${formData.petName}'s intake form. Can you introduce yourself and help us get started?` }];

    setMessages([{ role: "user", text: initialMessages[0].content }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: initialMessages, system: systemPrompt, language: i18nInst.language || "en" }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "I'm sorry — I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a chat message
  async function handleSend(e) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", text: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    // Build API messages array (convert text → content)
    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: apiMessages,
          system: buildSystemPrompt(intake),
          language: i18nInst.language || "en",
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "I'm sorry — something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAuth({ email, name, mode }) {
    setUser({ email, name });
    setShowAuth(null);
  }

  // ─── Intake Screen ─────────────────────────────────────────────────────
  if (!intake) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] to-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-white/80 backdrop-blur-sm">
          <button onClick={() => setView("dashboard")} className="text-sm text-gray-500 hover:text-[#0F4C81] transition-colors">
            &larr; Back to K9 Rehab Pro
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="text-sm text-gray-600">
                Hi, <strong>{user.name}</strong>
              </span>
            ) : (
              <>
                <button onClick={() => setShowAuth("login")} className="text-sm text-[#0EA5E9] font-medium hover:underline">
                  Sign In
                </button>
                <button
                  onClick={() => setShowAuth("signup")}
                  className="text-sm bg-[#0F4C81] text-white px-4 py-1.5 rounded-lg hover:bg-[#0d3f6b] transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
        <IntakeForm onSubmit={handleIntakeSubmit} />
        {showAuth && (
          <AuthModal
            mode={showAuth}
            onClose={() => setShowAuth(null)}
            onSwitch={() => setShowAuth(showAuth === "login" ? "signup" : "login")}
            onAuth={handleAuth}
          />
        )}
      </div>
    );
  }

  // ─── Chat Screen ────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("dashboard")} className="text-gray-400 hover:text-[#0F4C81] transition-colors">
              &larr;
            </button>
            <div className="w-9 h-9 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold text-sm">B</div>
            <div>
              <h1 className="font-semibold text-[#0F4C81] text-sm">B.E.A.U. Home</h1>
              <p className="text-xs text-gray-400">
                Helping {intake.petName} recover{intake.condition ? ` — ${intake.condition === "Other" ? intake.conditionOther : intake.condition}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIntake(null); setMessages([]); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              New Session
            </button>
            {user ? (
              <span className="text-xs text-gray-500">
                {user.name}
              </span>
            ) : (
              <button onClick={() => setShowAuth("login")} className="text-xs text-[#0EA5E9] font-medium hover:underline">
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} text={m.text} />
          ))}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="w-8 h-8 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0">B</div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-6 py-4 border-t bg-white">
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask B.E.A.U. about ${intake.petName}'s recovery...`}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#0F4C81] text-white px-5 py-3 rounded-xl font-medium text-sm hover:bg-[#0d3f6b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            B.E.A.U. Home is a guide, not a veterinarian. Always confirm recommendations with your vet.
          </p>
        </form>
      </div>

      {/* Sidebar */}
      <div className="w-72 border-l bg-white flex flex-col hidden lg:flex">
        {/* Sidebar tabs */}
        <div className="flex border-b">
          {SIDEBAR_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSidebarTab(tab.key)}
              className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                sidebarTab === tab.key
                  ? "text-[#0F4C81] border-b-2 border-[#0F4C81]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="block text-base mb-0.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <SidebarPanel activeTab={sidebarTab} intake={intake} messages={messages} />
        </div>
      </div>

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          mode={showAuth}
          onClose={() => setShowAuth(null)}
          onSwitch={() => setShowAuth(showAuth === "login" ? "signup" : "login")}
          onAuth={handleAuth}
        />
      )}
    </div>
  );
}
