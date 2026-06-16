/**
 * 图片工具 - 类型定义
 * 移植自 src/types/index.ts
 */

// ===== 图片 =====
export class ImageItem {
  id: string = ''
  name: string = ''
  path: string = ''
  width: number = 0
  height: number = 0
  thumbUrl: string = '' // 缩略图路径（鸿蒙中使用 resource:// 或 file://）

  constructor(id: string, name: string, path: string, width: number, height: number, thumbUrl: string) {
    this.id = id
    this.name = name
    this.path = path
    this.width = width
    this.height = height
    this.thumbUrl = thumbUrl
  }
}

// ===== 页面设置 =====
export type PaperSize = 'A4' | 'A3' | 'Letter'
export type Orientation = 'portrait' | 'landscape'
export type GapMode = 'gapped' | 'edge-to-edge'

export class PageSettings {
  paperSize: PaperSize = 'A4'
  orientation: Orientation = 'landscape'
  gapMode: GapMode = 'gapped'
  gapMm: number = 8
  imagesPerPage: number = -1 // -1 表示自动，1/2/3/4/6/9 表示手动指定

  constructor() {
  }
}

// ===== 布局 =====
export type LayoutKey = 1 | 2 | 3 | 4 | 6 | 9

export class ImageSlot {
  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

export class LayoutDefinition {
  id: string = ''
  name: string = ''
  description: string = ''
  // computeSlots 函数类型
  computeSlots: (pageW: number, pageH: number, gap: number, imageCount: number) => ImageSlot[] =
    (_pageW: number, _pageH: number, _gap: number, _imageCount: number) => []

  constructor(
    id: string,
    name: string,
    description: string,
    computeSlots: (pageW: number, pageH: number, gap: number, imageCount: number) => ImageSlot[]
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.computeSlots = computeSlots
  }
}

export class PageLayout {
  slots: ImageSlot[] = []
  imageIndices: number[] = []
  uniformScale: number = 1

  constructor(slots: ImageSlot[], imageIndices: number[], uniformScale: number) {
    this.slots = slots
    this.imageIndices = imageIndices
    this.uniformScale = uniformScale
  }
}

// ===== 交互覆盖 =====
export class ImageOffset {
  offsetX: number = 0.5 // 0-1，水平偏移比例
  offsetY: number = 0.5 // 0-1，垂直偏移比例

  constructor(offsetX: number, offsetY: number) {
    this.offsetX = offsetX
    this.offsetY = offsetY
  }
}

export class PageOverrides {
  imageIndices: number[] = []
  offsets: Map<number, ImageOffset> = new Map()
  slots: ImageSlot[] = []

  constructor() {
  }
}
