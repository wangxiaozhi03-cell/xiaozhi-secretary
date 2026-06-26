import { ref, watch } from "vue";

export type ThemeStyle = "frost" | "mint" | "warm" | "lavender" | "sakura" | "ocean";
export type ThemeMode = "light" | "dark" | "system";

interface ThemeStyleDef {
  id: ThemeStyle;
  label: string;
  preview: [string, string, string, string];
  gradient: string;
  darkGradient: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  glassR: number;
  glassG: number;
  glassB: number;
}

export const THEME_STYLES: Record<ThemeStyle, ThemeStyleDef> = {
  frost: {
    id: "frost",
    label: "霜蓝",
    preview: ["#E8ECF2", "#93C5FD", "#60A5FA", "#4F8CFF"],
    gradient: "linear-gradient(135deg, #E8ECF2 0%, #DDE3ED 50%, #E5E9F0 100%)",
    darkGradient: "linear-gradient(135deg, #1A2332 0%, #1E2A3A 50%, #1C2535 100%)",
    accent: "#4F8CFF",
    accentHover: "#5E9AFF",
    accentLight: "rgba(79, 140, 255, 0.08)",
    glassR: 240,
    glassG: 244,
    glassB: 250,
  },
  mint: {
    id: "mint",
    label: "薄荷",
    preview: ["#E6F0EA", "#6EE7B7", "#34D399", "#10B981"],
    gradient: "linear-gradient(135deg, #E6F0EA 0%, #D9E8DE 50%, #E2EDE5 100%)",
    darkGradient: "linear-gradient(135deg, #152420 0%, #1A2E28 50%, #172A24 100%)",
    accent: "#10B981",
    accentHover: "#059669",
    accentLight: "rgba(16, 185, 129, 0.08)",
    glassR: 238,
    glassG: 248,
    glassB: 242,
  },
  warm: {
    id: "warm",
    label: "暖阳",
    preview: ["#F2ECE2", "#FBBF24", "#F59E0B", "#D97706"],
    gradient: "linear-gradient(135deg, #F2ECE2 0%, #E8E0D4 50%, #EEE8DE 100%)",
    darkGradient: "linear-gradient(135deg, #24201A 0%, #2E2820 50%, #2A241C 100%)",
    accent: "#D97706",
    accentHover: "#B45309",
    accentLight: "rgba(217, 119, 6, 0.08)",
    glassR: 248,
    glassG: 244,
    glassB: 236,
  },
  lavender: {
    id: "lavender",
    label: "薰衣草",
    preview: ["#ECE6F5", "#C4B5FD", "#A78BFA", "#7C3AED"],
    gradient: "linear-gradient(135deg, #ECE6F5 0%, #E2D9EF 50%, #E8E2F2 100%)",
    darkGradient: "linear-gradient(135deg, #1E1A28 0%, #24202E 50%, #201C2A 100%)",
    accent: "#8B5CF6",
    accentHover: "#7C3AED",
    accentLight: "rgba(139, 92, 246, 0.08)",
    glassR: 244,
    glassG: 240,
    glassB: 250,
  },
  sakura: {
    id: "sakura",
    label: "樱花",
    preview: ["#FCE7F3", "#F9A8D4", "#EC4899", "#DB2777"],
    gradient: "linear-gradient(135deg, #FCE7F3 0%, #F8D7EA 50%, #FAE0EE 100%)",
    darkGradient: "linear-gradient(135deg, #28161E 0%, #2E1C26 50%, #2A1822 100%)",
    accent: "#EC4899",
    accentHover: "#DB2777",
    accentLight: "rgba(236, 72, 153, 0.08)",
    glassR: 250,
    glassG: 238,
    glassB: 245,
  },
  ocean: {
    id: "ocean",
    label: "海洋",
    preview: ["#E0F2FE", "#7DD3FC", "#38BDF8", "#0EA5E9"],
    gradient: "linear-gradient(135deg, #E0F2FE 0%, #D4EAF8 50%, #DCF0FA 100%)",
    darkGradient: "linear-gradient(135deg, #0C1A2E 0%, #0E1E35 50%, #0A1828 100%)",
    accent: "#0EA5E9",
    accentHover: "#0284C7",
    accentLight: "rgba(14, 165, 233, 0.08)",
    glassR: 236,
    glassG: 246,
    glassB: 254,
  },
};

// 当前主题
const currentThemeStyle = ref<ThemeStyle>("frost");
const themeMode = ref<ThemeMode>("system");

// 从 localStorage 加载
try {
  const savedTheme = localStorage.getItem("theme-style") as ThemeStyle | null;
  if (savedTheme && THEME_STYLES[savedTheme]) {
    currentThemeStyle.value = savedTheme;
  }
  const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null;
  if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
    themeMode.value = savedMode;
  }
} catch {}

// 应用主题样式
function applyThemeStyle(style: ThemeStyle) {
  const root = document.documentElement;
  const def = THEME_STYLES[style];

  // 设置 CSS 变量
  root.style.setProperty("--bg-gradient", def.gradient);
  root.style.setProperty("--bg-gradient-dark", def.darkGradient);
  root.style.setProperty("--accent", def.accent);
  root.style.setProperty("--accent-hover", def.accentHover);
  root.style.setProperty("--accent-light", def.accentLight);
  root.style.setProperty("--accent-primary", def.accent);
  root.style.setProperty("--glass-r", String(def.glassR));
  root.style.setProperty("--glass-g", String(def.glassG));
  root.style.setProperty("--glass-b", String(def.glassB));

  // 保存到 localStorage
  localStorage.setItem("theme-style", style);
}

// 应用主题模式
function applyThemeMode(mode: ThemeMode) {
  const html = document.documentElement;

  if (mode === "dark") {
    html.classList.add("dark");
  } else if (mode === "light") {
    html.classList.remove("dark");
  } else {
    // 跟随系统
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.classList.toggle("dark", prefersDark);
  }

  localStorage.setItem("theme-mode", mode);
}

// 初始化应用
applyThemeStyle(currentThemeStyle.value);
applyThemeMode(themeMode.value);

// 监听系统主题变化
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (themeMode.value === "system") {
      applyThemeMode("system");
    }
  });
}

export function useThemeStyle() {
  function setThemeStyle(style: ThemeStyle) {
    currentThemeStyle.value = style;
    applyThemeStyle(style);
  }

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode;
    applyThemeMode(mode);
  }

  function getCurrentTheme() {
    return THEME_STYLES[currentThemeStyle.value];
  }

  return {
    currentThemeStyle,
    themeMode,
    setThemeStyle,
    setThemeMode,
    getCurrentTheme,
    THEME_STYLES,
  };
}
