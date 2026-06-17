<script setup lang="ts">
import { ref } from 'vue'
import { useJsonToDto } from '../../../composables/java-generator/useJsonToDto'

const props = defineProps<{
  json: string
}>()

const emit = defineEmits<{
  'update:json': [json: string]
  parse: []
}>()

const { formatJson, validateJson } = useJsonToDto()

const error = ref<string | undefined>(undefined)

// 更新 JSON
function updateJson(value: string) {
  emit('update:json', value)
  error.value = undefined
}

// 格式化 JSON
function handleFormat() {
  try {
    const formatted = formatJson(props.json)
    emit('update:json', formatted)
    error.value = undefined
  } catch (e) {
    error.value = String(e)
  }
}

// 验证并解析
function handleParse() {
  const result = validateJson(props.json)
  if (result.valid) {
    error.value = undefined
    emit('parse')
  } else {
    error.value = result.error
  }
}

// 加载示例
function handleLoadExample() {
  const example = `{
  // 余额池id
  "poolId": 566,
  // 划拨方id
  "fromOwnerId": 285,
  // 持有者类型
  "ownerType": "VTWSB",
  // 流水类型：in/out
  "flowType": "4B6BK",
  // 业务类型
  "bizType": "JBRKO",
  // 持有者id
  "ownerId": 380,
  // 持有者id列表
  "ownerIds": [
    51
  ],
  // 持有者真实名称
  "ownerRealName": "RJHTS",
  // 业务名称
  "bizName": "SNQK8",
  // 流水号
  "flowNo": "ACA34",
  // 开始时间
  "startTime": "DIFBF",
  // 结束时间
  "endTime": "TYXIC",
  "current": 1,
  "size": 10
}`
  emit('update:json', example)
  error.value = undefined
}

// 清空
function handleClear() {
  emit('update:json', '')
  error.value = undefined
}

// 粘贴
async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText()
    emit('update:json', text)
    error.value = undefined
  } catch {
    // 忽略错误
  }
}
</script>

<template>
  <div class="json-input-panel flex flex-col h-full">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-primary">JSON 输入</span>
        <button
          class="px-2 py-0.5 rounded text-[10px] bg-[#4F8CFF]/10 text-[#4F8CFF] hover:bg-[#4F8CFF]/20 transition-colors"
          @click="handleLoadExample"
        >
          加载示例
        </button>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="px-2 py-0.5 rounded text-[10px] bg-white/40 dark:bg-black/20 text-secondary hover:bg-white/60 dark:hover:bg-black/30 transition-colors"
          @click="handlePaste"
        >
          粘贴
        </button>
        <button
          class="px-2 py-0.5 rounded text-[10px] bg-white/40 dark:bg-black/20 text-secondary hover:bg-white/60 dark:hover:bg-black/30 transition-colors"
          @click="handleFormat"
          :disabled="!json.trim()"
        >
          格式化
        </button>
        <button
          class="px-2 py-0.5 rounded text-[10px] bg-white/40 dark:bg-black/20 text-secondary hover:bg-white/60 dark:hover:bg-black/30 transition-colors"
          @click="handleClear"
          :disabled="!json.trim()"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="flex-1 relative">
      <textarea
        :value="json"
        @input="updateJson(($event.target as HTMLTextAreaElement).value)"
        class="w-full h-full p-3 text-xs font-mono bg-transparent resize-none outline-none"
        placeholder="粘贴 JSON 到这里...&#10;&#10;支持 // 风格注释，注释会作为字段描述"
        spellcheck="false"
      />

      <!-- 错误提示 -->
      <div
        v-if="error"
        class="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[11px]"
      >
        {{ error }}
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="flex items-center justify-between px-3 py-2 border-t border-white/10">
      <span class="text-[10px] text-tertiary">
        {{ json.trim() ? '已输入 ' + json.trim().split('\n').length + ' 行' : '等待输入' }}
      </span>
      <button
        class="btn btn-primary text-xs"
        @click="handleParse"
        :disabled="!json.trim()"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        生成 DTO
      </button>
    </div>
  </div>
</template>

<style scoped>
.json-input-panel {
  /* 自定义滚动条 */
}

.json-input-panel textarea::-webkit-scrollbar {
  width: 6px;
}

.json-input-panel textarea::-webkit-scrollbar-track {
  background: transparent;
}

.json-input-panel textarea::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.dark .json-input-panel textarea::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
