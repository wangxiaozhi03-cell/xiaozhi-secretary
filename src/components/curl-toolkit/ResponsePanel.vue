<script setup lang="ts">
import { ref, computed } from "vue";
import type { ResponseResult } from "../../composables/curl-toolkit/types";

const props = defineProps<{
  response: ResponseResult | null;
  isLoading: boolean;
}>();

const activeTab = ref<"body" | "headers">("body");

// 格式化 JSON
const prettyBody = computed(() => {
  if (!props.response?.body) return "";
  try {
    return JSON.stringify(JSON.parse(props.response.body), null, 2);
  } catch {
    return props.response.body;
  }
});

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return "text-emerald-600 dark:text-emerald-400";
  if (status >= 300 && status < 400) return "text-amber-600 dark:text-amber-400";
  if (status >= 400 && status < 500) return "text-orange-600 dark:text-orange-400";
  return "text-rose-600 dark:text-rose-400";
}

function statusBg(status: number): string {
  if (status >= 200 && status < 300) return "bg-emerald-50 dark:bg-emerald-500/10";
  if (status >= 300 && status < 400) return "bg-amber-50 dark:bg-amber-500/10";
  if (status >= 400 && status < 500) return "bg-orange-50 dark:bg-orange-500/10";
  return "bg-rose-50 dark:bg-rose-500/10";
}

const responseHeaders = computed(() => {
  if (!props.response?.headers) return [];
  return Object.entries(props.response.headers);
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden border-l border-black/[0.04] dark:border-white/[0.06]">
    <!-- 状态 + Tab -->
    <div class="flex-shrink-0 px-3 pt-3 pb-2 space-y-2">
      <div v-if="response" class="flex items-center gap-2">
        <span class="text-xs font-bold font-mono px-2 py-0.5 rounded-md" :class="[statusClass(response.status), statusBg(response.status)]">
          {{ response.status }} {{ response.statusText }}
        </span>
        <span class="text-[10px] text-tertiary">{{ response.time }}ms</span>
        <span class="text-[10px] text-tertiary">{{ formatSize(response.size) }}</span>
      </div>
      <nav class="flex items-center gap-0.5 p-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] w-fit">
        <button v-for="tab in [{ id: 'body', label: 'Body' }, { id: 'headers', label: 'Headers' }]" :key="tab.id"
          class="px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200"
          :class="activeTab === tab.id ? 'bg-[#EEF2F8] dark:bg-gray-800 text-primary shadow-sm' : 'text-tertiary hover:text-secondary'"
          @click="activeTab = tab.id as any"
        >{{ tab.label }}</button>
      </nav>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin text-2xl mb-2">⏳</div>
        <p class="text-xs text-tertiary">请求中...</p>
      </div>
    </div>

    <!-- 响应内容 -->
    <template v-else-if="response">
      <div v-if="response.error" class="mx-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/10">
        <p class="text-xs text-rose-600 dark:text-rose-400">{{ response.error }}</p>
      </div>

      <!-- Body -->
      <div v-if="activeTab === 'body' && !response.error" class="flex-1 overflow-y-auto px-3 pb-3">
        <pre class="response-body text-xs font-mono text-primary leading-relaxed whitespace-pre-wrap break-all">{{ prettyBody }}</pre>
      </div>

      <!-- Headers -->
      <div v-if="activeTab === 'headers' && !response.error" class="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        <div v-for="[key, value] in responseHeaders" :key="key" class="flex gap-2 text-xs font-mono">
          <span class="text-blue-600 dark:text-blue-400 flex-shrink-0">{{ key }}:</span>
          <span class="text-secondary break-all">{{ value }}</span>
        </div>
        <p v-if="responseHeaders.length === 0" class="text-xs text-tertiary">无响应头</p>
      </div>
    </template>

    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-4xl mb-3">📡</div>
        <p class="text-sm text-tertiary">发送请求后查看响应</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.response-body {
  background: rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  padding: 10px 12px;
}
:global(.dark) .response-body {
  background: rgba(255, 255, 255, 0.01);
  border-color: rgba(255, 255, 255, 0.04);
}
</style>
