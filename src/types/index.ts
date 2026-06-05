// ===== 图片 =====
export interface ImageItem {
  id: string;
  name: string;
  path: string;
  width: number;
  height: number;
  thumbUrl: string; // convertFileSrc 生成的缩略图 URL
}

// ===== 页面设置 =====
export type PaperSize = "A4" | "A3" | "Letter";
export type Orientation = "portrait" | "landscape";
export type GapMode = "gapped" | "edge-to-edge";

export interface PageSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  gapMode: GapMode;
  gapMm: number;
  /** 手动覆盖每页图片数，null 表示自动 */
  imagesPerPage: LayoutKey | null;
}

// ===== 布局 =====
export type LayoutKey = 1 | 2 | 3 | 4 | 6 | 9;
export type LayoutId = string;

export interface ImageSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutDefinition {
  id: LayoutId;
  name: string;
  description: string;
  /** 计算每个图片的区域槽位 */
  computeSlots: (
    pageW: number,
    pageH: number,
    gap: number,
    imageCount: number
  ) => ImageSlot[];
}

export interface PageLayout {
  slots: ImageSlot[];
  imageIndices: number[];
  uniformScale: number;
}

// ===== 导出 =====
export interface PlacementInstruction {
  page: number;
  imagePath: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
