if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ExportPanel_Params {
    imageCount?: number;
    pageCount?: number;
    onExportPdf?: () => void;
    onExportDocx?: () => void;
}
class ExportPanel extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__imageCount = new SynchedPropertySimpleOneWayPU(params.imageCount, this, "imageCount");
        this.__pageCount = new SynchedPropertySimpleOneWayPU(params.pageCount, this, "pageCount");
        this.onExportPdf = () => { };
        this.onExportDocx = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ExportPanel_Params) {
        if (params.imageCount === undefined) {
            this.__imageCount.set(0);
        }
        if (params.pageCount === undefined) {
            this.__pageCount.set(0);
        }
        if (params.onExportPdf !== undefined) {
            this.onExportPdf = params.onExportPdf;
        }
        if (params.onExportDocx !== undefined) {
            this.onExportDocx = params.onExportDocx;
        }
    }
    updateStateVars(params: ExportPanel_Params) {
        this.__imageCount.reset(params.imageCount);
        this.__pageCount.reset(params.pageCount);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__imageCount.purgeDependencyOnElmtId(rmElmtId);
        this.__pageCount.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__imageCount.aboutToBeDeleted();
        this.__pageCount.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __imageCount: SynchedPropertySimpleOneWayPU<number>;
    get imageCount() {
        return this.__imageCount.get();
    }
    set imageCount(newValue: number) {
        this.__imageCount.set(newValue);
    }
    private __pageCount: SynchedPropertySimpleOneWayPU<number>;
    get pageCount() {
        return this.__pageCount.get();
    }
    set pageCount(newValue: number) {
        this.__pageCount.set(newValue);
    }
    private onExportPdf: () => void;
    private onExportDocx: () => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.border({ width: { top: 1 }, color: '#F3F4F6', style: BorderStyle.Solid });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // PDF 按钮
            Button.createWithChild();
            // PDF 按钮
            Button.layoutWeight(1);
            // PDF 按钮
            Button.height(40);
            // PDF 按钮
            Button.backgroundColor(this.imageCount === 0 ? '#94A3B8' : '#3B82F6');
            // PDF 按钮
            Button.borderRadius(10);
            // PDF 按钮
            Button.enabled(this.imageCount > 0);
            // PDF 按钮
            Button.onClick(() => this.onExportPdf());
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            SymbolGlyph.create({ "id": 125831909, "type": 40000, params: [], "bundleName": "com.example.imagetool", "moduleName": "entry" });
            SymbolGlyph.fontSize(14);
            SymbolGlyph.fontColor([Color.White]);
        }, SymbolGlyph);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('PDF');
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Row.pop();
        // PDF 按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Word 按钮
            Button.createWithChild();
            // Word 按钮
            Button.layoutWeight(1);
            // Word 按钮
            Button.height(40);
            // Word 按钮
            Button.backgroundColor(this.imageCount === 0 ? '#94A3B8' : '#10B981');
            // Word 按钮
            Button.borderRadius(10);
            // Word 按钮
            Button.enabled(this.imageCount > 0);
            // Word 按钮
            Button.onClick(() => this.onExportDocx());
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            SymbolGlyph.create({ "id": 125831910, "type": 40000, params: [], "bundleName": "com.example.imagetool", "moduleName": "entry" });
            SymbolGlyph.fontSize(14);
            SymbolGlyph.fontColor([Color.White]);
        }, SymbolGlyph);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Word');
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Row.pop();
        // Word 按钮
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.imageCount > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.imageCount} 张 → ${this.pageCount} 页`);
                        Text.fontSize(11);
                        Text.fontColor('#999');
                        Text.margin({ top: 6 });
                        Text.width('100%');
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('添加图片后可导出');
                        Text.fontSize(11);
                        Text.fontColor('#ccc');
                        Text.margin({ top: 6 });
                        Text.width('100%');
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
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
export { ExportPanel };
