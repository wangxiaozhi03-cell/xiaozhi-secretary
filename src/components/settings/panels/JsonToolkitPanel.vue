<script setup lang="ts">
import { useSettings } from "../../../composables/settings/useSettings";

const { settings, updateSetting } = useSettings();

const indentOptions = [2, 4, 8];
</script>

<template>
  <div class="space-y-5">
    <!-- 默认缩进 -->
    <div class="settings-card">
      <h3 class="settings-card-title">默认缩进</h3>
      <div class="flex gap-2">
        <button
          v-for="size in indentOptions"
          :key="size"
          class="flex-1 py-2 rounded-xl text-[13px] font-medium transition-all duration-200"
          :class="settings.jsonIndent === size ? 'btn-primary' : 'btn'"
          @click="updateSetting('jsonIndent', size)"
        >
          {{ size }} 空格
        </button>
      </div>
    </div>

    <!-- 开关选项 -->
    <div class="settings-card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="settings-card-title mb-0">自动格式化</h3>
          <p class="text-[12px] text-tertiary mt-0.5">粘贴时自动格式化 JSON</p>
        </div>
        <button
          class="settings-switch"
          :class="settings.jsonAutoFormat ? 'active' : ''"
          @click="updateSetting('jsonAutoFormat', !settings.jsonAutoFormat)"
        >
          <span class="settings-switch-thumb" />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h3 class="settings-card-title mb-0">自动排序 Key</h3>
          <p class="text-[12px] text-tertiary mt-0.5">格式化时按字母顺序排列键名</p>
        </div>
        <button
          class="settings-switch"
          :class="settings.jsonSortKeys ? 'active' : ''"
          @click="updateSetting('jsonSortKeys', !settings.jsonSortKeys)"
        >
          <span class="settings-switch-thumb" />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h3 class="settings-card-title mb-0">自动校验</h3>
          <p class="text-[12px] text-tertiary mt-0.5">输入时实时校验 JSON 格式</p>
        </div>
        <button
          class="settings-switch"
          :class="settings.jsonAutoValidate ? 'active' : ''"
          @click="updateSetting('jsonAutoValidate', !settings.jsonAutoValidate)"
        >
          <span class="settings-switch-thumb" />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h3 class="settings-card-title mb-0">支持 JSON5</h3>
          <p class="text-[12px] text-tertiary mt-0.5">解析 JSON5 格式（支持注释、尾逗号等）</p>
        </div>
        <button
          class="settings-switch"
          :class="settings.jsonParseJson5 ? 'active' : ''"
          @click="updateSetting('jsonParseJson5', !settings.jsonParseJson5)"
        >
          <span class="settings-switch-thumb" />
        </button>
      </div>
    </div>

    <!-- 预览 -->
    <div class="settings-card">
      <h3 class="settings-card-title">格式化预览</h3>
      <div class="preview-code rounded-xl p-4 text-[12px] font-mono leading-relaxed overflow-x-auto">
        <pre class="text-secondary">{`{
  "name": "小志秘书",
  "version": "1.0.0",
  "features": [
    "JSON 格式化",
    "JSON 校验",
    "JSON 转换"
  ],
  "settings": {
    "indent": ${settings.jsonIndent},
    "sortKeys": ${settings.jsonSortKeys}
  }
}`}</pre>
      </div>
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
  background: rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.settings-switch.active .settings-switch-thumb {
  transform: translateX(20px);
}

.preview-code {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.dark .preview-code {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
