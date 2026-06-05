<script setup lang="ts">
defineProps<{
  imageCount: number;
  pageCount: number;
}>();

const emit = defineEmits<{
  exportPdf: [];
  exportDocx: [];
}>();
</script>

<template>
  <div class="p-4 border-t border-gray-100">
    <div class="flex gap-2">
      <button
        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors"
        :disabled="imageCount === 0"
        @click="emit('exportPdf')"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        PDF
      </button>
      <button
        class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors"
        :disabled="imageCount === 0"
        @click="emit('exportDocx')"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Word
      </button>
    </div>
    <p v-if="imageCount > 0" class="text-xs text-gray-400 mt-1.5 text-center">
      {{ imageCount }} 张 → {{ pageCount }} 页
    </p>
    <p v-else class="text-xs text-gray-300 mt-1.5 text-center">
      添加图片后可导出
    </p>
  </div>
</template>
