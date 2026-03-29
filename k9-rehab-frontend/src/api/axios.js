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

// Optional: Attach token automatically if present
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

export default api;