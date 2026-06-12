<script setup lang="ts">
import { ref } from "vue";
import type { ToolCategory, ToolAction } from "../../composables/json-toolkit/types";

defineProps<{
  categories: ToolCategory[];
  activeCategory: string | null;
  actions: ToolAction[];
}>();

const emit = defineEmits<{
  toggleCategory: [categoryId: string];
  action: [actionIndex: number];
}>();

const tooltipVisible = ref<string | null>(null);
</script>

<template>
  <div class="w-[60px] flex-shrink-0 flex flex-col items-center py-3 gap-1 border-r border-black/[0.04] dark:border-white/[0.06]">
    <!-- 分类图标 -->
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
      :class="activeCategory === cat.id
        ? 'bg-blue-500/[0.10] text-blue-500'
        : 'text-tertiary hover:text-primary hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'"
      @click="emit('toggleCategory', cat.id)"
      @mouseenter="tooltipVisible = cat.id"
      @mouseleave="tooltipVisible = null"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="cat.icon" />
      </svg>

      <Transition name="tooltip">
        <div
          v-if="tooltipVisible === cat.id"
          class="absolute left-full ml-2 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white bg-gray-800 dark:bg-gray-700 whitespace-nowrap pointer-events-none z-50"
        >
          {{ cat.label }}
        </div>
      </Transition>
    </button>

    <!-- 分隔线 -->
    <div v-if="actions.length > 0" class="w-6 h-px bg-black/[0.06] dark:bg-white/[0.08] my-2" />

    <!-- 工具操作按钮 -->
    <button
      v-for="(act, idx) in actions"
      :key="idx"
      class="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
      :class="act.variant === 'primary'
        ? 'bg-blue-500/[0.10] text-blue-500 hover:bg-blue-500/[0.16]'
        : 'text-tertiary hover:text-primary hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'"
      @click="emit('action', idx)"
      @mouseenter="tooltipVisible = 'action-' + idx"
      @mouseleave="tooltipVisible = null"
    >
      <!-- Beautify -->
      <svg v-if="act.icon === 'sparkle'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
      <!-- Minify / Compress -->
      <svg v-else-if="act.icon === 'compress'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
      </svg>
      <!-- Copy -->
      <svg v-else-if="act.icon === 'copy'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
      </svg>
      <!-- Clear / Trash -->
      <svg v-else-if="act.icon === 'trash'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
      <!-- Undo -->
      <svg v-else-if="act.icon === 'undo'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
      <!-- Escape / Lock -->
      <svg v-else-if="act.icon === 'escape'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <!-- Switch / Arrows -->
      <svg v-else-if="act.icon === 'switch'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
      <!-- Search -->
      <svg v-else-if="act.icon === 'search'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <!-- Compare -->
      <svg v-else-if="act.icon === 'compare'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
      <!-- Expand All -->
      <svg v-else-if="act.icon === 'expand'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
      <!-- Collapse All -->
      <svg v-else-if="act.icon === 'collapse'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
      </svg>

      <Transition name="tooltip">
        <div
          v-if="tooltipVisible === 'action-' + idx"
          class="absolute left-full ml-2 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white bg-gray-800 dark:bg-gray-700 whitespace-nowrap pointer-events-none z-50"
        >
          {{ act.label }}
        </div>
      </Transition>
    </button>
  </div>
</template>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
