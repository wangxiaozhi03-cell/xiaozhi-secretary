<script setup lang="ts">
import { ref, computed } from "vue";
import { useSqlFormatter } from "../../composables/sql-toolkit/useSqlFormatter";
import type { SqlDialect, KeywordCase, IndentStyle } from "../../composables/sql-toolkit/types";
import { DIALECT_LABELS } from "../../composables/sql-toolkit/types";

const {
  input, output, errorMsg, options,
  lineCount, outputLineCount, charCount, dialectLabel,
  formatSql, minifySql, loadExample, clearAll, highlightSql,
} = useSqlFormatter();

// 编辑器 refs
const textareaRef = ref<HTMLTextAreaElement>();
const highlightRef = ref<HTMLPreElement>();
const lineNumbersRef = ref<HTMLDivElement>();
const outputHighlightRef = ref<HTMLPreElement>();
const outputLineNumbersRef = ref<HTMLDivElement>();

// 光标位置
const cursorLine = ref(1);
const cursorCol = ref(1);

function updateCursorPosition() {
  const ta = textareaRef.value;
  if (!ta) return;
  const pos = ta.selectionStart;
  const textBefore = ta.value.substring(0, pos);
  const lines = textBefore.split("\n");
  cursorLine.value = lines.length;
  cursorCol.value = lines[lines.length - 1].length + 1;
}

// 滚动同步
function onInputScroll() {
  if (highlightRef.value && textareaRef.value) {
    highlightRef.value.scrollTop = textareaRef.value.scrollTop;
    highlightRef.value.scrollLeft = textareaRef.value.scrollLeft;
  }
  if (lineNumbersRef.value && textareaRef.value) {
    lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop;
  }
}

function onOutputScroll() {
  if (outputLineNumbersRef.value && outputHighlightRef.value) {
    outputLineNumbersRef.value.scrollTop = outputHighlightRef.value.scrollTop;
  }
}

// 高亮 HTML
const inputHighlighted = computed(() => highlightSql(input.value));
const outputHighlighted = computed(() => highlightSql(output.value));

// 下拉菜单状态
const showDialect = ref(false);
const showTabWidth = ref(false);
const showKeywordCase = ref(false);
const showIndentStyle = ref(false);

function closeAllDropdowns() {
  showDialect.value = false;
  showTabWidth.value = false;
  showKeywordCase.value = false;
  showIndentStyle.value = false;
}

function toggleDropdown(which: "dialect" | "tabWidth" | "keywordCase" | "indentStyle") {
  const wasOpen = { dialect: showDialect.value, tabWidth: showTabWidth.value, keywordCase: showKeywordCase.value, indentStyle: showIndentStyle.value };
  closeAllDropdowns();
  if (!wasOpen[which]) {
    if (which === "dialect") showDialect.value = true;
    if (which === "tabWidth") showTabWidth.value = true;
    if (which === "keywordCase") showKeywordCase.value = true;
    if (which === "indentStyle") showIndentStyle.value = true;
  }
}

const KEYWORD_CASE_LABELS: Record<KeywordCase, string> = { upper: "大写", lower: "小写", preserve: "保持" };
const INDENT_STYLE_LABELS: Record<IndentStyle, string> = { standard: "标准", tabularLeft: "左对齐", tabularRight: "右对齐" };

async function copyOutput() {
  if (!output.value) return;
  await navigator.clipboard.writeText(output.value);
}
</script>

<template>
  <div class="sql-root" @click="closeAllDropdowns">
    <!-- 顶栏 -->
    <div class="glass-bar tb">
      <div class="tb-left">
        <svg class="tb-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
        </svg>
        <span class="tb-title">SQL</span>

        <!-- 方言选择 -->
        <div class="dropdown-wrap" @click.stop>
          <button class="sel-btn" @click="toggleDropdown('dialect')">
            {{ dialectLabel }}
            <svg class="chevron" :class="{ open: showDialect }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div v-if="showDialect" class="dropdown">
            <button v-for="(label, key) in DIALECT_LABELS" :key="key"
              class="dropdown-item" :class="{ active: options.dialect === key }"
              @click="options.dialect = key as SqlDialect; closeAllDropdowns(); formatSql()">
              {{ label }}
            </button>
          </div>
        </div>

        <!-- Tab 宽度 -->
        <div class="dropdown-wrap" @click.stop>
          <button class="sel-btn" @click="toggleDropdown('tabWidth')">
            Tab: {{ options.tabWidth }}
            <svg class="chevron" :class="{ open: showTabWidth }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div v-if="showTabWidth" class="dropdown">
            <button v-for="n in [2, 4]" :key="n"
              class="dropdown-item" :class="{ active: options.tabWidth === n }"
              @click="options.tabWidth = n; closeAllDropdowns(); formatSql()">
              {{ n }} spaces
            </button>
          </div>
        </div>

        <!-- 关键字大小写 -->
        <div class="dropdown-wrap" @click.stop>
          <button class="sel-btn" @click="toggleDropdown('keywordCase')">
            {{ KEYWORD_CASE_LABELS[options.keywordCase] }}
            <svg class="chevron" :class="{ open: showKeywordCase }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div v-if="showKeywordCase" class="dropdown">
            <button v-for="(label, key) in KEYWORD_CASE_LABELS" :key="key"
              class="dropdown-item" :class="{ active: options.keywordCase === key }"
              @click="options.keywordCase = key as KeywordCase; closeAllDropdowns(); formatSql()">
              {{ label }}
            </button>
          </div>
        </div>

        <!-- 缩进风格 -->
        <div class="dropdown-wrap" @click.stop>
          <button class="sel-btn" @click="toggleDropdown('indentStyle')">
            {{ INDENT_STYLE_LABELS[options.indentStyle] }}
            <svg class="chevron" :class="{ open: showIndentStyle }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div v-if="showIndentStyle" class="dropdown">
            <button v-for="(label, key) in INDENT_STYLE_LABELS" :key="key"
              class="dropdown-item" :class="{ active: options.indentStyle === key }"
              @click="options.indentStyle = key as IndentStyle; closeAllDropdowns(); formatSql()">
              {{ label }}
            </button>
          </div>
        </div>
      </div>

      <div class="tb-right">
        <button class="btn btn-primary" @click="formatSql" :disabled="!input.trim()">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          格式化
        </button>
        <button class="btn" @click="minifySql" :disabled="!input.trim()">压缩</button>
        <button class="btn" @click="copyOutput" :disabled="!output">复制</button>
        <button class="btn" @click="clearAll">清空</button>
        <button class="btn" @click="loadExample">示例</button>
      </div>
    </div>

    <!-- 错误条 -->
    <div v-if="errorMsg" class="err-bar">{{ errorMsg }}</div>

    <!-- 双栏主体 -->
    <div class="cols flex-1 flex gap-2 p-2 min-h-0 overflow-hidden">
      <!-- 左栏：输入 -->
      <div class="glass-card col col-left flex-1 flex flex-col min-h-0 overflow-hidden">
        <div class="col-hd"><span class="dot dot-input"></span>Input</div>
        <div class="editor-wrap">
          <div ref="lineNumbersRef" class="line-numbers">
            <div v-for="n in lineCount" :key="n" class="ln" :class="{ 'ln-active': n === cursorLine }">{{ n }}</div>
          </div>
          <div class="editor-body">
            <pre ref="highlightRef" class="highlight-layer" v-html="inputHighlighted"></pre>
            <textarea
              ref="textareaRef"
              v-model="input"
              class="sql-textarea"
              placeholder="在此粘贴或输入 SQL ..."
              spellcheck="false"
              @scroll="onInputScroll"
              @keyup="updateCursorPosition"
              @click="updateCursorPosition"
            />
          </div>
        </div>
      </div>

      <!-- 右栏：输出 -->
      <div class="glass-card col col-right flex-1 flex flex-col min-h-0 overflow-hidden">
        <div class="col-hd"><span class="dot dot-output"></span>Output</div>
        <div class="editor-wrap">
          <div ref="outputLineNumbersRef" class="line-numbers">
            <div v-for="n in outputLineCount" :key="n" class="ln">{{ n }}</div>
          </div>
          <div class="editor-body">
            <pre ref="outputHighlightRef" class="highlight-layer output-layer" v-html="outputHighlighted" @scroll="onOutputScroll"></pre>
            <div v-if="!output && !errorMsg" class="placeholder">格式化结果将显示在这里</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <span>Ln {{ cursorLine }}, Col {{ cursorCol }}</span>
      <span>{{ charCount }} 字符</span>
      <span>{{ dialectLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.sql-root { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 0; }

/* ── 顶栏 ── */
.tb { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; flex-shrink: 0; gap: 6px; min-height: 52px; border-bottom: 1px solid rgba(0,0,0,0.04); }
:global(.dark) .tb { border-bottom-color: rgba(255,255,255,0.04); }
.tb-left { display: flex; align-items: center; gap: 6px; }
.tb-right { display: flex; align-items: center; gap: 4px; }
.tb-icon { width: 18px; height: 18px; color: #4F8CFF; flex-shrink: 0; }
.tb-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #86868b; margin-right: 4px; }

/* 下拉 */
.dropdown-wrap { position: relative; }
.sel-btn {
  display: flex; align-items: center; gap: 3px; font-size: 10px; padding: 2px 6px;
  border-radius: 5px; border: none; cursor: pointer; font-weight: 500;
  background: rgba(0,0,0,0.04); color: #1d1d1f; transition: all .15s;
}
.sel-btn:hover { background: rgba(0,0,0,0.08); }
.chevron { width: 10px; height: 10px; transition: transform .15s; }
.chevron.open { transform: rotate(180deg); }
:global(.dark) .sel-btn { background: rgba(255,255,255,0.06); color: #e5e7eb; }
:global(.dark) .sel-btn:hover { background: rgba(255,255,255,0.1); }

.dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; z-index: 50;
  background: rgba(238, 242, 248, 0.85); backdrop-filter: blur(32px) saturate(180%); -webkit-backdrop-filter: blur(32px) saturate(180%);
  border-radius: 8px; padding: 3px; min-width: 120px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06);
}
:global(.dark) .dropdown { background: rgba(30,38,50,0.95); box-shadow: 0 4px 16px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(255,255,255,0.06); }
.dropdown-item {
  display: block; width: 100%; text-align: left; font-size: 11px; padding: 5px 10px;
  border-radius: 5px; border: none; cursor: pointer; background: transparent; color: #1d1d1f;
}
.dropdown-item:hover { background: rgba(59,130,246,0.08); }
.dropdown-item.active { background: rgba(59,130,246,0.12); color: #3b82f6; font-weight: 600; }
:global(.dark) .dropdown-item { color: #e5e7eb; }
:global(.dark) .dropdown-item:hover { background: rgba(59,130,246,0.12); }
:global(.dark) .dropdown-item.active { background: rgba(59,130,246,0.18); color: #60a5fa; }

/* 按钮 */
.btn {
  font-size: 10px; padding: 3px 8px; border-radius: 5px; border: none; cursor: pointer;
  background: rgba(0,0,0,0.04); color: #1d1d1f; font-weight: 500; transition: all .15s;
  display: flex; align-items: center; gap: 3px;
}
.btn:hover { background: rgba(0,0,0,0.08); }
.btn:disabled { opacity: .35; cursor: default; }
.btn-primary { background: rgba(59,130,246,0.1); color: #3b82f6; }
.btn-primary:hover { background: rgba(59,130,246,0.18); }
.btn-icon { width: 12px; height: 12px; }
:global(.dark) .btn { background: rgba(255,255,255,0.06); color: #e5e7eb; }
:global(.dark) .btn:hover { background: rgba(255,255,255,0.1); }
:global(.dark) .btn-primary { background: rgba(59,130,246,0.15); color: #60a5fa; }

.err-bar { padding: 4px 12px; font-size: 10px; color: #ef4444; background: rgba(239,68,68,0.05); flex-shrink: 0; }

/* ── 双栏 ── */
.cols { display: flex; gap: 8px; padding: 8px; flex: 1; min-height: 0; overflow: hidden; }
.col { display: flex; flex-direction: column; min-height: 0; overflow: hidden; }

.col-hd {
  padding: 5px 12px; font-size: 10px; font-weight: 600; letter-spacing: 1px;
  color: #86868b; display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}
:global(.dark) .col-hd { border-bottom-color: rgba(255,255,255,0.03); }
.dot { width: 5px; height: 5px; border-radius: 50%; }
.dot-input { background: #f59e0b; }
.dot-output { background: #3b82f6; }

/* 编辑器 */
.editor-wrap { flex: 1; display: flex; min-height: 0; overflow: hidden; }
.line-numbers {
  width: 36px; flex-shrink: 0; overflow: hidden; padding: 8px 0;
  border-right: 1px solid rgba(0,0,0,0.04);
}
:global(.dark) .line-numbers { border-right-color: rgba(255,255,255,0.04); }
.ln {
  font-family: 'SF Mono','Fira Code','Menlo',monospace; font-size: 11px; line-height: 20px;
  text-align: right; padding-right: 8px; color: #c7c7cc; user-select: none;
}
.ln-active { color: #86868b; }

.editor-body { flex: 1; position: relative; overflow: hidden; }

.highlight-layer {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  font-family: 'SF Mono','Fira Code','Menlo',monospace; font-size: 12px; line-height: 20px;
  white-space: pre-wrap; word-break: break-all; overflow: auto;
  padding: 8px 10px; margin: 0; pointer-events: none; color: transparent;
}
.output-layer { pointer-events: auto; overflow: auto; color: inherit; position: relative; }

.sql-textarea {
  position: relative; z-index: 1; width: 100%; height: 100%;
  font-family: 'SF Mono','Fira Code','Menlo',monospace; font-size: 12px; line-height: 20px;
  padding: 8px 10px; border: none; outline: none; resize: none;
  background: transparent; color: transparent; caret-color: #1d1d1f;
  white-space: pre-wrap; word-break: break-all;
}
:global(.dark) .sql-textarea { caret-color: #e5e7eb; }
.sql-textarea::placeholder { color: #86868b; }
.sql-textarea::selection { background: rgba(59,130,246,0.2); }

.placeholder {
  display: flex; align-items: center; justify-content: center;
  height: 100%; font-size: 11px; color: #86868b;
}

/* ── 状态栏 ── */
.status-bar {
  display: flex; align-items: center; gap: 16px; padding: 3px 12px; flex-shrink: 0;
  font-size: 10px; color: #86868b;
  border-top: 1px solid rgba(0,0,0,0.04);
}
:global(.dark) .status-bar { border-top-color: rgba(255,255,255,0.04); }

/* ── SQL 语法高亮 ── */
:deep(.sql-keyword) { color: #2563eb; font-weight: 600; }
:deep(.sql-string) { color: #059669; }
:deep(.sql-number) { color: #d97706; }
:deep(.sql-comment) { color: #9ca3af; font-style: italic; }
:deep(.sql-function) { color: #7c3aed; }
:deep(.sql-operator) { color: #dc2626; }
:deep(.sql-text) { color: #1d1d1f; }

:global(.dark) :deep(.sql-keyword) { color: #60a5fa; font-weight: 600; }
:global(.dark) :deep(.sql-string) { color: #34d399; }
:global(.dark) :deep(.sql-number) { color: #fbbf24; }
:global(.dark) :deep(.sql-comment) { color: #6b7280; font-style: italic; }
:global(.dark) :deep(.sql-function) { color: #a78bfa; }
:global(.dark) :deep(.sql-operator) { color: #f87171; }
:global(.dark) :deep(.sql-text) { color: #e5e7eb; }
</style>
