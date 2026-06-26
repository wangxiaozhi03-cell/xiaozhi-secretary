<script setup lang="ts">
import type { LayoutDefinition, PageSettings, LayoutKey } from "@types/index";
import MobileLayoutThumbnail from "./MobileLayoutThumbnail.vue";
import { computed } from "vue";

const props = defineProps<{
  layouts: LayoutDefinition[];
  activeIndex: number;
  imageCount: number;
  settings: PageSettings;
}>();

const emit = defineEmits<{
  select: [index: number];
  updateSettings: [key: string, value: string | number | null];
}>();

const paperSizes = ["A4", "A3", "Letter"] as const;
const orientations = [
  { value: "portrait", label: "纵向", icon: "portrait" },
  { value: "landscape", label: "横向", icon: "landscape" },
] as const;
const gapModes = [
  { value: "gapped", label: "有间距" },
  { value: "edge-to-edge", label: "铺满" },
] as const;

const allPerPageOptions: { value: LayoutKey | null; label: string }[] = [
  { value: null, label: "自动" },
  { value: 1, label: "1张" },
  { value: 2, label: "2张" },
  { value: 3, label: "3张" },
  { value: 4, label: "4张" },
  { value: 6, label: "6张" },
  { value: 9, label: "9张" },
];

const perPageOptions = computed(() => {
  if (props.imageCount === 0) return [{ value: null, label: "自动" }];
  return allPerPageOptions.filter(opt => {
    if (opt.value === null) return true;
    return opt.value <= props.imageCount;
  });
});
</script>

<template>
  <div class="p-4 space-y-5">
    <!-- 页面设置部分 -->
    <div>
      <h2 class="text-sm font-semibold text-gray-900 mb-3">页面设置</h2>

      <!-- 纸张大小 -->
      <div class="mb-3">
        <label class="text-xs text-gray-400 mb-2 block">纸张大小</label>
        <div class="flex gap-2">
          <button
            v-for="size in paperSizes"
            :key="size"
            class="flex-1 text-xs py-2.5 rounded-lg transition-all duration-200"
            :class="settings.paperSize === size ? 'btn-primary !py-2.5' : 'btn !py-2.5'"
            @click="emit('updateSettings', 'paperSize', size)"
          >
            {{ size }}
          </button>
        </div>
      </div>

      <!-- 方向 -->
      <div class="mb-3">
        <label class="text-xs text-gray-400 mb-2 block">方向</label>
        <div class="flex gap-2">
          <button
            v-for="o in orientations"
            :key="o.value"
            class="flex-1 text-xs py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
            :class="settings.orientation === o.value ? 'btn-primary !py-2.5' : 'btn !py-2.5'"
            @click="emit('updateSettings', 'orientation', o.value)"
          >
            <svg v-if="o.icon === 'portrait'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="1.5" />
            </svg>
            <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke-width="1.5" />
            </svg>
            {{ o.label }}
          </button>
        </div>
      </div>

      <!-- 每页图片 -->
      <div class="mb-3">
        <label class="text-xs text-gray-400 mb-2 block">每页图片</label>
        <div class="flex gap-1.5 flex-wrap">
          <button
            v-for="opt in perPageOptions"
            :key="String(opt.value)"
            class="text-xs py-2 px-3 rounded-lg transition-all duration-200"
            :class="settings.imagesPerPage === opt.value ? 'btn-primary !py-2' : 'btn !py-2'"
            @click="emit('updateSettings', 'imagesPerPage', opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 间距模式 -->
      <div class="mb-3">
        <label class="text-xs text-gray-400 mb-2 block">间距模式</label>
        <div class="flex gap-2">
          <button
            v-for="m in gapModes"
            :key="m.value"
            class="flex-1 text-xs py-2.5 rounded-lg transition-all duration-200"
            :class="settings.gapMode === m.value ? 'btn-primary !py-2.5' : 'btn !py-2.5'"
            @click="emit('updateSettings', 'gapMode', m.value)"
          >
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- 间距滑块 -->
      <div v-if="settings.gapMode === 'gapped'">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs text-gray-400">间距</label>
          <span class="text-xs text-gray-400 tabular-nums">{{ settings.gapMm }} mm</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          :value="settings.gapMm"
          class="w-full"
          @input="emit('updateSettings', 'gapMm', Number(($event.target as HTMLInputElement).value))"
        />
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="border-t border-gray-100" />

    <!-- 布局选择部分 -->
    <div>
      <h2 class="text-sm font-semibold text-gray-900 mb-1">布局模式</h2>
      <p class="text-xs text-gray-400 mb-3">
        {{ imageCount }} 张图片 · {{ layouts.length }} 种布局
      </p>

      <!-- 布局网格 -->
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="(layout, index) in layouts"
          :key="layout.id"
          class="p-2 rounded-lg transition-all duration-200"
          :class="index === activeIndex
            ? 'selected ring-2 ring-blue-500/30'
            : 'glass-panel'"
          @click="emit('select', index)"
        >
          <div class="mb-1.5">
            <MobileLayoutThumbnail :layout-id="layout.id" :image-count="imageCount" />
          </div>
          <p class="text-[10px] text-center text-secondary leading-tight">{{ layout.name }}</p>
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="layouts.length === 0" class="text-center py-6">
        <p class="text-xs text-tertiary">请先添加图片</p>
      </div>
    </div>
  </div>
</template>
