import { ImageItemData } from "@bundle:com.xiaozhi.imagelayout/entry/ets/model/ImageItem";
import { PageSettingsData, getPaperDimensions, PAGE_MARGIN_MM } from "@bundle:com.xiaozhi.imagelayout/entry/ets/model/PageSettings";
import type { PaperSize, Orientation, GapMode, LayoutKey } from "@bundle:com.xiaozhi.imagelayout/entry/ets/model/PageSettings";
import { LAYOUT_REGISTRY, getLayoutKey } from "@bundle:com.xiaozhi.imagelayout/entry/ets/shared/layouts/registry";
import { computeUniformScale } from "@bundle:com.xiaozhi.imagelayout/entry/ets/shared/layouts/fit";
import type { ImageSlot, LayoutDefinition, PageLayout } from '../shared/types/index';
class ImageSizeInfo {
    width: number = 0;
    height: number = 0;
    constructor(b31: number, c31: number) {
        this.width = b31;
        this.height = c31;
    }
}
export class ImageLayoutVM {
    images: ImageItemData[] = [];
    settings: PageSettingsData = new PageSettingsData();
    activeLayoutIndex: number = 0;
    currentPage: number = 0;
    pages: PageLayout[] = [];
    private nextId: number = 1;
    getLayoutKey(): LayoutKey {
        if (this.settings.imagesPerPage !== null) {
            return this.settings.imagesPerPage;
        }
        return getLayoutKey(this.images.length);
    }
    getAvailableLayouts(): LayoutDefinition[] {
        const a31: LayoutKey = this.getLayoutKey();
        return LAYOUT_REGISTRY[a31] || [];
    }
    getActiveLayout(): LayoutDefinition | null {
        const y30: LayoutDefinition[] = this.getAvailableLayouts();
        if (y30.length === 0)
            return null;
        const z30: number = this.activeLayoutIndex >= y30.length ? 0 : this.activeLayoutIndex;
        return y30[z30] || y30[0];
    }
    selectLayout(w30: number): void {
        const x30: LayoutDefinition[] = this.getAvailableLayouts();
        if (w30 >= 0 && w30 < x30.length) {
            this.activeLayoutIndex = w30;
            this.recalculatePages();
        }
    }
    addImage(r30: string, s30: string, t30: number, u30: number): void {
        const v30: string = `img-${this.nextId++}`;
        this.images = [...this.images, new ImageItemData(v30, r30, s30, t30, u30)];
        this.recalculatePages();
    }
    removeImage(p30: string): void {
        this.images = this.images.filter((q30: ImageItemData) => q30.id !== p30);
        if (this.currentPage >= this.getPageCount()) {
            this.currentPage = Math.max(0, this.getPageCount() - 1);
        }
        this.recalculatePages();
    }
    removeLastImage(): void {
        if (this.images.length > 0) {
            this.images = this.images.slice(0, -1);
            if (this.currentPage >= this.getPageCount()) {
                this.currentPage = Math.max(0, this.getPageCount() - 1);
            }
            this.recalculatePages();
        }
    }
    clearImages(): void {
        this.images = [];
        this.currentPage = 0;
        this.pages = [];
    }
    getImageCount(): number {
        return this.images.length;
    }
    getPageCount(): number {
        return this.pages.length;
    }
    getCurrentPageData(): PageLayout | null {
        if (this.currentPage >= 0 && this.currentPage < this.pages.length) {
            return this.pages[this.currentPage];
        }
        return null;
    }
    prevPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }
    nextPage(): void {
        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
        }
    }
    goToPage(o30: number): void {
        if (o30 >= 0 && o30 < this.pages.length) {
            this.currentPage = o30;
        }
    }
    updateSetting(m30: string, n30: string | number | null): void {
        if (m30 === 'paperSize') {
            this.settings.paperSize = n30 as PaperSize;
        }
        else if (m30 === 'orientation') {
            this.settings.orientation = n30 as Orientation;
        }
        else if (m30 === 'gapMode') {
            this.settings.gapMode = n30 as GapMode;
        }
        else if (m30 === 'gapMm') {
            this.settings.gapMm = n30 as number;
        }
        else if (m30 === 'imagesPerPage') {
            this.settings.imagesPerPage = n30 as LayoutKey | null;
            this.activeLayoutIndex = 0;
        }
        this.recalculatePages();
    }
    private recalculatePages(): void {
        if (this.images.length === 0) {
            this.pages = [];
            return;
        }
        const p29 = getPaperDimensions(this.settings.paperSize, this.settings.orientation);
        const q29: boolean = this.settings.gapMode === 'edge-to-edge';
        const r29: number = q29 ? 0 : PAGE_MARGIN_MM;
        const s29: number = p29.width - r29 * 2;
        const t29: number = p29.height - r29 * 2;
        const u29: number = q29 ? 0 : this.settings.gapMm;
        const v29: LayoutKey = this.getLayoutKey();
        const w29: LayoutDefinition | null = this.getActiveLayout();
        if (!w29) {
            this.pages = [];
            return;
        }
        const x29: PageLayout[] = [];
        for (let y29 = 0; y29 < this.images.length; y29 += v29) {
            const z29: ImageItemData[] = this.images.slice(y29, y29 + v29);
            const a30: number = z29.length;
            let b30: LayoutDefinition = w29;
            if (a30 < v29) {
                const k30: LayoutKey = getLayoutKey(a30);
                const l30: LayoutDefinition[] | undefined = LAYOUT_REGISTRY[k30];
                if (l30 && l30.length > 0) {
                    b30 = l30[0];
                }
            }
            const c30: ImageSlot[] = b30.computeSlots(s29, t29, u29, a30);
            const d30: 'fit' | 'cover' = this.settings.gapMode === 'edge-to-edge' ? 'cover' : 'fit';
            const e30: ImageSizeInfo[] = z29.map((j30: ImageItemData) => new ImageSizeInfo(j30.width, j30.height));
            const f30: number = computeUniformScale(c30, e30, d30);
            const g30: PageLayout = {
                slots: c30,
                imageIndices: z29.map((h30: ImageItemData, i30: number) => y29 + i30),
                uniformScale: f30,
            };
            x29.push(g30);
        }
        this.pages = x29;
    }
}
