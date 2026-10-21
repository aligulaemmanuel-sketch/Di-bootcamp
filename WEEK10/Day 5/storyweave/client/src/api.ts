import axios from "axios";

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "") + "/api",
});

// Attach the JWT to every request (token lives in localStorage for this project)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getToken(): string | null {
  return localStorage.getItem("token");
}
