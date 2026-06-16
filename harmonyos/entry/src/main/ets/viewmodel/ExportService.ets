/**
 * 导出服务
 * 移植自 src/composables/useExport.ts
 */
import { ImageItem, PageSettings, PageLayout, PageOverrides, ImageSlot } from '../model/Types'
import { getPaperDimensions, PAGE_MARGIN_MM } from '../model/Papers'

class CalcFitResult {
  offsetX: number = 0
  offsetY: number = 0
  width: number = 0
  height: number = 0
  constructor(offsetX: number, offsetY: number, width: number, height: number) {
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.width = width
    this.height = height
  }
}

function calcFit(
  slotW: number, slotH: number,
  imgW: number, imgH: number,
  mode: string
): CalcFitResult {
  const rW: number = slotW / imgW
  const rH: number = slotH / imgH
  const scale: number = mode === 'cover' ? Math.max(rW, rH) : Math.min(rW, rH)
  return new CalcFitResult(
    (slotW - imgW * scale) / 2,
    (slotH - imgH * scale) / 2,
    imgW * scale,
    imgH * scale
  )
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

export class ExportService {
  private images: ImageItem[] = []
  private pages: PageLayout[] = []
  private settings: PageSettings = new PageSettings()
  private getOverrides: (pageIndex: number) => PageOverrides | undefined = (_idx: number) => undefined

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
   * 获取页面渲染数据
   */
  getPageRenderData(pageIndex: number, pxPerMm: number): PageRenderData | undefined {
    const page: PageLayout | undefined = this.pages[pageIndex]
    if (!page) return undefined

    const s: PageSettings = this.settings
    const paper = getPaperDimensions(s.paperSize, s.orientation)
    const isEdge: boolean = s.gapMode === 'edge-to-edge'
    const margin: number = isEdge ? 0 : PAGE_MARGIN_MM
    const mode: string = isEdge ? 'cover' : 'contain'

    const pageOverrides: PageOverrides | undefined = this.getOverrides(pageIndex)
    const slots: ImageSlot[] = (pageOverrides && pageOverrides.slots.length > 0) ? pageOverrides.slots : page.slots
    const imageIndices: number[] = (pageOverrides && pageOverrides.imageIndices.length > 0)
      ? pageOverrides.imageIndices : page.imageIndices

    const canvasW: number = Math.round(paper.width * pxPerMm)
    const canvasH: number = Math.round(paper.height * pxPerMm)

    const result: PageRenderData = new PageRenderData()
    result.canvasWidth = canvasW
    result.canvasHeight = canvasH

    const slotRenders: SlotRenderData[] = []
    for (let i = 0; i < slots.length; i++) {
      const imgIdx: number = imageIndices[i]
      if (imgIdx === undefined || imgIdx >= this.images.length) continue

      const slot: ImageSlot = slots[i]
      const imgInfo: ImageItem = this.images[imgIdx]

      const slotX: number = (margin + slot.x) * pxPerMm
      const slotY: number = (margin + slot.y) * pxPerMm
      const slotW: number = slot.width * pxPerMm
      const slotH: number = slot.height * pxPerMm
      const fit: CalcFitResult = calcFit(slotW, slotH, imgInfo.width, imgInfo.height, mode)

      let drawX: number = slotX + fit.offsetX
      let drawY: number = slotY + fit.offsetY
      const offset = pageOverrides?.offsets?.get(imgIdx)
      if (offset && mode === 'cover') {
        const excessX: number = Math.max(0, fit.width - slotW)
        const excessY: number = Math.max(0, fit.height - slotH)
        drawX = slotX + fit.offsetX - excessX * (offset.offsetX - 0.5)
        drawY = slotY + fit.offsetY - excessY * (offset.offsetY - 0.5)
      }

      const slotData: SlotRenderData = new SlotRenderData()
      slotData.imagePath = imgInfo.path
      slotData.thumbPath = imgInfo.thumbUrl
      slotData.drawX = drawX
      slotData.drawY = drawY
      slotData.drawW = fit.width
      slotData.drawH = fit.height
      slotData.clipX = slotX
      slotData.clipY = slotY
      slotData.clipW = slotW
      slotData.clipH = slotH
      slotRenders.push(slotData)
    }
    result.slots = slotRenders
    return result
  }
}
