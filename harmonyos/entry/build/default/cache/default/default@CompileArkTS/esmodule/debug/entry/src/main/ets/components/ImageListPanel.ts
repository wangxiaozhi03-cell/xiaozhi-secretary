if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ImageListPanel_Params {
    images?: ImageItem[];
    onAdd?: () => void;
    onRemove?: (id: string) => void;
    onRemoveLast?: () => void;
}
import type { ImageItem } from '../model/Types';
class ImageListPanel extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__images = new SynchedPropertyObjectOneWayPU(params.images, this, "images");
        this.onAdd = () => { };
        this.onRemove = (_id: string) => { };
        this.onRemoveLast = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ImageListPanel_Params) {
        if (params.images === undefined) {
            this.__images.set([]);
        }
        if (params.onAdd !== undefined) {
            this.onAdd = params.onAdd;
        }
        if (params.onRemove !== undefined) {
            this.onRemove = params.onRemove;
        }
        if (params.onRemoveLast !== undefined) {
            this.onRemoveLast = params.onRemoveLast;
        }
    }
    updateStateVars(params: ImageListPanel_Params) {
        this.__images.reset(params.images);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__images.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__images.aboutToBeDeleted();
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
    private onAdd: () => void;
    private onRemove: (id: string) => void;
    private onRemoveLast: () => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题栏
            Row.create();
            // 标题栏
            Row.width('100%');
            // 标题栏
            Row.justifyContent(FlexAlign.SpaceBetween);
            // 标题栏
            Row.padding({ left: 16, right: 16, top: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('图片');
            Text.fontSize(11);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#999');
            Text.letterSpacing(2);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.images.length} 张`);
            Text.fontSize(11);
            Text.fontColor('#666');
            Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
            Text.backgroundColor('#f0f0f0');
            Text.borderRadius(8);
        }, Text);
        Text.pop();
        // 标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 操作按钮
            Row.create({ space: 8 });
            // 操作按钮
            Row.width('100%');
            // 操作按钮
            Row.padding({ left: 16, right: 16, top: 8, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('添加');
            Button.fontSize(12);
            Button.layoutWeight(1);
            Button.height(36);
            Button.backgroundColor('#3B82F6');
            Button.fontColor(Color.White);
            Button.borderRadius(12);
            Button.onClick(() => this.onAdd());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('移除');
            Button.fontSize(12);
            Button.layoutWeight(1);
            Button.height(36);
            Button.backgroundColor(this.images.length === 0 ? '#f5f5f5' : '#FEE2E2');
            Button.fontColor(this.images.length === 0 ? '#ccc' : '#F87171');
            Button.borderRadius(12);
            Button.enabled(this.images.length > 0);
            Button.onClick(() => this.onRemoveLast());
        }, Button);
        Button.pop();
        // 操作按钮
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 图片列表
            if (this.images.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.padding({ top: 32, bottom: 32 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('📷');
                        Text.fontSize(40);
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('点击添加图片');
                        Text.fontSize(12);
                        Text.fontColor('#999');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.width('100%');
                        List.layoutWeight(1);
                        List.padding({ left: 16, right: 16, bottom: 8 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const img = _item;
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
                                        Row.create();
                                        Row.width('100%');
                                        Row.padding(8);
                                        Row.borderRadius(12);
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 缩略图
                                        Image.create(img.thumbUrl);
                                        // 缩略图
                                        Image.width(44);
                                        // 缩略图
                                        Image.height(32);
                                        // 缩略图
                                        Image.objectFit(ImageFit.Cover);
                                        // 缩略图
                                        Image.borderRadius(6);
                                        // 缩略图
                                        Image.backgroundColor('#f5f5f5');
                                    }, Image);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 信息
                                        Column.create();
                                        // 信息
                                        Column.layoutWeight(1);
                                        // 信息
                                        Column.alignItems(HorizontalAlign.Start);
                                        // 信息
                                        Column.padding({ left: 8 });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(img.name);
                                        Text.fontSize(12);
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.fontColor('#333');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`${img.width}×${img.height}`);
                                        Text.fontSize(10);
                                        Text.fontColor('#999');
                                    }, Text);
                                    Text.pop();
                                    // 信息
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // 删除按钮
                                        Button.createWithLabel('✕');
                                        // 删除按钮
                                        Button.fontSize(14);
                                        // 删除按钮
                                        Button.fontColor('#ccc');
                                        // 删除按钮
                                        Button.backgroundColor(Color.Transparent);
                                        // 删除按钮
                                        Button.width(28);
                                        // 删除按钮
                                        Button.height(28);
                                        // 删除按钮
                                        Button.onClick(() => this.onRemove(img.id));
                                    }, Button);
                                    // 删除按钮
                                    Button.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.images, forEachItemGenFunction, (img: ImageItem) => img.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    public resetStateVarsOnReuse(params: Object): void {
    }
}
export { ImageListPanel };
