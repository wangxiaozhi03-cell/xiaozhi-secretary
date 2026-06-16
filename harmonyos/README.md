# 图片工具 - 鸿蒙版 (HarmonyOS)

从现有 Tauri 桌面应用移植的图片布局文档生成工具，使用 ArkTS 原生开发。

## 功能特性

- **图片导入**：通过系统图片选择器选择多张图片
- **布局系统**：支持 1/2/3/4/6/9 张图片的多种预设布局
- **页面设置**：纸张大小 (A4/A3/Letter)、方向、间距模式
- **实时预览**：Canvas 渲染文档页面效果
- **导出**：PDF / Word 文档导出

## 项目结构

```
harmonyos/
├── entry/src/main/
│   ├── ets/
│   │   ├── entryability/EntryAbility.ets    # 应用入口
│   │   ├── pages/Index.ets                  # 主页面
│   │   ├── model/
│   │   │   ├── Types.ets                    # 核心类型定义
│   │   │   └── Papers.ets                   # 纸张尺寸
│   │   ├── layouts/
│   │   │   ├── LayoutRegistry.ets           # 布局注册表
│   │   │   ├── LayoutFit.ets                # 适配计算
│   │   │   ├── Layouts1~9.ets               # 布局定义
│   │   │   └── index.ets
│   │   ├── viewmodel/
│   │   │   ├── ImageManager.ets             # 图片管理
│   │   │   ├── LayoutEngine.ets             # 布局引擎
│   │   │   ├── OverrideManager.ets          # 覆盖管理
│   │   │   └── ExportService.ets            # 导出服务
│   │   ├── components/
│   │   │   ├── ImageListPanel.ets           # 图片列表
│   │   │   ├── DocumentPreviewPanel.ets     # 文档预览
│   │   │   ├── PageThumbnailsBar.ets        # 缩略图条
│   │   │   ├── PageSettingsPanel.ets        # 页面设置
│   │   │   ├── LayoutPickerPanel.ets        # 布局选择
│   │   │   └── ExportPanel.ets              # 导出按钮
│   │   └── utils/
│   │       └── SimpleZip.ets                # ZIP 生成器
│   └── resources/
└── build-profile.json5
```

## 开发环境

- **DevEco Studio**: 5.0+
- **HarmonyOS SDK**: API 12+
- **设备**: 手机 / 平板

## 如何使用

1. 用 DevEco Studio 打开 `harmonyos/` 目录
2. 等待同步完成
3. 连接设备或启动模拟器
4. 点击 Run 运行

## 与现有项目的关系

本目录是独立的鸿蒙项目，**不影响**项目根目录的 Tauri 桌面应用。两者共享相同的设计理念和布局算法，但使用不同的技术栈：

| 维度 | Tauri 版 | 鸿蒙版 |
|------|---------|--------|
| 前端 | Vue 3 + TypeScript | ArkTS |
| 后端 | Rust (Tauri) | 原生 API |
| 构建 | Vite + Cargo | Hvigor |
| 平台 | Windows/macOS/Linux | HarmonyOS |

## 待完成功能

- [ ] PDF 导出完整实现
- [ ] Word 导出完整实现
- [ ] 拖拽交互（swap/pan/resize）
- [ ] 折叠屏适配
- [ ] 深色模式
