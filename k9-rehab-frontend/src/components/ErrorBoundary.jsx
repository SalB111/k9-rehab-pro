import React from "react";
import C from "../constants/colors";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "60vh", padding: 40, textAlign: "center",
          fontFamily: "'Inter', -apple-system, sans-serif", color: C.text,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u26A0"}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: C.textMid, maxWidth: 420, marginBottom: 24 }}>
            An unexpected error occurred in the application. This has been logged for review.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer",
              background: C.teal, color: "#fff", fontSize: 14, fontWeight: 600,
            }}
          >
            Try Again
          </button>
          {this.state.error && (
            <pre style={{
              marginTop: 24, padding: 16, background: C.bg, borderRadius: 8,
              fontSize: 12, color: C.red, maxWidth: 600, overflow: "auto", textAlign: "left",
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
