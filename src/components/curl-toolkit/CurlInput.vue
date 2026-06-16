<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { ParsedRequest, Environment } from "../../composables/curl-toolkit/types";
import { parseCurl, buildUrl, formatJson } from "../../composables/curl-toolkit/useCurlParser";

const props = defineProps<{
  activeEnv: Environment | null;
}>();

const emit = defineEmits<{
  send: [request: { url: string; method: string; headers: Record<string, string>; body: string | null }];
}>();

const curlInput = ref("");
const parsed = ref<ParsedRequest | null>(null);
const enableDomainReplace = ref(true);
const appendApi = ref(false);

// 编辑区 tab
const editTab = ref<"headers" | "body">("headers");

// 可编辑的 headers
const editableHeaders = ref<{ key: string; value: string; enabled: boolean }[]>([]);

// Body 类型和内容
const bodyType = ref<"json" | "form" | "text">("json");
const bodyJson = ref("");
const bodyForm = ref<{ key: string; value: string }[]>([]);
const bodyText = ref("");

// 解析 curl
watch(curlInput, (val) => {
  if (val.trim()) {
    try {
      parsed.value = parseCurl(val);
      appendApi.value = parsed.value.path.startsWith("/api");
      // 填充可编辑 headers
      editableHeaders.value = Object.entries(parsed.value.headers).map(([key, value]) => ({
        key,
        value,
        enabled: true,
      }));
      // 填充 body
      initBody(parsed.value.body);
    } catch {
      parsed.value = null;
    }
  } else {
    parsed.value = null;
  }
});

// 初始化 body 内容
function initBody(body: string | null) {
  if (!body) {
    bodyJson.value = "";
    bodyForm.value = [];
    bodyText.value = "";
    return;
  }

  // 尝试解析为 JSON
  try {
    JSON.parse(body);
    bodyType.value = "json";
    bodyJson.value = formatJson(body).formatted;
    bodyForm.value = [];
    bodyText.value = "";
    return;
  } catch {
    // 不是 JSON
  }

  // 尝试解析为 form-urlencoded
  if (body.includes("=") && !body.startsWith("{")) {
    try {
      const params = new URLSearchParams(body);
      const pairs: { key: string; value: string }[] = [];
      params.forEach((value, key) => {
        pairs.push({ key, value });
      });
      if (pairs.length > 0) {
        bodyType.value = "form";
        bodyForm.value = pairs;
        bodyJson.value = "";
        bodyText.value = "";
        return;
      }
    } catch {
      // 不是 form
    }
  }

  // 默认为 text
  bodyType.value = "text";
  bodyText.value = body;
  bodyJson.value = "";
  bodyForm.value = [];
}

// 替换后的 URL
const finalUrl = computed(() => {
  if (!parsed.value) return "";
  if (!enableDomainReplace.value || !props.activeEnv) return parsed.value.url;
  return buildUrl(parsed.value, props.activeEnv, appendApi.value);
});

// 原始域名
const originalDomain = computed(() => parsed.value?.hostname || "");

// 添加 header
function addHeader() {
  editableHeaders.value.push({ key: "", value: "", enabled: true });
}

// 删除 header
function removeHeader(index: number) {
  editableHeaders.value.splice(index, 1);
}

// 添加 form 参数
function addFormParam() {
  bodyForm.value.push({ key: "", value: "" });
}

// 删除 form 参数
function removeFormParam(index: number) {
  bodyForm.value.splice(index, 1);
}

// 构建最终 headers
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const h of editableHeaders.value) {
    if (h.enabled && h.key.trim()) {
      headers[h.key.trim()] = h.value;
    }
  }
  return headers;
}

// 构建最终 body
function buildBody(): string | null {
  if (bodyType.value === "json") {
    return bodyJson.value.trim() || null;
  }
  if (bodyType.value === "form") {
    const params = new URLSearchParams();
    for (const p of bodyForm.value) {
      if (p.key.trim()) {
        params.append(p.key.trim(), p.value);
      }
    }
    return params.toString() || null;
  }
  return bodyText.value.trim() || null;
}

function handleSend() {
  if (!parsed.value) return;
  emit("send", {
    url: finalUrl.value,
    method: parsed.value.method,
    headers: buildHeaders(),
    body: buildBody(),
  });
}

function handleClear() {
  curlInput.value = "";
  parsed.value = null;
}

// 暴露方法供外部设置 curl
function setCurl(curl: string) {
  curlInput.value = curl;
}

defineExpose({ setCurl });
</script>

<template>
  <div class="curl-input-root flex flex-col h-full overflow-hidden">
    <!-- 输入区 -->
    <div class="flex-shrink-0 p-4 pb-2">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xs font-semibold text-secondary uppercase tracking-wider">Curl 命令</h3>
        <button
          v-if="curlInput"
          class="text-[11px] text-tertiary hover:text-secondary transition-colors cursor-pointer"
          @click="handleClear"
        >
          清空
        </button>
      </div>
      <textarea
        v-model="curlInput"
        class="curl-textarea w-full h-[120px] resize-none p-3 text-sm font-mono leading-relaxed text-primary bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl outline-none transition-all"
        placeholder="粘贴 curl 命令..."
        spellcheck="false"
      />
    </div>

    <!-- 域名替换 + 发送 -->
    <div v-if="parsed" class="flex-shrink-0 px-4 pb-2">
      <div class="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]">
        <div class="flex items-center gap-3 min-w-0 flex-wrap">
          <label class="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <input v-model="enableDomainReplace" type="checkbox" class="accent-blue-500" />
            <span class="text-xs font-medium text-secondary">域名替换</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <input v-model="appendApi" type="checkbox" class="accent-blue-500" />
            <span class="text-xs font-medium text-secondary">追加 /api</span>
          </label>
          <div v-if="enableDomainReplace && activeEnv" class="flex items-center gap-2 text-[11px] min-w-0">
            <span class="text-tertiary truncate">{{ originalDomain }}</span>
            <svg class="w-3 h-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span class="text-blue-600 dark:text-blue-400 font-medium truncate">{{ activeEnv.domain }}{{ activeEnv.port ? ':' + activeEnv.port : '' }}{{ appendApi ? '/api' : '' }}</span>
          </div>
          <span v-else-if="!activeEnv" class="text-[11px] text-tertiary">未选择环境</span>
        </div>
        <button
          class="send-btn flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
          @click="handleSend"
        >
          发送请求
        </button>
      </div>
    </div>

    <!-- 解析结果：Method + URL -->
    <div v-if="parsed" class="flex-shrink-0 px-4 pb-2">
      <div class="parsed-block">
        <div class="flex items-center gap-2">
          <span class="method-badge" :class="'method-' + parsed.method.toLowerCase()">{{ parsed.method }}</span>
          <span class="text-xs font-mono text-primary break-all flex-1">{{ finalUrl }}</span>
        </div>
      </div>
    </div>

    <!-- Headers / Body 编辑区 -->
    <div v-if="parsed" class="flex-1 flex flex-col min-h-0 overflow-hidden px-4 pb-4">
      <!-- Tab 导航 -->
      <div class="flex items-center gap-1 mb-2 flex-shrink-0">
        <button
          class="edit-tab"
          :class="editTab === 'headers' ? 'active' : ''"
          @click="editTab = 'headers'"
        >
          Headers
          <span class="tab-count">{{ editableHeaders.filter(h => h.enabled && h.key.trim()).length }}</span>
        </button>
        <button
          class="edit-tab"
          :class="editTab === 'body' ? 'active' : ''"
          @click="editTab = 'body'"
        >
          Body
        </button>
      </div>

      <!-- Headers 编辑 -->
      <div v-if="editTab === 'headers'" class="flex-1 overflow-y-auto space-y-1.5">
        <div
          v-for="(header, index) in editableHeaders"
          :key="index"
          class="flex items-center gap-1.5"
        >
          <input
            v-model="header.enabled"
            type="checkbox"
            class="accent-blue-500 flex-shrink-0"
          />
          <input
            v-model="header.key"
            class="header-input flex-shrink-0 w-[140px]"
            placeholder="Key"
          />
          <input
            v-model="header.value"
            class="header-input flex-1 min-w-0"
            placeholder="Value"
          />
          <button
            class="p-1 rounded text-tertiary hover:text-rose-500 transition-colors cursor-pointer flex-shrink-0"
            @click="removeHeader(index)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          class="add-btn"
          @click="addHeader"
        >
          + 添加 Header
        </button>
      </div>

      <!-- Body 编辑 -->
      <div v-if="editTab === 'body'" class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- Body 类型切换 -->
        <div class="flex items-center gap-1 mb-2 flex-shrink-0">
          <button
            class="body-type-btn"
            :class="bodyType === 'json' ? 'active' : ''"
            @click="bodyType = 'json'"
          >JSON</button>
          <button
            class="body-type-btn"
            :class="bodyType === 'form' ? 'active' : ''"
            @click="bodyType = 'form'"
          >Form</button>
          <button
            class="body-type-btn"
            :class="bodyType === 'text' ? 'active' : ''"
            @click="bodyType = 'text'"
          >Text</button>
        </div>

        <!-- JSON 编辑 -->
        <textarea
          v-if="bodyType === 'json'"
          v-model="bodyJson"
          class="body-textarea flex-1 resize-none"
          placeholder='{"key": "value"}'
          spellcheck="false"
        />

        <!-- Form 编辑 -->
        <div v-if="bodyType === 'form'" class="flex-1 overflow-y-auto space-y-1.5">
          <div
            v-for="(param, index) in bodyForm"
            :key="index"
            class="flex items-center gap-1.5"
          >
            <input
              v-model="param.key"
              class="header-input flex-shrink-0 w-[140px]"
              placeholder="Key"
            />
            <input
              v-model="param.value"
              class="header-input flex-1 min-w-0"
              placeholder="Value"
            />
            <button
              class="p-1 rounded text-tertiary hover:text-rose-500 transition-colors cursor-pointer flex-shrink-0"
              @click="removeFormParam(index)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button class="add-btn" @click="addFormParam">
            + 添加参数
          </button>
        </div>

        <!-- Text 编辑 -->
        <textarea
          v-if="bodyType === 'text'"
          v-model="bodyText"
          class="body-textarea flex-1 resize-none"
          placeholder="Raw text body..."
          spellcheck="false"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-4xl mb-3">📋</div>
        <p class="text-sm text-tertiary">粘贴 curl 命令开始</p>
        <p class="text-xs text-tertiary mt-1">支持 -X / -H / -d 等参数</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.curl-textarea::placeholder {
  color: rgba(0, 0, 0, 0.25);
}

:global(.dark) .curl-textarea::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.curl-textarea:focus {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.parsed-block {
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

:global(.dark) .parsed-block {
  background: rgba(255, 255, 255, 0.01);
  border-color: rgba(255, 255, 255, 0.03);
}

.method-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  font-family: "SF Mono", "Fira Code", monospace;
  letter-spacing: 0.05em;
}

.method-get { background: rgba(16, 185, 129, 0.1); color: #059669; }
.method-post { background: rgba(59, 130, 246, 0.1); color: #2563EB; }
.method-put { background: rgba(245, 158, 11, 0.1); color: #D97706; }
.method-patch { background: rgba(168, 85, 247, 0.1); color: #7C3AED; }
.method-delete { background: rgba(239, 68, 68, 0.1); color: #DC2626; }

:global(.dark) .method-get { background: rgba(16, 185, 129, 0.15); color: #34D399; }
:global(.dark) .method-post { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
:global(.dark) .method-put { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }
:global(.dark) .method-patch { background: rgba(168, 85, 247, 0.15); color: #A78BFA; }
:global(.dark) .method-delete { background: rgba(239, 68, 68, 0.15); color: #F87171; }

.edit-tab {
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

:global(.dark) .edit-tab {
  color: rgba(255, 255, 255, 0.35);
}

.edit-tab:hover {
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark) .edit-tab:hover {
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.04);
}

.edit-tab.active {
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.08);
}

:global(.dark) .edit-tab.active {
  color: #60A5FA;
  background: rgba(59, 130, 246, 0.12);
}

.tab-count {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.12);
  color: #3B82F6;
}

:global(.dark) .tab-count {
  background: rgba(59, 130, 246, 0.2);
  color: #60A5FA;
}

.body-type-btn {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: all 0.15s ease;
}

:global(.dark) .body-type-btn {
  color: rgba(255, 255, 255, 0.35);
}

.body-type-btn:hover {
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark) .body-type-btn:hover {
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.04);
}

.body-type-btn.active {
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.08);
}

:global(.dark) .body-type-btn.active {
  color: #60A5FA;
  background: rgba(59, 130, 246, 0.12);
}

.header-input {
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: rgba(0, 0, 0, 0.85);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  outline: none;
  transition: all 0.15s ease;
}

:global(.dark) .header-input {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.header-input:focus {
  border-color: rgba(59, 130, 246, 0.4);
}

.header-input::placeholder {
  color: rgba(0, 0, 0, 0.2);
}

:global(.dark) .header-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.body-textarea {
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.85);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  outline: none;
  transition: all 0.15s ease;
}

:global(.dark) .body-textarea {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.body-textarea:focus {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.body-textarea::placeholder {
  color: rgba(0, 0, 0, 0.2);
}

:global(.dark) .body-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.add-btn {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.06);
  cursor: pointer;
  transition: all 0.15s ease;
}

:global(.dark) .add-btn {
  color: #60A5FA;
  background: rgba(59, 130, 246, 0.1);
}

.add-btn:hover {
  background: rgba(59, 130, 246, 0.12);
}

:global(.dark) .add-btn:hover {
  background: rgba(59, 130, 246, 0.18);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
