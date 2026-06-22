# Json-Assistant 功能分析 & 集成方案

> 更新日期：2026-06-18

## 一、Json-Assistant 项目概述

| 项目 | 信息 |
|------|------|
| **项目地址** | https://github.com/MemoryZy/Json-Assistant |
| **文档地址** | https://json.memoryzy.cn/overview |
| **定位** | 基于 IntelliJ IDEs 的 JSON 工具插件 |
| **技术栈** | Java / Kotlin, IntelliJ Platform Plugin SDK |
| **Star** | 116+ |
| **License** | MIT |
| **描述** | 让 JSON 处理变得更轻松的 IDE 插件 |

---

## 二、Json-Assistant 完整功能清单（共 7 大类 30+ 功能）

### 1. JSON 窗口（独立工具窗口）

| 功能 | 说明 |
|------|------|
| 多选项卡 | 同时记录和处理不同的 JSON 数据 |
| 新窗口打开 | 在 IDE 新窗口中处理 JSON，不受原窗口限制 (`Ctrl+Alt+M`) |
| JSONPath 查询 | 使用 JSONPath 语法提取 JSON 数据 (`Alt+Q`) |
| JMESPath 查询 | 使用 JMESPath 语法查询 JSON 数据 |
| 历史记录 | 手动保存 (`Ctrl+S`)，支持目录视图/列表视图查看 (`Alt+H`) |
| 剪贴板自动检测 | 自动识别剪贴板中 XML/YAML/TOML/URL Param 并转 JSON |
| 剪贴板黑名单 | 管理不自动监听的剪贴板内容 (`Alt+L`) |
| 导入前询问 | 弹窗确认是否导入剪贴板数据 |
| 软换行切换 | 编辑器软换行开关 |
| 保存到磁盘 | 将当前 JSON 保存为文件 |

### 2. JSON 处理

| 功能 | 说明 | 快捷键 |
|------|------|--------|
| 美化（Beautify） | 将压缩 JSON 格式化为易读结构，支持 JSON5 | `Alt+K` |
| 压缩（Minify） | 将格式化 JSON 压缩为单行 | `Alt+K` |
| 树视图（Tree View） | 以树形结构可视化 JSON，支持注释解析、文本检索 | `Alt+K` |
| 表格视图（Grid View） | 以表格形式展示 JSON 数据 | — |
| 比较（Diff） | 两个 JSON 的差异对比，支持优化排序、重命名标题 | `Alt+K` |
| 转义（Escape） | JSON 字符串转义/反转义，默认复制结果到剪贴板 | `Alt+K` |

### 3. JSON5 完整支持

| 功能 | 说明 |
|------|------|
| JSON5 解析 | 完整解析 JSON5 规范（注释、尾逗号、单引号等） |
| JSON5 美化 | 支持 JSON5 语法的格式化输出 |
| JSON5 注释保留 | 序列化和反序列化过程中保留注释 |

### 4. 序列化 / 代码生成

| 功能 | 说明 | 快捷键 |
|------|------|--------|
| JavaBean → JSON | 将 Java Bean 对象转换为 JSON | `Alt+N` |
| JavaBean → JSON5（含注释） | 将 Java Bean 转为带注释的 JSON5 | `Alt+L` |
| 运行时对象 → JSON | Debug 模式下将运行时对象转为 JSON | — |
| 运行时对象 → JSON5 | Debug 模式下转为带注释的 JSON5 | — |
| JSON → JavaBean | 根据 JSON 生成 Java 实体类 | — |
| JSON5 → JavaBean | 根据 JSON5 生成带注释的 Java 实体类 | — |
| Kotlin 属性 → JSON | 将 Kotlin data class 转为 JSON | `Alt+N` |
| 提取 Java 常量 → JSON | 从 Java 常量定义中提取 JSON | — |
| 部分字段序列化 | 按需选择字段进行序列化 | — |

**注解支持：**

| 注解库 | 支持项 |
|--------|--------|
| FastJSON / FastJSON2 | `@JSONField(serialize, name, format, defaultValue)` |
| Jackson | `@JsonProperty`, `@JsonFormat`, `@JsonIgnore` |
| Lombok | `@Data`, `@Accessors`, `@Getter`, `@Setter` |
| Swagger | `@ApiModelProperty`, `@Schema` (v3) |
| Java 关键字 | `transient`（不参与序列化） |
| Kotlin | `@Transient`（Kotlin 不参与序列化） |

### 5. 格式转换

| 转换方向 | 格式 | 快捷键 |
|---------|------|--------|
| JSON → 其他 | XML, YAML, TOML, Properties, URL Params | `Alt+K` |
| 其他 → JSON | XML, YAML, TOML, Properties, URL Params | `Alt+P` |
| 剪贴板自动识别 | XML, YAML, TOML, URL Params → JSON | 自动 |

### 6. 扩展工具

| 功能 | 说明 |
|------|------|
| 时间戳 → 时间 | 自动识别时间戳（秒/毫秒），转为可读日期格式 |
| 时间 → 时间戳 | 将时间格式字符串转为时间戳 |
| 展开嵌套 JSON | 将嵌套的 JSON 字符串字段解析为对象（单个/全局） |
| JSON 注释补全 | 自动为 JSON 字段补全注释 |

### 7. 树视图操作

| 功能 | 说明 |
|------|------|
| 展开/折叠全部 | 一键展开或折叠所有节点 |
| 多级展开/折叠 | 展开/折叠指定层级 |
| 复制 Key | 复制节点的键名 |
| 复制 Value | 复制节点的值 |
| 复制 Key-Value | 复制键值对 |
| 复制节点路径 | 复制节点的完整 JSONPath 路径 |
| 复制节点注释 | 复制节点的注释信息 |
| 显示节点路径 | 显示当前节点的路径 |
| 删除节点 | 删除树中的某个节点 |
| 优化排序 | 对节点进行排序 |
| 刷新结构 | 刷新树视图 |
| 结构对比 | 对比两个 JSON 的结构差异 |
| 重命名对比标题 | 自定义对比面板的标题 |
| 树视图展示方式 | 弹出对话框 / 原工具窗口 / 新工具窗口 |

---

## 三、小志秘书现有 JSON 工具功能对照

| 功能 | 状态 | 现有实现 | 备注 |
|------|------|----------|------|
| 美化（Beautify） | ✅ 已有 | `BeautifyTool.vue` | — |
| 压缩（Minify） | ✅ 已有 | `BeautifyTool.vue` | — |
| 转义（Escape） | ✅ 已有 | `EscapeTool.vue` | — |
| 树视图（Tree View） | ✅ 已有 | `TreePanel.vue` | — |
| 差异对比（Diff） | ✅ 已有 | `DiffPanel.vue` | — |
| 文件导入/导出 | ✅ 已有 | Tauri 文件对话框 | — |
| 拖拽导入 | ✅ 已有 | 拖拽文件到窗口 | — |
| JSON 状态检测 | ✅ 已有 | 实时检测 valid/invalid | — |
| 快捷键切换 | ✅ 已有 | Cmd/Ctrl+1~4 | — |
| JSON5 支持 | ❌ 缺失 | — | 需要 json5 库 |
| JSONPath 查询 | ❌ 缺失 | — | 需要 jsonpath-plus |
| JMESPath 查询 | ❌ 缺失 | — | 需要 jmespath |
| 表格视图（Grid View） | ❌ 缺失 | — | 纯前端实现 |
| 历史记录 | ❌ 缺失 | — | localStorage/Tauri Store |
| 格式转换（XML/YAML/TOML等） | ❌ 缺失 | — | 需要 fast-xml-parser, js-yaml, smol-toml |
| JavaBean 序列化/反序列化 | ❌ 缺失 | — | 可复用 java-generator 模块 |
| 时间戳转换 | ❌ 缺失 | — | 纯前端实现 |
| 嵌套 JSON 解析 | ❌ 缺失 | — | 纯前端实现 |
| JSON 注释补全 | ❌ 缺失 | — | 需自定义逻辑 |
| 树节点操作（复制路径/删除等） | ❌ 缺失 | — | 增强 TreePanel.vue |
| 剪贴板自动检测 | ❌ 缺失 | — | Tauri clipboard API |

---

## 四、推荐集成方案

按 **优先级** 和 **实现难度** 分为三个阶段：

### 阶段一：高价值、低难度（核心增强）

| # | 功能 | 依赖 | 实现方式 | UI 方案 |
|---|------|------|----------|--------|
| 1 | JSONPath / JMESPath 查询 | `jsonpath-plus`, `jmespath` | 处理模式下新增查询输入框，实时高亮匹配 | BeautifyTool 顶部增加查询栏 |
| 2 | 表格视图（Grid View） | 无 | JSON 对象以 key-value 表格展示，数组以索引为行号 | 新增 `GridPanel.vue` |
| 3 | 历史记录 | 无 | localStorage 存储最近 50 条 JSON | 顶部工具栏增加历史按钮 |
| 4 | 嵌套 JSON 解析 | 无 | 递归检测字符串值中的 JSON，自动解析为对象 | 「处理」模式下操作按钮 |

### 阶段二：中等价值、中等难度

| # | 功能 | 依赖 | 实现方式 | UI 方案 |
|---|------|------|----------|--------|
| 5 | 格式转换 | `fast-xml-parser`, `js-yaml`, `smol-toml` | 新增「转换」子面板，JSON ↔ 各格式互转 | 新增「转换」Tab |
| 6 | 时间戳转换 | 无 | 检测 JSON 数字字段，识别时间戳并显示可读日期 | 扩展工具按钮 |
| 7 | 树节点增强操作 | 无 | 右键菜单：复制路径/Key/Value、删除节点 | TreePanel 右键上下文菜单 |
| 8 | 剪贴板自动检测 | Tauri clipboard API | 检测剪贴板内容格式并自动转换 | 自动触发 + 黑名单管理 |

### 阶段三：高级功能（按需）

| # | 功能 | 依赖 | 实现方式 |
|---|------|------|----------|
| 9 | JSON5 支持 | `json5` | 替换 `JSON.parse` 为 `JSON5.parse`，美化器支持 JSON5 |
| 10 | JavaBean 序列化/反序列化 | — | 复用 `java-generator` 模块，JSON → Java/Kotlin 代码生成 |
| 11 | JSON 注释补全 | 自定义 | 基于字段名智能推断注释内容 |

---

## 五、依赖库清单

```json
{
  "jsonpath-plus": "^10.x",      // JSONPath 查询
  "jmespath": "^0.16.x",         // JMESPath 查询
  "json5": "^2.x",               // JSON5 解析与格式化
  "fast-xml-parser": "^4.x",     // XML 解析/生成
  "js-yaml": "^4.x",             // YAML 解析/生成
  "smol-toml": "^1.x"            // TOML 解析/生成
}
```

安装命令：
```bash
npm install jsonpath-plus jmespath json5 fast-xml-parser js-yaml smol-toml
```

---

## 六、新增文件结构规划

```
src/components/json-toolkit/
├── JsonToolkit.vue              (修改 - 增加「转换」「表格」Tab)
├── tools/
│   ├── BeautifyTool.vue         (已有 - 增加查询栏)
│   ├── EscapeTool.vue           (已有)
│   ├── ConvertTool.vue          (新增 - 格式转换：XML/YAML/TOML/Properties/URL)
│   └── TimestampTool.vue        (新增 - 时间戳转换)
├── panels/
│   ├── TreePanel.vue            (已有 - 增强右键菜单)
│   ├── DiffPanel.vue            (已有)
│   ├── GridPanel.vue            (新增 - 表格视图)
│   └── HistoryPanel.vue         (新增 - 历史记录面板)
└── shared/
    ├── JsonQueryBar.vue         (新增 - JSONPath/JMESPath 查询输入栏)
    └── ContextMenu.vue          (新增 - 树视图右键菜单组件)

src/composables/json-toolkit/
├── types.ts                     (已有 - 扩展类型定义)
├── usePluginRegistry.ts         (已有)
├── useTabManager.ts             (已有)
├── useJsonQuery.ts              (新增 - JSONPath/JMESPath 查询逻辑)
├── useJsonConvert.ts            (新增 - 格式转换逻辑)
├── useJsonHistory.ts            (新增 - 历史记录管理)
├── useTimestamp.ts              (新增 - 时间戳转换逻辑)
└── useNestedJson.ts             (新增 - 嵌套 JSON 解析逻辑)
```

---

## 七、功能实现优先级矩阵

```
                    高价值
                      │
     ① JSONPath 查询  │  ⑤ 格式转换
     ② 表格视图        │  ⑨ JSON5 支持
     ③ 历史记录        │  ⑩ Java 代码生成
                      │
   低难度 ────────────┼──────────── 高难度
                      │
     ④ 嵌套 JSON 解析 │  ⑧ 剪贴板检测
     ⑥ 时间戳转换     │  ⑪ 注释补全
     ⑦ 树节点增强     │
                      │
                    低价值
```

---

## 八、实施建议

1. **先做阶段一**：4 个功能都是纯前端实现，无需额外后端，预计 2-3 天可完成
2. **格式转换优先做 YAML/XML**：这两个是开发中最常用的格式
3. **JSON5 建议尽早集成**：作为底层解析库的升级，越早引入影响越小
4. **JavaBean 功能复用**：项目中已有 `java-generator` 模块，可在其基础上扩展 JSON → Java 代码生成
