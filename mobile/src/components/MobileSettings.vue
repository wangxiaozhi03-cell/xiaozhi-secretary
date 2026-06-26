<script setup lang="ts">
import type { PageSettings, LayoutKey } from "@types/index";
import { computed } from "vue";

const props = defineProps<{
  settings: PageSettings;
  imageCount: number;
}>();

const emit = defineEmits<{
  update: [key: keyof PageSettings, value: string | number | null];
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
    <!-- 纸张大小 -->
    <div>
      <label class="text-xs font-medium text-tertiary uppercase tracking-widest mb-2.5 block">纸张大小</label>
      <div class="flex gap-2">
        <button
          v-for="size in paperSizes"
          :key="size"
          class="flex-1 text-sm py-3 rounded-xl transition-all duration-200"
          :class="settings.paperSize === size ? 'btn-primary' : 'btn'"
          @click="emit('update', 'paperSize', size)"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <!-- 方向 -->
    <div>
      <label class="text-xs font-medium text-tertiary uppercase tracking-widest mb-2.5 block">方向</label>
      <div class="flex gap-2">
        <button
          v-for="o in orientations"
          :key="o.value"
          class="flex-1 text-sm py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          :class="settings.orientation === o.value ? 'btn-primary' : 'btn'"
          @click="emit('update', 'orientation', o.value)"
        >
          <svg v-if="o.icon === 'portrait'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="1.5" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="6" width="18" height="12" rx="2" stroke-width="1.5" />
          </svg>
          {{ o.label }}
        </button>
      </div>
    </div>

    <!-- 每页图片数 -->
    <div>
      <label class="text-xs font-medium text-tertiary uppercase tracking-widest mb-2.5 block">每页图片</label>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="opt in perPageOptions"
          :key="String(opt.value)"
          class="text-sm py-3 px-4 rounded-xl transition-all duration-200"
          :class="settings.imagesPerPage === opt.value ? 'btn-primary' : 'btn'"
          @click="emit('update', 'imagesPerPage', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 间距模式 -->
    <div>
      <label class="text-xs font-medium text-tertiary uppercase tracking-widest mb-2.5 block">间距模式</label>
      <div class="flex gap-2">
        <button
          v-for="m in gapModes"
          :key="m.value"
          class="flex-1 text-sm py-3 rounded-xl transition-all duration-200"
          :class="settings.gapMode === m.value ? 'btn-primary' : 'btn'"
          @click="emit('update', 'gapMode', m.value)"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- 间距滑块 -->
    <div v-if="settings.gapMode === 'gapped'">
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-medium text-tertiary uppercase tracking-widest">间距</label>
        <span class="text-xs text-tertiary tabular-nums">{{ settings.gapMm }} mm</span>
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
