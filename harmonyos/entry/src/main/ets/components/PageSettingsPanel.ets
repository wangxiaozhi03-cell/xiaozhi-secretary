/**
 * 页面设置面板
 * 移植自 src/components/PageSettings.vue
 */

class OrientationOption {
  value: string = ''
  label: string = ''
  constructor(value: string, label: string) {
    this.value = value
    this.label = label
  }
}

class GapModeOption {
  value: string = ''
  label: string = ''
  constructor(value: string, label: string) {
    this.value = value
    this.label = label
  }
}

class PerPageOption {
  val: number = 0
  label: string = ''
  constructor(val: number, label: string) {
    this.val = val
    this.label = label
  }
}

@Component
struct PageSettingsPanel {
  @Prop paperSize: string = 'A4'
  @Prop orientation: string = 'landscape'
  @Prop gapMode: string = 'gapped'
  @Prop gapMm: number = 8
  @Prop imagesPerPage: number = -1
  @Prop imageCount: number = 0
  onUpdate: (key: string, value: string | number) => void = (_k: string, _v: string | number) => {}

  private paperSizes: string[] = ['A4', 'A3', 'Letter']
  private orientations: OrientationOption[] = [
    new OrientationOption('portrait', '纵向'),
    new OrientationOption('landscape', '横向'),
  ]
  private gapModes: GapModeOption[] = [
    new GapModeOption('gapped', '有间距'),
    new GapModeOption('edge-to-edge', '铺满'),
  ]
  private allPerPageOptions: PerPageOption[] = [
    new PerPageOption(-1, '自动'),
    new PerPageOption(1, '1张'),
    new PerPageOption(2, '2张'),
    new PerPageOption(3, '3张'),
    new PerPageOption(4, '4张'),
    new PerPageOption(6, '6张'),
    new PerPageOption(9, '9张'),
  ]

  build() {
    Column({ space: 16 }) {
      // 纸张
      Column() {
        Text('纸张')
          .fontSize(11)
          .fontWeight(FontWeight.Medium)
          .fontColor('#999')
          .letterSpacing(2)
          .margin({ bottom: 8 })

        Row({ space: 6 }) {
          ForEach(this.paperSizes, (size: string) => {
            Button(size)
              .fontSize(12)
              .layoutWeight(1)
              .height(36)
              .backgroundColor(this.paperSize === size ? '#3B82F6' : '#f5f5f5')
              .fontColor(this.paperSize === size ? Color.White : '#666')
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
          .letterSpacing(2)
          .margin({ bottom: 8 })

        Row({ space: 6 }) {
          ForEach(this.orientations, (o: OrientationOption) => {
            Button(o.label)
              .fontSize(12)
              .layoutWeight(1)
              .height(36)
              .backgroundColor(this.orientation === o.value ? '#3B82F6' : '#f5f5f5')
              .fontColor(this.orientation === o.value ? Color.White : '#666')
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
          .letterSpacing(2)
          .margin({ bottom: 8 })

        Row({ space: 4 }) {
          ForEach(this.getPerPageOptions(), (opt: PerPageOption) => {
            Button(opt.label)
              .fontSize(11)
              .height(32)
              .padding({ left: 12, right: 12 })
              .backgroundColor(this.imagesPerPage === opt.val ? '#3B82F6' : '#f5f5f5')
              .fontColor(this.imagesPerPage === opt.val ? Color.White : '#666')
              .borderRadius(12)
              .onClick(() => this.onUpdate('imagesPerPage', opt.val))
          })
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16 })

      // 间距滑块
      if (this.gapMode === 'gapped') {
        Column() {
          Row() {
            Text('间距')
              .fontSize(11)
              .fontWeight(FontWeight.Medium)
              .fontColor('#999')
              .letterSpacing(2)
            Text(`${this.gapMm} mm`)
              .fontSize(11)
              .fontColor('#999')
          }
          .width('100%')
          .justifyContent(FlexAlign.SpaceBetween)
          .margin({ bottom: 8 })

          Slider({
            value: this.gapMm,
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
          .letterSpacing(2)
          .margin({ bottom: 8 })

        Row({ space: 6 }) {
          ForEach(this.gapModes, (m: GapModeOption) => {
            Button(m.label)
              .fontSize(12)
              .layoutWeight(1)
              .height(36)
              .backgroundColor(this.gapMode === m.value ? '#3B82F6' : '#f5f5f5')
              .fontColor(this.gapMode === m.value ? Color.White : '#666')
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

  private getPerPageOptions(): PerPageOption[] {
    if (this.imageCount === 0) {
      return [new PerPageOption(-1, '自动')]
    }
    return this.allPerPageOptions.filter((opt: PerPageOption) => {
      if (opt.val === -1) return true
      return opt.val <= this.imageCount
    })
  }
}

export { PageSettingsPanel }
