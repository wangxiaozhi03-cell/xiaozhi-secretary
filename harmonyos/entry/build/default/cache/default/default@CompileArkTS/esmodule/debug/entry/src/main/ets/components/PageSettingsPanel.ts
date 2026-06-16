if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PageSettingsPanel_Params {
    paperSize?: string;
    orientation?: string;
    gapMode?: string;
    gapMm?: number;
    imagesPerPage?: number;
    imageCount?: number;
    onUpdate?: (key: string, value: string | number) => void;
    paperSizes?: string[];
    orientations?: OrientationOption[];
    gapModes?: GapModeOption[];
    allPerPageOptions?: PerPageOption[];
}
/**
 * 页面设置面板
 * 移植自 src/components/PageSettings.vue
 */
class OrientationOption {
    value: string = '';
    label: string = '';
    constructor(value: string, label: string) {
        this.value = value;
        this.label = label;
    }
}
class GapModeOption {
    value: string = '';
    label: string = '';
    constructor(value: string, label: string) {
        this.value = value;
        this.label = label;
    }
}
class PerPageOption {
    val: number = 0;
    label: string = '';
    constructor(val: number, label: string) {
        this.val = val;
        this.label = label;
    }
}
class PageSettingsPanel extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__paperSize = new SynchedPropertySimpleOneWayPU(params.paperSize, this, "paperSize");
        this.__orientation = new SynchedPropertySimpleOneWayPU(params.orientation, this, "orientation");
        this.__gapMode = new SynchedPropertySimpleOneWayPU(params.gapMode, this, "gapMode");
        this.__gapMm = new SynchedPropertySimpleOneWayPU(params.gapMm, this, "gapMm");
        this.__imagesPerPage = new SynchedPropertySimpleOneWayPU(params.imagesPerPage, this, "imagesPerPage");
        this.__imageCount = new SynchedPropertySimpleOneWayPU(params.imageCount, this, "imageCount");
        this.onUpdate = (_k: string, _v: string | number) => { };
        this.paperSizes = ['A4', 'A3', 'Letter'];
        this.orientations = [
            new OrientationOption('portrait', '纵向'),
            new OrientationOption('landscape', '横向'),
        ];
        this.gapModes = [
            new GapModeOption('gapped', '有间距'),
            new GapModeOption('edge-to-edge', '铺满'),
        ];
        this.allPerPageOptions = [
            new PerPageOption(-1, '自动'),
            new PerPageOption(1, '1张'),
            new PerPageOption(2, '2张'),
            new PerPageOption(3, '3张'),
            new PerPageOption(4, '4张'),
            new PerPageOption(6, '6张'),
            new PerPageOption(9, '9张'),
        ];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PageSettingsPanel_Params) {
        if (params.paperSize === undefined) {
            this.__paperSize.set('A4');
        }
        if (params.orientation === undefined) {
            this.__orientation.set('landscape');
        }
        if (params.gapMode === undefined) {
            this.__gapMode.set('gapped');
        }
        if (params.gapMm === undefined) {
            this.__gapMm.set(8);
        }
        if (params.imagesPerPage === undefined) {
            this.__imagesPerPage.set(-1);
        }
        if (params.imageCount === undefined) {
            this.__imageCount.set(0);
        }
        if (params.onUpdate !== undefined) {
            this.onUpdate = params.onUpdate;
        }
        if (params.paperSizes !== undefined) {
            this.paperSizes = params.paperSizes;
        }
        if (params.orientations !== undefined) {
            this.orientations = params.orientations;
        }
        if (params.gapModes !== undefined) {
            this.gapModes = params.gapModes;
        }
        if (params.allPerPageOptions !== undefined) {
            this.allPerPageOptions = params.allPerPageOptions;
        }
    }
    updateStateVars(params: PageSettingsPanel_Params) {
        this.__paperSize.reset(params.paperSize);
        this.__orientation.reset(params.orientation);
        this.__gapMode.reset(params.gapMode);
        this.__gapMm.reset(params.gapMm);
        this.__imagesPerPage.reset(params.imagesPerPage);
        this.__imageCount.reset(params.imageCount);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__paperSize.purgeDependencyOnElmtId(rmElmtId);
        this.__orientation.purgeDependencyOnElmtId(rmElmtId);
        this.__gapMode.purgeDependencyOnElmtId(rmElmtId);
        this.__gapMm.purgeDependencyOnElmtId(rmElmtId);
        this.__imagesPerPage.purgeDependencyOnElmtId(rmElmtId);
        this.__imageCount.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__paperSize.aboutToBeDeleted();
        this.__orientation.aboutToBeDeleted();
        this.__gapMode.aboutToBeDeleted();
        this.__gapMm.aboutToBeDeleted();
        this.__imagesPerPage.aboutToBeDeleted();
        this.__imageCount.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __paperSize: SynchedPropertySimpleOneWayPU<string>;
    get paperSize() {
        return this.__paperSize.get();
    }
    set paperSize(newValue: string) {
        this.__paperSize.set(newValue);
    }
    private __orientation: SynchedPropertySimpleOneWayPU<string>;
    get orientation() {
        return this.__orientation.get();
    }
    set orientation(newValue: string) {
        this.__orientation.set(newValue);
    }
    private __gapMode: SynchedPropertySimpleOneWayPU<string>;
    get gapMode() {
        return this.__gapMode.get();
    }
    set gapMode(newValue: string) {
        this.__gapMode.set(newValue);
    }
    private __gapMm: SynchedPropertySimpleOneWayPU<number>;
    get gapMm() {
        return this.__gapMm.get();
    }
    set gapMm(newValue: number) {
        this.__gapMm.set(newValue);
    }
    private __imagesPerPage: SynchedPropertySimpleOneWayPU<number>;
    get imagesPerPage() {
        return this.__imagesPerPage.get();
    }
    set imagesPerPage(newValue: number) {
        this.__imagesPerPage.set(newValue);
    }
    private __imageCount: SynchedPropertySimpleOneWayPU<number>;
    get imageCount() {
        return this.__imageCount.get();
    }
    set imageCount(newValue: number) {
        this.__imageCount.set(newValue);
    }
    private onUpdate: (key: string, value: string | number) => void;
    private paperSizes: string[];
    private orientations: OrientationOption[];
    private gapModes: GapModeOption[];
    private allPerPageOptions: PerPageOption[];
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.width('100%');
            Column.padding({ top: 12, bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 纸张
            Column.create();
            // 纸张
            Column.width('100%');
            // 纸张
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('纸张');
            Text.fontSize(11);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#999');
            Text.letterSpacing(2);
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 6 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const size = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel(size);
                    Button.fontSize(12);
                    Button.layoutWeight(1);
                    Button.height(36);
                    Button.backgroundColor(this.paperSize === size ? '#3B82F6' : '#f5f5f5');
                    Button.fontColor(this.paperSize === size ? Color.White : '#666');
                    Button.borderRadius(12);
                    Button.onClick(() => this.onUpdate('paperSize', size));
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, this.paperSizes, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        // 纸张
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 方向
            Column.create();
            // 方向
            Column.width('100%');
            // 方向
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('方向');
            Text.fontSize(11);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#999');
            Text.letterSpacing(2);
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 6 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const o = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel(o.label);
                    Button.fontSize(12);
                    Button.layoutWeight(1);
                    Button.height(36);
                    Button.backgroundColor(this.orientation === o.value ? '#3B82F6' : '#f5f5f5');
                    Button.fontColor(this.orientation === o.value ? Color.White : '#666');
                    Button.borderRadius(12);
                    Button.onClick(() => this.onUpdate('orientation', o.value));
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, this.orientations, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        // 方向
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 每页图片
            Column.create();
            // 每页图片
            Column.width('100%');
            // 每页图片
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('每页图片');
            Text.fontSize(11);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#999');
            Text.letterSpacing(2);
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const opt = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel(opt.label);
                    Button.fontSize(11);
                    Button.height(32);
                    Button.padding({ left: 12, right: 12 });
                    Button.backgroundColor(this.imagesPerPage === opt.val ? '#3B82F6' : '#f5f5f5');
                    Button.fontColor(this.imagesPerPage === opt.val ? Color.White : '#666');
                    Button.borderRadius(12);
                    Button.onClick(() => this.onUpdate('imagesPerPage', opt.val));
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, this.getPerPageOptions(), forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        // 每页图片
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 间距滑块
            if (this.gapMode === 'gapped') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding({ left: 16, right: 16 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.justifyContent(FlexAlign.SpaceBetween);
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('间距');
                        Text.fontSize(11);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#999');
                        Text.letterSpacing(2);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.gapMm} mm`);
                        Text.fontSize(11);
                        Text.fontColor('#999');
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Slider.create({
                            value: this.gapMm,
                            min: 0,
                            max: 30,
                            step: 1
                        });
                        Slider.width('100%');
                        Slider.onChange((value: number) => this.onUpdate('gapMm', value));
                    }, Slider);
                    Column.pop();
                });
            }
            // 间距模式
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 间距模式
            Column.create();
            // 间距模式
            Column.width('100%');
            // 间距模式
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('间距模式');
            Text.fontSize(11);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#999');
            Text.letterSpacing(2);
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 6 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const m = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel(m.label);
                    Button.fontSize(12);
                    Button.layoutWeight(1);
                    Button.height(36);
                    Button.backgroundColor(this.gapMode === m.value ? '#3B82F6' : '#f5f5f5');
                    Button.fontColor(this.gapMode === m.value ? Color.White : '#666');
                    Button.borderRadius(12);
                    Button.onClick(() => this.onUpdate('gapMode', m.value));
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, this.gapModes, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        // 间距模式
        Column.pop();
        Column.pop();
    }
    private getPerPageOptions(): PerPageOption[] {
        if (this.imageCount === 0) {
            return [new PerPageOption(-1, '自动')];
        }
        return this.allPerPageOptions.filter((opt: PerPageOption) => {
            if (opt.val === -1)
                return true;
            return opt.val <= this.imageCount;
        });
    }
    rerender() {
        this.updateDirtyElements();
    }
    public resetStateVarsOnReuse(params: Object): void {
    }
}
export { PageSettingsPanel };
