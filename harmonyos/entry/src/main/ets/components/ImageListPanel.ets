/**
 * 图片列表面板
 * 移植自 src/components/ImageList.vue
 */
import { ImageItem } from '../model/Types'

@Component
struct ImageListPanel {
  @Prop images: ImageItem[] = []
  onAdd: () => void = () => {}
  onRemove: (id: string) => void = (_id: string) => {}
  onRemoveLast: () => void = () => {}

  build() {
    Column() {
      // 标题栏
      Row() {
        Text('图片')
          .fontSize(11)
          .fontWeight(FontWeight.Medium)
          .fontColor('#999')
          .letterSpacing(2)

        Text(`${this.images.length} 张`)
          .fontSize(11)
          .fontColor('#666')
          .padding({ left: 6, right: 6, top: 2, bottom: 2 })
          .backgroundColor('#f0f0f0')
          .borderRadius(8)
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceBetween)
      .padding({ left: 16, right: 16, top: 12 })

      // 操作按钮
      Row({ space: 8 }) {
        Button('添加')
          .fontSize(12)
          .layoutWeight(1)
          .height(36)
          .backgroundColor('#3B82F6')
          .fontColor(Color.White)
          .borderRadius(12)
          .onClick(() => this.onAdd())

        Button('移除')
          .fontSize(12)
          .layoutWeight(1)
          .height(36)
          .backgroundColor(this.images.length === 0 ? '#f5f5f5' : '#FEE2E2')
          .fontColor(this.images.length === 0 ? '#ccc' : '#F87171')
          .borderRadius(12)
          .enabled(this.images.length > 0)
          .onClick(() => this.onRemoveLast())
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 8, bottom: 8 })

      // 图片列表
      if (this.images.length === 0) {
        Column() {
          Text('📷')
            .fontSize(40)
            .margin({ bottom: 8 })
          Text('点击添加图片')
            .fontSize(12)
            .fontColor('#999')
        }
        .width('100%')
        .justifyContent(FlexAlign.Center)
        .padding({ top: 32, bottom: 32 })
      } else {
        List() {
          ForEach(this.images, (img: ImageItem) => {
            ListItem() {
              Row() {
                // 缩略图
                Image(img.thumbUrl)
                  .width(44)
                  .height(32)
                  .objectFit(ImageFit.Cover)
                  .borderRadius(6)
                  .backgroundColor('#f5f5f5')

                // 信息
                Column() {
                  Text(img.name)
                    .fontSize(12)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#333')
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                  Text(`${img.width}×${img.height}`)
                    .fontSize(10)
                    .fontColor('#999')
                }
                .layoutWeight(1)
                .alignItems(HorizontalAlign.Start)
                .padding({ left: 8 })

                // 删除按钮
                Button('✕')
                  .fontSize(14)
                  .fontColor('#ccc')
                  .backgroundColor(Color.Transparent)
                  .width(28)
                  .height(28)
                  .onClick(() => this.onRemove(img.id))
              }
              .width('100%')
              .padding(8)
              .borderRadius(12)
            }
          }, (img: ImageItem) => img.id)
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 16, right: 16, bottom: 8 })
      }
    }
    .width('100%')
    .height('100%')
  }
}

export { ImageListPanel }
