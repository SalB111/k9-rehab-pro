import React, { useState } from "react";
import { login } from "../services/authService";
import { useTr } from "../i18n/useTr";

export default function Login() {
  const tr = useTr();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(username, password);
      console.log("Login success:", res.data);

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login failed:", err);
      setError(tr("Invalid username or password"));
    }
  };

  return (
    <div className="login-container">
      <h2>{tr("Sign In")}</h2>

      {error && <div className="error-box">{error}</div>}

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

        <button type="submit">{tr("SIGN IN")}</button>
      </form>

      <a href="/register">{tr("Need an account? Create Account")}</a>
    </div>
  );
}