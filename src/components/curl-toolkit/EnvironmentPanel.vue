<script setup lang="ts">
import { ref } from "vue";
import type { Environment, HistoryItem } from "../../composables/curl-toolkit/types";

defineProps<{
  environments: Environment[];
  selectedEnvId: string | null;
  history: HistoryItem[];
}>();

const emit = defineEmits<{
  selectEnv: [id: string | null];
  addEnv: [env: { name: string; domain: string; port: string | null; protocol: "http" | "https" }];
  removeEnv: [id: string];
  selectHistory: [item: HistoryItem];
}>();

// 添加环境表单
const showAddForm = ref(false);
const newName = ref("");
const newDomain = ref("");
const newPort = ref("");
const newProtocol = ref<"http" | "https">("http");

function handleAdd() {
  if (!newName.value.trim() || !newDomain.value.trim()) return;
  emit("addEnv", {
    name: newName.value.trim(),
    domain: newDomain.value.trim(),
    port: newPort.value.trim() || null,
    protocol: newProtocol.value,
  });
  newName.value = "";
  newDomain.value = "";
  newPort.value = "";
  showAddForm.value = false;
}

function statusColor(status: number | null): string {
  if (!status) return "text-gray-400";
  if (status >= 200 && status < 300) return "text-emerald-600 dark:text-emerald-400";
  if (status >= 300 && status < 400) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}
</script>

<template>
  <aside class="env-panel flex flex-col flex-shrink-0 w-[220px] border-r border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
    <!-- 环境管理 -->
    <div class="flex-shrink-0 px-4 pt-4 pb-2">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold text-secondary uppercase tracking-wider">环境</h2>
        <button
          class="text-[10px] text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          @click="showAddForm = !showAddForm"
        >
          {{ showAddForm ? '取消' : '+ 添加' }}
        </button>
      </div>
    </div>

    <!-- 添加环境表单 -->
    <div v-if="showAddForm" class="flex-shrink-0 px-4 pb-3">
      <div class="add-form p-3 rounded-xl space-y-2">
        <input
          v-model="newName"
          class="form-input w-full"
          placeholder="名称 (如 Local)"
        />
        <input
          v-model="newDomain"
          class="form-input w-full"
          placeholder="域名 (如 localhost)"
        />
        <input
          v-model="newPort"
          class="form-input w-full"
          placeholder="端口 (如 8080)"
        />
        <div class="flex gap-1.5">
          <button
            class="protocol-btn flex-1"
            :class="newProtocol === 'http' ? 'active' : ''"
            @click="newProtocol = 'http'"
          >HTTP</button>
          <button
            class="protocol-btn flex-1"
            :class="newProtocol === 'https' ? 'active' : ''"
            @click="newProtocol = 'https'"
          >HTTPS</button>
        </div>
        <button
          class="w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
          @click="handleAdd"
        >
          添加
        </button>
      </div>
    </div>

    <!-- 环境列表 -->
    <div class="flex-shrink-0 px-2 pb-2 space-y-0.5">
      <button
        class="env-item w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left"
        :class="selectedEnvId === null ? 'active' : ''"
        @click="emit('selectEnv', null)"
      >
        <span class="text-xs text-secondary">原始域名</span>
      </button>
      <div
        v-for="env in environments"
        :key="env.id"
        class="env-item w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group"
        :class="selectedEnvId === env.id ? 'active' : ''"
        @click="emit('selectEnv', env.id)"
      >
        <div class="flex-1 min-w-0">
          <div class="text-xs font-medium" :class="selectedEnvId === env.id ? 'text-blue-600 dark:text-blue-400' : 'text-primary'">
            {{ env.name }}
          </div>
          <div class="text-[10px] text-tertiary truncate">
            {{ env.protocol }}://{{ env.domain }}{{ env.port ? ':' + env.port : '' }}
          </div>
        </div>
        <button
          class="opacity-0 group-hover:opacity-100 p-1 rounded text-tertiary hover:text-rose-500 transition-all cursor-pointer"
          @click.stop="emit('removeEnv', env.id)"
          title="删除"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="flex-shrink-0 border-t border-black/[0.06] dark:border-white/[0.06]" />

    <!-- 历史记录 -->
    <div class="flex-shrink-0 px-4 py-2">
      <h2 class="text-xs font-semibold text-secondary uppercase tracking-wider">历史记录</h2>
    </div>
    <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
      <button
        v-for="item in history.slice(0, 20)"
        :key="item.id"
        class="history-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left"
        @click="emit('selectHistory', item)"
      >
        <span class="text-[10px] font-mono font-semibold flex-shrink-0" :class="item.method === 'GET' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'">
          {{ item.method }}
        </span>
        <span class="text-[11px] text-secondary truncate flex-1">{{ item.url }}</span>
        <span class="text-[10px] font-mono flex-shrink-0" :class="statusColor(item.status)">
          {{ item.status || '—' }}
        </span>
      </button>
      <p v-if="history.length === 0" class="text-[10px] text-tertiary text-center py-4">暂无历史</p>
    </div>
  </aside>
</template>

<style scoped>
.env-panel {
  background: rgba(0, 0, 0, 0.01);
}

:global(.dark) .env-panel {
  background: rgba(255, 255, 255, 0.02);
}

.env-item {
  cursor: pointer;
}

.env-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark) .env-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.env-item.active {
  background: rgba(59, 130, 246, 0.06);
}

:global(.dark) .env-item.active {
  background: rgba(59, 130, 246, 0.1);
}

.history-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark) .history-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.add-form {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

:global(.dark) .add-form {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.04);
}

.form-input {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.85);
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  outline: none;
  transition: all 0.15s ease;
}

:global(.dark) .form-input {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.06);
}

.form-input:focus {
  border-color: rgba(59, 130, 246, 0.4);
}

.form-input::placeholder {
  color: rgba(0, 0, 0, 0.25);
}

:global(.dark) .form-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.protocol-btn {
  padding: 4px 0;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  color: rgba(0, 0, 0, 0.35);
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.15s ease;
}

:global(.dark) .protocol-btn {
  color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.04);
}

.protocol-btn.active {
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.2);
}

:global(.dark) .protocol-btn.active {
  color: #60A5FA;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
}
</style>
