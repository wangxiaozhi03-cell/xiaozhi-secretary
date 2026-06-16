# 小志秘书 · XiaoZhiSecretary

轻盈、治愈、高效的多功能工具集合，为你的创意工作流加速。

基于 **Tauri 2 + Vue 3 + TypeScript** 构建的跨平台桌面应用。

---

## 🧰 功能模块

### 📄 图片排版工具

多图自动排版，一键导出 PDF / Word 文档。

- 拖拽排序、批量导入图片（PNG / JPG / WEBP / BMP）
- 26 种布局模板，按每页图片数自动分组（1/2/3/4/6/9 张/页）
- 纸张：A4 / A3 / Letter，横向 / 纵向
- 间距模式：有间距（0-30mm 可调）/ 无间距铺满
- 实时文档预览 + 底部页面缩略图导航
- 单图偏移微调、每页槽位覆盖
- 导出 PDF 和 Word (DOCX)

---

### 📝 Markdown 编辑器

全功能 Markdown 写作工具，支持实时预览和导出。

- 三种视图：编辑器 / 预览 / 分屏（`⌘1` / `⌘2` / `⌘3`）
- 实时 Markdown → HTML 渲染
- 文档大纲目录（自动提取 H1-H4）
- 字数统计：字符、单词、行数、段落、代码块、图片、预计阅读时间
- 格式化工具栏
- 自动保存 + 文件打开（`⌘O`）/ 保存（`⌘S`）/ 导出 HTML
- 撤销 / 重做

---

### 🔧 JSON 工具

一站式 JSON 处理套件，四种模式。

- **处理**（`⌘1`）：格式化、校验、压缩、复制、清空
- **对比**（`⌘2`）：左右双栏 JSON Diff
- **可视化**（`⌘3`）：格式化编辑器 + 树形结构（可拖拽分割线）
- **转义**（`⌘4`）：JSON 字符串转义 / 反转义
- 12 种语法高亮主题
- 文件导入 / 导出、拖拽导入

---

### 🔐 加密工具

多算法加密解密，可视化操作。

- **算法**：AES-128、AES-256、AES-CryptoJS、RSA、SHA-256、SHA-512、Base64
- AES-CryptoJS 兼容 CryptoJS / Java 的 `Salted__` 格式
- RSA 密钥对生成（1024 / 2048 / 4096 位）
- 随机密钥 / IV 生成
- 双栏输入/输出、一键交换
- 文件导入 / 结果导出、操作历史
- `⌘Enter` 执行

---

### 🌐 Curl 重放工具

粘贴 curl → 自动解析 → 多环境切换 → 一键重放。

- 粘贴 curl 自动解析（method / URL / headers / body / query）
- **可编辑请求**：Headers 增删改、Body 支持 JSON / Form / Text 三种格式
- **多环境管理**：添加/切换环境（域名 + 端口 + 协议），一键替换请求目标
- 追加 `/api` 路径开关（自动检测已有 `/api`）
- 通过 Tauri 后端发送，**不受 CORS 限制**
- 响应展示：状态码、耗时、大小、Pretty / Raw / Headers
- 请求历史，点击恢复

---

### 🔤 命名转换

智能变量命名风格转换。

- 自动识别：camelCase / PascalCase / snake_case / kebab-case / CONSTANT_CASE
- 同时转换为全部 5 种格式
- 批量转换（每行一个变量名）
- 智能拆词、可选保留缩写（HTTP、API 等）
- 点击复制

---

### ☕ Java 代码生成器

SQL 转 Java 后端代码，自动生成全套代码。

- 输入 SQL 建表语句 → 生成 Entity / Mapper / Service / Controller
- 支持 MyBatis-Plus、Lombok、Swagger 注解

---

### ⚙️ 设置中心

- 外观主题（亮色 / 暗色）
- 编辑器偏好、JSON 工具配置
- 快捷键一览、插件管理、关于信息

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- [Rust](https://rustup.rs/) (stable)
- [Tauri CLI v2 前置依赖](https://v2.tauri.app/start/prerequisites/)

### 开发

```bash
npm install
npm run tauri dev
```

### 构建安装包

```bash
npm run tauri build
```

产物位于 `src-tauri/target/release/bundle/`：
- macOS：`.dmg` / `.app`
- Windows：`.msi` / `.exe`

---

## 📦 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Composition API |
| 样式 | Tailwind CSS 4 |
| 桌面 | Tauri 2 (Rust) |
| 构建 | Vite |
| 加密 | CryptoJS + Web Crypto API |
| HTTP | reqwest (Rust, 绕过 CORS) |
| PDF | pdf-lib |
| Word | 手写 OOXML (SimpleZip) |

---

## 📁 项目结构

```
src/
├── components/
│   ├── curl-toolkit/          # Curl 重放
│   ├── encrypt-toolkit/       # 加密工具
│   ├── java-generator/        # Java 生成
│   ├── json-toolkit/          # JSON 工具
│   ├── md-toolkit/            # Markdown 编辑器
│   ├── namecase/              # 命名转换
│   ├── settings/              # 设置中心
│   ├── App.vue                # 根组件
│   ├── HomePage.vue           # 首页
│   └── ToolboxNav.vue         # 左侧导航
├── composables/               # 业务逻辑（按模块分目录）
└── assets/                    # 全局样式

src-tauri/
├── src/commands/              # Tauri 命令（Rust）
│   ├── http_request.rs        # HTTP 请求
│   ├── export_pdf.rs          # 文件导出
│   ├── file_dialog.rs         # 文件对话框
│   └── system.rs              # 系统信息
├── Cargo.toml
└── tauri.conf.json
```

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `⌘1` - `⌘4` | 工具模式切换 |
| `⌘Enter` | 执行当前操作 |
| `⌘O` | 打开文件 |
| `⌘S` | 保存文件 |

---

## 📄 License

MIT
