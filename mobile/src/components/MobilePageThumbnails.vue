<script setup lang="ts">
import type { PageSettings, PageLayout, ImageItem } from "@/types/index";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@/types/papers";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  images: ImageItem[];
  pages: PageLayout[];
  settings: PageSettings;
  currentPage: number;
}>();

const emit = defineEmits<{
  goToPage: [pageIndex: number];
}>();

const containerRef = ref<HTMLDivElement | null>(null);

// 缩略图尺寸
const thumbWidth = 60;
const thumbHeight = computed(() => {
  const paper = getPaperDimensions(props.settings.paperSize, props.settings.orientation);
  return thumbWidth * (paper.height / paper.width);
});

// 计算每个缩略图中的图片位置和样式
function getThumbImageStyle(page: PageLayout, slotIdx: number) {
  const paper = getPaperDimensions(props.settings.paperSize, props.settings.orientation);
  const isEdgeToEdge = props.settings.gapMode === "edge-to-edge";
  const margin = isEdgeToEdge ? 0 : PAGE_MARGIN_MM;

  const scaleX = thumbWidth / paper.width;
  const scaleY = thumbHeight.value / paper.height;

  const slot = page.slots[slotIdx];
  const imgIdx = page.imageIndices[slotIdx];

  if (imgIdx === undefined || !slot || imgIdx >= props.images.length) {
    return { display: "none" };
  }

  const img = props.images[imgIdx];
  if (!img || !img.thumbUrl) {
    return { display: "none" };
  }

  // 计算 cover 模式下的图片样式
  const slotW = slot.width * scaleX;
  const slotH = slot.height * scaleY;

  const objectFit: "contain" | "cover" = isEdgeToEdge ? "cover" : "contain";

  return {
    position: "absolute" as const,
    left: `${(margin + slot.x) * scaleX}px`,
    top: `${(margin + slot.y) * scaleY}px`,
    width: `${slotW}px`,
    height: `${slotH}px`,
    objectFit: objectFit,
    borderRadius: isEdgeToEdge ? "0" : "1px",
  };
}

// 滚动到当前页
function scrollToCurrent() {
  if (!containerRef.value) return;
  const thumb = containerRef.value.children[props.currentPage] as HTMLElement;
  if (thumb) {
    thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
}

watch(() => props.currentPage, () => {
  scrollToCurrent();
});
</script>

<template>
  <div
    ref="containerRef"
    class="flex gap-2 px-2 py-2 overflow-x-auto"
    style="scrollbar-width: none; -ms-overflow-style: none;"
  >
    <div
      v-for="(page, index) in pages"
      :key="index"
      class="flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all duration-200"
      :class="[
        index === currentPage
          ? 'ring-2 ring-blue-500 shadow-md'
          : 'ring-1 ring-black/10 opacity-60 hover:opacity-80'
      ]"
      :style="{ width: `${thumbWidth}px`, height: `${thumbHeight}px` }"
      @click="emit('goToPage', index)"
    >
      <!-- 缩略图内容 -->
      <div class="relative w-full h-full bg-white">
        <!-- 渲染每张图片 -->
        <img
          v-for="(_slot, slotIdx) in page.slots"
          :key="slotIdx"
          :src="images[page.imageIndices[slotIdx]]?.thumbUrl"
          :alt="images[page.imageIndices[slotIdx]]?.name"
          class="select-none pointer-events-none"
          :style="getThumbImageStyle(page, slotIdx)"
          draggable="false"
        />

        <!-- 页码（如果没有图片时显示） -->
        <div v-if="page.imageIndices.length === 0" class="absolute inset-0 flex items-center justify-center">
          <span class="text-[10px] text-gray-400">{{ index + 1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 隐藏滚动条 */
div::-webkit-scrollbar {
  display: none;
}
</style>
