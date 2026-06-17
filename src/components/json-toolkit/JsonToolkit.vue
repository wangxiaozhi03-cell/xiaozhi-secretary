<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from "vue";
import BeautifyTool from "./tools/BeautifyTool.vue";
import EscapeTool from "./tools/EscapeTool.vue";
import TreePanel from "./panels/TreePanel.vue";
import DiffPanel from "./panels/DiffPanel.vue";
import type { ToolAction } from "../../composables/json-toolkit/types";

// 4 个模式：process / compare / visual / escape
const mode = ref<"process" | "compare" | "visual" | "escape">("process");
const mainJson = ref("");

// 可视化模式分隔线位置（百分比）
const splitPosition = ref(50);
const isDragging = ref(false);
const containerRef = ref<HTMLDivElement>();

// 拖拽调整分隔线
function startDrag(e: MouseEvent) {
  isDragging.value = true;
  e.preventDefault();

  const onMouseMove = (moveE: MouseEvent) => {
    if (!containerRef.value || !isDragging.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    const x = moveE.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    splitPosition.value = Math.min(Math.max(percent, 20), 80);
  };

  const onMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

const toolActions = ref<ToolAction[]>([]);
provide("registerToolActions", (actions: ToolAction[]) => {
  toolActions.value = actions;
});
provide("mainJson", mainJson);

// 顶部导航 Tab 配置
const tabs = [
  { id: "process", label: "处理" },
  { id: "compare", label: "对比" },
  { id: "visual", label: "可视化" },
  { id: "escape", label: "转义" },
];

function handleTabClick(tabId: string) {
  mode.value = tabId as typeof mode.value;
}

function handleAction(actionIndex: number) {
  toolActions.value[actionIndex]?.action();
}

// 快捷键处理
function handleKeydown(e: KeyboardEvent) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modifier = isMac ? e.metaKey : e.ctrlKey;

  if (modifier) {
    switch (e.key) {
      case "1":
        e.preventDefault();
        mode.value = "process";
        break;
      case "2":
        e.preventDefault();
        mode.value = "compare";
        break;
      case "3":
        e.preventDefault();
        mode.value = "visual";
        break;
      case "4":
        e.preventDefault();
        mode.value = "escape";
        break;
    }
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

// JSON 状态检测
const jsonStatus = ref<"empty" | "valid" | "invalid">("empty");
function updateJsonStatus(json: string) {
  const trimmed = json.trim();
  if (!trimmed) {
    jsonStatus.value = "empty";
    return;
  }
  try {
    JSON.parse(trimmed);
    jsonStatus.value = "valid";
  } catch {
    jsonStatus.value = "invalid";
  }
}

// 示例 JSON
const exampleJson = JSON.stringify({
  name: "小志秘书",
  version: "1.0.0",
  features: ["JSON 处理", "图片工具"],
  settings: {
    theme: "light",
    language: "zh-CN",
  },
}, null, 2);

function loadExample() {
  mainJson.value = exampleJson;
}

// 文件操作
async function importJson() {
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({
      multiple: false,
      filters: [
        { name: "JSON", extensions: ["json", "txt", "log"] },
      ],
    });
    if (selected) {
      const { readTextFile } = await import("@tauri-apps/plugin-fs");
      const content = await readTextFile(selected as string);
      mainJson.value = content;
    }
  } catch (err) {
    console.error("Import failed:", err);
  }
}

async function exportJson() {
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const filePath = await save({
      filters: [
        { name: "JSON", extensions: ["json"] },
      ],
      defaultPath: "output.json",
    });
    if (filePath) {
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");
      await writeTextFile(filePath, mainJson.value);
    }
  } catch (err) {
    console.error("Export failed:", err);
  }
}

// 拖拽导入
function handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
}

async function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        mainJson.value = content;
      }
    };
    reader.readAsText(file);
  }
}

provide("importJson", importJson);
provide("exportJson", exportJson);
provide("loadExample", loadExample);

// 操作按钮图标映射
function getActionIcon(icon: string) {
  const icons: Record<string, string> = {
    sparkle: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
    compress: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3",
    copy: "M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184",
    trash: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
    escape: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  };
  return icons[icon] || icons.sparkle;
}
</script>

<template>
  <div
    class="flex flex-col h-full overflow-hidden"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <!-- 顶部导航栏 -->
    <header class="glass-bar px-5 py-3 flex-shrink-0 border-b border-black/[0.04] dark:border-white/[0.06]">
      <!-- 第一行：标题 + Tab + 状态 -->
      <div class="flex items-center justify-between gap-3 mb-2">
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="text-sm font-semibold text-primary flex-shrink-0">JSON</h1>

          <!-- Tab 导航 -->
          <nav class="flex items-center gap-0.5 p-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 whitespace-nowrap"
              :class="mode === tab.id
                ? 'bg-black/[0.06] dark:bg-white/[0.08] text-primary shadow-sm'
                : 'text-tertiary hover:text-secondary'"
              @click="handleTabClick(tab.id)"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- JSON 状态 -->
        <div
          class="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full flex-shrink-0"
          :class="{
            'bg-gray-100 dark:bg-gray-800 text-tertiary': jsonStatus === 'empty',
            'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': jsonStatus === 'valid',
            'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400': jsonStatus === 'invalid',
          }"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="{
              'bg-gray-400': jsonStatus === 'empty',
              'bg-emerald-500': jsonStatus === 'valid',
              'bg-rose-500': jsonStatus === 'invalid',
            }"
          />
          {{ jsonStatus === 'empty' ? '等待输入' : jsonStatus === 'valid' ? 'Valid' : 'Invalid' }}
        </div>
      </div>

      <!-- 第二行：操作按钮（自动换行） -->
      <div class="flex items-center flex-wrap gap-1.5">
        <!-- 工具操作按钮 -->
        <template v-for="(act, idx) in toolActions" :key="idx">
          <button
            class="action-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer"
            :class="act.variant === 'primary'
              ? 'bg-blue-500/[0.10] text-blue-500 hover:bg-blue-500/[0.20] hover:shadow-sm active:scale-95'
              : 'text-tertiary hover:text-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:shadow-sm active:scale-95'"
            :title="act.label"
            @click="handleAction(idx)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="getActionIcon(act.icon)" />
            </svg>
            <span>{{ act.label }}</span>
          </button>
        </template>

        <!-- 分隔线 -->
        <div class="w-px h-5 bg-black/[0.08] dark:bg-white/[0.10] mx-0.5" />

        <!-- 文件操作 -->
        <button
          class="action-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-tertiary hover:text-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
          title="导入"
          @click="importJson"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span>导入</span>
        </button>
        <button
          class="action-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-tertiary hover:text-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
          title="导出"
          @click="exportJson"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span>导出</span>
        </button>
        <button
          class="action-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-tertiary hover:text-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
          title="示例"
          @click="loadExample"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span>示例</span>
        </button>
      </div>
    </header>

    <!-- 内容区 -->
    <div ref="containerRef" class="flex-1 relative min-h-0 overflow-hidden">
      <Transition name="tab-float" mode="out-in">
        <div v-if="mode === 'process'" key="process" class="flex h-full">
          <BeautifyTool
            class="flex-1 min-w-0"
            tab-id="main"
            :initial-state="{ input: mainJson }"
            @update:json="(v: string) => { mainJson = v; updateJsonStatus(v); }"
          />
        </div>

        <div v-else-if="mode === 'compare'" key="compare" class="h-full">
          <DiffPanel class="w-full h-full" :json-a="mainJson" />
        </div>

        <div v-else-if="mode === 'visual'" key="visual" class="flex h-full">
          <BeautifyTool
            class="min-w-0"
            :style="{ width: splitPosition + '%' }"
            tab-id="main"
            :initial-state="{ input: mainJson }"
            @update:json="(v: string) => { mainJson = v; updateJsonStatus(v); }"
          />

          <!-- 可拖拽分隔线 -->
          <div
            class="w-1 flex-shrink-0 cursor-col-resize group relative hover:bg-blue-500/20 transition-colors"
            :class="{ 'bg-blue-500/30': isDragging }"
            @mousedown="startDrag"
          >
            <div class="absolute inset-y-0 -left-1 -right-1" />
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-black/10 dark:bg-white/10 group-hover:bg-blue-500/50 transition-colors" />
          </div>

          <div class="min-w-0 flex-1">
            <TreePanel :json="mainJson" />
          </div>
        </div>

        <div v-else-if="mode === 'escape'" key="escape" class="flex h-full">
          <EscapeTool
            class="flex-1 min-w-0"
            :json="mainJson"
            @update:json="(v: string) => { mainJson = v; updateJsonStatus(v); }"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.tab-float-enter-active { transition: all 0.38s cubic-bezier(0.16, 1, 0.3, 1); }
.tab-float-leave-active { transition: all 0.18s ease-in; }
.tab-float-enter-from { opacity: 0; transform: translateY(14px) scale(0.98); }
.tab-float-leave-to { opacity: 0; transform: translateY(-6px) scale(0.99); }
</style>
