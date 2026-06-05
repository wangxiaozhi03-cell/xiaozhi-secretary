<script setup lang="ts">
import type { ImageItem, PageSettings, PageLayout, ImageSlot } from "@/types";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@/types/papers";
import { computed } from "vue";

const props = defineProps<{
  images: ImageItem[];
  pages: PageLayout[];
  settings: PageSettings;
  currentPage: number;
}>();

const emit = defineEmits<{
  goToPage: [pageIndex: number];
}>();

const paper = computed(() =>
  getPaperDimensions(props.settings.paperSize, props.settings.orientation)
);

const isEdgeToEdge = computed(() => props.settings.gapMode === "edge-to-edge");
const marginMm = computed(() => isEdgeToEdge.value ? 0 : PAGE_MARGIN_MM);

// 缩略图尺寸
const THUMB_HEIGHT = 80;
const THUMB_SCALE = computed(() => {
  const paperH = paper.value.height;
  return THUMB_HEIGHT / paperH;
});

const thumbWidth = computed(() => paper.value.width * THUMB_SCALE.value);

function getThumbSlotStyle(slot: ImageSlot) {
  const m = marginMm.value * THUMB_SCALE.value;
  return {
    left: `${m + slot.x * THUMB_SCALE.value}px`,
    top: `${m + slot.y * THUMB_SCALE.value}px`,
    width: `${slot.width * THUMB_SCALE.value}px`,
    height: `${slot.height * THUMB_SCALE.value}px`,
  };
}
</script>

<template>
  <div class="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
    <div v-if="pages.length === 0" class="flex items-center justify-center h-20">
      <span class="text-xs text-gray-300">添加图片后显示页面缩略图</span>
    </div>
    <div v-else class="flex items-center gap-3 overflow-x-auto pb-1">
      <div
        v-for="(page, index) in pages"
        :key="index"
        class="flex-shrink-0 cursor-pointer rounded-lg border-2 transition-all hover:shadow-md"
        :class="index === currentPage
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300'"
        :style="{ width: `${thumbWidth + 8}px` }"
        @click="emit('goToPage', index)"
      >
        <!-- 缩略图容器 -->
        <div
          class="relative bg-white rounded overflow-hidden mx-1 mt-1"
          :style="{ height: `${THUMB_HEIGHT}px` }"
        >
          <!-- 页面内容缩略图 -->
          <div
            v-if="page"
            class="relative w-full h-full"
          >
            <div
              v-for="(imgIdx, slotIdx) in page.imageIndices"
              :key="imgIdx"
              class="absolute overflow-hidden"
              :style="getThumbSlotStyle(page.slots[slotIdx])"
            >
              <img
                v-if="images[imgIdx]"
                :src="images[imgIdx].thumbUrl"
                :alt="images[imgIdx].name"
                class="w-full h-full"
                :class="isEdgeToEdge ? 'object-cover' : 'object-contain'"
              />
            </div>
          </div>
        </div>

        <!-- 页码 -->
        <div class="text-center py-1">
          <span
            class="text-xs font-medium"
            :class="index === currentPage ? 'text-blue-500' : 'text-gray-400'"
          >
            {{ index + 1 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
div::-webkit-scrollbar {
  height: 4px;
}
div::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
div::-webkit-scrollbar-track {
  background: transparent;
}
</style>
