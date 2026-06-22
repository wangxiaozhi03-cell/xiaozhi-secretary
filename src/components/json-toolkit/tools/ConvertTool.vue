<script setup lang="ts">
import { ref, watch } from "vue";
import { useJsonConvert, type ConvertFormat } from "../../../composables/json-toolkit/useJsonConvert";

const props = defineProps<{
  json: string;
}>();

const emit = defineEmits<{
  "update:json": [value: string];
}>();

const { jsonTo, toJson, autoDetectToJson } = useJsonConvert();

const formats: { id: ConvertFormat; label: string; icon: string }[] = [
  { id: "yaml", label: "YAML", icon: "Y" },
  { id: "xml", label: "XML", icon: "<>" },
  { id: "toml", label: "TOML", icon: "T" },
  { id: "properties", label: "Properties", icon: "=" },
  { id: "url", label: "URL Params", icon: "&" },
  { id: "json5", label: "JSON5", icon: "5" },
];

const selectedFormat = ref<ConvertFormat>("yaml");
const direction = ref<"jsonTo" | "toJson">("jsonTo");
const inputText = ref("");
const outputText = ref("");
const errorMsg = ref("");
const successMsg = ref("");

// Sync input from props
watch(() => props.json, (newVal) => {
  if (newVal && direction.value === "jsonTo") {
    inputText.value = newVal;
    doConvert();
  }
}, { immediate: true });

function doConvert() {
  errorMsg.value = "";
  successMsg.value = "";
  const trimmed = inputText.value.trim();
  if (!trimmed) {
    outputText.value = "";
    return;
  }

  let result;
  if (direction.value === "jsonTo") {
    result = jsonTo(trimmed, selectedFormat.value);
  } else {
    result = toJson(trimmed, selectedFormat.value);
  }

  if (result.error) {
    errorMsg.value = result.error;
    outputText.value = "";
  } else {
    outputText.value = result.output;
  }
}

function autoDetect() {
  errorMsg.value = "";
  successMsg.value = "";
  const trimmed = inputText.value.trim();
  if (!trimmed) return;

  const result = autoDetectToJson(trimmed);
  if (result.error) {
    errorMsg.value = result.error;
  } else {
    outputText.value = result.output;
    direction.value = "toJson";
    if (result.format) {
      selectedFormat.value = result.format;
      successMsg.value = `检测到格式: ${result.format.toUpperCase()}`;
    }
  }
}

function swapDirection() {
  direction.value = direction.value === "jsonTo" ? "toJson" : "jsonTo";
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  doConvert();
}

function copyOutput() {
  if (outputText.value) navigator.clipboard.writeText(outputText.value);
}

function syncToMain() {
  if (outputText.value) emit("update:json", outputText.value);
}

function clearAll() {
  inputText.value = "";
  outputText.value = "";
  errorMsg.value = "";
  successMsg.value = "";
}

watch([inputText, selectedFormat, direction], doConvert);
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div class="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.06] flex-shrink-0">
      <div class="flex items-center justify-between">
        <!-- 格式选择 -->
        <div class="flex items-center gap-1 p-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.05]">
          <button
            v-for="fmt in formats"
            :key="fmt.id"
            class="px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all duration-200 flex items-center gap-1.5"
            :class="selectedFormat === fmt.id
              ? 'bg-black/[0.06] dark:bg-white/[0.08] text-primary shadow-sm'
              : 'text-tertiary hover:text-secondary'"
            @click="selectedFormat = fmt.id"
          >
            <span class="text-[10px] opacity-50">{{ fmt.icon }}</span>
            <span>{{ fmt.label }}</span>
          </button>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5"
            :class="direction === 'jsonTo'
              ? 'bg-blue-500/[0.10] text-blue-500'
              : 'bg-emerald-500/[0.10] text-emerald-500'"
            @click="swapDirection"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            {{ direction === 'jsonTo' ? `JSON → ${selectedFormat.toUpperCase()}` : `${selectedFormat.toUpperCase()} → JSON` }}
          </button>
          <button
            class="btn-icon"
            title="自动检测格式"
            @click="autoDetect"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </button>
          <button class="btn-icon" title="复制输出" @click="copyOutput">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </button>
          <button class="btn-icon" title="同步到主编辑器" @click="syncToMain">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
          <button class="btn-icon" title="清空" @click="clearAll">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 输入输出区 -->
    <div class="flex-1 flex min-h-0">
      <!-- 输入 -->
      <div class="w-1/2 flex flex-col border-r border-black/[0.04] dark:border-white/[0.06]">
        <div class="px-3 py-2 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
          <span>输入 · {{ direction === 'jsonTo' ? 'JSON' : selectedFormat.toUpperCase() }}</span>
          <span class="text-[9px] normal-case tracking-normal text-tertiary">{{ inputText.length }} 字符</span>
        </div>
        <textarea
          v-model="inputText"
          class="flex-1 resize-none p-4 text-sm font-mono leading-relaxed bg-transparent outline-none text-primary placeholder:text-tertiary whitespace-pre break-all"
          :placeholder="`粘贴 ${direction === 'jsonTo' ? 'JSON' : selectedFormat.toUpperCase()} 数据...`"
          spellcheck="false"
        />
      </div>

      <!-- 输出 -->
      <div class="w-1/2 flex flex-col">
        <div class="px-3 py-2 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
          <span>输出 · {{ direction === 'jsonTo' ? selectedFormat.toUpperCase() : 'JSON' }}</span>
          <span class="text-[9px] normal-case tracking-normal text-tertiary">{{ outputText.length }} 字符</span>
        </div>
        <textarea
          :value="outputText"
          class="flex-1 resize-none p-4 text-sm font-mono leading-relaxed bg-transparent outline-none text-primary placeholder:text-tertiary whitespace-pre break-all"
          placeholder="转换结果..."
          readonly
        />
      </div>
    </div>

    <!-- 提示栏 -->
    <div
      v-if="errorMsg"
      class="px-4 py-2 text-xs text-rose-600 bg-rose-50/80 dark:bg-rose-500/10 dark:text-rose-400 border-t border-rose-200 dark:border-rose-500/20 flex-shrink-0 flex items-center gap-2"
    >
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{{ errorMsg }}</span>
    </div>
    <div
      v-else-if="successMsg"
      class="px-4 py-2 text-xs text-emerald-600 bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 border-t border-emerald-200 dark:border-emerald-500/20 flex-shrink-0"
    >
      {{ successMsg }}
    </div>
  </div>
</template>

<style scoped>
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: #86868b;
  transition: all 0.15s;
}
.btn-icon:hover {
  color: #1d1d1f;
  background: rgba(0, 0, 0, 0.04);
}
:global(.dark) .btn-icon:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.06);
}
</style>
