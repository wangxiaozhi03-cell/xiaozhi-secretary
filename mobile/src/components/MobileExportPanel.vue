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
  <div class="p-4">
    <div class="mb-4">
      <h2 class="text-base font-semibold text-primary">导出文档</h2>
      <p v-if="imageCount > 0" class="text-xs text-tertiary mt-0.5">
        {{ imageCount }} 张图片 → {{ pageCount }} 页
      </p>
    </div>

    <!-- 导出按钮 -->
    <div class="space-y-3">
      <button
        class="w-full btn-primary !py-4 !text-base !rounded-xl flex items-center justify-center gap-3"
        :disabled="imageCount === 0"
        @click="emit('exportPdf')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        导出 PDF
      </button>

      <button
        class="w-full !py-4 !text-base !rounded-xl flex items-center justify-center gap-3"
        :class="imageCount === 0 ? 'btn opacity-50' : 'btn'"
        :disabled="imageCount === 0"
        @click="emit('exportDocx')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        导出 Word
      </button>
    </div>

    <!-- 提示信息 -->
    <div class="mt-4 p-3 rounded-xl bg-blue-50/50">
      <p class="text-xs text-secondary leading-relaxed">
        <strong>提示：</strong>
        <template v-if="imageCount === 0">
          请先添加图片，然后选择布局模式，最后点击导出按钮生成文档。
        </template>
        <template v-else>
          PDF 和 Word 文档将以当前布局和设置导出。可以在「设置」中调整纸张大小、方向和间距。
        </template>
      </p>
    </div>
  </div>
</template>
