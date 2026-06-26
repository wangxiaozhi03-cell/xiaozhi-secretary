import { ImageItemData } from '../model/ImageItem';
import { PageSettingsData, PaperDimension, PaperSize, Orientation, GapMode, LayoutKey, getPaperDimensions, PAGE_MARGIN_MM } from '../model/PageSettings';
import { LAYOUT_REGISTRY, getLayoutKey } from '../shared/layouts/registry';
import { computeUniformScale } from '../shared/layouts/fit';
import { ImageSlot, LayoutDefinition, PageLayout } from '../shared/types/index';

/** 图片尺寸信息 */
class ImageSizeInfo {
  width: number = 0;
  height: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

/**
 * 图片排版 ViewModel
 * 管理所有业务逻辑状态
 */
export class ImageLayoutVM {
  // 图片列表
  images: ImageItemData[] = [];

  // 页面设置
  settings: PageSettingsData = new PageSettingsData();

  // 当前选中的布局索引
  activeLayoutIndex: number = 0;

  // 当前页码
  currentPage: number = 0;

  // 生成的页面布局
  pages: PageLayout[] = [];

  private nextId: number = 1;

  /**
   * 获取当前布局 key
   */
  getLayoutKey(): LayoutKey {
    if (this.settings.imagesPerPage !== null) {
      return this.settings.imagesPerPage;
    }
    return getLayoutKey(this.images.length);
  }

  /**
   * 获取当前可用的布局列表
   */
  getAvailableLayouts(): LayoutDefinition[] {
    const key: LayoutKey = this.getLayoutKey();
    return LAYOUT_REGISTRY[key] || [];
  }

  /**
   * 获取当前选中的布局
   */
  getActiveLayout(): LayoutDefinition | null {
    const layouts: LayoutDefinition[] = this.getAvailableLayouts();
    if (layouts.length === 0) return null;
    const idx: number = this.activeLayoutIndex >= layouts.length ? 0 : this.activeLayoutIndex;
    return layouts[idx] || layouts[0];
  }

  /**
   * 选择布局
   */
  selectLayout(index: number): void {
    const layouts: LayoutDefinition[] = this.getAvailableLayouts();
    if (index >= 0 && index < layouts.length) {
      this.activeLayoutIndex = index;
      this.recalculatePages();
    }
  }

  /**
   * 添加图片
   */
  addImage(name: string, uri: string, width: number, height: number): void {
    const id: string = `img-${this.nextId++}`;
    this.images = [...this.images, new ImageItemData(id, name, uri, width, height)];
    this.recalculatePages();
  }

  /**
   * 移除图片
   */
  removeImage(id: string): void {
    this.images = this.images.filter((img: ImageItemData) => img.id !== id);
    if (this.currentPage >= this.getPageCount()) {
      this.currentPage = Math.max(0, this.getPageCount() - 1);
    }
    this.recalculatePages();
  }

  /**
   * 移除最后一张图片
   */
  removeLastImage(): void {
    if (this.images.length > 0) {
      this.images = this.images.slice(0, -1);
      if (this.currentPage >= this.getPageCount()) {
        this.currentPage = Math.max(0, this.getPageCount() - 1);
      }
      this.recalculatePages();
    }
  }

  /**
   * 清空所有图片
   */
  clearImages(): void {
    this.images = [];
    this.currentPage = 0;
    this.pages = [];
  }

  /**
   * 获取图片数量
   */
  getImageCount(): number {
    return this.images.length;
  }

  /**
   * 获取页数
   */
  getPageCount(): number {
    return this.pages.length;
  }

  /**
   * 获取当前页数据
   */
  getCurrentPageData(): PageLayout | null {
    if (this.currentPage >= 0 && this.currentPage < this.pages.length) {
      return this.pages[this.currentPage];
    }
    return null;
  }

  /**
   * 上一页
   */
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  /**
   * 下一页
   */
  nextPage(): void {
    if (this.currentPage < this.pages.length - 1) {
      this.currentPage++;
    }
  }

  /**
   * 跳转到指定页
   */
  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.pages.length) {
      this.currentPage = pageIndex;
    }
  }

  /**
   * 更新页面设置
   */
  updateSetting(key: string, value: string | number | null): void {
    if (key === 'paperSize') {
      this.settings.paperSize = value as PaperSize;
    } else if (key === 'orientation') {
      this.settings.orientation = value as Orientation;
    } else if (key === 'gapMode') {
      this.settings.gapMode = value as GapMode;
    } else if (key === 'gapMm') {
      this.settings.gapMm = value as number;
    } else if (key === 'imagesPerPage') {
      this.settings.imagesPerPage = value as LayoutKey | null;
      this.activeLayoutIndex = 0;
    }
    this.recalculatePages();
  }

  /**
   * 重新计算所有页面布局
   */
  private recalculatePages(): void {
    if (this.images.length === 0) {
      this.pages = [];
      return;
    }

    const paper = getPaperDimensions(this.settings.paperSize, this.settings.orientation);
    const isEdgeToEdge: boolean = this.settings.gapMode === 'edge-to-edge';
    const margin: number = isEdgeToEdge ? 0 : PAGE_MARGIN_MM;
    const contentW: number = paper.width - margin * 2;
    const contentH: number = paper.height - margin * 2;
    const gap: number = isEdgeToEdge ? 0 : this.settings.gapMm;
    const key: LayoutKey = this.getLayoutKey();
    const layout: LayoutDefinition | null = this.getActiveLayout();
    if (!layout) {
      this.pages = [];
      return;
    }

    const result: PageLayout[] = [];

    for (let i = 0; i < this.images.length; i += key) {
      const pageImages: ImageItemData[] = this.images.slice(i, i + key);
      const actualKey: number = pageImages.length;
      let pageLayout: LayoutDefinition = layout;

      if (actualKey < key) {
        const fallbackKey: LayoutKey = getLayoutKey(actualKey);
        const fallbackLayouts: LayoutDefinition[] | undefined = LAYOUT_REGISTRY[fallbackKey];
        if (fallbackLayouts && fallbackLayouts.length > 0) {
          pageLayout = fallbackLayouts[0];
        }
      }

      const slots: ImageSlot[] = pageLayout.computeSlots(contentW, contentH, gap, actualKey);
      const scaleMode: 'fit' | 'cover' = this.settings.gapMode === 'edge-to-edge' ? 'cover' : 'fit';
      const imageData: ImageSizeInfo[] = pageImages.map((img: ImageItemData) =>
        new ImageSizeInfo(img.width, img.height)
      );
      const scale: number = computeUniformScale(slots, imageData, scaleMode);

      const pageData: PageLayout = {
        slots: slots,
        imageIndices: pageImages.map((_: ImageItemData, idx: number) => i + idx),
        uniformScale: scale,
      };
      result.push(pageData);
    }

    this.pages = result;
  }
}
