<script setup lang="ts">
import { ref, computed } from "vue";
import { useTheme, type ThemeMode } from "../../../composables/settings/useTheme";
import { useSettings } from "../../../composables/settings/useSettings";
import { useThemeStyle, type ThemeStyle, type ThemeCategory } from "../../../composables/settings/useThemeStyle";

const { themeMode, setTheme } = useTheme();
const { settings, updateSetting } = useSettings();
const { currentThemeStyle, setThemeStyle, THEME_STYLES, THEME_CATEGORIES, getThemesByCategory } = useThemeStyle();

const closeActionOptions = [
  { value: "minimize" as const, label: "最小化到托盘", desc: "关闭窗口时隐藏到系统托盘，应用继续运行" },
  { value: "exit" as const, label: "直接退出", desc: "关闭窗口时完全退出应用" },
];

const activeCategory = ref<ThemeCategory>(THEME_STYLES[currentThemeStyle.value].category);
const categoryList = Object.values(THEME_CATEGORIES);
const filteredThemes = computed(() => getThemesByCategory(activeCategory.value));

function handleThemeStyleClick(style: ThemeStyle) {
  setThemeStyle(style);
}

const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "浅色模式", icon: "sun" },
  { value: "dark", label: "深色模式", icon: "moon" },
  { value: "system", label: "跟随系统", icon: "monitor" },
];

</script>

<template>
  <div class="space-y-5">
    <!-- 主题风格 -->
    <div class="settings-card">
      <h3 class="settings-card-title">主题风格</h3>
      <!-- 分类标签 -->
      <div class="flex gap-1.5 mb-3">
        <button
          v-for="cat in categoryList"
          :key="cat.id"
          class="category-tab text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
          :class="activeCategory === cat.id ? 'active' : ''"
          @click="activeCategory = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>
      <!-- 主题列表 -->
      <div class="grid grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
        <button
          v-for="theme in filteredThemes"
          :key="theme.id"
          class="theme-style-card flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200"
          :class="currentThemeStyle === theme.id ? 'active' : ''"
          @click="handleThemeStyleClick(theme.id)"
        >
          <!-- 色卡预览 -->
          <div class="flex gap-0.5 flex-shrink-0">
            <div
              v-for="(color, ci) in theme.preview"
              :key="ci"
              class="w-3 h-3 rounded-full"
              :style="{ background: color }"
            />
          </div>
          <div class="min-w-0">
            <div class="text-[11px] font-semibold theme-style-label">{{ theme.label }}</div>
          </div>
          <!-- 选中标 -->
          <svg v-if="currentThemeStyle === theme.id" class="w-3.5 h-3.5 flex-shrink-0 ml-auto check-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

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

    <!-- 窗口关闭行为 -->
    <div class="settings-card">
      <h3 class="settings-card-title">窗口关闭行为</h3>
      <div class="space-y-2">
        <button
          v-for="opt in closeActionOptions"
          :key="opt.value"
          class="close-action-card w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
          :class="settings.closeAction === opt.value ? 'active' : ''"
          @click="updateSetting('closeAction', opt.value)"
        >
          <!-- Radio circle -->
          <div
            class="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors"
            :class="settings.closeAction === opt.value
              ? 'border-blue-500'
              : 'border-black/15 dark:border-white/20'"
          >
            <div
              v-if="settings.closeAction === opt.value"
              class="w-2 h-2 rounded-full bg-blue-500"
            />
          </div>
          <div class="min-w-0">
            <div class="text-[12px] font-medium text-primary">{{ opt.label }}</div>
            <div class="text-[11px] text-tertiary mt-0.5">{{ opt.desc }}</div>
          </div>
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

/* ── 分类标签 ── */
.category-tab {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.5);
  border: none;
  cursor: pointer;
}

.category-tab:hover {
  background: rgba(0, 0, 0, 0.07);
  color: rgba(0, 0, 0, 0.7);
}

.dark .category-tab {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.45);
}

.dark .category-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.category-tab.active {
  background: #3B82F6;
  color: #fff;
}

.dark .category-tab.active {
  background: #60A5FA;
  color: #fff;
}

/* ── 主题风格卡片 ── */
.theme-style-card {
  background: rgba(0, 0, 0, 0.02);
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
}

.theme-style-card:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .theme-style-card {
  background: rgba(255, 255, 255, 0.03);
}

.dark .theme-style-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

.close-action-card {
  background: rgba(0, 0, 0, 0.02);
  border: 2px solid transparent;
  cursor: pointer;
}

.close-action-card:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .close-action-card {
  background: rgba(255, 255, 255, 0.03);
}

.dark .close-action-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

.close-action-card.active {
  background: #EFF6FF;
  border-color: #3B82F6;
}

.dark .close-action-card.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: #60A5FA;
}

.theme-style-card.active {
  background: #EFF6FF;
  border-color: #3B82F6;
}

.dark .theme-style-card.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: #60A5FA;
}

.theme-style-label {
  color: rgba(0, 0, 0, 0.75);
}

.dark .theme-style-label {
  color: rgba(255, 255, 255, 0.85);
}

.theme-style-desc {
  color: rgba(0, 0, 0, 0.35);
  margin-top: 2px;
}

.dark .theme-style-desc {
  color: rgba(255, 255, 255, 0.35);
}

.theme-style-card.active .check-icon {
  color: #3B82F6;
}

.dark .theme-style-card.active .check-icon {
  color: #60A5FA;
}
</style>
