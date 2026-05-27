// AuthContext.jsx — Manages login sessions and user role routing

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

const SESSION_KEY = "kivo_session";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes inactivity timeout

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const timeoutRef = useRef(null);
  const activityRef = useRef(null);

  // Reset session timeout on user activity
  const resetSessionTimeout = useCallback(() => {
    if (user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        logout(); // Auto-logout on timeout
      }, SESSION_TIMEOUT);
    }
  }, [user]);

  // Track user activity (mouse, keyboard, touch)
  useEffect(() => {
    const handleActivity = () => {
      if (user && !activityRef.current) {
        resetSessionTimeout();
      }
    };

    if (user) {
      window.addEventListener("mousedown", handleActivity);
      window.addEventListener("keydown", handleActivity);
      window.addEventListener("touchstart", handleActivity);
      resetSessionTimeout(); // Initial timeout

      return () => {
        window.removeEventListener("mousedown", handleActivity);
        window.removeEventListener("keydown", handleActivity);
        window.removeEventListener("touchstart", handleActivity);
      };
    }
  }, [user, resetSessionTimeout]);

  // Restore session from localStorage on first load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setLoginError("");
    try {
      const loggedInUser = await api.login(username, password);
      setUser(loggedInUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      setLoginError(err.message || "Login failed. Please try again.");
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const isAdmin = user?.role === "admin";
  const isPartner = user?.role === "partner";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, loginError, setLoginError, isAdmin, isPartner }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
