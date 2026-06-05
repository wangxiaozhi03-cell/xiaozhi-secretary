import type { PaperSize, Orientation } from "./index";

/** 纸张尺寸（毫米） */
const PAPER_DIMENSIONS: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
};

/** 获取纸张尺寸（考虑方向） */
export function getPaperDimensions(
  size: PaperSize,
  orientation: Orientation
): { width: number; height: number } {
  const dim = PAPER_DIMENSIONS[size];
  if (orientation === "landscape") {
    return { width: dim.height, height: dim.width };
  }
  return { width: dim.width, height: dim.height };
}

/** 页面边距（mm） */
export const PAGE_MARGIN_MM = 10;
