import { ref } from "vue";

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "blue" | "green" | "purple" | "orange" | "red" | "graphite";

// Module-level singleton state
const themeMode = ref<ThemeMode>("system");
const accentColor = ref<AccentColor>("blue");

// Accent color definitions
export const ACCENT_COLORS: Record<AccentColor, { primary: string; hover: string; light: string }> = {
  blue: { primary: "#3B82F6", hover: "#2563EB", light: "#EFF6FF" },
  green: { primary: "#10B981", hover: "#059669", light: "#ECFDF5" },
  purple: { primary: "#8B5CF6", hover: "#7C3AED", light: "#F5F3FF" },
  orange: { primary: "#F97316", hover: "#EA580C", light: "#FFF7ED" },
  red: { primary: "#EF4444", hover: "#DC2626", light: "#FEF2F2" },
  graphite: { primary: "#6B7280", hover: "#4B5563", light: "#F9FAFB" },
};

function applyTheme(mode: ThemeMode) {
  const html = document.documentElement;
  if (mode === "dark") {
    html.classList.add("dark");
  } else if (mode === "light") {
    html.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.classList.toggle("dark", prefersDark);
  }
}

function applyAccentColor(color: AccentColor) {
  const root = document.documentElement;
  const colors = ACCENT_COLORS[color];
  root.style.setProperty("--accent-primary", colors.primary);
  root.style.setProperty("--accent-hover", colors.hover);
  root.style.setProperty("--accent-light", colors.light);
}

// Initialize from localStorage
try {
  const savedTheme = localStorage.getItem("theme-mode") as ThemeMode | null;
  if (savedTheme) themeMode.value = savedTheme;

  const savedColor = localStorage.getItem("accent-color") as AccentColor | null;
  if (savedColor) accentColor.value = savedColor;
} catch {}

// Apply on load
applyTheme(themeMode.value);
applyAccentColor(accentColor.value);

// Listen for system theme changes
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (themeMode.value === "system") applyTheme("system");
  });
}

export function useTheme() {
  function setTheme(mode: ThemeMode) {
    themeMode.value = mode;
    localStorage.setItem("theme-mode", mode);
    applyTheme(mode);
  }

  function setAccentColor(color: AccentColor) {
    accentColor.value = color;
    localStorage.setItem("accent-color", color);
    applyAccentColor(color);
  }

  function isDark(): boolean {
    if (themeMode.value === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return themeMode.value === "dark";
  }

  return {
    themeMode,
    accentColor,
    setTheme,
    setAccentColor,
    isDark,
    ACCENT_COLORS,
  };
}
