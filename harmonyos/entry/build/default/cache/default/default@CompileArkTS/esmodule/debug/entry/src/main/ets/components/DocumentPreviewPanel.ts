if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DocumentPreviewPanel_Params {
    images?: ImageItem[];
    pages?: PageLayout[];
    settingsPaperSize?: string;
    settingsOrientation?: string;
    settingsGapMode?: string;
    settingsGapMm?: number;
    currentPage?: number;
}
import type { ImageItem, PageLayout, ImageSlot } from '../model/Types';
import { getPaperDimensions, PAGE_MARGIN_MM } from "@bundle:com.example.imagetool/entry/ets/model/Papers";
class DocumentPreviewPanel extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__images = new SynchedPropertyObjectOneWayPU(params.images, this, "images");
        this.__pages = new SynchedPropertyObjectOneWayPU(params.pages, this, "pages");
        this.__settingsPaperSize = new SynchedPropertySimpleOneWayPU(params.settingsPaperSize, this, "settingsPaperSize");
        this.__settingsOrientation = new SynchedPropertySimpleOneWayPU(params.settingsOrientation, this, "settingsOrientation");
        this.__settingsGapMode = new SynchedPropertySimpleOneWayPU(params.settingsGapMode, this, "settingsGapMode");
        this.__settingsGapMm = new SynchedPropertySimpleOneWayPU(params.settingsGapMm, this, "settingsGapMm");
        this.__currentPage = new SynchedPropertySimpleOneWayPU(params.currentPage, this, "currentPage");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DocumentPreviewPanel_Params) {
        if (params.images === undefined) {
            this.__images.set([]);
        }
        if (params.pages === undefined) {
            this.__pages.set([]);
        }
        if (params.settingsPaperSize === undefined) {
            this.__settingsPaperSize.set('A4');
        }
        if (params.settingsOrientation === undefined) {
            this.__settingsOrientation.set('landscape');
        }
        if (params.settingsGapMode === undefined) {
            this.__settingsGapMode.set('gapped');
        }
        if (params.settingsGapMm === undefined) {
            this.__settingsGapMm.set(8);
        }
        if (params.currentPage === undefined) {
            this.__currentPage.set(0);
        }
    }
    updateStateVars(params: DocumentPreviewPanel_Params) {
        this.__images.reset(params.images);
        this.__pages.reset(params.pages);
        this.__settingsPaperSize.reset(params.settingsPaperSize);
        this.__settingsOrientation.reset(params.settingsOrientation);
        this.__settingsGapMode.reset(params.settingsGapMode);
        this.__settingsGapMm.reset(params.settingsGapMm);
        this.__currentPage.reset(params.currentPage);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__images.purgeDependencyOnElmtId(rmElmtId);
        this.__pages.purgeDependencyOnElmtId(rmElmtId);
        this.__settingsPaperSize.purgeDependencyOnElmtId(rmElmtId);
        this.__settingsOrientation.purgeDependencyOnElmtId(rmElmtId);
        this.__settingsGapMode.purgeDependencyOnElmtId(rmElmtId);
        this.__settingsGapMm.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__images.aboutToBeDeleted();
        this.__pages.aboutToBeDeleted();
        this.__settingsPaperSize.aboutToBeDeleted();
        this.__settingsOrientation.aboutToBeDeleted();
        this.__settingsGapMode.aboutToBeDeleted();
        this.__settingsGapMm.aboutToBeDeleted();
        this.__currentPage.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __images: SynchedPropertySimpleOneWayPU<ImageItem[]>;
    get images() {
        return this.__images.get();
    }
    set images(newValue: ImageItem[]) {
        this.__images.set(newValue);
    }
    private __pages: SynchedPropertySimpleOneWayPU<PageLayout[]>;
    get pages() {
        return this.__pages.get();
    }
    set pages(newValue: PageLayout[]) {
        this.__pages.set(newValue);
    }
    private __settingsPaperSize: SynchedPropertySimpleOneWayPU<string>;
    get settingsPaperSize() {
        return this.__settingsPaperSize.get();
    }
    set settingsPaperSize(newValue: string) {
        this.__settingsPaperSize.set(newValue);
    }
    private __settingsOrientation: SynchedPropertySimpleOneWayPU<string>;
    get settingsOrientation() {
        return this.__settingsOrientation.get();
    }
    set settingsOrientation(newValue: string) {
        this.__settingsOrientation.set(newValue);
    }
    private __settingsGapMode: SynchedPropertySimpleOneWayPU<string>;
    get settingsGapMode() {
        return this.__settingsGapMode.get();
    }
    set settingsGapMode(newValue: string) {
        this.__settingsGapMode.set(newValue);
    }
    private __settingsGapMm: SynchedPropertySimpleOneWayPU<number>;
    get settingsGapMm() {
        return this.__settingsGapMm.get();
    }
    set settingsGapMm(newValue: number) {
        this.__settingsGapMm.set(newValue);
    }
    private __currentPage: SynchedPropertySimpleOneWayPU<number>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(newValue: number) {
        this.__currentPage.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.padding(32);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.images.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 空状态
                        Column.create();
                        // 空状态
                        Column.width('100%');
                        // 空状态
                        Column.height('100%');
                        // 空状态
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🖼️');
                        Text.fontSize(48);
                        Text.margin({ bottom: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('添加图片后预览文档效果');
                        Text.fontSize(13);
                        Text.fontColor('#999');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('支持 PNG、JPG、WEBP、BMP');
                        Text.fontSize(11);
                        Text.fontColor('#ccc');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                    // 空状态
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 预览区 - 使用 Stack 布局
                        Stack.create();
                        // 预览区 - 使用 Stack 布局
                        Stack.width('100%');
                        // 预览区 - 使用 Stack 布局
                        Stack.height('100%');
                        // 预览区 - 使用 Stack 布局
                        Stack.alignContent(Alignment.Center);
                    }, Stack);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 白色纸张背景
                        Column.create();
                        // 白色纸张背景
                        Column.width(this.getPaperWidth());
                        // 白色纸张背景
                        Column.height(this.getPaperHeight());
                        // 白色纸张背景
                        Column.backgroundColor(Color.White);
                        // 白色纸张背景
                        Column.borderRadius(12);
                        // 白色纸张背景
                        Column.shadow({
                            radius: 16,
                            color: '#1a000000',
                            offsetX: 0,
                            offsetY: 4,
                        });
                    }, Column);
                    // 图片布局预览
                    this.PageContent.bind(this)();
                    // 白色纸张背景
                    Column.pop();
                    // 预览区 - 使用 Stack 布局
                    Stack.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    PageContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 使用 ForEach 渲染每个 slot 中的图片
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const item = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Image.create(item.thumbUrl);
                    Image.width(item.imgW);
                    Image.height(item.imgH);
                    Image.position({ x: item.imgX, y: item.imgY });
                    Image.objectFit(item.isEdge ? ImageFit.Cover : ImageFit.Contain);
                    Image.clip(true);
                }, Image);
            };
            this.forEachUpdateFunction(elmtId, this.getCurrentSlots(), forEachItemGenFunction, undefined, true, false);
        }, ForEach);
        // 使用 ForEach 渲染每个 slot 中的图片
        ForEach.pop();
    }
    private getCurrentSlots(): SlotDisplayInfo[] {
        const pageData: PageLayout | undefined = this.pages[this.currentPage];
        if (!pageData)
            return [];
        const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation);
        const isEdge: boolean = this.settingsGapMode === 'edge-to-edge';
        const margin: number = isEdge ? 0 : PAGE_MARGIN_MM;
        const scale: number = 1.5;
        const result: SlotDisplayInfo[] = [];
        for (let i = 0; i < pageData.slots.length; i++) {
            const imgIdx: number = pageData.imageIndices[i];
            if (imgIdx === undefined || imgIdx >= this.images.length)
                continue;
            const slot: ImageSlot = pageData.slots[i];
            const imgInfo: ImageItem = this.images[imgIdx];
            const slotX: number = (margin + slot.x) * scale;
            const slotY: number = (margin + slot.y) * scale;
            const slotW: number = slot.width * scale;
            const slotH: number = slot.height * scale;
            const rW: number = slotW / imgInfo.width;
            const rH: number = slotH / imgInfo.height;
            const fitScale: number = isEdge ? Math.max(rW, rH) : Math.min(rW, rH);
            const drawW: number = imgInfo.width * fitScale;
            const drawH: number = imgInfo.height * fitScale;
            const drawX: number = slotX + (slotW - drawW) / 2;
            const drawY: number = slotY + (slotH - drawH) / 2;
            const info: SlotDisplayInfo = new SlotDisplayInfo();
            info.thumbUrl = imgInfo.thumbUrl;
            info.imgX = drawX;
            info.imgY = drawY;
            info.imgW = drawW;
            info.imgH = drawH;
            info.isEdge = isEdge;
            result.push(info);
        }
        return result;
    }
    private getPaperWidth(): string {
        const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation);
        return `${paper.width * 1.5}px`;
    }
    private getPaperHeight(): string {
        const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation);
        return `${paper.height * 1.5}px`;
    }
    rerender() {
        this.updateDirtyElements();
    }
    public resetStateVarsOnReuse(params: Object): void {
    }
}
class SlotDisplayInfo {
    thumbUrl: string = '';
    imgX: number = 0;
    imgY: number = 0;
    imgW: number = 0;
    imgH: number = 0;
    isEdge: boolean = false;
}
export { DocumentPreviewPanel };
