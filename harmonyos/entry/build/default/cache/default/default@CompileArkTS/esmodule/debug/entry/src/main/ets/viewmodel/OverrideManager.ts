import { ImageOffset, PageOverrides, PageLayout } from "@bundle:com.example.imagetool/entry/ets/model/Types";
import type { ImageSlot } from "@bundle:com.example.imagetool/entry/ets/model/Types";
@ObservedV2
export class OverrideManager {
    // 按页码存储覆盖数据
    @Trace
    overrideMap: Map<number, PageOverrides> = new Map();
    private ensurePage(pageIndex: number): PageOverrides {
        let page = this.overrideMap.get(pageIndex);
        if (!page) {
            page = new PageOverrides();
            this.overrideMap.set(pageIndex, page);
        }
        return page;
    }
    /**
     * 获取某页当前的 imageIndices（优先用覆盖值）
     */
    getImageIndices(pageIndex: number, basePages: PageLayout[]): number[] {
        const page = basePages[pageIndex];
        if (!page)
            return [];
        const override = this.overrideMap.get(pageIndex);
        if (override && override.imageIndices.length > 0) {
            return override.imageIndices;
        }
        return page.imageIndices;
    }
    /**
     * 交换同页两个 slot 的图片
     */
    swapImages(pageIndex: number, slotA: number, slotB: number, basePages: PageLayout[]): void {
        const current = [...this.getImageIndices(pageIndex, basePages)];
        if (slotA >= current.length || slotB >= current.length)
            return;
        const temp = current[slotA];
        current[slotA] = current[slotB];
        current[slotB] = temp;
        this.ensurePage(pageIndex).imageIndices = current;
    }
    /**
     * 设置图片的拖动偏移
     */
    setImageOffset(pageIndex: number, imageIndex: number, offsetX: number, offsetY: number): void {
        const page = this.ensurePage(pageIndex);
        page.offsets.set(imageIndex, new ImageOffset(offsetX, offsetY));
    }
    /**
     * 获取图片的拖动偏移
     */
    getImageOffset(pageIndex: number, imageIndex: number): ImageOffset | undefined {
        const page = this.overrideMap.get(pageIndex);
        if (!page)
            return undefined;
        return page.offsets.get(imageIndex);
    }
    /**
     * 保存调整后的 slot 列表
     */
    setPageSlots(pageIndex: number, slots: ImageSlot[]): void {
        this.ensurePage(pageIndex).slots = [...slots];
    }
    /**
     * 获取某页的 slot 列表（优先用覆盖值）
     */
    getSlots(pageIndex: number, basePages: PageLayout[]): ImageSlot[] {
        const page = basePages[pageIndex];
        if (!page)
            return [];
        const override = this.overrideMap.get(pageIndex);
        if (override && override.slots.length > 0) {
            return override.slots;
        }
        return page.slots;
    }
    /**
     * 获取合并覆盖后的完整 PageLayout
     */
    getMergedPage(pageIndex: number, basePages: PageLayout[]): PageLayout | undefined {
        const page = basePages[pageIndex];
        if (!page)
            return undefined;
        const pageOverrides = this.overrideMap.get(pageIndex);
        if (!pageOverrides)
            return page;
        return new PageLayout(pageOverrides.slots.length > 0 ? pageOverrides.slots : page.slots, pageOverrides.imageIndices.length > 0 ? pageOverrides.imageIndices : page.imageIndices, page.uniformScale);
    }
    /**
     * 获取所有合并后的页面
     */
    getMergedPages(basePages: PageLayout[]): PageLayout[] {
        return basePages.map((_: PageLayout, idx: number) => this.getMergedPage(idx, basePages)!);
    }
    /**
     * 重置单页覆盖
     */
    resetPageOverrides(pageIndex: number): void {
        this.overrideMap.delete(pageIndex);
    }
    /**
     * 重置所有覆盖
     */
    resetAllOverrides(): void {
        this.overrideMap.clear();
    }
}
