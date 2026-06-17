<script setup lang="ts">
import { ref, computed, watch, h, onMounted, onUnmounted } from "vue";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

const props = defineProps<{ json: string }>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JSONData = Record<string, any> | any[] | string | number | boolean | null;

// 解析后的 JSON 数据
const parsedData = ref<JSONData | null>(null);
const errorMsg = ref("");

// 搜索
const searchQuery = ref("");

// 展开/折叠控制
const deep = ref(999);
const treeKey = ref(0);

// 选中的节点路径 (vue-json-pretty 格式，rootPath="$")
const selectedPath = ref("");
const selectedNodeData = ref<JSONData | null>(null);

// 复制提示
const copyToast = ref(false);

// 暗色模式检测
const isDark = ref(false);
let darkObserver: MutationObserver | null = null;

onMounted(() => {
  isDark.value = document.documentElement.classList.contains("dark");
  darkObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains("dark");
  });
  darkObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  darkObserver?.disconnect();
});

// 解析 JSON
function parse() {
  errorMsg.value = "";
  parsedData.value = null;
  selectedPath.value = "";
  selectedNodeData.value = null;
  const trimmed = props.json.trim();
  if (!trimmed) return;
  try {
    parsedData.value = JSON.parse(trimmed) as JSONData;
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Invalid JSON";
  }
}

// 搜索：遍历数据查找匹配项的 path 集合
const searchMatchPaths = computed(() => {
  if (!searchQuery.value.trim() || parsedData.value == null) return new Set<string>();
  const paths = new Set<string>();
  const query = searchQuery.value.toLowerCase();

  function walk(data: unknown, path: string) {
    if (data === null || data === undefined) {
      if (String(data).toLowerCase().includes(query)) paths.add(path);
      return;
    }
    if (Array.isArray(data)) {
      data.forEach((item, i) => walk(item, `${path}[${i}]`));
    } else if (typeof data === "object") {
      for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
        const childPath = /^[a-zA-Z_]\w*$/.test(k) ? `${path}.${k}` : `${path}["${k}"]`;
        if (k.toLowerCase().includes(query)) paths.add(childPath);
        walk(v, childPath);
      }
    } else {
      if (String(data).toLowerCase().includes(query)) paths.add(path);
    }
  }

  walk(parsedData.value, "$");
  return paths;
});

const searchCount = computed(() => searchMatchPaths.value.size);

// 展开 / 折叠全部
function expandAll() {
  deep.value = 999;
  treeKey.value++;
}

function collapseAll() {
  deep.value = 1;
  treeKey.value++;
}

// 复制
function showToast() {
  copyToast.value = true;
  setTimeout(() => { copyToast.value = false; }, 2000);
}

function copyAll() {
  if (props.json) {
    navigator.clipboard.writeText(props.json);
    showToast();
  }
}

function copyPath() {
  if (selectedPath.value) {
    navigator.clipboard.writeText(selectedPath.value);
    showToast();
  }
}

function copyValue() {
  if (selectedNodeData.value != null) {
    const val =
      typeof selectedNodeData.value === "object"
        ? JSON.stringify(selectedNodeData.value, null, 2)
        : String(selectedNodeData.value);
    navigator.clipboard.writeText(val);
    showToast();
  }
}

function clearSearch() {
  searchQuery.value = "";
}

// 节点选中回调：从 vue-json-pretty 的 path 提取 JSONPath + 数据
function onNodeSelect(path: string | string[]) {
  const p = Array.isArray(path) ? path[0] || "" : path;
  selectedPath.value = p || "";
  if (!p) {
    selectedNodeData.value = null;
    return;
  }
  selectedNodeData.value = getNodeByPath(parsedData.value, p);
}

function getNodeByPath(data: JSONData | null, path: string): JSONData | null {
  if (!path || path === "$") return data;
  const rest = path.slice(1); // 去掉 "$"
  const segments = rest.match(/\.(\w+)|\[(\d+)\]|\["([^"]+)"\]/g);
  if (!segments) return data;
  let current: any = data;
  for (const seg of segments) {
    if (seg.startsWith(".")) {
      current = current?.[seg.slice(1)];
    } else if (seg.startsWith("[") && seg.endsWith("]")) {
      const inner = seg.slice(1, -1);
      const key = inner.startsWith('"') ? inner.slice(1, -1) : Number(inner);
      current = current?.[key];
    }
  }
  return current;
}

// 搜索高亮：自定义 Key 渲染
function renderSearchKey({ node, defaultKey }: { node: any; defaultKey: string }) {
  const isMatch = searchMatchPaths.value.has(node.path);
  return h("span", {
    style: isMatch
      ? "background: rgba(250, 204, 21, 0.35); border-radius: 2px; padding: 0 2px;"
      : "",
  }, defaultKey);
}

// 搜索高亮：自定义 Value 渲染
function renderSearchValue({ node, defaultValue }: { node: any; defaultValue: string }) {
  const isMatch = searchMatchPaths.value.has(node.path);
  return h("span", {
    style: isMatch
      ? "background: rgba(250, 204, 21, 0.35); border-radius: 2px; padding: 0 2px;"
      : "",
  }, defaultValue);
}

watch(() => props.json, parse, { immediate: true });
</script>

<template>
  <div class="flex flex-col h-full relative">
    <!-- 头部工具栏 -->
    <div class="px-3 py-2 border-b border-black/[0.03] dark:border-white/[0.04] flex-shrink-0">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-medium text-tertiary uppercase tracking-widest">Tree View</span>
        <div class="flex items-center gap-1">
          <button class="text-[10px] px-1.5 py-0.5 rounded text-blue-500 hover:bg-blue-500/[0.06] transition-colors" @click="expandAll">Expand</button>
          <button class="text-[10px] px-1.5 py-0.5 rounded text-blue-500 hover:bg-blue-500/[0.06] transition-colors" @click="collapseAll">Collapse</button>
          <button class="text-[10px] px-1.5 py-0.5 rounded text-tertiary hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors" @click="copyAll">Copy</button>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="relative">
        <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="w-full pl-7 pr-7 py-1.5 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-lg outline-none text-primary placeholder:text-tertiary border border-transparent focus:border-blue-500/30 transition-colors"
          placeholder="搜索节点..."
        />
        <button
          v-if="searchQuery"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary"
          @click="clearSearch"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 搜索结果统计 -->
      <div v-if="searchQuery && searchCount > 0" class="mt-1 text-[10px] text-tertiary">
        找到 {{ searchCount }} 个匹配项
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-if="errorMsg" class="p-3 text-xs text-rose-500">{{ errorMsg }}</div>
    <div v-else-if="parsedData == null" class="flex-1 flex items-center justify-center text-xs text-tertiary">
      Paste JSON in the editor
    </div>
    <div v-else class="flex-1 overflow-y-auto p-2 tree-container">
      <vue-json-pretty
        :key="treeKey"
        :data="parsedData"
        root-path="$"
        :deep="deep"
        :show-length="true"
        :show-line="true"
        :show-icon="true"
        :show-double-quotes="true"
        :highlight-selected-node="true"
        selectable-type="single"
        :selected-value="selectedPath"
        :theme="isDark ? 'dark' : 'light'"
        :render-node-key="renderSearchKey"
        :render-node-value="renderSearchValue"
        @selected-change="onNodeSelect"
      />
    </div>

    <!-- JSONPath 显示栏 -->
    <div
      v-if="selectedPath"
      class="px-3 py-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between flex-shrink-0 bg-black/[0.02] dark:bg-white/[0.03]"
    >
      <div class="flex items-center gap-2 min-w-0">
        <svg class="w-3.5 h-3.5 text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span class="text-xs font-mono text-secondary truncate">{{ selectedPath }}</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="px-2 py-1 text-[10px] rounded bg-blue-500/[0.08] text-blue-500 hover:bg-blue-500/[0.14] transition-colors flex-shrink-0"
          @click="copyPath"
        >
          复制路径
        </button>
        <button
          class="px-2 py-1 text-[10px] rounded bg-purple-500/[0.08] text-purple-500 hover:bg-purple-500/[0.14] transition-colors flex-shrink-0"
          @click="copyValue"
        >
          复制值
        </button>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <Transition name="toast">
      <div
        v-if="copyToast"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-700 text-white text-xs font-medium shadow-lg flex items-center gap-1.5"
      >
        <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        已复制到剪贴板
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>

<style>
/* vue-json-pretty 主题适配 */
.tree-container .vjs-tree {
  font-size: 12px;
  line-height: 1.7;
}

/* 替换默认三角箭头为 chevron 小箭头 */
.tree-container .vjs-carets {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transform: none !important;
  color: #9ca3af;
  transition: color 0.2s;
}
.tree-container .vjs-carets:hover {
  color: #3b82f6 !important;
}
.tree-container .vjs-carets svg {
  display: none;
}
.tree-container .vjs-carets::before {
  content: "";
  display: block;
  width: 5px;
  height: 5px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(-45deg);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: -1px;
}
.tree-container .vjs-carets-open::before {
  transform: rotate(45deg);
}
.tree-container .vjs-carets-close::before {
  transform: rotate(-45deg);
}
.dark .tree-container .vjs-carets {
  color: #6b7280;
}
.dark .tree-container .vjs-carets:hover {
  color: #60a5fa !important;
}

/* 浅色模式 - 适配项目的配色体系 */
.tree-container .vjs-key {
  color: #2563eb;
}
.tree-container .vjs-value-string {
  color: #059669;
}
.tree-container .vjs-value-number {
  color: #d97706;
}
.tree-container .vjs-value-boolean {
  color: #7c3aed;
}
.tree-container .vjs-value-null {
  color: #9ca3af;
}
.tree-container .vjs-tree-brackets {
  color: #6b7280;
}
.tree-container .vjs-tree-node:hover {
  background-color: rgba(59, 130, 246, 0.04);
  border-radius: 4px;
}
.tree-container .vjs-tree-node.is-highlight {
  background-color: rgba(59, 130, 246, 0.06);
  border-radius: 4px;
}
.tree-container .vjs-indent-unit.has-line {
  border-left: 1px dashed rgba(0, 0, 0, 0.08);
}

/* 暗色模式 */
.tree-container.dark .vjs-tree,
.dark .tree-container .vjs-tree {
  color: #e5e7eb;
}
.dark .tree-container .vjs-key {
  color: #60a5fa;
}
.dark .tree-container .vjs-value-string {
  color: #34d399;
}
.dark .tree-container .vjs-value-number {
  color: #fbbf24;
}
.dark .tree-container .vjs-value-boolean {
  color: #a78bfa;
}
.dark .tree-container .vjs-value-null {
  color: #6b7280;
}
.dark .tree-container .vjs-tree-brackets {
  color: #9ca3af;
}
.dark .tree-container .vjs-tree-node:hover {
  background-color: rgba(59, 130, 246, 0.08);
}
.dark .tree-container .vjs-tree-node.is-highlight {
  background-color: rgba(59, 130, 246, 0.1);
}
.dark .tree-container .vjs-indent-unit.has-line {
  border-left: 1px dashed rgba(255, 255, 255, 0.08);
}
</style>
