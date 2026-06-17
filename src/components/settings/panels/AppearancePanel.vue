<script setup lang="ts">
import { useTheme, type ThemeMode, type AccentColor } from "../../../composables/settings/useTheme";
import { useSettings } from "../../../composables/settings/useSettings";

const { themeMode, accentColor, setTheme, setAccentColor, ACCENT_COLORS } = useTheme();
const { settings, updateSetting } = useSettings();

const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "浅色模式", icon: "sun" },
  { value: "dark", label: "深色模式", icon: "moon" },
  { value: "system", label: "跟随系统", icon: "monitor" },
];

const accentOptions: { value: AccentColor; label: string }[] = [
  { value: "blue", label: "蓝色" },
  { value: "green", label: "绿色" },
  { value: "purple", label: "紫色" },
  { value: "orange", label: "橙色" },
  { value: "red", label: "红色" },
  { value: "graphite", label: "石墨" },
];
</script>

<template>
  <div class="space-y-5">
    <!-- 主题模式 -->
    <div class="settings-card">
      <h3 class="settings-card-title">主题模式</h3>
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="opt in themeOptions"
          :key="opt.value"
          class="theme-card flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all duration-200"
          :class="themeMode === opt.value ? 'active' : ''"
          @click="setTheme(opt.value)"
        >
          <!-- Theme icon -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="themeMode === opt.value ? 'bg-blue-500/10' : 'bg-black/[0.03] dark:bg-white/[0.05]'">
            <svg v-if="opt.icon === 'sun'" class="w-5 h-5" :class="themeMode === opt.value ? 'text-blue-500' : 'text-secondary'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else-if="opt.icon === 'moon'" class="w-5 h-5" :class="themeMode === opt.value ? 'text-blue-500' : 'text-secondary'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5" :class="themeMode === opt.value ? 'text-blue-500' : 'text-secondary'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-[12px] font-medium" :class="themeMode === opt.value ? 'text-blue-500' : 'text-secondary'">{{ opt.label }}</span>
          <!-- Check mark -->
          <svg v-if="themeMode === opt.value" class="w-4 h-4 text-blue-500 absolute top-2 right-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 主题颜色 -->
    <div class="settings-card">
      <h3 class="settings-card-title">主题颜色</h3>
      <div class="flex gap-3">
        <button
          v-for="opt in accentOptions"
          :key="opt.value"
          class="color-chip flex flex-col items-center gap-1.5"
          @click="setAccentColor(opt.value)"
        >
          <div
            class="w-10 h-10 rounded-full transition-all duration-200 relative"
            :style="{ background: ACCENT_COLORS[opt.value].primary }"
            :class="accentColor === opt.value ? 'ring-2 ring-offset-2 scale-110' : ''"
            :ring-color="ACCENT_COLORS[opt.value].primary"
          >
            <svg v-if="accentColor === opt.value" class="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="text-[11px] text-tertiary">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <!-- 字体大小 -->
    <div class="settings-card">
      <h3 class="settings-card-title">字体大小</h3>
      <div class="flex items-center gap-4">
        <span class="text-[12px] text-tertiary w-6">A</span>
        <input
          type="range"
          :value="settings.fontSize"
          min="12"
          max="18"
          step="1"
          class="flex-1"
          @input="updateSetting('fontSize', Number(($event.target as HTMLInputElement).value))"
        />
        <span class="text-[12px] text-tertiary w-8 text-right">{{ settings.fontSize }}px</span>
      </div>
    </div>

    <!-- 圆角大小 -->
    <div class="settings-card">
      <h3 class="settings-card-title">圆角大小</h3>
      <div class="flex items-center gap-4">
        <div class="w-6 h-6 border-2 border-current text-tertiary" :style="{ borderRadius: settings.borderRadius + 'px' }" />
        <input
          type="range"
          :value="settings.borderRadius"
          min="0"
          max="24"
          step="2"
          class="flex-1"
          @input="updateSetting('borderRadius', Number(($event.target as HTMLInputElement).value))"
        />
        <span class="text-[12px] text-tertiary w-8 text-right">{{ settings.borderRadius }}px</span>
      </div>
    </div>

    <!-- 动画开关 -->
    <div class="settings-card flex items-center justify-between">
      <div>
        <h3 class="settings-card-title mb-0">动画效果</h3>
        <p class="text-[12px] text-tertiary mt-0.5">启用界面过渡动画</p>
      </div>
      <button
        class="settings-switch"
        :class="settings.animationEnabled ? 'active' : ''"
        @click="updateSetting('animationEnabled', !settings.animationEnabled)"
      >
        <span class="settings-switch-thumb" />
      </button>
    </div>

    <!-- 预览区域 -->
    <div class="settings-card">
      <h3 class="settings-card-title">实时预览</h3>
      <div class="preview-area rounded-xl p-4 space-y-3">
        <!-- Toolbar preview -->
        <div class="flex items-center gap-2">
          <div class="h-6 w-16 rounded-lg bg-black/[0.05] dark:bg-white/[0.08]" />
          <div class="h-6 w-24 rounded-lg bg-black/[0.05] dark:bg-white/[0.08]" />
          <div class="flex-1" />
          <div class="h-6 w-6 rounded-lg bg-black/[0.05] dark:bg-white/[0.08]" />
        </div>
        <!-- Content preview -->
        <div class="flex gap-3">
          <div class="w-20 h-28 rounded-xl bg-black/[0.03] dark:bg-white/[0.05]" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-3/4 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div class="h-4 w-1/2 rounded bg-black/[0.04] dark:bg-white/[0.06]" />
            <div class="h-4 w-2/3 rounded bg-black/[0.05] dark:bg-white/[0.07]" />
          </div>
        </div>
        <!-- Button preview -->
        <div class="flex gap-2">
          <div class="btn text-[11px] !py-1.5 !px-3">默认按钮</div>
          <div class="btn-primary text-[11px] !py-1.5 !px-3">主要按钮</div>
        </div>
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

.theme-card {
  background: rgba(0, 0, 0, 0.02);
  border: 2px solid transparent;
  position: relative;
  cursor: pointer;
}

.theme-card:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .theme-card {
  background: rgba(255, 255, 255, 0.03);
}

.dark .theme-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

.theme-card.active {
  background: #EFF6FF;
  border-color: #3B82F6;
}

.dark .theme-card.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: #60A5FA;
}

.color-chip {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-chip:hover {
  transform: scale(1.05);
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

.preview-area {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .preview-area {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.06);
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
