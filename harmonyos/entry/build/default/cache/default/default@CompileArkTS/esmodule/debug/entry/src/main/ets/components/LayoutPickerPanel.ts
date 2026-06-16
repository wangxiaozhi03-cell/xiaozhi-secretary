if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface LayoutPickerPanel_Params {
    layouts?: LayoutDefinition[];
    activeIndex?: number;
    imageCount?: number;
    onSelect?: (index: number) => void;
}
import type { LayoutDefinition } from '../model/Types';
class LayoutPickerPanel extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__layouts = new SynchedPropertyObjectOneWayPU(params.layouts, this, "layouts");
        this.__activeIndex = new SynchedPropertySimpleOneWayPU(params.activeIndex, this, "activeIndex");
        this.__imageCount = new SynchedPropertySimpleOneWayPU(params.imageCount, this, "imageCount");
        this.onSelect = (_idx: number) => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: LayoutPickerPanel_Params) {
        if (params.layouts === undefined) {
            this.__layouts.set([]);
        }
        if (params.activeIndex === undefined) {
            this.__activeIndex.set(0);
        }
        if (params.imageCount === undefined) {
            this.__imageCount.set(0);
        }
        if (params.onSelect !== undefined) {
            this.onSelect = params.onSelect;
        }
    }
    updateStateVars(params: LayoutPickerPanel_Params) {
        this.__layouts.reset(params.layouts);
        this.__activeIndex.reset(params.activeIndex);
        this.__imageCount.reset(params.imageCount);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__layouts.purgeDependencyOnElmtId(rmElmtId);
        this.__activeIndex.purgeDependencyOnElmtId(rmElmtId);
        this.__imageCount.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__layouts.aboutToBeDeleted();
        this.__activeIndex.aboutToBeDeleted();
        this.__imageCount.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __layouts: SynchedPropertySimpleOneWayPU<LayoutDefinition[]>;
    get layouts() {
        return this.__layouts.get();
    }
    set layouts(newValue: LayoutDefinition[]) {
        this.__layouts.set(newValue);
    }
    private __activeIndex: SynchedPropertySimpleOneWayPU<number>;
    get activeIndex() {
        return this.__activeIndex.get();
    }
    set activeIndex(newValue: number) {
        this.__activeIndex.set(newValue);
    }
    private __imageCount: SynchedPropertySimpleOneWayPU<number>;
    get imageCount() {
        return this.__imageCount.get();
    }
    set imageCount(newValue: number) {
        this.__imageCount.set(newValue);
    }
    private onSelect: (index: number) => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ top: 12, bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create('布局模式');
            // 标题
            Text.fontSize(11);
            // 标题
            Text.fontWeight(FontWeight.Medium);
            // 标题
            Text.fontColor('#999');
            // 标题
            Text.letterSpacing(2);
            // 标题
            Text.margin({ bottom: 4 });
            // 标题
            Text.alignSelf(ItemAlign.Start);
            // 标题
            Text.padding({ left: 16 });
        }, Text);
        // 标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.imageCount} 张图片 · ${this.layouts.length} 种布局`);
            Text.fontSize(11);
            Text.fontColor('#999');
            Text.margin({ bottom: 12 });
            Text.alignSelf(ItemAlign.Start);
            Text.padding({ left: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.layouts.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('请先添加图片');
                        Text.fontSize(12);
                        Text.fontColor('#999');
                        Text.width('100%');
                        Text.textAlign(TextAlign.Center);
                        Text.padding({ top: 32 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Grid.create();
                        Grid.columnsTemplate('1fr 1fr 1fr');
                        Grid.rowsGap(8);
                        Grid.columnsGap(8);
                        Grid.width('100%');
                        Grid.layoutWeight(1);
                        Grid.padding({ left: 16, right: 16 });
                    }, Grid);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index: number) => {
                            const layout = _item;
                            {
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    GridItem.create(() => { }, false);
                                };
                                const observedDeepRender = () => {
                                    this.observeComponentCreation2(itemCreation2, GridItem);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.padding(8);
                                        Column.borderRadius(10);
                                        Column.width('100%');
                                        Column.backgroundColor(index === this.activeIndex ? '#EFF6FF' : 'transparent');
                                        Column.border({
                                            width: index === this.activeIndex ? 1.5 : 0,
                                            color: '#93C5FD',
                                            style: BorderStyle.Solid,
                                        });
                                        Column.onClick(() => this.onSelect(index));
                                    }, Column);
                                    // 布局缩略图
                                    this.getLayoutThumbnail.bind(this)(layout.id);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(layout.name);
                                        Text.fontSize(10);
                                        Text.fontColor('#666');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    GridItem.pop();
                                };
                                observedDeepRender();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.layouts, forEachItemGenFunction, (layout: LayoutDefinition) => layout.id, true, false);
                    }, ForEach);
                    ForEach.pop();
                    Grid.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    getLayoutThumbnail(layoutId: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (layoutId === 'center-fit') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height(32);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('50%');
                        Row.height('60%');
                        Row.backgroundColor('#93C5FD');
                        Row.borderRadius(2);
                    }, Row);
                    Row.pop();
                    Column.pop();
                });
            }
            else if (layoutId === 'fill-page') {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.height(32);
                        Row.backgroundColor('#93C5FD');
                        Row.borderRadius(2);
                    }, Row);
                    Row.pop();
                });
            }
            else if (layoutId === 'top-bottom' || layoutId === 'three-vertical') {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 2 });
                        Column.width('100%');
                        Column.height(32);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.layoutWeight(1);
                        Row.width('100%');
                        Row.backgroundColor('#93C5FD');
                        Row.borderRadius(2);
                    }, Row);
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.layoutWeight(1);
                        Row.width('100%');
                        Row.backgroundColor('#60A5FA');
                        Row.borderRadius(2);
                    }, Row);
                    Row.pop();
                    Column.pop();
                });
            }
            else if (layoutId === 'left-right' || layoutId === 'three-horizontal') {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 2 });
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.height(32);
                        Column.backgroundColor('#93C5FD');
                        Column.borderRadius(2);
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.height(32);
                        Column.backgroundColor('#60A5FA');
                        Column.borderRadius(2);
                    }, Column);
                    Column.pop();
                    Row.pop();
                });
            }
            else if (layoutId === 'grid-2x2' || layoutId === 'grid-3x3') {
                this.ifElseBranchUpdateFunction(4, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 2 });
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 2 });
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.height(14);
                        Column.backgroundColor('#93C5FD');
                        Column.borderRadius(2);
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.height(14);
                        Column.backgroundColor('#60A5FA');
                        Column.borderRadius(2);
                    }, Column);
                    Column.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 2 });
                        Row.width('100%');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.height(14);
                        Column.backgroundColor('#60A5FA');
                        Column.borderRadius(2);
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.height(14);
                        Column.backgroundColor('#93C5FD');
                        Column.borderRadius(2);
                    }, Column);
                    Column.pop();
                    Row.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(5, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.height(32);
                        Row.backgroundColor('#E5E7EB');
                        Row.borderRadius(2);
                    }, Row);
                    Row.pop();
                });
            }
        }, If);
        If.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    public resetStateVarsOnReuse(params: Object): void {
    }
}
export { LayoutPickerPanel };
