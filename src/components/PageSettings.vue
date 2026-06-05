<script setup lang="ts">
import type { PageSettings as PageSettingsType, LayoutKey } from "@/types";
import { computed } from "vue";

const props = defineProps<{
  settings: PageSettingsType;
  imageCount: number;
}>();

const emit = defineEmits<{
  update: [key: keyof PageSettingsType, value: string | number | null];
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

// 根据图片数量过滤可选的每页图片数
const perPageOptions = computed(() => {
  if (props.imageCount === 0) {
    return [{ value: null, label: "自动" }];
  }
  return allPerPageOptions.filter(opt => {
    if (opt.value === null) return true; // 自动选项总是可用
    return opt.value <= props.imageCount;
  });
});
</script>

<template>
  <div class="panel-section p-4">
    <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">页面设置</h2>

    <!-- 纸张 -->
    <div class="mb-3">
      <label class="text-xs text-gray-500 mb-1 block">纸张</label>
      <div class="flex gap-1.5">
        <button
          v-for="size in paperSizes"
          :key="size"
          class="flex-1 text-xs py-1.5 rounded-md border text-center transition-colors"
          :class="settings.paperSize === size
            ? 'bg-blue-500 text-white border-blue-500 font-medium'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'"
          @click="emit('update', 'paperSize', size)"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <!-- 方向 -->
    <div class="mb-3">
      <label class="text-xs text-gray-500 mb-1 block">方向</label>
      <div class="flex gap-1.5">
        <button
          v-for="o in orientations"
          :key="o.value"
          class="flex-1 text-xs py-1.5 rounded-md border text-center transition-colors flex items-center justify-center gap-1"
          :class="settings.orientation === o.value
            ? 'bg-blue-500 text-white border-blue-500 font-medium'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'"
          @click="emit('update', 'orientation', o.value)"
        >
          <svg v-if="o.icon === 'portrait'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="3" width="12" height="18" rx="1.5" stroke-width="1.5" />
          </svg>
          <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="6" width="18" height="12" rx="1.5" stroke-width="1.5" />
          </svg>
          {{ o.label }}
        </button>
      </div>
    </div>

    <!-- 每页图片数 -->
    <div class="mb-3">
      <label class="text-xs text-gray-500 mb-1 block">每页图片</label>
      <div class="flex gap-1 flex-wrap">
        <button
          v-for="opt in perPageOptions"
          :key="String(opt.value)"
          class="text-xs py-1.5 px-2.5 rounded-md border text-center transition-colors"
          :class="settings.imagesPerPage === opt.value
            ? 'bg-blue-500 text-white border-blue-500 font-medium'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'"
          @click="emit('update', 'imagesPerPage', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 间距模式 -->
    <div class="mb-3">
      <label class="text-xs text-gray-500 mb-1 block">间距模式</label>
      <div class="flex gap-1.5">
        <button
          v-for="m in gapModes"
          :key="m.value"
          class="flex-1 text-xs py-1.5 rounded-md border text-center transition-colors"
          :class="settings.gapMode === m.value
            ? 'bg-blue-500 text-white border-blue-500 font-medium'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'"
          @click="emit('update', 'gapMode', m.value)"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- 间距滑块 -->
    <div v-if="settings.gapMode === 'gapped'">
      <div class="flex items-center justify-between mb-1">
        <label class="text-xs text-gray-500">间距</label>
        <span class="text-xs text-gray-400">{{ settings.gapMm }} mm</span>
      </div>
      <input
        type="range"
        min="0"
        max="30"
        :value="settings.gapMm"
        class="w-full"
        @input="emit('update', 'gapMm', Number(($event.target as HTMLInputElement).value))"
      />
    </div>
  </div>
</template>

<style scoped>
.panel-section {
  border-bottom: 1px solid #f1f5f9;
}
</style>
