import { PageLayout } from "@bundle:com.example.imagetool/entry/ets/model/Types";
import type { ImageItem, PageSettings, LayoutDefinition, ImageSlot } from "@bundle:com.example.imagetool/entry/ets/model/Types";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@bundle:com.example.imagetool/entry/ets/model/Papers";
import { getLayoutsByKey, getLayoutKey, computeUniformScale } from "@bundle:com.example.imagetool/entry/ets/layouts/index";
@ObservedV2
export class LayoutEngine {
    @Trace
    activeLayoutIndex: number = 0;
    /**
     * 获取当前布局 key
     */
    getLayoutKeyFor(images: ImageItem[], settings: PageSettings): number {
        if (settings.imagesPerPage > 0) {
            return settings.imagesPerPage;
        }
        return getLayoutKey(images.length);
    }
    /**
     * 获取当前可用的布局列表
     */
    getAvailableLayouts(images: ImageItem[], settings: PageSettings): LayoutDefinition[] {
        const key: number = this.getLayoutKeyFor(images, settings);
        return getLayoutsByKey(key);
    }
    /**
     * 获取当前选中的布局
     */
    getActiveLayout(images: ImageItem[], settings: PageSettings): LayoutDefinition | undefined {
        const layouts: LayoutDefinition[] = this.getAvailableLayouts(images, settings);
        if (layouts.length === 0)
            return undefined;
        if (this.activeLayoutIndex >= layouts.length) {
            this.activeLayoutIndex = 0;
        }
        return layouts[this.activeLayoutIndex];
    }
    /**
     * 选择布局
     */
    selectLayout(index: number): void {
        this.activeLayoutIndex = index;
    }
    /**
     * 重置布局选择
     */
    resetLayout(): void {
        this.activeLayoutIndex = 0;
    }
    /**
     * 计算所有页面的布局
     */
    computePages(images: ImageItem[], settings: PageSettings): PageLayout[] {
        if (images.length === 0)
            return [];
        const paper = getPaperDimensions(settings.paperSize, settings.orientation);
        const isEdgeToEdge: boolean = settings.gapMode === 'edge-to-edge';
        const margin: number = isEdgeToEdge ? 0 : PAGE_MARGIN_MM;
        const contentW: number = paper.width - margin * 2;
        const contentH: number = paper.height - margin * 2;
        const gap: number = isEdgeToEdge ? 0 : settings.gapMm;
        const key: number = this.getLayoutKeyFor(images, settings);
        const layout: LayoutDefinition | undefined = this.getActiveLayout(images, settings);
        if (!layout)
            return [];
        const result: PageLayout[] = [];
        // 分页：按 key 分组
        for (let i = 0; i < images.length; i += key) {
            const pageImages: ImageItem[] = images.slice(i, i + key);
            const actualKey: number = pageImages.length;
            let pageLayout: LayoutDefinition = layout;
            if (actualKey < key) {
                const fallbackKey: number = getLayoutKey(actualKey);
                const fallbackLayouts: LayoutDefinition[] = getLayoutsByKey(fallbackKey);
                if (fallbackLayouts.length > 0) {
                    pageLayout = fallbackLayouts[0];
                }
            }
            const slots: ImageSlot[] = pageLayout.computeSlots(contentW, contentH, gap, actualKey);
            const scaleMode: string = isEdgeToEdge ? 'cover' : 'fit';
            const scale: number = computeUniformScale(slots, pageImages, scaleMode);
            const indices: number[] = [];
            for (let j = 0; j < pageImages.length; j++) {
                indices.push(i + j);
            }
            result.push(new PageLayout(slots, indices, scale));
        }
        return result;
    }
}
