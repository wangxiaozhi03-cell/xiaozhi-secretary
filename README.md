# Image to Document Generator

将图片导入并导出为 PDF / Word 文档的桌面工具。

---

## 功能概览

### 图片管理
- 支持通过系统文件对话框导入图片（PNG、JPG、JPEG、WEBP、BMP）
- 支持批量导入多张图片
- 导入后可预览缩略图、查看尺寸、删除

### 页面设置
- **纸张大小**：A4 / A3 / Letter
- **纸张方向**：横向 / 纵向
- **间距模式**：有间距（可调 0-30mm）/ 无间距（铺满）
- **每页图片数**：自动 / 手动指定（1/2/3/4/6/9 张/页）

### 布局系统
共 26 种布局，按每页图片数自动分组：

| 每页张数 | 可用布局 |
|---------|---------|
| 1 张 | 居中适配、填满页面 |
| 2 张 | 上下排列、左右排列、一大一小、上大下小、对角排列 |
| 3 张 | 三等分横向、三等分纵向、一上两下、两上一下、一大两小右 |
| 4 张 | 田字格、两上两下、竖排四张、横排四张、一左三右、一上三下、三上一左、铺满拼贴、一大三小环绕 |
| 6 张 | 2×3 网格、3×2 网格、一上五下 |
| 9 张 | 3×3 网格、一大八小环绕 |

- 所有图片等比缩放，不变形、不裁剪（有间距模式）
- 无间距模式下自动裁剪溢出部分，最大化利用页面
- 最后一页不满时自动适配小布局

### 实时预览
- 左侧图片列表、中间文档预览、右侧设置面板
- 画布自动缩放适配容器大小
- 底部缩略图导航栏（始终可见）
- 翻页查看所有页面

### 导出
- **PDF**：通过 canvas 渲染 + pdf-lib 嵌入，高质量输出
- **Word (.docx)**：通过 canvas 渲染 + 手写 OOXML ZIP 生成
  - 正确支持横向/纵向页面
  - 每页独立分节，不多出空页
  - 图片铺满整个页面

---

## 技术栈

| 层面 | 方案 |
|------|------|
| 桌面框架 | Tauri v2 |
| 前端框架 | Vue 3 + TypeScript + Composition API |
| 样式 | Tailwind CSS v4 |
| PDF 生成 | pdf-lib |
| Word 生成 | 手写 OOXML（SimpleZip） |
| 图片处理 | Canvas API（前端）+ Rust image crate（后端） |
| 构建工具 | Vite 6 |
| 包管理 | npm |

---

## 项目结构

```
document-generator/
├── src/                          # Vue3 前端
│   ├── App.vue                   # 根组件（三栏布局）
│   ├── main.ts                   # 入口
│   ├── components/               # UI 组件
│   │   ├── AppHeader.vue         # 顶部栏（Logo、导出菜单）
│   │   ├── ImageList.vue         # 左侧图片列表
│   │   ├── PageSettings.vue      # 右侧页面设置
│   │   ├── LayoutPicker.vue      # 布局选择器
│   │   ├── LayoutThumbnail.vue   # 布局缩略图
│   │   ├── DocumentPreview.vue   # 中间文档预览
│   │   ├── PreviewToolbar.vue    # 翻页工具栏
│   │   └── PageThumbnails.vue    # 底部页面缩略图
│   ├── composables/              # 组合函数
│   │   ├── useImages.ts          # 图片状态管理
│   │   ├── usePageSettings.ts    # 页面设置
│   │   ├── useLayout.ts          # 布局计算引擎
│   │   └── useExport.ts          # PDF / Word 导出
│   ├── layouts/                  # 布局定义
│   │   ├── registry.ts           # 布局注册表
│   │   ├── fit.ts                # 缩放计算
│   │   └── layouts-{1,2,3,4,6,9}.ts
│   └── types/                    # 类型定义 + 纸张常量
├── src-tauri/                    # Tauri Rust 后端
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/             # 权限配置
│   ├── icons/                    # 应用图标
│   └── src/
│       ├── main.rs / lib.rs
│       └── commands/
│           ├── file_dialog.rs    # 文件对话框、图片读取
│           └── export_pdf.rs     # 文件写入
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

---

## 开发

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) (stable)
- [Tauri CLI v2 前置依赖](https://v2.tauri.app/start/prerequisites/)

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run tauri dev
```

启动 Vite 前端（端口 1420）+ Tauri 桌面窗口，支持热更新。

---

## 打包

### 打包命令

```bash
# 构建当前平台的安装包
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录下。

### macOS 打包

在 macOS 上直接运行：

```bash
npm run tauri build
```

产出格式：
- `.dmg` — macOS 磁盘映像安装包
- `.app` — macOS 应用程序包

产出路径：
```
src-tauri/target/release/bundle/
├── dmg/          # .dmg 安装包
└── macos/        # .app 应用
```

> **注意**：macOS 上构建需要有效的开发者签名。未签名的应用需要用户在「系统设置 → 隐私与安全性」中手动允许运行。

### Windows 打包

#### 方式一：在 Windows 上直接打包

在 Windows 机器上安装好 Node.js、Rust、[Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) 后：

```bash
npm install
npm run tauri build
```

产出格式：
- `.msi` — Windows Installer 安装包
- `.exe` — NSIS 安装程序

产出路径：
```
src-tauri/target/release/bundle/
├── msi/          # .msi 安装包
└── nsis/         # .exe 安装程序
```

#### 方式二：macOS 上交叉编译 Windows

##### 方法 A：GitHub Actions（推荐）

创建 `.github/workflows/build.yml`：

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run tauri build
      - uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: src-tauri/target/release/bundle/*/*

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run tauri build
      - uses: actions/upload-artifact@v4
        with:
          name: macos-installer
          path: src-tauri/target/release/bundle/*/*
```

推送 tag 即可自动构建：
```bash
git tag v0.1.0
git push origin v0.1.0
```

##### 方法 B：本地交叉编译

```bash
# 安装 Windows 交叉编译工具链
brew install mingw-w64

# 添加 Rust Windows 目标
rustup target add x86_64-pc-windows-gnu

# 安装依赖
npm install

# 交叉编译
npm run tauri build -- --target x86_64-pc-windows-gnu
```

> **注意**：交叉编译可能遇到链接器问题，推荐使用 GitHub Actions 在原生环境中构建。

---

## 构建产物大小参考

| 平台 | 格式 | 大约大小 |
|------|------|---------|
| macOS | .dmg | ~5-8 MB |
| Windows | .msi / .exe | ~5-8 MB |

Tauri 使用系统 WebView，无需打包浏览器引擎，所以安装包非常小。

---

## 常见问题

### Q: `npm run tauri build` 报错找不到图标？

确保 `src-tauri/icons/` 目录下有以下文件：
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns`（macOS）
- `icon.ico`（Windows）

### Q: macOS 提示"无法打开，因为无法验证开发者"？

```bash
# 移除隔离属性
xattr -cr "src-tauri/target/release/bundle/macos/Image to Document.app"
```

或在「系统设置 → 隐私与安全性」中点击「仍要打开」。

### Q: Windows 构建需要什么环境？

- Visual Studio 2022 C++ Build Tools
- Rust stable toolchain
- Node.js >= 18
