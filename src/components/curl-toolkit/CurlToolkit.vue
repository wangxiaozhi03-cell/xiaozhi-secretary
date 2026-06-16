<script setup lang="ts">
import { ref } from "vue";
import CurlInput from "./CurlInput.vue";
import EnvironmentPanel from "./EnvironmentPanel.vue";
import ResponsePanel from "./ResponsePanel.vue";
import { invoke } from "@tauri-apps/api/core";
import { useEnvironments } from "../../composables/curl-toolkit/useEnvironments";
import type { ResponseResult, HistoryItem } from "../../composables/curl-toolkit/types";

const { environments, selectedEnvId, activeEnv, selectEnv, addEnv, removeEnv } = useEnvironments();

const response = ref<ResponseResult | null>(null);
const isLoading = ref(false);
const history = ref<HistoryItem[]>([]);
const curlInputRef = ref<InstanceType<typeof CurlInput> | null>(null);

async function handleSend(request: { url: string; method: string; headers: Record<string, string>; body: string | null }) {
  isLoading.value = true;
  response.value = null;

  try {
    const result: any = await invoke("http_request", {
      params: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      },
    });

    response.value = {
      status: result.status,
      statusText: result.status_text,
      headers: result.headers || {},
      body: result.body || "",
      size: result.size || 0,
      time: result.time || 0,
      error: result.error || null,
    };

    // 添加历史
    history.value.unshift({
      id: Date.now().toString(),
      method: request.method,
      url: request.url,
      status: result.status,
      timestamp: Date.now(),
      curl: "", // 不再保存原始 curl，直接用编辑后的参数
    });
    if (history.value.length > 50) history.value.pop();
  } catch (e: any) {
    response.value = {
      status: 0,
      statusText: "Error",
      headers: {},
      body: "",
      size: 0,
      time: 0,
      error: typeof e === "string" ? e : e.message || "请求失败",
    };
  } finally {
    isLoading.value = false;
  }
}

function handleSelectHistory(item: HistoryItem) {
  curlInputRef.value?.setCurl(item.curl);
}

</script>

<template>
  <div class="curl-toolkit-root flex flex-col h-full overflow-hidden">
    <!-- 内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧：环境管理 + 历史 -->
      <EnvironmentPanel
        :environments="environments"
        :selected-env-id="selectedEnvId"
        :history="history"
        @select-env="selectEnv"
        @add-env="addEnv"
        @remove-env="removeEnv"
        @select-history="handleSelectHistory"
      />

      <!-- 中间：Curl 输入 + 解析 -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CurlInput
          ref="curlInputRef"
          :active-env="activeEnv"
          @send="handleSend"
        />
      </div>

      <!-- 右侧：响应展示 -->
      <div class="w-[360px] flex-shrink-0">
        <ResponsePanel
          :response="response"
          :is-loading="isLoading"
        />
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="curl-status-bar flex-shrink-0 px-4 py-1.5 flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.06]">
      <div class="flex items-center gap-3 text-[11px] text-tertiary">
        <span v-if="activeEnv">环境: {{ activeEnv.name }}</span>
        <span v-else>环境: 原始域名</span>
        <span v-if="response">
          状态:
          <span :class="response.status >= 200 && response.status < 300 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            {{ response.status || 'Error' }}
          </span>
        </span>
      </div>
      <div class="flex items-center gap-3 text-[11px] text-tertiary">
        <span>⌘Enter 发送</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.curl-toolkit-root {
  position: relative;
}

.curl-status-bar {
  background: rgba(0, 0, 0, 0.01);
}

:global(.dark) .curl-status-bar {
  background: rgba(255, 255, 255, 0.02);
}
</style>
