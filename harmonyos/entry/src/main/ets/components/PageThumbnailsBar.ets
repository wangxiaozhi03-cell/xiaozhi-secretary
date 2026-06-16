/**
 * 页面缩略图条
 * 移植自 src/components/PageThumbnails.vue
 */
import { ImageItem, PageSettings, PageLayout, ImageSlot } from '../model/Types'
import { getPaperDimensions, PAGE_MARGIN_MM } from '../model/Papers'

@Component
struct PageThumbnailsBar {
  @Prop images: ImageItem[] = []
  @Prop pages: PageLayout[] = []
  @Prop settings!: PageSettings
  @Prop currentPage: number = 0
  onGoToPage: (pageIndex: number) => void = (_idx: number) => {}

  build() {
    Column() {
      if (this.pages.length === 0) {
        Text('添加图片后显示页面缩略图')
          .fontSize(11)
          .fontColor('#999')
          .width('100%')
          .textAlign(TextAlign.Center)
          .height(64)
      } else {
        List({ space: 10 }) {
          ForEach(this.pages, (page: PageLayout, pageIndex: number) => {
            ListItem() {
              Column() {
                // 缩略图
                Stack() {
                  ForEach(page.imageIndices, (imgIdx: number, slotIdx: number) => {
                    if (imgIdx < this.images.length) {
                      Image(this.images[imgIdx].thumbUrl)
                        .width(this.getThumbSlotWidth(page.slots[slotIdx]))
                        .height(this.getThumbSlotHeight(page.slots[slotIdx]))
                        .position({
                          x: this.getThumbSlotX(page.slots[slotIdx]),
                          y: this.getThumbSlotY(page.slots[slotIdx]),
                        })
                        .objectFit(this.settings.gapMode === 'edge-to-edge'
                          ? ImageFit.Cover : ImageFit.Contain)
                    }
                  })
                }
                .width(this.getThumbWidth())
                .height(64)
                .backgroundColor(Color.White)
                .borderRadius(6)
                .clip(true)

                // 页码
                Text(`${pageIndex + 1}`)
                  .fontSize(10)
                  .fontColor(pageIndex === this.currentPage ? '#3B82F6' : '#999')
                  .margin({ top: 2 })
              }
              .padding(3)
              .borderRadius(10)
              .backgroundColor(pageIndex === this.currentPage ? '#EFF6FF' : 'transparent')
              .border({
                width: pageIndex === this.currentPage ? 1.5 : 0,
                color: '#93C5FD',
                style: BorderStyle.Solid,
              })
              .onClick(() => this.onGoToPage(pageIndex))
            }
          }, (_page: PageLayout, pageIndex: number) => `thumb-${pageIndex}`)
        }
        .width('100%')
        .height(90)
        .listDirection(Axis.Horizontal)
        .padding({ left: 16, right: 16 })
      }
    }
    .width('100%')
  }

  private getThumbWidth(): number {
    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation)
    return paper.width * (64 / paper.height)
  }

  private getThumbSlotX(slot: ImageSlot): number {
    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation)
    const scale = 64 / paper.height
    const margin = this.settings.gapMode === 'edge-to-edge' ? 0 : PAGE_MARGIN_MM
    return (margin + slot.x) * scale
  }

  private getThumbSlotY(slot: ImageSlot): number {
    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation)
    const scale = 64 / paper.height
    const margin = this.settings.gapMode === 'edge-to-edge' ? 0 : PAGE_MARGIN_MM
    return (margin + slot.y) * scale
  }

  private getThumbSlotWidth(slot: ImageSlot): number {
    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation)
    const scale = 64 / paper.height
    return slot.width * scale
  }

  private getThumbSlotHeight(slot: ImageSlot): number {
    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation)
    const scale = 64 / paper.height
    return slot.height * scale
  }
}

export { PageThumbnailsBar }
