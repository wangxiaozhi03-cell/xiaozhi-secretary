<script setup lang="ts">
import { ref, computed } from "vue";
import type { ResponseResult } from "../../composables/curl-toolkit/types";

const props = defineProps<{
  response: ResponseResult | null;
  isLoading: boolean;
}>();

const activeTab = ref<"pretty" | "raw" | "headers">("pretty");

// 格式化 JSON
const prettyBody = computed(() => {
  if (!props.response?.body) return "";
  try {
    const obj = JSON.parse(props.response.body);
    return JSON.stringify(obj, null, 2);
  } catch {
    return props.response.body;
  }
});

// 格式化大小
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// 状态码颜色
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

// 响应 headers 列表
const responseHeaders = computed(() => {
  if (!props.response?.headers) return [];
  return Object.entries(props.response.headers);
});
</script>

<template>
  <div class="response-panel flex flex-col h-full overflow-hidden border-l border-black/[0.06] dark:border-white/[0.06]">
    <!-- 标题 -->
    <div class="flex-shrink-0 px-4 pt-4 pb-2">
      <h2 class="text-xs font-semibold text-secondary uppercase tracking-wider">响应</h2>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin text-2xl mb-2">⏳</div>
        <p class="text-xs text-tertiary">请求中...</p>
      </div>
    </div>

    <!-- 响应结果 -->
    <template v-else-if="response">
      <!-- 状态信息 -->
      <div class="flex-shrink-0 px-4 pb-3">
        <div class="flex items-center gap-3">
          <span
            class="text-xs font-bold font-mono px-2.5 py-1 rounded-lg"
            :class="[statusClass(response.status), statusBg(response.status)]"
          >
            {{ response.status }} {{ response.statusText }}
          </span>
          <span class="text-[11px] text-tertiary">{{ response.time }}ms</span>
          <span class="text-[11px] text-tertiary">{{ formatSize(response.size) }}</span>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="flex-shrink-0 px-4 pb-2">
        <div class="flex gap-1 p-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.05]">
          <button
            class="tab-btn"
            :class="activeTab === 'pretty' ? 'active' : ''"
            @click="activeTab = 'pretty'"
          >Pretty</button>
          <button
            class="tab-btn"
            :class="activeTab === 'raw' ? 'active' : ''"
            @click="activeTab = 'raw'"
          >Raw</button>
          <button
            class="tab-btn"
            :class="activeTab === 'headers' ? 'active' : ''"
            @click="activeTab = 'headers'"
          >Headers</button>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <!-- 错误信息 -->
        <div v-if="response.error" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/10">
          <p class="text-xs text-rose-600 dark:text-rose-400">{{ response.error }}</p>
        </div>

        <!-- Pretty -->
        <pre v-if="activeTab === 'pretty' && !response.error" class="response-body text-xs font-mono text-primary leading-relaxed whitespace-pre-wrap break-all">{{ prettyBody }}</pre>

        <!-- Raw -->
        <pre v-if="activeTab === 'raw' && !response.error" class="response-body text-xs font-mono text-primary leading-relaxed whitespace-pre-wrap break-all">{{ response.body }}</pre>

        <!-- Headers -->
        <div v-if="activeTab === 'headers' && !response.error" class="space-y-1.5">
          <div
            v-for="[key, value] in responseHeaders"
            :key="key"
            class="flex gap-2 text-xs font-mono"
          >
            <span class="text-blue-600 dark:text-blue-400 flex-shrink-0">{{ key }}:</span>
            <span class="text-secondary break-all">{{ value }}</span>
          </div>
          <p v-if="responseHeaders.length === 0" class="text-xs text-tertiary">无响应头</p>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-4xl mb-3">📡</div>
        <p class="text-sm text-tertiary">发送请求后查看响应</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.response-panel {
  background: rgba(0, 0, 0, 0.01);
}

:global(.dark) .response-panel {
  background: rgba(255, 255, 255, 0.01);
}

.tab-btn {
  flex: 1;
  padding: 4px 0;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: all 0.15s ease;
}

:global(.dark) .tab-btn {
  color: rgba(255, 255, 255, 0.35);
}

.tab-btn:hover {
  color: rgba(0, 0, 0, 0.55);
}

:global(.dark) .tab-btn:hover {
  color: rgba(255, 255, 255, 0.55);
}

.tab-btn.active {
  color: rgba(0, 0, 0, 0.85);
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

:global(.dark) .tab-btn.active {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(55, 65, 81, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.response-body {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  padding: 12px;
}

:global(.dark) .response-body {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.04);
}
</style>
