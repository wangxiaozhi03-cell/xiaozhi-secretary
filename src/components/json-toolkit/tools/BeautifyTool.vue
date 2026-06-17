<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps<{
  tabId: string;
  initialState?: Record<string, unknown>;
}>();

const emit = defineEmits<{
  saveState: [state: Record<string, unknown>];
  "update:json": [value: string];
}>();

const registerActions = injectActions();

const input = ref((props.initialState?.input as string) ?? "");
const history = ref<string[]>([]);
const errorMsg = ref("");
const errorLine = ref(-1);
const errorCol = ref(-1);
const indentSize = ref(2);
const fontSize = ref(13);
const textareaRef = ref<HTMLTextAreaElement>();
const highlightRef = ref<HTMLPreElement>();
const lineNumbersRef = ref<HTMLDivElement>();
const editorWrapRef = ref<HTMLDivElement>();
const currentLine = ref(-1);

// ========== 颜色主题 ==========
interface ColorTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  key: string;
  string: string;
  number: string;
  boolean: string;
  nullVal: string;
  keyWeight: number;
  caret: string;
  selection: string;
  lineBg: string;
  divider: string;
}

const themes: ColorTheme[] = [
  // ========== 经典主题 ==========
  {
    id: "catppuccin",
    name: "Catppuccin",
    bg: "#1E1E2E",
    text: "#CDD6F4",
    key: "#89B4FA",
    string: "#A6E3A1",
    number: "#FAB387",
    boolean: "#CBA6F7",
    nullVal: "#585B70",
    keyWeight: 500,
    caret: "#F5E0DC",
    selection: "rgba(137,180,250,0.2)",
    lineBg: "rgba(255,255,255,0.03)",
    divider: "rgba(255,255,255,0.06)",
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    bg: "#1A1B26",
    text: "#A9B1D6",
    key: "#7AA2F7",
    string: "#9ECE6A",
    number: "#FF9E64",
    boolean: "#BB9AF7",
    nullVal: "#565F89",
    keyWeight: 500,
    caret: "#C0CAF5",
    selection: "rgba(122,162,247,0.25)",
    lineBg: "rgba(255,255,255,0.03)",
    divider: "rgba(255,255,255,0.06)",
  },
  {
    id: "one-dark",
    name: "One Dark",
    bg: "#282C34",
    text: "#ABB2BF",
    key: "#E06C75",
    string: "#98C379",
    number: "#D19A66",
    boolean: "#C678DD",
    nullVal: "#5C6370",
    keyWeight: 500,
    caret: "#528BFF",
    selection: "rgba(82,139,255,0.2)",
    lineBg: "rgba(255,255,255,0.03)",
    divider: "rgba(255,255,255,0.06)",
  },
  {
    id: "monokai",
    name: "Monokai",
    bg: "#272822",
    text: "#F8F8F2",
    key: "#F92672",
    string: "#E6DB74",
    number: "#AE81FF",
    boolean: "#66D9EF",
    nullVal: "#75715E",
    keyWeight: 500,
    caret: "#F8F8F2",
    selection: "rgba(73,72,62,0.7)",
    lineBg: "rgba(255,255,255,0.04)",
    divider: "rgba(255,255,255,0.08)",
  },
  {
    id: "dracula",
    name: "Dracula",
    bg: "#282A36",
    text: "#F8F8F2",
    key: "#8BE9FD",
    string: "#F1FA8C",
    number: "#BD93F9",
    boolean: "#FF79C6",
    nullVal: "#6272A4",
    keyWeight: 500,
    caret: "#F8F8F2",
    selection: "rgba(68,71,90,0.7)",
    lineBg: "rgba(255,255,255,0.04)",
    divider: "rgba(255,255,255,0.08)",
  },
  {
    id: "nord",
    name: "Nord",
    bg: "#2E3440",
    text: "#D8DEE9",
    key: "#88C0D0",
    string: "#A3BE8C",
    number: "#D08770",
    boolean: "#B48EAD",
    nullVal: "#616E88",
    keyWeight: 500,
    caret: "#D8DEE9",
    selection: "rgba(67,76,94,0.7)",
    lineBg: "rgba(255,255,255,0.04)",
    divider: "rgba(255,255,255,0.08)",
  },
  {
    id: "gruvbox",
    name: "Gruvbox Dark",
    bg: "#282828",
    text: "#EBDBB2",
    key: "#83A598",
    string: "#B8BB26",
    number: "#FABD2F",
    boolean: "#D3869B",
    nullVal: "#928374",
    keyWeight: 500,
    caret: "#EBDBB2",
    selection: "rgba(80,73,69,0.6)",
    lineBg: "rgba(255,255,255,0.03)",
    divider: "rgba(255,255,255,0.06)",
  },
  {
    id: "github",
    name: "GitHub Light",
    bg: "#FFFFFF",
    text: "#24292E",
    key: "#005CC5",
    string: "#032F62",
    number: "#005CC5",
    boolean: "#D73A49",
    nullVal: "#6A737D",
    keyWeight: 500,
    caret: "#24292E",
    selection: "#C8E1FF",
    lineBg: "rgba(0,0,0,0.03)",
    divider: "rgba(0,0,0,0.08)",
  },
  {
    id: "catppuccin-latte",
    name: "Catppuccin Latte",
    bg: "#EFF1F5",
    text: "#4C4F69",
    key: "#7287FD",
    string: "#40A02B",
    number: "#FE640B",
    boolean: "#8839EF",
    nullVal: "#9CA0B0",
    keyWeight: 600,
    caret: "#DC8A78",
    selection: "rgba(114,135,253,0.18)",
    lineBg: "rgba(0,0,0,0.02)",
    divider: "rgba(0,0,0,0.06)",
  },
  {
    id: "one-light",
    name: "One Light",
    bg: "#FAFAFA",
    text: "#383A42",
    key: "#E45649",
    string: "#50A14F",
    number: "#986801",
    boolean: "#A626A4",
    nullVal: "#A0A1A7",
    keyWeight: 600,
    caret: "#526EFF",
    selection: "rgba(82,106,255,0.15)",
    lineBg: "rgba(0,0,0,0.02)",
    divider: "rgba(0,0,0,0.06)",
  },
  {
    id: "tokyo-night-light",
    name: "Tokyo Night Light",
    bg: "#D5D6DB",
    text: "#343B58",
    key: "#0F4B6E",
    string: "#33635C",
    number: "#8C6C3E",
    boolean: "#7847A7",
    nullVal: "#9699A3",
    keyWeight: 600,
    caret: "#0F4B6E",
    selection: "rgba(15,75,110,0.15)",
    lineBg: "rgba(0,0,0,0.02)",
    divider: "rgba(0,0,0,0.06)",
  },
  // ========== 自定义主题 ==========
  { id: "me", name: "ME", bg: "#DAF4F6", text: "#2B2F36", key: "#2F6FED", string: "#0F8A5F", number: "#C75D1D", boolean: "#8E44AD", nullVal: "#7F8C8D", keyWeight: 600, caret: "#2F6FED", selection: "#BFEAF0", lineBg: "rgba(255,255,255,0.45)", divider: "rgba(43,47,54,0.08)" },
];

const currentThemeId = ref(localStorage.getItem("json-color-theme") || "catppuccin");
const currentTheme = computed(() => themes.find((t) => t.id === currentThemeId.value) || themes[0]);

function setTheme(id: string) {
  currentThemeId.value = id;
  localStorage.setItem("json-color-theme", id);
}

// 行号
const lineCount = computed(() => {
  if (!input.value) return 1;
  return input.value.split("\n").length;
});

// 状态栏信息
const cursorLine = ref(1);
const cursorCol = ref(1);
const charCount = computed(() => input.value.length);
const isValidJson = computed(() => {
  if (!input.value.trim()) return null;
  try {
    JSON.parse(input.value);
    return true;
  } catch {
    return false;
  }
});

function updateCursorPosition() {
  const ta = textareaRef.value;
  if (!ta) return;
  const pos = ta.selectionStart;
  const textBefore = ta.value.substring(0, pos);
  const lines = textBefore.split("\n");
  cursorLine.value = lines.length;
  cursorCol.value = lines[lines.length - 1].length + 1;
}

// ========== JSON 校验 ==========
function validateJson() {
  errorMsg.value = "";
  errorLine.value = -1;
  errorCol.value = -1;
  const trimmed = input.value.trim();
  if (!trimmed) return;

  try {
    JSON.parse(trimmed);
  } catch (e: unknown) {
    if (e instanceof SyntaxError) {
      errorMsg.value = e.message;
      const posMatch = e.message.match(/at position (\d+)/);
      const lineColMatch = e.message.match(/at line (\d+) column (\d+)/);
      const lines = input.value.split("\n");

      if (lineColMatch) {
        errorLine.value = Number(lineColMatch[1]) - 1;
        errorCol.value = Number(lineColMatch[2]) - 1;
      } else if (posMatch) {
        const pos = Number(posMatch[1]);
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          if (charCount + lines[i].length + 1 > pos) {
            errorLine.value = i;
            errorCol.value = pos - charCount;
            break;
          }
          charCount += lines[i].length + 1;
        }
        if (errorLine.value === -1) {
          errorLine.value = lines.length - 1;
          errorCol.value = lines[lines.length - 1]?.length ?? 0;
        }
      }
    } else {
      errorMsg.value = e instanceof Error ? e.message : "Invalid JSON";
    }
  }
}

// 语法高亮
function highlightJson(json: string): string {
  if (!json) return "";
  const lines = json.split("\n");
  return lines
    .map((line, idx) => {
      // 先转义 HTML 特殊字符
      let html = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // 提取字符串并用占位符替换，避免后续处理破坏字符串内容
      const stringPlaceholders: string[] = [];
      html = html.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
        const index = stringPlaceholders.length;
        stringPlaceholders.push(match);
        return `__STRING_${index}__`;
      });

      // 处理 key（在占位符之后）
      html = html.replace(/__STRING_(\d+)__(\s*):/g, (_, idx, spaces) => {
        return `<span class="jh-key">${stringPlaceholders[parseInt(idx)]}</span>${spaces}:`;
      });

      // 处理数字（排除时间格式中的数字）- 在字符串恢复之前执行
      html = html.replace(/:(\s*)(-?\d+\.?\d*([eE][+-]?\d+)?)(?![\d:])/g, ':$1<span class="jh-number">$2</span>');

      // 处理布尔值 - 在字符串恢复之前执行
      html = html.replace(/:(\s*)(true|false)/g, ':$1<span class="jh-bool">$2</span>');

      // 处理 null - 在字符串恢复之前执行
      html = html.replace(/:(\s*)(null)/g, ':$1<span class="jh-null">$2</span>');

      // 处理 value 字符串（在数字、布尔值、null 处理之后恢复）
      html = html.replace(/:(\s*)__STRING_(\d+)__/g, (_, spaces, idx) => {
        return `:${spaces}<span class="jh-string">${stringPlaceholders[parseInt(idx)]}</span>`;
      });

      // 还原未被处理的字符串占位符
      stringPlaceholders.forEach((str, i) => {
        html = html.replace(`__STRING_${i}__`, str);
      });

      if (idx === errorLine.value) {
        html = '<span class="jh-error-line">' + html + '</span>';
      }
      if (idx === currentLine.value && errorLine.value !== idx) {
        html = '<span class="jh-current-line">' + html + '</span>';
      }
      return html;
    })
    .join("\n");
}

// 更新当前行
function updateCurrentLine() {
  const ta = textareaRef.value;
  if (!ta) return;
  const pos = ta.selectionStart;
  const textBefore = ta.value.substring(0, pos);
  currentLine.value = textBefore.split("\n").length - 1;
}

// 同步滚动：textarea、高亮层、行号
function syncScroll() {
  const ta = textareaRef.value;
  if (highlightRef.value && ta) {
    highlightRef.value.scrollTop = ta.scrollTop;
    highlightRef.value.scrollLeft = ta.scrollLeft;
  }
  if (lineNumbersRef.value && ta) {
    lineNumbersRef.value.scrollTop = ta.scrollTop;
  }
}

// 操作后重置滚动、定位光标、同步各层
function resetAfterOperation(end: boolean = true) {
  nextTick(() => {
    const ta = textareaRef.value;
    if (!ta) return;
    ta.focus();
    if (end) {
      ta.selectionStart = ta.selectionEnd = ta.value.length;
    }
    // 强制重置滚动位置再同步
    ta.scrollTop = 0;
    ta.scrollLeft = 0;
    nextTick(() => {
      syncScroll();
      updateCurrentLine();
    });
  });
}

function formatPastedJson(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || text.includes("\n")) return text;
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return text;

  try {
    return JSON.stringify(JSON.parse(trimmed), null, indentSize.value);
  } catch {
    return text;
  }
}

function handlePaste(e: ClipboardEvent) {
  const ta = textareaRef.value;
  const pasted = e.clipboardData?.getData("text");
  if (!ta || !pasted) return;

  const formatted = formatPastedJson(pasted);
  if (formatted === pasted) return;

  e.preventDefault();
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  input.value = input.value.slice(0, start) + formatted + input.value.slice(end);

  nextTick(() => {
    const cursor = start + formatted.length;
    ta.selectionStart = ta.selectionEnd = cursor;
    updateCurrentLine();
    updateCursorPosition();
    syncScroll();
  });
}

// ========== 撤回 ==========
function pushHistory() {
  const h = history.value;
  if (h.length > 0 && h[h.length - 1] === input.value) return;
  h.push(input.value);
  if (h.length > 50) h.shift();
}

function undo() {
  const h = history.value;
  if (h.length === 0) return;
  input.value = h.pop()!;
  lastInput = input.value;
  errorMsg.value = "";
  errorLine.value = -1;
  resetAfterOperation(false);
}

// ========== 缩进切换 ==========
function changeIndent(size: number) {
  indentSize.value = size;
  const trimmed = input.value.trim();
  if (!trimmed) return;
  try {
    pushHistory();
    input.value = JSON.stringify(JSON.parse(trimmed), null, size);
    resetAfterOperation();
  } catch {}
}

// ========== 字号控制 ==========
function zoomIn() { fontSize.value = Math.min(fontSize.value + 1, 24); }
function zoomOut() { fontSize.value = Math.max(fontSize.value - 1, 10); }
function zoomReset() { fontSize.value = 13; }

// ========== 工具操作 ==========
function beautify() {
  try {
    pushHistory();
    input.value = JSON.stringify(JSON.parse(input.value), null, indentSize.value);
    errorMsg.value = "";
    errorLine.value = -1;
    resetAfterOperation();
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Invalid JSON";
  }
}

function minify() {
  try {
    pushHistory();
    input.value = JSON.stringify(JSON.parse(input.value));
    errorMsg.value = "";
    errorLine.value = -1;
    resetAfterOperation();
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Invalid JSON";
  }
}

// ========== Key 格式转换 ==========
const showKeyMenu = ref(false);

function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => c ? c.toUpperCase() : "")
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .replace(/[-\s]+/g, "_")
    .replace(/^_/, "")
    .toLowerCase();
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function transformKeys(obj: unknown, fn: (key: string) => string): unknown {
  if (Array.isArray(obj)) return obj.map((item) => transformKeys(item, fn));
  if (obj !== null && typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    return Object.fromEntries(entries.map(([k, v]) => [fn(k), transformKeys(v, fn)]));
  }
  return obj;
}

type KeyCase = "camel" | "snake" | "pascal" | "lower" | "upper";

function convertKeyCase(caseType: KeyCase) {
  showKeyMenu.value = false;
  const trimmed = input.value.trim();
  if (!trimmed) return;
  try {
    pushHistory();
    const obj = JSON.parse(trimmed);
    const fns: Record<KeyCase, (s: string) => string> = {
      camel: toCamelCase,
      snake: toSnakeCase,
      pascal: toPascalCase,
      lower: (s) => s.toLowerCase(),
      upper: (s) => s.toUpperCase(),
    };
    const result = transformKeys(obj, fns[caseType]);
    input.value = JSON.stringify(result, null, indentSize.value);
    resetAfterOperation();
  } catch {
    errorMsg.value = "Invalid JSON";
  }
}

function copyContent() {
  if (input.value) navigator.clipboard.writeText(input.value);
}

function clearAll() {
  input.value = "";
  errorMsg.value = "";
  errorLine.value = -1;
}

// ========== 转义（自动判断：已转义则反转义，否则转义） ==========
function toggleEscape() {
  const trimmed = input.value.trim();
  if (!trimmed) return;
  pushHistory();

  // 判断是否已转义：以 " 开头结尾，且内容包含 \"
  const isEscaped = trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.includes('\\"');

  if (isEscaped) {
    // 反转义
    try {
      const result = JSON.parse(trimmed);
      if (typeof result === "string") {
        try {
          input.value = JSON.stringify(JSON.parse(result), null, indentSize.value);
        } catch {
          input.value = result;
        }
      }
    } catch {
      errorMsg.value = "Invalid escaped string";
    }
  } else {
    // 转义：先压缩再转义
    try {
      const compact = JSON.stringify(JSON.parse(trimmed));
      input.value = JSON.stringify(compact);
    } catch {
      input.value = JSON.stringify(trimmed);
    }
  }
  resetAfterOperation();
}

function handleKeydown(e: KeyboardEvent) {
  // Tab 插入缩进
  if (e.key === "Tab") {
    e.preventDefault();
    const ta = textareaRef.value;
    if (!ta) return;
    const s = ta.selectionStart;
    const en = ta.selectionEnd;
    input.value = input.value.substring(0, s) + "  " + input.value.substring(en);
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
  }
  // Ctrl+Z / Cmd+Z 撤回
  if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
  }
}

let validateTimer: ReturnType<typeof setTimeout>;
let lastInput = input.value; // 记录上次内容
watch(input, (newVal) => {
  // 内容变化时自动保存历史（去重）
  if (lastInput !== newVal) {
    const h = history.value;
    if (h.length === 0 || h[h.length - 1] !== lastInput) {
      h.push(lastInput);
      if (h.length > 50) h.shift();
    }
    lastInput = newVal;
  }
  clearTimeout(validateTimer);
  validateTimer = setTimeout(validateJson, 300);
  emit("saveState", { input: input.value });
  emit("update:json", input.value);
});

onMounted(() => {
  registerActions?.([
    { label: "格式化", icon: "sparkle", variant: "primary", action: beautify },
    { label: "压缩", icon: "compress", variant: "default", action: minify },
    { label: "转义", icon: "escape", variant: "default", action: toggleEscape },
    { label: "复制", icon: "copy", variant: "default", action: copyContent },
    { label: "清空", icon: "trash", variant: "default", action: clearAll },
  ]);
  validateJson();
});
onUnmounted(() => { registerActions?.([]); });
</script>

<script lang="ts">
import { inject } from "vue";
interface ToolAction { label: string; icon: string; variant: "primary" | "default"; action: () => void; }
function injectActions() {
  return inject<(actions: ToolAction[]) => void>("registerToolActions", () => {});
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div class="px-3 py-1 text-[10px] font-medium uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-2">
        <span class="text-tertiary">JSON</span>
        <span v-if="input.trim() && errorLine === -1" class="text-[9px] text-emerald-500 font-normal normal-case tracking-normal">✓ Valid</span>
        <span v-else-if="input.trim() && errorLine >= 0" class="text-[9px] text-rose-500 font-normal normal-case tracking-normal">✕ Error</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="text-[10px] px-1.5 py-0.5 rounded text-tertiary hover:text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors flex items-center gap-0.5"
          :class="{ 'opacity-30 cursor-not-allowed': history.length === 0 }"
          :disabled="history.length === 0"
          @click="undo"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
          撤回
        </button>
        <div class="flex items-center gap-1">
          <span class="text-[10px] text-tertiary">Indent</span>
          <button
            v-for="size in [2, 4]"
            :key="size"
            class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
            :class="indentSize === size ? 'bg-blue-500/[0.08] text-blue-500 font-medium' : 'text-tertiary hover:text-secondary'"
            @click="changeIndent(size)"
          >
            {{ size }}
          </button>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[10px] text-tertiary">Theme</span>
          <select
            :value="currentThemeId"
            class="text-[10px] bg-transparent outline-none text-secondary cursor-pointer appearance-none pr-3"
            style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 20 20%22 fill=%22%23999%22%3E%3Cpath d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0 center;"
            @change="setTheme(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="t in themes" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <!-- Key 格式 -->
        <div class="relative">
          <button
            class="text-[10px] px-1.5 py-0.5 rounded text-tertiary hover:text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors flex items-center gap-0.5"
            @click="showKeyMenu = !showKeyMenu"
          >
            Key
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <Transition name="menu">
            <div
              v-if="showKeyMenu"
              class="absolute top-full right-0 mt-1 z-50 glass-float p-1 min-w-[120px]"
            >
              <button
                v-for="opt in [
                  { value: 'camel' as KeyCase, label: 'camelCase 驼峰' },
                  { value: 'snake' as KeyCase, label: 'snake_case 下划线' },
                  { value: 'pascal' as KeyCase, label: 'PascalCase 大驼峰' },
                  { value: 'lower' as KeyCase, label: 'lowercase 全小写' },
                  { value: 'upper' as KeyCase, label: 'UPPERCASE 全大写' },
                ]"
                :key="opt.value"
                class="w-full px-3 py-1.5 text-[11px] text-left rounded-lg text-primary hover:bg-blue-500/[0.06] transition-colors whitespace-nowrap"
                @click="convertKeyCase(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 编辑区 -->
    <div ref="editorWrapRef" class="flex-1 flex min-h-0" :style="{ background: currentTheme.bg }">
      <!-- 行号 -->
      <div
        ref="lineNumbersRef"
        class="w-10 flex-shrink-0 overflow-hidden text-right pr-2 pt-3 font-mono leading-[1.5] select-none"
        :style="{ color: currentTheme.text, opacity: 0.3, borderRight: `1px solid ${currentTheme.divider}`, fontSize: fontSize + 'px' }"
      >
        <div v-for="n in lineCount" :key="n"
          class="px-1"
          :class="{ 'bg-rose-500/[0.12]': n - 1 === errorLine }"
          :style="n - 1 === currentLine && n - 1 !== errorLine ? { background: currentTheme.lineBg } : {}"
        >
          {{ n }}
        </div>
      </div>

      <!-- 编辑器 -->
      <div class="flex-1 relative min-h-0 overflow-hidden">
        <pre
          ref="highlightRef"
          class="editor-layer absolute inset-0 p-3 m-0 font-mono leading-[1.5] pointer-events-none box-border overflow-hidden"
          :style="{
            color: currentTheme.text,
            fontSize: fontSize + 'px',
            visibility: 'visible',
          }"
          aria-hidden="true"
        ><code v-html="highlightJson(input)" /></pre>
        <textarea
          ref="textareaRef"
          v-model="input"
          class="json-textarea absolute inset-0 resize-none p-3 font-mono leading-[1.5] bg-transparent outline-none border-0 m-0 box-border placeholder:text-tertiary overflow-auto"
          :style="{
            color: 'transparent',
            caretColor: currentTheme.caret,
            '--sel-bg': currentTheme.selection,
            fontSize: fontSize + 'px',
          }"
          placeholder="Paste JSON here..."
          spellcheck="false"
          @keydown="handleKeydown"
          @scroll="syncScroll"
          @click="updateCurrentLine; updateCursorPosition()"
          @keyup="updateCurrentLine; updateCursorPosition()"
          @input="updateCurrentLine; updateCursorPosition()"
          @paste="handlePaste"
        />

        <!-- 右下角字号控制 -->
        <div class="absolute bottom-2 right-2 flex items-center gap-0.5 px-2 py-1 rounded-lg bg-[#EEF2F8]/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border border-black/[0.06] dark:border-white/[0.08] z-10">
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md text-tertiary hover:text-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all duration-150 cursor-pointer active:scale-90"
            title="缩小字号"
            @click="zoomOut"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <button
            class="min-w-[36px] h-6 flex items-center justify-center rounded-md text-[11px] font-medium text-secondary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all duration-150 cursor-pointer tabular-nums"
            title="重置字号"
            @click="zoomReset"
          >
            {{ fontSize }}px
          </button>
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md text-tertiary hover:text-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all duration-150 cursor-pointer active:scale-90"
            title="放大字号"
            @click="zoomIn"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div
      class="px-3 py-1 text-[10px] border-t flex items-center justify-between flex-shrink-0"
      :style="{
        background: currentTheme.lineBg,
        borderColor: currentTheme.divider,
        color: currentTheme.text,
        opacity: 0.7
      }"
    >
      <div class="flex items-center gap-4">
        <span class="font-mono">Line {{ cursorLine }}:{{ cursorCol }}</span>
        <span>Chars: {{ charCount }}</span>
        <span>UTF-8</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="isValidJson === true" class="text-emerald-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Valid JSON
        </span>
        <span v-else-if="isValidJson === false" class="text-rose-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Invalid JSON
        </span>
        <span v-else class="text-tertiary">等待输入</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="errorMsg"
      class="px-4 py-1.5 text-[11px] text-rose-600 bg-rose-50/80 dark:bg-rose-500/10 dark:text-rose-400 border-t border-rose-200 dark:border-rose-500/20 flex-shrink-0 flex items-center gap-2"
    >
      <span v-if="errorLine >= 0" class="font-mono text-[10px] px-1.5 py-0.5 bg-rose-100 dark:bg-rose-500/15 rounded flex-shrink-0">
        Line {{ errorLine + 1 }}:{{ errorCol + 1 }}
      </span>
      <span class="truncate">{{ errorMsg }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 编辑器层：自动换行，整个 key: value 一起换行 */
.editor-layer,
.json-textarea {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: normal;
  tab-size: 2;
  -moz-tab-size: 2;
  letter-spacing: normal;
  word-spacing: normal;
  font-weight: 400;
  font-kerning: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0, "calt" 0;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-text-size-adjust: none;
}

.json-textarea {
  resize: none;
}

.json-textarea::selection {
  background: v-bind('currentTheme.selection');
}

pre :deep(.jh-key) {
  color: v-bind('currentTheme.key');
  font-weight: inherit;
}
pre :deep(.jh-string) {
  color: v-bind('currentTheme.string');
}
pre :deep(.jh-number) {
  color: v-bind('currentTheme.number');
}
pre :deep(.jh-bool) {
  color: v-bind('currentTheme.boolean');
}
pre :deep(.jh-null) {
  color: v-bind('currentTheme.nullVal');
}
pre :deep(.jh-current-line) {
  background: v-bind('currentTheme.lineBg');
  display: inline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

pre :deep(.jh-error-line) {
  background: rgba(239, 68, 68, 0.10);
  border-bottom: 2px wavy #ef4444;
  display: inline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
</style>
