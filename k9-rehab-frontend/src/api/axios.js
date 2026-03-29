import axios from "axios";

// FINAL, CORRECT, PRODUCTION API URL
export const API = "https://k9-rehab-pro.onrender.com/api";

// Create a preconfigured axios instance
const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
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

// --- REQUIRED EXPORTS ---
export const setupAxiosAuth = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const clearAxiosAuth = () => {
  delete axios.defaults.headers.common["Authorization"];
};

// Default export for API calls
export default api;