import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiLock, FiAlertTriangle, FiShield } from "react-icons/fi";
import C from "../constants/colors";
import { API } from "../api/axios";

function LoginView({ onLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [credentialType, setCredentialType] = useState("DVM");
  const [credentialNumber, setCredentialNumber] = useState("");
  const [credentialAttested, setCredentialAttested] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    // Check if backend is up and if any users exist
    axios.get(`${API}/auth/status`)
      .then(res => {
        if (res.data && !res.data.has_users) {
          setIsFirstUser(true);
          setIsRegistering(true);
        }
      })
      .catch(() => setServerDown(true));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let result;
    if (isRegistering) {
      result = await onRegister(username, password, displayName || username, {
        credential_type: credentialType,
        credential_number: credentialNumber,
        credential_attested: credentialAttested,
      });
    } else {
      result = await onLogin(username, password);
    }
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${C.navy} 0%, #0F3460 50%, #1a1a2e 100%)`,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Subtle grid overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{ width: 420, zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.teal}, #39FF7E)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "0 0 30px rgba(14,165,233,0.3), 0 0 60px rgba(57,255,126,0.15)",
          }}>
            <FiShield size={28} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', 'Exo 2', sans-serif",
            fontSize: 22, fontWeight: 900, letterSpacing: 3,
            background: "linear-gradient(90deg, #fff 0%, #0EA5E9 50%, #39FF7E 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: 0,
          }}>K9 REHAB PRO{"\u2122"}</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 6, letterSpacing: 1 }}>
            B.E.A.U.{"\u2122"} &mdash; CLINICAL PROTOCOL INTELLIGENCE
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
          padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
          <h2 style={{
            color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 20px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <FiLock size={16} color={C.teal} />
            {isRegistering ? (isFirstUser ? "Create Admin Account" : "Create Account") : "Sign In"}
          </h2>

          {isFirstUser && isRegistering && (
            <div style={{
              background: "rgba(14,165,233,0.15)", border: `1px solid rgba(14,165,233,0.3)`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            }}>
              <p style={{ color: C.teal, fontSize: 12, margin: 0 }}>
                Welcome! Create the first admin account to get started.
              </p>
            </div>
          )}

          {serverDown && (
            <div style={{
              background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            }}>
              <p style={{ color: C.red, fontSize: 12, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <FiAlertTriangle size={14} /> Cannot connect to the K9 Rehab Pro server. Please check your network connection or contact your system administrator.
              </p>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            }}>
              <p style={{ color: C.red, fontSize: 12, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <FiAlertTriangle size={14} /> {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = C.teal}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>

            {isRegistering && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14,
                    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.teal}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                  placeholder="Dr. Smith"
                />
              </div>
            )}

            {isRegistering && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                  CREDENTIAL TYPE
                </label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14,
                    outline: "none", boxSizing: "border-box",
                  }}
                >
                  <option value="DVM" style={{ background: "#1a1a2e" }}>DVM — Doctor of Veterinary Medicine</option>
                  <option value="CCRP" style={{ background: "#1a1a2e" }}>CCRP — Certified Canine Rehab Practitioner</option>
                  <option value="CCRT" style={{ background: "#1a1a2e" }}>CCRT — Certified Canine Rehab Therapist</option>
                  <option value="RVT" style={{ background: "#1a1a2e" }}>RVT — Registered Veterinary Technician</option>
                  <option value="Student" style={{ background: "#1a1a2e" }}>Student / Trainee</option>
                </select>
              </div>
            )}

            {isRegistering && credentialType !== "Student" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                  LICENSE / CREDENTIAL NUMBER
                </label>
                <input
                  type="text"
                  value={credentialNumber}
                  onChange={(e) => setCredentialNumber(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14,
                    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.teal}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                  placeholder="e.g., DVM-12345"
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = C.teal}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                placeholder={isRegistering ? "Minimum 8 characters" : "Enter password"}
                required
                minLength={isRegistering ? 8 : undefined}
              />
            </div>

            {isRegistering && (
              <label style={{
                display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20,
                cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 11, lineHeight: 1.4,
              }}>
                <input
                  type="checkbox"
                  checked={credentialAttested}
                  onChange={(e) => setCredentialAttested(e.target.checked)}
                  style={{ accentColor: C.teal, marginTop: 2, flexShrink: 0 }}
                />
                I attest that my credentials are accurate and I am authorized to use clinical decision-support tools within my scope of practice.
              </label>
            )}

            <button
              type="submit"
              disabled={loading || serverDown || (isRegistering && !credentialAttested)}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                background: `linear-gradient(135deg, ${C.teal}, #39FF7E)`,
                color: C.navy, fontSize: 14, fontWeight: 800, letterSpacing: 1,
                cursor: loading || serverDown ? "not-allowed" : "pointer",
                opacity: loading || serverDown ? 0.5 : 1,
                transition: "all 0.2s",
                boxShadow: "0 4px 20px rgba(14,165,233,0.3)",
              }}
            >
              {loading ? "Please wait..." : isRegistering ? "CREATE ACCOUNT" : "SIGN IN"}
            </button>
          </form>

          {!isFirstUser && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 16 }}>
              {isRegistering ? (
                <span>Already have an account?{" "}
                  <span onClick={() => { setIsRegistering(false); setError(""); }}
                    style={{ color: C.teal, cursor: "pointer", fontWeight: 600 }}>
                    Sign In
                  </span>
                </span>
              ) : (
                <span>Need an account?{" "}
                  <span onClick={() => { setIsRegistering(true); setError(""); }}
                    style={{ color: C.teal, cursor: "pointer", fontWeight: 600 }}>
                    Create Account
                  </span>
                </span>
              )}
            </p>
          )}
        </div>

        {/* Security badge */}
        <div style={{ textAlign: "center", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <FiShield size={12} color="rgba(255,255,255,0.25)" />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: 1 }}>
            SECURE LOGIN
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginView;
