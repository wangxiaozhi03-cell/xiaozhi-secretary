import { PaperSize, Orientation } from './index';

/** 纸张尺寸接口 */
interface PaperDimension {
  width: number;
  height: number;
}

/** 纸张尺寸（毫米） */
const PAPER_DIMENSIONS: Record<PaperSize, PaperDimension> = {
  A4: { width: 210, height: 297 } as PaperDimension,
  A3: { width: 297, height: 420 } as PaperDimension,
  Letter: { width: 215.9, height: 279.4 } as PaperDimension,
};

/** 获取纸张尺寸（考虑方向） */
export function getPaperDimensions(
  size: PaperSize,
  orientation: Orientation
): PaperDimension {
  const dim: PaperDimension = PAPER_DIMENSIONS[size];
  if (orientation === "landscape") {
    return { width: dim.height, height: dim.width } as PaperDimension;
  }
  return { width: dim.width, height: dim.height } as PaperDimension;
}

/** 页面边距（mm） */
export const PAGE_MARGIN_MM: number = 10;
