/**
 * 布局计算引擎
 * 移植自 src/composables/useLayout.ts
 */
import { ImageItem, PageSettings, PageLayout, LayoutDefinition, ImageSlot } from '../model/Types'
import { getPaperDimensions, PAGE_MARGIN_MM } from '../model/Papers'
import { LAYOUT_REGISTRY, getLayoutKey, computeUniformScale } from '../layouts'

@ObservedV2
export class LayoutEngine {
  @Trace activeLayoutIndex: number = 0

  /**
   * 获取当前布局 key：手动覆盖 > 自动检测
   */
  getLayoutKeyFor(images: ImageItem[], settings: PageSettings): number {
    if (settings.imagesPerPage > 0) {
      return settings.imagesPerPage
    }
    return getLayoutKey(images.length)
  }

  /**
   * 获取当前可用的布局列表
   */
  getAvailableLayouts(images: ImageItem[], settings: PageSettings): LayoutDefinition[] {
    const key = this.getLayoutKeyFor(images, settings)
    return LAYOUT_REGISTRY[key] || []
  }

  /**
   * 获取当前选中的布局
   */
  getActiveLayout(images: ImageItem[], settings: PageSettings): LayoutDefinition | undefined {
    const layouts = this.getAvailableLayouts(images, settings)
    if (layouts.length === 0) return undefined
    if (this.activeLayoutIndex >= layouts.length) {
      this.activeLayoutIndex = 0
    }
    return layouts[this.activeLayoutIndex]
  }

  /**
   * 选择布局
   */
  selectLayout(index: number): void {
    this.activeLayoutIndex = index
  }

  /**
   * 重置布局选择
   */
  resetLayout(): void {
    this.activeLayoutIndex = 0
  }

  /**
   * 计算所有页面的布局
   */
  computePages(images: ImageItem[], settings: PageSettings): PageLayout[] {
    if (images.length === 0) return []

    const paper = getPaperDimensions(settings.paperSize, settings.orientation)
    const isEdgeToEdge = settings.gapMode === 'edge-to-edge'
    const margin = isEdgeToEdge ? 0 : PAGE_MARGIN_MM
    const contentW = paper.width - margin * 2
    const contentH = paper.height - margin * 2
    const gap = isEdgeToEdge ? 0 : settings.gapMm
    const key = this.getLayoutKeyFor(images, settings)
    const layout = this.getActiveLayout(images, settings)
    if (!layout) return []

    const result: PageLayout[] = []

    // 分页：按 key 分组
    for (let i = 0; i < images.length; i += key) {
      const pageImages = images.slice(i, i + key)
      const actualKey = pageImages.length
      let pageLayout = layout
      if (actualKey < key) {
        const fallbackKey = getLayoutKey(actualKey)
        const fallbackLayouts = LAYOUT_REGISTRY[fallbackKey]
        if (fallbackLayouts && fallbackLayouts.length > 0) {
          pageLayout = fallbackLayouts[0]
        }
      }
      const slots = pageLayout.computeSlots(contentW, contentH, gap, actualKey)
      const scaleMode = isEdgeToEdge ? 'cover' : 'fit'
      const scale = computeUniformScale(slots, pageImages, scaleMode)
      result.push(new PageLayout(
        slots,
        pageImages.map((_: ImageItem, idx: number) => i + idx),
        scale
      ))
    }

    return result
  }
}
