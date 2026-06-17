<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GeneratedFile, GenerationType } from '../../../composables/java-generator/types'

const props = defineProps<{
  files: GeneratedFile[]
  selectedIndex: number
  isGenerating: boolean
}>()

const emit = defineEmits<{
  select: [index: number]
  copy: [index: number]
}>()

// Tab 类型配置
const tabTypes: { type: GenerationType; label: string; icon: string }[] = [
  { type: 'entity', label: 'Entity', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { type: 'mapper', label: 'Mapper', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { type: 'service', label: 'Service', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { type: 'serviceImpl', label: 'Impl', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { type: 'controller', label: 'Controller', icon: 'M5 12h14M12 5l7 7-7 7' },
  { type: 'xml', label: 'XML', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { type: 'dto', label: 'DTO', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
]

// 当前选中的 tab 类型
const activeTabType = ref<GenerationType>('entity')

// 按类型分组的文件
const filesByType = computed(() => {
  const grouped: Record<GenerationType, GeneratedFile[]> = {
    entity: [],
    mapper: [],
    service: [],
    serviceImpl: [],
    controller: [],
    xml: [],
    dto: [],
  }

  for (const file of props.files) {
    if (grouped[file.type]) {
      grouped[file.type].push(file)
    }
  }

  return grouped
})

// 当前类型下的文件列表
const currentFiles = computed(() => filesByType.value[activeTabType.value] || [])

// 当前显示的文件
const currentFile = computed(() => {
  if (props.files.length === 0) return null
  return props.files[props.selectedIndex] || null
})

// 语法高亮（简化版本）
function highlightCode(code: string, type: string): string {
  if (!code) return ''

  if (type === 'xml') {
    // XML 高亮
    let result = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    result = result
      .replace(/(&lt;\/?)([\w:-]+)/g, '$1<span class="xml-tag">$2</span>')
      .replace(/([\w:-]+)(=)/g, '<span class="xml-attr">$1</span>$2')
      .replace(/(".*?")/g, '<span class="xml-string">$1</span>')
      .replace(/(&lt;!--.*?--&gt;)/g, '<span class="xml-comment">$1</span>')

    return result
  } else {
    // Java 高亮 - 使用占位符避免嵌套
    let result = code

    // 先提取注释和字符串，用占位符替换
    const placeholders: string[] = []

    // 多行注释
    result = result.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      const idx = placeholders.length
      placeholders.push(`<span class="java-comment">${escapeHtml(match)}</span>`)
      return `__PLACEHOLDER_${idx}__`
    })

    // 单行注释
    result = result.replace(/\/\/.*$/gm, (match) => {
      const idx = placeholders.length
      placeholders.push(`<span class="java-comment">${escapeHtml(match)}</span>`)
      return `__PLACEHOLDER_${idx}__`
    })

    // 字符串
    result = result.replace(/"[^"]*"/g, (match) => {
      const idx = placeholders.length
      placeholders.push(`<span class="java-string">${escapeHtml(match)}</span>`)
      return `__PLACEHOLDER_${idx}__`
    })

    // HTML 转义
    result = escapeHtml(result)

    // 关键字
    result = result.replace(/\b(package|import|public|private|protected|class|interface|extends|implements|return|new|this|super|if|else|for|while|try|catch|finally|throw|throws|static|final|abstract|synchronized|volatile|transient|native|void|int|long|float|double|boolean|char|byte|short)\b/g,
      '<span class="java-keyword">$1</span>')

    // 类型
    result = result.replace(/\b(String|Long|Integer|Boolean|BigDecimal|LocalDateTime|LocalDate|LocalTime|Date|List|Map|Set|Optional|Object)\b/g,
      '<span class="java-type">$1</span>')

    // 注解
    result = result.replace(/@(\w+)/g, '<span class="java-annotation">@$1</span>')

    // 还原占位符
    result = result.replace(/__PLACEHOLDER_(\d+)__/g, (_, idx) => placeholders[parseInt(idx)])

    return result
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 复制当前文件
function handleCopy() {
  emit('copy', props.selectedIndex)
}

// 选择文件
function handleSelectFile(index: number) {
  // 直接使用文件在全局列表中的索引
  const file = currentFiles.value[index]
  const idx = props.files.indexOf(file)
  if (idx !== -1) {
    emit('select', idx)
  }
}

// 切换 tab 时选择第一个文件
watch(activeTabType, () => {
  if (currentFiles.value.length > 0) {
    handleSelectFile(0)
  }
})

// 复制成功提示
const showCopySuccess = ref(false)

async function handleCopyWithFeedback() {
  handleCopy()
  showCopySuccess.value = true
  setTimeout(() => {
    showCopySuccess.value = false
  }, 2000)
}
</script>

<template>
  <div class="code-preview-panel flex-1 flex flex-col overflow-hidden">
    <!-- 类型切换 Tab -->
    <div class="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10 overflow-x-auto">
      <button
        v-for="tab in tabTypes"
        :key="tab.type"
        class="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-all duration-200 flex-shrink-0"
        :class="[
          activeTabType === tab.type
            ? 'bg-[#4F8CFF]/10 text-[#4F8CFF] font-medium'
            : filesByType[tab.type]?.length > 0
              ? 'text-secondary hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
              : 'text-tertiary opacity-50 cursor-not-allowed'
        ]"
        :disabled="!filesByType[tab.type]?.length"
        @click="activeTabType = tab.type"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
        </svg>
        {{ tab.label }}
        <span
          v-if="filesByType[tab.type]?.length"
          class="px-1 py-0 rounded-full text-[9px] bg-black/[0.05] dark:bg-white/[0.1]"
        >
          {{ filesByType[tab.type].length }}
        </span>
      </button>
    </div>

    <!-- 文件列表（同类型多个文件时显示） -->
    <div
      v-if="currentFiles.length > 1"
      class="flex items-center gap-1 px-2 py-1 border-b border-white/10 overflow-x-auto"
    >
      <button
        v-for="(file, index) in currentFiles"
        :key="file.name"
        class="px-2 py-0.5 rounded text-[10px] transition-all flex-shrink-0"
        :class="props.files[props.selectedIndex]?.name === file.name
          ? 'bg-[#4F8CFF]/10 text-[#4F8CFF]'
          : 'text-tertiary hover:text-secondary'"
        @click="handleSelectFile(index)"
      >
        {{ file.name }}
      </button>
    </div>

    <!-- 代码内容 -->
    <div class="flex-1 overflow-hidden relative">
      <!-- 加载状态 -->
      <div
        v-if="isGenerating"
        class="absolute inset-0 flex items-center justify-center bg-black/[0.06] dark:bg-black/80 backdrop-blur-sm z-10"
      >
        <div class="flex flex-col items-center gap-2">
          <svg class="w-8 h-8 text-[#4F8CFF] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span class="text-xs text-secondary">正在生成代码...</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="files.length === 0 && !isGenerating"
        class="flex flex-col items-center justify-center h-full text-tertiary"
      >
        <svg class="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <p class="text-xs">暂无生成的代码</p>
        <p class="text-[10px] mt-1">请先解析 SQL 并配置生成选项</p>
      </div>

      <!-- 代码显示 -->
      <div
        v-else-if="currentFile"
        class="h-full overflow-auto p-3"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-primary">{{ currentFile.name }}</span>
          <button
            class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-secondary hover:text-primary hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
            @click="handleCopyWithFeedback"
          >
            <svg v-if="!showCopySuccess" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <svg v-else class="w-3 h-3 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ showCopySuccess ? '已复制' : '复制' }}
          </button>
        </div>

        <pre class="text-[11px] leading-[18px] font-mono"><code v-html="highlightCode(currentFile.content, currentFile.type)" /></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-preview-panel pre {
  margin: 0;
  padding: 0;
  background: transparent;
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;
}

.code-preview-panel code {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
}

/* Java 语法高亮 */
:deep(.java-keyword) {
  color: #4F8CFF;
  font-weight: 500;
}

:deep(.java-type) {
  color: #F59E0B;
}

:deep(.java-annotation) {
  color: #A78BFA;
}

:deep(.java-string) {
  color: #22C55E;
}

:deep(.java-comment) {
  color: #6B7280;
  font-style: italic;
}

/* XML 语法高亮 */
:deep(.xml-tag) {
  color: #4F8CFF;
}

:deep(.xml-attr) {
  color: #A78BFA;
}

:deep(.xml-string) {
  color: #22C55E;
}

:deep(.xml-comment) {
  color: #6B7280;
  font-style: italic;
}

/* 自定义滚动条 */
.code-preview-panel ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.code-preview-panel ::-webkit-scrollbar-track {
  background: transparent;
}

.code-preview-panel ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.dark .code-preview-panel ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.code-preview-panel ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

.dark .code-preview-panel ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
