/**
 * 导出面板
 * 移植自 src/components/ExportPanel.vue
 */

@Component
struct ExportPanel {
  @Prop imageCount: number = 0
  @Prop pageCount: number = 0
  onExportPdf: () => void = () => {}
  onExportDocx: () => void = () => {}

  build() {
    Column() {
      Row({ space: 8 }) {
        // PDF 按钮
        Button() {
          Row({ space: 4 }) {
            SymbolGlyph($r('sys.symbol.doc'))
              .fontSize(14)
              .fontColor([Color.White])
            Text('PDF')
              .fontSize(12)
              .fontWeight(FontWeight.Medium)
              .fontColor(Color.White)
          }
        }
        .layoutWeight(1)
        .height(40)
        .backgroundColor(this.imageCount === 0 ? '#94A3B8' : '#3B82F6')
        .borderRadius(10)
        .enabled(this.imageCount > 0)
        .onClick(() => this.onExportPdf())

        // Word 按钮
        Button() {
          Row({ space: 4 }) {
            SymbolGlyph($r('sys.symbol.doc_text'))
              .fontSize(14)
              .fontColor([Color.White])
            Text('Word')
              .fontSize(12)
              .fontWeight(FontWeight.Medium)
              .fontColor(Color.White)
          }
        }
        .layoutWeight(1)
        .height(40)
        .backgroundColor(this.imageCount === 0 ? '#94A3B8' : '#10B981')
        .borderRadius(10)
        .enabled(this.imageCount > 0)
        .onClick(() => this.onExportDocx())
      }
      .width('100%')

      if (this.imageCount > 0) {
        Text(`${this.imageCount} 张 → ${this.pageCount} 页`)
          .fontSize(11)
          .fontColor('#999')
          .margin({ top: 6 })
          .width('100%')
          .textAlign(TextAlign.Center)
      } else {
        Text('添加图片后可导出')
          .fontSize(11)
          .fontColor('#ccc')
          .margin({ top: 6 })
          .width('100%')
          .textAlign(TextAlign.Center)
      }
    }
    .width('100%')
    .padding(16)
    .border({ width: { top: 1 }, color: '#F3F4F6', style: BorderStyle.Solid })
  }
}

export { ExportPanel }
