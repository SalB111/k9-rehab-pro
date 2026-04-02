import React, { useState } from "react";

export default function LoginView({ onLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await onLogin(username, password);
    if (!res.success) {
      setError(res.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0C2340]">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C2340] via-[#0F3460] to-[#164E80]" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="relative">
              <img src="/logo512.png" alt="" className="w-10 h-10" />
              <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#1D9E75]/20 animate-pulse" />
            </div>
            <div>
              <h1 className="font-logo text-lg font-black tracking-[3px] text-white">K9 REHAB PRO</h1>
              <div className="h-[2px] w-full bg-gradient-to-r from-[#1D9E75] via-[#0EA5E9] to-transparent mt-1" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl font-bold text-white leading-tight mb-4 font-sans">
            Evidence-Based<br />
            <span className="text-[#1D9E75]">Rehabilitation Intelligence</span>
          </h2>
          <p className="text-[#7AAACF] text-lg leading-relaxed max-w-md">
            The clinical decision-support platform for veterinary rehabilitation professionals.
            Canine & feline protocols powered by B.E.A.U.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { value: "223", label: "Evidence-Based Exercises" },
              { value: "18", label: "Clinical Categories" },
              { value: "4", label: "Protocol Engines" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white font-brand">{stat.value}</div>
                <div className="text-[11px] text-[#7AAACF] mt-1 tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — CDSS Notice */}
        <div className="relative z-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1D9E75]/40 to-transparent mb-6" />
          <p className="text-[10px] text-[#7AAACF]/60 leading-relaxed max-w-md">
            Clinical Decision-Support System (CDSS). Does not establish VCPR, provide diagnosis,
            or prescribe medication. All protocols require licensed veterinarian review.
          </p>
          <p className="text-[10px] text-[#7AAACF]/40 mt-2">
            &copy; 2026 K9 Rehab Pro&trade; &middot; Salvatore Bonanno &middot; All rights reserved
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F8FD] lg:rounded-l-[40px] relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2 lg:hidden">
          <img src="/logo512.png" alt="" className="w-7 h-7" />
          <span className="font-logo text-sm font-black tracking-[2px] text-[#0C2340]">K9 REHAB PRO</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-[#0C2340] mb-1">Welcome back</h2>
          <p className="text-sm text-[#7AAACF] mb-8">Sign in to your clinical workspace</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-[#2E5F8A] tracking-wider uppercase mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg border border-[#B5D4F4] bg-white text-[#0C2340] text-sm font-medium
                  placeholder:text-[#B0B8C4] placeholder:font-normal
                  focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]
                  transition-all"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#2E5F8A] tracking-wider uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg border border-[#B5D4F4] bg-white text-[#0C2340] text-sm font-medium
                  placeholder:text-[#B0B8C4] placeholder:font-normal
                  focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]
                  transition-all"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#1D9E75] to-[#0EA5E9]
                text-white text-sm font-bold tracking-wide
                hover:shadow-lg hover:shadow-[#1D9E75]/25
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-[#7AAACF]">Need an account? </span>
            <button
              onClick={onRegister}
              className="text-sm font-semibold text-[#1D9E75] hover:text-[#0F6E56] transition-colors"
            >
              Contact Administrator
            </button>
          </div>

          {/* B.E.A.U. badge */}
          <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-[#7AAACF]/60">
            <span>Powered by</span>
            <span className="font-brand font-bold tracking-wider text-[#2E5F8A]">B.E.A.U.</span>
            <span>&middot; Biomedical Evidence-Based Analytical Unit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
