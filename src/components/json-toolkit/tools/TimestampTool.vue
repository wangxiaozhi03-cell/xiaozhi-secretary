<script setup lang="ts">
import { ref, watch } from "vue";
import { useTimestamp } from "../../../composables/json-toolkit/useTimestamp";

const props = defineProps<{
  json: string;
}>();

const emit = defineEmits<{
  "update:json": [value: string];
}>();

const { timestampToReadable, timeToTimestamp, convertJsonTimestamps } = useTimestamp();

const inputText = ref("");
const outputText = ref("");
const errorMsg = ref("");
const countMsg = ref("");
const direction = ref<"toReadable" | "toTimestamp">("toReadable");

// Single value converter
const singleInput = ref("");
const singleOutput = ref("");

watch(() => props.json, (newVal) => {
  if (newVal && !inputText.value) {
    inputText.value = newVal;
    doConvert();
  }
}, { immediate: true });

function doConvert() {
  errorMsg.value = "";
  countMsg.value = "";
  const trimmed = inputText.value.trim();
  if (!trimmed) {
    outputText.value = "";
    return;
  }

  const result = convertJsonTimestamps(trimmed, direction.value);
  if (result.error) {
    errorMsg.value = result.error;
    outputText.value = "";
  } else {
    outputText.value = result.result;
    if (result.count > 0) {
      countMsg.value = `转换了 ${result.count} 个${direction.value === "toReadable" ? "时间戳" : "时间"}`;
    } else {
      countMsg.value = `未发现${direction.value === "toReadable" ? "时间戳" : "时间格式"}字段`;
    }
  }
}

function convertSingle() {
  const val = singleInput.value.trim();
  if (!val) {
    singleOutput.value = "";
    return;
  }

  if (direction.value === "toReadable") {
    const num = Number(val);
    if (!isNaN(num)) {
      singleOutput.value = timestampToReadable(num);
    } else {
      singleOutput.value = "无效的时间戳";
    }
  } else {
    const ts = timeToTimestamp(val);
    if (ts !== null) {
      singleOutput.value = `${ts} (毫秒) / ${Math.floor(ts / 1000)} (秒)`;
    } else {
      singleOutput.value = "无效的时间格式";
    }
  }
}

function swapDirection() {
  direction.value = direction.value === "toReadable" ? "toTimestamp" : "toReadable";
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  doConvert();
  convertSingle();
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
  countMsg.value = "";
}

watch([inputText, direction], doConvert);
watch(singleInput, convertSingle);
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div class="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.06] flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-tertiary">时间戳转换</span>
          <button
            class="px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5"
            :class="direction === 'toReadable'
              ? 'bg-blue-500/[0.10] text-blue-500'
              : 'bg-emerald-500/[0.10] text-emerald-500'"
            @click="swapDirection"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            {{ direction === 'toReadable' ? '时间戳 → 时间' : '时间 → 时间戳' }}
          </button>
        </div>
        <div class="flex items-center gap-2">
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

    <!-- 单个转换 -->
    <div class="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.06] flex-shrink-0">
      <div class="text-[10px] font-medium text-tertiary uppercase tracking-widest mb-2">快速转换</div>
      <div class="flex items-center gap-3">
        <input
          v-model="singleInput"
          type="text"
          class="flex-1 px-3 py-2 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-lg outline-none text-primary placeholder:text-tertiary border border-transparent focus:border-blue-500/30 transition-colors font-mono"
          :placeholder="direction === 'toReadable' ? '输入时间戳，如 1496937600 或 1496937600000' : '输入时间，如 2017-06-09 00:00:00'"
        />
        <svg class="w-4 h-4 text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <div class="flex-1 px-3 py-2 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-lg text-primary font-mono min-h-[36px] flex items-center">
          {{ singleOutput || '结果...' }}
        </div>
      </div>
    </div>

    <!-- JSON 批量转换 -->
    <div class="flex-1 flex min-h-0">
      <div class="w-1/2 flex flex-col border-r border-black/[0.04] dark:border-white/[0.06]">
        <div class="px-3 py-2 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
          <span>JSON 输入</span>
          <span class="text-[9px] normal-case tracking-normal text-tertiary">{{ inputText.length }} 字符</span>
        </div>
        <textarea
          v-model="inputText"
          class="flex-1 resize-none p-4 text-sm font-mono leading-relaxed bg-transparent outline-none text-primary placeholder:text-tertiary whitespace-pre break-all"
          placeholder="粘贴包含时间戳的 JSON..."
          spellcheck="false"
        />
      </div>
      <div class="w-1/2 flex flex-col">
        <div class="px-3 py-2 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
          <span>转换结果</span>
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

    <!-- 提示 -->
    <div
      v-if="countMsg"
      class="px-4 py-2 text-xs border-t flex-shrink-0 flex items-center gap-2"
      :class="countMsg.includes('未发现')
        ? 'text-amber-600 bg-amber-50/80 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
        : 'text-emerald-600 bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'"
    >
      {{ countMsg }}
    </div>
    <div
      v-if="errorMsg"
      class="px-4 py-2 text-xs text-rose-600 bg-rose-50/80 dark:bg-rose-500/10 dark:text-rose-400 border-t border-rose-200 dark:border-rose-500/20 flex-shrink-0"
    >
      {{ errorMsg }}
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
