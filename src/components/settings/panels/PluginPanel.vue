<script setup lang="ts">
const plugins = [
  { id: "json-formatter", name: "JSON 格式化", version: "1.0.0", enabled: true, description: "格式化和校验 JSON 数据" },
  { id: "json-converter", name: "JSON 转换", version: "1.0.0", enabled: true, description: "JSON 与 YAML、XML 等格式互转" },
  { id: "json-diff", name: "JSON 对比", version: "0.9.0", enabled: false, description: "对比两个 JSON 的差异" },
  { id: "json-path", name: "JSON Path 查询", version: "0.8.0", enabled: false, description: "使用 JSONPath 提取数据" },
];

function togglePlugin(plugin: typeof plugins[0]) {
  plugin.enabled = !plugin.enabled;
}
</script>

<template>
  <div class="space-y-5">
    <!-- 插件列表 -->
    <div class="settings-card">
      <h3 class="settings-card-title">已安装插件</h3>
      <div class="space-y-3">
        <div
          v-for="plugin in plugins"
          :key="plugin.id"
          class="plugin-item flex items-center justify-between p-3 rounded-xl transition-all duration-200"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L4.939 4.939m7.061 7.061l-2.879-2.879M12 12l2.879-2.879" />
              </svg>
            </div>
            <div>
              <div class="text-[13px] font-medium text-primary">{{ plugin.name }}</div>
              <div class="text-[11px] text-tertiary">{{ plugin.description }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[11px] text-tertiary">v{{ plugin.version }}</span>
            <button
              class="settings-switch"
              :class="plugin.enabled ? 'active' : ''"
              @click="togglePlugin(plugin)"
            >
              <span class="settings-switch-thumb" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 插件市场 -->
    <div class="settings-card">
      <h3 class="settings-card-title">插件市场</h3>
      <div class="text-center py-6">
        <svg class="w-12 h-12 mx-auto text-tertiary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="text-[13px] text-secondary mb-1">插件市场即将上线</p>
        <p class="text-[11px] text-tertiary">敬请期待更多实用插件</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  background: rgba(255, 255, 255, 0.6);
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

.plugin-item {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.plugin-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .plugin-item {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.04);
}

.dark .plugin-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.settings-switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
  padding: 2px;
  flex-shrink: 0;
}

.dark .settings-switch {
  background: rgba(255, 255, 255, 0.1);
}

.settings-switch.active {
  background: #3B82F6;
}

.settings-switch-thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.settings-switch.active .settings-switch-thumb {
  transform: translateX(20px);
}
</style>
