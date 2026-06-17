<script setup lang="ts">
import type { ProjectConfig, SshServer } from '../../../composables/java-packager/types'
import ProjectSettings from './ProjectSettings.vue'
import SshManager from './SshManager.vue'

defineProps<{
  projects: ProjectConfig[]
  servers: SshServer[]
  tab: 'projects' | 'servers'
}>()

const emit = defineEmits<{
  'update:tab': [value: 'projects' | 'servers']
  addProject: [data: ProjectConfig]
  removeProject: [index: number]
  updateProject: [index: number, data: ProjectConfig]
  addServer: [data: Omit<SshServer, 'id'>]
  updateServer: [id: string, data: Omit<SshServer, 'id'>]
  removeServer: [id: string]
  close: []
}>()

function handleUpdateProject(index: number, data: ProjectConfig) {
  emit('updateProject', index, data)
}

function handleUpdateServer(id: string, data: Omit<SshServer, 'id'>) {
  emit('updateServer', id, data)
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click.self="emit('close')">
    <div class="glass-card w-[560px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <h2 class="text-[15px] font-semibold text-primary">项目 & 服务器管理</h2>
          <p class="text-[11px] text-tertiary mt-0.5">配置 Maven 项目和 SSH 服务器</p>
        </div>
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
          @click="emit('close')"
        >
          <svg class="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex px-5 pt-3 gap-1">
        <button
          class="px-4 py-2 rounded-t-xl text-[12px] font-medium transition-all"
          :class="tab === 'projects'
            ? 'bg-blue-500/10 text-blue-600 border-b-2 border-blue-500'
            : 'text-tertiary hover:text-secondary'"
          @click="emit('update:tab', 'projects')"
        >
          📁 项目管理
        </button>
        <button
          class="px-4 py-2 rounded-t-xl text-[12px] font-medium transition-all"
          :class="tab === 'servers'
            ? 'bg-green-500/10 text-green-600 border-b-2 border-green-500'
            : 'text-tertiary hover:text-secondary'"
          @click="emit('update:tab', 'servers')"
        >
          🖥 服务器管理
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5">
        <ProjectSettings
          v-if="tab === 'projects'"
          :projects="projects"
          @add="emit('addProject', $event)"
          @remove="emit('removeProject', $event)"
          @update="handleUpdateProject"
        />
        <SshManager
          v-if="tab === 'servers'"
          :servers="servers"
          @add="emit('addServer', $event)"
          @update="handleUpdateServer"
          @remove="emit('removeServer', $event)"
        />
      </div>
    </div>
  </div>
</template>
