<script setup lang="ts">
import type { ImageItem, PageSettings, PageLayout, ImageSlot } from "@/types";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@/types/papers";
import { computed, ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  images: ImageItem[];
  pages: PageLayout[];
  settings: PageSettings;
  currentPage: number;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const containerWidth = ref(800);
const containerHeight = ref(600);

const paper = computed(() =>
  getPaperDimensions(props.settings.paperSize, props.settings.orientation)
);

const isEdgeToEdge = computed(() => props.settings.gapMode === "edge-to-edge");
const marginMm = computed(() => isEdgeToEdge.value ? 0 : PAGE_MARGIN_MM);

// 动态计算缩放比例，确保画布适应容器大小
const previewScale = computed(() => {
  const padding = 64; // p-8 = 32px * 2
  const availableWidth = containerWidth.value - padding;
  const availableHeight = containerHeight.value - padding;

  const paperW = paper.value.width;
  const paperH = paper.value.height;

  // 计算宽度和高度的缩放比例
  const scaleW = availableWidth / paperW;
  const scaleH = availableHeight / paperH;

  // 取较小值，确保画布完全显示在容器内
  // 限制最大缩放为 3，最小为 0.5
  return Math.min(Math.max(Math.min(scaleW, scaleH), 0.5), 3);
});

const paperStyle = computed(() => ({
  width: `${paper.value.width * previewScale.value}px`,
  height: `${paper.value.height * previewScale.value}px`,
  padding: `${marginMm.value * previewScale.value}px`,
}));

const currentPageData = computed(() => props.pages[props.currentPage]);

function getSlotStyle(slot: ImageSlot) {
  const m = marginMm.value * previewScale.value;
  return {
    left: `${m + slot.x * previewScale.value}px`,
    top: `${m + slot.y * previewScale.value}px`,
    width: `${slot.width * previewScale.value}px`,
    height: `${slot.height * previewScale.value}px`,
  };
}

// 监听容器大小变化
let resizeObserver: ResizeObserver | null = null;

function updateContainerSize() {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    containerWidth.value = rect.width;
    containerHeight.value = rect.height;
  }
}

onMounted(() => {
  updateContainerSize();

  resizeObserver = new ResizeObserver(() => {
    updateContainerSize();
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<template>
  <div ref="containerRef" class="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-8 bg-gray-100/60">
    <div v-if="images.length === 0" class="text-center">
      <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-200 flex items-center justify-center">
        <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-sm text-gray-400">添加图片后预览文档效果</p>
      <p class="text-xs text-gray-300 mt-1">支持 PNG、JPG、WEBP、BMP</p>
    </div>

    <div v-else-if="currentPageData" class="paper rounded fade-in" :style="paperStyle">
      <div class="relative w-full h-full overflow-hidden">
        <div
          v-for="(imgIdx, slotIdx) in currentPageData.imageIndices"
          :key="imgIdx"
          class="absolute overflow-hidden"
          :class="isEdgeToEdge ? '' : 'rounded'"
          :style="getSlotStyle(currentPageData.slots[slotIdx])"
        >
          <img
            :src="images[imgIdx]?.thumbUrl"
            :alt="images[imgIdx]?.name"
            class="w-full h-full"
            :class="isEdgeToEdge ? 'object-cover' : 'object-contain'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paper {
  background: white;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  position: relative;
}
.fade-in {
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
