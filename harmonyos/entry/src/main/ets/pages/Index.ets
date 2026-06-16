/**
 * 主页面 - 图片布局工具
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
import { ImageItem, PageSettings, PageLayout, ImageSlot, PageOverrides, LayoutDefinition } from '../model/Types'
import { ImageManager } from '../viewmodel/ImageManager'
import { LayoutEngine } from '../viewmodel/LayoutEngine'
import { OverrideManager } from '../viewmodel/OverrideManager'
import { ImageListPanel } from '../components/ImageListPanel'
import { DocumentPreviewPanel } from '../components/DocumentPreviewPanel'
import { PageThumbnailsBar } from '../components/PageThumbnailsBar'
import { PageSettingsPanel } from '../components/PageSettingsPanel'
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
  @State paperSize: string = 'A4'
  @State orientation: string = 'landscape'
  @State gapMode: string = 'gapped'
  @State gapMm: number = 8
  @State imagesPerPage: number = -1
  @State imageCount: number = 0
  @State pageCount: number = 0
  @State layouts: LayoutDefinition[] = []
  @State activeLayoutIndex: number = 0

  private getSettings(): PageSettings {
    const s: PageSettings = new PageSettings()
    s.paperSize = this.paperSize
    s.orientation = this.orientation
    s.gapMode = this.gapMode
    s.gapMm = this.gapMm
    s.imagesPerPage = this.imagesPerPage
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
              this.imageManager.addImagesFromPicker(this.getUIContext().getHostContext()!)
            },
            onRemove: (id: string) => {
              this.imageManager.removeImage(id)
              this.refreshState()
            },
            onRemoveLast: () => {
              this.imageManager.removeLastImage()
              this.refreshState()
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
            pages: this.getMergedPages(),
            settingsPaperSize: this.paperSize,
            settingsOrientation: this.orientation,
            settingsGapMode: this.gapMode,
            settingsGapMm: this.gapMm,
            currentPage: this.currentPage,
          })
          .layoutWeight(1)
          .width('100%')

          // 页面导航
          if (this.pageCount > 0) {
            Row() {
              Button('<')
                .width(32)
                .height(32)
                .backgroundColor(Color.Transparent)
                .fontColor(this.currentPage > 0 ? '#333' : '#ccc')
                .enabled(this.currentPage > 0)
                .onClick(() => {
                  if (this.currentPage > 0) this.currentPage--
                })

              Text(`${this.currentPage + 1} / ${this.pageCount}`)
                .fontSize(12)
                .fontColor('#666')
                .margin({ left: 8, right: 8 })

              Button('>')
                .width(32)
                .height(32)
                .backgroundColor(Color.Transparent)
                .fontColor(this.currentPage < this.pageCount - 1 ? '#333' : '#ccc')
                .enabled(this.currentPage < this.pageCount - 1)
                .onClick(() => {
                  if (this.currentPage < this.pageCount - 1) this.currentPage++
                })
            }
            .height(48)
            .justifyContent(FlexAlign.Center)
            .border({ width: { top: 1 }, color: '#F3F4F6', style: BorderStyle.Solid })
          }

          // 缩略图条
          PageThumbnailsBar({
            images: this.imageManager.images,
            pages: this.getMergedPages(),
            settingsPaperSize: this.paperSize,
            settingsOrientation: this.orientation,
            settingsGapMode: this.gapMode,
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
                paperSize: this.paperSize,
                orientation: this.orientation,
                gapMode: this.gapMode,
                gapMm: this.gapMm,
                imagesPerPage: this.imagesPerPage,
                imageCount: this.imageCount,
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
                layouts: this.layouts,
                activeIndex: this.activeLayoutIndex,
                imageCount: this.imageCount,
                onSelect: (idx: number) => {
                  this.layoutEngine.selectLayout(idx)
                  this.activeLayoutIndex = idx
                  this.refreshState()
                },
              })
            }
          }
          .layoutWeight(1)
          .width('100%')

          // 导出面板
          ExportPanel({
            imageCount: this.imageCount,
            pageCount: this.pageCount,
            onExportPdf: () => {
              console.info('PDF 导出功能待实现')
            },
            onExportDocx: () => {
              console.info('Word 导出功能待实现')
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
      this.paperSize = value as string
    } else if (key === 'orientation') {
      this.orientation = value as string
    } else if (key === 'gapMode') {
      this.gapMode = value as string
    } else if (key === 'gapMm') {
      this.gapMm = value as number
    } else if (key === 'imagesPerPage') {
      this.imagesPerPage = value as number
    }
    this.layoutEngine.resetLayout()
    this.activeLayoutIndex = 0
    this.refreshState()
  }

  /**
   * 刷新所有计算状态
   */
  private refreshState(): void {
    const images: ImageItem[] = this.imageManager.images
    const settings: PageSettings = this.getSettings()
    this.imageCount = images.length
    this.layouts = this.layoutEngine.getAvailableLayouts(images, settings)
    this.activeLayoutIndex = this.layoutEngine.activeLayoutIndex
    const pages: PageLayout[] = this.layoutEngine.computePages(images, settings)
    this.pageCount = pages.length
    if (this.currentPage >= this.pageCount) {
      this.currentPage = Math.max(0, this.pageCount - 1)
    }
  }

  /**
   * 获取合并覆盖后的页面
   */
  private getMergedPages(): PageLayout[] {
    const images: ImageItem[] = this.imageManager.images
    const settings: PageSettings = this.getSettings()
    const pages: PageLayout[] = this.layoutEngine.computePages(images, settings)
    return this.overrideManager.getMergedPages(pages)
  }
}
