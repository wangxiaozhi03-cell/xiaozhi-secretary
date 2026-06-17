<script setup lang="ts">
import { onMounted } from 'vue'
import { useMavenBuilder } from '../../composables/java-packager/useMavenBuilder'
import ProjectSelector from './panels/ProjectSelector.vue'
import SettingsDialog from './panels/SettingsDialog.vue'
import BuildConfig from './panels/BuildConfig.vue'
import BuildOutput from './panels/BuildOutput.vue'

const b = useMavenBuilder()

onMounted(() => {
  b.checkMaven()
})
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="glass-bar flex items-center justify-between px-5 py-3 flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EF4444] to-[#F97316] flex items-center justify-center shadow-lg shadow-orange-500/20">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        </div>
        <div>
          <h1 class="text-[15px] font-semibold text-primary">Java 打包工具</h1>
          <p class="text-[11px] text-tertiary">Maven 多模块项目构建</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="b.mavenVersion.value" class="flex items-center gap-2 text-[11px] text-tertiary">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
          {{ b.mavenVersion.value }}
        </div>
        <div v-else class="flex items-center gap-2 text-[11px] text-red-400">
          <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          Maven 未安装
        </div>
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors text-tertiary hover:text-primary"
          title="项目 & 服务器管理"
          @click="b.showSettings.value = true"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden gap-2 p-2">
      <ProjectSelector
        :projects="b.projects.value"
        :current-project="b.currentProject.value"
        :modules="b.modules.value"
        :leaf-modules="b.leafModules.value"
        :selected-modules="b.selectedModules.value"
        :loading-modules="b.loadingModules.value"
        @select-project="b.selectProject"
        @toggle-module="b.toggleModule"
        @clear-selection="b.clearSelection"
        @open-settings="b.showSettings.value = true"
      />

      <div class="flex-1 flex flex-col gap-2 min-w-0">
        <BuildConfig
          :current-project="b.currentProject.value"
          :selected-modules="b.selectedModules.value"
          :selected-profile="b.selectedProfile.value"
          :skip-tests="b.skipTests.value"
          :extra-args="b.extraArgs.value"
          :build-status="b.buildStatus.value"
          :output-dir="b.outputDir.value"
          :build-scope="b.buildScope.value"
          :auto-upload="b.autoUpload.value"
          :servers="b.servers.value"
          :selected-server-ids="b.selectedServerIds.value"
          @update:profile="b.selectedProfile.value = $event"
          @update:skip-tests="b.skipTests.value = $event"
          @update:extra-args="b.extraArgs.value = $event"
          @update:output-dir="b.setOutputDir"
          @update:build-scope="b.buildScope.value = $event"
          @update:auto-upload="b.autoUpload.value = $event"
          @toggle-server="b.toggleServer"
          @build="b.build"
          @upload="b.upload"
          @reset="b.resetBuild"
        />

        <!-- 选中模块列表 -->
        <div v-if="b.selectedModules.value.length > 0" class="glass-card flex-shrink-0 px-4 py-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[11px] text-tertiary">已选模块:</span>
            <div class="flex gap-1 flex-wrap">
              <span
                v-for="mod in b.selectedModules.value"
                :key="mod.path"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium group"
              >
                <span class="truncate max-w-[150px]">{{ mod.name }}</span>
                <button
                  class="w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 transition-all"
                  @click="b.toggleModule(mod)"
                >
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <button
              class="text-[10px] text-tertiary hover:text-red-500 transition-colors ml-auto"
              @click="b.clearSelection()"
            >
              清空
            </button>
          </div>
        </div>

        <BuildOutput
          :build-status="b.buildStatus.value"
          :build-logs="b.buildLogs.value"
          :build-duration="b.buildDuration.value"
        />
      </div>
    </div>

    <!-- 设置弹窗 -->
    <SettingsDialog
      v-if="b.showSettings.value"
      :projects="b.projects.value"
      :servers="b.servers.value"
      :tab="b.settingsTab.value"
      @update:tab="b.settingsTab.value = $event"
      @add-project="b.addProject"
      @remove-project="b.removeProject"
      @update-project="b.updateProject"
      @add-server="b.addServer"
      @update-server="b.updateServer"
      @remove-server="b.removeServer"
      @close="b.showSettings.value = false"
    />
  </div>
</template>
