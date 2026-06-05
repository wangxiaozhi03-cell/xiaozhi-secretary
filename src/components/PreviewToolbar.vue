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
  <div class="bg-white border-b border-gray-200 px-5 py-1.5 flex items-center justify-between flex-shrink-0">
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-400">预览</span>
    </div>
    <div class="flex items-center gap-2">
      <button
        class="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"
        :disabled="currentPage <= 0"
        @click="emit('prev')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="flex items-center gap-1">
        <div
          v-for="i in totalPages"
          :key="i"
          class="transition-all"
          :class="i - 1 === currentPage
            ? 'w-6 h-2 rounded bg-blue-500'
            : 'w-2 h-2 rounded-full bg-gray-300'"
        ></div>
      </div>
      <button
        class="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"
        :disabled="currentPage >= totalPages - 1"
        @click="emit('next')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span class="text-xs text-gray-400 ml-1">
        {{ totalPages > 0 ? currentPage + 1 : 0 }} / {{ totalPages }}
      </span>
    </div>
  </div>
</template>
