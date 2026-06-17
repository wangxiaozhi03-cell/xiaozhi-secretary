import { ref } from "vue";
import type { ToolTab } from "./types";
import { usePluginRegistry } from "./usePluginRegistry";

const tabs = ref<ToolTab[]>([]);
const activeTabId = ref<string | null>(null);

// 每个插件的实例计数器
const instanceCounters: Record<string, number> = {};

export function useTabManager() {
  const { getPlugin } = usePluginRegistry();

  /** 新建一个工具 Tab */
  function openTab(pluginId: string): string {
    const plugin = getPlugin(pluginId);
    if (!plugin) return "";

    instanceCounters[pluginId] = (instanceCounters[pluginId] || 0) + 1;
    const count = instanceCounters[pluginId];

    const tab: ToolTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pluginId,
      title: count > 1 ? `${plugin.name} ${count}` : plugin.name,
      pinned: false,
    };
    tabs.value.push(tab);
    activeTabId.value = tab.id;
    return tab.id;
  }

  /** 关闭 Tab */
  function closeTab(tabId: string) {
    const idx = tabs.value.findIndex((t) => t.id === tabId);
    if (idx === -1) return;
    tabs.value.splice(idx, 1);
    if (activeTabId.value === tabId) {
      activeTabId.value = tabs.value[Math.min(idx, tabs.value.length - 1)]?.id ?? null;
    }
  }

  /** 关闭其它 */
  function closeOthers(tabId: string) {
    tabs.value = tabs.value.filter((t) => t.id === tabId || t.pinned);
    if (!tabs.value.find((t) => t.id === activeTabId.value)) {
      activeTabId.value = tabId;
    }
  }

  /** 关闭右侧 */
  function closeRight(tabId: string) {
    const idx = tabs.value.findIndex((t) => t.id === tabId);
    if (idx === -1) return;
    tabs.value = tabs.value.filter((t, i) => i <= idx || t.pinned);
    if (!tabs.value.find((t) => t.id === activeTabId.value)) {
      activeTabId.value = tabId;
    }
  }

  /** 切换固定 */
  function togglePin(tabId: string) {
    const tab = tabs.value.find((t) => t.id === tabId);
    if (tab) tab.pinned = !tab.pinned;
  }

  /** 切换活跃 Tab */
  function setActive(tabId: string) {
    activeTabId.value = tabId;
  }

  /** 切换到某个插件的已打开 Tab（不新建） */
  function switchToPlugin(pluginId: string): boolean {
    const tab = tabs.value.find((t) => t.pluginId === pluginId);
    if (tab) {
      activeTabId.value = tab.id;
      return true;
    }
    return false;
  }

  /** 拖拽排序 */
  function moveTab(fromIndex: number, toIndex: number) {
    const item = tabs.value.splice(fromIndex, 1)[0];
    if (item) tabs.value.splice(toIndex, 0, item);
  }

  /** 保存工具状态 */
  function saveTabState(tabId: string, state: Record<string, unknown>) {
    const tab = tabs.value.find((t) => t.id === tabId);
    if (tab) tab.state = state;
  }

  return {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    closeOthers,
    closeRight,
    togglePin,
    setActive,
    switchToPlugin,
    moveTab,
    saveTabState,
  };
}
