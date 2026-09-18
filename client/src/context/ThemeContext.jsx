import { createContext, useState, useEffect, useCallback } from "react";

export const ThemeContext = createContext({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

const THEME_STORAGE_KEY = "skillswap_theme";
const VALID_THEMES = ["system", "light", "dark"];

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_THEMES.includes(stored)) {
      return stored;
    }
  } catch (err) {
    console.warn("Unable to access localStorage for theme:", err);
  }
  return "system";
}

function getSystemPreference() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [systemPreference, setSystemPreference] = useState(getSystemPreference);

  // Derive active resolved theme
  const resolvedTheme = theme === "system" ? systemPreference : theme;

  // Listen for system theme changes if theme is "system"
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    // Initial sync
    setSystemPreference(mediaQuery.matches ? "dark" : "light");

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // Sync DOM root class whenever resolvedTheme changes
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn("Unable to save theme preference to localStorage:", err);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
