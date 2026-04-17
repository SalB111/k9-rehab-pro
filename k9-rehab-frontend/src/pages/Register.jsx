import React, { useState } from "react";
import { register } from "../services/authService";
import { useTr } from "../i18n/useTr";

export default function Register() {
  const tr = useTr();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await register(username, password);
      setSuccess(tr("Account created successfully!"));
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(tr("Unable to create account"));
    }
  };

  return (
    <div className="register-container">
      <h2>{tr("Create Account")}</h2>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          id="username"
          placeholder={tr("USERNAME")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          name="password"
          id="password"
          placeholder={tr("PASSWORD")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{tr("CREATE ACCOUNT")}</button>
      </form>

      <a href="/login">{tr("Already have an account? Sign In")}</a>
    </div>
  );
}