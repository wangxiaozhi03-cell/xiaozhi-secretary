<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  json: string;
}>();

const emit = defineEmits<{
  "update:json": [value: string];
}>();

// 支持的转义语言
const languages = [
  { id: "java", label: "Java", icon: "☕" },
  { id: "javascript", label: "JavaScript", icon: "JS" },
  { id: "python", label: "Python", icon: "🐍" },
  { id: "csharp", label: "C#", icon: "C#" },
  { id: "sql", label: "SQL", icon: "🗄️" },
];

const selectedLanguage = ref("javascript");
const inputText = ref("");
const outputText = ref("");
const errorMsg = ref("");
const mode = ref<"escape" | "unescape">("escape");

// 同步外部 JSON
watch(() => props.json, (newVal) => {
  if (newVal && !inputText.value) {
    inputText.value = newVal;
  }
}, { immediate: true });

// 转义函数
function escapeJson(text: string, lang: string): string {
  try {
    // 先尝试解析为 JSON 对象
    const parsed = JSON.parse(text);
    const compact = JSON.stringify(parsed);

    switch (lang) {
      case "java":
        // Java: 转义双引号和反斜杠
        return compact
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t");

      case "javascript":
        // JavaScript: JSON.stringify 已经处理了大部分转义
        return JSON.stringify(compact);

      case "python":
        // Python: 转义单引号和双引号
        return compact
          .replace(/\\/g, "\\\\")
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t");

      case "csharp":
        // C#: 类似 Java
        return compact
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t");

      case "sql":
        // SQL: 转义单引号
        return compact.replace(/'/g, "''");

      default:
        return compact;
    }
  } catch {
    // 如果不是有效 JSON，直接转义字符串
    switch (lang) {
      case "java":
      case "csharp":
        return text
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t");

      case "javascript":
        return JSON.stringify(text);

      case "python":
        return text
          .replace(/\\/g, "\\\\")
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t");

      case "sql":
        return text.replace(/'/g, "''");

      default:
        return text;
    }
  }
}

// 去转义函数
function unescapeJson(text: string, lang: string): string {
  let unescaped: string;

  switch (lang) {
    case "java":
    case "csharp":
      unescaped = text
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      break;

    case "javascript":
      try {
        // JSON.parse 会自动处理转义
        unescaped = JSON.parse(text);
      } catch {
        unescaped = text
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
      }
      break;

    case "python":
      unescaped = text
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      break;

    case "sql":
      unescaped = text.replace(/''/g, "'");
      break;

    default:
      unescaped = text;
  }

  // 尝试格式化为 JSON
  try {
    const parsed = JSON.parse(unescaped);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return unescaped;
  }
}

// 执行转换
function convert() {
  errorMsg.value = "";
  const trimmed = inputText.value.trim();

  if (!trimmed) {
    outputText.value = "";
    return;
  }

  try {
    if (mode.value === "escape") {
      outputText.value = escapeJson(trimmed, selectedLanguage.value);
    } else {
      outputText.value = unescapeJson(trimmed, selectedLanguage.value);
    }
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "转换失败";
  }
}

// 切换模式
function toggleMode() {
  mode.value = mode.value === "escape" ? "unescape" : "escape";
  // 自动交换输入输出
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  convert();
}

// 复制输出
function copyOutput() {
  if (outputText.value) {
    navigator.clipboard.writeText(outputText.value);
  }
}

// 清空
function clearAll() {
  inputText.value = "";
  outputText.value = "";
  errorMsg.value = "";
}

// 同步到主 JSON
function syncToMain() {
  if (outputText.value) {
    emit("update:json", outputText.value);
  }
}

// 监听输入变化自动转换
watch([inputText, selectedLanguage, mode], convert, { immediate: true });
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部工具栏 -->
    <div class="px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.06] flex-shrink-0">
      <div class="flex items-center justify-between">
        <!-- 左侧：语言选择 -->
        <div class="flex items-center gap-3">
          <span class="text-xs font-medium text-tertiary">语言:</span>
          <div class="flex items-center gap-1 p-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.05]">
            <button
              v-for="lang in languages"
              :key="lang.id"
              class="px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5"
              :class="selectedLanguage === lang.id
                ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                : 'text-tertiary hover:text-secondary'"
              @click="selectedLanguage = lang.id"
            >
              <span class="text-sm">{{ lang.icon }}</span>
              <span>{{ lang.label }}</span>
            </button>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5"
            :class="mode === 'escape'
              ? 'bg-blue-500/[0.10] text-blue-500'
              : 'bg-purple-500/[0.10] text-purple-500'"
            @click="toggleMode"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            {{ mode === 'escape' ? '转义' : '去转义' }}
          </button>
          <button
            class="btn-icon"
            title="复制输出"
            @click="copyOutput"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </button>
          <button
            class="btn-icon"
            title="同步到主编辑器"
            @click="syncToMain"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
          <button
            class="btn-icon"
            title="清空"
            @click="clearAll"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 输入输出区 -->
    <div class="flex-1 flex min-h-0">
      <!-- 输入区 -->
      <div class="w-1/2 flex flex-col border-r border-black/[0.04] dark:border-white/[0.06]">
        <div class="px-3 py-2 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
          <span>输入</span>
          <span class="text-[9px] normal-case tracking-normal text-tertiary">
            {{ inputText.length }} 字符
          </span>
        </div>
        <textarea
          v-model="inputText"
          class="flex-1 resize-none p-4 text-sm font-mono leading-relaxed bg-transparent outline-none text-primary placeholder:text-tertiary whitespace-pre break-all"
          :placeholder="mode === 'escape' ? '粘贴 JSON 或文本...' : '粘贴转义后的字符串...'"
          spellcheck="false"
        />
      </div>

      <!-- 输出区 -->
      <div class="w-1/2 flex flex-col">
        <div class="px-3 py-2 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
          <span>输出</span>
          <span class="text-[9px] normal-case tracking-normal text-tertiary">
            {{ outputText.length }} 字符
          </span>
        </div>
        <textarea
          :value="outputText"
          class="flex-1 resize-none p-4 text-sm font-mono leading-relaxed bg-transparent outline-none text-primary placeholder:text-tertiary whitespace-pre break-all"
          placeholder="转换结果..."
          readonly
        />
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="errorMsg"
      class="px-4 py-2 text-xs text-rose-600 bg-rose-50/80 dark:bg-rose-500/10 dark:text-rose-400 border-t border-rose-200 dark:border-rose-500/20 flex-shrink-0 flex items-center gap-2"
    >
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{{ errorMsg }}</span>
    </div>
  </div>
</template>
