<script setup lang="ts">
import { useSettings } from "../../../composables/settings/useSettings";

const { settings, updateSetting } = useSettings();

const fontOptions = [
  { value: "HarmonyOS Sans", label: "HarmonyOS Sans" },
  { value: "SF Pro Display", label: "SF Pro Display" },
  { value: "PingFang SC", label: "PingFang SC" },
  { value: "Menlo", label: "Menlo" },
  { value: "Fira Code", label: "Fira Code" },
];

const tabSizeOptions = [2, 4, 8];
</script>

<template>
  <div class="space-y-5">
    <!-- 字体 -->
    <div class="settings-card">
      <h3 class="settings-card-title">编辑器字体</h3>
      <select
        :value="settings.editorFont"
        class="settings-select w-full"
        @change="updateSetting('editorFont', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="font in fontOptions" :key="font.value" :value="font.value">
          {{ font.label }}
        </option>
      </select>
    </div>

    <!-- 字号 -->
    <div class="settings-card">
      <h3 class="settings-card-title">编辑器字号</h3>
      <div class="flex items-center gap-4">
        <span class="text-[12px] text-tertiary w-6">A</span>
        <input
          type="range"
          :value="settings.editorFontSize"
          min="12"
          max="20"
          step="1"
          class="flex-1"
          @input="updateSetting('editorFontSize', Number(($event.target as HTMLInputElement).value))"
        />
        <span class="text-[12px] text-tertiary w-10 text-right">{{ settings.editorFontSize }}px</span>
      </div>
    </div>

    <!-- Tab 大小 -->
    <div class="settings-card">
      <h3 class="settings-card-title">Tab 大小</h3>
      <div class="flex gap-2">
        <button
          v-for="size in tabSizeOptions"
          :key="size"
          class="flex-1 py-2 rounded-xl text-[13px] font-medium transition-all duration-200"
          :class="settings.tabSize === size ? 'btn-primary' : 'btn'"
          @click="updateSetting('tabSize', size)"
        >
          {{ size }} 空格
        </button>
      </div>
    </div>

    <!-- 开关选项 -->
    <div class="settings-card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="settings-card-title mb-0">自动换行</h3>
          <p class="text-[12px] text-tertiary mt-0.5">超过视图宽度时自动换行</p>
        </div>
        <button
          class="settings-switch"
          :class="settings.wordWrap ? 'active' : ''"
          @click="updateSetting('wordWrap', !settings.wordWrap)"
        >
          <span class="settings-switch-thumb" />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h3 class="settings-card-title mb-0">显示行号</h3>
          <p class="text-[12px] text-tertiary mt-0.5">在编辑器左侧显示行号</p>
        </div>
        <button
          class="settings-switch"
          :class="settings.showLineNumbers ? 'active' : ''"
          @click="updateSetting('showLineNumbers', !settings.showLineNumbers)"
        >
          <span class="settings-switch-thumb" />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h3 class="settings-card-title mb-0">自动保存</h3>
          <p class="text-[12px] text-tertiary mt-0.5">修改后自动保存文件</p>
        </div>
        <button
          class="settings-switch"
          :class="settings.autoSave ? 'active' : ''"
          @click="updateSetting('autoSave', !settings.autoSave)"
        >
          <span class="settings-switch-thumb" />
        </button>
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

.settings-select {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.75);
  outline: none;
  transition: all 0.2s ease;
}

.settings-select:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .settings-select {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
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
  background: #F0F4F8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.settings-switch.active .settings-switch-thumb {
  transform: translateX(20px);
}

input[type="range"] {
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.dark input[type="range"] {
  background: rgba(255, 255, 255, 0.1);
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #F0F4F8;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.dark input[type="range"]::-webkit-slider-thumb {
  background: #2A3545;
}
</style>
