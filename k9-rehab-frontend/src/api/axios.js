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
