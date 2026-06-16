/**
 * 文档预览面板
 * 移植自 src/components/DocumentPreview.vue
 * 使用鸿蒙 Canvas 组件渲染页面预览
 */
import { ImageItem, PageSettings, PageLayout, ImageSlot, PageOverrides, ImageOffset } from '../model/Types'
import { getPaperDimensions, PAGE_MARGIN_MM } from '../model/Papers'

@Component
struct DocumentPreviewPanel {
  @Prop images: ImageItem[] = []
  @Prop pages: PageLayout[] = []
  @Prop settings!: PageSettings
  @Prop currentPage: number = 0
  @Prop overrides: Map<number, PageOverrides> = new Map()
  onSetImageOffset: (imageIndex: number, offsetX: number, offsetY: number) => void = () => {}
  onSetPageSlots: (slots: ImageSlot[]) => void = () => {}
  onDropOnSlot: (fromPage: number, fromSlot: number, toPage: number, toSlot: number) => void = () => {}

  private settingsRef = getPaperDimensions('A4', 'landscape')

  build() {
    Column() {
      if (this.images.length === 0) {
        // 空状态
        Column() {
          SymbolGlyph($r('sys.symbol.photo_on_rectangle'))
            .fontSize(48)
            .fontColor(['#BFDBFE'])
            .margin({ bottom: 12 })
          Text('添加图片后预览文档效果')
            .fontSize(13)
            .fontColor('#999')
          Text('支持 PNG、JPG、WEBP、BMP')
            .fontSize(11)
            .fontColor('#ccc')
            .margin({ top: 4 })
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
      } else {
        // 预览区
        Stack() {
          // 白色纸张背景
          Column() {
            // Canvas 渲染图片布局
            Canvas(this.context)
              .width('100%')
              .height('100%')
              .onReady(() => {
                this.renderPage()
              })
          }
          .width(this.getPaperWidth())
          .height(this.getPaperHeight())
          .backgroundColor(Color.White)
          .borderRadius(12)
          .shadow({
            radius: 16,
            color: '#1a000000',
            offsetX: 0,
            offsetY: 4,
          })
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
        .alignContent(Alignment.Center)
      }
    }
    .width('100%')
    .height('100%')
    .padding(32)
  }

  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(new RenderingContextSettings(true))

  private getPaperWidth(): string {
    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation)
    return `${paper.width * 1.5}px`
  }

  private getPaperHeight(): string {
    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation)
    return `${paper.height * 1.5}px`
  }

  private renderPage(): void {
    const ctx = this.context
    const pageData = this.pages[this.currentPage]
    if (!pageData) return

    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation)
    const isEdge = this.settings.gapMode === 'edge-to-edge'
    const margin = isEdge ? 0 : PAGE_MARGIN_MM
    const scale = 1.5 // 预览缩放比

    // 清空画布
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, ctx.width, ctx.height)

    // 渲染每个 slot
    const slots = pageData.slots
    const imageIndices = pageData.imageIndices

    for (let i = 0; i < slots.length; i++) {
      const imgIdx = imageIndices[i]
      if (imgIdx === undefined || imgIdx >= this.images.length) continue

      const slot = slots[i]
      const imgInfo = this.images[imgIdx]

      const slotX = (margin + slot.x) * scale
      const slotY = (margin + slot.y) * scale
      const slotW = slot.width * scale
      const slotH = slot.height * scale

      // 计算 fit/cover
      const rW = slotW / imgInfo.width
      const rH = slotH / imgInfo.height
      const fitScale = isEdge ? Math.max(rW, rH) : Math.min(rW, rH)
      const drawW = imgInfo.width * fitScale
      const drawH = imgInfo.height * fitScale
      let drawX = slotX + (slotW - drawW) / 2
      let drawY = slotY + (slotH - drawH) / 2

      // 应用偏移（cover 模式）
      const offset = this.overrides.get(this.currentPage)?.offsets?.get(imgIdx)
      if (offset && isEdge) {
        const excessX = Math.max(0, drawW - slotW)
        const excessY = Math.max(0, drawH - slotH)
        drawX = slotX + (slotW - drawW) / 2 - excessX * (offset.offsetX - 0.5)
        drawY = slotY + (slotH - drawH) / 2 - excessY * (offset.offsetY - 0.5)
      }

      // 裁剪并绘制
      ctx.save()
      ctx.beginPath()
      ctx.rect(slotX, slotY, slotW, slotH)
      ctx.clip()

      // 加载并绘制图片
      const imageSrc = image.createImageSource(imgInfo.thumbUrl)
      if (imageSrc) {
        imageSrc.createPixelMap().then((pixelMap: image.PixelMap) => {
          ctx.drawImage(pixelMap, drawX, drawY, drawW, drawH)
          imageSrc.release()
        }).catch(() => {
          imageSrc.release()
        })
      }
      ctx.restore()

      // 绘制 slot 边框（非铺满模式）
      if (!isEdge) {
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 0.5
        ctx.strokeRect(slotX, slotY, slotW, slotH)
      }
    }
  }
}

export { DocumentPreviewPanel }
