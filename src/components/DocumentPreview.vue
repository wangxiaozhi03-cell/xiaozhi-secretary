<script setup lang="ts">
import type { ImageItem, PageSettings, PageLayout, ImageSlot, PageOverrides, ImageOffset } from "@/types";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@/types/papers";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { usePageDrag } from "@/composables/usePageDrag";

const props = defineProps<{
  images: ImageItem[];
  pages: PageLayout[];         // merged pages
  basePages: PageLayout[];     // raw pages from useLayout
  settings: PageSettings;
  currentPage: number;
  overrides: Record<number, PageOverrides>;
}>();

const emit = defineEmits<{
  setImageOffset: [imageIndex: number, offsetX: number, offsetY: number];
  setPageSlots: [slots: ImageSlot[]];
  /** 拖拽放置：移动图片到目标页面的目标 slot 位置 */
  dropOnSlot: [fromPage: number, fromSlot: number, toPage: number, toSlot: number];
}>();

const { startDrag, updatePointer, endDrag, cancelDrag } = usePageDrag();

const containerRef = ref<HTMLDivElement | null>(null);
const containerWidth = ref(800);
const containerHeight = ref(600);

const paper = computed(() =>
  getPaperDimensions(props.settings.paperSize, props.settings.orientation)
);

const isEdgeToEdge = computed(() => props.settings.gapMode === "edge-to-edge");
const marginMm = computed(() => isEdgeToEdge.value ? 0 : PAGE_MARGIN_MM);

const previewScale = computed(() => {
  const padding = 64;
  const availableWidth = containerWidth.value - padding;
  const availableHeight = containerHeight.value - padding;
  const paperW = paper.value.width;
  const paperH = paper.value.height;
  const scaleW = availableWidth / paperW;
  const scaleH = availableHeight / paperH;
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

// ===== 交互状态 =====
type InteractionMode = "idle" | "drag-swap" | "pan-image" | "resize";

const interactionMode = ref<InteractionMode>("idle");

// --- 拖拽交换状态 ---
const dragSourceSlot = ref<number | null>(null);
const dragTargetSlot = ref<number | null>(null);
const dragPointerPos = ref<{ x: number; y: number } | null>(null);
const dragGhostSrc = ref<string>("");

// --- 图片拖动状态（cover 模式） ---
const panSlotIdx = ref<number | null>(null);
const panStartPointer = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const panStartOffset = ref<ImageOffset>({ offsetX: 0.5, offsetY: 0.5 });

// --- 分区调整状态 ---
const resizeSlotA = ref<number | null>(null);
const resizeSlotB = ref<number | null>(null);
const resizeAxis = ref<"horizontal" | "vertical">("horizontal");
const resizeStartPointer = ref<number>(0);
const resizeStartSlots = ref<ImageSlot[]>([]);

// 计算图片偏移样式
function getImageStyle(imgIdx: number) {
  const offset = props.overrides[props.currentPage]?.offsets?.[imgIdx];
  if (!offset || !isEdgeToEdge.value) return {};
  return {
    objectPosition: `${offset.offsetX * 100}% ${offset.offsetY * 100}%`,
  };
}

// ===== 拖拽交换 =====
// 用于区分 cover 模式下的 pan 和 swap
const dragStartPos = ref<{ x: number; y: number } | null>(null);
const dragModeDecided = ref(false);
const DRAG_THRESHOLD = 8; // px，超过此距离才判定为 pan

function onSlotPointerDown(e: PointerEvent, slotIdx: number) {
  if (interactionMode.value !== "idle") return;

  // 记录起始位置，但不立即决定模式
  interactionMode.value = "drag-swap";
  dragSourceSlot.value = slotIdx;
  dragTargetSlot.value = null;
  dragPointerPos.value = { x: e.clientX, y: e.clientY };
  dragStartPos.value = { x: e.clientX, y: e.clientY };
  dragModeDecided.value = false;

  const imgIdx = currentPageData.value?.imageIndices[slotIdx];
  if (imgIdx !== undefined && props.images[imgIdx]) {
    dragGhostSrc.value = props.images[imgIdx].thumbUrl;
    startDrag({
      sourcePageIndex: props.currentPage,
      sourceSlotIndex: slotIdx,
      imageIndex: imgIdx,
      thumbUrl: props.images[imgIdx].thumbUrl,
    });
  }

  (e.target as HTMLElement).setPointerCapture(e.pointerId);
}

function onPaperPointerMove(e: PointerEvent) {
  if (interactionMode.value === "drag-swap") {
    dragPointerPos.value = { x: e.clientX, y: e.clientY };
    updatePointer(e.clientX, e.clientY);

    // 检测是否拖到了另一个 slot（swap 模式）
    const targetSlot = hitTestSlot(e.clientX, e.clientY);
    if (targetSlot !== null && targetSlot !== dragSourceSlot.value) {
      // 进入了另一个 slot 的区域 → swap 模式
      dragModeDecided.value = true;
      dragTargetSlot.value = targetSlot;
      return;
    }

    // cover 模式下，超过阈值且没进入其他 slot → 切换为 pan 模式
    if (isEdgeToEdge.value && !dragModeDecided.value && dragStartPos.value) {
      const dist = Math.hypot(
        e.clientX - dragStartPos.value.x,
        e.clientY - dragStartPos.value.y
      );
      if (dist > DRAG_THRESHOLD) {
        // 超过阈值，切换为 pan 模式
        dragModeDecided.value = true;
        interactionMode.value = "pan-image";
        panSlotIdx.value = dragSourceSlot.value;
        panStartPointer.value = { ...dragStartPos.value };
        const imgIdx = currentPageData.value?.imageIndices[dragSourceSlot.value!];
        if (imgIdx !== undefined) {
          const existing = props.overrides[props.currentPage]?.offsets?.[imgIdx];
          panStartOffset.value = existing ? { ...existing } : { offsetX: 0.5, offsetY: 0.5 };
        }
        // 清理拖拽状态
        resetDragState();
        return;
      }
    }

    // 非 cover 模式，或 cover 模式还没决定 → 检测目标 slot
    dragTargetSlot.value = targetSlot;
  } else if (interactionMode.value === "pan-image") {
    updatePan(e);
  } else if (interactionMode.value === "resize") {
    updateResize(e);
  }
}

function onPaperPointerUp(_e: PointerEvent) {
  if (interactionMode.value === "drag-swap") {
    // 检查是否拖到了缩略图区域
    const crossPageData = endDrag();
    if (crossPageData && crossPageData.targetPageIndex !== undefined) {
      const toSlot = crossPageData.targetSlotIndex ?? 0;
      emit("dropOnSlot", crossPageData.sourcePageIndex, crossPageData.sourceSlotIndex, crossPageData.targetPageIndex, toSlot);
    } else if (
      dragSourceSlot.value !== null &&
      dragTargetSlot.value !== null &&
      dragSourceSlot.value !== dragTargetSlot.value
    ) {
      // 同页面内：移动到目标位置（其他图片自动前移）
      emit("dropOnSlot", props.currentPage, dragSourceSlot.value, props.currentPage, dragTargetSlot.value);
    }
    resetDragState();
    dragModeDecided.value = false;
    dragStartPos.value = null;
  } else if (interactionMode.value === "pan-image") {
    endPan();
  } else if (interactionMode.value === "resize") {
    endResize();
  }
  interactionMode.value = "idle";
}

function resetDragState() {
  dragSourceSlot.value = null;
  dragTargetSlot.value = null;
  dragPointerPos.value = null;
  dragGhostSrc.value = "";
  cancelDrag();
}

// 检测鼠标在哪个 slot 上
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
function updatePan(e: PointerEvent) {
  if (panSlotIdx.value === null || !currentPageData.value) return;

  const slot = currentPageData.value.slots[panSlotIdx.value];
  if (!slot) return;

  const slotPixelW = slot.width * previewScale.value;
  const slotPixelH = slot.height * previewScale.value;

  // 计算 cover 模式下图片的溢出量
  const imgIdx = currentPageData.value.imageIndices[panSlotIdx.value];
  const img = props.images[imgIdx];
  if (!img) return;

  const imgAspect = img.width / img.height;
  const slotAspect = slotPixelW / slotPixelH;

  let renderedW: number, renderedH: number;
  if (imgAspect > slotAspect) {
    // 图片更宽，高度填满，宽度溢出
    renderedH = slotPixelH;
    renderedW = slotPixelH * imgAspect;
  } else {
    // 图片更高，宽度填满，高度溢出
    renderedW = slotPixelW;
    renderedH = slotPixelW / imgAspect;
  }

  const excessX = Math.max(0, renderedW - slotPixelW);
  const excessY = Math.max(0, renderedH - slotPixelH);

  const deltaX = e.clientX - panStartPointer.value.x;
  const deltaY = e.clientY - panStartPointer.value.y;

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

// ===== 分区调整 =====
// 计算相邻 slot 的共享边界
interface ResizeBoundary {
  slotA: number;
  slotB: number;
  axis: "horizontal" | "vertical";
  // 边界在 paper 内的像素位置
  position: number; // px, 相对于 paper 内容区
  // 边界的起止范围
  rangeStart: number; // px
  rangeEnd: number; // px
}

const resizeBoundaries = computed<ResizeBoundary[]>(() => {
  const pageData = currentPageData.value;
  if (!pageData || pageData.slots.length < 2) return [];

  const slots = pageData.slots;
  const boundaries: ResizeBoundary[] = [];
  const tolerance = 2; // mm 容差

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];

      // 检查是否共享垂直边界（左右相邻）
      const aRight = a.x + a.width;
      const bRight = b.x + b.width;
      if (Math.abs(aRight - b.x) < tolerance || Math.abs(bRight - a.x) < tolerance) {
        // 检查 Y 范围是否有重叠
        const overlapStart = Math.max(a.y, b.y);
        const overlapEnd = Math.min(a.y + a.height, b.y + b.height);
        if (overlapEnd - overlapStart > 10) {
          const edgeX = Math.abs(aRight - b.x) < tolerance ? aRight : bRight;
          boundaries.push({
            slotA: Math.abs(aRight - b.x) < tolerance ? i : j,
            slotB: Math.abs(aRight - b.x) < tolerance ? j : i,
            axis: "horizontal",
            position: edgeX,
            rangeStart: overlapStart,
            rangeEnd: overlapEnd,
          });
        }
      }

      // 检查是否共享水平边界（上下相邻）
      const aBottom = a.y + a.height;
      const bBottom = b.y + b.height;
      if (Math.abs(aBottom - b.y) < tolerance || Math.abs(bBottom - a.y) < tolerance) {
        // 检查 X 范围是否有重叠
        const overlapStart = Math.max(a.x, b.x);
        const overlapEnd = Math.min(a.x + a.width, b.x + b.width);
        if (overlapEnd - overlapStart > 10) {
          const edgeY = Math.abs(aBottom - b.y) < tolerance ? aBottom : bBottom;
          boundaries.push({
            slotA: Math.abs(aBottom - b.y) < tolerance ? i : j,
            slotB: Math.abs(aBottom - b.y) < tolerance ? j : i,
            axis: "vertical",
            position: edgeY,
            rangeStart: overlapStart,
            rangeEnd: overlapEnd,
          });
        }
      }
    }
  }

  return boundaries;
});

function getBoundaryStyle(b: ResizeBoundary) {
  const m = marginMm.value * previewScale.value;
  const handleSize = 8; // px
  if (b.axis === "horizontal") {
    return {
      left: `${m + b.rangeStart * previewScale.value}px`,
      top: `${m + b.position * previewScale.value - handleSize / 2}px`,
      width: `${(b.rangeEnd - b.rangeStart) * previewScale.value}px`,
      height: `${handleSize}px`,
      cursor: "col-resize",
    };
  } else {
    return {
      left: `${m + b.position * previewScale.value - handleSize / 2}px`,
      top: `${m + b.rangeStart * previewScale.value}px`,
      width: `${handleSize}px`,
      height: `${(b.rangeEnd - b.rangeStart) * previewScale.value}px`,
      cursor: "row-resize",
    };
  }
}

function onBoundaryPointerDown(e: PointerEvent, boundary: ResizeBoundary) {
  if (interactionMode.value !== "idle") return;
  e.preventDefault();
  e.stopPropagation();

  interactionMode.value = "resize";
  resizeSlotA.value = boundary.slotA;
  resizeSlotB.value = boundary.slotB;
  resizeAxis.value = boundary.axis;
  resizeStartPointer.value = boundary.axis === "horizontal" ? e.clientX : e.clientY;
  resizeStartSlots.value = JSON.parse(JSON.stringify(currentPageData.value?.slots ?? []));

  (e.target as HTMLElement).setPointerCapture(e.pointerId);
}

function updateResize(e: PointerEvent) {
  if (resizeSlotA.value === null || resizeSlotB.value === null) return;
  if (!currentPageData.value) return;

  const currentPointer = resizeAxis.value === "horizontal" ? e.clientX : e.clientY;
  const deltaPx = currentPointer - resizeStartPointer.value;
  const deltaMm = deltaPx / previewScale.value;

  const slots = JSON.parse(JSON.stringify(resizeStartSlots.value)) as ImageSlot[];
  const a = slots[resizeSlotA.value];
  const b = slots[resizeSlotB.value];
  if (!a || !b) return;

  const minSize = 20; // mm

  if (resizeAxis.value === "horizontal") {
    // 左右拖动：调整宽度
    const newAWidth = a.width + deltaMm;
    const newBWidth = b.width - deltaMm;
    if (newAWidth < minSize || newBWidth < minSize) return;
    slots[resizeSlotA.value].width = newAWidth;
    slots[resizeSlotB.value].x = b.x + deltaMm;
    slots[resizeSlotB.value].width = newBWidth;
  } else {
    // 上下拖动：调整高度
    const newAHeight = a.height + deltaMm;
    const newBHeight = b.height - deltaMm;
    if (newAHeight < minSize || newBHeight < minSize) return;
    slots[resizeSlotA.value].height = newAHeight;
    slots[resizeSlotB.value].y = b.y + deltaMm;
    slots[resizeSlotB.value].height = newBHeight;
  }

  emit("setPageSlots", slots);
}

function endResize() {
  resizeSlotA.value = null;
  resizeSlotB.value = null;
  resizeStartSlots.value = [];
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
    class="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-8"
    @pointermove="onPaperPointerMove"
    @pointerup="onPaperPointerUp"
  >
    <div v-if="images.length === 0" class="text-center">
      <div class="w-20 h-20 mx-auto mb-5 rounded-3xl bg-blue-50 flex items-center justify-center">
        <svg class="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-sm text-secondary mb-1">添加图片后预览文档效果</p>
      <p class="text-xs text-tertiary">支持 PNG、JPG、WEBP、BMP</p>
    </div>

    <div v-else-if="currentPageData" class="paper rounded fade-in" :style="paperStyle">
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
            isEdgeToEdge ? 'cursor-grab' : 'cursor-grab',
            panSlotIdx === slotIdx ? 'cursor-grabbing' : '',
          ]"
          :style="getSlotStyle(currentPageData.slots[slotIdx])"
          @pointerdown="onSlotPointerDown($event, slotIdx)"
        >
          <img
            :src="images[imgIdx]?.thumbUrl"
            :alt="images[imgIdx]?.name"
            class="w-full h-full select-none pointer-events-none"
            :class="isEdgeToEdge ? 'object-cover' : 'object-contain'"
            :style="getImageStyle(imgIdx)"
            draggable="false"
          />
          <!-- cover 模式拖动提示图标 -->
          <div
            v-if="isEdgeToEdge && interactionMode === 'idle'"
            class="absolute bottom-1 right-1 w-5 h-5 rounded bg-black/30 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
          >
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </div>

        <!-- 拖拽幽灵图 -->
        <div
          v-if="interactionMode === 'drag-swap' && dragPointerPos && dragGhostSrc"
          class="fixed pointer-events-none z-50"
          :style="{
            left: `${dragPointerPos.x - 40}px`,
            top: `${dragPointerPos.y - 40}px`,
            width: '80px',
            height: '80px',
          }"
        >
          <img
            :src="dragGhostSrc"
            class="w-full h-full object-cover rounded shadow-lg opacity-70"
            draggable="false"
          />
        </div>

        <!-- 分区调整边界手柄 -->
        <div
          v-for="(boundary, bIdx) in resizeBoundaries"
          :key="'b-' + bIdx"
          class="absolute z-10 group"
          :style="getBoundaryStyle(boundary)"
          @pointerdown="onBoundaryPointerDown($event, boundary)"
        >
          <div
            class="w-full h-full rounded-sm transition-colors group-hover:bg-blue-400/30"
            :class="interactionMode === 'resize' ? 'bg-blue-400/40' : ''"
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
