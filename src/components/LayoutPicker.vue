<script setup lang="ts">
import type { LayoutDefinition } from "@/types";
import LayoutThumbnail from "./LayoutThumbnail.vue";

defineProps<{
  layouts: LayoutDefinition[];
  activeIndex: number;
  imageCount: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();
</script>

<template>
  <div class="p-5 flex-1 min-h-[180px] flex flex-col">
    <h2 class="text-[11px] font-medium text-tertiary uppercase tracking-widest mb-1.5 flex-shrink-0">布局模式</h2>
    <p class="text-[11px] text-tertiary mb-3 flex-shrink-0">
      {{ imageCount }} 张图片 · {{ layouts.length }} 种布局
    </p>

    <div class="flex-1 overflow-y-auto min-h-0">
      <div class="grid grid-cols-3 gap-2 fade-in" :key="imageCount">
        <button
          v-for="(layout, index) in layouts"
          :key="layout.id"
          class="p-2 rounded-xl transition-all duration-200 cursor-pointer"
          :class="index === activeIndex
            ? 'selected'
            : 'hover:bg-blue-50/50'"
          @click="emit('select', index)"
        >
          <div class="mb-1.5">
            <LayoutThumbnail :layout-id="layout.id" :image-count="imageCount" />
          </div>
          <p class="text-[10px] text-center text-secondary leading-tight">{{ layout.name }}</p>
        </button>
      </div>

      <div v-if="layouts.length === 0" class="text-center py-8">
        <p class="text-xs text-tertiary">请先添加图片</p>
      </div>
    </div>
  </div>
</template>
