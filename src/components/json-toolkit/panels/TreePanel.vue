<script setup lang="ts">
import { ref, computed, watch, h } from "vue";

const props = defineProps<{ json: string }>();

interface TreeNode {
  key: string;
  value: unknown;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  children: TreeNode[];
  expanded: boolean;
  path: string;
  highlighted: boolean;
}

const tree = ref<TreeNode | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const selectedPath = ref("");
const copyToast = ref(false);

function buildTree(data: unknown, key: string = "$", parentPath: string = "$"): TreeNode {
  const currentPath = parentPath === "$" ? "$" : `${parentPath}.${key}`;

  if (data === null) return { key, value: null, type: "null", children: [], expanded: true, path: currentPath, highlighted: false };
  if (Array.isArray(data)) {
    return {
      key,
      value: `Array(${data.length})`,
      type: "array",
      children: data.map((item, i) => buildTree(item, String(i), currentPath)),
      expanded: true,
      path: currentPath,
      highlighted: false,
    };
  }
  if (typeof data === "object") {
    const entries = Object.entries(data);
    return {
      key,
      value: `{${entries.length}}`,
      type: "object",
      children: entries.map(([k, v]) => buildTree(v, k, currentPath)),
      expanded: true,
      path: currentPath,
      highlighted: false,
    };
  }
  return { key, value: data, type: typeof data as TreeNode["type"], children: [], expanded: false, path: currentPath, highlighted: false };
}

function parse() {
  errorMsg.value = "";
  tree.value = null;
  const trimmed = props.json.trim();
  if (!trimmed) return;
  try {
    tree.value = buildTree(JSON.parse(trimmed));
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Invalid JSON";
  }
}

function toggleNode(node: TreeNode) {
  node.expanded = !node.expanded;
}

function expandAll() {
  if (!tree.value) return;
  walk(tree.value, (n) => { n.expanded = true; });
}

function collapseAll() {
  if (!tree.value) return;
  walk(tree.value, (n) => { n.expanded = false; });
  tree.value.expanded = true;
}

function walk(node: TreeNode, fn: (n: TreeNode) => void) {
  fn(node);
  node.children.forEach((c) => walk(c, fn));
}

// 搜索功能
const searchResults = computed(() => {
  if (!searchQuery.value.trim() || !tree.value) return [];
  const results: TreeNode[] = [];
  const query = searchQuery.value.toLowerCase();

  walk(tree.value, (node) => {
    const keyMatch = node.key.toLowerCase().includes(query);
    const valueMatch = String(node.value).toLowerCase().includes(query);
    if (keyMatch || valueMatch) {
      results.push(node);
      node.highlighted = true;
    } else {
      node.highlighted = false;
    }
  });

  return results;
});

// 复制路径
function copyPath() {
  if (selectedPath.value) {
    navigator.clipboard.writeText(selectedPath.value);
    showToast();
  }
}

// 复制节点值
function copyValue() {
  if (!selectedNode.value) return;
  const node = selectedNode.value;
  const value = node.children.length > 0
    ? JSON.stringify(node.value, null, 2)
    : String(node.value);
  navigator.clipboard.writeText(value);
  showToast();
}

// 选中的节点
const selectedNode = ref<TreeNode | null>(null);

// 选中节点
function selectNode(node: TreeNode) {
  selectedPath.value = node.path;
  selectedNode.value = node;
}

// 复制整个 JSON
function copyAll() {
  if (props.json) {
    navigator.clipboard.writeText(props.json);
    showToast();
  }
}

function showToast() {
  copyToast.value = true;
  setTimeout(() => { copyToast.value = false; }, 2000);
}

// 渲染节点
function renderNode(node: TreeNode, depth: number): ReturnType<typeof h> {
  const hasChildren = node.children.length > 0;
  const indent = depth * 16;

  const arrow = hasChildren
    ? h("span", {
        class: "inline-block w-4 text-center text-tertiary cursor-pointer select-none transition-transform",
        style: { transform: node.expanded ? "rotate(90deg)" : "rotate(0deg)" },
        onClick: (e: Event) => { e.stopPropagation(); toggleNode(node); },
      }, "▶")
    : h("span", { class: "inline-block w-4" });

  const keySpan = node.key !== "$"
    ? h("span", {
        class: "text-blue-600 dark:text-blue-400 mr-1",
        style: node.highlighted ? { background: "rgba(250, 204, 21, 0.3)", borderRadius: "2px" } : {},
      }, `"${node.key}"`)
    : null;
  const colon = node.key !== "$" ? h("span", { class: "text-tertiary mr-1" }, ": ") : null;

  let valueEl;
  if (hasChildren) {
    const bracket = node.type === "array" ? ["[", "]"] : ["{", "}"];
    const summary = node.expanded
      ? null
      : h("span", { class: "text-tertiary ml-1" }, ` ${node.children.length} items...`);
    valueEl = [h("span", { class: "text-tertiary" }, bracket[0]), summary, h("span", { class: "text-tertiary" }, bracket[1])];
  } else {
    const colorClass = node.type === "string" ? "text-emerald-600 dark:text-emerald-400" : node.type === "number" ? "text-amber-600 dark:text-amber-400" : node.type === "boolean" ? "text-purple-600 dark:text-purple-400" : "text-gray-400";
    const display = node.type === "string" ? `"${node.value}"` : String(node.value);
    valueEl = h("span", {
      class: colorClass,
      style: node.highlighted ? { background: "rgba(250, 204, 21, 0.3)", borderRadius: "2px" } : {},
    }, display);
  }

  const line = h("div", {
    class: `flex items-start hover:bg-blue-500/[0.04] rounded px-1 cursor-pointer ${selectedPath.value === node.path ? 'bg-blue-500/[0.06]' : ''}`,
    style: { paddingLeft: `${indent}px` },
    onClick: (e: Event) => { e.stopPropagation(); selectNode(node); },
  }, [arrow, keySpan, colon, valueEl].filter(Boolean));

  const children = (hasChildren && node.expanded)
    ? node.children.map((child) => renderNode(child, depth + 1))
    : [];

  return h("div", null, [line, ...children]);
}

// 清除搜索
function clearSearch() {
  searchQuery.value = "";
  if (tree.value) {
    walk(tree.value, (n) => { n.highlighted = false; });
  }
}

watch(() => props.json, parse, { immediate: true });
</script>

<template>
  <div class="flex flex-col h-full relative">
    <!-- 头部 -->
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
      <div v-if="searchQuery && searchResults.length > 0" class="mt-1 text-[10px] text-tertiary">
        找到 {{ searchResults.length }} 个匹配项
      </div>
    </div>

    <!-- 内容 -->
    <div v-if="errorMsg" class="p-3 text-xs text-rose-500">{{ errorMsg }}</div>
    <div v-else-if="!tree" class="flex-1 flex items-center justify-center text-xs text-tertiary">Paste JSON in the editor</div>
    <div v-else class="flex-1 overflow-y-auto p-2 font-mono text-[12px] leading-[1.6]">
      <component :is="() => renderNode(tree!, 0)" />
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
