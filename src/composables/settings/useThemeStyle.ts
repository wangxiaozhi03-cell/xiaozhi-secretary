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
  | "aurora"
  | "coral"
  | "indigo"
  | "rose"
  | "sky"
  | "sand"
  | "forest"
  | "cherry"
  | "olive"
  | "graphite"
  | "candy"
  | "neon"
  | "cyberpunk"
  | "galaxy"
  | "emerald"
  | "amber"
  | "volcanic"
  | "ice"
  | "lavender-mist";

export type ThemeCategory = "fresh" | "warm" | "elegant" | "nature" | "vivid";

export interface ThemeCategoryDef {
  id: ThemeCategory;
  label: string;
}

export const THEME_CATEGORIES: Record<ThemeCategory, ThemeCategoryDef> = {
  fresh: { id: "fresh", label: "清新" },
  warm: { id: "warm", label: "温暖" },
  elegant: { id: "elegant", label: "优雅" },
  nature: { id: "nature", label: "自然" },
  vivid: { id: "vivid", label: "绚彩" },
};

export interface ThemeStyleDef {
  id: ThemeStyle;
  label: string;
  description: string;
  category: ThemeCategory;
  /** 预览色卡：4 个色值 */
  preview: [string, string, string, string];
  /** 基础渐变背景 */
  gradient: string;
  darkGradient: string;
  /** 玻璃材质 tint（浅色模式） */
  glassR: number;
  glassG: number;
  glassB: number;
  /** 玻璃材质 tint（深色模式 — 更饱和的主题色） */
  darkGlassR: number;
  darkGlassG: number;
  darkGlassB: number;
  /** 光斑颜色 (RGB) */
  blobColors: [string, string, string, string, string];
  /** 强调色 */
  accent: string;
  accentHover: string;
}

export const THEME_STYLES: Record<ThemeStyle, ThemeStyleDef> = {
  // ── 清新 ──
  frost: {
    id: "frost",
    label: "霜蓝",
    description: "冰霜蓝灰 · 冷静专注",
    category: "fresh",
    preview: ["#E8ECF2", "#93C5FD", "#60A5FA", "#4F8CFF"],
    gradient: "linear-gradient(135deg, #E8ECF2 0%, #DDE3ED 50%, #E5E9F0 100%)",
    darkGradient: "linear-gradient(135deg, #1A2332 0%, #1E2A3A 50%, #1C2535 100%)",
    glassR: 240,
    glassG: 244,
    glassB: 250,
    darkGlassR: 40,
    darkGlassG: 55,
    darkGlassB: 85,
    blobColors: ["#93C5FD", "#C4B5FD", "#6EE7B7", "#F9A8D4", "#FCD34D"],
    accent: "#4F8CFF",
    accentHover: "#5E9AFF",
  },
  mint: {
    id: "mint",
    label: "薄荷",
    description: "薄荷清新 · 自然舒适",
    category: "fresh",
    preview: ["#E6F0EA", "#6EE7B7", "#34D399", "#10B981"],
    gradient: "linear-gradient(135deg, #E6F0EA 0%, #D9E8DE 50%, #E2EDE5 100%)",
    darkGradient: "linear-gradient(135deg, #152420 0%, #1A2E28 50%, #172A24 100%)",
    glassR: 238,
    glassG: 248,
    glassB: 242,
    darkGlassR: 35,
    darkGlassG: 65,
    darkGlassB: 50,
    blobColors: ["#6EE7B7", "#93C5FD", "#FCD34D", "#A78BFA", "#F9A8D4"],
    accent: "#10B981",
    accentHover: "#059669",
  },
  ocean: {
    id: "ocean",
    label: "海洋",
    description: "深海蔚蓝 · 沉稳深邃",
    category: "fresh",
    preview: ["#E0F2FE", "#7DD3FC", "#38BDF8", "#0EA5E9"],
    gradient: "linear-gradient(135deg, #E0F2FE 0%, #D4EAF8 50%, #DCF0FA 100%)",
    darkGradient: "linear-gradient(135deg, #0C1A2E 0%, #0E1E35 50%, #0A1828 100%)",
    glassR: 236,
    glassG: 246,
    glassB: 254,
    darkGlassR: 30,
    darkGlassG: 58,
    darkGlassB: 80,
    blobColors: ["#7DD3FC", "#6EE7B7", "#93C5FD", "#A78BFA", "#FCD34D"],
    accent: "#0EA5E9",
    accentHover: "#0284C7",
  },
  lime: {
    id: "lime",
    label: "青柠",
    description: "青柠活力 · 清新明亮",
    category: "fresh",
    preview: ["#ECFCCB", "#BEF264", "#A3E635", "#84CC16"],
    gradient: "linear-gradient(135deg, #ECFCCB 0%, #E2F5BE 50%, #E8FAC8 100%)",
    darkGradient: "linear-gradient(135deg, #1A2410 0%, #1E2A14 50%, #1C2612 100%)",
    glassR: 242,
    glassG: 250,
    glassB: 236,
    darkGlassR: 50,
    darkGlassG: 72,
    darkGlassB: 35,
    blobColors: ["#BEF264", "#6EE7B7", "#FCD34D", "#93C5FD", "#F9A8D4"],
    accent: "#84CC16",
    accentHover: "#65A30D",
  },
  aurora: {
    id: "aurora",
    label: "极光",
    description: "极光幻彩 · 灵动飘逸",
    category: "fresh",
    preview: ["#E0E7FF", "#A5B4FC", "#818CF8", "#6366F1"],
    gradient: "linear-gradient(135deg, #E0E7FF 0%, #DDE8F5 50%, #E5E0FA 100%)",
    darkGradient: "linear-gradient(135deg, #16182E 0%, #1A1E35 50%, #181C30 100%)",
    glassR: 240,
    glassG: 242,
    glassB: 254,
    darkGlassR: 48,
    darkGlassG: 42,
    darkGlassB: 80,
    blobColors: ["#A5B4FC", "#6EE7B7", "#F9A8D4", "#FCD34D", "#7DD3FC"],
    accent: "#6366F1",
    accentHover: "#4F46E5",
  },
  sky: {
    id: "sky",
    label: "晴空",
    description: "万里晴空 · 明朗开阔",
    category: "fresh",
    preview: ["#E0F2FE", "#BAE6FD", "#7DD3FC", "#38BDF8"],
    gradient: "linear-gradient(135deg, #E0F2FE 0%, #D8EFFE 50%, #E4F4FE 100%)",
    darkGradient: "linear-gradient(135deg, #0F1D2E 0%, #132438 50%, #101F30 100%)",
    glassR: 235,
    glassG: 247,
    glassB: 255,
    darkGlassR: 32,
    darkGlassG: 55,
    darkGlassB: 82,
    blobColors: ["#7DD3FC", "#BAE6FD", "#FDE68A", "#A5B4FC", "#86EFAC"],
    accent: "#38BDF8",
    accentHover: "#0EA5E9",
  },
  ice: {
    id: "ice",
    label: "冰川",
    description: "冰川冷冽 · 清透纯净",
    category: "fresh",
    preview: ["#F0F9FF", "#E0F2FE", "#BAE6FD", "#7DD3FC"],
    gradient: "linear-gradient(135deg, #F0F9FF 0%, #E8F6FF 50%, #F2FAFF 100%)",
    darkGradient: "linear-gradient(135deg, #14202E 0%, #182838 50%, #162432 100%)",
    glassR: 240,
    glassG: 249,
    glassB: 255,
    darkGlassR: 38,
    darkGlassG: 60,
    darkGlassB: 82,
    blobColors: ["#BAE6FD", "#E0F2FE", "#A5B4FC", "#C4B5FD", "#86EFAC"],
    accent: "#7DD3FC",
    accentHover: "#38BDF8",
  },

  // ── 温暖 ──
  warm: {
    id: "warm",
    label: "暖阳",
    description: "暖调奶油 · 温柔护眼",
    category: "warm",
    preview: ["#F2ECE2", "#FBBF24", "#F59E0B", "#D97706"],
    gradient: "linear-gradient(135deg, #F2ECE2 0%, #E8E0D4 50%, #EEE8DE 100%)",
    darkGradient: "linear-gradient(135deg, #24201A 0%, #2E2820 50%, #2A241C 100%)",
    glassR: 248,
    glassG: 244,
    glassB: 236,
    darkGlassR: 65,
    darkGlassG: 55,
    darkGlassB: 35,
    blobColors: ["#FCD34D", "#F9A8D4", "#93C5FD", "#6EE7B7", "#C4B5FD"],
    accent: "#D97706",
    accentHover: "#B45309",
  },
  peach: {
    id: "peach",
    label: "蜜桃",
    description: "蜜桃橘调 · 活力热情",
    category: "warm",
    preview: ["#FFEDD5", "#FDBA74", "#FB923C", "#F97316"],
    gradient: "linear-gradient(135deg, #FFEDD5 0%, #FDE4CC 50%, #FFE8D0 100%)",
    darkGradient: "linear-gradient(135deg, #241A10 0%, #2E2014 50%, #2A1C12 100%)",
    glassR: 252,
    glassG: 244,
    glassB: 236,
    darkGlassR: 72,
    darkGlassG: 50,
    darkGlassB: 35,
    blobColors: ["#FDBA74", "#F9A8D4", "#FCD34D", "#6EE7B7", "#93C5FD"],
    accent: "#F97316",
    accentHover: "#EA580C",
  },
  sakura: {
    id: "sakura",
    label: "樱花",
    description: "粉嫩浪漫 · 甜蜜温柔",
    category: "warm",
    preview: ["#FCE7F3", "#F9A8D4", "#EC4899", "#DB2777"],
    gradient: "linear-gradient(135deg, #FCE7F3 0%, #F8D7EA 50%, #FAE0EE 100%)",
    darkGradient: "linear-gradient(135deg, #28161E 0%, #2E1C26 50%, #2A1822 100%)",
    glassR: 250,
    glassG: 238,
    glassB: 245,
    darkGlassR: 75,
    darkGlassG: 38,
    darkGlassB: 60,
    blobColors: ["#F9A8D4", "#FBBF24", "#A78BFA", "#6EE7B7", "#93C5FD"],
    accent: "#EC4899",
    accentHover: "#DB2777",
  },
  sunset: {
    id: "sunset",
    label: "日落",
    description: "晚霞余晖 · 温暖大气",
    category: "warm",
    preview: ["#FEE2E2", "#FCA5A5", "#F87171", "#EF4444"],
    gradient: "linear-gradient(135deg, #FEE2E2 0%, #F5D0C5 50%, #FAE0D8 100%)",
    darkGradient: "linear-gradient(135deg, #281818 0%, #2E1E1E 50%, #2A1A1A 100%)",
    glassR: 250,
    glassG: 240,
    glassB: 238,
    darkGlassR: 80,
    darkGlassG: 40,
    darkGlassB: 38,
    blobColors: ["#FCA5A5", "#FCD34D", "#F9A8D4", "#FB923C", "#A78BFA"],
    accent: "#EF4444",
    accentHover: "#DC2626",
  },
  coral: {
    id: "coral",
    label: "珊瑚",
    description: "珊瑚暖调 · 柔和甜美",
    category: "warm",
    preview: ["#FFF1F2", "#FECDD3", "#FDA4AF", "#FB7185"],
    gradient: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FFF0F1 100%)",
    darkGradient: "linear-gradient(135deg, #2A1518 0%, #321A1E 50%, #2E171B 100%)",
    glassR: 255,
    glassG: 241,
    glassB: 242,
    darkGlassR: 82,
    darkGlassG: 42,
    darkGlassB: 48,
    blobColors: ["#FDA4AF", "#FDBA74", "#FCD34D", "#F9A8D4", "#93C5FD"],
    accent: "#FB7185",
    accentHover: "#F43F5E",
  },
  amber: {
    id: "amber",
    label: "琥珀",
    description: "琥珀金调 · 高贵典雅",
    category: "warm",
    preview: ["#FFFBEB", "#FDE68A", "#FBBF24", "#F59E0B"],
    gradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FFF8E1 100%)",
    darkGradient: "linear-gradient(135deg, #2A2210 0%, #322814 50%, #2E2412 100%)",
    glassR: 255,
    glassG: 251,
    glassB: 235,
    darkGlassR: 78,
    darkGlassG: 65,
    darkGlassB: 32,
    blobColors: ["#FDE68A", "#FBBF24", "#FB923C", "#F9A8D4", "#A5B4FC"],
    accent: "#F59E0B",
    accentHover: "#D97706",
  },

  // ── 优雅 ──
  lavender: {
    id: "lavender",
    label: "薰衣草",
    description: "梦幻紫调 · 优雅灵感",
    category: "elegant",
    preview: ["#ECE6F5", "#C4B5FD", "#A78BFA", "#7C3AED"],
    gradient: "linear-gradient(135deg, #ECE6F5 0%, #E2D9EF 50%, #E8E2F2 100%)",
    darkGradient: "linear-gradient(135deg, #1E1A28 0%, #24202E 50%, #201C2A 100%)",
    glassR: 244,
    glassG: 240,
    glassB: 250,
    darkGlassR: 55,
    darkGlassG: 40,
    darkGlassB: 80,
    blobColors: ["#C4B5FD", "#F9A8D4", "#93C5FD", "#6EE7B7", "#FCD34D"],
    accent: "#8B5CF6",
    accentHover: "#7C3AED",
  },
  slate: {
    id: "slate",
    label: "石墨",
    description: "高级灰调 · 简约克制",
    category: "elegant",
    preview: ["#F1F5F9", "#CBD5E1", "#94A3B8", "#64748B"],
    gradient: "linear-gradient(135deg, #F1F5F9 0%, #E8ECF2 50%, #EDF1F6 100%)",
    darkGradient: "linear-gradient(135deg, #1E293B 0%, #1A2332 50%, #1C2636 100%)",
    glassR: 241,
    glassG: 245,
    glassB: 249,
    darkGlassR: 50,
    darkGlassG: 55,
    darkGlassB: 65,
    blobColors: ["#CBD5E1", "#94A3B8", "#A5B4FC", "#86EFAC", "#FDE68A"],
    accent: "#64748B",
    accentHover: "#475569",
  },
  indigo: {
    id: "indigo",
    label: "靛蓝",
    description: "靛蓝沉静 · 知性内敛",
    category: "elegant",
    preview: ["#E0E7FF", "#A5B4FC", "#818CF8", "#4F46E5"],
    gradient: "linear-gradient(135deg, #E0E7FF 0%, #D8DFF8 50%, #E4E9FC 100%)",
    darkGradient: "linear-gradient(135deg, #1A1830 0%, #201E38 50%, #1C1A34 100%)",
    glassR: 238,
    glassG: 240,
    glassB: 255,
    darkGlassR: 50,
    darkGlassG: 45,
    darkGlassB: 85,
    blobColors: ["#818CF8", "#A5B4FC", "#C4B5FD", "#6EE7B7", "#FCD34D"],
    accent: "#4F46E5",
    accentHover: "#4338CA",
  },
  rose: {
    id: "rose",
    label: "玫瑰",
    description: "玫瑰醇厚 · 优雅浪漫",
    category: "elegant",
    preview: ["#FFF1F2", "#FECDD3", "#FB7185", "#E11D48"],
    gradient: "linear-gradient(135deg, #FFF1F2 0%, #FCE4E8 50%, #FFF0F2 100%)",
    darkGradient: "linear-gradient(135deg, #2A1218 0%, #321620 50%, #2E141C 100%)",
    glassR: 255,
    glassG: 241,
    glassB: 242,
    darkGlassR: 80,
    darkGlassG: 35,
    darkGlassB: 52,
    blobColors: ["#FB7185", "#FDA4AF", "#F9A8D4", "#A5B4FC", "#86EFAC"],
    accent: "#E11D48",
    accentHover: "#BE123C",
  },
  graphite: {
    id: "graphite",
    label: "石墨深",
    description: "深沉灰调 · 低调稳重",
    category: "elegant",
    preview: ["#E2E8F0", "#94A3B8", "#64748B", "#475569"],
    gradient: "linear-gradient(135deg, #E2E8F0 0%, #D5DCE6 50%, #DEE4ED 100%)",
    darkGradient: "linear-gradient(135deg, #1A202C 0%, #1E2432 50%, #1C222E 100%)",
    glassR: 238,
    glassG: 242,
    glassB: 248,
    darkGlassR: 42,
    darkGlassG: 48,
    darkGlassB: 60,
    blobColors: ["#94A3B8", "#64748B", "#818CF8", "#6EE7B7", "#FDE68A"],
    accent: "#475569",
    accentHover: "#334155",
  },
  "lavender-mist": {
    id: "lavender-mist",
    label: "薄雾",
    description: "紫雾朦胧 · 柔和梦幻",
    category: "elegant",
    preview: ["#F3F0FF", "#DDD6FE", "#C4B5FD", "#A78BFA"],
    gradient: "linear-gradient(135deg, #F3F0FF 0%, #EDE8FC 50%, #F5F2FF 100%)",
    darkGradient: "linear-gradient(135deg, #1E1A2A 0%, #242032 50%, #201C2E 100%)",
    glassR: 245,
    glassG: 240,
    glassB: 255,
    darkGlassR: 58,
    darkGlassG: 48,
    darkGlassB: 85,
    blobColors: ["#C4B5FD", "#DDD6FE", "#E9D5FF", "#A5B4FC", "#F9A8D4"],
    accent: "#A78BFA",
    accentHover: "#8B5CF6",
  },

  // ── 自然 ──
  forest: {
    id: "forest",
    label: "森林",
    description: "森林深绿 · 沉稳静谧",
    category: "nature",
    preview: ["#DCFCE7", "#86EFAC", "#4ADE80", "#16A34A"],
    gradient: "linear-gradient(135deg, #DCFCE7 0%, #D0F5E0 50%, #D8FAE5 100%)",
    darkGradient: "linear-gradient(135deg, #101E14 0%, #142618 50%, #122216 100%)",
    glassR: 232,
    glassG: 250,
    glassB: 238,
    darkGlassR: 30,
    darkGlassG: 62,
    darkGlassB: 40,
    blobColors: ["#86EFAC", "#4ADE80", "#6EE7B7", "#FCD34D", "#93C5FD"],
    accent: "#16A34A",
    accentHover: "#15803D",
  },
  sand: {
    id: "sand",
    label: "沙丘",
    description: "沙漠暖调 · 质朴自然",
    category: "nature",
    preview: ["#FEF7ED", "#FED7AA", "#FDBA74", "#F97316"],
    gradient: "linear-gradient(135deg, #FEF7ED 0%, #FDF0E0 50%, #FEF4E8 100%)",
    darkGradient: "linear-gradient(135deg, #261E14 0%, #2E241A 50%, #2A2016 100%)",
    glassR: 254,
    glassG: 247,
    glassB: 237,
    darkGlassR: 70,
    darkGlassG: 55,
    darkGlassB: 38,
    blobColors: ["#FDBA74", "#FDE68A", "#86EFAC", "#93C5FD", "#C4B5FD"],
    accent: "#F97316",
    accentHover: "#EA580C",
  },
  cherry: {
    id: "cherry",
    label: "樱红",
    description: "樱桃深红 · 浓郁饱满",
    category: "nature",
    preview: ["#FEE2E2", "#FECACA", "#F87171", "#DC2626"],
    gradient: "linear-gradient(135deg, #FEE2E2 0%, #FDD8D8 50%, #FEE0E0 100%)",
    darkGradient: "linear-gradient(135deg, #2A1414 0%, #321818 50%, #2E1616 100%)",
    glassR: 254,
    glassG: 226,
    glassB: 226,
    darkGlassR: 82,
    darkGlassG: 38,
    darkGlassB: 38,
    blobColors: ["#F87171", "#FCA5A5", "#FB923C", "#FCD34D", "#A78BFA"],
    accent: "#DC2626",
    accentHover: "#B91C1C",
  },
  olive: {
    id: "olive",
    label: "橄榄",
    description: "橄榄绿调 · 质朴沉稳",
    category: "nature",
    preview: ["#F7FEE7", "#D9F99D", "#A3E635", "#65A30D"],
    gradient: "linear-gradient(135deg, #F7FEE7 0%, #EFFCD2 50%, #F4FDE0 100%)",
    darkGradient: "linear-gradient(135deg, #1E2210 0%, #262A14 50%, #222612 100%)",
    glassR: 247,
    glassG: 254,
    glassB: 231,
    darkGlassR: 60,
    darkGlassG: 68,
    darkGlassB: 35,
    blobColors: ["#D9F99D", "#A3E635", "#86EFAC", "#6EE7B7", "#FCD34D"],
    accent: "#65A30D",
    accentHover: "#4D7C0F",
  },
  emerald: {
    id: "emerald",
    label: "翡翠",
    description: "翡翠浓郁 · 珍贵雅致",
    category: "nature",
    preview: ["#D1FAE5", "#6EE7B7", "#34D399", "#059669"],
    gradient: "linear-gradient(135deg, #D1FAE5 0%, #C5F0DB 50%, #CEF5E0 100%)",
    darkGradient: "linear-gradient(135deg, #0E2218 0%, #122A1E 50%, #10261A 100%)",
    glassR: 228,
    glassG: 250,
    glassB: 240,
    darkGlassR: 28,
    darkGlassG: 68,
    darkGlassB: 50,
    blobColors: ["#6EE7B7", "#34D399", "#A78BFA", "#FCD34D", "#93C5FD"],
    accent: "#059669",
    accentHover: "#047857",
  },

  // ── 绚彩 ──
  candy: {
    id: "candy",
    label: "糖果",
    description: "糖果缤纷 · 甜美活泼",
    category: "vivid",
    preview: ["#FDF2F8", "#FBCFE8", "#F472B6", "#EC4899"],
    gradient: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FDF0F6 100%)",
    darkGradient: "linear-gradient(135deg, #2A1520 0%, #321A28 50%, #2E1824 100%)",
    glassR: 253,
    glassG: 242,
    glassB: 248,
    darkGlassR: 80,
    darkGlassG: 42,
    darkGlassB: 62,
    blobColors: ["#F472B6", "#FB923C", "#FBBF24", "#A78BFA", "#6EE7B7"],
    accent: "#EC4899",
    accentHover: "#DB2777",
  },
  neon: {
    id: "neon",
    label: "霓虹",
    description: "霓虹闪烁 · 未来科技",
    category: "vivid",
    preview: ["#ECFDF5", "#6EE7B7", "#34D399", "#059669"],
    gradient: "linear-gradient(135deg, #ECFDF5 0%, #E0FAED 50%, #E8FCF0 100%)",
    darkGradient: "linear-gradient(135deg, #0A1E15 0%, #0E261A 50%, #0C2218 100%)",
    glassR: 236,
    glassG: 253,
    glassB: 245,
    darkGlassR: 22,
    darkGlassG: 65,
    darkGlassB: 45,
    blobColors: ["#6EE7B7", "#34D399", "#5EEAD4", "#7DD3FC", "#A78BFA"],
    accent: "#10B981",
    accentHover: "#059669",
  },
  cyberpunk: {
    id: "cyberpunk",
    label: "赛博",
    description: "赛博朋克 · 霓虹迷幻",
    category: "vivid",
    preview: ["#F5F3FF", "#C084FC", "#A855F7", "#7C3AED"],
    gradient: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #F3F0FF 100%)",
    darkGradient: "linear-gradient(135deg, #1A1028 0%, #221430 50%, #1E122C 100%)",
    glassR: 245,
    glassG: 243,
    glassB: 255,
    darkGlassR: 62,
    darkGlassG: 38,
    darkGlassB: 88,
    blobColors: ["#C084FC", "#F472B6", "#22D3EE", "#34D399", "#FBBF24"],
    accent: "#A855F7",
    accentHover: "#9333EA",
  },
  galaxy: {
    id: "galaxy",
    label: "星河",
    description: "星河璀璨 · 深邃神秘",
    category: "vivid",
    preview: ["#EDE9FE", "#C4B5FD", "#8B5CF6", "#6D28D9"],
    gradient: "linear-gradient(135deg, #EDE9FE 0%, #E4DFFA 50%, #EAE6FC 100%)",
    darkGradient: "linear-gradient(135deg, #16102E 0%, #1C1438 50%, #181232 100%)",
    glassR: 240,
    glassG: 238,
    glassB: 254,
    darkGlassR: 52,
    darkGlassG: 40,
    darkGlassB: 90,
    blobColors: ["#8B5CF6", "#C4B5FD", "#7DD3FC", "#6EE7B7", "#FCD34D"],
    accent: "#6D28D9",
    accentHover: "#5B21B6",
  },
  volcanic: {
    id: "volcanic",
    label: "火山",
    description: "火山炽热 · 热情奔放",
    category: "vivid",
    preview: ["#FFF7ED", "#FFEDD5", "#FB923C", "#EA580C"],
    gradient: "linear-gradient(135deg, #FFF7ED 0%, #FEE8D6 50%, #FFF2E8 100%)",
    darkGradient: "linear-gradient(135deg, #2A1810 0%, #321E14 50%, #2E1A12 100%)",
    glassR: 255,
    glassG: 247,
    glassB: 237,
    darkGlassR: 85,
    darkGlassG: 50,
    darkGlassB: 32,
    blobColors: ["#FB923C", "#F87171", "#FBBF24", "#F9A8D4", "#A78BFA"],
    accent: "#EA580C",
    accentHover: "#C2410C",
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

  // 玻璃 tint（浅色）
  html.style.setProperty("--glass-r", String(def.glassR));
  html.style.setProperty("--glass-g", String(def.glassG));
  html.style.setProperty("--glass-b", String(def.glassB));

  // 玻璃 tint（深色 — 更饱和的主题色）
  html.style.setProperty("--glass-dark-r", String(def.darkGlassR));
  html.style.setProperty("--glass-dark-g", String(def.darkGlassG));
  html.style.setProperty("--glass-dark-b", String(def.darkGlassB));

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
  const [ar, ag, ab] = hexToRgb(def.accent);
  html.style.setProperty("--accent-r", String(ar));
  html.style.setProperty("--accent-g", String(ag));
  html.style.setProperty("--accent-b", String(ab));
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

  function getThemesByCategory(category: ThemeCategory): ThemeStyleDef[] {
    return Object.values(THEME_STYLES).filter((t) => t.category === category);
  }

  return {
    currentThemeStyle,
    setThemeStyle,
    THEME_STYLES,
    THEME_CATEGORIES,
    getThemesByCategory,
  };
}
