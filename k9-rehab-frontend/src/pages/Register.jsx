import React, { useState } from "react";
import { register } from "../services/authService";

export default function Register() {
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
      setSuccess("Account created successfully!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Unable to create account");
    }
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="USERNAME"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          name="password"
          id="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">CREATE ACCOUNT</button>
      </form>

      <a href="/login">Already have an account? Sign In</a>
    </div>
  );
}