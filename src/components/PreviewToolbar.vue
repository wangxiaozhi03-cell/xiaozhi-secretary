<script setup lang="ts">
defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
}>();
</script>

<template>
  <div class="flex items-center justify-between px-5 py-2.5 flex-shrink-0">
    <span class="text-xs text-tertiary">预览</span>
    <div class="flex items-center gap-3">
      <button class="btn-icon" :disabled="currentPage <= 0" @click="emit('prev')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="flex items-center gap-1.5">
        <div
          v-for="i in totalPages"
          :key="i"
          class="transition-all duration-300 rounded-full"
          :class="i - 1 === currentPage
            ? 'w-5 h-1.5 bg-blue-400'
            : 'w-1.5 h-1.5 bg-black/8'"
        ></div>
      </div>
      <button class="btn-icon" :disabled="currentPage >= totalPages - 1" @click="emit('next')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span class="text-xs text-tertiary tabular-nums ml-1">
        {{ totalPages > 0 ? currentPage + 1 : 0 }} / {{ totalPages }}
      </span>
    </div>
  </div>
</template>
