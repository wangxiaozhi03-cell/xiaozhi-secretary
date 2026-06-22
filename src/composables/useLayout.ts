import { computed, ref, watch } from "vue";
import type { ImageItem, LayoutKey, LayoutDefinition, PageLayout, PageSettings } from "@/types";
import { LAYOUT_REGISTRY, getLayoutKey, computeUniformScale } from "@/layouts";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@/types/papers";

export function useLayout(images: () => ImageItem[], pageSettings: () => PageSettings) {
  const activeLayoutIndex = ref(0);

  /** 当前布局 key：手动覆盖 > 自动检测 */
  const layoutKey = computed<LayoutKey>(() => {
    const manual = pageSettings().imagesPerPage;
    if (manual !== null) return manual;
    return getLayoutKey(images().length);
  });

  /** 当前可用的布局列表 */
  const availableLayouts = computed<LayoutDefinition[]>(() => {
    return LAYOUT_REGISTRY[layoutKey.value] || [];
  });

  /** 当前选中的布局 */
  const activeLayout = computed<LayoutDefinition>(() => {
    const layouts = availableLayouts.value;
    const idx = activeLayoutIndex.value >= layouts.length ? 0 : activeLayoutIndex.value;
    return layouts[idx] || layouts[0];
  });

  // 可用布局变化时，确保索引不越界
  watch(availableLayouts, (layouts) => {
    if (activeLayoutIndex.value >= layouts.length) {
      activeLayoutIndex.value = 0;
    }
  });

  /** 选择布局 */
  function selectLayout(index: number) {
    activeLayoutIndex.value = index;
  }

  /** 图片数量或布局 key 变化时重置布局选择 */
  function resetLayout() {
    activeLayoutIndex.value = 0;
  }

  // 监听 layoutKey 变化，自动重置选中的布局
  watch(layoutKey, () => {
    activeLayoutIndex.value = 0;
  });

  /** 计算所有页面的布局 */
  const pages = computed<PageLayout[]>(() => {
    const imgList = images();
    if (imgList.length === 0) return [];

    const settings = pageSettings();
    const paper = getPaperDimensions(settings.paperSize, settings.orientation);
    const isEdgeToEdge = settings.gapMode === "edge-to-edge";
    const margin = isEdgeToEdge ? 0 : PAGE_MARGIN_MM;
    const contentW = paper.width - margin * 2;
    const contentH = paper.height - margin * 2;
    const gap = isEdgeToEdge ? 0 : settings.gapMm;
    const key = layoutKey.value;
    const layout = activeLayout.value;
    if (!layout) return [];

    const result: PageLayout[] = [];

    // 分页：按 key 分组
    for (let i = 0; i < imgList.length; i += key) {
      const pageImages = imgList.slice(i, i + key);
      const actualKey = pageImages.length; // 最后一页可能不满
      // 找到适合实际图片数的布局
      let pageLayout = layout;
      if (actualKey < key) {
        // 最后一页不满时，找匹配的布局
        const fallbackKey = getLayoutKey(actualKey);
        const fallbackLayouts = LAYOUT_REGISTRY[fallbackKey];
        if (fallbackLayouts && fallbackLayouts.length > 0) {
          pageLayout = fallbackLayouts[0];
        }
      }
      const slots = pageLayout.computeSlots(contentW, contentH, gap, actualKey);
      const scaleMode = settings.gapMode === "edge-to-edge" ? "cover" : "fit";
      const scale = computeUniformScale(slots, pageImages, scaleMode);
      result.push({
        slots,
        imageIndices: pageImages.map((_, idx) => i + idx),
        uniformScale: scale,
      });
    }

    return result;
  });

  return {
    layoutKey,
    availableLayouts,
    activeLayout,
    activeLayoutIndex,
    selectLayout,
    resetLayout,
    pages,
  };
}
