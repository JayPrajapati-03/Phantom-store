import axios from "axios";
import { useAuthStore } from "../store/authStore.js";

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const isBrowser = typeof window !== "undefined";
const pageProtocol = isBrowser ? window.location.protocol : "";
const pageHostname = isBrowser ? window.location.hostname : "";
const rawApiUrl = String(import.meta.env.VITE_API_URL || "").trim();

const isLocalHttpUrl = (value) => /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/|$)/i.test(value);

const resolveApiBaseUrl = () => {
  if (!rawApiUrl) {
    return "/api";
  }

  if (pageProtocol === "https:" && rawApiUrl.startsWith("http://")) {
    if (LOCALHOST_HOSTS.has(pageHostname) && isLocalHttpUrl(rawApiUrl)) {
      return rawApiUrl;
    }

    console.warn(
      `Ignoring insecure VITE_API_URL "${rawApiUrl}" on an HTTPS page. Falling back to same-origin /api.`
    );
    return "/api";
  }

  return rawApiUrl;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default api;
