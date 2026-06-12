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
const isComposing = ref(false);

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
  { id: "github", name: "GitHub", bg: "#fff", text: "#24292f", key: "#881391", string: "#1a7f37", number: "#0550ae", boolean: "#cf222e", nullVal: "#cf222e", keyWeight: 500, caret: "#24292f", selection: "#c8e1ff", lineBg: "rgba(0,0,0,0.03)", divider: "rgba(0,0,0,0.08)" },
  { id: "vscode-dark", name: "VSCode Dark", bg: "#1e1e1e", text: "#d4d4d4", key: "#9cdcfe", string: "#ce9178", number: "#b5cea8", boolean: "#569cd6", nullVal: "#569cd6", keyWeight: 400, caret: "#d4d4d4", selection: "rgba(38,79,120,0.6)", lineBg: "rgba(255,255,255,0.04)", divider: "rgba(255,255,255,0.08)" },
  { id: "monokai", name: "Monokai", bg: "#272822", text: "#f8f8f2", key: "#a6e22e", string: "#e6db74", number: "#ae81ff", boolean: "#f92672", nullVal: "#f92672", keyWeight: 500, caret: "#f8f8f2", selection: "rgba(73,72,62,0.7)", lineBg: "rgba(255,255,255,0.04)", divider: "rgba(255,255,255,0.08)" },
  { id: "dracula", name: "Dracula", bg: "#282a36", text: "#f8f8f2", key: "#8be9fd", string: "#f1fa8c", number: "#bd93f9", boolean: "#ff79c6", nullVal: "#ff79c6", keyWeight: 500, caret: "#f8f8f2", selection: "rgba(68,71,90,0.7)", lineBg: "rgba(255,255,255,0.04)", divider: "rgba(255,255,255,0.08)" },
  { id: "nord", name: "Nord", bg: "#2e3440", text: "#d8dee9", key: "#88c0d0", string: "#a3be8c", number: "#b48ead", boolean: "#bf616a", nullVal: "#bf616a", keyWeight: 500, caret: "#d8dee9", selection: "rgba(67,76,94,0.7)", lineBg: "rgba(255,255,255,0.04)", divider: "rgba(255,255,255,0.08)" },
  { id: "solarized-light", name: "Solarized Light", bg: "#fdf6e3", text: "#657b83", key: "#268bd2", string: "#2aa198", number: "#d33682", boolean: "#cb4b16", nullVal: "#cb4b16", keyWeight: 600, caret: "#657b83", selection: "#eee8d5", lineBg: "rgba(0,0,0,0.03)", divider: "rgba(0,0,0,0.08)" },
  { id: "me", name: "ME", bg: "#DAF4F6", text: "#2B2F36", key: "#2F6FED", string: "#0F8A5F", number: "#C75D1D", boolean: "#8E44AD", nullVal: "#7F8C8D", keyWeight: 600, caret: "#2F6FED", selection: "#BFEAF0", lineBg: "rgba(255,255,255,0.45)", divider: "rgba(43,47,54,0.08)" },
];

const currentThemeId = ref(localStorage.getItem("json-color-theme") || "github");
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
      let html = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, '<span class="jh-key">"$1"</span>:')
        .replace(/:\s*"([^"\\]*(\\.[^"\\]*)*)"/g, ': <span class="jh-string">"$1"</span>')
        .replace(/:\s*(-?\d+\.?\d*([eE][+-]?\d+)?)/g, ': <span class="jh-number">$1</span>')
        .replace(/:\s*(true|false)/g, ': <span class="jh-bool">$1</span>')
        .replace(/:\s*(null)/g, ': <span class="jh-null">$1</span>');

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
      <div class="flex-1 relative min-h-0">
        <pre
          ref="highlightRef"
          class="absolute inset-0 p-3 m-0 font-mono leading-[1.5] overflow-auto pointer-events-none whitespace-pre-wrap break-all box-border"
          :style="{ color: currentTheme.text, fontSize: fontSize + 'px', visibility: isComposing ? 'hidden' : 'visible' }"
          aria-hidden="true"
        ><code v-html="highlightJson(input)" /></pre>
        <textarea
          ref="textareaRef"
          v-model="input"
          class="json-textarea absolute inset-0 resize-none p-3 font-mono leading-[1.5] bg-transparent outline-none border-0 m-0 box-border whitespace-pre-wrap break-all placeholder:text-tertiary"
          :style="{ color: isComposing ? currentTheme.text : 'transparent', caretColor: currentTheme.caret, '--sel-bg': currentTheme.selection, fontSize: fontSize + 'px' }"
          placeholder="Paste JSON here..."
          spellcheck="false"
          @keydown="handleKeydown"
          @scroll="syncScroll"
          @click="updateCurrentLine"
          @keyup="updateCurrentLine"
          @input="updateCurrentLine"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />

        <!-- 右下角字号控制 -->
        <div class="absolute bottom-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] z-10">
          <button class="w-5 h-5 flex items-center justify-center text-[11px] text-tertiary hover:text-primary transition-colors" @click="zoomOut">−</button>
          <button class="min-w-[28px] h-5 flex items-center justify-center text-[10px] text-tertiary hover:text-primary transition-colors" @click="zoomReset">{{ fontSize }}</button>
          <button class="w-5 h-5 flex items-center justify-center text-[11px] text-tertiary hover:text-primary transition-colors" @click="zoomIn">+</button>
        </div>
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
.json-textarea::selection {
  background: v-bind('currentTheme.selection');
}

pre :deep(.jh-key) {
  color: v-bind('currentTheme.key');
  font-weight: v-bind('currentTheme.keyWeight');
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
