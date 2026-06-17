<script setup lang="ts">
import type { HeadingItem, MdStats } from "../../composables/md-toolkit/types";
import MdOutline from "./MdOutline.vue";
import MdWordStats from "./MdWordStats.vue";
import MdExportPanel from "./MdExportPanel.vue";

defineProps<{
  headings: HeadingItem[];
  stats: MdStats;
  content: string;
}>();

const emit = defineEmits<{
  newDoc: [];
  openFile: [];
  saveFile: [];
  exportHtml: [];
  copy: [];
}>();

interface QuickAction {
  label: string;
  icon: string;
  action: () => void;
}

const quickActions: QuickAction[] = [
  { label: "新建", icon: "M12 4v16m8-8H4", action: () => emit("newDoc") },
  { label: "打开", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5", action: () => emit("openFile") },
  { label: "保存", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3", action: () => emit("saveFile") },
  { label: "复制", icon: "M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184", action: () => emit("copy") },
  { label: "导出", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5", action: () => emit("exportHtml") },
  { label: "清空", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", action: () => emit("newDoc") },
];
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <!-- 大纲 -->
    <MdOutline
      :headings="headings"
      @select="() => {}"
    />

    <!-- 分隔线 -->
    <div class="mx-4 my-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />

    <!-- 快捷操作 -->
    <div class="flex flex-col">
      <div class="px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h3 class="text-xs font-semibold text-primary">快捷操作</h3>
      </div>
      <div class="grid grid-cols-3 gap-2 px-3 pb-3">
        <button
          v-for="action in quickActions"
          :key="action.label"
          class="quick-action flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] transition-all duration-200"
          @click="action.action()"
        >
          <svg class="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="action.icon" />
          </svg>
          <span class="text-[10px] text-tertiary">{{ action.label }}</span>
        </button>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="mx-4 my-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />

    <!-- 导出面板 -->
    <MdExportPanel />

    <!-- 分隔线 -->
    <div class="mx-4 my-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />

    <!-- 字数统计 -->
    <MdWordStats :stats="stats" />
  </div>
</template>

<style scoped>
.quick-action:hover {
  background: rgba(59, 130, 246, 0.06);
  transform: translateY(-1px);
}

.quick-action:hover svg {
  color: #3B82F6;
  transform: scale(1.1);
}

:global(.dark) .quick-action:hover {
  background: rgba(59, 130, 246, 0.1);
}
</style>
