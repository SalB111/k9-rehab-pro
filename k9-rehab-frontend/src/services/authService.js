import axios from "axios";
import { API } from "../api/axios";

export async function register(username, password) {
  return axios.post(`${API}/auth/register`, { username, password, role: "owner" });
}

export async function login(username, password) {
  return axios.post(`${API}/auth/login`, { username, password });
}

export async function checkAuth() {
  return axios.get(`${API}/auth/status`, { withCredentials: true });
}

export async function logout() {
  return axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
}
