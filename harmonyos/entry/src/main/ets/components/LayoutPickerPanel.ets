/**
 * 布局选择面板
 * 移植自 src/components/LayoutPicker.vue
 */
import { LayoutDefinition } from '../model/Types'

@Component
struct LayoutPickerPanel {
  @Prop layouts: LayoutDefinition[] = []
  @Prop activeIndex: number = 0
  @Prop imageCount: number = 0
  onSelect: (index: number) => void = (_idx: number) => {}

  build() {
    Column() {
      // 标题
      Text('布局模式')
        .fontSize(11)
        .fontWeight(FontWeight.Medium)
        .fontColor('#999')
        .textCase(TextCase.Upper)
        .letterSpacing(2)
        .margin({ bottom: 4 })
        .alignSelf(ItemAlign.Start)
        .padding({ left: 16 })

      Text(`${this.imageCount} 张图片 · ${this.layouts.length} 种布局`)
        .fontSize(11)
        .fontColor('#999')
        .margin({ bottom: 12 })
        .alignSelf(ItemAlign.Start)
        .padding({ left: 16 })

      if (this.layouts.length === 0) {
        Text('请先添加图片')
          .fontSize(12)
          .fontColor('#999')
          .width('100%')
          .textAlign(TextAlign.Center)
          .padding({ top: 32 })
      } else {
        Grid() {
          ForEach(this.layouts, (layout: LayoutDefinition, index: number) => {
            GridItem() {
              Column() {
                // 布局缩略图
                this.LayoutThumbnailBuilder(layout.id)
                  .width('100%')
                  .height(32)
                  .margin({ bottom: 4 })

                Text(layout.name)
                  .fontSize(10)
                  .fontColor('#666')
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
              }
              .padding(8)
              .borderRadius(10)
              .backgroundColor(index === this.activeIndex ? '#EFF6FF' : 'transparent')
              .border({
                width: index === this.activeIndex ? 1.5 : 0,
                color: '#93C5FD',
                style: BorderStyle.Solid,
              })
              .onClick(() => this.onSelect(index))
            }
          }, (layout: LayoutDefinition) => layout.id)
        }
        .columnsTemplate('1fr 1fr 1fr')
        .rowsGap(8)
        .columnsGap(8)
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16 })
      }
    }
    .width('100%')
    .padding({ top: 12, bottom: 12 })
  }

  @Builder
  LayoutThumbnailBuilder(layoutId: string) {
    // 简化的布局缩略图
    Row() {
      if (layoutId === 'center-fit') {
        Column() {
          Row().width('50%').height('60%').backgroundColor('#93C5FD').borderRadius(2)
        }.width('100%').height('100%').justifyContent(FlexAlign.Center)
      } else if (layoutId === 'fill-page') {
        Row().width('100%').height('100%').backgroundColor('#93C5FD').borderRadius(2)
      } else if (layoutId === 'top-bottom' || layoutId === 'three-vertical') {
        Column({ space: 2 }) {
          Row().layoutWeight(1).width('100%').backgroundColor('#93C5FD').borderRadius(2)
          Row().layoutWeight(1).width('100%').backgroundColor('#60A5FA').borderRadius(2)
        }.width('100%').height('100%')
      } else if (layoutId === 'left-right' || layoutId === 'three-horizontal') {
        Row({ space: 2 }) {
          Column().layoutWeight(1).height('100%').backgroundColor('#93C5FD').borderRadius(2)
          Column().layoutWeight(1).height('100%').backgroundColor('#60A5FA').borderRadius(2)
        }.width('100%').height('100%')
      } else if (layoutId === 'grid-2x2' || layoutId === 'grid-3x3') {
        Column({ space: 2 }) {
          Row({ space: 2 }) {
            Column().layoutWeight(1).height('100%').backgroundColor('#93C5FD').borderRadius(2)
            Column().layoutWeight(1).height('100%').backgroundColor('#60A5FA').borderRadius(2)
          }.layoutWeight(1).width('100%')
          Row({ space: 2 }) {
            Column().layoutWeight(1).height('100%').backgroundColor('#60A5FA').borderRadius(2)
            Column().layoutWeight(1).height('100%').backgroundColor('#93C5FD').borderRadius(2)
          }.layoutWeight(1).width('100%')
        }.width('100%').height('100%')
      } else {
        // 通用布局缩略图
        Row().width('100%').height('100%').backgroundColor('#E5E7EB').borderRadius(2)
      }
    }
    .width('100%')
    .height('100%')
  }
}

export { LayoutPickerPanel }
