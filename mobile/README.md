# 图片排版 · Mobile App

基于 Tauri 2 的移动端图片排版工具，支持 iOS 和 Android。

## 功能特性

- 📱 原生移动端体验
- 🖼️ 从相册或文件管理器导入图片
- 📐 26 种布局模板（1/2/3/4/6/9 张图片）
- 📄 支持 A4、A3、Letter 纸张大小
- 🔄 纵向/横向切换
- ✂️ 间距模式（有间距/铺满）
- 👆 触摸优化的交互（拖拽换位、裁切偏移）
- 📤 导出 PDF 和 Word 文档

## 技术栈

- **前端：** Vue 3 + TypeScript + Tailwind CSS 4
- **桌面壳：** Tauri 2 (Rust)
- **构建工具：** Vite 6

## 项目结构

```
mobile/
├── src/                    # 前端源码
│   ├── components/         # 移动端组件
│   ├── assets/             # 样式资源
│   ├── App.vue             # 主应用组件
│   └── main.ts             # 入口文件
├── src-tauri/              # Tauri Rust 后端
│   ├── src/
│   │   ├── commands/       # Tauri 命令
│   │   ├── lib.rs          # 库入口
│   │   └── main.rs         # 应用入口
│   ├── capabilities/       # 权限配置
│   ├── icons/              # 应用图标
│   ├── Cargo.toml          # Rust 依赖
│   └── tauri.conf.json     # Tauri 配置
├── package.json            # 前端依赖
├── vite.config.ts          # Vite 配置
└── index.html              # HTML 入口
```

## 开发环境准备

### 前置要求

1. **Node.js** >= 18
2. **Rust** >= 1.70
3. **Android Studio** (Android 开发)
4. **Xcode** (iOS 开发，仅 macOS)

### 安装依赖

```bash
cd mobile
npm install
```

### 初始化 Tauri Mobile

```bash
# 初始化 Android 项目
npx tauri android init

# 初始化 iOS 项目 (仅 macOS)
npx tauri ios init
```

## 开发和运行

### 浏览器开发模式

```bash
npm run dev
```

访问 http://localhost:1421

### Android 开发

```bash
npm run tauri:android dev
```

### iOS 开发 (仅 macOS)

```bash
npm run tauri:ios dev
```

## 构建发布

### Android APK

```bash
npm run tauri:android build
```

### iOS IPA (仅 macOS)

```bash
npm run tauri:ios build
```

## 共享代码

本项目通过 Vite 路径别名复用主项目的代码：

- `@composables/*` → `../src/composables/*`
- `@layouts/*` → `../src/layouts/*`
- `@types/*` → `../src/types/*`

主要共享的模块：
- `useImages.ts` - 图片导入逻辑
- `useLayout.ts` - 布局计算和分页
- `usePageSettings.ts` - 纸张/方向/间距设置
- `useOverrides.ts` - 手动调整（拖拽换位、裁切偏移）
- `useExport.ts` - PDF/DOCX 导出
- `layouts/*` - 26 种布局定义
- `types/*` - 类型定义

## 与桌面端的关系

- 桌面端代码完全不变，零风险
- 移动端独立迭代，互不影响
- 共享核心业务逻辑，保证功能一致性

## 注意事项

1. 首次运行需要安装 Android SDK 或 Xcode
2. iOS 开发需要 Apple Developer 账号
3. 导出的文件会保存到设备的文档目录
4. 建议在真机上测试触摸交互效果
