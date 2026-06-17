<script setup lang="ts">
import { ref } from "vue";
import CurlInput from "./CurlInput.vue";
import ResponsePanel from "./ResponsePanel.vue";
import { invoke } from "@tauri-apps/api/core";
import { useEnvironments } from "../../composables/curl-toolkit/useEnvironments";
import type { ResponseResult } from "../../composables/curl-toolkit/types";

const { environments, selectedEnvId, activeEnv, selectEnv, addEnv, removeEnv } = useEnvironments();

const response = ref<ResponseResult | null>(null);
const isLoading = ref(false);
const curlInputRef = ref<InstanceType<typeof CurlInput> | null>(null);

// 拖拽分隔线
const splitPercent = ref(50);
const isDragging = ref(false);
const containerRef = ref<HTMLDivElement>();

function startDrag(e: MouseEvent) {
  isDragging.value = true;
  e.preventDefault();
  const onMove = (ev: MouseEvent) => {
    if (!containerRef.value || !isDragging.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    const pct = ((ev.clientX - rect.left) / rect.width) * 100;
    splitPercent.value = Math.min(Math.max(pct, 20), 80);
  };
  const onUp = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

// 添加环境弹窗
const showAddEnv = ref(false);
const newName = ref("");
const newDomain = ref("");
const newPort = ref("");
const newProtocol = ref<"http" | "https">("http");

function handleAddEnv() {
  if (!newName.value.trim() || !newDomain.value.trim()) return;
  addEnv({ name: newName.value.trim(), domain: newDomain.value.trim(), port: newPort.value.trim() || null, protocol: newProtocol.value });
  newName.value = ""; newDomain.value = ""; newPort.value = ""; showAddEnv.value = false;
}

async function handleSend(request: { url: string; method: string; headers: Record<string, string>; body: string | null }) {
  isLoading.value = true;
  response.value = null;
  try {
    const result: any = await invoke("http_request", {
      params: { method: request.method, url: request.url, headers: request.headers, body: request.body },
    });
    response.value = {
      status: result.status, statusText: result.status_text, headers: result.headers || {},
      body: result.body || "", size: result.size || 0, time: result.time || 0, error: result.error || null,
    };
  } catch (e: any) {
    response.value = {
      status: 0, statusText: "Error", headers: {}, body: "", size: 0, time: 0,
      error: typeof e === "string" ? e : e.message || "请求失败",
    };
  } finally {
    isLoading.value = false;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 顶部导航栏 -->
    <header class="glass-bar px-4 py-2 flex-shrink-0 border-b border-black/[0.04] dark:border-white/[0.06]">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="text-sm font-semibold text-primary flex-shrink-0">Curl</h1>

          <nav class="flex items-center gap-0.5 p-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] overflow-x-auto">
            <button
              class="px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 whitespace-nowrap"
              :class="selectedEnvId === null ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-tertiary hover:text-secondary'"
              @click="selectEnv(null)"
            >原始</button>
            <button
              v-for="env in environments" :key="env.id"
              class="group px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 whitespace-nowrap relative"
              :class="selectedEnvId === env.id ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-tertiary hover:text-secondary'"
              @click="selectEnv(env.id)"
            >
              {{ env.name }}
              <span class="hidden group-hover:inline-block ml-1 text-[9px] text-rose-400 cursor-pointer" @click.stop="removeEnv(env.id)">✕</span>
            </button>
          </nav>

          <div class="relative flex-shrink-0">
            <button
              class="w-6 h-6 rounded-md flex items-center justify-center text-tertiary hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
              @click="showAddEnv = !showAddEnv" title="添加环境"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            </button>
            <div v-if="showAddEnv" class="absolute top-full left-0 mt-1 z-50 w-[240px] p-3 rounded-xl bg-white dark:bg-gray-800 border border-black/[0.08] dark:border-white/[0.08] shadow-lg space-y-2">
              <input v-model="newName" class="env-input w-full" placeholder="名称 (如 Local)" />
              <input v-model="newDomain" class="env-input w-full" placeholder="域名 (如 localhost)" />
              <input v-model="newPort" class="env-input w-full" placeholder="端口 (如 8080)" />
              <div class="flex gap-1">
                <button class="protocol-btn flex-1" :class="newProtocol === 'http' ? 'active' : ''" @click="newProtocol = 'http'">HTTP</button>
                <button class="protocol-btn flex-1" :class="newProtocol === 'https' ? 'active' : ''" @click="newProtocol = 'https'">HTTPS</button>
              </div>
              <div class="flex gap-2">
                <button class="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer" @click="handleAddEnv">添加</button>
                <button class="flex-1 py-1.5 rounded-lg text-[11px] font-medium text-tertiary hover:text-secondary bg-black/[0.03] dark:bg-white/[0.05] transition-colors cursor-pointer" @click="showAddEnv = false">取消</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <span v-if="response" class="text-[10px] px-2 py-1 rounded-full" :class="{
            'bg-gray-100 dark:bg-gray-800 text-tertiary': !response.status,
            'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': response.status >= 200 && response.status < 300,
            'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400': response.status >= 300 && response.status < 400,
            'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400': response.status >= 400 || response.error,
          }">
            {{ response.status || 'Error' }} · {{ response.time }}ms · {{ formatSize(response.size) }}
          </span>
          <span v-if="isLoading" class="text-[10px] text-tertiary animate-pulse">请求中...</span>
        </div>
      </div>
    </header>

    <!-- 内容区：可拖拽分割 -->
    <div ref="containerRef" class="flex-1 flex overflow-hidden relative">
      <div class="flex flex-col min-w-0 overflow-hidden" :style="{ width: splitPercent + '%' }">
        <CurlInput ref="curlInputRef" :active-env="activeEnv" @send="handleSend" />
      </div>

      <!-- 分隔线 -->
      <div
        class="w-1 flex-shrink-0 cursor-col-resize hover:bg-blue-400/40 dark:hover:bg-blue-500/30 transition-colors relative z-10"
        :class="isDragging ? 'bg-blue-400/40 dark:bg-blue-500/30' : 'bg-black/[0.06] dark:bg-white/[0.06]'"
        @mousedown="startDrag"
      />

      <div class="flex-1 min-w-0 overflow-hidden">
        <ResponsePanel :response="response" :is-loading="isLoading" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.env-input {
  padding: 5px 8px; border-radius: 6px; font-size: 11px;
  color: rgba(0, 0, 0, 0.85); background: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.08); outline: none; transition: all 0.15s ease;
}
:global(.dark) .env-input { color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.08); }
.env-input:focus { border-color: rgba(59, 130, 246, 0.4); }
.env-input::placeholder { color: rgba(0, 0, 0, 0.2); }
:global(.dark) .env-input::placeholder { color: rgba(255, 255, 255, 0.2); }

.protocol-btn {
  padding: 3px 0; border-radius: 6px; font-size: 10px; font-weight: 600; text-align: center;
  color: rgba(0, 0, 0, 0.35); background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.06); cursor: pointer; transition: all 0.15s ease;
}
:global(.dark) .protocol-btn { color: rgba(255, 255, 255, 0.35); background: rgba(255, 255, 255, 0.03); border-color: rgba(255, 255, 255, 0.06); }
.protocol-btn.active { color: #3B82F6; background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.2); }
:global(.dark) .protocol-btn.active { color: #60A5FA; background: rgba(59, 130, 246, 0.12); border-color: rgba(59, 130, 246, 0.25); }
</style>
