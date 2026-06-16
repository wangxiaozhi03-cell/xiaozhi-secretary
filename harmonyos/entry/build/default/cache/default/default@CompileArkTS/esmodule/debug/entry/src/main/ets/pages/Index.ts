if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    imageManager?: ImageManager;
    layoutEngine?: LayoutEngine;
    overrideManager?: OverrideManager;
    currentPage?: number;
    paperSize?: string;
    orientation?: string;
    gapMode?: string;
    gapMm?: number;
    imagesPerPage?: number;
    imageCount?: number;
    pageCount?: number;
    layouts?: LayoutDefinition[];
    activeLayoutIndex?: number;
}
import { PageSettings } from "@bundle:com.example.imagetool/entry/ets/model/Types";
import type { ImageItem, PageLayout, LayoutDefinition } from "@bundle:com.example.imagetool/entry/ets/model/Types";
import { ImageManager } from "@bundle:com.example.imagetool/entry/ets/viewmodel/ImageManager";
import { LayoutEngine } from "@bundle:com.example.imagetool/entry/ets/viewmodel/LayoutEngine";
import { OverrideManager } from "@bundle:com.example.imagetool/entry/ets/viewmodel/OverrideManager";
import { ImageListPanel } from "@bundle:com.example.imagetool/entry/ets/components/ImageListPanel";
import { DocumentPreviewPanel } from "@bundle:com.example.imagetool/entry/ets/components/DocumentPreviewPanel";
import { PageThumbnailsBar } from "@bundle:com.example.imagetool/entry/ets/components/PageThumbnailsBar";
import { PageSettingsPanel } from "@bundle:com.example.imagetool/entry/ets/components/PageSettingsPanel";
import { LayoutPickerPanel } from "@bundle:com.example.imagetool/entry/ets/components/LayoutPickerPanel";
import { ExportPanel } from "@bundle:com.example.imagetool/entry/ets/components/ExportPanel";
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.imageManager = new ImageManager();
        this.layoutEngine = new LayoutEngine();
        this.overrideManager = new OverrideManager();
        this.__currentPage = new ObservedPropertySimplePU(0, this, "currentPage");
        this.__paperSize = new ObservedPropertySimplePU('A4', this, "paperSize");
        this.__orientation = new ObservedPropertySimplePU('landscape', this, "orientation");
        this.__gapMode = new ObservedPropertySimplePU('gapped', this, "gapMode");
        this.__gapMm = new ObservedPropertySimplePU(8, this, "gapMm");
        this.__imagesPerPage = new ObservedPropertySimplePU(-1, this, "imagesPerPage");
        this.__imageCount = new ObservedPropertySimplePU(0, this, "imageCount");
        this.__pageCount = new ObservedPropertySimplePU(0, this, "pageCount");
        this.__layouts = new ObservedPropertyObjectPU([], this, "layouts");
        this.__activeLayoutIndex = new ObservedPropertySimplePU(0, this, "activeLayoutIndex");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.imageManager !== undefined) {
            this.imageManager = params.imageManager;
        }
        if (params.layoutEngine !== undefined) {
            this.layoutEngine = params.layoutEngine;
        }
        if (params.overrideManager !== undefined) {
            this.overrideManager = params.overrideManager;
        }
        if (params.currentPage !== undefined) {
            this.currentPage = params.currentPage;
        }
        if (params.paperSize !== undefined) {
            this.paperSize = params.paperSize;
        }
        if (params.orientation !== undefined) {
            this.orientation = params.orientation;
        }
        if (params.gapMode !== undefined) {
            this.gapMode = params.gapMode;
        }
        if (params.gapMm !== undefined) {
            this.gapMm = params.gapMm;
        }
        if (params.imagesPerPage !== undefined) {
            this.imagesPerPage = params.imagesPerPage;
        }
        if (params.imageCount !== undefined) {
            this.imageCount = params.imageCount;
        }
        if (params.pageCount !== undefined) {
            this.pageCount = params.pageCount;
        }
        if (params.layouts !== undefined) {
            this.layouts = params.layouts;
        }
        if (params.activeLayoutIndex !== undefined) {
            this.activeLayoutIndex = params.activeLayoutIndex;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__paperSize.purgeDependencyOnElmtId(rmElmtId);
        this.__orientation.purgeDependencyOnElmtId(rmElmtId);
        this.__gapMode.purgeDependencyOnElmtId(rmElmtId);
        this.__gapMm.purgeDependencyOnElmtId(rmElmtId);
        this.__imagesPerPage.purgeDependencyOnElmtId(rmElmtId);
        this.__imageCount.purgeDependencyOnElmtId(rmElmtId);
        this.__pageCount.purgeDependencyOnElmtId(rmElmtId);
        this.__layouts.purgeDependencyOnElmtId(rmElmtId);
        this.__activeLayoutIndex.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentPage.aboutToBeDeleted();
        this.__paperSize.aboutToBeDeleted();
        this.__orientation.aboutToBeDeleted();
        this.__gapMode.aboutToBeDeleted();
        this.__gapMm.aboutToBeDeleted();
        this.__imagesPerPage.aboutToBeDeleted();
        this.__imageCount.aboutToBeDeleted();
        this.__pageCount.aboutToBeDeleted();
        this.__layouts.aboutToBeDeleted();
        this.__activeLayoutIndex.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // 状态管理
    private imageManager: ImageManager;
    private layoutEngine: LayoutEngine;
    private overrideManager: OverrideManager;
    private __currentPage: ObservedPropertySimplePU<number>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(newValue: number) {
        this.__currentPage.set(newValue);
    }
    private __paperSize: ObservedPropertySimplePU<string>;
    get paperSize() {
        return this.__paperSize.get();
    }
    set paperSize(newValue: string) {
        this.__paperSize.set(newValue);
    }
    private __orientation: ObservedPropertySimplePU<string>;
    get orientation() {
        return this.__orientation.get();
    }
    set orientation(newValue: string) {
        this.__orientation.set(newValue);
    }
    private __gapMode: ObservedPropertySimplePU<string>;
    get gapMode() {
        return this.__gapMode.get();
    }
    set gapMode(newValue: string) {
        this.__gapMode.set(newValue);
    }
    private __gapMm: ObservedPropertySimplePU<number>;
    get gapMm() {
        return this.__gapMm.get();
    }
    set gapMm(newValue: number) {
        this.__gapMm.set(newValue);
    }
    private __imagesPerPage: ObservedPropertySimplePU<number>;
    get imagesPerPage() {
        return this.__imagesPerPage.get();
    }
    set imagesPerPage(newValue: number) {
        this.__imagesPerPage.set(newValue);
    }
    private __imageCount: ObservedPropertySimplePU<number>;
    get imageCount() {
        return this.__imageCount.get();
    }
    set imageCount(newValue: number) {
        this.__imageCount.set(newValue);
    }
    private __pageCount: ObservedPropertySimplePU<number>;
    get pageCount() {
        return this.__pageCount.get();
    }
    set pageCount(newValue: number) {
        this.__pageCount.set(newValue);
    }
    private __layouts: ObservedPropertyObjectPU<LayoutDefinition[]>;
    get layouts() {
        return this.__layouts.get();
    }
    set layouts(newValue: LayoutDefinition[]) {
        this.__layouts.set(newValue);
    }
    private __activeLayoutIndex: ObservedPropertySimplePU<number>;
    get activeLayoutIndex() {
        return this.__activeLayoutIndex.get();
    }
    set activeLayoutIndex(newValue: number) {
        this.__activeLayoutIndex.set(newValue);
    }
    private getSettings(): PageSettings {
        const s: PageSettings = new PageSettings();
        s.paperSize = this.paperSize;
        s.orientation = this.orientation;
        s.gapMode = this.gapMode;
        s.gapMm = this.gapMm;
        s.imagesPerPage = this.imagesPerPage;
        return s;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F9FAFB');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题栏
            Row.create();
            // 标题栏
            Row.width('100%');
            // 标题栏
            Row.height(48);
            // 标题栏
            Row.padding({ left: 16, right: 16 });
            // 标题栏
            Row.backgroundColor(Color.White);
            // 标题栏
            Row.border({ width: { bottom: 1 }, color: '#F3F4F6', style: BorderStyle.Solid });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('图片工具');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#1F2937');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文档生成器');
            Text.fontSize(12);
            Text.fontColor('#9CA3AF');
            Text.padding({ left: 8 });
        }, Text);
        Text.pop();
        // 标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 主内容区
            Row.create();
            // 主内容区
            Row.layoutWeight(1);
            // 主内容区
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 左侧面板 - 图片列表
            Column.create();
            // 左侧面板 - 图片列表
            Column.width(240);
            // 左侧面板 - 图片列表
            Column.height('100%');
            // 左侧面板 - 图片列表
            Column.backgroundColor(Color.White);
            // 左侧面板 - 图片列表
            Column.border({ width: { right: 1 }, color: '#F3F4F6', style: BorderStyle.Solid });
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new ImageListPanel(this, {
                        images: this.imageManager.images,
                        onAdd: () => {
                            this.imageManager.addImagesFromPicker(this.getUIContext().getHostContext()!);
                        },
                        onRemove: (id: string) => {
                            this.imageManager.removeImage(id);
                            this.refreshState();
                        },
                        onRemoveLast: () => {
                            this.imageManager.removeLastImage();
                            this.refreshState();
                        },
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 79, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            images: this.imageManager.images,
                            onAdd: () => {
                                this.imageManager.addImagesFromPicker(this.getUIContext().getHostContext()!);
                            },
                            onRemove: (id: string) => {
                                this.imageManager.removeImage(id);
                                this.refreshState();
                            },
                            onRemoveLast: () => {
                                this.imageManager.removeLastImage();
                                this.refreshState();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        images: this.imageManager.images
                    });
                }
            }, { name: "ImageListPanel" });
        }
        // 左侧面板 - 图片列表
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 中间 - 预览区 + 缩略图条
            Column.create();
            // 中间 - 预览区 + 缩略图条
            Column.layoutWeight(1);
            // 中间 - 预览区 + 缩略图条
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.layoutWeight(1);
            __Common__.width('100%');
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // 预览区
                    DocumentPreviewPanel(this, {
                        images: this.imageManager.images,
                        pages: this.getMergedPages(),
                        settingsPaperSize: this.paperSize,
                        settingsOrientation: this.orientation,
                        settingsGapMode: this.gapMode,
                        settingsGapMm: this.gapMm,
                        currentPage: this.currentPage,
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 102, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            images: this.imageManager.images,
                            pages: this.getMergedPages(),
                            settingsPaperSize: this.paperSize,
                            settingsOrientation: this.orientation,
                            settingsGapMode: this.gapMode,
                            settingsGapMm: this.gapMm,
                            currentPage: this.currentPage
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        images: this.imageManager.images,
                        pages: this.getMergedPages(),
                        settingsPaperSize: this.paperSize,
                        settingsOrientation: this.orientation,
                        settingsGapMode: this.gapMode,
                        settingsGapMm: this.gapMm,
                        currentPage: this.currentPage
                    });
                }
            }, { name: "DocumentPreviewPanel" });
        }
        __Common__.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 页面导航
            if (this.pageCount > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.height(48);
                        Row.justifyContent(FlexAlign.Center);
                        Row.border({ width: { top: 1 }, color: '#F3F4F6', style: BorderStyle.Solid });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('<');
                        Button.width(32);
                        Button.height(32);
                        Button.backgroundColor(Color.Transparent);
                        Button.fontColor(this.currentPage > 0 ? '#333' : '#ccc');
                        Button.enabled(this.currentPage > 0);
                        Button.onClick(() => {
                            if (this.currentPage > 0)
                                this.currentPage--;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.currentPage + 1} / ${this.pageCount}`);
                        Text.fontSize(12);
                        Text.fontColor('#666');
                        Text.margin({ left: 8, right: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('>');
                        Button.width(32);
                        Button.height(32);
                        Button.backgroundColor(Color.Transparent);
                        Button.fontColor(this.currentPage < this.pageCount - 1 ? '#333' : '#ccc');
                        Button.enabled(this.currentPage < this.pageCount - 1);
                        Button.onClick(() => {
                            if (this.currentPage < this.pageCount - 1)
                                this.currentPage++;
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                });
            }
            // 缩略图条
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // 缩略图条
                    PageThumbnailsBar(this, {
                        images: this.imageManager.images,
                        pages: this.getMergedPages(),
                        settingsPaperSize: this.paperSize,
                        settingsOrientation: this.orientation,
                        settingsGapMode: this.gapMode,
                        currentPage: this.currentPage,
                        onGoToPage: (idx: number) => {
                            this.currentPage = idx;
                        },
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 148, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            images: this.imageManager.images,
                            pages: this.getMergedPages(),
                            settingsPaperSize: this.paperSize,
                            settingsOrientation: this.orientation,
                            settingsGapMode: this.gapMode,
                            currentPage: this.currentPage,
                            onGoToPage: (idx: number) => {
                                this.currentPage = idx;
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        images: this.imageManager.images,
                        pages: this.getMergedPages(),
                        settingsPaperSize: this.paperSize,
                        settingsOrientation: this.orientation,
                        settingsGapMode: this.gapMode,
                        currentPage: this.currentPage
                    });
                }
            }, { name: "PageThumbnailsBar" });
        }
        // 中间 - 预览区 + 缩略图条
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 右侧面板 - 设置
            Column.create();
            // 右侧面板 - 设置
            Column.width(260);
            // 右侧面板 - 设置
            Column.height('100%');
            // 右侧面板 - 设置
            Column.backgroundColor(Color.White);
            // 右侧面板 - 设置
            Column.border({ width: { left: 1 }, color: '#F3F4F6', style: BorderStyle.Solid });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 页面设置
            Scroll.create();
            // 页面设置
            Scroll.layoutWeight(1);
            // 页面设置
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new PageSettingsPanel(this, {
                        paperSize: this.paperSize,
                        orientation: this.orientation,
                        gapMode: this.gapMode,
                        gapMm: this.gapMm,
                        imagesPerPage: this.imagesPerPage,
                        imageCount: this.imageCount,
                        onUpdate: (key: string, value: string | number) => {
                            this.updateSetting(key, value);
                        },
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 168, col: 15 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            paperSize: this.paperSize,
                            orientation: this.orientation,
                            gapMode: this.gapMode,
                            gapMm: this.gapMm,
                            imagesPerPage: this.imagesPerPage,
                            imageCount: this.imageCount,
                            onUpdate: (key: string, value: string | number) => {
                                this.updateSetting(key, value);
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        paperSize: this.paperSize,
                        orientation: this.orientation,
                        gapMode: this.gapMode,
                        gapMm: this.gapMm,
                        imagesPerPage: this.imagesPerPage,
                        imageCount: this.imageCount
                    });
                }
            }, { name: "PageSettingsPanel" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 分隔线
            Divider.create();
            // 分隔线
            Divider.color('#F3F4F6');
            // 分隔线
            Divider.margin({ top: 8, bottom: 8 });
        }, Divider);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // 布局选择
                    LayoutPickerPanel(this, {
                        layouts: this.layouts,
                        activeIndex: this.activeLayoutIndex,
                        imageCount: this.imageCount,
                        onSelect: (idx: number) => {
                            this.layoutEngine.selectLayout(idx);
                            this.activeLayoutIndex = idx;
                            this.refreshState();
                        },
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 186, col: 15 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            layouts: this.layouts,
                            activeIndex: this.activeLayoutIndex,
                            imageCount: this.imageCount,
                            onSelect: (idx: number) => {
                                this.layoutEngine.selectLayout(idx);
                                this.activeLayoutIndex = idx;
                                this.refreshState();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        layouts: this.layouts,
                        activeIndex: this.activeLayoutIndex,
                        imageCount: this.imageCount
                    });
                }
            }, { name: "LayoutPickerPanel" });
        }
        Column.pop();
        // 页面设置
        Scroll.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // 导出面板
                    ExportPanel(this, {
                        imageCount: this.imageCount,
                        pageCount: this.pageCount,
                        onExportPdf: () => {
                            console.info('PDF 导出功能待实现');
                        },
                        onExportDocx: () => {
                            console.info('Word 导出功能待实现');
                        },
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 202, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            imageCount: this.imageCount,
                            pageCount: this.pageCount,
                            onExportPdf: () => {
                                console.info('PDF 导出功能待实现');
                            },
                            onExportDocx: () => {
                                console.info('Word 导出功能待实现');
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        imageCount: this.imageCount,
                        pageCount: this.pageCount
                    });
                }
            }, { name: "ExportPanel" });
        }
        // 右侧面板 - 设置
        Column.pop();
        // 主内容区
        Row.pop();
        Column.pop();
    }
    /**
     * 更新设置
     */
    private updateSetting(key: string, value: string | number): void {
        if (key === 'paperSize') {
            this.paperSize = value as string;
        }
        else if (key === 'orientation') {
            this.orientation = value as string;
        }
        else if (key === 'gapMode') {
            this.gapMode = value as string;
        }
        else if (key === 'gapMm') {
            this.gapMm = value as number;
        }
        else if (key === 'imagesPerPage') {
            this.imagesPerPage = value as number;
        }
        this.layoutEngine.resetLayout();
        this.activeLayoutIndex = 0;
        this.refreshState();
    }
    /**
     * 刷新所有计算状态
     */
    private refreshState(): void {
        const images: ImageItem[] = this.imageManager.images;
        const settings: PageSettings = this.getSettings();
        this.imageCount = images.length;
        this.layouts = this.layoutEngine.getAvailableLayouts(images, settings);
        this.activeLayoutIndex = this.layoutEngine.activeLayoutIndex;
        const pages: PageLayout[] = this.layoutEngine.computePages(images, settings);
        this.pageCount = pages.length;
        if (this.currentPage >= this.pageCount) {
            this.currentPage = Math.max(0, this.pageCount - 1);
        }
    }
    /**
     * 获取合并覆盖后的页面
     */
    private getMergedPages(): PageLayout[] {
        const images: ImageItem[] = this.imageManager.images;
        const settings: PageSettings = this.getSettings();
        const pages: PageLayout[] = this.layoutEngine.computePages(images, settings);
        return this.overrideManager.getMergedPages(pages);
    }
    rerender() {
        this.updateDirtyElements();
    }
    public resetStateVarsOnReuse(params: Object): void {
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.imagetool", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
