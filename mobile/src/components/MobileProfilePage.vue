<script setup lang="ts">
import { useThemeStyle, type ThemeMode } from "../composables/useThemeStyle";

const {
  currentThemeStyle,
  themeMode,
  setThemeStyle,
  setThemeMode,
  THEME_STYLES,
} = useThemeStyle();

// 主题模式选项
const themeModeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: '浅色', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
  { value: 'dark', label: '深色', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
  { value: 'system', label: '跟随系统', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

// 主题风格列表
const themes = Object.values(THEME_STYLES);
</script>

<template>
  <div class="h-full overflow-y-auto pb-4">
    <!-- 头部 -->
    <div class="px-5 pt-6 pb-4">
      <h1 class="text-2xl font-bold text-primary mb-1">我的</h1>
      <p class="text-sm text-tertiary">个人设置</p>
    </div>

    <!-- 设置列表 -->
    <div class="px-5 space-y-4">
      <!-- 主题风格 -->
      <div>
        <h2 class="text-xs font-semibold text-tertiary uppercase tracking-wider mb-3 px-1">主题风格</h2>
        <div class="glass-panel p-4">
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="theme in themes"
              :key="theme.id"
              class="p-3 rounded-xl transition-all duration-200"
              :class="currentThemeStyle === theme.id
                ? 'ring-2 ring-offset-1'
                : 'hover:bg-black/[0.02]'"
              :style="currentThemeStyle === theme.id ? { '--tw-ring-color': theme.accent } : {}"
              @click="setThemeStyle(theme.id)"
            >
              <!-- 色卡预览 -->
              <div class="flex gap-0.5 mb-2 justify-center">
                <div
                  v-for="(color, ci) in theme.preview"
                  :key="ci"
                  class="w-4 h-4 rounded-full shadow-sm"
                  :style="{ background: color }"
                />
              </div>
              <div
                class="text-xs font-medium text-center"
                :style="{ color: currentThemeStyle === theme.id ? theme.accent : '#6B7280' }"
              >
                {{ theme.label }}
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 主题模式 -->
      <div>
        <h2 class="text-xs font-semibold text-tertiary uppercase tracking-wider mb-3 px-1">主题模式</h2>
        <div class="glass-panel p-4">
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="opt in themeModeOptions"
              :key="opt.value"
              class="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
              :class="themeMode === opt.value
                ? 'bg-blue-50 ring-2 ring-blue-500'
                : 'bg-gray-50 hover:bg-gray-100'"
              @click="setThemeMode(opt.value)"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="themeMode === opt.value ? 'bg-blue-100' : 'bg-gray-100'"
              >
                <svg
                  class="w-5 h-5"
                  :class="themeMode === opt.value ? 'text-blue-500' : 'text-gray-400'"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="opt.icon" />
                </svg>
              </div>
              <span
                class="text-xs font-medium"
                :class="themeMode === opt.value ? 'text-blue-500' : 'text-gray-500'"
              >
                {{ opt.label }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div>
        <h2 class="text-xs font-semibold text-tertiary uppercase tracking-wider mb-3 px-1">关于</h2>
        <div class="glass-panel overflow-hidden">
          <div class="px-4 py-3 flex items-center justify-between border-b border-black/5">
            <div class="text-sm font-medium text-primary">版本</div>
            <div class="text-sm text-tertiary">1.0.0</div>
          </div>
          <div class="px-4 py-3 flex items-center justify-between border-b border-black/5">
            <div class="text-sm font-medium text-primary">开发者</div>
            <div class="text-sm text-tertiary">小志秘书</div>
          </div>
          <div class="px-4 py-3 flex items-center justify-between">
            <div class="text-sm font-medium text-primary">描述</div>
            <div class="text-sm text-tertiary">轻盈、治愈、高效的图片排版工具</div>
          </div>
        </div>
      </div>

      <!-- 底部留白 -->
      <div class="pb-20" />
    </div>
  </div>
</template>
