<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { BuildStatus } from '../../../composables/java-packager/types'

const props = defineProps<{
  buildStatus: BuildStatus
  buildLogs: string[]
  buildDuration: number
}>()

const logRef = ref<HTMLPreElement | null>(null)

watch(() => props.buildLogs.length, () => {
  nextTick(() => {
    if (logRef.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight
    }
  })
})

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

/** 给日志行加颜色 */
function lineClass(line: string): string {
  if (line.startsWith('═') || line.startsWith('─')) return 'text-blue-400'
  if (line.startsWith('✅') || line.startsWith('🎉')) return 'text-green-400 font-medium'
  if (line.startsWith('❌') || line.startsWith('⚠️')) return 'text-red-400'
  if (line.startsWith('📦')) return 'text-cyan-400'
  if (line.startsWith('[') && (line.includes('ERROR') || line.includes('FAILURE'))) return 'text-red-400'
  if (line.startsWith('[') && line.includes('WARNING')) return 'text-yellow-400'
  if (line.includes('BUILD SUCCESS')) return 'text-green-400 font-bold'
  if (line.includes('BUILD FAILURE')) return 'text-red-400 font-bold'
  if (line.startsWith('[INFO]')) return 'text-gray-400'
  if (line.startsWith('[WARNING]')) return 'text-yellow-400/70'
  if (line.startsWith('[ERROR]')) return 'text-red-400/80'
  return 'text-gray-300'
}
</script>

<template>
  <div class="glass-card flex-1 flex flex-col overflow-hidden min-h-0">
    <!-- Output header -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08] flex-shrink-0">
      <div class="flex items-center gap-3">
        <span class="text-[13px] font-medium text-primary">构建输出</span>
        <div v-if="buildStatus === 'building'" class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span class="text-[11px] text-blue-500">构建中...</span>
        </div>
        <div v-else-if="buildStatus === 'success'" class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span class="text-[11px] text-green-600">构建成功</span>
        </div>
        <div v-else-if="buildStatus === 'error'" class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span class="text-[11px] text-red-500">构建失败</span>
        </div>
      </div>

      <span v-if="buildDuration > 0" class="text-[11px] text-tertiary">
        耗时 {{ formatDuration(buildDuration) }}
      </span>
    </div>

    <!-- Log content -->
    <div class="flex-1 overflow-hidden min-h-0">
      <!-- Empty state -->
      <div v-if="buildStatus === 'idle' && buildLogs.length === 0" class="flex flex-col items-center justify-center h-full text-tertiary">
        <svg class="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 7.5l3 2.25-3 2.25m8.5 0l3 2.25-3 2.25M3.375 3h17.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V4.125C2.25 3.504 2.754 3 3.375 3z" />
        </svg>
        <span class="text-[13px]">选择模块并点击"开始打包"</span>
        <span class="text-[11px] mt-1">构建日志将实时显示在此</span>
      </div>

      <!-- Log output -->
      <pre
        v-else
        ref="logRef"
        class="h-full overflow-y-auto p-4 text-[12px] leading-relaxed font-mono select-text"
      ><template v-for="(line, i) in buildLogs" :key="i"><span :class="lineClass(line)">{{ line }}</span>
</template></pre>
    </div>
  </div>
</template>
