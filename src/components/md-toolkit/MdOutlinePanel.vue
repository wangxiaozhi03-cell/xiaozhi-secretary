<script setup lang="ts">
import { computed } from "vue";

interface Heading {
  level: number;
  text: string;
  id: string;
  line: number;
}

const props = defineProps<{
  content: string;
}>();

const emit = defineEmits<{
  navigate: [line: number];
  close: [];
}>();

const headings = computed<Heading[]>(() => {
  const lines = props.content.split("\n");
  const result: Heading[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const text = match[2].replace(/[*_`~]/g, "").trim();
      result.push({
        level: match[1].length,
        text,
        id: `heading-${i}`,
        line: i,
      });
    }
  }
  return result;
});

const minLevel = computed(() => {
  if (headings.value.length === 0) return 1;
  return Math.min(...headings.value.map(h => h.level));
});

function indentFor(level: number): string {
  return `${(level - minLevel.value) * 12}px`;
}

function levelColor(level: number): string {
  const colors = [
    "text-blue-600 dark:text-blue-400",
    "text-emerald-600 dark:text-emerald-400",
    "text-amber-600 dark:text-amber-400",
    "text-purple-600 dark:text-purple-400",
    "text-rose-600 dark:text-rose-400",
    "text-gray-600 dark:text-gray-400",
  ];
  return colors[level - 1] || colors[5];
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 标题 -->
    <div class="px-4 py-3 flex items-center justify-between flex-shrink-0">
      <h3 class="text-xs font-semibold text-primary">文档大纲</h3>
      <button
        class="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-tertiary transition-colors"
        @click="emit('close')"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 空状态 -->
    <div v-if="headings.length === 0" class="px-4 py-8 text-center">
      <svg class="w-8 h-8 mx-auto text-tertiary/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-[10px] text-tertiary">暂无标题</p>
      <p class="text-[9px] text-tertiary/60 mt-1">使用 # 标记创建标题</p>
    </div>

    <!-- 标题列表 -->
    <div v-else class="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
      <button
        v-for="heading in headings"
        :key="heading.id"
        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] group"
        :style="{ paddingLeft: `calc(8px + ${indentFor(heading.level)})` }"
        @click="emit('navigate', heading.line)"
      >
        <span
          class="text-[9px] font-mono font-bold flex-shrink-0 w-4 text-center"
          :class="levelColor(heading.level)"
        >
          H{{ heading.level }}
        </span>
        <span class="text-[11px] text-secondary truncate group-hover:text-primary transition-colors">
          {{ heading.text }}
        </span>
      </button>
    </div>

    <!-- 底部统计 -->
    <div v-if="headings.length > 0" class="px-4 py-2 relative">
      <!-- 渐变分隔线 -->
      <div class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-black/8 to-transparent dark:via-white/8" />
      <span class="text-[9px] text-tertiary">{{ headings.length }} 个标题</span>
    </div>
  </div>
</template>
