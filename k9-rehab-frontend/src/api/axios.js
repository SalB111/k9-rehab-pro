import axios from "axios";

export const API = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// ─────────────────────────────────────────────
// AXIOS AUTH INTERCEPTOR
// ─────────────────────────────────────────────
let _axiosAuthInterceptorId = null;
let _axiosResInterceptorId = null;

export function setupAxiosAuth(token, onUnauthorized) {
  // Clear previous interceptors
  if (_axiosAuthInterceptorId !== null) {
    axios.interceptors.request.eject(_axiosAuthInterceptorId);
  }
  if (_axiosResInterceptorId !== null) {
    axios.interceptors.response.eject(_axiosResInterceptorId);
  }
  // Request interceptor — inject Bearer token
  _axiosAuthInterceptorId = axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  // Response interceptor — handle 401
  _axiosResInterceptorId = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
}

export function clearAxiosAuth() {
  if (_axiosAuthInterceptorId !== null) {
    axios.interceptors.request.eject(_axiosAuthInterceptorId);
    _axiosAuthInterceptorId = null;
  }
  if (_axiosResInterceptorId !== null) {
    axios.interceptors.response.eject(_axiosResInterceptorId);
    _axiosResInterceptorId = null;
  }
}
