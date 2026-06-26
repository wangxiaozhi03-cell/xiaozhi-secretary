/**
 * 页面设置数据模型
 */
export type PaperSize = 'A4' | 'A3' | 'Letter';
export type Orientation = 'portrait' | 'landscape';
export type GapMode = 'gapped' | 'edge-to-edge';
export type LayoutKey = 1 | 2 | 3 | 4 | 6 | 9;

/** 纸张尺寸类 */
export class PaperDimension {
  width: number = 0;
  height: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

export class PageSettingsData {
  paperSize: PaperSize = 'A4';
  orientation: Orientation = 'landscape';
  gapMode: GapMode = 'gapped';
  gapMm: number = 8;
  imagesPerPage: LayoutKey | null = null;
}

/** 纸张尺寸（毫米） */
const PAPER_A4 = new PaperDimension(210, 297);
const PAPER_A3 = new PaperDimension(297, 420);
const PAPER_LETTER = new PaperDimension(215.9, 279.4);

/** 获取纸张尺寸（考虑方向） */
export function getPaperDimensions(
  size: PaperSize,
  orientation: Orientation
): PaperDimension {
  let dim: PaperDimension;
  if (size === 'A3') {
    dim = PAPER_A3;
  } else if (size === 'Letter') {
    dim = PAPER_LETTER;
  } else {
    dim = PAPER_A4;
  }
  if (orientation === 'landscape') {
    return new PaperDimension(dim.height, dim.width);
  }
  return new PaperDimension(dim.width, dim.height);
}

/** 页面边距（mm） */
export const PAGE_MARGIN_MM: number = 10;
