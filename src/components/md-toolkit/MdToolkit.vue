<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted } from "vue";
import MdToolbar from "./MdToolbar.vue";
import MdEditor from "./MdEditor.vue";
import MdPreview from "./MdPreview.vue";
import MdRightPanel from "./MdRightPanel.vue";
import { useMdEditor } from "../../composables/md-toolkit/useMdEditor";
import { renderHtml, extractHeadings, computeStats } from "../../composables/md-toolkit/useMarkdown";
import { exportHtml, copyHtml, copyMarkdown } from "../../composables/md-toolkit/useMdExport";
import type { MdViewMode } from "../../composables/md-toolkit/types";

const {
  content,
  cursorLine,
  cursorCol,
  isSaved,
  lastSavedAt,
  currentFilePath,
  undo,
  redo,
  insertAtCursor,
  onContentChange,
  saveToFile,
  loadFromFile,
  newDocument,
  startAutoSave,
  stopAutoSave,
  pushHistory,
} = useMdEditor();

// 视图模式
const mode = ref<MdViewMode>("split");
const showRightPanel = ref(true);

const tabs = [
  { id: "editor", label: "编辑器", shortcut: "⌘1" },
  { id: "preview", label: "预览", shortcut: "⌘2" },
  { id: "split", label: "分屏", shortcut: "⌘3" },
];

// 渲染后的 HTML
const renderedHtml = computed(() => renderHtml(content.value));
const headings = computed(() => extractHeadings(content.value));
const stats = computed(() => computeStats(content.value));

// provide 共享状态
provide("content", content);
provide("cursorLine", cursorLine);
provide("cursorCol", cursorCol);
provide("isSaved", isSaved);
provide("lastSavedAt", lastSavedAt);
provide("currentFilePath", currentFilePath);
provide("insertAtCursor", insertAtCursor);
provide("undo", undo);
provide("redo", redo);

// 格式化操作
function handleFormat(before: string, after?: string) {
  const textarea = document.querySelector(".md-editor-textarea") as HTMLTextAreaElement;
  if (textarea) {
    insertAtCursor(textarea, before, after);
  }
}

// 复制
async function handleCopy() {
  if (mode.value === "preview") {
    await copyHtml(renderedHtml.value);
  } else {
    await copyMarkdown(content.value);
  }
}

// 导出
async function handleExport() {
  await exportHtml(renderedHtml.value, "document");
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

// 初始化示例内容
function loadExample() {
  content.value = `# 欢迎使用 MD 工具

这是一款集 **Markdown 编写、实时预览、文档管理** 于一体的写作工具。

## 功能特性

- ✏️ 实时编辑与预览
- 📊 字数统计
- 📑 文档大纲
- 💾 自动保存
- 📤 导出 HTML

## 代码示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}

hello("小志秘书");
\`\`\`

## 表格

| 功能 | 状态 |
|------|------|
| 编辑器 | ✅ |
| 预览 | ✅ |
| 大纲 | ✅ |
| 导出 | ✅ |

> 💡 提示：使用 \`⌘S\` 保存，\`⌘O\` 打开文件

---

开始你的写作吧！ 🚀
`;
  pushHistory();
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  startAutoSave();
  if (!content.value) {
    loadExample();
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  stopAutoSave();
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 顶部导航 -->
    <header class="glass-bar px-4 py-2 flex items-center justify-between flex-shrink-0 border-b border-black/[0.04] dark:border-white/[0.06]">
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
              ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
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

    <!-- 格式化工具栏 -->
    <MdToolbar @format="handleFormat" />

    <!-- 内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 编辑/预览区 -->
      <div class="flex-1 flex min-w-0 overflow-hidden">
        <!-- 编辑器模式 -->
        <template v-if="mode === 'editor'">
          <MdEditor
            class="flex-1 min-w-0"
            @update:content="onContentChange"
          />
        </template>

        <!-- 预览模式 -->
        <template v-else-if="mode === 'preview'">
          <MdPreview
            class="flex-1 min-w-0"
            :html="renderedHtml"
          />
        </template>

        <!-- 分屏模式 -->
        <template v-else-if="mode === 'split'">
          <MdEditor
            class="w-1/2 min-w-0"
            @update:content="onContentChange"
          />
          <div class="w-1/2 min-w-0 border-l border-black/[0.04] dark:border-white/[0.06]">
            <MdPreview :html="renderedHtml" />
          </div>
        </template>
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
          :headings="headings"
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
