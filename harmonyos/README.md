# 图片排版 · 鸿蒙原生 App

基于 HarmonyOS NEXT (ArkTS + ArkUI) 的原生图片排版工具。

## 功能特性

- 📱 鸿蒙原生体验
- 🖼️ 从相册选择图片（PhotoViewPicker）
- 📐 26 种布局模板（1/2/3/4/6/9 张图片）
- 📄 支持 A4、A3、Letter 纸张大小
- 🔄 纵向/横向切换
- ✂️ 间距模式（有间距/铺满）
- 📤 导出 PDF 和 Word 文档

## 技术栈

- **框架：** HarmonyOS NEXT API 12+
- **语言：** ArkTS (TypeScript 变体)
- **UI：** ArkUI 声明式 UI
- **工具：** DevEco Studio 5.0+

## 项目结构

```
harmonyos/
├── AppScope/                      # 应用级配置
│   ├── app.json5                  # 应用包名、版本
│   └── resources/                 # 应用级资源
│
├── entry/                         # 主模块
│   ├── src/main/
│   │   ├── ets/                   # ArkTS 源码
│   │   │   ├── entryability/      # 应用入口
│   │   │   ├── pages/             # 页面
│   │   │   ├── components/        # UI 组件
│   │   │   ├── viewmodel/         # 业务逻辑
│   │   │   ├── model/             # 数据模型
│   │   │   └── utils/             # 工具函数
│   │   ├── resources/             # 资源文件
│   │   └── module.json5           # 模块配置
│   └── oh-package.json5           # 依赖配置
│
├── shared/                        # 共享逻辑（从 Web 项目复用）
│   ├── layouts/                   # 布局计算
│   └── types/                     # 类型定义
│
└── build-profile.json5            # 构建配置
```

## 开发环境准备

### 前置要求

1. **DevEco Studio** 5.0+ (2025 最新版)
2. **HarmonyOS NEXT SDK** API 12
3. **Node.js** 18.x+

### 安装步骤

1. 下载并安装 [DevEco Studio](https://developer.huawei.com/consumer/cn/deveco-studio/)
2. 安装 HarmonyOS NEXT SDK
3. 配置环境变量

## 开发和运行

### 打开项目

1. 启动 DevEco Studio
2. 选择 `File > Open`，选择 `harmonyos/` 目录
3. 等待项目同步完成

### 运行应用

1. 连接鸿蒙模拟器或真机
2. 点击 `Run > Run 'entry'` 或按 `Shift+F10`
3. 应用将安装到设备上

### 构建发布

1. 选择 `Build > Build Hap(s)/APP(s) > Build Release Hap(s)`
2. 签名配置
3. 生成 HAP 文件

## 共享代码

本项目复用了主项目的布局计算逻辑：

- `shared/layouts/registry.ts` — 26 种布局定义
- `shared/layouts/fit.ts` — 图片缩放计算
- `shared/types/` — 类型定义

## 与现有项目的关系

| 项目 | 平台 | 技术栈 | 状态 |
|------|------|--------|------|
| 桌面端 | macOS/Windows/Linux | Tauri 2 + Vue 3 | ✅ 已有 |
| 移动端 | iOS/Android | Tauri Mobile + Vue 3 | ✅ 已创建 |
| 鸿蒙端 | HarmonyOS NEXT | ArkTS + ArkUI | 🆕 本项目 |

三个项目共享核心布局逻辑，UI 各自原生实现。

## 待完成功能

- [ ] Canvas 绘制完整纸张预览
- [ ] 图片拖拽换位
- [ ] Cover 模式裁切偏移
- [ ] PDF 导出实现
- [ ] Word 导出实现
- [ ] 布局缩略图绘制
- [ ] 深色模式支持

## 参考文档

- [HarmonyOS NEXT 开发指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/)
- [ArkTS 语言规范](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts-get-started-0000001518221860)
- [ArkUI 组件参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/)
