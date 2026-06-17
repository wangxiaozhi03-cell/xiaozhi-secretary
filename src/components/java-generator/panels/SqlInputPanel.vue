<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  sql: string
}>()

const emit = defineEmits<{
  'update:sql': [value: string]
  parse: []
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const lineNumbers = ref<number[]>([])

// 更新行号
function updateLineNumbers() {
  const lines = (props.sql || '').split('\n')
  lineNumbers.value = lines.map((_, i) => i + 1)
}

// 处理输入
function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:sql', target.value)
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  const textarea = textareaRef.value
  if (!textarea) return

  // Tab 键缩进
  if (event.key === 'Tab') {
    event.preventDefault()
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    if (event.shiftKey) {
      // 取消缩进
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const line = value.substring(lineStart, end)
      if (line.startsWith('  ')) {
        textarea.value = value.substring(0, lineStart) + line.substring(2)
        textarea.selectionStart = textarea.selectionEnd = start - 2
        emit('update:sql', textarea.value)
      }
    } else {
      // 添加缩进
      textarea.value = value.substring(0, start) + '  ' + value.substring(end)
      textarea.selectionStart = textarea.selectionEnd = start + 2
      emit('update:sql', textarea.value)
    }
  }

  // Ctrl/Cmd + Enter 解析
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    emit('parse')
  }
}

// 滚动同步
function handleScroll() {
  const textarea = textareaRef.value
  if (!textarea) return

  const lineNumbersEl = textarea.parentElement?.querySelector('.line-numbers')
  if (lineNumbersEl) {
    lineNumbersEl.scrollTop = textarea.scrollTop
  }
}

// 监听 sql 变化
watch(() => props.sql, () => {
  updateLineNumbers()
})

onMounted(() => {
  updateLineNumbers()
})
</script>

<template>
  <div class="sql-input-panel flex-1 flex overflow-hidden relative">
    <!-- 行号 -->
    <div class="line-numbers w-10 flex-shrink-0 overflow-hidden bg-black/[0.02] dark:bg-white/[0.02] border-r border-white/10">
      <div class="py-2 px-1">
        <div
          v-for="num in lineNumbers"
          :key="num"
          class="text-[11px] text-tertiary text-right leading-[20px] h-[20px] pr-2 select-none"
        >
          {{ num }}
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <textarea
      ref="textareaRef"
      :value="sql"
      @input="handleInput"
      @keydown="handleKeydown"
      @scroll="handleScroll"
      class="flex-1 p-2 bg-transparent resize-none text-[12px] leading-[20px] font-mono text-primary outline-none placeholder:text-tertiary"
      placeholder="在此粘贴 SQL 语句...&#10;&#10;支持:&#10;- CREATE TABLE 语句&#10;- 多表 SQL 脚本&#10;- MySQL / PostgreSQL 语法&#10;&#10;快捷键:&#10;- Tab: 缩进&#10;- Shift+Tab: 取消缩进&#10;- Ctrl/Cmd+Enter: 解析"
      spellcheck="false"
    />

    <!-- 快捷按钮 -->
    <div class="absolute bottom-2 right-2 flex items-center gap-1">
      <button
        class="px-2 py-1 rounded-md text-[10px] bg-[#EEF2F8]/60 dark:bg-black/40 backdrop-blur-sm border border-white/20 text-secondary hover:text-primary hover:bg-[#EEF2F8]/80 transition-all"
        @click="emit('parse')"
      >
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          解析
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sql-input-panel textarea {
  tab-size: 2;
  -moz-tab-size: 2;
}

.sql-input-panel textarea::selection {
  background: rgba(79, 140, 255, 0.2);
}

.line-numbers::-webkit-scrollbar {
  display: none;
}
</style>
