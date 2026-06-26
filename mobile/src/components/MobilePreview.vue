<script setup lang="ts">
import type { ImageItem, PageSettings, PageLayout, ImageSlot, PageOverrides, ImageOffset } from "@/types/index";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@/types/papers";
import { computed, ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  images: ImageItem[];
  pages: PageLayout[];
  basePages: PageLayout[];
  settings: PageSettings;
  currentPage: number;
  overrides: Record<number, PageOverrides>;
}>();

const emit = defineEmits<{
  setImageOffset: [imageIndex: number, offsetX: number, offsetY: number];
  setPageSlots: [slots: ImageSlot[]];
  dropOnSlot: [fromPage: number, fromSlot: number, toPage: number, toSlot: number];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const containerWidth = ref(390);
const containerHeight = ref(500);

const paper = computed(() =>
  getPaperDimensions(props.settings.paperSize, props.settings.orientation)
);

const isEdgeToEdge = computed(() => props.settings.gapMode === "edge-to-edge");
const marginMm = computed(() => isEdgeToEdge.value ? 0 : PAGE_MARGIN_MM);

const previewScale = computed(() => {
  const padding = 32;
  const availableWidth = containerWidth.value - padding;
  const availableHeight = containerHeight.value - padding;
  const paperW = paper.value.width;
  const paperH = paper.value.height;
  const scaleW = availableWidth / paperW;
  const scaleH = availableHeight / paperH;
  return Math.min(Math.max(Math.min(scaleW, scaleH), 0.3), 3);
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

// ===== 交互状态 =====
type InteractionMode = "idle" | "drag-swap" | "pan-image";

const interactionMode = ref<InteractionMode>("idle");

// --- 拖拽交换状态 ---
const dragSourceSlot = ref<number | null>(null);
const dragTargetSlot = ref<number | null>(null);

// --- 图片拖动状态（cover 模式） ---
const panSlotIdx = ref<number | null>(null);
const panStartPointer = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const panStartOffset = ref<ImageOffset>({ offsetX: 0.5, offsetY: 0.5 });

// 计算图片偏移样式
function getImageStyle(imgIdx: number) {
  const offset = props.overrides[props.currentPage]?.offsets?.[imgIdx];
  if (!offset || !isEdgeToEdge.value) return {};
  return {
    objectPosition: `${offset.offsetX * 100}% ${offset.offsetY * 100}%`,
  };
}

// ===== 触摸交互 =====
const touchStartPos = ref<{ x: number; y: number } | null>(null);
const touchModeDecided = ref(false);
const DRAG_THRESHOLD = 10; // px

function onTouchStart(e: TouchEvent, slotIdx: number) {
  if (interactionMode.value !== "idle") return;
  if (e.touches.length !== 1) return;

  const touch = e.touches[0];
  interactionMode.value = "drag-swap";
  dragSourceSlot.value = slotIdx;
  dragTargetSlot.value = null;
  touchStartPos.value = { x: touch.clientX, y: touch.clientY };
  touchModeDecided.value = false;
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length !== 1) return;
  const touch = e.touches[0];

  if (interactionMode.value === "drag-swap") {
    // 检测是否拖到了另一个 slot
    const targetSlot = hitTestSlot(touch.clientX, touch.clientY);
    if (targetSlot !== null && targetSlot !== dragSourceSlot.value) {
      touchModeDecided.value = true;
      dragTargetSlot.value = targetSlot;
      return;
    }

    // cover 模式下，超过阈值且没进入其他 slot → 切换为 pan 模式
    if (isEdgeToEdge.value && !touchModeDecided.value && touchStartPos.value) {
      const dist = Math.hypot(
        touch.clientX - touchStartPos.value.x,
        touch.clientY - touchStartPos.value.y
      );
      if (dist > DRAG_THRESHOLD) {
        touchModeDecided.value = true;
        interactionMode.value = "pan-image";
        panSlotIdx.value = dragSourceSlot.value;
        panStartPointer.value = { ...touchStartPos.value };
        const imgIdx = currentPageData.value?.imageIndices[dragSourceSlot.value!];
        if (imgIdx !== undefined) {
          const existing = props.overrides[props.currentPage]?.offsets?.[imgIdx];
          panStartOffset.value = existing ? { ...existing } : { offsetX: 0.5, offsetY: 0.5 };
        }
        resetDragState();
        return;
      }
    }

    dragTargetSlot.value = targetSlot;
  } else if (interactionMode.value === "pan-image") {
    updatePan(touch);
  }
}

function onTouchEnd(_e: TouchEvent) {
  if (interactionMode.value === "drag-swap") {
    if (
      dragSourceSlot.value !== null &&
      dragTargetSlot.value !== null &&
      dragSourceSlot.value !== dragTargetSlot.value
    ) {
      emit("dropOnSlot", props.currentPage, dragSourceSlot.value, props.currentPage, dragTargetSlot.value);
    }
    resetDragState();
    touchModeDecided.value = false;
    touchStartPos.value = null;
  } else if (interactionMode.value === "pan-image") {
    endPan();
  }
  interactionMode.value = "idle";
}

function resetDragState() {
  dragSourceSlot.value = null;
  dragTargetSlot.value = null;
}

// 检测触摸在哪个 slot 上
function hitTestSlot(clientX: number, clientY: number): number | null {
  const pageData = currentPageData.value;
  if (!pageData) return null;

  const paperEl = containerRef.value?.querySelector(".paper") as HTMLElement;
  if (!paperEl) return null;

  const paperRect = paperEl.getBoundingClientRect();
  const m = marginMm.value * previewScale.value;

  for (let i = 0; i < pageData.slots.length; i++) {
    const slot = pageData.slots[i];
    const left = paperRect.left + m + slot.x * previewScale.value;
    const top = paperRect.top + m + slot.y * previewScale.value;
    const w = slot.width * previewScale.value;
    const h = slot.height * previewScale.value;

    if (clientX >= left && clientX <= left + w && clientY >= top && clientY <= top + h) {
      return i;
    }
  }
  return null;
}

// ===== 图片拖动（cover 模式） =====
function updatePan(touch: Touch) {
  if (panSlotIdx.value === null || !currentPageData.value) return;

  const slot = currentPageData.value.slots[panSlotIdx.value];
  if (!slot) return;

  const slotPixelW = slot.width * previewScale.value;
  const slotPixelH = slot.height * previewScale.value;

  const imgIdx = currentPageData.value.imageIndices[panSlotIdx.value];
  const img = props.images[imgIdx];
  if (!img) return;

  const imgAspect = img.width / img.height;
  const slotAspect = slotPixelW / slotPixelH;

  let renderedW: number, renderedH: number;
  if (imgAspect > slotAspect) {
    renderedH = slotPixelH;
    renderedW = slotPixelH * imgAspect;
  } else {
    renderedW = slotPixelW;
    renderedH = slotPixelW / imgAspect;
  }

  const excessX = Math.max(0, renderedW - slotPixelW);
  const excessY = Math.max(0, renderedH - slotPixelH);

  const deltaX = touch.clientX - panStartPointer.value.x;
  const deltaY = touch.clientY - panStartPointer.value.y;

  let newOffsetX = panStartOffset.value.offsetX;
  let newOffsetY = panStartOffset.value.offsetY;

  if (excessX > 0) {
    newOffsetX = panStartOffset.value.offsetX - deltaX / excessX;
  }
  if (excessY > 0) {
    newOffsetY = panStartOffset.value.offsetY - deltaY / excessY;
  }

  newOffsetX = Math.max(0, Math.min(1, newOffsetX));
  newOffsetY = Math.max(0, Math.min(1, newOffsetY));

  emit("setImageOffset", imgIdx, newOffsetX, newOffsetY);
}

function endPan() {
  panSlotIdx.value = null;
}

// ===== 容器大小监听 =====
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
  resizeObserver = new ResizeObserver(() => updateContainerSize());
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<template>
  <div
    ref="containerRef"
    class="h-full overflow-hidden flex items-center justify-center p-4"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <!-- 空状态 -->
    <div v-if="images.length === 0" class="text-center px-8">
      <div class="w-20 h-20 mx-auto mb-4 rounded-3xl bg-blue-50 flex items-center justify-center">
        <svg class="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-sm text-secondary mb-1">拖拽图片到此处或点击下方「图片」添加</p>
      <p class="text-xs text-tertiary">支持 PNG、JPG、WEBP、BMP</p>
    </div>

    <!-- 预览纸张 -->
    <div v-else-if="currentPageData" class="paper rounded-xl fade-in" :style="paperStyle">
      <div class="relative w-full h-full overflow-hidden">
        <!-- 图片 slots -->
        <div
          v-for="(imgIdx, slotIdx) in currentPageData.imageIndices"
          :key="imgIdx"
          class="absolute overflow-hidden"
          :class="[
            isEdgeToEdge ? '' : 'rounded',
            dragSourceSlot === slotIdx ? 'opacity-40' : '',
            dragTargetSlot === slotIdx ? 'ring-2 ring-blue-500 ring-dashed' : '',
          ]"
          :style="getSlotStyle(currentPageData.slots[slotIdx])"
          @touchstart.passive="onTouchStart($event, slotIdx)"
        >
          <img
            :src="images[imgIdx]?.thumbUrl"
            :alt="images[imgIdx]?.name"
            class="w-full h-full select-none pointer-events-none"
            :class="isEdgeToEdge ? 'object-cover' : 'object-contain'"
            :style="getImageStyle(imgIdx)"
            draggable="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paper {
  background: white;
  border-radius: 16px;
  position: relative;
  box-shadow:
    0 4px 16px rgba(120, 140, 180, 0.08),
    0 12px 40px rgba(120, 140, 180, 0.06);
}
.fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
