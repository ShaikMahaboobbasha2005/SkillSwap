import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

/**
 * Helper to safely decode JWT payload on client side without external dependencies
 */
const decodeJwtToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed || !parsed.id) return null;
    return {
      _id: parsed.id,
      id: parsed.id,
      role: parsed.role,
    };
  } catch (err) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const initialToken = localStorage.getItem("token");
    return decodeJwtToken(initialToken);
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const decodedUser = decodeJwtToken(storedToken);
        
        // If stored token is structurally invalid, clear it
        if (!decodedUser) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setUser((prev) => prev || decodedUser);
        setToken(storedToken);

        try {
          const response = await api.get("/auth/me");
          if (response.data && response.data.success) {
            setUser(response.data.data);
            setToken(storedToken);
          } else {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          const isAuthError =
            error.response &&
            (error.response.status === 401 || error.response.status === 403);

          if (isAuthError) {
            // AUTH FAILURE: Backend explicitly confirmed invalid/expired JWT (401/403)
            console.warn("Backend explicitly rejected token (401/403). Clearing auth session.");
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          } else {
            // NETWORK / SERVER FAILURE: Backend offline, connection refused, 5xx error, or timeout
            console.warn("Backend server unavailable or network error. Preserving stored auth session.");
            setToken(storedToken);
            setUser((prev) => prev || decodedUser);
          }
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data && response.data.success) {
      const { user: userData, token: newToken } = response.data.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      return response.data;
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  };

  const signup = async (userDataInput) => {
    const response = await api.post("/auth/signup", userDataInput);
    if (response.data && response.data.success) {
      const { user: userData, token: newToken } = response.data.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      return response.data;
    } else {
      throw new Error(response.data.message || "Signup failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Logout endpoint call error (stateless client cleanup continuing):", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUserData,
    }));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
