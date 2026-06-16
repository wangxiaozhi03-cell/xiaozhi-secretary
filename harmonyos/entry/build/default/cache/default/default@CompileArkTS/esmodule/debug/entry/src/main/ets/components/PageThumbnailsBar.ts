if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PageThumbnailsBar_Params {
    images?: ImageItem[];
    pages?: PageLayout[];
    settingsPaperSize?: string;
    settingsOrientation?: string;
    settingsGapMode?: string;
    currentPage?: number;
    onGoToPage?: (pageIndex: number) => void;
}
import type { ImageItem, PageLayout, ImageSlot } from '../model/Types';
import { getPaperDimensions, PAGE_MARGIN_MM } from "@bundle:com.example.imagetool/entry/ets/model/Papers";
class PageThumbnailsBar extends ViewPU {
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
        this.__currentPage = new SynchedPropertySimpleOneWayPU(params.currentPage, this, "currentPage");
        this.onGoToPage = (_idx: number) => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PageThumbnailsBar_Params) {
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
        if (params.currentPage === undefined) {
            this.__currentPage.set(0);
        }
        if (params.onGoToPage !== undefined) {
            this.onGoToPage = params.onGoToPage;
        }
    }
    updateStateVars(params: PageThumbnailsBar_Params) {
        this.__images.reset(params.images);
        this.__pages.reset(params.pages);
        this.__settingsPaperSize.reset(params.settingsPaperSize);
        this.__settingsOrientation.reset(params.settingsOrientation);
        this.__settingsGapMode.reset(params.settingsGapMode);
        this.__currentPage.reset(params.currentPage);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__images.purgeDependencyOnElmtId(rmElmtId);
        this.__pages.purgeDependencyOnElmtId(rmElmtId);
        this.__settingsPaperSize.purgeDependencyOnElmtId(rmElmtId);
        this.__settingsOrientation.purgeDependencyOnElmtId(rmElmtId);
        this.__settingsGapMode.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__images.aboutToBeDeleted();
        this.__pages.aboutToBeDeleted();
        this.__settingsPaperSize.aboutToBeDeleted();
        this.__settingsOrientation.aboutToBeDeleted();
        this.__settingsGapMode.aboutToBeDeleted();
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
    private __currentPage: SynchedPropertySimpleOneWayPU<number>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(newValue: number) {
        this.__currentPage.set(newValue);
    }
    private onGoToPage: (pageIndex: number) => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pages.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('添加图片后显示页面缩略图');
                        Text.fontSize(11);
                        Text.fontColor('#999');
                        Text.width('100%');
                        Text.textAlign(TextAlign.Center);
                        Text.height(64);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 10 });
                        List.width('100%');
                        List.height(90);
                        List.listDirection(Axis.Horizontal);
                        List.padding({ left: 16, right: 16 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, pageIndex: number) => {
                            const page = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.padding(3);
                                        Column.borderRadius(10);
                                        Column.backgroundColor(pageIndex === this.currentPage ? '#EFF6FF' : 'transparent');
                                        Column.border({
                                            width: pageIndex === this.currentPage ? 1.5 : 0,
                                            color: '#93C5FD',
                                            style: BorderStyle.Solid,
                                        });
                                        Column.onClick(() => this.onGoToPage(pageIndex));
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 缩略图
                                        Stack.create();
                                        // 缩略图
                                        Stack.width(this.getThumbWidth());
                                        // 缩略图
                                        Stack.height(64);
                                        // 缩略图
                                        Stack.backgroundColor(Color.White);
                                        // 缩略图
                                        Stack.borderRadius(6);
                                        // 缩略图
                                        Stack.clip(true);
                                    }, Stack);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        ForEach.create();
                                        const forEachItemGenFunction = _item => {
                                            const info = _item;
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                If.create();
                                                if (info.hasImage) {
                                                    this.ifElseBranchUpdateFunction(0, () => {
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Image.create(info.thumbUrl);
                                                            Image.width(info.w);
                                                            Image.height(info.h);
                                                            Image.position({ x: info.x, y: info.y });
                                                            Image.objectFit(this.settingsGapMode === 'edge-to-edge'
                                                                ? ImageFit.Cover : ImageFit.Contain);
                                                        }, Image);
                                                    });
                                                }
                                                else {
                                                    this.ifElseBranchUpdateFunction(1, () => {
                                                    });
                                                }
                                            }, If);
                                            If.pop();
                                        };
                                        this.forEachUpdateFunction(elmtId, this.getSlotDisplayInfos(page), forEachItemGenFunction);
                                    }, ForEach);
                                    ForEach.pop();
                                    // 缩略图
                                    Stack.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 页码
                                        Text.create(`${pageIndex + 1}`);
                                        // 页码
                                        Text.fontSize(10);
                                        // 页码
                                        Text.fontColor(pageIndex === this.currentPage ? '#3B82F6' : '#999');
                                        // 页码
                                        Text.margin({ top: 2 });
                                    }, Text);
                                    // 页码
                                    Text.pop();
                                    Column.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.pages, forEachItemGenFunction, (_page: PageLayout, pageIndex: number) => `thumb-${pageIndex}`, true, true);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    private getThumbWidth(): number {
        const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation);
        return paper.width * (64 / paper.height);
    }
    private getSlotDisplayInfos(page: PageLayout): ThumbSlotInfo[] {
        const paper = getPaperDimensions(this.settingsPaperSize, this.settingsOrientation);
        const scale: number = 64 / paper.height;
        const margin: number = this.settingsGapMode === 'edge-to-edge' ? 0 : PAGE_MARGIN_MM;
        const result: ThumbSlotInfo[] = [];
        for (let i = 0; i < page.slots.length; i++) {
            const imgIdx: number = page.imageIndices[i];
            const slot: ImageSlot = page.slots[i];
            const info: ThumbSlotInfo = new ThumbSlotInfo();
            if (imgIdx !== undefined && imgIdx < this.images.length) {
                info.hasImage = true;
                info.thumbUrl = this.images[imgIdx].thumbUrl;
            }
            info.x = (margin + slot.x) * scale;
            info.y = (margin + slot.y) * scale;
            info.w = slot.width * scale;
            info.h = slot.height * scale;
            result.push(info);
        }
        return result;
    }
    rerender() {
        this.updateDirtyElements();
    }
    public resetStateVarsOnReuse(params: Object): void {
    }
}
class ThumbSlotInfo {
    hasImage: boolean = false;
    thumbUrl: string = '';
    x: number = 0;
    y: number = 0;
    w: number = 0;
    h: number = 0;
}
export { PageThumbnailsBar };
