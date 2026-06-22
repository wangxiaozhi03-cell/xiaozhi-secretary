<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { safeParse } from "../../../composables/json-toolkit/safeParse";

const props = defineProps<{ json: string }>();

interface GridRow {
  key: string;
  type: string;
  value: string;
  path: string;
}

const rows = ref<GridRow[]>([]);
const errorMsg = ref("");
const filterText = ref("");
const viewMode = ref<"flat" | "nested">("flat");

const filteredRows = computed(() => {
  const query = filterText.value.toLowerCase();
  if (!query) return rows.value;
  return rows.value.filter(
    (r) =>
      r.key.toLowerCase().includes(query) ||
      r.value.toLowerCase().includes(query) ||
      r.path.toLowerCase().includes(query)
  );
});

function parse() {
  errorMsg.value = "";
  rows.value = [];
  const trimmed = props.json.trim();
  if (!trimmed) return;

  try {
    const data = safeParse(trimmed);
    if (viewMode.value === "flat") {
      rows.value = flattenToRows(data, "$");
    } else {
      rows.value = nestedToRows(data, "$");
    }
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Invalid JSON";
  }
}

function flattenToRows(data: unknown, path: string): GridRow[] {
  const result: GridRow[] = [];

  function walk(value: unknown, currentPath: string, key: string) {
    if (value === null) {
      result.push({ key, type: "null", value: "null", path: currentPath });
    } else if (Array.isArray(value)) {
      result.push({ key, type: `array[${value.length}]`, value: `[ ...${value.length} items ]`, path: currentPath });
      value.forEach((item, i) => walk(item, `${currentPath}[${i}]`, String(i)));
    } else if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      result.push({ key, type: `object{${entries.length}}`, value: `{ ...${entries.length} keys }`, path: currentPath });
      entries.forEach(([k, v]) => {
        const childPath = /^[a-zA-Z_]\w*$/.test(k) ? `${currentPath}.${k}` : `${currentPath}["${k}"]`;
        walk(v, childPath, k);
      });
    } else if (typeof value === "string") {
      result.push({ key, type: "string", value: `"${value}"`, path: currentPath });
    } else if (typeof value === "number") {
      result.push({ key, type: "number", value: String(value), path: currentPath });
    } else if (typeof value === "boolean") {
      result.push({ key, type: "boolean", value: String(value), path: currentPath });
    }
  }

  walk(data, path, "$");
  return result;
}

function nestedToRows(data: unknown, path: string): GridRow[] {
  const result: GridRow[] = [];

  if (data === null) {
    result.push({ key: path, type: "null", value: "null", path });
  } else if (Array.isArray(data)) {
    data.forEach((item, i) => {
      const childPath = `${path}[${i}]`;
      if (typeof item === "object" && item !== null) {
        result.push(...nestedToRows(item, childPath));
      } else {
        result.push({
          key: String(i),
          type: getTypeLabel(item),
          value: formatValue(item),
          path: childPath,
        });
      }
    });
  } else if (typeof data === "object") {
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      const childPath = /^[a-zA-Z_]\w*$/.test(k) ? `${path}.${k}` : `${path}["${k}"]`;
      if (typeof v === "object" && v !== null) {
        result.push(...nestedToRows(v, childPath));
      } else {
        result.push({ key: k, type: getTypeLabel(v), value: formatValue(v), path: childPath });
      }
    }
  }

  return result;
}

function getTypeLabel(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return typeof value;
}

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
}

function copyPath(path: string) {
  navigator.clipboard.writeText(path);
}

const typeColors: Record<string, string> = {
  string: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  number: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
  boolean: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
  null: "text-gray-400 bg-gray-50 dark:bg-gray-500/10",
};

function getTypeClass(type: string): string {
  if (type.startsWith("array")) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10";
  if (type.startsWith("object")) return "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10";
  return typeColors[type] || "text-gray-500 bg-gray-50 dark:bg-gray-500/10";
}

watch([() => props.json, viewMode], parse, { immediate: true });
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div class="px-3 py-2 border-b border-black/[0.03] dark:border-white/[0.04] flex-shrink-0">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-medium text-tertiary uppercase tracking-widest">Grid View</span>
        <div class="flex items-center gap-1">
          <button
            class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
            :class="viewMode === 'flat' ? 'bg-blue-500/[0.08] text-blue-500 font-medium' : 'text-tertiary hover:text-secondary'"
            @click="viewMode = 'flat'"
          >扁平</button>
          <button
            class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
            :class="viewMode === 'nested' ? 'bg-blue-500/[0.08] text-blue-500 font-medium' : 'text-tertiary hover:text-secondary'"
            @click="viewMode = 'nested'"
          >仅叶子</button>
          <span class="text-[10px] text-tertiary ml-1">{{ filteredRows.length }} 行</span>
        </div>
      </div>
      <!-- 搜索过滤 -->
      <div class="relative">
        <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <input
          v-model="filterText"
          type="text"
          class="w-full pl-7 pr-2 py-1.5 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-lg outline-none text-primary placeholder:text-tertiary border border-transparent focus:border-blue-500/30 transition-colors"
          placeholder="过滤 Key / Value / Path..."
        />
      </div>
    </div>

    <!-- 错误 -->
    <div v-if="errorMsg" class="p-3 text-xs text-rose-500">{{ errorMsg }}</div>
    <div v-else-if="rows.length === 0" class="flex-1 flex items-center justify-center text-xs text-tertiary">
      Paste JSON in the editor
    </div>

    <!-- 表格 -->
    <div v-else class="flex-1 overflow-auto">
      <table class="w-full text-xs border-collapse">
        <thead class="sticky top-0 z-10">
          <tr class="bg-black/[0.03] dark:bg-white/[0.05] border-b border-black/[0.04] dark:border-white/[0.06]">
            <th class="text-left px-3 py-1.5 font-medium text-tertiary w-[25%] min-w-[100px]">Key</th>
            <th class="text-left px-3 py-1.5 font-medium text-tertiary w-[80px]">Type</th>
            <th class="text-left px-3 py-1.5 font-medium text-tertiary">Value</th>
            <th class="text-left px-3 py-1.5 font-medium text-tertiary w-[30%] min-w-[120px]">Path</th>
            <th class="w-8"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in filteredRows"
            :key="idx"
            class="border-b border-black/[0.02] dark:border-white/[0.03] hover:bg-blue-500/[0.03] transition-colors group"
          >
            <td class="px-3 py-1.5 font-medium text-primary truncate max-w-[200px]">{{ row.key }}</td>
            <td class="px-3 py-1.5">
              <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium" :class="getTypeClass(row.type)">
                {{ row.type }}
              </span>
            </td>
            <td class="px-3 py-1.5 text-secondary truncate max-w-[300px] font-mono text-[11px]">{{ row.value }}</td>
            <td class="px-3 py-1.5 text-tertiary truncate max-w-[200px] font-mono text-[10px]">{{ row.path }}</td>
            <td class="px-1 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex items-center gap-0.5">
                <button
                  class="p-0.5 rounded text-tertiary hover:text-blue-500 hover:bg-blue-500/[0.08] transition-colors"
                  title="复制值"
                  @click="copyValue(row.value)"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  class="p-0.5 rounded text-tertiary hover:text-purple-500 hover:bg-purple-500/[0.08] transition-colors"
                  title="复制路径"
                  @click="copyPath(row.path)"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
