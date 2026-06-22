import { reactive, watch } from "vue";

export interface Settings {
  // 外观
  fontSize: number;
  borderRadius: number;

  // 通用
  closeAction: "exit" | "minimize";

  // 编辑器
  editorFont: string;
  editorFontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  autoSave: boolean;

  // JSON 工具
  jsonIndent: number;
  jsonAutoFormat: boolean;
  jsonSortKeys: boolean;
  jsonAutoValidate: boolean;
  jsonParseJson5: boolean;

  // 数据
  autoSaveEnabled: boolean;
}

const defaultSettings: Settings = {
  // 外观
  fontSize: 14,
  borderRadius: 12,

  // 通用
  closeAction: "minimize",

  // 编辑器
  editorFont: "HarmonyOS Sans",
  editorFontSize: 14,
  tabSize: 2,
  wordWrap: true,
  showLineNumbers: true,
  autoSave: true,

  // JSON 工具
  jsonIndent: 2,
  jsonAutoFormat: true,
  jsonSortKeys: false,
  jsonAutoValidate: true,
  jsonParseJson5: false,

  // 数据
  autoSaveEnabled: true,
};

// Module-level singleton state
const settings = reactive<Settings>({ ...defaultSettings });

// Load from localStorage
function loadSettings() {
  try {
    const saved = localStorage.getItem("app-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(settings, { ...defaultSettings, ...parsed });
    }
  } catch {}
}

// Save to localStorage
function saveSettings() {
  try {
    localStorage.setItem("app-settings", JSON.stringify(settings));
  } catch {}
}

// Apply settings to CSS variables
function applySettings() {
  const root = document.documentElement;
  root.style.setProperty("--font-size-base", `${settings.fontSize}px`);
  root.style.setProperty("--border-radius", `${settings.borderRadius}px`);
}

// Initialize
loadSettings();
applySettings();

// Watch for changes
watch(
  () => settings,
  () => {
    saveSettings();
    applySettings();
  },
  { deep: true }
);

export function useSettings() {
  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    settings[key] = value;
  }

  function resetSettings() {
    Object.assign(settings, defaultSettings);
  }

  function exportSettings(): string {
    return JSON.stringify(settings, null, 2);
  }

  function importSettings(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      Object.assign(settings, { ...defaultSettings, ...parsed });
      return true;
    } catch {
      return false;
    }
  }

  return {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
  };
}
