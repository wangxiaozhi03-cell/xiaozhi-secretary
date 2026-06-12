<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  imageCount: number
  pageCount: number
}>()

const emit = defineEmits<{
  exportPdf: []
  exportDocx: []
}>()

const showDropdown = ref(false)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleExport(type: 'pdf' | 'docx') {
  if (type === 'pdf') emit('exportPdf')
  else emit('exportDocx')
  showDropdown.value = false
}

function closeDropdown() {
  showDropdown.value = false
}
</script>

<template>
  <header class="glass-bar px-6 py-3 flex items-center justify-between flex-shrink-0">
    <div class="flex items-center gap-3">
      <h1 class="text-sm font-semibold text-primary">图片工具</h1>
      <span v-if="imageCount > 0" class="tag">{{ imageCount }} 张图片 · {{ pageCount }} 页</span>
      <span v-else class="tag">等待导入</span>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative" @mouseleave="closeDropdown">
        <button
          :class="imageCount > 0 ? 'btn-primary' : 'btn opacity-40 cursor-not-allowed'"
          :disabled="imageCount === 0"
          @click="toggleDropdown"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出
        </button>

        <div
          v-if="showDropdown && imageCount > 0"
          class="absolute right-0 z-50"
          style="top: calc(100% + 8px); width: 160px;"
        >
          <div class="glass-float float-in p-1.5">
            <button
              class="w-full px-3.5 py-2.5 text-[13px] text-left rounded-xl hover:bg-blue-50 flex items-center gap-3 transition-colors text-primary"
              @click="handleExport('pdf')"
            >
              <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              导出 PDF
            </button>
            <button
              class="w-full px-3.5 py-2.5 text-[13px] text-left rounded-xl hover:bg-emerald-50 flex items-center gap-3 transition-colors text-primary"
              @click="handleExport('docx')"
            >
              <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              导出 Word
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
