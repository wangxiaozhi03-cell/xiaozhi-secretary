import type { Component } from "vue";

/** 工具插件接口 */
export interface ToolPlugin {
  id: string;
  name: string;
  icon: string;       // SVG path data
  category: string;
  component: Component;
}

/** 工具分类 */
export interface ToolCategory {
  id: string;
  label: string;
  icon: string;       // SVG path data
}

/** 工具 Tab */
export interface ToolTab {
  id: string;          // 唯一实例 ID
  pluginId: string;    // 对应插件 ID
  title: string;
  pinned: boolean;
  state?: Record<string, unknown>;  // 工具内部状态
}

/** 工具栏操作按钮 */
export interface ToolAction {
  label: string;
  icon: string;         // icon identifier
  variant: "primary" | "default";
  action: () => void;
}

/** 持久化会话 */
export interface SavedSession {
  tabs: Array<{ pluginId: string; pinned: boolean; state?: Record<string, unknown> }>;
  activeTabId: string | null;
}
