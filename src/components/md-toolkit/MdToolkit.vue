<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { MdEditor, config } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import screenfull from "screenfull";
import prettier from "prettier";
import parserMarkdown from "prettier/plugins/markdown";
import MdRightPanel from "./MdRightPanel.vue";
import { useMdEditor } from "../../composables/md-toolkit/useMdEditor";
import { computeStats } from "../../composables/md-toolkit/useMarkdown";
import { exportHtml, copyHtml, copyMarkdown } from "../../composables/md-toolkit/useMdExport";
import type { MdViewMode } from "../../composables/md-toolkit/types";

// 配置 md-editor-v3 外部依赖
config({
  editorExtensions: {
    screenfull: { instance: screenfull },
    prettier: { prettierInstance: prettier, parserMarkdownInstance: parserMarkdown },
  },
});

const {
  content,
  isSaved,
  saveToFile,
  loadFromFile,
  newDocument,
  onContentChange,
  startAutoSave,
  stopAutoSave,
} = useMdEditor();

// 视图模式
const mode = ref<MdViewMode>("split");
const showRightPanel = ref(true);
const mdEditorRef = ref<InstanceType<typeof MdEditor>>();

const tabs = [
  { id: "editor", label: "编辑器", shortcut: "⌘1" },
  { id: "preview", label: "预览", shortcut: "⌘2" },
  { id: "split", label: "分屏", shortcut: "⌘3" },
];

// 编辑器模式映射
const editorPreview = computed(() => mode.value === "split");
const editorPreviewOnly = computed(() => mode.value === "preview");

// 暗色模式检测
const editorTheme = ref<"light" | "dark">("light");

function updateTheme() {
  editorTheme.value = document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// 工具栏配置
const toolbars: any[] = [
  "bold", "underline", "italic", "strikeThrough",
  "-",
  "title", "sub", "sup",
  "-",
  "quote", "unorderedList", "orderedList", "task",
  "-",
  "codeRow", "code", "link", "image", "table",
  "-",
  "revoke", "next",
  "-",
  "prettier", "save",
  "=",
  "pageFullscreen", "fullscreen", "preview",
];

// 内容变化
function handleChange(val: string) {
  onContentChange(val);
}

// 保存
function handleSave(val: string) {
  onContentChange(val);
  saveToFile();
}

// HTML 变化（用于导出）
const currentHtml = ref("");
function handleHtmlChanged(html: string) {
  currentHtml.value = html;
}

// 统计
const stats = computed(() => computeStats(content.value));

// 复制
async function handleCopy() {
  if (mode.value === "preview") {
    await copyHtml(currentHtml.value);
  } else {
    await copyMarkdown(content.value);
  }
}

// 导出
async function handleExport() {
  await exportHtml(currentHtml.value, "document");
}

// 清空
function handleClear() {
  if (content.value.trim() && !confirm("确定要清空所有内容吗？")) return;
  newDocument();
}

// 快捷键
function handleKeydown(e: KeyboardEvent) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modifier = isMac ? e.metaKey : e.ctrlKey;

  if (modifier) {
    switch (e.key) {
      case "s":
        e.preventDefault();
        saveToFile();
        break;
      case "o":
        e.preventDefault();
        loadFromFile();
        break;
      case "1":
        e.preventDefault();
        mode.value = "editor";
        break;
      case "2":
        e.preventDefault();
        mode.value = "preview";
        break;
      case "3":
        e.preventDefault();
        mode.value = "split";
        break;
    }
  }
}

let themeObserver: MutationObserver | null = null;

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  startAutoSave();
  updateTheme();
  themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  stopAutoSave();
  themeObserver?.disconnect();
});
</script>

<template>
  <div class="md-toolkit-wrapper flex flex-col h-full overflow-hidden">
    <!-- 顶部导航 -->
    <header class="glass-bar px-5 py-3 flex items-center justify-between flex-shrink-0 border-b border-black/[0.04] dark:border-white/[0.06]">
      <!-- 左侧：标题 + Tab -->
      <div class="flex items-center gap-4">
        <h1 class="text-sm font-semibold text-primary">MD 工具</h1>
        <p class="text-xs text-tertiary hidden md:block">Markdown 编辑、预览、导出</p>

        <!-- Tab 导航 -->
        <nav class="flex items-center gap-1 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.05]">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
            :class="mode === tab.id
              ? 'bg-black/[0.06] dark:bg-white/[0.08] text-primary shadow-sm'
              : 'text-tertiary hover:text-secondary'"
            @click="mode = tab.id as MdViewMode"
          >
            <span>{{ tab.label }}</span>
            <kbd class="text-[9px] px-1 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] text-tertiary font-mono">
              {{ tab.shortcut }}
            </kbd>
          </button>
        </nav>
      </div>

      <!-- 右侧：状态 + 操作 -->
      <div class="flex items-center gap-3">
        <!-- 保存状态 -->
        <span
          class="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
          :class="isSaved
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="isSaved ? 'bg-emerald-500' : 'bg-amber-500'" />
          {{ isSaved ? '已保存' : '未保存' }}
        </span>

        <!-- 快捷操作 -->
        <div class="flex items-center gap-1">
          <button class="btn-icon" title="新建" @click="handleClear">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button class="btn-icon" title="打开 (⌘O)" @click="loadFromFile">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
          <button class="btn-icon" title="保存 (⌘S)" @click="saveToFile">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button class="btn-icon" title="复制" @click="handleCopy">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </button>
          <button class="btn-icon" title="导出" @click="handleExport">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 编辑器 -->
      <div class="flex-1 min-w-0 overflow-hidden">
        <MdEditor
          ref="mdEditorRef"
          :model-value="content"
          :theme="editorTheme"
          :preview="editorPreview"
          :preview-only="editorPreviewOnly"
          :toolbars="toolbars"
          preview-theme="github"
          code-theme="atom-one-dark"
          :show-code-row-number="true"
          :no-mermaid="true"
          :no-katex="true"
          :no-highlight="false"
          :tab-width="2"
          placeholder="开始输入 Markdown..."
          language="zh-CN"
          class="md-glass-editor"
          @update:model-value="handleChange"
          @on-save="handleSave"
          @on-html-changed="handleHtmlChanged"
        />
      </div>

      <!-- 右侧面板 -->
      <aside
        class="glass-panel flex flex-col flex-shrink-0 overflow-hidden transition-all duration-300"
        :class="showRightPanel ? 'w-[280px]' : 'w-10'"
      >
        <button
          class="h-9 flex items-center justify-center hover:bg-black/[0.02] transition-colors text-tertiary"
          @click="showRightPanel = !showRightPanel"
        >
          <svg
            class="w-4 h-4 transition-transform duration-300"
            :class="showRightPanel ? 'rotate-0' : 'rotate-180'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        <MdRightPanel
          v-if="showRightPanel"
          :stats="stats"
          :content="content"
          @new-doc="handleClear"
          @open-file="loadFromFile"
          @save-file="saveToFile"
          @export-html="handleExport"
          @copy="handleCopy"
        />
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* md-editor-v3 主题适配：使用 :deep 穿透到子组件 */
.md-toolkit-wrapper :deep(.md-editor) {
  height: 100%;
  border: none;
  border-radius: 0;
  background: transparent;
}

.md-toolkit-wrapper :deep(.md-editor-toolbar-wrapper) {
  background: rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.35);
  border-bottom: 0.5px solid rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.25);
}

.md-toolkit-wrapper :deep(.md-editor-toolbar) {
  background: transparent;
}

.md-toolkit-wrapper :deep(.cm-editor) {
  background: rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.08) !important;
}

.md-toolkit-wrapper :deep(.cm-gutters) {
  background: rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.15) !important;
  border-right: 0.5px solid rgba(0, 0, 0, 0.04) !important;
}

.md-toolkit-wrapper :deep(.md-editor-preview) {
  background: rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.08);
}

/* 列表渲染修复：Tailwind preflight 重置了 list-style */
.md-toolkit-wrapper :deep(.md-editor-preview ul) {
  list-style-type: disc !important;
  padding-left: 2em !important;
}
.md-toolkit-wrapper :deep(.md-editor-preview ol) {
  list-style-type: decimal !important;
  padding-left: 2em !important;
}
.md-toolkit-wrapper :deep(.md-editor-preview ul ul) {
  list-style-type: circle !important;
}
.md-toolkit-wrapper :deep(.md-editor-preview ul ul ul) {
  list-style-type: square !important;
}
.md-toolkit-wrapper :deep(.md-editor-preview ol ol) {
  list-style-type: lower-alpha !important;
}
.md-toolkit-wrapper :deep(.md-editor-preview li) {
  display: list-item !important;
}
.md-toolkit-wrapper :deep(.md-editor-preview li + li) {
  margin-top: 0.25em;
}

.md-toolkit-wrapper :deep(.md-editor-footer) {
  background: rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.25);
  border-top: 0.5px solid rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.25);
}

/* 暗色模式 */
.md-toolkit-wrapper :deep(.md-editor-dark) {
  background: transparent;
}

.md-toolkit-wrapper :deep(.md-editor-dark .md-editor-toolbar-wrapper) {
  background: rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.20);
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.md-toolkit-wrapper :deep(.md-editor-dark .cm-editor) {
  background: rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.06) !important;
}

.md-toolkit-wrapper :deep(.md-editor-dark .cm-gutters) {
  background: rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.12) !important;
  border-right-color: rgba(255, 255, 255, 0.04) !important;
}

.md-toolkit-wrapper :deep(.md-editor-dark .md-editor-preview) {
  background: rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.06);
}

.md-toolkit-wrapper :deep(.md-editor-dark .md-editor-footer) {
  background: rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.15);
  border-top-color: rgba(255, 255, 255, 0.04);
}

/* 全屏适配 */
.md-toolkit-wrapper :deep(.md-editor-fullscreen) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 99999 !important;
  border-radius: 0 !important;
}
</style>
