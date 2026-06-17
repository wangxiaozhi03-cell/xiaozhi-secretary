import { ref, computed } from "vue";
import type { ToolPlugin, ToolCategory } from "./types";

const plugins = ref<ToolPlugin[]>([]);
const categories = ref<ToolCategory[]>([]);

export function usePluginRegistry() {
  function registerCategory(cat: ToolCategory) {
    if (!categories.value.find((c) => c.id === cat.id)) {
      categories.value.push(cat);
    }
  }

  function registerPlugin(plugin: ToolPlugin) {
    if (!plugins.value.find((p) => p.id === plugin.id)) {
      plugins.value.push(plugin);
    }
  }

  /** 获取某个分类下的工具列表 */
  function getToolsByCategory(categoryId: string) {
    return computed(() => plugins.value.filter((p) => p.category === categoryId));
  }

  /** 通过 id 查找插件 */
  function getPlugin(id: string) {
    return plugins.value.find((p) => p.id === id);
  }

  /** 所有分类及工具 */
  const categoryTree = computed(() =>
    categories.value.map((cat) => ({
      ...cat,
      tools: plugins.value.filter((p) => p.category === cat.id),
    }))
  );

  return {
    plugins,
    categories,
    categoryTree,
    registerCategory,
    registerPlugin,
    getToolsByCategory,
    getPlugin,
  };
}
