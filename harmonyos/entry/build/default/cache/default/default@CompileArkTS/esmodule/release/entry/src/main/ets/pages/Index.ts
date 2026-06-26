if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    vm?: ImageLayoutVM;
    currentPage?: PageKey;
    activeNav?: NavKey;
    activeToolTab?: ToolTabKey;
    showPanel?: boolean;
    isDragging?: boolean;
    currentTheme?: ThemeStyle;
    themeMode?: ThemeMode;
    blob1X?: number;
    blob1Y?: number;
    blob2X?: number;
    blob2Y?: number;
    blob3X?: number;
    blob3Y?: number;
    timer?: number;
}
import { ImageLayoutVM } from "@bundle:com.xiaozhi.imagelayout/entry/ets/viewmodel/ImageLayoutVM";
import type { ImageItemData } from '../model/ImageItem';
import { pickImages, getImageMetadata, getImageName } from "@bundle:com.xiaozhi.imagelayout/entry/ets/utils/fileUtils";
import { exportPdf, exportDocx } from "@bundle:com.xiaozhi.imagelayout/entry/ets/utils/exportUtils";
import { getPaperDimensions } from "@bundle:com.xiaozhi.imagelayout/entry/ets/model/PageSettings";
import type { LayoutDefinition, ImageSlot, PageLayout } from '../shared/types/index';
import { LengthMetrics } from "@ohos:arkui.node";
import promptAction from "@ohos:promptAction";
type PageKey = 'home' | 'tool' | 'profile';
type NavKey = 'home' | 'profile';
type ToolTabKey = 'images' | 'layout' | 'export';
type ThemeStyle = 'frost' | 'mint' | 'warm' | 'lavender' | 'sakura' | 'ocean';
type ThemeMode = 'light' | 'dark' | 'system';
interface ThemeItem {
    id: ThemeStyle;
    label: string;
    colors: string[];
}
interface ThemeModeItem {
    value: ThemeMode;
    label: string;
    icon: string;
}
class Index extends ViewPU {
    constructor(l19, m19, n19, o19 = -1, p19 = undefined, q19) {
        super(l19, n19, o19, q19);
        if (typeof p19 === "function") {
            this.paramsGenerator_ = p19;
        }
        this.__vm = new ObservedPropertyObjectPU(new ImageLayoutVM(), this, "vm");
        this.__currentPage = new ObservedPropertySimplePU('home', this, "currentPage");
        this.__activeNav = new ObservedPropertySimplePU('home', this, "activeNav");
        this.__activeToolTab = new ObservedPropertySimplePU('images', this, "activeToolTab");
        this.__showPanel = new ObservedPropertySimplePU(false, this, "showPanel");
        this.__isDragging = new ObservedPropertySimplePU(false, this, "isDragging");
        this.__currentTheme = new ObservedPropertySimplePU('frost', this, "currentTheme");
        this.__themeMode = new ObservedPropertySimplePU('system', this, "themeMode");
        this.__blob1X = new ObservedPropertySimplePU(55, this, "blob1X");
        this.__blob1Y = new ObservedPropertySimplePU(10, this, "blob1Y");
        this.__blob2X = new ObservedPropertySimplePU(15, this, "blob2X");
        this.__blob2Y = new ObservedPropertySimplePU(45, this, "blob2Y");
        this.__blob3X = new ObservedPropertySimplePU(55, this, "blob3X");
        this.__blob3Y = new ObservedPropertySimplePU(75, this, "blob3Y");
        this.timer = 0;
        this.setInitiallyProvidedValue(m19);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(k19: Index_Params) {
        if (k19.vm !== undefined) {
            this.vm = k19.vm;
        }
        if (k19.currentPage !== undefined) {
            this.currentPage = k19.currentPage;
        }
        if (k19.activeNav !== undefined) {
            this.activeNav = k19.activeNav;
        }
        if (k19.activeToolTab !== undefined) {
            this.activeToolTab = k19.activeToolTab;
        }
        if (k19.showPanel !== undefined) {
            this.showPanel = k19.showPanel;
        }
        if (k19.isDragging !== undefined) {
            this.isDragging = k19.isDragging;
        }
        if (k19.currentTheme !== undefined) {
            this.currentTheme = k19.currentTheme;
        }
        if (k19.themeMode !== undefined) {
            this.themeMode = k19.themeMode;
        }
        if (k19.blob1X !== undefined) {
            this.blob1X = k19.blob1X;
        }
        if (k19.blob1Y !== undefined) {
            this.blob1Y = k19.blob1Y;
        }
        if (k19.blob2X !== undefined) {
            this.blob2X = k19.blob2X;
        }
        if (k19.blob2Y !== undefined) {
            this.blob2Y = k19.blob2Y;
        }
        if (k19.blob3X !== undefined) {
            this.blob3X = k19.blob3X;
        }
        if (k19.blob3Y !== undefined) {
            this.blob3Y = k19.blob3Y;
        }
        if (k19.timer !== undefined) {
            this.timer = k19.timer;
        }
    }
    updateStateVars(j19: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(i19) {
        this.__vm.purgeDependencyOnElmtId(i19);
        this.__currentPage.purgeDependencyOnElmtId(i19);
        this.__activeNav.purgeDependencyOnElmtId(i19);
        this.__activeToolTab.purgeDependencyOnElmtId(i19);
        this.__showPanel.purgeDependencyOnElmtId(i19);
        this.__isDragging.purgeDependencyOnElmtId(i19);
        this.__currentTheme.purgeDependencyOnElmtId(i19);
        this.__themeMode.purgeDependencyOnElmtId(i19);
        this.__blob1X.purgeDependencyOnElmtId(i19);
        this.__blob1Y.purgeDependencyOnElmtId(i19);
        this.__blob2X.purgeDependencyOnElmtId(i19);
        this.__blob2Y.purgeDependencyOnElmtId(i19);
        this.__blob3X.purgeDependencyOnElmtId(i19);
        this.__blob3Y.purgeDependencyOnElmtId(i19);
    }
    aboutToBeDeleted() {
        this.__vm.aboutToBeDeleted();
        this.__currentPage.aboutToBeDeleted();
        this.__activeNav.aboutToBeDeleted();
        this.__activeToolTab.aboutToBeDeleted();
        this.__showPanel.aboutToBeDeleted();
        this.__isDragging.aboutToBeDeleted();
        this.__currentTheme.aboutToBeDeleted();
        this.__themeMode.aboutToBeDeleted();
        this.__blob1X.aboutToBeDeleted();
        this.__blob1Y.aboutToBeDeleted();
        this.__blob2X.aboutToBeDeleted();
        this.__blob2Y.aboutToBeDeleted();
        this.__blob3X.aboutToBeDeleted();
        this.__blob3Y.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __vm: ObservedPropertyObjectPU<ImageLayoutVM>;
    get vm() {
        return this.__vm.get();
    }
    set vm(h19: ImageLayoutVM) {
        this.__vm.set(h19);
    }
    private __currentPage: ObservedPropertySimplePU<PageKey>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(g19: PageKey) {
        this.__currentPage.set(g19);
    }
    private __activeNav: ObservedPropertySimplePU<NavKey>;
    get activeNav() {
        return this.__activeNav.get();
    }
    set activeNav(f19: NavKey) {
        this.__activeNav.set(f19);
    }
    private __activeToolTab: ObservedPropertySimplePU<ToolTabKey>;
    get activeToolTab() {
        return this.__activeToolTab.get();
    }
    set activeToolTab(e19: ToolTabKey) {
        this.__activeToolTab.set(e19);
    }
    private __showPanel: ObservedPropertySimplePU<boolean>;
    get showPanel() {
        return this.__showPanel.get();
    }
    set showPanel(d19: boolean) {
        this.__showPanel.set(d19);
    }
    private __isDragging: ObservedPropertySimplePU<boolean>;
    get isDragging() {
        return this.__isDragging.get();
    }
    set isDragging(c19: boolean) {
        this.__isDragging.set(c19);
    }
    private __currentTheme: ObservedPropertySimplePU<ThemeStyle>;
    get currentTheme() {
        return this.__currentTheme.get();
    }
    set currentTheme(b19: ThemeStyle) {
        this.__currentTheme.set(b19);
    }
    private __themeMode: ObservedPropertySimplePU<ThemeMode>;
    get themeMode() {
        return this.__themeMode.get();
    }
    set themeMode(a19: ThemeMode) {
        this.__themeMode.set(a19);
    }
    private __blob1X: ObservedPropertySimplePU<number>;
    get blob1X() {
        return this.__blob1X.get();
    }
    set blob1X(z18: number) {
        this.__blob1X.set(z18);
    }
    private __blob1Y: ObservedPropertySimplePU<number>;
    get blob1Y() {
        return this.__blob1Y.get();
    }
    set blob1Y(y18: number) {
        this.__blob1Y.set(y18);
    }
    private __blob2X: ObservedPropertySimplePU<number>;
    get blob2X() {
        return this.__blob2X.get();
    }
    set blob2X(x18: number) {
        this.__blob2X.set(x18);
    }
    private __blob2Y: ObservedPropertySimplePU<number>;
    get blob2Y() {
        return this.__blob2Y.get();
    }
    set blob2Y(w18: number) {
        this.__blob2Y.set(w18);
    }
    private __blob3X: ObservedPropertySimplePU<number>;
    get blob3X() {
        return this.__blob3X.get();
    }
    set blob3X(v18: number) {
        this.__blob3X.set(v18);
    }
    private __blob3Y: ObservedPropertySimplePU<number>;
    get blob3Y() {
        return this.__blob3Y.get();
    }
    set blob3Y(u18: number) {
        this.__blob3Y.set(u18);
    }
    private timer: number;
    aboutToAppear() {
        this.startBlobAnimation();
    }
    aboutToDisappear() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    startBlobAnimation() {
        let r18 = 0;
        let s18 = Math.PI * 0.7;
        let t18 = Math.PI * 1.3;
        this.timer = setInterval(() => {
            r18 += 0.02;
            s18 += 0.015;
            t18 += 0.018;
            this.blob1X = 55 + Math.sin(r18) * 8;
            this.blob1Y = 10 + Math.cos(r18 * 0.7) * 5;
            this.blob2X = 15 + Math.sin(s18) * 6;
            this.blob2Y = 45 + Math.cos(s18 * 0.8) * 5;
            this.blob3X = 55 + Math.sin(t18) * 7;
            this.blob3Y = 75 + Math.cos(t18 * 0.6) * 5;
        }, 100);
    }
    initialRender() {
        this.observeComponentCreation2((p18, q18) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.BackgroundLayer.bind(this)();
        this.observeComponentCreation2((n18, o18) => {
            Column.create();
            Column.width('100%');
            Column.layoutWeight(1);
            Column.borderRadius({ topLeft: 0, topRight: 0, bottomLeft: 32, bottomRight: 32 });
            Column.backgroundColor('rgba(255, 255, 255, 0.72)');
            Column.backdropBlur(40);
            Column.shadow({
                radius: 24,
                color: 'rgba(0, 0, 0, 0.06)',
                offsetX: 0,
                offsetY: -4
            });
        }, Column);
        this.observeComponentCreation2((l18, m18) => {
            If.create();
            if (this.currentPage === 'home') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.HomeContent.bind(this)();
                });
            }
            else if (this.currentPage === 'profile') {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.ProfileContent.bind(this)();
                });
            }
            else if (this.currentPage === 'tool') {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.ToolContent.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.BottomNavBar.bind(this)();
        this.observeComponentCreation2((j18, k18) => {
            If.create();
            if (this.currentPage === 'tool') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.FloatingToolbar.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((h18, i18) => {
            If.create();
            if (this.showPanel && this.currentPage === 'tool') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.SidePanel.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    BackgroundLayer(w17 = null) {
        this.observeComponentCreation2((f18, g18) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
            Stack.clip(true);
        }, Stack);
        this.observeComponentCreation2((d18, e18) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F7FD');
        }, Column);
        Column.pop();
        this.observeComponentCreation2((b18, c18) => {
            Column.create();
            Column.width(280);
            Column.height(280);
            Column.borderRadius(140);
            Column.linearGradient({
                direction: GradientDirection.Bottom,
                colors: [['#93C5FD', 0.0], ['rgba(147, 197, 253, 0)', 1.0]]
            });
            Column.opacity(0.45);
            Column.position({ x: `${this.blob1X}%`, y: `${this.blob1Y}%` });
            Column.blur(100);
        }, Column);
        Column.pop();
        this.observeComponentCreation2((z17, a18) => {
            Column.create();
            Column.width(240);
            Column.height(240);
            Column.borderRadius(120);
            Column.linearGradient({
                direction: GradientDirection.Bottom,
                colors: [['#C4B5FD', 0.0], ['rgba(196, 181, 253, 0)', 1.0]]
            });
            Column.opacity(0.35);
            Column.position({ x: `${this.blob2X}%`, y: `${this.blob2Y}%` });
            Column.blur(100);
        }, Column);
        Column.pop();
        this.observeComponentCreation2((x17, y17) => {
            Column.create();
            Column.width(200);
            Column.height(200);
            Column.borderRadius(100);
            Column.linearGradient({
                direction: GradientDirection.Bottom,
                colors: [['#6EE7B7', 0.0], ['rgba(110, 231, 183, 0)', 1.0]]
            });
            Column.opacity(0.25);
            Column.position({ x: `${this.blob3X}%`, y: `${this.blob3Y}%` });
            Column.blur(100);
        }, Column);
        Column.pop();
        Stack.pop();
    }
    HomeContent(r17 = null) {
        this.observeComponentCreation2((u17, v17) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.padding({ left: 20, right: 20, top: 24 });
        }, Column);
        this.HomeHeader.bind(this)();
        this.BannerCard.bind(this)();
        this.observeComponentCreation2((s17, t17) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        Column.pop();
    }
    HomeHeader(c17 = null) {
        this.observeComponentCreation2((p17, q17) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 24 });
        }, Row);
        this.observeComponentCreation2((n17, o17) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((l17, m17) => {
            Text.create('Hello，小志 👋');
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#1F2937');
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((j17, k17) => {
            Text.create('高效工具箱，简单好用');
            Text.fontSize(14);
            Text.fontColor('#6B7280');
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((h17, i17) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((f17, g17) => {
            Button.createWithChild();
            Button.width(44);
            Button.height(44);
            Button.borderRadius(16);
            Button.backgroundColor('rgba(255, 255, 255, 0.6)');
            Button.backdropBlur(12);
            Button.shadow({
                radius: 8,
                color: 'rgba(0, 0, 0, 0.04)',
                offsetX: 0,
                offsetY: 2
            });
            Button.onClick(() => this.goToProfile());
        }, Button);
        this.observeComponentCreation2((d17, e17) => {
            Text.create('⚙️');
            Text.fontSize(18);
        }, Text);
        Text.pop();
        Button.pop();
        Row.pop();
    }
    BannerCard(x15 = null) {
        this.observeComponentCreation2((a17, b17) => {
            Column.create();
            Column.width('100%');
            Column.height(200);
            Column.borderRadius(28);
            Column.linearGradient({
                direction: GradientDirection.Bottom,
                colors: [['#5B7CFA', 0.0], ['#7B95FF', 1.0]]
            });
            Column.shadow({
                radius: 30,
                color: 'rgba(96, 120, 255, 0.20)',
                offsetX: 0,
                offsetY: 10
            });
            Column.padding(24);
            Column.clip(true);
            Column.onClick(() => this.navigateToTool('image-layout'));
        }, Column);
        this.observeComponentCreation2((y16, z16) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((w16, x16) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((u16, v16) => {
            Text.create('图片排版工具');
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFFFFF');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((s16, t16) => {
            Text.create('多种模板布局');
            Text.fontSize(14);
            Text.fontColor('rgba(255, 255, 255, 0.8)');
            Text.margin({ bottom: 2 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((q16, r16) => {
            Text.create('轻松拼图');
            Text.fontSize(14);
            Text.fontColor('rgba(255, 255, 255, 0.8)');
            Text.margin({ bottom: 2 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((o16, p16) => {
            Text.create('让图片更美观');
            Text.fontSize(14);
            Text.fontColor('rgba(255, 255, 255, 0.8)');
            Text.margin({ bottom: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((m16, n16) => {
            Row.create();
            Row.padding({ left: 20, right: 20, top: 10, bottom: 10 });
            Row.borderRadius(18);
            Row.backgroundColor('rgba(255, 255, 255, 0.2)');
            Row.backdropBlur(8);
        }, Row);
        this.observeComponentCreation2((k16, l16) => {
            Text.create('开始使用');
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#FFFFFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((i16, j16) => {
            Text.create(' →');
            Text.fontSize(14);
            Text.fontColor('#FFFFFF');
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((g16, h16) => {
            Stack.create();
            Stack.width(120);
            Stack.height(130);
        }, Stack);
        this.observeComponentCreation2((e16, f16) => {
            Column.create();
            Column.width(80);
            Column.height(100);
            Column.borderRadius(12);
            Column.backgroundColor('rgba(255, 255, 255, 0.20)');
            Column.backdropBlur(12);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.3)' });
            Column.rotate({ angle: 6 });
            Column.position({ x: 0, y: 0 });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((c16, d16) => {
            Column.create();
            Column.width(70);
            Column.height(90);
            Column.borderRadius(12);
            Column.backgroundColor('rgba(255, 255, 255, 0.15)');
            Column.backdropBlur(12);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.2)' });
            Column.rotate({ angle: -3 });
            Column.position({ x: 20, y: 15 });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((a16, b16) => {
            Column.create();
            Column.width(60);
            Column.height(80);
            Column.borderRadius(12);
            Column.backgroundColor('rgba(255, 255, 255, 0.10)');
            Column.backdropBlur(12);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.15)' });
            Column.rotate({ angle: 2 });
            Column.position({ x: 40, y: 30 });
        }, Column);
        Column.pop();
        Stack.pop();
        Row.pop();
        this.observeComponentCreation2((y15, z15) => {
            Column.create();
            Column.width(180);
            Column.height(180);
            Column.borderRadius(90);
            Column.backgroundColor('rgba(255, 255, 255, 0.05)');
            Column.position({ x: '100%', y: '100%' });
            Column.translate({ x: -60, y: -60 });
        }, Column);
        Column.pop();
        Column.pop();
    }
    ProfileContent(n13 = null) {
        this.observeComponentCreation2((v15, w15) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.height('100%');
        }, Scroll);
        this.observeComponentCreation2((t15, u15) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 20, right: 20, top: 24 });
        }, Column);
        this.observeComponentCreation2((r15, s15) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 24 });
        }, Row);
        this.observeComponentCreation2((p15, q15) => {
            Text.create('我的');
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#1F2937');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((n15, o15) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        Row.pop();
        this.observeComponentCreation2((l15, m15) => {
            Text.create('主题风格');
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#9CA3AF');
            Text.margin({ bottom: 12 });
            Text.alignSelf(ItemAlign.Start);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((j15, k15) => {
            Grid.create();
            Grid.columnsTemplate('1fr 1fr 1fr');
            Grid.rowsGap(10);
            Grid.columnsGap(10);
            Grid.width('100%');
            Grid.margin({ bottom: 24 });
        }, Grid);
        this.observeComponentCreation2((n14, o14) => {
            ForEach.create();
            const p14 = q14 => {
                const r14 = q14;
                {
                    const s14 = (h15, i15) => {
                        GridItem.create(() => { }, false);
                    };
                    const t14 = () => {
                        this.observeComponentCreation2(s14, GridItem);
                        this.observeComponentCreation2((f15, g15) => {
                            Column.create();
                            Column.width('100%');
                            Column.padding(12);
                            Column.borderRadius(16);
                            Column.backgroundColor(this.currentTheme === r14.id ? 'rgba(91, 124, 250, 0.08)' : 'rgba(255, 255, 255, 0.5)');
                            Column.backdropBlur(20);
                            Column.border({
                                width: this.currentTheme === r14.id ? 1.5 : 0.5,
                                color: this.currentTheme === r14.id ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)'
                            });
                            Column.shadow({ radius: 8, color: 'rgba(0, 0, 0, 0.04)', offsetX: 0, offsetY: 2 });
                            Column.onClick(() => this.currentTheme = r14.id);
                        }, Column);
                        this.observeComponentCreation2((d15, e15) => {
                            Row.create({ space: 3 });
                            Row.margin({ bottom: 8 });
                        }, Row);
                        this.observeComponentCreation2((w14, x14) => {
                            ForEach.create();
                            const y14 = z14 => {
                                const a15 = z14;
                                this.observeComponentCreation2((b15, c15) => {
                                    Column.create();
                                    Column.width(14);
                                    Column.height(14);
                                    Column.borderRadius(7);
                                    Column.backgroundColor(a15);
                                }, Column);
                                Column.pop();
                            };
                            this.forEachUpdateFunction(w14, r14.colors, y14);
                        }, ForEach);
                        ForEach.pop();
                        Row.pop();
                        this.observeComponentCreation2((u14, v14) => {
                            Text.create(r14.label);
                            Text.fontSize(11);
                            Text.fontWeight(FontWeight.Medium);
                            Text.fontColor(this.currentTheme === r14.id ? '#5B7CFA' : '#6B7280');
                        }, Text);
                        Text.pop();
                        Column.pop();
                        GridItem.pop();
                    };
                    t14();
                }
            };
            this.forEachUpdateFunction(n14, [
                { id: 'frost' as ThemeStyle, label: '霜蓝', colors: ['#E8ECF2', '#93C5FD', '#60A5FA', '#4F8CFF'] },
                { id: 'mint' as ThemeStyle, label: '薄荷', colors: ['#E6F0EA', '#6EE7B7', '#34D399', '#10B981'] },
                { id: 'warm' as ThemeStyle, label: '暖阳', colors: ['#F2ECE2', '#FBBF24', '#F59E0B', '#D97706'] },
                { id: 'lavender' as ThemeStyle, label: '薰衣草', colors: ['#ECE6F5', '#C4B5FD', '#A78BFA', '#7C3AED'] },
                { id: 'sakura' as ThemeStyle, label: '樱花', colors: ['#FCE7F3', '#F9A8D4', '#EC4899', '#DB2777'] },
                { id: 'ocean' as ThemeStyle, label: '海洋', colors: ['#E0F2FE', '#7DD3FC', '#38BDF8', '#0EA5E9'] },
            ], p14);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
        this.observeComponentCreation2((l14, m14) => {
            Text.create('主题模式');
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#9CA3AF');
            Text.margin({ bottom: 12 });
            Text.alignSelf(ItemAlign.Start);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((j14, k14) => {
            Row.create({ space: 10 });
            Row.width('100%');
            Row.margin({ bottom: 24 });
        }, Row);
        this.observeComponentCreation2((y13, z13) => {
            ForEach.create();
            const a14 = b14 => {
                const c14 = b14;
                this.observeComponentCreation2((h14, i14) => {
                    Column.create();
                    Column.layoutWeight(1);
                    Column.padding(14);
                    Column.borderRadius(16);
                    Column.backgroundColor(this.themeMode === c14.value ? 'rgba(91, 124, 250, 0.08)' : 'rgba(255, 255, 255, 0.5)');
                    Column.backdropBlur(20);
                    Column.border({
                        width: this.themeMode === c14.value ? 1.5 : 0.5,
                        color: this.themeMode === c14.value ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)'
                    });
                    Column.shadow({ radius: 8, color: 'rgba(0, 0, 0, 0.04)', offsetX: 0, offsetY: 2 });
                    Column.onClick(() => this.themeMode = c14.value);
                }, Column);
                this.observeComponentCreation2((f14, g14) => {
                    Text.create(c14.icon);
                    Text.fontSize(22);
                    Text.margin({ bottom: 6 });
                }, Text);
                Text.pop();
                this.observeComponentCreation2((d14, e14) => {
                    Text.create(c14.label);
                    Text.fontSize(12);
                    Text.fontWeight(FontWeight.Medium);
                    Text.fontColor(this.themeMode === c14.value ? '#5B7CFA' : '#6B7280');
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(y13, [
                { value: 'light' as ThemeMode, label: '浅色', icon: '☀️' },
                { value: 'dark' as ThemeMode, label: '深色', icon: '🌙' },
                { value: 'system' as ThemeMode, label: '跟随系统', icon: '💻' },
            ], a14);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        this.observeComponentCreation2((w13, x13) => {
            Text.create('关于');
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#9CA3AF');
            Text.margin({ bottom: 12 });
            Text.alignSelf(ItemAlign.Start);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((u13, v13) => {
            Column.create();
            Column.width('100%');
            Column.padding(4);
            Column.borderRadius(22);
            Column.backgroundColor('rgba(255, 255, 255, 0.65)');
            Column.backdropBlur(32);
            Column.border({ width: 0.5, color: 'rgba(255, 255, 255, 0.5)' });
            Column.shadow({ radius: 16, color: 'rgba(0, 0, 0, 0.04)', offsetX: 0, offsetY: 4 });
        }, Column);
        this.AboutRow.bind(this)('版本', '1.0.0');
        this.observeComponentCreation2((s13, t13) => {
            Divider.create();
            Divider.color('rgba(0, 0, 0, 0.05)');
        }, Divider);
        this.AboutRow.bind(this)('开发者', '小志秘书');
        this.observeComponentCreation2((q13, r13) => {
            Divider.create();
            Divider.color('rgba(0, 0, 0, 0.05)');
        }, Divider);
        this.AboutRow.bind(this)('描述', '轻盈、治愈、高效的图片排版工具');
        Column.pop();
        this.observeComponentCreation2((o13, p13) => {
            Blank.create();
            Blank.height(80);
        }, Blank);
        Blank.pop();
        Column.pop();
        Scroll.pop();
    }
    AboutRow(c13: string, d13: string, e13 = null) {
        this.observeComponentCreation2((l13, m13) => {
            Row.create();
            Row.width('100%');
            Row.padding(12);
        }, Row);
        this.observeComponentCreation2((j13, k13) => {
            Text.create(c13);
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#1F2937');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((h13, i13) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((f13, g13) => {
            Text.create(d13);
            Text.fontSize(14);
            Text.fontColor('#9CA3AF');
        }, Text);
        Text.pop();
        Row.pop();
    }
    ToolContent(x12 = null) {
        this.observeComponentCreation2((a13, b13) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.ToolTitleBar.bind(this)();
        this.PreviewArea.bind(this)();
        this.observeComponentCreation2((y12, z12) => {
            If.create();
            if (this.vm.getPageCount() > 1) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.PageThumbnails.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    ToolTitleBar(q11 = null) {
        this.observeComponentCreation2((v12, w12) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 20, right: 20, top: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((t12, u12) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((r12, s12) => {
            Button.createWithChild();
            Button.width(36);
            Button.height(36);
            Button.borderRadius(18);
            Button.backgroundColor('rgba(255, 255, 255, 0.6)');
            Button.backdropBlur(12);
            Button.onClick(() => this.goHome());
        }, Button);
        this.observeComponentCreation2((p12, q12) => {
            Text.create('<');
            Text.fontSize(16);
            Text.fontColor('#374151');
        }, Text);
        Text.pop();
        Button.pop();
        this.observeComponentCreation2((n12, o12) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.margin({ left: 12 });
        }, Column);
        this.observeComponentCreation2((l12, m12) => {
            Text.create('图片排版');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#1F2937');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((h12, i12) => {
            If.create();
            if (this.vm.getImageCount() > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((j12, k12) => {
                        Text.create(`${this.vm.getImageCount()} 张图片 · ${this.vm.getPageCount()} 页`);
                        Text.fontSize(11);
                        Text.fontColor('#9CA3AF');
                        Text.margin({ top: 2 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((f12, g12) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((r11, s11) => {
            If.create();
            if (this.vm.getPageCount() > 1) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((d12, e12) => {
                        Row.create();
                    }, Row);
                    this.observeComponentCreation2((b12, c12) => {
                        Button.createWithChild();
                        Button.width(32);
                        Button.height(32);
                        Button.backgroundColor('transparent');
                        Button.onClick(() => this.vm.prevPage());
                    }, Button);
                    this.observeComponentCreation2((z11, a12) => {
                        Text.create('<');
                        Text.fontSize(16);
                        Text.fontColor('#6B7280');
                    }, Text);
                    Text.pop();
                    Button.pop();
                    this.observeComponentCreation2((x11, y11) => {
                        Text.create(`${this.vm.currentPage + 1}/${this.vm.getPageCount()}`);
                        Text.fontSize(13);
                        Text.fontColor('#6B7280');
                        Text.margin({ left: 6, right: 6 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((v11, w11) => {
                        Button.createWithChild();
                        Button.width(32);
                        Button.height(32);
                        Button.backgroundColor('transparent');
                        Button.onClick(() => this.vm.nextPage());
                    }, Button);
                    this.observeComponentCreation2((t11, u11) => {
                        Text.create('>');
                        Text.fontSize(16);
                        Text.fontColor('#6B7280');
                    }, Text);
                    Text.pop();
                    Button.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Row.pop();
    }
    PreviewArea(s10 = null) {
        this.observeComponentCreation2((n11, o11) => {
            Stack.create();
            Stack.width('100%');
            Stack.layoutWeight(1);
            Stack.onDragEnter(() => this.isDragging = true);
            Stack.onDragLeave(() => this.isDragging = false);
            Stack.onDrop((p11: DragEvent) => {
                this.isDragging = false;
                this.handleDrop(p11);
            });
        }, Stack);
        this.observeComponentCreation2((l11, m11) => {
            Column.create();
            Column.width('100%');
            Column.layoutWeight(1);
            Column.padding({ left: 56, right: 56, top: 8, bottom: 8 });
        }, Column);
        this.observeComponentCreation2((b11, c11) => {
            If.create();
            if (this.vm.getImageCount() === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((j11, k11) => {
                        Column.create();
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((h11, i11) => {
                        Text.create('📷');
                        Text.fontSize(48);
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((f11, g11) => {
                        Text.create('拖拽图片到此处或点击右侧「图片」添加');
                        Text.fontSize(13);
                        Text.fontColor('#6B7280');
                        Text.margin({ bottom: 4 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((d11, e11) => {
                        Text.create('支持 PNG、JPG、WEBP、BMP');
                        Text.fontSize(11);
                        Text.fontColor('#9CA3AF');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.PaperPreview.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((t10, u10) => {
            If.create();
            if (this.isDragging) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((z10, a11) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('rgba(91, 124, 250, 0.1)');
                        Column.border({ width: 2, color: '#5B7CFA', style: BorderStyle.Dashed });
                        Column.borderRadius(12);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((x10, y10) => {
                        Text.create('📥');
                        Text.fontSize(40);
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((v10, w10) => {
                        Text.create('松开添加图片');
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#5B7CFA');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    PaperPreview(v9 = null) {
        this.observeComponentCreation2((q10, r10) => {
            Column.create();
            Column.width('100%');
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((o10, p10) => {
            Text.create(`第 ${this.vm.currentPage + 1} 页`);
            Text.fontSize(14);
            Text.fontColor('#333333');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((w9, x9) => {
            If.create();
            if (this.vm.getCurrentPageData() !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((m10, n10) => {
                        Stack.create();
                        Stack.width('100%');
                        Stack.height(268);
                        Stack.backgroundColor('#FFFFFF');
                        Stack.borderRadius(10);
                        Stack.padding(6);
                        Stack.shadow({ radius: 8, color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 2 });
                    }, Stack);
                    this.observeComponentCreation2((y9, z9) => {
                        ForEach.create();
                        const a10 = (b10, c10: number) => {
                            const d10 = b10;
                            this.observeComponentCreation2((e10, f10) => {
                                If.create();
                                if (this.vm.getCurrentPageData()?.imageIndices[c10] !== undefined &&
                                    this.vm.getCurrentPageData()!.imageIndices[c10] < this.vm.images.length) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((k10, l10) => {
                                            Image.create(this.vm.images[this.vm.getCurrentPageData()!.imageIndices[c10]].uri);
                                            Image.width(`${(d10.width * 0.902).toFixed(0)}px`);
                                            Image.height(`${(d10.height * 0.902).toFixed(0)}px`);
                                            Image.objectFit(ImageFit.Cover);
                                            Image.borderRadius(2);
                                            Image.position({
                                                x: `${(d10.x * 0.902).toFixed(0)}px`,
                                                y: `${(d10.y * 0.902).toFixed(0)}px`
                                            });
                                        }, Image);
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                        this.observeComponentCreation2((i10, j10) => {
                                            Column.create();
                                            Column.width(`${(d10.width * 0.902).toFixed(0)}px`);
                                            Column.height(`${(d10.height * 0.902).toFixed(0)}px`);
                                            Column.backgroundColor('#F5F5F5');
                                            Column.borderRadius(2);
                                            Column.justifyContent(FlexAlign.Center);
                                            Column.position({
                                                x: `${(d10.x * 0.902).toFixed(0)}px`,
                                                y: `${(d10.y * 0.902).toFixed(0)}px`
                                            });
                                        }, Column);
                                        this.observeComponentCreation2((g10, h10) => {
                                            Text.create(`${c10 + 1}`);
                                            Text.fontSize(10);
                                            Text.fontColor('#CCCCCC');
                                        }, Text);
                                        Text.pop();
                                        Column.pop();
                                    });
                                }
                            }, If);
                            If.pop();
                        };
                        this.forEachUpdateFunction(y9, this.vm.getCurrentPageData()?.slots ?? [], a10, undefined, true, false);
                    }, ForEach);
                    ForEach.pop();
                    Stack.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    PageThumbnails(u8 = null) {
        this.observeComponentCreation2((t9, u9) => {
            Row.create({ space: 8 });
            Row.width('100%');
            Row.padding({ left: 56, right: 56, top: 8, bottom: 8 });
            Row.justifyContent(FlexAlign.Center);
        }, Row);
        this.observeComponentCreation2((v8, w8) => {
            ForEach.create();
            const x8 = (y8, z8: number) => {
                const a9 = y8;
                this.observeComponentCreation2((r9, s9) => {
                    Column.create();
                    Column.padding(2);
                    Column.borderRadius(6);
                    Column.backgroundColor(z8 === this.vm.currentPage ? '#E3F2FD' : 'transparent');
                    Column.border({
                        width: z8 === this.vm.currentPage ? 1.5 : 0.5,
                        color: z8 === this.vm.currentPage ? '#5B7CFA' : 'rgba(0,0,0,0.1)'
                    });
                    Column.onClick(() => this.vm.goToPage(z8));
                }, Column);
                this.observeComponentCreation2((p9, q9) => {
                    Stack.create();
                    Stack.width(60);
                    Stack.height(80);
                    Stack.backgroundColor('#FFFFFF');
                    Stack.borderRadius(4);
                    Stack.clip(true);
                }, Stack);
                this.observeComponentCreation2((l9, m9) => {
                    If.create();
                    if (a9.imageIndices.length === 0) {
                        this.ifElseBranchUpdateFunction(0, () => {
                            this.observeComponentCreation2((n9, o9) => {
                                Text.create(`${z8 + 1}`);
                                Text.fontSize(9);
                                Text.fontColor('#999999');
                            }, Text);
                            Text.pop();
                        });
                    }
                    else {
                        this.ifElseBranchUpdateFunction(1, () => {
                        });
                    }
                }, If);
                If.pop();
                this.observeComponentCreation2((b9, c9) => {
                    ForEach.create();
                    const d9 = (e9, f9: number) => {
                        const g9 = e9;
                        this.observeComponentCreation2((h9, i9) => {
                            If.create();
                            if (a9.imageIndices[f9] !== undefined && a9.imageIndices[f9] < this.vm.images.length) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((j9, k9) => {
                                        Image.create(this.vm.images[a9.imageIndices[f9]].uri);
                                        Image.width(`${(g9.width / 210 * 60).toFixed(0)}px`);
                                        Image.height(`${(g9.height / 297 * 80).toFixed(0)}px`);
                                        Image.objectFit(ImageFit.Cover);
                                        Image.position({
                                            x: `${(g9.x / 210 * 60).toFixed(0)}px`,
                                            y: `${(g9.y / 297 * 80).toFixed(0)}px`
                                        });
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
                    this.forEachUpdateFunction(b9, a9.slots, d9, undefined, true, false);
                }, ForEach);
                ForEach.pop();
                Stack.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(v8, this.vm.pages, x8, undefined, true, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
    }
    FloatingToolbar(n8 = null) {
        this.observeComponentCreation2((s8, t8) => {
            Column.create();
            Column.width(48);
            Column.backgroundColor('rgba(255, 255, 255, 0.9)');
            Column.backdropBlur(20);
            Column.borderRadius(24);
            Column.shadow({ radius: 12, color: 'rgba(0,0,0,0.2)', offsetX: -2, offsetY: 0 });
            Column.position({ x: '100%', y: '50%' });
            Column.translate({ x: -60, y: '-50%' });
        }, Column);
        this.GripTexture.bind(this)();
        this.observeComponentCreation2((q8, r8) => {
            Row.create();
            Row.width(24);
            Row.height(1);
            Row.backgroundColor('rgba(0,0,0,0.08)');
            Row.margin({ top: 4, bottom: 8 });
        }, Row);
        Row.pop();
        this.observeComponentCreation2((o8, p8) => {
            Column.create({ space: 6 });
        }, Column);
        this.GripButton.bind(this)('📷', 'images');
        this.GripButton.bind(this)('📐', 'layout');
        this.GripButton.bind(this)('📤', 'export');
        Column.pop();
        this.GripTexture.bind(this)();
        Column.pop();
    }
    GripTexture(e8 = null) {
        this.observeComponentCreation2((l8, m8) => {
            Column.create();
            Column.padding({ top: 8, bottom: 8 });
            Column.margin({ top: 4 });
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((j8, k8) => {
            Row.create();
            Row.width(16);
            Row.height(2);
            Row.borderRadius(1);
            Row.backgroundColor('rgba(0,0,0,0.12)');
            Row.margin({ bottom: 3 });
        }, Row);
        Row.pop();
        this.observeComponentCreation2((h8, i8) => {
            Row.create();
            Row.width(16);
            Row.height(2);
            Row.borderRadius(1);
            Row.backgroundColor('rgba(0,0,0,0.12)');
            Row.margin({ bottom: 3 });
        }, Row);
        Row.pop();
        this.observeComponentCreation2((f8, g8) => {
            Row.create();
            Row.width(16);
            Row.height(2);
            Row.borderRadius(1);
            Row.backgroundColor('rgba(0,0,0,0.12)');
        }, Row);
        Row.pop();
        Column.pop();
    }
    GripButton(x7: string, y7: ToolTabKey, z7 = null) {
        this.observeComponentCreation2((c8, d8) => {
            Column.create();
            Column.width(36);
            Column.height(36);
            Column.borderRadius(18);
            Column.backgroundColor(this.activeToolTab === y7 && this.showPanel ? '#5B7CFA' : '#F5F5F5');
            Column.border({ width: 0.5, color: this.activeToolTab === y7 && this.showPanel ? '#4A6AE8' : 'rgba(0,0,0,0.06)' });
            Column.shadow({ radius: 4, color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 1 });
            Column.justifyContent(FlexAlign.Center);
            Column.onClick(() => this.togglePanel(y7));
        }, Column);
        this.observeComponentCreation2((a8, b8) => {
            Text.create(x7);
            Text.fontSize(18);
        }, Text);
        Text.pop();
        Column.pop();
    }
    SidePanel(e7 = null) {
        this.observeComponentCreation2((v7, w7) => {
            Row.create();
            Row.width('100%');
            Row.height('100%');
        }, Row);
        this.observeComponentCreation2((t7, u7) => {
            Column.create();
            Column.width(280);
            Column.height('100%');
            Column.padding(16);
            Column.backgroundColor('rgba(255, 255, 255, 0.92)');
            Column.backdropBlur(40);
            Column.borderRadius({ topLeft: 16, bottomLeft: 16 });
            Column.shadow({ radius: 16, color: 'rgba(0,0,0,0.2)', offsetX: -4, offsetY: 0 });
        }, Column);
        this.observeComponentCreation2((r7, s7) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 12 });
        }, Row);
        this.observeComponentCreation2((p7, q7) => {
            Text.create(this.getPanelTitle());
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#1F2937');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((n7, o7) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((l7, m7) => {
            Button.createWithLabel('✕');
            Button.width(28);
            Button.height(28);
            Button.backgroundColor('transparent');
            Button.fontColor('#9CA3AF');
            Button.fontSize(14);
            Button.onClick(() => this.showPanel = false);
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((j7, k7) => {
            Scroll.create();
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((h7, i7) => {
            If.create();
            if (this.activeToolTab === 'images') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ImageListContent.bind(this)();
                });
            }
            else if (this.activeToolTab === 'layout') {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.LayoutContent.bind(this)();
                });
            }
            else if (this.activeToolTab === 'export') {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.ExportContent.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                });
            }
        }, If);
        If.pop();
        Scroll.pop();
        Column.pop();
        this.observeComponentCreation2((f7, g7) => {
            Column.create();
            Column.layoutWeight(1);
            Column.height('100%');
            Column.onClick(() => this.showPanel = false);
        }, Column);
        Column.pop();
        Row.pop();
    }
    getPanelTitle(): string {
        if (this.activeToolTab === 'images')
            return '图片列表';
        if (this.activeToolTab === 'layout')
            return '布局';
        if (this.activeToolTab === 'export')
            return '导出文档';
        return '';
    }
    ImageListContent(n5 = null) {
        this.observeComponentCreation2((c7, d7) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((a7, b7) => {
            Row.create({ space: 8 });
            Row.width('100%');
            Row.margin({ bottom: 12 });
        }, Row);
        this.observeComponentCreation2((y6, z6) => {
            Button.createWithLabel('添加图片');
            Button.fontSize(13);
            Button.height(32);
            Button.layoutWeight(1);
            Button.backgroundColor('#5B7CFA');
            Button.onClick(() => this.handleAddImage());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((w6, x6) => {
            Button.createWithLabel('撤销');
            Button.fontSize(13);
            Button.height(32);
            Button.backgroundColor('#F5F5F5');
            Button.fontColor('#6B7280');
            Button.onClick(() => this.vm.removeLastImage());
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((u6, v6) => {
            List.create({ space: 8 });
            List.width('100%');
            List.layoutWeight(1);
        }, List);
        this.observeComponentCreation2((s5, t5) => {
            ForEach.create();
            const u5 = v5 => {
                const w5 = v5;
                {
                    const x5 = (s6, t6) => {
                        ViewStackProcessor.StartGetAccessRecordingFor(s6);
                        ListItem.create(z5, true);
                        if (!t6) {
                            ListItem.pop();
                        }
                        ViewStackProcessor.StopGetAccessRecording();
                    };
                    const y5 = (q6, r6) => {
                        ListItem.create(z5, true);
                    };
                    const z5 = (a6, b6) => {
                        x5(a6, b6);
                        this.observeComponentCreation2((o6, p6) => {
                            Row.create();
                            Row.width('100%');
                            Row.padding(8);
                            Row.backgroundColor('rgba(255, 255, 255, 0.5)');
                            Row.borderRadius(8);
                        }, Row);
                        this.observeComponentCreation2((m6, n6) => {
                            Column.create();
                            Column.width(40);
                            Column.height(30);
                            Column.backgroundColor('rgba(91, 124, 250, 0.08)');
                            Column.borderRadius(6);
                            Column.justifyContent(FlexAlign.Center);
                        }, Column);
                        this.observeComponentCreation2((k6, l6) => {
                            Text.create(w5.name.substring(0, 1));
                            Text.fontSize(14);
                            Text.fontColor('#5B7CFA');
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((i6, j6) => {
                            Column.create();
                            Column.alignItems(HorizontalAlign.Start);
                            Column.margin({ left: 8 });
                            Column.layoutWeight(1);
                        }, Column);
                        this.observeComponentCreation2((g6, h6) => {
                            Text.create(w5.name);
                            Text.fontSize(12);
                            Text.fontColor('#1F2937');
                            Text.maxLines(1);
                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((e6, f6) => {
                            Text.create(`${w5.width}×${w5.height}`);
                            Text.fontSize(10);
                            Text.fontColor('#9CA3AF');
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((c6, d6) => {
                            Button.createWithLabel('×');
                            Button.width(24);
                            Button.height(24);
                            Button.backgroundColor('transparent');
                            Button.fontColor('#D1D5DB');
                            Button.fontSize(14);
                            Button.onClick(() => this.vm.removeImage(w5.id));
                        }, Button);
                        Button.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(y5, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(s5, this.vm.images, u5);
        }, ForEach);
        ForEach.pop();
        List.pop();
        this.observeComponentCreation2((o5, p5) => {
            If.create();
            if (this.vm.getImageCount() === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((q5, r5) => {
                        Text.create('还没有图片');
                        Text.fontSize(13);
                        Text.fontColor('#9CA3AF');
                        Text.margin({ top: 24 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    LayoutContent(k2 = null) {
        this.observeComponentCreation2((l5, m5) => {
            Column.create({ space: 16 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((j5, k5) => {
            Text.create('页面设置');
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#1F2937');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((h5, i5) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((f5, g5) => {
            Text.create('纸张大小');
            Text.fontSize(11);
            Text.fontColor('#9CA3AF');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((d5, e5) => {
            Row.create({ space: 6 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((w4, x4) => {
            ForEach.create();
            const y4 = z4 => {
                const a5 = z4;
                this.observeComponentCreation2((b5, c5) => {
                    Button.createWithLabel(a5);
                    Button.fontSize(12);
                    Button.height(32);
                    Button.layoutWeight(1);
                    Button.backgroundColor(this.vm.settings.paperSize === a5 ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)');
                    Button.fontColor(this.vm.settings.paperSize === a5 ? '#FFFFFF' : '#374151');
                    Button.onClick(() => this.vm.updateSetting('paperSize', a5));
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(w4, ['A4', 'A3', 'Letter'], y4);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((u4, v4) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((s4, t4) => {
            Text.create('方向');
            Text.fontSize(11);
            Text.fontColor('#9CA3AF');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((q4, r4) => {
            Row.create({ space: 6 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((o4, p4) => {
            Button.createWithLabel('纵向');
            Button.fontSize(12);
            Button.height(32);
            Button.layoutWeight(1);
            Button.backgroundColor(this.vm.settings.orientation === 'portrait' ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)');
            Button.fontColor(this.vm.settings.orientation === 'portrait' ? '#FFFFFF' : '#374151');
            Button.onClick(() => this.vm.updateSetting('orientation', 'portrait'));
        }, Button);
        Button.pop();
        this.observeComponentCreation2((m4, n4) => {
            Button.createWithLabel('横向');
            Button.fontSize(12);
            Button.height(32);
            Button.layoutWeight(1);
            Button.backgroundColor(this.vm.settings.orientation === 'landscape' ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)');
            Button.fontColor(this.vm.settings.orientation === 'landscape' ? '#FFFFFF' : '#374151');
            Button.onClick(() => this.vm.updateSetting('orientation', 'landscape'));
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((k4, l4) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((i4, j4) => {
            Text.create('每页图片');
            Text.fontSize(11);
            Text.fontColor('#9CA3AF');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((g4, h4) => {
            Flex.create({ wrap: FlexWrap.Wrap, space: { main: new LengthMetrics(6), cross: new LengthMetrics(6) } });
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((z3, a4) => {
            ForEach.create();
            const b4 = c4 => {
                const d4 = c4;
                this.observeComponentCreation2((e4, f4) => {
                    Button.createWithLabel(d4 === null ? '自动' : `${d4}张`);
                    Button.fontSize(11);
                    Button.height(28);
                    Button.backgroundColor(this.vm.settings.imagesPerPage === d4 ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)');
                    Button.fontColor(this.vm.settings.imagesPerPage === d4 ? '#FFFFFF' : '#374151');
                    Button.onClick(() => this.vm.updateSetting('imagesPerPage', d4));
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(z3, [null, 1, 2, 3, 4, 6, 9], b4);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        Column.pop();
        this.observeComponentCreation2((x3, y3) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((v3, w3) => {
            Text.create('间距模式');
            Text.fontSize(11);
            Text.fontColor('#9CA3AF');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((t3, u3) => {
            Row.create({ space: 6 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((r3, s3) => {
            Button.createWithLabel('有间距');
            Button.fontSize(12);
            Button.height(32);
            Button.layoutWeight(1);
            Button.backgroundColor(this.vm.settings.gapMode === 'gapped' ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)');
            Button.fontColor(this.vm.settings.gapMode === 'gapped' ? '#FFFFFF' : '#374151');
            Button.onClick(() => this.vm.updateSetting('gapMode', 'gapped'));
        }, Button);
        Button.pop();
        this.observeComponentCreation2((p3, q3) => {
            Button.createWithLabel('铺满');
            Button.fontSize(12);
            Button.height(32);
            Button.layoutWeight(1);
            Button.backgroundColor(this.vm.settings.gapMode === 'edge-to-edge' ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)');
            Button.fontColor(this.vm.settings.gapMode === 'edge-to-edge' ? '#FFFFFF' : '#374151');
            Button.onClick(() => this.vm.updateSetting('gapMode', 'edge-to-edge'));
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((n3, o3) => {
            Divider.create();
            Divider.color('rgba(0,0,0,0.05)');
            Divider.margin({ top: 8, bottom: 8 });
        }, Divider);
        this.observeComponentCreation2((l3, m3) => {
            Text.create('布局模式');
            Text.fontSize(13);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#1F2937');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((j3, k3) => {
            Text.create(`${this.vm.getImageCount()} 张图片 · ${this.vm.getAvailableLayouts().length} 种布局`);
            Text.fontSize(11);
            Text.fontColor('#9CA3AF');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((h3, i3) => {
            Grid.create();
            Grid.columnsTemplate('1fr 1fr 1fr');
            Grid.rowsGap(6);
            Grid.columnsGap(6);
            Grid.width('100%');
        }, Grid);
        this.observeComponentCreation2((p2, q2) => {
            ForEach.create();
            const r2 = (s2, t2: number) => {
                const u2 = s2;
                {
                    const v2 = (f3, g3) => {
                        GridItem.create(() => { }, false);
                    };
                    const w2 = () => {
                        this.observeComponentCreation2(v2, GridItem);
                        this.observeComponentCreation2((d3, e3) => {
                            Column.create();
                            Column.width('100%');
                            Column.padding(6);
                            Column.borderRadius(6);
                            Column.backgroundColor(t2 === this.vm.activeLayoutIndex ? 'rgba(91, 124, 250, 0.08)' : 'rgba(255, 255, 255, 0.5)');
                            Column.border({
                                width: t2 === this.vm.activeLayoutIndex ? 1 : 0.5,
                                color: t2 === this.vm.activeLayoutIndex ? '#5B7CFA' : 'rgba(0,0,0,0.05)'
                            });
                            Column.onClick(() => this.vm.selectLayout(t2));
                        }, Column);
                        this.observeComponentCreation2((b3, c3) => {
                            Column.create();
                            Column.width(36);
                            Column.height(24);
                            Column.backgroundColor('rgba(91, 124, 250, 0.08)');
                            Column.borderRadius(3);
                            Column.justifyContent(FlexAlign.Center);
                            Column.margin({ bottom: 3 });
                        }, Column);
                        this.observeComponentCreation2((z2, a3) => {
                            Text.create(u2.name.substring(0, 1));
                            Text.fontSize(10);
                            Text.fontColor('#5B7CFA');
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((x2, y2) => {
                            Text.create(u2.name);
                            Text.fontSize(9);
                            Text.fontColor('#6B7280');
                            Text.maxLines(1);
                        }, Text);
                        Text.pop();
                        Column.pop();
                        GridItem.pop();
                    };
                    w2();
                }
            };
            this.forEachUpdateFunction(p2, this.vm.getAvailableLayouts(), r2, undefined, true, false);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
        this.observeComponentCreation2((l2, m2) => {
            If.create();
            if (this.vm.getAvailableLayouts().length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((n2, o2) => {
                        Text.create('请先添加图片');
                        Text.fontSize(12);
                        Text.fontColor('#9CA3AF');
                        Text.margin({ top: 16 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    ExportContent(t1 = null) {
        this.observeComponentCreation2((i2, j2) => {
            Column.create({ space: 12 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((e2, f2) => {
            If.create();
            if (this.vm.getImageCount() > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((g2, h2) => {
                        Text.create(`${this.vm.getImageCount()} 张图片 → ${this.vm.getPageCount()} 页`);
                        Text.fontSize(11);
                        Text.fontColor('#9CA3AF');
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((c2, d2) => {
            Button.createWithLabel('导出 PDF');
            Button.width('100%');
            Button.height(40);
            Button.fontSize(14);
            Button.fontWeight(FontWeight.Bold);
            Button.backgroundColor('#5B7CFA');
            Button.enabled(this.vm.getImageCount() > 0);
            Button.onClick(() => this.handleExportPdf());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((a2, b2) => {
            Button.createWithLabel('导出 Word');
            Button.width('100%');
            Button.height(40);
            Button.fontSize(14);
            Button.fontWeight(FontWeight.Bold);
            Button.backgroundColor('rgba(255, 255, 255, 0.5)');
            Button.fontColor('#374151');
            Button.enabled(this.vm.getImageCount() > 0);
            Button.onClick(() => this.handleExportDocx());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((y1, z1) => {
            Column.create();
            Column.width('100%');
            Column.padding(10);
            Column.backgroundColor('rgba(91, 124, 250, 0.06)');
            Column.borderRadius(8);
        }, Column);
        this.observeComponentCreation2((w1, x1) => {
            Text.create('提示：');
            Text.fontSize(11);
            Text.fontColor('#6B7280');
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((u1, v1) => {
            Text.create(this.vm.getImageCount() === 0 ? '请先添加图片' : 'PDF 和 Word 将以当前设置导出');
            Text.fontSize(11);
            Text.fontColor('#6B7280');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
        Column.pop();
    }
    BottomNavBar(q1 = null) {
        this.observeComponentCreation2((r1, s1) => {
            Row.create();
            Row.width('88%');
            Row.height(56);
            Row.backgroundColor('rgba(255, 255, 255, 0.85)');
            Row.backdropBlur(40);
            Row.borderRadius({ topLeft: 24, topRight: 24 });
            Row.shadow({ radius: 16, color: 'rgba(0, 0, 0, 0.06)', offsetX: 0, offsetY: -2 });
            Row.border({ width: 0.5, color: 'rgba(255, 255, 255, 0.5)' });
            Row.position({ x: '6%', y: '100%' });
            Row.translate({ y: -64 });
        }, Row);
        this.NavItem.bind(this)('🏠', '首页', 'home');
        this.NavItem.bind(this)('👤', '我的', 'profile');
        Row.pop();
    }
    NavItem(g1: string, h1: string, i1: NavKey, j1 = null) {
        this.observeComponentCreation2((o1, p1) => {
            Column.create();
            Column.layoutWeight(1);
            Column.padding(8);
            Column.onClick(() => this.handleNavClick(i1));
        }, Column);
        this.observeComponentCreation2((m1, n1) => {
            Text.create(g1);
            Text.fontSize(20);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((k1, l1) => {
            Text.create(h1);
            Text.fontSize(10);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(this.activeNav === i1 ? '#5B7CFA' : 'rgba(0, 0, 0, 0.3)');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    togglePanel(f1: ToolTabKey): void {
        if (this.activeToolTab === f1 && this.showPanel) {
            this.showPanel = false;
        }
        else {
            this.activeToolTab = f1;
            this.showPanel = true;
        }
    }
    navigateToTool(e1: string): void {
        this.currentPage = 'tool';
        this.activeNav = 'home';
    }
    goHome(): void {
        this.currentPage = 'home';
        this.activeNav = 'home';
        this.showPanel = false;
    }
    goToProfile(): void {
        this.currentPage = 'profile';
        this.activeNav = 'profile';
        this.showPanel = false;
    }
    handleNavClick(d1: NavKey): void {
        if (d1 === 'home')
            this.goHome();
        else if (d1 === 'profile')
            this.goToProfile();
    }
    async handleAddImage(): Promise<void> {
        console.info('[handleAddImage] start');
        const y = await pickImages();
        console.info(`[handleAddImage] got ${y.length} uris`);
        if (y.length === 0)
            return;
        for (const z of y) {
            console.info(`[handleAddImage] processing: ${z}`);
            const a1 = await getImageMetadata(z);
            if (a1) {
                const c1 = getImageName(z);
                console.info(`[handleAddImage] adding: ${c1} ${a1.width}x${a1.height}`);
                this.vm.addImage(c1, z, a1.width, a1.height);
            }
            else {
                const b1 = getImageName(z);
                console.warn(`[handleAddImage] metadata failed for ${b1}, using default size`);
                this.vm.addImage(b1, z, 1920, 1080);
            }
        }
        console.info(`[handleAddImage] done, total: ${this.vm.getImageCount()}`);
    }
    handleDrop(w: DragEvent): void {
        try {
            console.info('拖拽暂不支持，请使用「添加图片」按钮');
        }
        catch (x) {
            console.error('handleDrop error:', x);
        }
    }
    async handleExportPdf(): Promise<void> {
        if (this.vm.getImageCount() === 0) {
            promptAction.showToast({ message: '请先添加图片' });
            return;
        }
        promptAction.showToast({ message: '正在生成 PDF...' });
        let s = getPaperDimensions(this.vm.settings.paperSize, this.vm.settings.orientation);
        let t = this.vm.images.map((v: ImageItemData) => v.uri);
        let u = await exportPdf(this.vm.pages, t, s.width, s.height);
        promptAction.showToast({ message: u ? 'PDF 导出成功' : 'PDF 导出失败或已取消' });
    }
    async handleExportDocx(): Promise<void> {
        if (this.vm.getImageCount() === 0) {
            promptAction.showToast({ message: '请先添加图片' });
            return;
        }
        promptAction.showToast({ message: '正在生成文档...' });
        let o = getPaperDimensions(this.vm.settings.paperSize, this.vm.settings.orientation);
        let p = this.vm.images.map((r: ImageItemData) => r.uri);
        let q = await exportDocx(this.vm.pages, p, o.width, o.height);
        promptAction.showToast({ message: q ? '文档导出成功' : '文档导出失败或已取消' });
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.xiaozhi.imagelayout", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
