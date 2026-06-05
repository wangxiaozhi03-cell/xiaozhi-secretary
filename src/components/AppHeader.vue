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
  if (type === 'pdf') {
    emit('exportPdf')
  } else {
    emit('exportDocx')
  }
  showDropdown.value = false
}

// 点击外部关闭下拉菜单
function closeDropdown() {
  showDropdown.value = false
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 px-5 py-2 flex items-center justify-between flex-shrink-0">
    <div class="flex items-center gap-3">
      <img
        src="../assets/logo.png"
        alt="Logo"
        class="w-7 h-7 rounded-lg object-contain"
      />
      <div>
        <h1 class="text-sm font-semibold text-gray-800">XiaoZhiSecretary</h1>
      </div>
      <span class="text-xs text-gray-400">小志秘书</span>
    </div>

    <div class="flex items-center gap-3">
      <!-- 导出按钮 -->
      <div class="relative" @mouseleave="closeDropdown">
        <button
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
          :class="imageCount > 0
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
          :disabled="imageCount === 0"
          @click="toggleDropdown"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- 下拉菜单（包含透明桥接区域） -->
        <div
          v-if="showDropdown && imageCount > 0"
          class="absolute right-0 z-50"
          style="top: 100%; width: 128px;"
        >
          <!-- 透明桥接区域，填补按钮和菜单之间的间隙 -->
          <div style="height: 4px;"></div>
          <!-- 实际菜单内容 -->
          <div class="bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <button
              class="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
              @click="handleExport('pdf')"
            >
              <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              导出 PDF
            </button>
            <button
              class="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
              @click="handleExport('docx')"
            >
              <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出 Word
            </button>
          </div>
        </div>
      </div>

    </div>
  </header>
</template>
