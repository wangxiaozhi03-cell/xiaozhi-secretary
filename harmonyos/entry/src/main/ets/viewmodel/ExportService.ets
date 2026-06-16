/**
 * 导出服务
 * 移植自 src/composables/useExport.ts
 * 鸿蒙版使用 Canvas 渲染 + 文件 API
 */
import { image } from '@kit.ImageKit'
import { fileIo } from '@kit.CoreFileKit'
import { picker } from '@kit.CoreFileKit'
import { ImageItem, PageSettings, PageLayout, PageOverrides, ImageSlot } from '../model/Types'
import { getPaperDimensions, PAGE_MARGIN_MM } from '../model/Papers'
import { SimpleZip } from '../utils/SimpleZip'

interface CalcFitResult {
  offsetX: number
  offsetY: number
  width: number
  height: number
}

function calcFit(
  slotW: number, slotH: number,
  imgW: number, imgH: number,
  mode: string
): CalcFitResult {
  const rW = slotW / imgW
  const rH = slotH / imgH
  const scale = mode === 'cover' ? Math.max(rW, rH) : Math.min(rW, rH)
  return {
    offsetX: (slotW - imgW * scale) / 2,
    offsetY: (slotH - imgH * scale) / 2,
    width: imgW * scale,
    height: imgH * scale,
  }
}

export class ExportService {
  private images: ImageItem[] = []
  private pages: PageLayout[] = []
  private settings: PageSettings = new PageSettings()
  private getOverrides: (pageIndex: number) => PageOverrides | undefined = () => undefined

  constructor(
    images: ImageItem[],
    pages: PageLayout[],
    settings: PageSettings,
    getOverrides: (pageIndex: number) => PageOverrides | undefined
  ) {
    this.images = images
    this.pages = pages
    this.settings = settings
    this.getOverrides = getOverrides
  }

  /**
   * 渲染单页到 PixelMap
   * 注意：鸿蒙 Canvas API 与浏览器 Canvas API 有差异
   * 实际实现需要在组件中使用 CanvasRenderingContext2D
   * 这里提供的是页面渲染的计算逻辑
   */
  getPageRenderData(pageIndex: number, pxPerMm: number): PageRenderData | undefined {
    const page = this.pages[pageIndex]
    if (!page) return undefined

    const s = this.settings
    const paper = getPaperDimensions(s.paperSize, s.orientation)
    const isEdge = s.gapMode === 'edge-to-edge'
    const margin = isEdge ? 0 : PAGE_MARGIN_MM
    const mode = isEdge ? 'cover' : 'contain'

    const pageOverrides = this.getOverrides(pageIndex)
    const slots = pageOverrides?.slots && pageOverrides.slots.length > 0 ? pageOverrides.slots : page.slots
    const imageIndices = pageOverrides?.imageIndices && pageOverrides.imageIndices.length > 0
      ? pageOverrides.imageIndices : page.imageIndices

    const canvasW = Math.round(paper.width * pxPerMm)
    const canvasH = Math.round(paper.height * pxPerMm)

    const slotRenders: SlotRenderData[] = []
    for (let i = 0; i < slots.length; i++) {
      const imgIdx = imageIndices[i]
      if (imgIdx === undefined || imgIdx >= this.images.length) continue

      const slot = slots[i]
      const imgInfo = this.images[imgIdx]

      const slotX = (margin + slot.x) * pxPerMm
      const slotY = (margin + slot.y) * pxPerMm
      const slotW = slot.width * pxPerMm
      const slotH = slot.height * pxPerMm
      const fit = calcFit(slotW, slotH, imgInfo.width, imgInfo.height, mode)

      let drawX = slotX + fit.offsetX
      let drawY = slotY + fit.offsetY
      const offset = pageOverrides?.offsets?.get(imgIdx)
      if (offset && mode === 'cover') {
        const excessX = Math.max(0, fit.width - slotW)
        const excessY = Math.max(0, fit.height - slotH)
        drawX = slotX + fit.offsetX - excessX * (offset.offsetX - 0.5)
        drawY = slotY + fit.offsetY - excessY * (offset.offsetY - 0.5)
      }

      slotRenders.push({
        imagePath: imgInfo.path,
        thumbPath: imgInfo.thumbUrl,
        drawX: drawX,
        drawY: drawY,
        drawW: fit.width,
        drawH: fit.height,
        clipX: slotX,
        clipY: slotY,
        clipW: slotW,
        clipH: slotH,
      })
    }

    return {
      canvasWidth: canvasW,
      canvasHeight: canvasH,
      slots: slotRenders,
    }
  }
}

/** 单个 slot 的渲染数据 */
export class SlotRenderData {
  imagePath: string = ''
  thumbPath: string = ''
  drawX: number = 0
  drawY: number = 0
  drawW: number = 0
  drawH: number = 0
  clipX: number = 0
  clipY: number = 0
  clipW: number = 0
  clipH: number = 0
}

/** 整页的渲染数据 */
export class PageRenderData {
  canvasWidth: number = 0
  canvasHeight: number = 0
  slots: SlotRenderData[] = []
}
