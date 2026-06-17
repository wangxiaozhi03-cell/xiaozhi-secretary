<script setup lang="ts">
const shortcuts = [
  { category: "通用", items: [
    { key: "Ctrl + N", action: "新建文件" },
    { key: "Ctrl + O", action: "打开文件" },
    { key: "Ctrl + S", action: "保存文件" },
    { key: "Ctrl + Shift + S", action: "另存为" },
    { key: "Ctrl + ,", action: "打开设置" },
    { key: "Ctrl + Q", action: "退出应用" },
  ]},
  { category: "编辑", items: [
    { key: "Ctrl + Z", action: "撤销" },
    { key: "Ctrl + Shift + Z", action: "重做" },
    { key: "Ctrl + X", action: "剪切" },
    { key: "Ctrl + C", action: "复制" },
    { key: "Ctrl + V", action: "粘贴" },
    { key: "Ctrl + A", action: "全选" },
    { key: "Ctrl + F", action: "查找" },
    { key: "Ctrl + H", action: "替换" },
  ]},
  { category: "JSON 工具", items: [
    { key: "Ctrl + Shift + F", action: "格式化 JSON" },
    { key: "Ctrl + Shift + M", action: "压缩 JSON" },
    { key: "Ctrl + Shift + V", action: "校验 JSON" },
    { key: "Ctrl + Shift + C", action: "复制格式化结果" },
  ]},
  { category: "视图", items: [
    { key: "Ctrl + =", action: "放大" },
    { key: "Ctrl + -", action: "缩小" },
    { key: "Ctrl + 0", action: "重置缩放" },
    { key: "F11", action: "全屏" },
    { key: "Ctrl + \\", action: "切换侧边栏" },
  ]},
];
</script>

<template>
  <div class="space-y-5">
    <div v-for="group in shortcuts" :key="group.category" class="settings-card">
      <h3 class="settings-card-title">{{ group.category }}</h3>
      <div class="space-y-1">
        <div
          v-for="item in group.items"
          :key="item.key"
          class="flex items-center justify-between py-2 px-1"
        >
          <span class="text-[13px] text-secondary">{{ item.action }}</span>
          <kbd class="shortcut-key">{{ item.key }}</kbd>
        </div>
      </div>
    </div>

    <!-- 恢复默认 -->
    <div class="settings-card">
      <button class="btn w-full justify-center">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>恢复默认快捷键</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  background: rgba(238, 242, 248, 0.6);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .settings-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.settings-card-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 12px;
}

.dark .settings-card-title {
  color: rgba(255, 255, 255, 0.85);
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.dark .shortcut-key {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05);
}
</style>
