import { ref } from "vue";

export interface PageDragState {
  sourcePageIndex: number;
  sourceSlotIndex: number;
  imageIndex: number;
  thumbUrl: string;
  targetPageIndex?: number;
  targetSlotIndex?: number;
}

/**
 * 跨组件的页面拖拽状态（DocumentPreview ↔ PageThumbnails）
 */
const dragState = ref<PageDragState | null>(null);
const dragPointerX = ref(0);
const dragPointerY = ref(0);
const isOverThumbnails = ref(false);
const hoverPageIndex = ref<number | null>(null);
const hoverSlotIndex = ref<number | null>(null);

export function usePageDrag() {
  function startDrag(state: PageDragState) {
    dragState.value = state;
    hoverPageIndex.value = null;
    hoverSlotIndex.value = null;
  }

  function updatePointer(x: number, y: number) {
    dragPointerX.value = x;
    dragPointerY.value = y;
  }

  function setOverThumbnails(value: boolean) {
    isOverThumbnails.value = value;
  }

  function setHoverPage(pageIndex: number | null) {
    hoverPageIndex.value = pageIndex;
  }

  function setHoverSlot(slotIndex: number | null) {
    hoverSlotIndex.value = slotIndex;
  }

  /**
   * 结束拖拽，返回跨页面放置的目标信息
   */
  function endDrag(): PageDragState | null {
    const state = dragState.value;
    if (state && isOverThumbnails.value && hoverPageIndex.value !== null) {
      const result: PageDragState = {
        ...state,
        targetPageIndex: hoverPageIndex.value,
        targetSlotIndex: hoverSlotIndex.value ?? undefined,
      };
      cleanup();
      return result;
    }
    cleanup();
    return null;
  }

  function cancelDrag() {
    cleanup();
  }

  function cleanup() {
    dragState.value = null;
    isOverThumbnails.value = false;
    hoverPageIndex.value = null;
    hoverSlotIndex.value = null;
  }

  return {
    dragState,
    dragPointerX,
    dragPointerY,
    isOverThumbnails,
    hoverPageIndex,
    hoverSlotIndex,
    startDrag,
    updatePointer,
    setOverThumbnails,
    setHoverPage,
    setHoverSlot,
    endDrag,
    cancelDrag,
  };
}
