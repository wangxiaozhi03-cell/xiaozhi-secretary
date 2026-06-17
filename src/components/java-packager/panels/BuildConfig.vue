<script setup lang="ts">
import type { ProjectConfig, MavenModule, BuildStatus, BuildScope, SshServer } from '../../../composables/java-packager/types'
import { BUILD_SCOPE_OPTIONS } from '../../../composables/java-packager/types'
import { open } from '@tauri-apps/plugin-dialog'

defineProps<{
  currentProject: ProjectConfig | null
  selectedModules: MavenModule[]
  selectedProfile: string
  skipTests: boolean
  extraArgs: string
  buildStatus: BuildStatus
  outputDir: string
  buildScope: BuildScope
  autoUpload: boolean
  servers: SshServer[]
  selectedServerIds: string[]
}>()

const emit = defineEmits<{
  'update:profile': [value: string]
  'update:skip-tests': [value: boolean]
  'update:extra-args': [value: string]
  'update:output-dir': [value: string]
  'update:build-scope': [value: BuildScope]
  'update:auto-upload': [value: boolean]
  toggleServer: [id: string]
  build: []
  upload: []
  reset: []
}>()

async function chooseOutputDir() {
  const dir = await open({
    directory: true,
    multiple: false,
    title: '选择打包输出目录',
  })
  if (dir) {
    emit('update:output-dir', dir as string)
  }
}
</script>

<template>
  <div class="glass-card flex-shrink-0">
    <div class="px-4 py-3 flex items-center gap-4 flex-wrap">
      <!-- 当前选中信息 -->
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-[11px] text-tertiary">目标:</span>
        <template v-if="selectedModules.length > 0">
          <span v-if="selectedModules.length === 1" class="text-[13px] font-medium text-primary truncate">
            {{ selectedModules[0].name }}
          </span>
          <span v-else class="text-[13px] font-medium text-primary">
            {{ selectedModules.length }} 个模块
          </span>
        </template>
        <span v-else class="text-[13px] text-tertiary italic">请选择模块</span>
      </div>

      <!-- Profile 选择 -->
      <div class="flex items-center gap-2">
        <label class="text-[11px] text-tertiary">环境:</label>
        <div class="flex gap-1">
          <button
            v-for="p in currentProject?.profiles || []"
            :key="p"
            class="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200"
            :class="selectedProfile === p
              ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
              : 'bg-black/[0.04] dark:bg-white/[0.06] text-secondary hover:bg-black/[0.07] dark:hover:bg-white/[0.1]'"
            @click="emit('update:profile', p)"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <!-- 构建范围 -->
      <div class="flex items-center gap-2">
        <label class="text-[11px] text-tertiary">范围:</label>
        <div class="flex gap-1" :title="BUILD_SCOPE_OPTIONS.find(s => s.value === buildScope)?.desc">
          <button
            v-for="opt in BUILD_SCOPE_OPTIONS"
            :key="opt.value"
            class="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200"
            :class="buildScope === opt.value
              ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
              : 'bg-black/[0.04] dark:bg-white/[0.06] text-secondary hover:bg-black/[0.07] dark:hover:bg-white/[0.1]'"
            @click="emit('update:build-scope', opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Skip Tests -->
      <label class="flex items-center gap-2 cursor-pointer group">
        <div
          class="relative w-8 h-[18px] rounded-full transition-colors duration-200"
          :class="skipTests ? 'bg-blue-500' : 'bg-black/[0.1] dark:bg-white/[0.15]'"
          @click="emit('update:skip-tests', !skipTests)"
        >
          <div
            class="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="skipTests ? 'translate-x-[16px]' : 'translate-x-[2px]'"
          />
        </div>
        <span class="text-[11px] text-tertiary group-hover:text-secondary transition-colors">跳过测试</span>
      </label>

      <!-- 输出目录 -->
      <div class="flex items-center gap-2 min-w-0">
        <label class="text-[11px] text-tertiary whitespace-nowrap">输出目录:</label>
        <button
          class="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent hover:border-blue-400/40 text-[12px] transition-all max-w-[200px]"
          @click="chooseOutputDir"
        >
          <svg class="w-3.5 h-3.5 text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <span v-if="outputDir" class="truncate text-primary">{{ outputDir.split('/').pop() || outputDir }}</span>
          <span v-else class="text-tertiary/60">选择目录...</span>
        </button>
      </div>

      <!-- 上传服务器选择 -->
      <div v-if="servers.length > 0" class="flex items-center gap-2">
        <label class="text-[11px] text-tertiary whitespace-nowrap">上传到:</label>
        <select
          class="h-7 px-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary outline-none transition-all min-w-[120px]"
          @change="emit('toggleServer', ($event.target as HTMLSelectElement).value)"
        >
          <option value="" :selected="selectedServerIds.length === 0">不上传</option>
          <option
            v-for="s in servers"
            :key="s.id"
            :value="s.id"
            :selected="selectedServerIds.includes(s.id)"
          >
            {{ s.name }}
          </option>
        </select>
      </div>

      <!-- 自动上传开关 -->
      <label v-if="selectedServerIds.length > 0" class="flex items-center gap-2 cursor-pointer group">
        <div
          class="relative w-8 h-[18px] rounded-full transition-colors duration-200"
          :class="autoUpload ? 'bg-green-500' : 'bg-black/[0.1] dark:bg-white/[0.15]'"
          @click="emit('update:auto-upload', !autoUpload)"
        >
          <div
            class="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="autoUpload ? 'translate-x-[16px]' : 'translate-x-[2px]'"
          />
        </div>
        <span class="text-[11px] text-tertiary group-hover:text-secondary transition-colors">自动上传</span>
      </label>

      <!-- 手动上传按钮 -->
      <button
        v-if="selectedServerIds.length > 0 && buildStatus === 'success'"
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all flex-shrink-0"
        @click="emit('upload')"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        上传
      </button>

      <!-- 构建按钮 -->
      <button
        class="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 flex-shrink-0"
        :class="buildStatus === 'building'
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-gradient-to-r from-[#EF4444] to-[#F97316] text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]'"
        :disabled="selectedModules.length === 0 || buildStatus === 'building'"
        @click="buildStatus !== 'building' ? emit('build') : undefined"
      >
        <svg v-if="buildStatus === 'building'" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
        {{ buildStatus === 'building' ? '构建中...' : '开始打包' }}
      </button>
    </div>
  </div>
</template>
