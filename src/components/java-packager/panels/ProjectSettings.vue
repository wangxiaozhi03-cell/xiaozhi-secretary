<script setup lang="ts">
import { ref } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import type { ProjectConfig } from '../../../composables/java-packager/types'

defineProps<{
  projects: ProjectConfig[]
}>()

const emit = defineEmits<{
  add: [data: ProjectConfig]
  remove: [index: number]
  update: [index: number, data: ProjectConfig]
  close: []
}>()

const editingIndex = ref<number | null>(null)
const formName = ref('')
const formPath = ref('')
const formProfiles = ref('dev, pro')
const formDefaultProfile = ref('dev')

function resetForm() {
  formName.value = ''
  formPath.value = ''
  formProfiles.value = 'dev, pro'
  formDefaultProfile.value = 'dev'
  editingIndex.value = null
}

async function choosePath() {
  const dir = await open({ directory: true, multiple: false, title: '选择 Maven 项目根目录' })
  if (dir) {
    formPath.value = dir as string
    if (!formName.value) {
      const parts = (dir as string).split('/')
      formName.value = parts[parts.length - 1] || ''
    }
  }
}

function handleSave() {
  if (!formName.value.trim() || !formPath.value.trim()) return
  const profiles = formProfiles.value.split(',').map(p => p.trim()).filter(Boolean)

  const config: ProjectConfig = {
    name: formName.value.trim(),
    path: formPath.value.trim(),
    profiles,
    defaultProfile: formDefaultProfile.value.trim() || profiles[0] || 'dev',
  }

  if (editingIndex.value !== null) {
    emit('update', editingIndex.value, config)
  } else {
    emit('add', config)
  }
  resetForm()
}

function startEdit(index: number, p: ProjectConfig) {
  editingIndex.value = index
  formName.value = p.name
  formPath.value = p.path
  formProfiles.value = p.profiles.join(', ')
  formDefaultProfile.value = p.defaultProfile
}
</script>

<template>
  <div class="space-y-4">
    <!-- 已有项目列表 -->
    <div v-if="projects.length > 0" class="space-y-2">
      <div
        v-for="(p, i) in projects"
        :key="i"
        class="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] group"
      >
        <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-[12px] font-bold flex-shrink-0">
          {{ p.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[13px] font-medium text-primary truncate">{{ p.name }}</div>
          <div class="text-[11px] text-tertiary truncate">{{ p.path }}</div>
          <div class="text-[10px] text-tertiary mt-0.5">
            环境: {{ p.profiles.join(' / ') }}
          </div>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-500/10 text-tertiary hover:text-blue-500 transition-colors"
            @click="startEdit(i, p)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 text-tertiary hover:text-red-500 transition-colors"
            @click="emit('remove', i)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-4 text-tertiary text-[12px]">还没有配置项目，请在下方添加</div>

    <div class="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

    <!-- 添加/编辑表单 -->
    <div>
      <h4 class="text-[12px] font-medium text-primary mb-3">
        {{ editingIndex !== null ? '编辑项目' : '添加项目' }}
      </h4>
      <div class="space-y-2.5">
        <div>
          <label class="text-[11px] text-tertiary mb-1 block">项目路径 <span class="text-red-400">*</span></label>
          <div class="flex gap-2">
            <input v-model="formPath" placeholder="/path/to/maven-project" class="flex-1 h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all" />
            <button class="h-8 px-3 rounded-lg bg-blue-500/10 text-blue-500 text-[11px] font-medium hover:bg-blue-500/20 transition-colors flex-shrink-0" @click="choosePath">浏览</button>
          </div>
        </div>

        <div>
          <label class="text-[11px] text-tertiary mb-1 block">项目名称 <span class="text-red-400">*</span></label>
          <input v-model="formName" placeholder="如: cloud10086" class="w-full h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all" />
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="text-[11px] text-tertiary mb-1 block">环境列表（逗号分隔）</label>
            <input v-model="formProfiles" placeholder="dev, test, prod" class="w-full h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all" />
          </div>
          <div class="w-[100px]">
            <label class="text-[11px] text-tertiary mb-1 block">默认环境</label>
            <input v-model="formDefaultProfile" placeholder="dev" class="w-full h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all" />
          </div>
        </div>

        <div class="flex gap-2 pt-1">
          <button v-if="editingIndex !== null" class="px-3 py-1.5 rounded-lg text-[11px] text-tertiary hover:text-secondary transition-colors" @click="resetForm">取消编辑</button>
          <button
            class="px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            :class="formName.trim() && formPath.trim()
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
              : 'bg-black/[0.06] dark:bg-white/[0.08] text-tertiary cursor-not-allowed'"
            :disabled="!formName.trim() || !formPath.trim()"
            @click="handleSave"
          >
            {{ editingIndex !== null ? '保存修改' : '添加项目' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
