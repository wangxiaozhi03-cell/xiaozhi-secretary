/**
 * 页面缩略图条
 * 移植自 src/components/PageThumbnails.vue
 */
import { ImageItem, PageLayout, ImageSlot } from '../model/Types'
import { getPaperDimensions, PAGE_MARGIN_MM } from '../model/Papers'

@Component
struct PageThumbnailsBar {
  @Prop images: ImageItem[] = []
  @Prop pages: PageLayout[] = []
  @Prop settingsPaperSize: string = 'A4'
  @Prop settingsOrientation: string = 'landscape'
  @Prop settingsGapMode: string = 'gapped'
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
                  ForEach(this.getSlotDisplayInfos(page), (info: ThumbSlotInfo) => {
                    if (info.hasImage) {
                      Image(info.thumbUrl)
                        .width(info.w)
                        .height(info.h)
                        .position({ x: info.x, y: info.y })
                        .objectFit(this.settingsGapMode === 'edge-to-edge'
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
    const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation)
    return paper.width * (64 / paper.height)
  }

  private getSlotDisplayInfos(page: PageLayout): ThumbSlotInfo[] {
    const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation)
    const scale: number = 64 / paper.height
    const margin: number = this.settingsGapMode === 'edge-to-edge' ? 0 : PAGE_MARGIN_MM

    const result: ThumbSlotInfo[] = []
    for (let i = 0; i < page.slots.length; i++) {
      const imgIdx: number = page.imageIndices[i]
      const slot: ImageSlot = page.slots[i]
      const info: ThumbSlotInfo = new ThumbSlotInfo()
      if (imgIdx !== undefined && imgIdx < this.images.length) {
        info.hasImage = true
        info.thumbUrl = this.images[imgIdx].thumbUrl
      }
      info.x = (margin + slot.x) * scale
      info.y = (margin + slot.y) * scale
      info.w = slot.width * scale
      info.h = slot.height * scale
      result.push(info)
    }
    return result
  }
}

class ThumbSlotInfo {
  hasImage: boolean = false
  thumbUrl: string = ''
  x: number = 0
  y: number = 0
  w: number = 0
  h: number = 0
}

export { PageThumbnailsBar }
