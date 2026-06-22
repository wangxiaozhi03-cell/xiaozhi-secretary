import { ref, computed } from "vue";

export interface HistoryEntry {
  id: string;
  json: string;
  preview: string;
  timestamp: number;
  size: number;
}

const STORAGE_KEY = "json-toolkit-history";
const MAX_ENTRIES = 50;

const entries = ref<HistoryEntry[]>(loadEntries());

function loadEntries(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistEntries() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value));
  } catch {
    // Storage full - remove oldest half
    entries.value = entries.value.slice(0, Math.ceil(entries.value.length / 2));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value));
    } catch {
      // ignore
    }
  }
}

export function useJsonHistory() {
  const count = computed(() => entries.value.length);
  const isEmpty = computed(() => entries.value.length === 0);

  function addEntry(json: string): string | null {
    const trimmed = json.trim();
    if (!trimmed) return null;

    // Don't add duplicate of latest entry
    if (entries.value.length > 0 && entries.value[0].json === trimmed) return null;

    const entry: HistoryEntry = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      json: trimmed,
      preview: generatePreview(trimmed),
      timestamp: Date.now(),
      size: trimmed.length,
    };

    entries.value.unshift(entry);
    if (entries.value.length > MAX_ENTRIES) {
      entries.value = entries.value.slice(0, MAX_ENTRIES);
    }
    persistEntries();
    return entry.id;
  }

  function removeEntry(id: string) {
    const idx = entries.value.findIndex((e) => e.id === id);
    if (idx !== -1) {
      entries.value.splice(idx, 1);
      persistEntries();
    }
  }

  function clearAll() {
    entries.value = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  function getEntry(id: string): HistoryEntry | undefined {
    return entries.value.find((e) => e.id === id);
  }

  function formatTime(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

    return d.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return {
    entries,
    count,
    isEmpty,
    addEntry,
    removeEntry,
    clearAll,
    getEntry,
    formatTime,
    formatSize,
  };
}

function generatePreview(json: string): string {
  const trimmed = json.trim();
  if (trimmed.length <= 80) return trimmed;
  return trimmed.slice(0, 80) + "...";
}
