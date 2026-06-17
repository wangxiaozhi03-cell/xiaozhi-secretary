<script setup lang="ts">
const emit = defineEmits<{
  format: [before: string, after?: string];
}>();

interface ToolbarItem {
  label: string;
  icon: string;
  before: string;
  after?: string;
  divider?: boolean;
}

const items: ToolbarItem[] = [
  { label: "粗体", icon: "M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z", before: "**", after: "**" },
  { label: "斜体", icon: "M10 4h4m-2 0v16m-4 0h8", before: "*", after: "*" },
  { label: "删除线", icon: "M4 12h16M7 8l-3 8M17 8l3 8M8 16h8", before: "~~", after: "~~", divider: true },
  { label: "一级标题", icon: "M4 5h2m0 0v10m0-10h2M14 5h6M14 5v10M20 15h-6M18 5v10", before: "# " },
  { label: "二级标题", icon: "M4 5h2m0 0v10m0-10h2M14 5h5m-5 4h5m-5 4h5m2-8v8", before: "## " },
  { label: "三级标题", icon: "M4 5h2m0 0v10m0-10h2M14 5h4m-4 4h4m-4 4h4m2-8v8", before: "### ", divider: true },
  { label: "引用", icon: "M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z", before: "> " },
  { label: "无序列表", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", before: "- " },
  { label: "有序列表", icon: "M10 6h11M10 12h11M10 18h11M3 5v2h3M3 10v1a1 1 0 001 1H5a1 1 0 001-1v-1a1 1 0 00-1-1H3zm0 7v2h3", before: "1. ", divider: true },
  { label: "代码块", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", before: "```\n", after: "\n```" },
  { label: "行内代码", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", before: "`", after: "`" },
  { label: "链接", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", before: "[", after: "](url)", divider: true },
  { label: "图片", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", before: "![", after: "](url)" },
  { label: "表格", icon: "M3 10h18M3 14h18M10 3v18M14 3v18M3 3h18v18H3z", before: "| 列1 | 列2 | 列3 |\n|------|------|------|\n| 内容 | 内容 | 内容 |\n" },
  { label: "分割线", icon: "M3 12h18", before: "\n---\n" },
];
</script>

<template>
  <div class="flex-shrink-0 px-3 py-1.5 border-b border-black/[0.04] dark:border-white/[0.06] overflow-x-auto">
    <div class="flex items-center gap-0.5">
      <template v-for="(item, index) in items" :key="index">
        <!-- 分隔线 -->
        <div v-if="item.divider" class="w-px h-5 bg-black/[0.08] dark:bg-white/[0.08] mx-1" />

        <!-- 格式化按钮 -->
        <button
          class="p-1.5 rounded-lg transition-all duration-150 text-tertiary hover:text-primary hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          :title="item.label"
          @click="emit('format', item.before, item.after)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
          </svg>
        </button>
      </template>
    </div>
  </div>
</template>
