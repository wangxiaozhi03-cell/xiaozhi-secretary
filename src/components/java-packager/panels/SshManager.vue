<script setup lang="ts">
import { ref } from 'vue'
import type { SshServer } from '../../../composables/java-packager/types'

defineProps<{
  servers: SshServer[]
}>()

const emit = defineEmits<{
  add: [data: Omit<SshServer, 'id'>]
  update: [id: string, data: Omit<SshServer, 'id'>]
  remove: [id: string]
  close: []
}>()

const editingId = ref<string | null>(null)
const formName = ref('')
const formHost = ref('')
const formPort = ref(22)
const formUsername = ref('root')
const formPassword = ref('')
const formRemotePath = ref('')
const showPassword = ref(false)

function resetForm() {
  editingId.value = null
  formName.value = ''
  formHost.value = ''
  formPort.value = 22
  formUsername.value = 'root'
  formPassword.value = ''
  formRemotePath.value = ''
  showPassword.value = false
}

function handleSave() {
  if (!formName.value.trim() || !formHost.value.trim() || !formRemotePath.value.trim()) return

  const data = {
    name: formName.value.trim(),
    host: formHost.value.trim(),
    port: formPort.value || 22,
    username: formUsername.value.trim() || 'root',
    password: formPassword.value,
    remotePath: formRemotePath.value.trim(),
  }

  if (editingId.value) {
    emit('update', editingId.value, data)
  } else {
    emit('add', data)
  }
  resetForm()
}

function startEdit(s: SshServer) {
  editingId.value = s.id
  formName.value = s.name
  formHost.value = s.host
  formPort.value = s.port
  formUsername.value = s.username
  formPassword.value = s.password || ''
  formRemotePath.value = s.remotePath
}
</script>

<template>
  <div class="space-y-4">
    <!-- 已有服务器列表 -->
    <div v-if="servers.length > 0" class="space-y-2">
      <div
        v-for="s in servers"
        :key="s.id"
        class="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] group"
      >
        <div class="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[13px] font-medium text-primary">{{ s.name }}</div>
          <div class="text-[11px] text-tertiary font-mono">{{ s.username }}@{{ s.host }}:{{ s.port }}</div>
          <div class="text-[10px] text-tertiary mt-0.5 flex items-center gap-2">
            <span>{{ s.remotePath }}</span>
            <span v-if="s.password" class="text-amber-500">🔑 密码</span>
            <span v-else class="text-green-500">🔐 免密</span>
          </div>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-500/10 text-tertiary hover:text-blue-500 transition-colors"
            @click="startEdit(s)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 text-tertiary hover:text-red-500 transition-colors"
            @click="emit('remove', s.id)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4 text-tertiary text-[12px]">
      还没有配置服务器
    </div>

    <!-- 分隔线 -->
    <div class="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

    <!-- 添加/编辑表单 -->
    <div>
      <h4 class="text-[12px] font-medium text-primary mb-3">
        {{ editingId ? '编辑服务器' : '添加服务器' }}
      </h4>
      <div class="space-y-2.5">
        <div class="flex gap-2">
          <div class="flex-1">
            <label class="text-[11px] text-tertiary mb-1 block">名称 <span class="text-red-400">*</span></label>
            <input v-model="formName" placeholder="如: 测试服务器" class="w-full h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all" />
          </div>
          <div class="w-[80px]">
            <label class="text-[11px] text-tertiary mb-1 block">端口</label>
            <input v-model.number="formPort" type="number" class="w-full h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary outline-none transition-all" />
          </div>
        </div>

        <div class="flex gap-2">
          <div class="w-[140px]">
            <label class="text-[11px] text-tertiary mb-1 block">用户名</label>
            <input v-model="formUsername" placeholder="root" class="w-full h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all" />
          </div>
          <div class="flex-1">
            <label class="text-[11px] text-tertiary mb-1 block">地址 <span class="text-red-400">*</span></label>
            <input v-model="formHost" placeholder="192.168.1.100" class="w-full h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all" />
          </div>
        </div>

        <div>
          <label class="text-[11px] text-tertiary mb-1 block">密码 <span class="text-[10px] text-tertiary/60">（留空则使用免密登录）</span></label>
          <div class="relative">
            <input
              v-model="formPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="输入密码或留空"
              class="w-full h-8 px-3 pr-9 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="text-[11px] text-tertiary mb-1 block">远程目录 <span class="text-red-400">*</span></label>
          <input v-model="formRemotePath" placeholder="/opt/app/deploy" class="w-full h-8 px-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all" />
        </div>

        <div class="flex gap-2">
          <button
            v-if="editingId"
            class="px-3 py-1.5 rounded-lg text-[11px] text-tertiary hover:text-secondary transition-colors"
            @click="resetForm"
          >
            取消
          </button>
          <button
            class="px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            :class="formName.trim() && formHost.trim() && formRemotePath.trim()
              ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
              : 'bg-black/[0.06] dark:bg-white/[0.08] text-tertiary cursor-not-allowed'"
            :disabled="!formName.trim() || !formHost.trim() || !formRemotePath.trim()"
            @click="handleSave"
          >
            {{ editingId ? '保存' : '添加' }}
          </button>
        </div>

        <p class="text-[10px] text-tertiary">
          ⚠️ 需要已配置 SSH 免密登录（ssh-copy-id）
        </p>
      </div>
    </div>
  </div>
</template>
