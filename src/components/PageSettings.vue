<script setup lang="ts">
import type { PageSettings as PageSettingsType, LayoutKey } from "@/types";
import { computed } from "vue";
import { useGlassEffect } from "@/composables/useGlassEffect";

const props = defineProps<{
  settings: PageSettingsType;
  imageCount: number;
}>();

const emit = defineEmits<{
  update: [key: keyof PageSettingsType, value: string | number | null];
}>();

const { glassIntensity, setGlassIntensity } = useGlassEffect();

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
  <div class="p-5 space-y-5">
    <div>
      <label class="text-[11px] font-medium text-tertiary uppercase tracking-widest mb-2.5 block">纸张</label>
      <div class="flex gap-1.5">
        <button
          v-for="size in paperSizes"
          :key="size"
          class="flex-1 text-xs py-2 rounded-xl transition-all duration-200"
          :class="settings.paperSize === size ? 'btn-primary !py-2' : 'btn'"
          @click="emit('update', 'paperSize', size)"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <div>
      <label class="text-[11px] font-medium text-tertiary uppercase tracking-widest mb-2.5 block">方向</label>
      <div class="flex gap-1.5">
        <button
          v-for="o in orientations"
          :key="o.value"
          class="flex-1 text-xs py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
          :class="settings.orientation === o.value ? 'btn-primary !py-2' : 'btn'"
          @click="emit('update', 'orientation', o.value)"
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

    <div>
      <label class="text-[11px] font-medium text-tertiary uppercase tracking-widest mb-2.5 block">每页图片</label>
      <div class="flex gap-1 flex-wrap">
        <button
          v-for="opt in perPageOptions"
          :key="String(opt.value)"
          class="text-xs py-2 px-3 rounded-xl transition-all duration-200"
          :class="settings.imagesPerPage === opt.value ? 'btn-primary !py-2' : 'btn'"
          @click="emit('update', 'imagesPerPage', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="settings.gapMode === 'gapped'">
      <div class="flex items-center justify-between mb-2">
        <label class="text-[11px] font-medium text-tertiary uppercase tracking-widest">间距</label>
        <span class="text-[11px] text-tertiary tabular-nums">{{ settings.gapMm }} mm</span>
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

    <div>
      <label class="text-[11px] font-medium text-tertiary uppercase tracking-widest mb-2.5 block">间距模式</label>
      <div class="flex gap-1.5">
        <button
          v-for="m in gapModes"
          :key="m.value"
          class="flex-1 text-xs py-2 rounded-xl transition-all duration-200"
          :class="settings.gapMode === m.value ? 'btn-primary !py-2' : 'btn'"
          @click="emit('update', 'gapMode', m.value)"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-[11px] font-medium text-tertiary uppercase tracking-widest">玻璃强度</label>
        <span class="text-[11px] text-tertiary tabular-nums">{{ glassIntensity }}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        :value="glassIntensity"
        class="w-full"
        @input="setGlassIntensity(Number(($event.target as HTMLInputElement).value))"
      />
    </div>
  </div>
</template>
