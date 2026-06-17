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

// ===== 交互覆盖 =====
/** 图片在 slot 内的拖动偏移（cover 模式） */
export interface ImageOffset {
  offsetX: number; // 0-1，水平偏移比例
  offsetY: number; // 0-1，垂直偏移比例
}

/** 单页的手动覆盖数据 */
export interface PageOverrides {
  /** 交换后的图片索引（slot index -> 全局图片 index） */
  imageIndices?: number[];
  /** 图片拖动偏移（全局图片 index -> 偏移） */
  offsets?: Record<number, ImageOffset>;
  /** 调整后的完整 slot 列表 */
  slots?: ImageSlot[];
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
