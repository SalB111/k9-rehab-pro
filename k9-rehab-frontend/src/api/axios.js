import axios from "axios";

// Use env var with smart fallback chain
export const API = import.meta.env.VITE_API_URL
  || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Automatically attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto sign-out on an expired/invalid session: when an authenticated request
// comes back 401, clear the dead token and tell the app to show the login
// screen (instead of silently rendering empty/broken pages). The login and
// register calls are exempt so "invalid credentials" still surfaces normally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/register");
    if (status === 401 && !isAuthCall && localStorage.getItem("token")) {
      try { localStorage.removeItem("token"); } catch { /* ignore */ }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("k9:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth helpers for App.jsx ---
export const setupAxiosAuth = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const clearAxiosAuth = () => {
  delete axios.defaults.headers.common["Authorization"];
};

export default api;
