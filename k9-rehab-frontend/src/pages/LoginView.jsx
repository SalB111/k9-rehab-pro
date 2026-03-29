import React, { useState } from "react";
import "./LoginView.css";

export default function LoginView({ onLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await onLogin(username, password);

      if (!result.success) {
        setError(result.message || "Login failed");
        return;
      }

    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sign In</h2>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>USERNAME</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <label>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button type="submit" className="login-button">
            SIGN IN
          </button>
        </form>

        <div className="register-link">
          Need an account?{" "}
          <span onClick={() => onRegister()} className="link">
            Create Account
          </span>
        </div>
      </div>
    </div>
  );
}