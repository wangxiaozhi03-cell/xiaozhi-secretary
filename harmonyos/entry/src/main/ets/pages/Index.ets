/**
 * 主页面 - 图片布局工具
 * 移植自现有 Vue 应用的整体布局
 *
 * 整体结构：
 * ┌─────────────────────────────────────────┐
 * │  标题栏                                  │
 * ├────────┬──────────────────────┬──────────┤
 * │ 图片   │                      │ 页面设置 │
 * │ 列表   │    文档预览区         │ 布局选择 │
 * │        │                      │          │
 * │        │                      │ 导出     │
 * ├────────┴──────────────────────┴──────────┤
 * │  页面缩略图条                             │
 * └─────────────────────────────────────────┘
 */
import { ImageItem, PageSettings, PageLayout, ImageSlot, PageOverrides, ImageOffset } from '../model/Types'
import { ImageManager } from '../viewmodel/ImageManager'
import { LayoutEngine } from '../viewmodel/LayoutEngine'
import { OverrideManager } from '../viewmodel/OverrideManager'
import { ImageListPanel } from '../components/ImageListPanel'
import { DocumentPreviewPanel } from '../components/DocumentPreviewPanel'
import { PageThumbnailsBar } from '../components/PageThumbnailsBar'
import { PageSettingsPanel, PageSettingsObserved } from '../components/PageSettingsPanel'
import { LayoutPickerPanel } from '../components/LayoutPickerPanel'
import { ExportPanel } from '../components/ExportPanel'

@Entry
@Component
struct Index {
  // 状态管理
  private imageManager: ImageManager = new ImageManager()
  private layoutEngine: LayoutEngine = new LayoutEngine()
  private overrideManager: OverrideManager = new OverrideManager()
  @State currentPage: number = 0
  @State settingsObserved: PageSettingsObserved = new PageSettingsObserved()

  // 计算属性
  private get pages(): PageLayout[] {
    return this.layoutEngine.computePages(
      this.imageManager.images,
      this.getSettings()
    )
  }

  private get mergedPages(): PageLayout[] {
    return this.overrideManager.getMergedPages(this.pages)
  }

  private get availableLayouts(): LayoutDefinition[] {
    return this.layoutEngine.getAvailableLayouts(
      this.imageManager.images,
      this.getSettings()
    )
  }

  private getSettings(): PageSettings {
    const s = new PageSettings()
    s.paperSize = this.settingsObserved.paperSize as PaperSize
    s.orientation = this.settingsObserved.orientation as Orientation
    s.gapMode = this.settingsObserved.gapMode as GapMode
    s.gapMm = this.settingsObserved.gapMm
    s.imagesPerPage = this.settingsObserved.imagesPerPage
    return s
  }

  build() {
    Column() {
      // 标题栏
      Row() {
        Text('图片工具')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1F2937')

        Text('文档生成器')
          .fontSize(12)
          .fontColor('#9CA3AF')
          .padding({ left: 8 })
      }
      .width('100%')
      .height(48)
      .padding({ left: 16, right: 16 })
      .backgroundColor(Color.White)
      .border({ width: { bottom: 1 }, color: '#F3F4F6', style: BorderStyle.Solid })

      // 主内容区
      Row() {
        // 左侧面板 - 图片列表
        Column() {
          ImageListPanel({
            images: this.imageManager.images,
            onAdd: () => {
              this.imageManager.addImagesFromPicker(getContext(this))
            },
            onRemove: (id: string) => {
              this.imageManager.removeImage(id)
            },
            onRemoveLast: () => {
              this.imageManager.removeLastImage()
            },
          })
        }
        .width(240)
        .height('100%')
        .backgroundColor(Color.White)
        .border({ width: { right: 1 }, color: '#F3F4F6', style: BorderStyle.Solid })

        // 中间 - 预览区 + 缩略图条
        Column() {
          // 预览区
          DocumentPreviewPanel({
            images: this.imageManager.images,
            pages: this.mergedPages,
            settings: this.getSettings(),
            currentPage: this.currentPage,
            overrides: this.overrideManager.overrideMap,
            onSetImageOffset: (imgIdx: number, ox: number, oy: number) => {
              this.overrideManager.setImageOffset(this.currentPage, imgIdx, ox, oy)
            },
            onSetPageSlots: (slots: ImageSlot[]) => {
              this.overrideManager.setPageSlots(this.currentPage, slots)
            },
            onDropOnSlot: (fromPage: number, fromSlot: number, toPage: number, toSlot: number) => {
              if (fromPage === toPage) {
                this.overrideManager.swapImages(fromPage, fromSlot, toSlot, this.pages)
              }
            },
          })
          .layoutWeight(1)
          .width('100%')

          // 页面导航
          if (this.mergedPages.length > 0) {
            Row() {
              Button() {
                SymbolGlyph($r('sys.symbol.chevron_left'))
                  .fontSize(16)
                  .fontColor([this.currentPage > 0 ? '#333' : '#ccc'])
              }
              .width(32)
              .height(32)
              .backgroundColor(Color.Transparent)
              .enabled(this.currentPage > 0)
              .onClick(() => {
                if (this.currentPage > 0) this.currentPage--
              })

              Text(`${this.currentPage + 1} / ${this.mergedPages.length}`)
                .fontSize(12)
                .fontColor('#666')
                .margin({ left: 8, right: 8 })

              Button() {
                SymbolGlyph($r('sys.symbol.chevron_right'))
                  .fontSize(16)
                  .fontColor([this.currentPage < this.mergedPages.length - 1 ? '#333' : '#ccc'])
              }
              .width(32)
              .height(32)
              .backgroundColor(Color.Transparent)
              .enabled(this.currentPage < this.mergedPages.length - 1)
              .onClick(() => {
                if (this.currentPage < this.mergedPages.length - 1) this.currentPage++
              })
            }
            .height(48)
            .justifyContent(FlexAlign.Center)
            .border({ width: { top: 1 }, color: '#F3F4F6', style: BorderStyle.Solid })
          }

          // 缩略图条
          PageThumbnailsBar({
            images: this.imageManager.images,
            pages: this.mergedPages,
            settings: this.getSettings(),
            currentPage: this.currentPage,
            onGoToPage: (idx: number) => {
              this.currentPage = idx
            },
          })
        }
        .layoutWeight(1)
        .height('100%')

        // 右侧面板 - 设置
        Column() {
          // 页面设置
          Scroll() {
            Column() {
              PageSettingsPanel({
                settings: this.settingsObserved,
                imageCount: this.imageManager.images.length,
                onUpdate: (key: string, value: string | number) => {
                  this.updateSetting(key, value)
                },
              })

              // 分隔线
              Divider()
                .color('#F3F4F6')
                .margin({ top: 8, bottom: 8 })

              // 布局选择
              LayoutPickerPanel({
                layouts: this.availableLayouts,
                activeIndex: this.layoutEngine.activeLayoutIndex,
                imageCount: this.imageManager.images.length,
                onSelect: (idx: number) => {
                  this.layoutEngine.selectLayout(idx)
                },
              })
            }
          }
          .layoutWeight(1)
          .width('100%')

          // 导出面板
          ExportPanel({
            imageCount: this.imageManager.images.length,
            pageCount: this.mergedPages.length,
            onExportPdf: () => {
              this.handleExportPdf()
            },
            onExportDocx: () => {
              this.handleExportDocx()
            },
          })
        }
        .width(260)
        .height('100%')
        .backgroundColor(Color.White)
        .border({ width: { left: 1 }, color: '#F3F4F6', style: BorderStyle.Solid })
      }
      .layoutWeight(1)
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F9FAFB')
  }

  /**
   * 更新设置
   */
  private updateSetting(key: string, value: string | number): void {
    if (key === 'paperSize') {
      this.settingsObserved.paperSize = value as string
    } else if (key === 'orientation') {
      this.settingsObserved.orientation = value as string
    } else if (key === 'gapMode') {
      this.settingsObserved.gapMode = value as string
    } else if (key === 'gapMm') {
      this.settingsObserved.gapMm = value as number
    } else if (key === 'imagesPerPage') {
      this.settingsObserved.imagesPerPage = value as number
    }
    // 布局 key 变化时重置
    this.layoutEngine.resetLayout()
  }

  /**
   * 导出 PDF
   * 注意：完整的 PDF 导出需要在 Canvas 渲染完成后
   * 将 PixelMap 数据导出。这里提供框架逻辑。
   */
  private handleExportPdf(): void {
    // TODO: 实现完整 PDF 导出
    // 方案：
    // 1. 遍历所有页面
    // 2. 使用 Canvas 渲染每页
    // 3. 将渲染结果转为 PNG 图片
    // 4. 构造 PDF 文件（可使用第三方库或自研 PDF writer）
    // 5. 保存到用户选择的目录
    console.info('PDF 导出功能待实现')
  }

  /**
   * 导出 Word
   */
  private handleExportDocx(): void {
    // TODO: 实现完整 Word 导出
    // 方案：
    // 1. 遍历所有页面
    // 2. 使用 Canvas 渲染每页为 PNG
    // 3. 使用 SimpleZip 构造 OOXML 文档
    // 4. 保存到用户选择的目录
    console.info('Word 导出功能待实现')
  }
}
