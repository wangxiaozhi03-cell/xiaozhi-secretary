<script setup lang="ts">
import type { MdStats } from "../../composables/md-toolkit/types";

defineProps<{
  stats: MdStats;
}>();

const statItems = [
  { key: "chars", label: "字符", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
  { key: "words", label: "单词", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { key: "lines", label: "行", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { key: "paragraphs", label: "段落", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { key: "codeBlocks", label: "代码块", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "images", label: "图片", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
];
</script>

<template>
  <div class="flex flex-col">
    <!-- 标题 -->
    <div class="px-4 py-3 flex items-center justify-between flex-shrink-0">
      <h3 class="text-xs font-semibold text-primary">字数统计</h3>
      <span class="text-[10px] text-tertiary">阅读约 {{ stats.readTime }}</span>
    </div>

    <!-- 统计网格 -->
    <div class="grid grid-cols-3 gap-2 px-3 pb-3">
      <div
        v-for="item in statItems"
        :key="item.key"
        class="stat-item text-center px-2 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] transition-all duration-200"
      >
        <div class="text-sm font-semibold text-primary">
          {{ stats[item.key as keyof MdStats] }}
        </div>
        <div class="text-[10px] text-tertiary mt-0.5">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-item:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-1px);
}

:global(.dark) .stat-item:hover {
  background: rgba(59, 130, 246, 0.1);
}
</style>
