<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { ParsedRequest, Environment } from "../../composables/curl-toolkit/types";
import { parseCurl, buildUrl } from "../../composables/curl-toolkit/useCurlParser";

const props = defineProps<{
  activeEnv: Environment | null;
}>();

const emit = defineEmits<{
  send: [request: { url: string; method: string; headers: Record<string, string>; body: string | null }];
}>();

const curlInput = ref("");
const parsed = ref<ParsedRequest | null>(null);
const appendApi = ref(false);

// 编辑区 tab
const editTab = ref<"headers" | "query" | "body">("headers");

// 可编辑的 headers
const editableHeaders = ref<{ key: string; value: string; enabled: boolean }[]>([]);

// 可编辑的 query 参数
const editableQuery = ref<{ key: string; value: string }[]>([]);

// Body
const bodyContent = ref("");

// 解析 curl
watch(curlInput, (val) => {
  if (val.trim()) {
    try {
      parsed.value = parseCurl(val);
      appendApi.value = parsed.value.path.startsWith("/api");
      // 填充 headers
      editableHeaders.value = Object.entries(parsed.value.headers).map(([key, value]) => ({
        key, value, enabled: true,
      }));
      // 填充 query
      editableQuery.value = Object.entries(parsed.value.query).map(([key, value]) => ({ key, value }));
      // 填充 body
      bodyContent.value = parsed.value.body || "";
      // 自动切 tab
      if (parsed.value.body) editTab.value = "body";
      else if (Object.keys(parsed.value.query).length > 0) editTab.value = "query";
      else editTab.value = "headers";
    } catch {
      parsed.value = null;
    }
  } else {
    parsed.value = null;
  }
});

// 重建 URL（含 query 参数）
const finalUrl = computed(() => {
  if (!parsed.value) return "";
  let url: string;
  if (!props.activeEnv) {
    url = parsed.value.url;
  } else {
    url = buildUrl(parsed.value, props.activeEnv, appendApi.value);
  }
  // 用编辑后的 query 参数重建
  if (editableQuery.value.length > 0) {
    try {
      const urlObj = new URL(url);
      urlObj.search = "";
      for (const p of editableQuery.value) {
        if (p.key.trim()) urlObj.searchParams.append(p.key.trim(), p.value);
      }
      return urlObj.toString();
    } catch { return url; }
  }
  return url;
});

function addHeader() { editableHeaders.value.push({ key: "", value: "", enabled: true }); }
function removeHeader(i: number) { editableHeaders.value.splice(i, 1); }
function addQuery() { editableQuery.value.push({ key: "", value: "" }); }
function removeQuery(i: number) { editableQuery.value.splice(i, 1); }

function buildHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  for (const item of editableHeaders.value) { if (item.enabled && item.key.trim()) h[item.key.trim()] = item.value; }
  return h;
}

function handleSend() {
  if (!parsed.value) return;
  emit("send", { url: finalUrl.value, method: parsed.value.method, headers: buildHeaders(), body: bodyContent.value.trim() || null });
}

function handleClear() { curlInput.value = ""; parsed.value = null; }
function setCurl(curl: string) { curlInput.value = curl; }
defineExpose({ setCurl });
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 输入区 -->
    <div class="flex-shrink-0 p-4 pb-2">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xs font-semibold text-secondary uppercase tracking-wider">Curl 命令</h3>
        <div class="flex items-center gap-3">
          <label v-if="parsed && activeEnv" class="flex items-center gap-1.5 cursor-pointer">
            <input v-model="appendApi" type="checkbox" class="accent-blue-500" />
            <span class="text-[11px] text-tertiary">追加 /api</span>
          </label>
          <button v-if="curlInput" class="text-[11px] text-tertiary hover:text-secondary transition-colors cursor-pointer" @click="handleClear">清空</button>
        </div>
      </div>
      <textarea
        v-model="curlInput"
        class="curl-textarea w-full h-[120px] resize-none p-3 text-sm font-mono leading-relaxed text-primary bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl outline-none transition-all"
        placeholder="粘贴 curl 命令..."
        spellcheck="false"
      />
    </div>

    <!-- Method + URL + 发送 -->
    <div v-if="parsed" class="flex-shrink-0 px-4 pb-2">
      <div class="flex items-center gap-2 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]">
        <span class="method-badge flex-shrink-0" :class="'method-' + parsed.method.toLowerCase()">{{ parsed.method }}</span>
        <span class="url-scroll text-xs font-mono text-primary flex-1 min-w-0">{{ finalUrl }}</span>
        <button class="send-btn flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer" @click="handleSend">发送</button>
      </div>
    </div>

    <!-- Headers / Query / Body 编辑区 -->
    <div v-if="parsed" class="flex-1 flex flex-col min-h-0 overflow-hidden px-4 pb-4">
      <!-- Tab 导航 -->
      <nav class="flex items-center gap-0.5 p-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] mb-3 flex-shrink-0 w-fit">
        <button
          v-for="tab in [
            { id: 'headers', label: 'Headers', count: editableHeaders.filter(h => h.enabled && h.key.trim()).length },
            { id: 'query', label: 'Query', count: editableQuery.filter(q => q.key.trim()).length },
            { id: 'body', label: 'Body', count: bodyContent.trim() ? 1 : 0 },
          ]"
          :key="tab.id"
          class="px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200"
          :class="editTab === tab.id ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-tertiary hover:text-secondary'"
          @click="editTab = tab.id as any"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.1]">{{ tab.count }}</span>
        </button>
      </nav>

      <!-- Headers 编辑 -->
      <div v-if="editTab === 'headers'" class="flex-1 overflow-y-auto space-y-1.5">
        <div v-for="(header, index) in editableHeaders" :key="index" class="flex items-center gap-1.5">
          <input v-model="header.enabled" type="checkbox" class="accent-blue-500 flex-shrink-0" />
          <input v-model="header.key" class="kv-input flex-shrink-0 w-[140px]" placeholder="Key" />
          <input v-model="header.value" class="kv-input flex-1 min-w-0" placeholder="Value" />
          <button class="p-1 rounded text-tertiary hover:text-rose-500 transition-colors cursor-pointer flex-shrink-0" @click="removeHeader(index)">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <button class="add-btn" @click="addHeader">+ 添加 Header</button>
      </div>

      <!-- Query 编辑 -->
      <div v-if="editTab === 'query'" class="flex-1 overflow-y-auto space-y-1.5">
        <div v-for="(param, index) in editableQuery" :key="index" class="flex items-center gap-1.5">
          <input v-model="param.key" class="kv-input flex-shrink-0 w-[140px]" placeholder="Key" />
          <input v-model="param.value" class="kv-input flex-1 min-w-0" placeholder="Value" />
          <button class="p-1 rounded text-tertiary hover:text-rose-500 transition-colors cursor-pointer flex-shrink-0" @click="removeQuery(index)">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <button class="add-btn" @click="addQuery">+ 添加参数</button>
      </div>

      <!-- Body 编辑 -->
      <div v-if="editTab === 'body'" class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <textarea v-model="bodyContent" class="body-textarea flex-1 resize-none" placeholder="请求体内容..." spellcheck="false" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-4xl mb-3">📋</div>
        <p class="text-sm text-tertiary">粘贴 curl 命令开始</p>
        <p class="text-xs text-tertiary mt-1">支持 -X / -H / -d / --data-raw 等参数</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.curl-textarea::placeholder { color: rgba(0, 0, 0, 0.25); }
:global(.dark) .curl-textarea::placeholder { color: rgba(255, 255, 255, 0.25); }
.curl-textarea:focus { border-color: rgba(59, 130, 246, 0.4); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }

.method-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; font-family: "SF Mono", "Fira Code", monospace; letter-spacing: 0.05em; }
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

.kv-input { padding: 5px 10px; border-radius: 8px; font-size: 11px; font-family: "SF Mono", "Fira Code", monospace; color: rgba(0, 0, 0, 0.85); background: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.06); outline: none; transition: all 0.15s ease; }
:global(.dark) .kv-input { color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.03); border-color: rgba(255, 255, 255, 0.06); }
.kv-input:focus { border-color: rgba(59, 130, 246, 0.4); }
.kv-input::placeholder { color: rgba(0, 0, 0, 0.2); }
:global(.dark) .kv-input::placeholder { color: rgba(255, 255, 255, 0.2); }

.body-textarea { padding: 10px 12px; border-radius: 10px; font-size: 12px; font-family: "SF Mono", "Fira Code", monospace; line-height: 1.5; color: rgba(0, 0, 0, 0.85); background: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.06); outline: none; transition: all 0.15s ease; }
:global(.dark) .body-textarea { color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.03); border-color: rgba(255, 255, 255, 0.06); }
.body-textarea:focus { border-color: rgba(59, 130, 246, 0.4); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
.body-textarea::placeholder { color: rgba(0, 0, 0, 0.2); }
:global(.dark) .body-textarea::placeholder { color: rgba(255, 255, 255, 0.2); }

.add-btn { padding: 5px 12px; border-radius: 8px; font-size: 11px; color: #3B82F6; background: rgba(59, 130, 246, 0.06); cursor: pointer; transition: all 0.15s ease; }
:global(.dark) .add-btn { color: #60A5FA; background: rgba(59, 130, 246, 0.1); }
.add-btn:hover { background: rgba(59, 130, 246, 0.12); }
:global(.dark) .add-btn:hover { background: rgba(59, 130, 246, 0.18); }

.url-scroll {
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}
.url-scroll::-webkit-scrollbar { display: none; }
.url-scroll:hover::-webkit-scrollbar { display: block; height: 3px; }
.url-scroll:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
:global(.dark) .url-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
