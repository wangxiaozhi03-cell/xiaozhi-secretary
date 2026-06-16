import { ref, watch } from "vue";
import type { Environment } from "./types";

const STORAGE_KEY = "curl-toolkit-environments";

const defaultEnvironments: Environment[] = [
  { id: "prod", name: "Production", domain: "api.example.com", port: null, protocol: "https", isActive: false },
  { id: "staging", name: "Staging", domain: "staging.api.example.com", port: null, protocol: "https", isActive: false },
  { id: "local", name: "Local", domain: "localhost", port: "8080", protocol: "http", isActive: false },
  { id: "dev", name: "Dev", domain: "dev.api.example.com", port: null, protocol: "https", isActive: false },
];

// 模块级单例状态
const environments = ref<Environment[]>([]);
const selectedEnvId = ref<string | null>(null);

// 从 localStorage 加载
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      environments.value = JSON.parse(saved);
    } else {
      environments.value = defaultEnvironments.map((e) => ({ ...e }));
    }
  } catch {
    environments.value = defaultEnvironments.map((e) => ({ ...e }));
  }
}

// 保存到 localStorage
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(environments.value));
  } catch {
    // ignore
  }
}

// 初始化
loadFromStorage();

export function useEnvironments() {
  const activeEnv = ref<Environment | null>(null);

  // 计算当前激活的环境
  function updateActiveEnv() {
    activeEnv.value =
      environments.value.find((e) => e.id === selectedEnvId.value) || null;
  }

  updateActiveEnv();

  function selectEnv(id: string | null) {
    selectedEnvId.value = id;
    updateActiveEnv();
  }

  function addEnv(env: Omit<Environment, "id" | "isActive">) {
    const newEnv: Environment = {
      ...env,
      id: Date.now().toString(),
      isActive: false,
    };
    environments.value.push(newEnv);
    saveToStorage();
    return newEnv;
  }

  function removeEnv(id: string) {
    environments.value = environments.value.filter((e) => e.id !== id);
    if (selectedEnvId.value === id) {
      selectedEnvId.value = null;
      updateActiveEnv();
    }
    saveToStorage();
  }

  function updateEnv(id: string, updates: Partial<Environment>) {
    const env = environments.value.find((e) => e.id === id);
    if (env) {
      Object.assign(env, updates);
      saveToStorage();
    }
  }

  return {
    environments,
    selectedEnvId,
    activeEnv,
    selectEnv,
    addEnv,
    removeEnv,
    updateEnv,
  };
}
