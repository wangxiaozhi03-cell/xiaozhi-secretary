import { ImageLayoutVM } from '../viewmodel/ImageLayoutVM';
import { ImageItemData } from '../model/ImageItem';
import { pickImages, getImageMetadata, getImageName } from '../utils/fileUtils';
import { exportPdf, exportDocx } from '../utils/exportUtils';
import { getPaperDimensions } from '../model/PageSettings';
import { LayoutDefinition, ImageSlot, PageLayout } from '../shared/types/index';
import { LengthMetrics, promptAction } from '@kit.ArkUI';

// 页面类型
type PageKey = 'home' | 'tool' | 'profile';
type NavKey = 'home' | 'profile';
type ToolTabKey = 'images' | 'layout' | 'export';

// 主题风格
type ThemeStyle = 'frost' | 'mint' | 'warm' | 'lavender' | 'sakura' | 'ocean';
type ThemeMode = 'light' | 'dark' | 'system';

// 主题数据接口
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

@Entry
@Component
struct Index {
  @State vm: ImageLayoutVM = new ImageLayoutVM();
  @State currentPage: PageKey = 'home';
  @State activeNav: NavKey = 'home';
  @State activeToolTab: ToolTabKey = 'images';
  @State showPanel: boolean = false;
  @State isDragging: boolean = false;
  @State currentTheme: ThemeStyle = 'frost';
  @State themeMode: ThemeMode = 'system';

  // 光斑动画偏移
  @State blob1X: number = 55;
  @State blob1Y: number = 10;
  @State blob2X: number = 15;
  @State blob2Y: number = 45;
  @State blob3X: number = 55;
  @State blob3Y: number = 75;

  private timer: number = 0;

  aboutToAppear() {
    this.startBlobAnimation();
  }

  aboutToDisappear() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startBlobAnimation() {
    let angle1 = 0;
    let angle2 = Math.PI * 0.7;
    let angle3 = Math.PI * 1.3;

    this.timer = setInterval(() => {
      angle1 += 0.02;
      angle2 += 0.015;
      angle3 += 0.018;

      this.blob1X = 55 + Math.sin(angle1) * 8;
      this.blob1Y = 10 + Math.cos(angle1 * 0.7) * 5;
      this.blob2X = 15 + Math.sin(angle2) * 6;
      this.blob2Y = 45 + Math.cos(angle2 * 0.8) * 5;
      this.blob3X = 55 + Math.sin(angle3) * 7;
      this.blob3Y = 75 + Math.cos(angle3 * 0.6) * 5;
    }, 100);
  }

  build() {
    Stack() {
      // Layer 0: 背景层（光斑）
      this.BackgroundLayer()

      // Layer 1: 内容卡片（玻璃质感，底部圆弧）
      Column() {
        if (this.currentPage === 'home') {
          this.HomeContent()
        } else if (this.currentPage === 'profile') {
          this.ProfileContent()
        } else if (this.currentPage === 'tool') {
          this.ToolContent()
        }
      }
      .width('100%')
      .layoutWeight(1)
      .borderRadius({ topLeft: 0, topRight: 0, bottomLeft: 32, bottomRight: 32 })
      .backgroundColor('rgba(255, 255, 255, 0.72)')
      .backdropBlur(40)
      .shadow({
        radius: 24,
        color: 'rgba(0, 0, 0, 0.06)',
        offsetX: 0,
        offsetY: -4
      })

      // Layer 2: 底部导航栏（悬浮）
      this.BottomNavBar()

      // 右侧悬浮工具栏（工具页面显示）
      if (this.currentPage === 'tool') {
        this.FloatingToolbar()
      }

      // 侧面板
      if (this.showPanel && this.currentPage === 'tool') {
        this.SidePanel()
      }
    }
    .width('100%')
    .height('100%')
  }

  // ========== 背景层（光斑） ==========
  @Builder
  BackgroundLayer() {
    Stack() {
      // 底色
      Column()
        .width('100%')
        .height('100%')
        .backgroundColor('#F5F7FD')

      // 光斑 1 (蓝)
      Column()
        .width(280)
        .height(280)
        .borderRadius(140)
        .linearGradient({
          direction: GradientDirection.Bottom,
          colors: [['#93C5FD', 0.0], ['rgba(147, 197, 253, 0)', 1.0]]
        })
        .opacity(0.45)
        .position({ x: `${this.blob1X}%`, y: `${this.blob1Y}%` })
        .blur(100)

      // 光斑 2 (紫)
      Column()
        .width(240)
        .height(240)
        .borderRadius(120)
        .linearGradient({
          direction: GradientDirection.Bottom,
          colors: [['#C4B5FD', 0.0], ['rgba(196, 181, 253, 0)', 1.0]]
        })
        .opacity(0.35)
        .position({ x: `${this.blob2X}%`, y: `${this.blob2Y}%` })
        .blur(100)

      // 光斑 3 (绿)
      Column()
        .width(200)
        .height(200)
        .borderRadius(100)
        .linearGradient({
          direction: GradientDirection.Bottom,
          colors: [['#6EE7B7', 0.0], ['rgba(110, 231, 183, 0)', 1.0]]
        })
        .opacity(0.25)
        .position({ x: `${this.blob3X}%`, y: `${this.blob3Y}%` })
        .blur(100)
    }
    .width('100%')
    .height('100%')
    .clip(true)
  }

  // ========== 首页内容 ==========
  @Builder
  HomeContent() {
    Column() {
      // Header
      this.HomeHeader()

      // Banner
      this.BannerCard()

      Blank()
    }
    .width('100%')
    .height('100%')
    .padding({ left: 20, right: 20, top: 24 })
  }

  @Builder
  HomeHeader() {
    Row() {
      Column() {
        Text('Hello，小志 👋')
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1F2937')
          .margin({ bottom: 4 })

        Text('高效工具箱，简单好用')
          .fontSize(14)
          .fontColor('#6B7280')
      }
      .alignItems(HorizontalAlign.Start)

      Blank()

      Button() {
        Text('⚙️')
          .fontSize(18)
      }
      .width(44)
      .height(44)
      .borderRadius(16)
      .backgroundColor('rgba(255, 255, 255, 0.6)')
      .backdropBlur(12)
      .shadow({
        radius: 8,
        color: 'rgba(0, 0, 0, 0.04)',
        offsetX: 0,
        offsetY: 2
      })
      .onClick(() => this.goToProfile())
    }
    .width('100%')
    .margin({ bottom: 24 })
  }

  @Builder
  BannerCard() {
    Column() {
      Row() {
        // 左侧内容
        Column() {
          Text('图片排版工具')
            .fontSize(22)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FFFFFF')
            .margin({ bottom: 8 })

          Text('多种模板布局')
            .fontSize(14)
            .fontColor('rgba(255, 255, 255, 0.8)')
            .margin({ bottom: 2 })

          Text('轻松拼图')
            .fontSize(14)
            .fontColor('rgba(255, 255, 255, 0.8)')
            .margin({ bottom: 2 })

          Text('让图片更美观')
            .fontSize(14)
            .fontColor('rgba(255, 255, 255, 0.8)')
            .margin({ bottom: 20 })

          Row() {
            Text('开始使用')
              .fontSize(14)
              .fontWeight(FontWeight.Medium)
              .fontColor('#FFFFFF')

            Text(' →')
              .fontSize(14)
              .fontColor('#FFFFFF')
          }
          .padding({ left: 20, right: 20, top: 10, bottom: 10 })
          .borderRadius(18)
          .backgroundColor('rgba(255, 255, 255, 0.2)')
          .backdropBlur(8)
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        // 右侧插画
        Stack() {
          Column()
            .width(80)
            .height(100)
            .borderRadius(12)
            .backgroundColor('rgba(255, 255, 255, 0.20)')
            .backdropBlur(12)
            .border({ width: 1, color: 'rgba(255, 255, 255, 0.3)' })
            .rotate({ angle: 6 })
            .position({ x: 0, y: 0 })

          Column()
            .width(70)
            .height(90)
            .borderRadius(12)
            .backgroundColor('rgba(255, 255, 255, 0.15)')
            .backdropBlur(12)
            .border({ width: 1, color: 'rgba(255, 255, 255, 0.2)' })
            .rotate({ angle: -3 })
            .position({ x: 20, y: 15 })

          Column()
            .width(60)
            .height(80)
            .borderRadius(12)
            .backgroundColor('rgba(255, 255, 255, 0.10)')
            .backdropBlur(12)
            .border({ width: 1, color: 'rgba(255, 255, 255, 0.15)' })
            .rotate({ angle: 2 })
            .position({ x: 40, y: 30 })
        }
        .width(120)
        .height(130)
      }
      .width('100%')

      // 背景装饰圆
      Column()
        .width(180)
        .height(180)
        .borderRadius(90)
        .backgroundColor('rgba(255, 255, 255, 0.05)')
        .position({ x: '100%', y: '100%' })
        .translate({ x: -60, y: -60 })
    }
    .width('100%')
    .height(200)
    .borderRadius(28)
    .linearGradient({
      direction: GradientDirection.Bottom,
      colors: [['#5B7CFA', 0.0], ['#7B95FF', 1.0]]
    })
    .shadow({
      radius: 30,
      color: 'rgba(96, 120, 255, 0.20)',
      offsetX: 0,
      offsetY: 10
    })
    .padding(24)
    .clip(true)
    .onClick(() => this.navigateToTool('image-layout'))
  }

  // ========== 个人页面 ==========
  @Builder
  ProfileContent() {
    Scroll() {
      Column() {
        Row() {
          Text('我的')
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1F2937')
          Blank()
        }
        .width('100%')
        .margin({ bottom: 24 })

        // 主题风格
        Text('主题风格')
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor('#9CA3AF')
          .margin({ bottom: 12 })
          .alignSelf(ItemAlign.Start)

        Grid() {
          ForEach([
            { id: 'frost' as ThemeStyle, label: '霜蓝', colors: ['#E8ECF2', '#93C5FD', '#60A5FA', '#4F8CFF'] },
            { id: 'mint' as ThemeStyle, label: '薄荷', colors: ['#E6F0EA', '#6EE7B7', '#34D399', '#10B981'] },
            { id: 'warm' as ThemeStyle, label: '暖阳', colors: ['#F2ECE2', '#FBBF24', '#F59E0B', '#D97706'] },
            { id: 'lavender' as ThemeStyle, label: '薰衣草', colors: ['#ECE6F5', '#C4B5FD', '#A78BFA', '#7C3AED'] },
            { id: 'sakura' as ThemeStyle, label: '樱花', colors: ['#FCE7F3', '#F9A8D4', '#EC4899', '#DB2777'] },
            { id: 'ocean' as ThemeStyle, label: '海洋', colors: ['#E0F2FE', '#7DD3FC', '#38BDF8', '#0EA5E9'] },
          ], (theme: ThemeItem) => {
            GridItem() {
              Column() {
                Row({ space: 3 }) {
                  ForEach(theme.colors, (color: string) => {
                    Column()
                      .width(14)
                      .height(14)
                      .borderRadius(7)
                      .backgroundColor(color)
                  })
                }
                .margin({ bottom: 8 })

                Text(theme.label)
                  .fontSize(11)
                  .fontWeight(FontWeight.Medium)
                  .fontColor(this.currentTheme === theme.id ? '#5B7CFA' : '#6B7280')
              }
              .width('100%')
              .padding(12)
              .borderRadius(16)
              .backgroundColor(this.currentTheme === theme.id ? 'rgba(91, 124, 250, 0.08)' : 'rgba(255, 255, 255, 0.5)')
              .backdropBlur(20)
              .border({
                width: this.currentTheme === theme.id ? 1.5 : 0.5,
                color: this.currentTheme === theme.id ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)'
              })
              .shadow({ radius: 8, color: 'rgba(0, 0, 0, 0.04)', offsetX: 0, offsetY: 2 })
              .onClick(() => this.currentTheme = theme.id)
            }
          })
        }
        .columnsTemplate('1fr 1fr 1fr')
        .rowsGap(10)
        .columnsGap(10)
        .width('100%')
        .margin({ bottom: 24 })

        // 主题模式
        Text('主题模式')
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor('#9CA3AF')
          .margin({ bottom: 12 })
          .alignSelf(ItemAlign.Start)

        Row({ space: 10 }) {
          ForEach([
            { value: 'light' as ThemeMode, label: '浅色', icon: '☀️' },
            { value: 'dark' as ThemeMode, label: '深色', icon: '🌙' },
            { value: 'system' as ThemeMode, label: '跟随系统', icon: '💻' },
          ], (opt: ThemeModeItem) => {
            Column() {
              Text(opt.icon)
                .fontSize(22)
                .margin({ bottom: 6 })

              Text(opt.label)
                .fontSize(12)
                .fontWeight(FontWeight.Medium)
                .fontColor(this.themeMode === opt.value ? '#5B7CFA' : '#6B7280')
            }
            .layoutWeight(1)
            .padding(14)
            .borderRadius(16)
            .backgroundColor(this.themeMode === opt.value ? 'rgba(91, 124, 250, 0.08)' : 'rgba(255, 255, 255, 0.5)')
            .backdropBlur(20)
            .border({
              width: this.themeMode === opt.value ? 1.5 : 0.5,
              color: this.themeMode === opt.value ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)'
            })
            .shadow({ radius: 8, color: 'rgba(0, 0, 0, 0.04)', offsetX: 0, offsetY: 2 })
            .onClick(() => this.themeMode = opt.value)
          })
        }
        .width('100%')
        .margin({ bottom: 24 })

        // 关于
        Text('关于')
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor('#9CA3AF')
          .margin({ bottom: 12 })
          .alignSelf(ItemAlign.Start)

        Column() {
          this.AboutRow('版本', '1.0.0')
          Divider().color('rgba(0, 0, 0, 0.05)')
          this.AboutRow('开发者', '小志秘书')
          Divider().color('rgba(0, 0, 0, 0.05)')
          this.AboutRow('描述', '轻盈、治愈、高效的图片排版工具')
        }
        .width('100%')
        .padding(4)
        .borderRadius(22)
        .backgroundColor('rgba(255, 255, 255, 0.65)')
        .backdropBlur(32)
        .border({ width: 0.5, color: 'rgba(255, 255, 255, 0.5)' })
        .shadow({ radius: 16, color: 'rgba(0, 0, 0, 0.04)', offsetX: 0, offsetY: 4 })

        Blank()
          .height(80)
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 24 })
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  AboutRow(label: string, value: string) {
    Row() {
      Text(label)
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor('#1F2937')
      Blank()
      Text(value)
        .fontSize(14)
        .fontColor('#9CA3AF')
    }
    .width('100%')
    .padding(12)
  }

  // ========== 工具页面 ==========
  @Builder
  ToolContent() {
    Column() {
      this.ToolTitleBar()
      this.PreviewArea()
      if (this.vm.getPageCount() > 1) {
        this.PageThumbnails()
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  ToolTitleBar() {
    Row() {
      Row() {
        Button() {
          Text('<')
            .fontSize(16)
            .fontColor('#374151')
        }
        .width(36)
        .height(36)
        .borderRadius(18)
        .backgroundColor('rgba(255, 255, 255, 0.6)')
        .backdropBlur(12)
        .onClick(() => this.goHome())

        Column() {
          Text('图片排版')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1F2937')

          if (this.vm.getImageCount() > 0) {
            Text(`${this.vm.getImageCount()} 张图片 · ${this.vm.getPageCount()} 页`)
              .fontSize(11)
              .fontColor('#9CA3AF')
              .margin({ top: 2 })
          }
        }
        .alignItems(HorizontalAlign.Start)
        .margin({ left: 12 })
      }

      Blank()

      if (this.vm.getPageCount() > 1) {
        Row() {
          Button() {
            Text('<')
              .fontSize(16)
              .fontColor('#6B7280')
          }
          .width(32)
          .height(32)
          .backgroundColor('transparent')
          .onClick(() => this.vm.prevPage())

          Text(`${this.vm.currentPage + 1}/${this.vm.getPageCount()}`)
            .fontSize(13)
            .fontColor('#6B7280')
            .margin({ left: 6, right: 6 })

          Button() {
            Text('>')
              .fontSize(16)
              .fontColor('#6B7280')
          }
          .width(32)
          .height(32)
          .backgroundColor('transparent')
          .onClick(() => this.vm.nextPage())
        }
      }
    }
    .width('100%')
    .padding({ left: 20, right: 20, top: 16, bottom: 12 })
  }

  @Builder
  PreviewArea() {
    Stack() {
      Column() {
        if (this.vm.getImageCount() === 0) {
          Column() {
            Text('📷')
              .fontSize(48)
              .margin({ bottom: 16 })

            Text('拖拽图片到此处或点击右侧「图片」添加')
              .fontSize(13)
              .fontColor('#6B7280')
              .margin({ bottom: 4 })

            Text('支持 PNG、JPG、WEBP、BMP')
              .fontSize(11)
              .fontColor('#9CA3AF')
          }
          .width('100%')
          .layoutWeight(1)
          .justifyContent(FlexAlign.Center)
        } else {
          this.PaperPreview()
        }
      }
      .width('100%')
      .layoutWeight(1)
      .padding({ left: 56, right: 56, top: 8, bottom: 8 })

      if (this.isDragging) {
        Column() {
          Text('📥')
            .fontSize(40)
            .margin({ bottom: 8 })

          Text('松开添加图片')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#5B7CFA')
        }
        .width('100%')
        .height('100%')
        .backgroundColor('rgba(91, 124, 250, 0.1)')
        .border({ width: 2, color: '#5B7CFA', style: BorderStyle.Dashed })
        .borderRadius(12)
        .justifyContent(FlexAlign.Center)
      }
    }
    .width('100%')
    .layoutWeight(1)
    .onDragEnter(() => this.isDragging = true)
    .onDragLeave(() => this.isDragging = false)
    .onDrop((event: DragEvent) => {
      this.isDragging = false;
      this.handleDrop(event);
    })
  }

  @Builder
  PaperPreview() {
    Column() {
      Text(`第 ${this.vm.currentPage + 1} 页`)
        .fontSize(14)
        .fontColor('#333333')
        .margin({ bottom: 6 })

      if (this.vm.getCurrentPageData() !== null) {
        Stack() {
          ForEach(this.vm.getCurrentPageData()?.slots ?? [], (slot: ImageSlot, slotIdx: number) => {
            if (this.vm.getCurrentPageData()?.imageIndices[slotIdx] !== undefined &&
                this.vm.getCurrentPageData()!.imageIndices[slotIdx] < this.vm.images.length) {
              Image(this.vm.images[this.vm.getCurrentPageData()!.imageIndices[slotIdx]].uri)
                .width(`${(slot.width * 0.902).toFixed(0)}px`)
                .height(`${(slot.height * 0.902).toFixed(0)}px`)
                .objectFit(ImageFit.Cover)
                .borderRadius(2)
                .position({
                  x: `${(slot.x * 0.902).toFixed(0)}px`,
                  y: `${(slot.y * 0.902).toFixed(0)}px`
                })
            } else {
              Column() {
                Text(`${slotIdx + 1}`)
                  .fontSize(10)
                  .fontColor('#CCCCCC')
              }
              .width(`${(slot.width * 0.902).toFixed(0)}px`)
              .height(`${(slot.height * 0.902).toFixed(0)}px`)
              .backgroundColor('#F5F5F5')
              .borderRadius(2)
              .justifyContent(FlexAlign.Center)
              .position({
                x: `${(slot.x * 0.902).toFixed(0)}px`,
                y: `${(slot.y * 0.902).toFixed(0)}px`
              })
            }
          })
        }
        .width('100%')
        .height(268)
        .backgroundColor('#FFFFFF')
        .borderRadius(10)
        .padding(6)
        .shadow({ radius: 8, color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 2 })
      }
    }
    .width('100%')
    .layoutWeight(1)
  }

  @Builder
  PageThumbnails() {
    Row({ space: 8 }) {
      ForEach(this.vm.pages, (page: PageLayout, index: number) => {
        Column() {
          Stack() {
            if (page.imageIndices.length === 0) {
              Text(`${index + 1}`)
                .fontSize(9)
                .fontColor('#999999')
            }
            ForEach(page.slots, (slot: ImageSlot, slotIdx: number) => {
              if (page.imageIndices[slotIdx] !== undefined && page.imageIndices[slotIdx] < this.vm.images.length) {
                Image(this.vm.images[page.imageIndices[slotIdx]].uri)
                  .width(`${(slot.width / 210 * 60).toFixed(0)}px`)
                  .height(`${(slot.height / 297 * 80).toFixed(0)}px`)
                  .objectFit(ImageFit.Cover)
                  .position({
                    x: `${(slot.x / 210 * 60).toFixed(0)}px`,
                    y: `${(slot.y / 297 * 80).toFixed(0)}px`
                  })
              }
            })
          }
          .width(60)
          .height(80)
          .backgroundColor('#FFFFFF')
          .borderRadius(4)
          .clip(true)
        }
        .padding(2)
        .borderRadius(6)
        .backgroundColor(index === this.vm.currentPage ? '#E3F2FD' : 'transparent')
        .border({
          width: index === this.vm.currentPage ? 1.5 : 0.5,
          color: index === this.vm.currentPage ? '#5B7CFA' : 'rgba(0,0,0,0.1)'
        })
        .onClick(() => this.vm.goToPage(index))
      })
    }
    .width('100%')
    .padding({ left: 56, right: 56, top: 8, bottom: 8 })
    .justifyContent(FlexAlign.Center)
  }

  // ========== 右侧悬浮工具栏 ==========
  @Builder
  FloatingToolbar() {
    Column() {
      this.GripTexture()

      Row()
        .width(24)
        .height(1)
        .backgroundColor('rgba(0,0,0,0.08)')
        .margin({ top: 4, bottom: 8 })

      Column({ space: 6 }) {
        this.GripButton('📷', 'images')
        this.GripButton('📐', 'layout')
        this.GripButton('📤', 'export')
      }

      this.GripTexture()
    }
    .width(48)
    .backgroundColor('rgba(255, 255, 255, 0.9)')
    .backdropBlur(20)
    .borderRadius(24)
    .shadow({ radius: 12, color: 'rgba(0,0,0,0.2)', offsetX: -2, offsetY: 0 })
    .position({ x: '100%', y: '50%' })
    .translate({ x: -60, y: '-50%' })
  }

  @Builder
  GripTexture() {
    Column() {
      Row().width(16).height(2).borderRadius(1).backgroundColor('rgba(0,0,0,0.12)').margin({ bottom: 3 })
      Row().width(16).height(2).borderRadius(1).backgroundColor('rgba(0,0,0,0.12)').margin({ bottom: 3 })
      Row().width(16).height(2).borderRadius(1).backgroundColor('rgba(0,0,0,0.12)')
    }
    .padding({ top: 8, bottom: 8 })
    .margin({ top: 4 })
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  GripButton(icon: string, tab: ToolTabKey) {
    Column() {
      Text(icon)
        .fontSize(18)
    }
    .width(36)
    .height(36)
    .borderRadius(18)
    .backgroundColor(this.activeToolTab === tab && this.showPanel ? '#5B7CFA' : '#F5F5F5')
    .border({ width: 0.5, color: this.activeToolTab === tab && this.showPanel ? '#4A6AE8' : 'rgba(0,0,0,0.06)' })
    .shadow({ radius: 4, color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 1 })
    .justifyContent(FlexAlign.Center)
    .onClick(() => this.togglePanel(tab))
  }

  // ========== 侧面板 ==========
  @Builder
  SidePanel() {
    Row() {
      Column() {
        Row() {
          Text(this.getPanelTitle())
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1F2937')
          Blank()
          Button('✕')
            .width(28)
            .height(28)
            .backgroundColor('transparent')
            .fontColor('#9CA3AF')
            .fontSize(14)
            .onClick(() => this.showPanel = false)
        }
        .width('100%')
        .margin({ bottom: 12 })

        Scroll() {
          if (this.activeToolTab === 'images') {
            this.ImageListContent()
          } else if (this.activeToolTab === 'layout') {
            this.LayoutContent()
          } else if (this.activeToolTab === 'export') {
            this.ExportContent()
          }
        }
        .layoutWeight(1)
      }
      .width(280)
      .height('100%')
      .padding(16)
      .backgroundColor('rgba(255, 255, 255, 0.92)')
      .backdropBlur(40)
      .borderRadius({ topLeft: 16, bottomLeft: 16 })
      .shadow({ radius: 16, color: 'rgba(0,0,0,0.2)', offsetX: -4, offsetY: 0 })

      Column()
        .layoutWeight(1)
        .height('100%')
        .onClick(() => this.showPanel = false)
    }
    .width('100%')
    .height('100%')
  }

  getPanelTitle(): string {
    if (this.activeToolTab === 'images') return '图片列表';
    if (this.activeToolTab === 'layout') return '布局';
    if (this.activeToolTab === 'export') return '导出文档';
    return '';
  }

  @Builder
  ImageListContent() {
    Column() {
      Row({ space: 8 }) {
        Button('添加图片')
          .fontSize(13)
          .height(32)
          .layoutWeight(1)
          .backgroundColor('#5B7CFA')
          .onClick(() => this.handleAddImage())
        Button('撤销')
          .fontSize(13)
          .height(32)
          .backgroundColor('#F5F5F5')
          .fontColor('#6B7280')
          .onClick(() => this.vm.removeLastImage())
      }
      .width('100%')
      .margin({ bottom: 12 })

      List({ space: 8 }) {
        ForEach(this.vm.images, (img: ImageItemData) => {
          ListItem() {
            Row() {
              Column() {
                Text(img.name.substring(0, 1))
                  .fontSize(14)
                  .fontColor('#5B7CFA')
              }
              .width(40)
              .height(30)
              .backgroundColor('rgba(91, 124, 250, 0.08)')
              .borderRadius(6)
              .justifyContent(FlexAlign.Center)

              Column() {
                Text(img.name)
                  .fontSize(12)
                  .fontColor('#1F2937')
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                Text(`${img.width}×${img.height}`)
                  .fontSize(10)
                  .fontColor('#9CA3AF')
              }
              .alignItems(HorizontalAlign.Start)
              .margin({ left: 8 })
              .layoutWeight(1)

              Button('×')
                .width(24)
                .height(24)
                .backgroundColor('transparent')
                .fontColor('#D1D5DB')
                .fontSize(14)
                .onClick(() => this.vm.removeImage(img.id))
            }
            .width('100%')
            .padding(8)
            .backgroundColor('rgba(255, 255, 255, 0.5)')
            .borderRadius(8)
          }
        })
      }
      .width('100%')
      .layoutWeight(1)

      if (this.vm.getImageCount() === 0) {
        Text('还没有图片')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .margin({ top: 24 })
      }
    }
    .width('100%')
  }

  @Builder
  LayoutContent() {
    Column({ space: 16 }) {
      Text('页面设置')
        .fontSize(13)
        .fontWeight(FontWeight.Medium)
        .fontColor('#1F2937')

      Column() {
        Text('纸张大小')
          .fontSize(11)
          .fontColor('#9CA3AF')
          .margin({ bottom: 6 })
        Row({ space: 6 }) {
          ForEach(['A4', 'A3', 'Letter'], (size: string) => {
            Button(size)
              .fontSize(12)
              .height(32)
              .layoutWeight(1)
              .backgroundColor(this.vm.settings.paperSize === size ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)')
              .fontColor(this.vm.settings.paperSize === size ? '#FFFFFF' : '#374151')
              .onClick(() => this.vm.updateSetting('paperSize', size))
          })
        }
        .width('100%')
      }

      Column() {
        Text('方向')
          .fontSize(11)
          .fontColor('#9CA3AF')
          .margin({ bottom: 6 })
        Row({ space: 6 }) {
          Button('纵向')
            .fontSize(12)
            .height(32)
            .layoutWeight(1)
            .backgroundColor(this.vm.settings.orientation === 'portrait' ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)')
            .fontColor(this.vm.settings.orientation === 'portrait' ? '#FFFFFF' : '#374151')
            .onClick(() => this.vm.updateSetting('orientation', 'portrait'))
          Button('横向')
            .fontSize(12)
            .height(32)
            .layoutWeight(1)
            .backgroundColor(this.vm.settings.orientation === 'landscape' ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)')
            .fontColor(this.vm.settings.orientation === 'landscape' ? '#FFFFFF' : '#374151')
            .onClick(() => this.vm.updateSetting('orientation', 'landscape'))
        }
        .width('100%')
      }

      Column() {
        Text('每页图片')
          .fontSize(11)
          .fontColor('#9CA3AF')
          .margin({ bottom: 6 })
        Flex({ wrap: FlexWrap.Wrap, space: { main: new LengthMetrics(6), cross: new LengthMetrics(6) } }) {
          ForEach([null, 1, 2, 3, 4, 6, 9], (num: number | null) => {
            Button(num === null ? '自动' : `${num}张`)
              .fontSize(11)
              .height(28)
              .backgroundColor(this.vm.settings.imagesPerPage === num ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)')
              .fontColor(this.vm.settings.imagesPerPage === num ? '#FFFFFF' : '#374151')
              .onClick(() => this.vm.updateSetting('imagesPerPage', num))
          })
        }
        .width('100%')
      }

      Column() {
        Text('间距模式')
          .fontSize(11)
          .fontColor('#9CA3AF')
          .margin({ bottom: 6 })
        Row({ space: 6 }) {
          Button('有间距')
            .fontSize(12)
            .height(32)
            .layoutWeight(1)
            .backgroundColor(this.vm.settings.gapMode === 'gapped' ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)')
            .fontColor(this.vm.settings.gapMode === 'gapped' ? '#FFFFFF' : '#374151')
            .onClick(() => this.vm.updateSetting('gapMode', 'gapped'))
          Button('铺满')
            .fontSize(12)
            .height(32)
            .layoutWeight(1)
            .backgroundColor(this.vm.settings.gapMode === 'edge-to-edge' ? '#5B7CFA' : 'rgba(255, 255, 255, 0.5)')
            .fontColor(this.vm.settings.gapMode === 'edge-to-edge' ? '#FFFFFF' : '#374151')
            .onClick(() => this.vm.updateSetting('gapMode', 'edge-to-edge'))
        }
        .width('100%')
      }

      Divider().color('rgba(0,0,0,0.05)').margin({ top: 8, bottom: 8 })

      Text('布局模式')
        .fontSize(13)
        .fontWeight(FontWeight.Medium)
        .fontColor('#1F2937')

      Text(`${this.vm.getImageCount()} 张图片 · ${this.vm.getAvailableLayouts().length} 种布局`)
        .fontSize(11)
        .fontColor('#9CA3AF')
        .margin({ bottom: 8 })

      Grid() {
        ForEach(this.vm.getAvailableLayouts(), (layout: LayoutDefinition, index: number) => {
          GridItem() {
            Column() {
              Column() {
                Text(layout.name.substring(0, 1))
                  .fontSize(10)
                  .fontColor('#5B7CFA')
              }
              .width(36)
              .height(24)
              .backgroundColor('rgba(91, 124, 250, 0.08)')
              .borderRadius(3)
              .justifyContent(FlexAlign.Center)
              .margin({ bottom: 3 })

              Text(layout.name)
                .fontSize(9)
                .fontColor('#6B7280')
                .maxLines(1)
            }
            .width('100%')
            .padding(6)
            .borderRadius(6)
            .backgroundColor(index === this.vm.activeLayoutIndex ? 'rgba(91, 124, 250, 0.08)' : 'rgba(255, 255, 255, 0.5)')
            .border({
              width: index === this.vm.activeLayoutIndex ? 1 : 0.5,
              color: index === this.vm.activeLayoutIndex ? '#5B7CFA' : 'rgba(0,0,0,0.05)'
            })
            .onClick(() => this.vm.selectLayout(index))
          }
        })
      }
      .columnsTemplate('1fr 1fr 1fr')
      .rowsGap(6)
      .columnsGap(6)
      .width('100%')

      if (this.vm.getAvailableLayouts().length === 0) {
        Text('请先添加图片')
          .fontSize(12)
          .fontColor('#9CA3AF')
          .margin({ top: 16 })
      }
    }
    .width('100%')
  }

  @Builder
  ExportContent() {
    Column({ space: 12 }) {
      if (this.vm.getImageCount() > 0) {
        Text(`${this.vm.getImageCount()} 张图片 → ${this.vm.getPageCount()} 页`)
          .fontSize(11)
          .fontColor('#9CA3AF')
      }

      Button('导出 PDF')
        .width('100%')
        .height(40)
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .backgroundColor('#5B7CFA')
        .enabled(this.vm.getImageCount() > 0)
        .onClick(() => this.handleExportPdf())

      Button('导出 Word')
        .width('100%')
        .height(40)
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .backgroundColor('rgba(255, 255, 255, 0.5)')
        .fontColor('#374151')
        .enabled(this.vm.getImageCount() > 0)
        .onClick(() => this.handleExportDocx())

      Column() {
        Text('提示：')
          .fontSize(11)
          .fontColor('#6B7280')
          .fontWeight(FontWeight.Bold)
        Text(this.vm.getImageCount() === 0 ? '请先添加图片' : 'PDF 和 Word 将以当前设置导出')
          .fontSize(11)
          .fontColor('#6B7280')
          .margin({ top: 2 })
      }
      .width('100%')
      .padding(10)
      .backgroundColor('rgba(91, 124, 250, 0.06)')
      .borderRadius(8)
    }
    .width('100%')
  }

  // ========== 底部导航栏（悬浮） ==========
  @Builder
  BottomNavBar() {
    Row() {
      this.NavItem('🏠', '首页', 'home')
      this.NavItem('👤', '我的', 'profile')
    }
    .width('88%')
    .height(56)
    .backgroundColor('rgba(255, 255, 255, 0.85)')
    .backdropBlur(40)
    .borderRadius({ topLeft: 24, topRight: 24 })
    .shadow({ radius: 16, color: 'rgba(0, 0, 0, 0.06)', offsetX: 0, offsetY: -2 })
    .border({ width: 0.5, color: 'rgba(255, 255, 255, 0.5)' })
    .position({ x: '6%', y: '100%' })
    .translate({ y: -64 })
  }

  @Builder
  NavItem(icon: string, label: string, nav: NavKey) {
    Column() {
      Text(icon)
        .fontSize(20)

      Text(label)
        .fontSize(10)
        .fontWeight(FontWeight.Medium)
        .fontColor(this.activeNav === nav ? '#5B7CFA' : 'rgba(0, 0, 0, 0.3)')
        .margin({ top: 2 })
    }
    .layoutWeight(1)
    .padding(8)
    .onClick(() => this.handleNavClick(nav))
  }

  // ========== 交互逻辑 ==========
  togglePanel(tab: ToolTabKey): void {
    if (this.activeToolTab === tab && this.showPanel) {
      this.showPanel = false;
    } else {
      this.activeToolTab = tab;
      this.showPanel = true;
    }
  }

  navigateToTool(toolId: string): void {
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

  handleNavClick(nav: NavKey): void {
    if (nav === 'home') this.goHome();
    else if (nav === 'profile') this.goToProfile();
  }

  async handleAddImage(): Promise<void> {
    console.info('[handleAddImage] start');
    const uris = await pickImages();
    console.info(`[handleAddImage] got ${uris.length} uris`);
    if (uris.length === 0) return;
    for (const uri of uris) {
      console.info(`[handleAddImage] processing: ${uri}`);
      const metadata = await getImageMetadata(uri);
      if (metadata) {
        const name = getImageName(uri);
        console.info(`[handleAddImage] adding: ${name} ${metadata.width}x${metadata.height}`);
        this.vm.addImage(name, uri, metadata.width, metadata.height);
      } else {
        const name = getImageName(uri);
        console.warn(`[handleAddImage] metadata failed for ${name}, using default size`);
        this.vm.addImage(name, uri, 1920, 1080);
      }
    }
    console.info(`[handleAddImage] done, total: ${this.vm.getImageCount()}`);
  }

  handleDrop(event: DragEvent): void {
    try {
      console.info('拖拽暂不支持，请使用「添加图片」按钮');
    } catch (err) {
      console.error('handleDrop error:', err);
    }
  }

  async handleExportPdf(): Promise<void> {
    if (this.vm.getImageCount() === 0) {
      promptAction.showToast({ message: '请先添加图片' });
      return;
    }
    promptAction.showToast({ message: '正在生成 PDF...' });
    let paper = getPaperDimensions(this.vm.settings.paperSize, this.vm.settings.orientation);
    let imageUris = this.vm.images.map((img: ImageItemData) => img.uri);
    let success = await exportPdf(this.vm.pages, imageUris, paper.width, paper.height);
    promptAction.showToast({ message: success ? 'PDF 导出成功' : 'PDF 导出失败或已取消' });
  }

  async handleExportDocx(): Promise<void> {
    if (this.vm.getImageCount() === 0) {
      promptAction.showToast({ message: '请先添加图片' });
      return;
    }
    promptAction.showToast({ message: '正在生成文档...' });
    let paper = getPaperDimensions(this.vm.settings.paperSize, this.vm.settings.orientation);
    let imageUris = this.vm.images.map((img: ImageItemData) => img.uri);
    let success = await exportDocx(this.vm.pages, imageUris, paper.width, paper.height);
    promptAction.showToast({ message: success ? '文档导出成功' : '文档导出失败或已取消' });
  }
}
