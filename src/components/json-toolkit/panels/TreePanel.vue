<script setup lang="ts">
import { ref, watch, h } from "vue";

const props = defineProps<{ json: string }>();

interface TreeNode {
  key: string;
  value: unknown;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  children: TreeNode[];
  expanded: boolean;
}

const tree = ref<TreeNode | null>(null);
const errorMsg = ref("");

function buildTree(data: unknown, key: string = "$"): TreeNode {
  if (data === null) return { key, value: null, type: "null", children: [], expanded: true };
  if (Array.isArray(data)) {
    return { key, value: `Array(${data.length})`, type: "array", children: data.map((item, i) => buildTree(item, String(i))), expanded: true };
  }
  if (typeof data === "object") {
    const entries = Object.entries(data);
    return { key, value: `{${entries.length}}`, type: "object", children: entries.map(([k, v]) => buildTree(v, k)), expanded: true };
  }
  return { key, value: data, type: typeof data as TreeNode["type"], children: [], expanded: false };
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

function renderNode(node: TreeNode, depth: number): ReturnType<typeof h> {
  const hasChildren = node.children.length > 0;
  const indent = depth * 16;

  const arrow = hasChildren
    ? h("span", {
        class: "inline-block w-4 text-center text-tertiary cursor-pointer select-none transition-transform",
        style: { transform: node.expanded ? "rotate(90deg)" : "rotate(0deg)" },
        onClick: () => toggleNode(node),
      }, "▶")
    : h("span", { class: "inline-block w-4" });

  const keySpan = node.key !== "$"
    ? h("span", { class: "text-blue-600 dark:text-blue-400 mr-1" }, `"${node.key}"`)
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
    valueEl = h("span", { class: colorClass }, display);
  }

  const line = h("div", {
    class: "flex items-start hover:bg-blue-500/[0.04] rounded px-1",
    style: { paddingLeft: `${indent}px` },
  }, [arrow, keySpan, colon, valueEl].filter(Boolean));

  const children = (hasChildren && node.expanded)
    ? node.children.map((child) => renderNode(child, depth + 1))
    : [];

  return h("div", null, [line, ...children]);
}

watch(() => props.json, parse, { immediate: true });
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div class="px-3 py-1.5 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
      <span>Tree View</span>
      <div class="flex items-center gap-1">
        <button class="text-[10px] px-1.5 py-0.5 rounded text-blue-500 hover:bg-blue-500/[0.06] transition-colors" @click="expandAll">Expand</button>
        <button class="text-[10px] px-1.5 py-0.5 rounded text-blue-500 hover:bg-blue-500/[0.06] transition-colors" @click="collapseAll">Collapse</button>
      </div>
    </div>

    <!-- 内容 -->
    <div v-if="errorMsg" class="p-3 text-xs text-rose-500">{{ errorMsg }}</div>
    <div v-else-if="!tree" class="flex-1 flex items-center justify-center text-xs text-tertiary">Paste JSON in the editor</div>
    <div v-else class="flex-1 overflow-y-auto p-2 font-mono text-[12px] leading-[1.6]">
      <component :is="() => renderNode(tree!, 0)" />
    </div>
  </div>
</template>
