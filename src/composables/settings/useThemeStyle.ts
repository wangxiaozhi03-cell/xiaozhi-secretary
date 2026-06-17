import { ref } from "vue";

export type ThemeStyle =
  | "frost"
  | "mint"
  | "warm"
  | "lavender"
  | "sakura"
  | "sunset"
  | "ocean"
  | "lime"
  | "peach"
  | "slate"
  | "aurora";

export interface ThemeStyleDef {
  id: ThemeStyle;
  label: string;
  description: string;
  /** 预览色卡：4 个色值 */
  preview: [string, string, string, string];
  /** 基础渐变背景 */
  gradient: string;
  darkGradient: string;
  /** 玻璃材质 tint */
  glassR: number;
  glassG: number;
  glassB: number;
  /** 光斑颜色 (RGB) */
  blobColors: [string, string, string, string, string];
  /** 强调色 */
  accent: string;
  accentHover: string;
}

export const THEME_STYLES: Record<ThemeStyle, ThemeStyleDef> = {
  frost: {
    id: "frost",
    label: "霜蓝",
    description: "冰霜蓝灰 · 冷静专注",
    preview: ["#E8ECF2", "#93C5FD", "#60A5FA", "#4F8CFF"],
    gradient: "linear-gradient(135deg, #E8ECF2 0%, #DDE3ED 50%, #E5E9F0 100%)",
    darkGradient: "linear-gradient(135deg, #1A2332 0%, #1E2A3A 50%, #1C2535 100%)",
    glassR: 240,
    glassG: 244,
    glassB: 250,
    blobColors: ["#93C5FD", "#C4B5FD", "#6EE7B7", "#F9A8D4", "#FCD34D"],
    accent: "#4F8CFF",
    accentHover: "#5E9AFF",
  },
  mint: {
    id: "mint",
    label: "薄荷",
    description: "薄荷清新 · 自然舒适",
    preview: ["#E6F0EA", "#6EE7B7", "#34D399", "#10B981"],
    gradient: "linear-gradient(135deg, #E6F0EA 0%, #D9E8DE 50%, #E2EDE5 100%)",
    darkGradient: "linear-gradient(135deg, #152420 0%, #1A2E28 50%, #172A24 100%)",
    glassR: 238,
    glassG: 248,
    glassB: 242,
    blobColors: ["#6EE7B7", "#93C5FD", "#FCD34D", "#A78BFA", "#F9A8D4"],
    accent: "#10B981",
    accentHover: "#059669",
  },
  warm: {
    id: "warm",
    label: "暖阳",
    description: "暖调奶油 · 温柔护眼",
    preview: ["#F2ECE2", "#FBBF24", "#F59E0B", "#D97706"],
    gradient: "linear-gradient(135deg, #F2ECE2 0%, #E8E0D4 50%, #EEE8DE 100%)",
    darkGradient: "linear-gradient(135deg, #24201A 0%, #2E2820 50%, #2A241C 100%)",
    glassR: 248,
    glassG: 244,
    glassB: 236,
    blobColors: ["#FCD34D", "#F9A8D4", "#93C5FD", "#6EE7B7", "#C4B5FD"],
    accent: "#D97706",
    accentHover: "#B45309",
  },
  lavender: {
    id: "lavender",
    label: "薰衣草",
    description: "梦幻紫调 · 优雅灵感",
    preview: ["#ECE6F5", "#C4B5FD", "#A78BFA", "#7C3AED"],
    gradient: "linear-gradient(135deg, #ECE6F5 0%, #E2D9EF 50%, #E8E2F2 100%)",
    darkGradient: "linear-gradient(135deg, #1E1A28 0%, #24202E 50%, #201C2A 100%)",
    glassR: 244,
    glassG: 240,
    glassB: 250,
    blobColors: ["#C4B5FD", "#F9A8D4", "#93C5FD", "#6EE7B7", "#FCD34D"],
    accent: "#8B5CF6",
    accentHover: "#7C3AED",
  },
  sakura: {
    id: "sakura",
    label: "樱花",
    description: "粉嫩浪漫 · 甜蜜温柔",
    preview: ["#FCE7F3", "#F9A8D4", "#EC4899", "#DB2777"],
    gradient: "linear-gradient(135deg, #FCE7F3 0%, #F8D7EA 50%, #FAE0EE 100%)",
    darkGradient: "linear-gradient(135deg, #28161E 0%, #2E1C26 50%, #2A1822 100%)",
    glassR: 250,
    glassG: 238,
    glassB: 245,
    blobColors: ["#F9A8D4", "#FBBF24", "#A78BFA", "#6EE7B7", "#93C5FD"],
    accent: "#EC4899",
    accentHover: "#DB2777",
  },
  sunset: {
    id: "sunset",
    label: "日落",
    description: "晚霞余晖 · 温暖大气",
    preview: ["#FEE2E2", "#FCA5A5", "#F87171", "#EF4444"],
    gradient: "linear-gradient(135deg, #FEE2E2 0%, #F5D0C5 50%, #FAE0D8 100%)",
    darkGradient: "linear-gradient(135deg, #281818 0%, #2E1E1E 50%, #2A1A1A 100%)",
    glassR: 250,
    glassG: 240,
    glassB: 238,
    blobColors: ["#FCA5A5", "#FCD34D", "#F9A8D4", "#FB923C", "#A78BFA"],
    accent: "#EF4444",
    accentHover: "#DC2626",
  },
  ocean: {
    id: "ocean",
    label: "海洋",
    description: "深海蔚蓝 · 沉稳深邃",
    preview: ["#E0F2FE", "#7DD3FC", "#38BDF8", "#0EA5E9"],
    gradient: "linear-gradient(135deg, #E0F2FE 0%, #D4EAF8 50%, #DCF0FA 100%)",
    darkGradient: "linear-gradient(135deg, #0C1A2E 0%, #0E1E35 50%, #0A1828 100%)",
    glassR: 236,
    glassG: 246,
    glassB: 254,
    blobColors: ["#7DD3FC", "#6EE7B7", "#93C5FD", "#A78BFA", "#FCD34D"],
    accent: "#0EA5E9",
    accentHover: "#0284C7",
  },
  lime: {
    id: "lime",
    label: "青柠",
    description: "青柠活力 · 清新明亮",
    preview: ["#ECFCCB", "#BEF264", "#A3E635", "#84CC16"],
    gradient: "linear-gradient(135deg, #ECFCCB 0%, #E2F5BE 50%, #E8FAC8 100%)",
    darkGradient: "linear-gradient(135deg, #1A2410 0%, #1E2A14 50%, #1C2612 100%)",
    glassR: 242,
    glassG: 250,
    glassB: 236,
    blobColors: ["#BEF264", "#6EE7B7", "#FCD34D", "#93C5FD", "#F9A8D4"],
    accent: "#84CC16",
    accentHover: "#65A30D",
  },
  peach: {
    id: "peach",
    label: "蜜桃",
    description: "蜜桃橘调 · 活力热情",
    preview: ["#FFEDD5", "#FDBA74", "#FB923C", "#F97316"],
    gradient: "linear-gradient(135deg, #FFEDD5 0%, #FDE4CC 50%, #FFE8D0 100%)",
    darkGradient: "linear-gradient(135deg, #241A10 0%, #2E2014 50%, #2A1C12 100%)",
    glassR: 252,
    glassG: 244,
    glassB: 236,
    blobColors: ["#FDBA74", "#F9A8D4", "#FCD34D", "#6EE7B7", "#93C5FD"],
    accent: "#F97316",
    accentHover: "#EA580C",
  },
  slate: {
    id: "slate",
    label: "石墨",
    description: "高级灰调 · 简约克制",
    preview: ["#F1F5F9", "#CBD5E1", "#94A3B8", "#64748B"],
    gradient: "linear-gradient(135deg, #F1F5F9 0%, #E8ECF2 50%, #EDF1F6 100%)",
    darkGradient: "linear-gradient(135deg, #1E293B 0%, #1A2332 50%, #1C2636 100%)",
    glassR: 241,
    glassG: 245,
    glassB: 249,
    blobColors: ["#CBD5E1", "#94A3B8", "#A5B4FC", "#86EFAC", "#FDE68A"],
    accent: "#64748B",
    accentHover: "#475569",
  },
  aurora: {
    id: "aurora",
    label: "极光",
    description: "极光幻彩 · 灵动飘逸",
    preview: ["#E0E7FF", "#A5B4FC", "#818CF8", "#6366F1"],
    gradient: "linear-gradient(135deg, #E0E7FF 0%, #DDE8F5 50%, #E5E0FA 100%)",
    darkGradient: "linear-gradient(135deg, #16182E 0%, #1A1E35 50%, #181C30 100%)",
    glassR: 240,
    glassG: 242,
    glassB: 254,
    blobColors: ["#A5B4FC", "#6EE7B7", "#F9A8D4", "#FCD34D", "#7DD3FC"],
    accent: "#6366F1",
    accentHover: "#4F46E5",
  },
};

// ── Helpers ──
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// ── Singleton state ──
const currentThemeStyle = ref<ThemeStyle>("frost");

function applyThemeStyle(style: ThemeStyle) {
  const html = document.documentElement;
  const def = THEME_STYLES[style];

  html.setAttribute("data-theme-style", style);

  // 主背景
  html.style.setProperty("--bg-gradient", def.gradient);
  html.style.setProperty("--bg-gradient-dark", def.darkGradient);

  // 玻璃 tint
  html.style.setProperty("--glass-r", String(def.glassR));
  html.style.setProperty("--glass-g", String(def.glassG));
  html.style.setProperty("--glass-b", String(def.glassB));

  // 光斑颜色 (hex + RGB 分量)
  def.blobColors.forEach((c, i) => {
    html.style.setProperty(`--blob-${i + 1}`, c);
    const [r, g, b] = hexToRgb(c);
    html.style.setProperty(`--blob-${i + 1}-r`, String(r));
    html.style.setProperty(`--blob-${i + 1}-g`, String(g));
    html.style.setProperty(`--blob-${i + 1}-b`, String(b));
  });

  // 强调色
  html.style.setProperty("--accent", def.accent);
  html.style.setProperty("--accent-hover", def.accentHover);
  html.style.setProperty("--accent-primary", def.accent);
  html.style.setProperty("--accent-glow", def.accent + "59");
  html.style.setProperty("--accent-light", def.accent + "14");
}

// 初始化
try {
  const saved = localStorage.getItem("theme-style") as ThemeStyle | null;
  if (saved && THEME_STYLES[saved]) currentThemeStyle.value = saved;
} catch {}
applyThemeStyle(currentThemeStyle.value);

export function useThemeStyle() {
  function setThemeStyle(style: ThemeStyle) {
    currentThemeStyle.value = style;
    localStorage.setItem("theme-style", style);
    applyThemeStyle(style);
  }

  return {
    currentThemeStyle,
    setThemeStyle,
    THEME_STYLES,
  };
}
