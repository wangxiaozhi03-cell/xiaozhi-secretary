<script setup lang="ts">
import type { ImageItem, PageSettings, PageLayout, ImageSlot } from "@/types";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@/types/papers";
import { computed, ref, watch } from "vue";
import { usePageDrag } from "@/composables/usePageDrag";

const props = defineProps<{
  images: ImageItem[];
  pages: PageLayout[];
  settings: PageSettings;
  currentPage: number;
}>();

const emit = defineEmits<{
  goToPage: [pageIndex: number];
}>();

const {
  dragState, dragPointerX, dragPointerY,
  setOverThumbnails, setHoverPage, setHoverSlot, hoverPageIndex, hoverSlotIndex,
} = usePageDrag();

const paper = computed(() =>
  getPaperDimensions(props.settings.paperSize, props.settings.orientation)
);

const isEdgeToEdge = computed(() => props.settings.gapMode === "edge-to-edge");
const marginMm = computed(() => isEdgeToEdge.value ? 0 : PAGE_MARGIN_MM);

const THUMB_HEIGHT = 64;
const THUMB_SCALE = computed(() => THUMB_HEIGHT / paper.value.height);
const thumbWidth = computed(() => paper.value.width * THUMB_SCALE.value);

const containerRef = ref<HTMLDivElement | null>(null);

function getThumbSlotStyle(slot: ImageSlot) {
  const m = marginMm.value * THUMB_SCALE.value;
  return {
    left: `${m + slot.x * THUMB_SCALE.value}px`,
    top: `${m + slot.y * THUMB_SCALE.value}px`,
    width: `${slot.width * THUMB_SCALE.value}px`,
    height: `${slot.height * THUMB_SCALE.value}px`,
  };
}

function checkPointerOverThumbnails() {
  if (!containerRef.value || !dragState.value) {
    setHoverPage(null);
    setHoverSlot(null);
    setOverThumbnails(false);
    return;
  }

  const rect = containerRef.value.getBoundingClientRect();
  const x = dragPointerX.value;
  const y = dragPointerY.value;

  const isInside = x >= rect.left && x <= rect.right && y >= rect.top - 20 && y <= rect.bottom + 20;
  setOverThumbnails(isInside);

  if (isInside) {
    const slotElements = containerRef.value.querySelectorAll("[data-page-slot]");
    let foundPage: number | null = null;
    let foundSlot: number | null = null;

    for (const el of slotElements) {
      const elRect = el.getBoundingClientRect();
      if (x >= elRect.left && x <= elRect.right && y >= elRect.top && y <= elRect.bottom) {
        const attr = el.getAttribute("data-page-slot") || "";
        const [pageStr, slotStr] = attr.split("-");
        const pageIdx = parseInt(pageStr);
        const slotIdx = parseInt(slotStr);
        if (!isNaN(pageIdx) && !isNaN(slotIdx)) {
          foundPage = pageIdx;
          foundSlot = slotIdx;
          break;
        }
      }
    }

    if (foundPage === null) {
      const pageElements = containerRef.value.querySelectorAll("[data-page-index]");
      for (const el of pageElements) {
        const elRect = el.getBoundingClientRect();
        if (x >= elRect.left && x <= elRect.right) {
          const idx = parseInt(el.getAttribute("data-page-index") || "-1");
          if (idx >= 0) {
            foundPage = idx;
            foundSlot = null;
            break;
          }
        }
      }
    }

    setHoverPage(foundPage);
    setHoverSlot(foundSlot);
  } else {
    setHoverPage(null);
    setHoverSlot(null);
  }
}

let checkInterval: ReturnType<typeof setInterval> | null = null;

watch(() => dragState.value, (newVal) => {
  if (newVal) {
    checkInterval = setInterval(checkPointerOverThumbnails, 40);
  } else {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    setHoverPage(null);
    setHoverSlot(null);
  }
});
</script>

<template>
  <div ref="containerRef" class="px-4 py-2.5 flex-shrink-0">
    <div v-if="pages.length === 0" class="flex items-center justify-center h-16">
      <span class="text-xs text-tertiary">添加图片后显示页面缩略图</span>
    </div>
    <div v-else class="flex items-center gap-2.5 overflow-x-auto pb-1">
      <div
        v-for="(page, pageIndex) in pages"
        :key="pageIndex"
        :data-page-index="pageIndex"
        class="flex-shrink-0 cursor-pointer rounded-xl transition-all duration-300"
        :class="[
          pageIndex === currentPage
            ? 'selected scale-[1.02]'
            : 'hover:bg-black/[0.02] hover:scale-[1.01]',
          dragState && hoverPageIndex === pageIndex && hoverSlotIndex === null
            ? 'ring-2 ring-blue-400/30 scale-[1.03]'
            : '',
        ]"
        :style="{ width: `${thumbWidth + 6}px` }"
        @click="emit('goToPage', pageIndex)"
      >
        <div
          class="relative rounded-lg overflow-hidden mx-1 mt-1"
          :style="{ height: `${THUMB_HEIGHT}px` }"
        >
          <div v-if="page" class="relative w-full h-full">
            <div
              v-for="(imgIdx, slotIdx) in page.imageIndices"
              :key="imgIdx"
              :data-page-slot="`${pageIndex}-${slotIdx}`"
              class="absolute overflow-hidden rounded-sm transition-all duration-200"
              :class="[
                dragState ? 'cursor-crosshair' : '',
                dragState && hoverPageIndex === pageIndex && hoverSlotIndex === slotIdx
                  ? 'ring-1 ring-blue-400/50 scale-[1.05] z-10'
                  : '',
              ]"
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

        <div class="text-center py-1">
          <span
            class="text-[10px] tabular-nums transition-colors"
            :class="pageIndex === currentPage ? 'text-accent' : 'text-tertiary'"
          >
            {{ pageIndex + 1 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
