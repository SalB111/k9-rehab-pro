import axios from "axios";

// VITE uses import.meta.env — NOT process.env
const API_URL = import.meta.env.VITE_API_URL;

// REGISTER
export async function register(username, password) {
  return axios.post(`${API_URL}/auth/register`, {
    username,
    password,
    role: "owner"
  });
}

// LOGIN
export async function login(username, password) {
  return axios.post(`${API_URL}/auth/login`, {
    username,
    password
  });
}

// CHECK AUTH STATUS
export async function checkAuth() {
  return axios.get(`${API_URL}/auth/status`, { withCredentials: true });
}

// LOGOUT
export async function logout() {
  return axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
}