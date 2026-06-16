<script setup lang="ts">
import { ref } from "vue";
import type { HeadingItem } from "../../composables/md-toolkit/types";

defineProps<{
  headings: HeadingItem[];
}>();

const emit = defineEmits<{
  select: [line: number];
}>();

const collapsed = ref<Set<string>>(new Set());

function toggleCollapse(id: string) {
  if (collapsed.value.has(id)) {
    collapsed.value.delete(id);
  } else {
    collapsed.value.add(id);
  }
}

function handleClick(line: number) {
  emit("select", line);
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 标题 -->
    <div class="px-4 py-3 flex items-center justify-between flex-shrink-0">
      <h3 class="text-xs font-semibold text-primary">文档目录</h3>
      <span class="text-[10px] text-tertiary">{{ headings.length }} 个标题</span>
    </div>

    <!-- 大纲树 -->
    <div class="flex-1 overflow-y-auto px-2 pb-3">
      <div v-if="headings.length === 0" class="text-center py-8">
        <svg class="w-8 h-8 mx-auto text-tertiary/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-[11px] text-tertiary">暂无标题</p>
      </div>

      <template v-for="item in headings" :key="item.id">
        <div
          class="outline-item group"
          :style="{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }"
          @click="handleClick(item.line)"
        >
          <!-- 展开/折叠按钮 -->
          <button
            v-if="item.children.length > 0"
            class="w-4 h-4 flex items-center justify-center text-tertiary hover:text-primary transition-colors"
            @click.stop="toggleCollapse(item.id)"
          >
            <svg
              class="w-3 h-3 transition-transform duration-200"
              :class="collapsed.has(item.id) ? '-rotate-90' : 'rotate-0'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-else class="w-4" />

          <!-- 标题文本 -->
          <span
            class="text-xs truncate transition-colors duration-150"
            :class="{
              'font-semibold text-primary': item.level === 1,
              'font-medium text-secondary': item.level === 2,
              'text-secondary': item.level === 3,
              'text-tertiary': item.level === 4,
            }"
          >
            {{ item.text }}
          </span>
        </div>

        <!-- 子标题 -->
        <template v-if="!collapsed.has(item.id)">
          <div
            v-for="child in item.children"
            :key="child.id"
            class="outline-item group"
            :style="{ paddingLeft: `${(child.level - 1) * 12 + 8}px` }"
            @click="handleClick(child.line)"
          >
            <div class="w-4" />
            <span
              class="text-xs truncate transition-colors duration-150"
              :class="{
                'font-medium text-secondary': child.level === 2,
                'text-secondary': child.level === 3,
                'text-tertiary': child.level === 4,
              }"
            >
              {{ child.text }}
            </span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.outline-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 4px;
  padding-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.outline-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark) .outline-item:hover {
  background: rgba(255, 255, 255, 0.04);
}
</style>
