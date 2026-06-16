/**
 * 文档预览面板
 * 移植自 src/components/DocumentPreview.vue
 */
import { image } from '@kit.ImageKit'
import { ImageItem, PageSettings, PageLayout, ImageSlot, PageOverrides, ImageOffset } from '../model/Types'
import { getPaperDimensions, PAGE_MARGIN_MM } from '../model/Papers'

@Component
struct DocumentPreviewPanel {
  @Prop images: ImageItem[] = []
  @Prop pages: PageLayout[] = []
  @Prop settingsPaperSize: string = 'A4'
  @Prop settingsOrientation: string = 'landscape'
  @Prop settingsGapMode: string = 'gapped'
  @Prop settingsGapMm: number = 8
  @Prop currentPage: number = 0

  build() {
    Column() {
      if (this.images.length === 0) {
        // 空状态
        Column() {
          Text('🖼️')
            .fontSize(48)
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
        // 预览区 - 使用 Stack 布局
        Stack() {
          // 白色纸张背景
          Column() {
            // 图片布局预览
            this.PageContent()
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
        .alignContent(Alignment.Center)
      }
    }
    .width('100%')
    .height('100%')
    .padding(32)
  }

  @Builder
  PageContent() {
    // 使用 ForEach 渲染每个 slot 中的图片
    ForEach(this.getCurrentSlots(), (item: SlotDisplayInfo, index: number) => {
      Image(item.thumbUrl)
        .width(item.imgW)
        .height(item.imgH)
        .position({ x: item.imgX, y: item.imgY })
        .objectFit(item.isEdge ? ImageFit.Cover : ImageFit.Contain)
        .clip(true)
    })
  }

  private getCurrentSlots(): SlotDisplayInfo[] {
    const pageData: PageLayout | undefined = this.pages[this.currentPage]
    if (!pageData) return []

    const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation)
    const isEdge: boolean = this.settingsGapMode === 'edge-to-edge'
    const margin: number = isEdge ? 0 : PAGE_MARGIN_MM
    const scale: number = 1.5

    const result: SlotDisplayInfo[] = []
    for (let i = 0; i < pageData.slots.length; i++) {
      const imgIdx: number = pageData.imageIndices[i]
      if (imgIdx === undefined || imgIdx >= this.images.length) continue

      const slot: ImageSlot = pageData.slots[i]
      const imgInfo: ImageItem = this.images[imgIdx]

      const slotX: number = (margin + slot.x) * scale
      const slotY: number = (margin + slot.y) * scale
      const slotW: number = slot.width * scale
      const slotH: number = slot.height * scale

      const rW: number = slotW / imgInfo.width
      const rH: number = slotH / imgInfo.height
      const fitScale: number = isEdge ? Math.max(rW, rH) : Math.min(rW, rH)
      const drawW: number = imgInfo.width * fitScale
      const drawH: number = imgInfo.height * fitScale
      const drawX: number = slotX + (slotW - drawW) / 2
      const drawY: number = slotY + (slotH - drawH) / 2

      const info: SlotDisplayInfo = new SlotDisplayInfo()
      info.thumbUrl = imgInfo.thumbUrl
      info.imgX = drawX
      info.imgY = drawY
      info.imgW = drawW
      info.imgH = drawH
      info.isEdge = isEdge
      result.push(info)
    }
    return result
  }

  private getPaperWidth(): string {
    const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation)
    return `${paper.width * 1.5}px`
  }

  private getPaperHeight(): string {
    const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation)
    return `${paper.height * 1.5}px`
  }
}

class SlotDisplayInfo {
  thumbUrl: string = ''
  imgX: number = 0
  imgY: number = 0
  imgW: number = 0
  imgH: number = 0
  isEdge: boolean = false
}

export { DocumentPreviewPanel }
