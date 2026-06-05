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
  <div class="panel-section p-4 flex-1 min-h-[200px] flex flex-col">
    <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex-shrink-0">布局模式</h2>
    <p class="text-xs text-gray-400 mb-3 flex-shrink-0">
      {{ imageCount }} 张图片 · {{ layouts.length }} 种布局可选
    </p>

    <div class="flex-1 overflow-y-auto min-h-0">
      <div class="grid grid-cols-3 gap-1.5 fade-in" :key="imageCount">
        <div
          v-for="(layout, index) in layouts"
          :key="layout.id"
          class="border-2 rounded-lg p-1.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          :class="index === activeIndex
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-100 hover:border-gray-200'"
          @click="emit('select', index)"
        >
          <div class="mb-1">
            <LayoutThumbnail :layout-id="layout.id" :image-count="imageCount" />
          </div>
          <p class="text-xs text-center text-gray-500 leading-tight">{{ layout.name }}</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="layouts.length === 0" class="text-center py-8">
        <p class="text-xs text-gray-400">请先添加图片</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-section {
  border-bottom: 1px solid #f1f5f9;
}
.fade-in {
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
