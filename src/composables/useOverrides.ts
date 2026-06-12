import { reactive } from "vue";
import type { ImageSlot, ImageOffset, PageOverrides, PageLayout } from "@/types";

/**
 * 管理页面的手动覆盖：图片交换、拖动偏移、slot 尺寸调整
 */
export function useOverrides() {
  // 按页码存储覆盖数据
  const overrides = reactive<Record<number, PageOverrides>>({});

  function ensurePage(pageIndex: number): PageOverrides {
    if (!overrides[pageIndex]) {
      overrides[pageIndex] = {};
    }
    return overrides[pageIndex];
  }

  /** 获取某页当前的 imageIndices（优先用覆盖值） */
  function getImageIndices(pageIndex: number, basePages: PageLayout[]): number[] {
    const page = basePages[pageIndex];
    if (!page) return [];
    return overrides[pageIndex]?.imageIndices ?? page.imageIndices;
  }

  /** 交换同页两个 slot 的图片 */
  function swapImages(pageIndex: number, slotA: number, slotB: number, basePages: PageLayout[]) {
    const current = [...getImageIndices(pageIndex, basePages)];
    if (slotA >= current.length || slotB >= current.length) return;
    [current[slotA], current[slotB]] = [current[slotB], current[slotA]];
    ensurePage(pageIndex).imageIndices = current;
  }

  /** 设置图片的拖动偏移 */
  function setImageOffset(pageIndex: number, imageIndex: number, offsetX: number, offsetY: number) {
    const page = ensurePage(pageIndex);
    if (!page.offsets) page.offsets = {};
    page.offsets[imageIndex] = { offsetX, offsetY };
  }

  /** 获取图片的拖动偏移 */
  function getImageOffset(pageIndex: number, imageIndex: number): ImageOffset | undefined {
    return overrides[pageIndex]?.offsets?.[imageIndex];
  }

  /** 保存调整后的 slot 列表 */
  function setPageSlots(pageIndex: number, slots: ImageSlot[]) {
    ensurePage(pageIndex).slots = [...slots];
  }

  /** 获取某页的 slot 列表（优先用覆盖值） */
  function getSlots(pageIndex: number, basePages: PageLayout[]): ImageSlot[] {
    const page = basePages[pageIndex];
    if (!page) return [];
    return overrides[pageIndex]?.slots ?? page.slots;
  }

  /** 获取合并覆盖后的完整 PageLayout */
  function getMergedPage(pageIndex: number, basePages: PageLayout[]): PageLayout | undefined {
    const page = basePages[pageIndex];
    if (!page) return undefined;
    const pageOverrides = overrides[pageIndex];
    if (!pageOverrides) return page;
    return {
      ...page,
      imageIndices: pageOverrides.imageIndices ?? page.imageIndices,
      slots: pageOverrides.slots ?? page.slots,
    };
  }

  /** 获取所有合并后的页面 */
  function getMergedPages(basePages: PageLayout[]): PageLayout[] {
    return basePages.map((_, idx) => getMergedPage(idx, basePages)!);
  }

  /** 重置单页覆盖 */
  function resetPageOverrides(pageIndex: number) {
    delete overrides[pageIndex];
  }

  /** 重置所有覆盖 */
  function resetAllOverrides() {
    for (const key of Object.keys(overrides)) {
      delete overrides[Number(key)];
    }
  }

  return {
    overrides,
    swapImages,
    setImageOffset,
    getImageOffset,
    setPageSlots,
    getSlots,
    getMergedPage,
    getMergedPages,
    resetPageOverrides,
    resetAllOverrides,
  };
}

/**
 * 计算每页的图片在 images 数组中的起止索引
 * 用于跨页面移动图片时确定插入位置
 */
export function computePageRanges(basePages: PageLayout[]): Array<{ start: number; count: number }> {
  return basePages.map(page => {
    const indices = page.imageIndices;
    if (indices.length === 0) return { start: 0, count: 0 };
    return {
      start: Math.min(...indices),
      count: indices.length,
    };
  });
}
