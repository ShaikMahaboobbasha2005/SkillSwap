import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to automatically attach Authorization Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle explicit 401 Unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear token if backend explicitly responds with 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn("API received 401 Unauthorized response. Clearing token.");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
