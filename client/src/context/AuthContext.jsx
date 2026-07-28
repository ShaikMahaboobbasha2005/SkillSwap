import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
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
          console.error("Failed to restore auth session:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
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
