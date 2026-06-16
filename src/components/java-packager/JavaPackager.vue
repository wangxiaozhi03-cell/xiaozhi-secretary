<script setup lang="ts">
import { onMounted } from 'vue'
import { useMavenBuilder } from '../../composables/java-packager/useMavenBuilder'
import ProjectSelector from './panels/ProjectSelector.vue'
import ProjectSettings from './panels/ProjectSettings.vue'
import BuildConfig from './panels/BuildConfig.vue'
import BuildOutput from './panels/BuildOutput.vue'

const {
  projects,
  currentProject,
  modules,
  leafModules,
  selectedModules,
  selectedProfile,
  skipTests,
  extraArgs,
  buildStatus,
  buildLogs,
  buildDuration,
  mavenVersion,
  loadingModules,
  outputDir,
  buildScope,
  showSettings,
  checkMaven,
  addProject,
  removeProject,
  updateProject,
  selectProject,
  toggleModule,
  clearSelection,
  setOutputDir,
  build,
  resetBuild,
} = useMavenBuilder()

onMounted(() => {
  checkMaven()
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
        <div v-if="mavenVersion" class="flex items-center gap-2 text-[11px] text-tertiary">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
          {{ mavenVersion }}
        </div>
        <div v-else class="flex items-center gap-2 text-[11px] text-red-400">
          <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          Maven 未安装
        </div>
        <!-- 项目管理按钮 -->
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors text-tertiary hover:text-primary"
          title="项目管理"
          @click="showSettings = true"
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
        :projects="projects"
        :current-project="currentProject"
        :modules="modules"
        :leaf-modules="leafModules"
        :selected-modules="selectedModules"
        :loading-modules="loadingModules"
        @select-project="selectProject"
        @toggle-module="toggleModule"
        @clear-selection="clearSelection"
        @open-settings="showSettings = true"
      />

      <div class="flex-1 flex flex-col gap-2 min-w-0">
        <BuildConfig
          :current-project="currentProject"
          :selected-modules="selectedModules"
          :selected-profile="selectedProfile"
          :skip-tests="skipTests"
          :extra-args="extraArgs"
          :build-status="buildStatus"
          :output-dir="outputDir"
          :build-scope="buildScope"
          @update:profile="selectedProfile = $event"
          @update:skip-tests="skipTests = $event"
          @update:extra-args="extraArgs = $event"
          @update:output-dir="setOutputDir"
          @update:build-scope="buildScope = $event"
          @build="build"
          @reset="resetBuild"
        />
        <BuildOutput
          :build-status="buildStatus"
          :build-logs="buildLogs"
          :build-duration="buildDuration"
        />
      </div>
    </div>

    <!-- 项目管理弹窗 -->
    <ProjectSettings
      v-if="showSettings"
      :projects="projects"
      @add="addProject"
      @remove="removeProject"
      @update="updateProject"
      @close="showSettings = false"
    />
  </div>
</template>
