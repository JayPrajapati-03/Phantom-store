import { create } from "zustand";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem("phantom-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "dark";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("phantom-theme", next); } catch {}
      document.documentElement.setAttribute("data-theme", next);
      return { theme: next };
    }),
}));

// Apply initial theme on load
document.documentElement.setAttribute("data-theme", getInitialTheme());
