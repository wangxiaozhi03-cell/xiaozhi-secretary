/**
 * 页面设置面板
 * 移植自 src/components/PageSettings.vue
 */
import { PageSettings, PaperSize } from '../model/Types'

@Component
struct PageSettingsPanel {
  @ObjectLink settings: PageSettingsObserved
  @Prop imageCount: number = 0
  onUpdate: (key: string, value: string | number) => void = (_k: string, _v: string | number) => {}

  private paperSizes: string[] = ['A4', 'A3', 'Letter']
  private orientations: Array<{ value: string; label: string }> = [
    { value: 'portrait', label: '纵向' },
    { value: 'landscape', label: '横向' },
  ]
  private gapModes: Array<{ value: string; label: string }> = [
    { value: 'gapped', label: '有间距' },
    { value: 'edge-to-edge', label: '铺满' },
  ]

  build() {
    Column({ space: 16 }) {
      // 纸张
      Column() {
        Text('纸张')
          .fontSize(11)
          .fontWeight(FontWeight.Medium)
          .fontColor('#999')
          .textCase(TextCase.Upper)
          .letterSpacing(2)
          .margin({ bottom: 8 })

        Row({ space: 6 }) {
          ForEach(this.paperSizes, (size: string) => {
            Button(size)
              .fontSize(12)
              .layoutWeight(1)
              .height(36)
              .backgroundColor(this.settings.paperSize === size ? '#3B82F6' : '#f5f5f5')
              .fontColor(this.settings.paperSize === size ? Color.White : '#666')
              .borderRadius(12)
              .onClick(() => this.onUpdate('paperSize', size))
          })
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16 })

      // 方向
      Column() {
        Text('方向')
          .fontSize(11)
          .fontWeight(FontWeight.Medium)
          .fontColor('#999')
          .textCase(TextCase.Upper)
          .letterSpacing(2)
          .margin({ bottom: 8 })

        Row({ space: 6 }) {
          ForEach(this.orientations, (o: { value: string; label: string }) => {
            Button(o.label)
              .fontSize(12)
              .layoutWeight(1)
              .height(36)
              .backgroundColor(this.settings.orientation === o.value ? '#3B82F6' : '#f5f5f5')
              .fontColor(this.settings.orientation === o.value ? Color.White : '#666')
              .borderRadius(12)
              .onClick(() => this.onUpdate('orientation', o.value))
          })
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16 })

      // 每页图片
      Column() {
        Text('每页图片')
          .fontSize(11)
          .fontWeight(FontWeight.Medium)
          .fontColor('#999')
          .textCase(TextCase.Upper)
          .letterSpacing(2)
          .margin({ bottom: 8 })

        Row({ space: 4 }) {
          ForEach([{ val: -1, label: '自动' }, { val: 1, label: '1张' },
                   { val: 2, label: '2张' }, { val: 3, label: '3张' },
                   { val: 4, label: '4张' }, { val: 6, label: '6张' },
                   { val: 9, label: '9张' }], (opt: { val: number; label: string }) => {
            if (opt.val === -1 || opt.val <= this.imageCount) {
              Button(opt.label)
                .fontSize(11)
                .height(32)
                .padding({ left: 12, right: 12 })
                .backgroundColor(this.settings.imagesPerPage === opt.val ? '#3B82F6' : '#f5f5f5')
                .fontColor(this.settings.imagesPerPage === opt.val ? Color.White : '#666')
                .borderRadius(12)
                .onClick(() => this.onUpdate('imagesPerPage', opt.val))
            }
          })
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16 })

      // 间距滑块
      if (this.settings.gapMode === 'gapped') {
        Column() {
          Row() {
            Text('间距')
              .fontSize(11)
              .fontWeight(FontWeight.Medium)
              .fontColor('#999')
              .textCase(TextCase.Upper)
              .letterSpacing(2)
            Text(`${this.settings.gapMm} mm`)
              .fontSize(11)
              .fontColor('#999')
          }
          .width('100%')
          .justifyContent(FlexAlign.SpaceBetween)
          .margin({ bottom: 8 })

          Slider({
            value: this.settings.gapMm,
            min: 0,
            max: 30,
            step: 1,
          })
            .width('100%')
            .onChange((value: number) => this.onUpdate('gapMm', value))
        }
        .width('100%')
        .padding({ left: 16, right: 16 })
      }

      // 间距模式
      Column() {
        Text('间距模式')
          .fontSize(11)
          .fontWeight(FontWeight.Medium)
          .fontColor('#999')
          .textCase(TextCase.Upper)
          .letterSpacing(2)
          .margin({ bottom: 8 })

        Row({ space: 6 }) {
          ForEach(this.gapModes, (m: { value: string; label: string }) => {
            Button(m.label)
              .fontSize(12)
              .layoutWeight(1)
              .height(36)
              .backgroundColor(this.settings.gapMode === m.value ? '#3B82F6' : '#f5f5f5')
              .fontColor(this.settings.gapMode === m.value ? Color.White : '#666')
              .borderRadius(12)
              .onClick(() => this.onUpdate('gapMode', m.value))
          })
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16 })
    }
    .width('100%')
    .padding({ top: 12, bottom: 12 })
  }
}

/**
 * PageSettings 的可观察包装
 * 用于 @ObjectLink 装饰器
 */
@ObservedV2
class PageSettingsObserved {
  @Trace paperSize: string = 'A4'
  @Trace orientation: string = 'landscape'
  @Trace gapMode: string = 'gapped'
  @Trace gapMm: number = 8
  @Trace imagesPerPage: number = -1
}

export { PageSettingsPanel, PageSettingsObserved }
