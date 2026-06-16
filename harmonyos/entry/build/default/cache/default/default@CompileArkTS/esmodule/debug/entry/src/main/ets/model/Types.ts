/**
 * 图片工具 - 类型定义
 * 移植自 src/types/index.ts
 */
// ===== 图片 =====
export class ImageItem {
    id: string = '';
    name: string = '';
    path: string = '';
    width: number = 0;
    height: number = 0;
    thumbUrl: string = '';
    constructor(id: string, name: string, path: string, width: number, height: number, thumbUrl: string) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.width = width;
        this.height = height;
        this.thumbUrl = thumbUrl;
    }
}
// ===== 页面设置 =====
// 使用字符串常量代替 type 别名，避免与系统类型冲突
export const PAPER_A4: string = 'A4';
export const PAPER_A3: string = 'A3';
export const PAPER_LETTER: string = 'Letter';
export const ORIENT_PORTRAIT: string = 'portrait';
export const ORIENT_LANDSCAPE: string = 'landscape';
export const GAP_GAPPED: string = 'gapped';
export const GAP_EDGE_TO_EDGE: string = 'edge-to-edge';
export class PageSettings {
    paperSize: string = 'A4';
    orientation: string = 'landscape';
    gapMode: string = 'gapped';
    gapMm: number = 8;
    imagesPerPage: number = -1;
    constructor() {
    }
}
// ===== 布局 =====
export class ImageSlot {
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
export class LayoutDefinition {
    id: string = '';
    name: string = '';
    description: string = '';
    computeSlots: (pageW: number, pageH: number, gap: number, imageCount: number) => ImageSlot[] = (_pageW: number, _pageH: number, _gap: number, _imageCount: number) => [];
    constructor(id: string, name: string, description: string, computeSlots: (pageW: number, pageH: number, gap: number, imageCount: number) => ImageSlot[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.computeSlots = computeSlots;
    }
}
export class PageLayout {
    slots: ImageSlot[] = [];
    imageIndices: number[] = [];
    uniformScale: number = 1;
    constructor(slots: ImageSlot[], imageIndices: number[], uniformScale: number) {
        this.slots = slots;
        this.imageIndices = imageIndices;
        this.uniformScale = uniformScale;
    }
}
// ===== 交互覆盖 =====
export class ImageOffset {
    offsetX: number = 0.5;
    offsetY: number = 0.5;
    constructor(offsetX: number, offsetY: number) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}
export class PageOverrides {
    imageIndices: number[] = [];
    offsets: Map<number, ImageOffset> = new Map();
    slots: ImageSlot[] = [];
    constructor() {
    }
}
