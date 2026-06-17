<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { MavenConfig, ScanResult } from '../../../composables/java-packager/types'

const props = defineProps<{
  config: MavenConfig
  mavenScanResults: ScanResult[]
  jdkScanResults: ScanResult[]
  scanning: boolean
}>()

const emit = defineEmits<{
  update: [config: MavenConfig]
  scan: []
  selectMaven: [path: string]
  selectJava: [path: string]
  close: []
}>()

const localConfig = ref<MavenConfig>({ ...props.config })
const showMavenDropdown = ref(false)
const showJdkDropdown = ref(false)

watch(() => props.config, (v) => {
  localConfig.value = { ...v }
}, { deep: true })

function handleSave() {
  emit('update', localConfig.value)
  emit('close')
}

function handleReset() {
  localConfig.value = { customPath: '', javaHome: '' }
  emit('update', localConfig.value)
}

function handleScan() {
  emit('scan')
}

function selectMaven(item: ScanResult) {
  localConfig.value.customPath = item.path
  showMavenDropdown.value = false
  emit('selectMaven', item.path)
  handleSave()
}

function selectJdk(item: ScanResult) {
  localConfig.value.javaHome = item.path
  showJdkDropdown.value = false
  emit('selectJava', item.path)
  handleSave()
}

// 点击外部关闭下拉框
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.dropdown-container')) {
    showMavenDropdown.value = false
    showJdkDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <div class="text-[13px] text-secondary">
        配置 Maven 和 JDK 路径。支持 sdkman、jenv、Homebrew 等版本管理工具。
      </div>
      <button
        class="px-3 py-1.5 text-[11px] font-medium bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-1.5"
        :disabled="scanning"
        @click="handleScan"
      >
        <svg v-if="scanning" class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {{ scanning ? '扫描中...' : '自动扫描' }}
      </button>
    </div>

    <!-- Maven 路径 -->
    <div class="space-y-2">
      <label class="text-[12px] font-medium text-primary">Maven 路径</label>
      <div class="relative dropdown-container">
        <div class="flex gap-2">
          <input
            v-model="localConfig.customPath"
            type="text"
            placeholder="留空使用系统 PATH，或输入完整路径如 /usr/local/bin/mvn"
            class="flex-1 px-3 py-2 text-[13px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            @focus="showMavenDropdown = mavenScanResults.length > 0"
            @change="handleSave"
          />
          <button
            v-if="mavenScanResults.length > 0"
            class="px-2 py-2 text-[12px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-lg hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors"
            @click.stop="showMavenDropdown = !showMavenDropdown"
          >
            <svg class="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Maven 扫描结果下拉 -->
        <div
          v-if="showMavenDropdown && mavenScanResults.length > 0"
          class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-black/[0.08] dark:border-white/[0.1] rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          <div
            v-for="item in mavenScanResults"
            :key="item.path"
            class="px-3 py-2 text-[12px] hover:bg-blue-500/10 cursor-pointer flex items-center justify-between"
            @click="selectMaven(item)"
          >
            <div>
              <div class="font-medium text-primary">{{ item.label }}</div>
              <div class="text-[10px] text-tertiary truncate">{{ item.path }}</div>
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.08] text-tertiary">
              {{ item.source }}
            </span>
          </div>
        </div>
      </div>
      <p class="text-[11px] text-tertiary">
        支持：系统 PATH、sdkman、Homebrew
      </p>
    </div>

    <!-- JAVA_HOME 路径 -->
    <div class="space-y-2">
      <label class="text-[12px] font-medium text-primary">JAVA_HOME 路径</label>
      <div class="relative dropdown-container">
        <div class="flex gap-2">
          <input
            v-model="localConfig.javaHome"
            type="text"
            placeholder="留空使用系统 JAVA_HOME，或输入 JDK 安装路径"
            class="flex-1 px-3 py-2 text-[13px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            @focus="showJdkDropdown = jdkScanResults.length > 0"
            @change="handleSave"
          />
          <button
            v-if="jdkScanResults.length > 0"
            class="px-2 py-2 text-[12px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-lg hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors"
            @click.stop="showJdkDropdown = !showJdkDropdown"
          >
            <svg class="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- JDK 扫描结果下拉 -->
        <div
          v-if="showJdkDropdown && jdkScanResults.length > 0"
          class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-black/[0.08] dark:border-white/[0.1] rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          <div
            v-for="item in jdkScanResults"
            :key="item.path"
            class="px-3 py-2 text-[12px] hover:bg-blue-500/10 cursor-pointer flex items-center justify-between"
            @click="selectJdk(item)"
          >
            <div>
              <div class="font-medium text-primary">{{ item.label }}</div>
              <div class="text-[10px] text-tertiary truncate">{{ item.path }}</div>
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.08] text-tertiary">
              {{ item.source }}
            </span>
          </div>
        </div>
      </div>
      <p class="text-[11px] text-tertiary">
        支持：JAVA_HOME 环境变量、jenv、sdkman、Homebrew、系统默认路径
      </p>
    </div>

    <div class="flex gap-2 pt-2">
      <button
        class="px-4 py-2 text-[12px] font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        @click="handleSave"
      >
        保存
      </button>
      <button
        class="px-4 py-2 text-[12px] font-medium bg-black/[0.06] dark:bg-white/[0.08] text-secondary rounded-lg hover:bg-black/[0.1] dark:hover:bg-white/[0.12] transition-colors"
        @click="handleReset"
      >
        重置为默认
      </button>
    </div>
  </div>
</template>
