<script setup lang="ts">
import { exportHtml } from "../../composables/md-toolkit/useMdExport";
import { computed, inject, type Ref } from "vue";
import { renderHtml } from "../../composables/md-toolkit/useMarkdown";

const content = inject<Ref<string>>("content")!;

const renderedHtml = computed(() => renderHtml(content.value));

async function handleExportHtml() {
  await exportHtml(renderedHtml.value, "document");
}

const formats = [
  { id: "html", label: "HTML", desc: "网页文件", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", available: true },
  { id: "pdf", label: "PDF", desc: "即将推出", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", available: false },
  { id: "docx", label: "DOCX", desc: "即将推出", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", available: false },
];
</script>

<template>
  <div class="flex flex-col">
    <!-- 标题 -->
    <div class="px-4 py-3 flex items-center justify-between flex-shrink-0">
      <h3 class="text-xs font-semibold text-primary">导出</h3>
    </div>

    <!-- 导出格式列表 -->
    <div class="px-3 pb-3 space-y-1.5">
      <button
        v-for="fmt in formats"
        :key="fmt.id"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-left"
        :class="fmt.available
          ? 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05] cursor-pointer'
          : 'opacity-40 cursor-not-allowed'"
        :disabled="!fmt.available"
        @click="fmt.available && handleExportHtml()"
      >
        <div class="w-8 h-8 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="fmt.icon" />
          </svg>
        </div>
        <div class="min-w-0">
          <div class="text-xs font-medium text-primary">{{ fmt.label }}</div>
          <div class="text-[10px] text-tertiary">{{ fmt.desc }}</div>
        </div>
      </button>
    </div>
  </div>
</template>
