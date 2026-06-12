<script setup lang="ts">
import { ref, provide } from "vue";
import JsonIconBar from "./JsonIconBar.vue";
import BeautifyTool from "./tools/BeautifyTool.vue";
import TreePanel from "./panels/TreePanel.vue";
import DiffPanel from "./panels/DiffPanel.vue";
import { usePluginRegistry } from "../../composables/json-toolkit/usePluginRegistry";
import type { ToolAction } from "../../composables/json-toolkit/types";

const { categories, registerCategory } = usePluginRegistry();

const TOOL_CATEGORIES = [
  { id: "json-process", label: "JSON 处理", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "json-visual", label: "JSON 可视化", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { id: "compare", label: "JSON 对比", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
];

for (const cat of TOOL_CATEGORIES) {
  registerCategory({ id: cat.id, label: cat.label, icon: cat.icon });
}

const mode = ref<"normal" | "compare" | "visual">("normal");
const mainJson = ref("");

const toolActions = ref<ToolAction[]>([]);
provide("registerToolActions", (actions: ToolAction[]) => {
  toolActions.value = actions;
});
provide("mainJson", mainJson);

function handleCategoryClick(catId: string) {
  if (catId === "json-process") {
    mode.value = "normal";
  } else if (catId === "compare") {
    mode.value = mode.value === "compare" ? "normal" : "compare";
  } else if (catId === "json-visual") {
    mode.value = mode.value === "visual" ? "normal" : "visual";
  }
}

function handleAction(actionIndex: number) {
  toolActions.value[actionIndex]?.action();
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 顶部栏 -->
    <header class="glass-bar px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-semibold text-primary">JSON 工具</h1>
        <span class="tag">{{ mode === 'normal' ? 'JSON 处理' : mode === 'compare' ? 'JSON 对比' : 'JSON 可视化' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-tertiary">{{ mainJson.trim() ? 'Valid JSON' : '等待输入' }}</span>
      </div>
    </header>

    <!-- 内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <JsonIconBar
        :categories="categories"
        :active-category="mode === 'normal' ? 'json-process' : mode"
        :actions="toolActions"
        @toggle-category="handleCategoryClick"
        @action="handleAction"
      />

      <div class="flex-1 flex min-w-0 overflow-hidden">
      <template v-if="mode === 'compare'">
        <BeautifyTool class="w-1/2 min-w-0" tab-id="main" @update:json="(v: string) => mainJson = v" />
        <div class="w-1/2 min-w-0 border-l border-black/[0.04] dark:border-white/[0.06]">
          <DiffPanel :json-a="mainJson" />
        </div>
      </template>

      <template v-else-if="mode === 'visual'">
        <BeautifyTool class="flex-1 min-w-0" tab-id="main" @update:json="(v: string) => mainJson = v" />
        <div class="w-[360px] flex-shrink-0 border-l border-black/[0.04] dark:border-white/[0.06]">
          <TreePanel :json="mainJson" />
        </div>
      </template>

      <!-- 普通模式：全宽编辑器 -->
      <template v-else>
        <BeautifyTool class="flex-1 min-w-0" tab-id="main" @update:json="(v: string) => mainJson = v" />
      </template>
      </div>
    </div>
  </div>
</template>
