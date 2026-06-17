<script setup lang="ts">
import { ref, computed, watch, h } from "vue";

const localA = ref("");
const inputB = ref("");
const errorMsg = ref("");
const compared = ref(false);
const ignoreWhitespace = ref(false);
const ignoreKeyOrder = ref(false);

interface CharSeg { text: string; type: "same" | "added" | "removed" }
interface DiffRow {
  type: "same" | "added" | "removed" | "modified";
  lineA: string; lineB: string;
  numA: number | null; numB: number | null;
  charDiffA?: CharSeg[]; charDiffB?: CharSeg[];
}
const diffRows = ref<DiffRow[]>([]);

const stats = computed(() => ({
  added: diffRows.value.filter(d => d.type === "added").length,
  removed: diffRows.value.filter(d => d.type === "removed").length,
  modified: diffRows.value.filter(d => d.type === "modified").length,
  unchanged: diffRows.value.filter(d => d.type === "same").length,
}));

const hasA = computed(() => !!localA.value.trim());
const hasB = computed(() => !!inputB.value.trim());
const hasDiff = computed(() => compared.value && diffRows.value.length > 0);

/* ── 自动对比（150ms 防抖） ── */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch([localA, inputB], () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!hasA.value && !hasB.value) {
    compared.value = false; diffRows.value = []; errorMsg.value = ""; return;
  }
  debounceTimer = setTimeout(compare, 150);
});

/* ── JSON 工具 ── */
function normalizeJson(json: string, _ignoreWS: boolean, ignoreOrder: boolean): string {
  try {
    const parsed = JSON.parse(json);
    if (ignoreOrder) return JSON.stringify(sortKeys(parsed), null, 2);
    return JSON.stringify(parsed, null, 2);
  } catch { return json; }
}
function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(obj as Record<string, unknown>).sort())
      sorted[k] = sortKeys((obj as Record<string, unknown>)[k]);
    return sorted;
  }
  return obj;
}

/* ── LCS Diff ── */
function computeLCS(a: string[], b: string[]) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp;
}

function buildRawDiff(a: string[], b: string[]) {
  const dp = computeLCS(a, b);
  const result: { tag: "same" | "added" | "removed"; text: string; numA: number | null; numB: number | null }[] = [];
  let i = a.length, j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { result.push({ tag: "same", text: a[i - 1], numA: i, numB: j }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { result.push({ tag: "added", text: b[j - 1], numA: null, numB: j }); j--; }
    else { result.push({ tag: "removed", text: a[i - 1], numA: i, numB: null }); i--; }
  }
  return result.reverse();
}

function buildDiffRows(a: string[], b: string[]): DiffRow[] {
  const raw = buildRawDiff(a, b);
  const rows: DiffRow[] = [];
  let idx = 0;
  while (idx < raw.length) {
    if (raw[idx].tag === "removed") {
      const rem: typeof raw = [];
      while (idx < raw.length && raw[idx].tag === "removed") rem.push(raw[idx++]);
      const add: typeof raw = [];
      while (idx < raw.length && raw[idx].tag === "added") add.push(raw[idx++]);
      const pairs = Math.min(rem.length, add.length);
      for (let k = 0; k < pairs; k++) {
        const cd = charDiff(rem[k].text, add[k].text);
        rows.push({ type: "modified", lineA: rem[k].text, lineB: add[k].text, numA: rem[k].numA, numB: add[k].numB, charDiffA: cd.a, charDiffB: cd.b });
      }
      for (let k = pairs; k < rem.length; k++) rows.push({ type: "removed", lineA: rem[k].text, lineB: "", numA: rem[k].numA, numB: null });
      for (let k = pairs; k < add.length; k++) rows.push({ type: "added", lineA: "", lineB: add[k].text, numA: null, numB: add[k].numB });
    } else if (raw[idx].tag === "added") {
      rows.push({ type: "added", lineA: "", lineB: raw[idx].text, numA: null, numB: raw[idx].numB }); idx++;
    } else {
      rows.push({ type: "same", lineA: raw[idx].text, lineB: raw[idx].text, numA: raw[idx].numA, numB: raw[idx].numB }); idx++;
    }
  }
  return rows;
}

function charDiff(oldStr: string, newStr: string): { a: CharSeg[]; b: CharSeg[] } {
  const m = oldStr.length, n = newStr.length;
  if (m + n > 600) return { a: [{ text: oldStr, type: "removed" }], b: [{ text: newStr, type: "added" }] };
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = oldStr[i - 1] === newStr[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const segs: { ch: string; tag: "same" | "added" | "removed" }[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) { segs.push({ ch: oldStr[i - 1], tag: "same" }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { segs.push({ ch: newStr[j - 1], tag: "added" }); j--; }
    else { segs.push({ ch: oldStr[i - 1], tag: "removed" }); i--; }
  }
  segs.reverse();
  const merge = (tag: "removed" | "added") => {
    const out: CharSeg[] = [];
    for (const s of segs) {
      if (s.tag === "same") { if (out.length && out[out.length - 1].type === "same") out[out.length - 1].text += s.ch; else out.push({ text: s.ch, type: "same" }); }
      else if (s.tag === tag) { if (out.length && out[out.length - 1].type === tag) out[out.length - 1].text += s.ch; else out.push({ text: s.ch, type: tag }); }
    }
    return out;
  };
  return { a: merge("removed"), b: merge("added") };
}

/* ── 对比 ── */
function compare() {
  errorMsg.value = ""; diffRows.value = [];
  const tA = localA.value.trim(), tB = inputB.value.trim();
  if (!tA && !tB) { compared.value = true; return; }
  if (!tA || !tB) { compared.value = true; errorMsg.value = !tA ? "JSON A 为空" : "JSON B 为空"; return; }
  compared.value = true;
  try {
    const fA = normalizeJson(tA, ignoreWhitespace.value, ignoreKeyOrder.value);
    const fB = normalizeJson(tB, ignoreWhitespace.value, ignoreKeyOrder.value);
    const lA = ignoreWhitespace.value ? fA.split("\n").map(l => l.trim()) : fA.split("\n");
    const lB = ignoreWhitespace.value ? fB.split("\n").map(l => l.trim()) : fB.split("\n");
    diffRows.value = buildDiffRows(lA, lB);
  } catch (e: unknown) { errorMsg.value = e instanceof Error ? e.message : "Invalid JSON"; }
}

function clearAll() { localA.value = ""; inputB.value = ""; compared.value = false; diffRows.value = []; errorMsg.value = ""; }

/* ── 语法着色 ── */
function tokenizeJsonLine(line: string): { text: string; cls: string }[] {
  const tokens: { text: string; cls: string }[] = [];
  const re = /(\s+)|("[\w$.\-@\s]*"\s*(?=:))|("(?:[^"\\]|\\.)*")|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}\[\]])|([,:])/g;
  let match: RegExpExecArray | null; let lastIdx = 0;
  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIdx) tokens.push({ text: line.slice(lastIdx, match.index), cls: "" });
    if (match[1]) tokens.push({ text: match[1], cls: "" });
    else if (match[2]) tokens.push({ text: match[2], cls: "json-key" });
    else if (match[3]) tokens.push({ text: match[3], cls: "json-string" });
    else if (match[4]) tokens.push({ text: match[4], cls: "json-number" });
    else if (match[5]) tokens.push({ text: match[5], cls: "json-bool" });
    else if (match[6]) tokens.push({ text: match[6], cls: "json-null" });
    else if (match[7]) tokens.push({ text: match[7], cls: "json-bracket" });
    else if (match[8]) tokens.push({ text: match[8], cls: "json-punct" });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < line.length) tokens.push({ text: line.slice(lastIdx), cls: "" });
  return tokens;
}

function renderLine(line: string) {
  return h("span", tokenizeJsonLine(line).map(t => t.cls ? h("span", { class: t.cls }, t.text) : h("span", t.text)));
}
function renderModifiedA(segs: CharSeg[]) {
  return h("span", segs.map(s => s.type === "removed" ? h("span", { class: "char-removed" }, s.text) : tokenizeJsonLine(s.text).map(t => t.cls ? h("span", { class: t.cls }, t.text) : h("span", t.text))).flat());
}
function renderModifiedB(segs: CharSeg[]) {
  return h("span", segs.map(s => s.type === "added" ? h("span", { class: "char-added" }, s.text) : tokenizeJsonLine(s.text).map(t => t.cls ? h("span", { class: t.cls }, t.text) : h("span", t.text))).flat());
}

/* ── 导出 ── */
async function exportDiff() {
  if (!compared.value || !diffRows.value.length) return;
  const lines: string[] = ["JSON Diff Report", "================", "", `Date: ${new Date().toLocaleString()}`, "",
    `Summary: +${stats.value.added} -${stats.value.removed} ~${stats.value.modified} ${stats.value.unchanged} unchanged`, "", "--- A", "+++ B", ""];
  for (const r of diffRows.value) {
    if (r.type === "same") lines.push(`  ${r.lineA}`);
    else if (r.type === "removed") lines.push(`- ${r.lineA}`);
    else if (r.type === "added") lines.push(`+ ${r.lineB}`);
    else { lines.push(`- ${r.lineA}`); lines.push(`+ ${r.lineB}`); }
  }
  const content = lines.join("\n");
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const fp = await save({ filters: [{ name: "Text", extensions: ["txt", "diff"] }], defaultPath: "diff-result.txt" });
    if (fp) { const { writeTextFile } = await import("@tauri-apps/plugin-fs"); await writeTextFile(fp, content); }
  } catch { navigator.clipboard.writeText(content); }
}

function needSep(idx: number) {
  if (idx === 0) return false;
  const p = diffRows.value[idx - 1].type, c = diffRows.value[idx].type;
  return (p === "same" && c !== "same") || (p !== "same" && c === "same");
}

/* ── 同步滚动（diff 区域） ── */
const leftScrollRef = ref<HTMLDivElement>();
const rightScrollRef = ref<HTMLDivElement>();
let isSyncing = false;
function onScrollSide(source: "left" | "right") {
  if (isSyncing) return;
  isSyncing = true;
  const src = source === "left" ? leftScrollRef.value : rightScrollRef.value;
  const tgt = source === "left" ? rightScrollRef.value : leftScrollRef.value;
  if (src && tgt) tgt.scrollTop = src.scrollTop;
  requestAnimationFrame(() => { isSyncing = false; });
}
</script>

<template>
  <div class="diff-root">
    <!-- 顶栏 -->
    <div class="diff-toolbar">
      <div class="tb-left">
        <span class="tb-title">DIFF</span>
        <template v-if="hasDiff">
          <span class="pill pill-added">+{{ stats.added }}</span>
          <span class="pill pill-removed">-{{ stats.removed }}</span>
          <span v-if="stats.modified" class="pill pill-modified">~{{ stats.modified }}</span>
          <span v-if="!stats.added && !stats.removed && !stats.modified" class="pill pill-ok">✓ 一致</span>
        </template>
      </div>
      <div class="tb-right">
        <label class="opt"><input v-model="ignoreWhitespace" type="checkbox" class="chk" /><span>忽略空白</span></label>
        <label class="opt"><input v-model="ignoreKeyOrder" type="checkbox" class="chk" /><span>忽略Key序</span></label>
        <span class="sep"></span>
        <button class="btn btn-blue" @click="compare">Compare</button>
        <button class="btn" @click="clearAll">Clear</button>
        <button class="btn" :disabled="!hasDiff" @click="exportDiff">Export</button>
      </div>
    </div>
    <div v-if="errorMsg" class="err-bar">{{ errorMsg }}</div>

    <!-- 两栏主体：编辑器 + diff 结果 -->
    <div class="diff-cols">
      <!-- 左栏：JSON A -->
      <div class="col col-left">
        <div class="col-hd"><span class="dot dot-a"></span>JSON A</div>
        <textarea v-model="localA" class="raw-input" placeholder="在此粘贴 JSON A ..." spellcheck="false" />
        <div ref="leftScrollRef" class="diff-body" @scroll="onScrollSide('left')">
          <template v-if="hasDiff">
            <template v-for="(row, idx) in diffRows" :key="'a' + idx">
              <div v-if="needSep(idx)" class="sep-line"></div>
              <div class="dline" :class="{
                'dl-removed': row.type === 'removed',
                'dl-modified': row.type === 'modified',
                'dl-empty': row.type === 'added',
              }">
                <span class="ln">{{ row.numA ?? '' }}</span>
                <span class="mk" :class="{ 'mk-red': row.type === 'removed', 'mk-orange': row.type === 'modified' }">{{ row.type === 'removed' ? '−' : row.type === 'modified' ? '~' : '' }}</span>
                <span class="lc">
                  <template v-if="row.type === 'removed'"><component :is="() => renderLine(row.lineA)" /></template>
                  <template v-else-if="row.type === 'modified' && row.charDiffA"><component :is="() => renderModifiedA(row.charDiffA!)" /></template>
                  <template v-else-if="row.type === 'same'"><component :is="() => renderLine(row.lineA)" /></template>
                </span>
              </div>
            </template>
          </template>
          <div v-else-if="compared && !hasDiff" class="diff-placeholder">✓ 无差异</div>
          <div v-else-if="!hasA" class="diff-placeholder">输入 JSON 后自动对比</div>
        </div>
      </div>

      <!-- 右栏：JSON B -->
      <div class="col col-right">
        <div class="col-hd"><span class="dot dot-b"></span>JSON B</div>
        <textarea v-model="inputB" class="raw-input" placeholder="在此粘贴 JSON B ..." spellcheck="false" />
        <div ref="rightScrollRef" class="diff-body" @scroll="onScrollSide('right')">
          <template v-if="hasDiff">
            <template v-for="(row, idx) in diffRows" :key="'b' + idx">
              <div v-if="needSep(idx)" class="sep-line"></div>
              <div class="dline" :class="{
                'dl-added': row.type === 'added',
                'dl-modified': row.type === 'modified',
                'dl-empty': row.type === 'removed',
              }">
                <span class="ln">{{ row.numB ?? '' }}</span>
                <span class="mk" :class="{ 'mk-green': row.type === 'added', 'mk-blue': row.type === 'modified' }">{{ row.type === 'added' ? '+' : row.type === 'modified' ? '~' : '' }}</span>
                <span class="lc">
                  <template v-if="row.type === 'added'"><component :is="() => renderLine(row.lineB)" /></template>
                  <template v-else-if="row.type === 'modified' && row.charDiffB"><component :is="() => renderModifiedB(row.charDiffB!)" /></template>
                  <template v-else-if="row.type === 'same'"><component :is="() => renderLine(row.lineB)" /></template>
                </span>
              </div>
            </template>
          </template>
          <div v-else-if="compared && !hasDiff" class="diff-placeholder">✓ 无差异</div>
          <div v-else-if="!hasB" class="diff-placeholder">输入 JSON 后自动对比</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diff-root { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

/* ── 顶栏 ── */
.diff-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; flex-shrink: 0; gap: 6px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
:global(.dark) .diff-toolbar { border-bottom-color: rgba(255,255,255,0.06); }
.tb-left { display: flex; align-items: center; gap: 6px; }
.tb-right { display: flex; align-items: center; gap: 5px; }
.tb-title { font-size: 10px; font-weight: 600; letter-spacing: 2px; color: #86868b; }
.pill { font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 8px; }
.pill-added { background: rgba(16,185,129,0.1); color: #059669; }
.pill-removed { background: rgba(239,68,68,0.1); color: #dc2626; }
.pill-modified { background: rgba(245,158,11,0.1); color: #d97706; }
.pill-ok { background: rgba(16,185,129,0.1); color: #059669; }
:global(.dark) .pill-added { background: rgba(16,185,129,0.15); color: #34d399; }
:global(.dark) .pill-removed { background: rgba(239,68,68,0.15); color: #f87171; }
:global(.dark) .pill-modified { background: rgba(245,158,11,0.15); color: #fbbf24; }
:global(.dark) .pill-ok { background: rgba(16,185,129,0.15); color: #34d399; }
.opt { display: flex; align-items: center; gap: 3px; font-size: 10px; color: #86868b; cursor: pointer; white-space: nowrap; }
.chk { width: 11px; height: 11px; accent-color: #3b82f6; border-radius: 2px; }
.sep { width: 1px; height: 12px; background: rgba(0,0,0,0.08); }
:global(.dark) .sep { background: rgba(255,255,255,0.1); }
.btn {
  font-size: 10px; padding: 2px 8px; border-radius: 5px; border: none; cursor: pointer;
  background: rgba(0,0,0,0.04); color: #1d1d1f; font-weight: 500; transition: all .15s;
}
.btn:hover { background: rgba(0,0,0,0.08); }
.btn:disabled { opacity: .35; cursor: default; }
.btn-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
.btn-blue:hover { background: rgba(59,130,246,0.18); }
:global(.dark) .btn { background: rgba(255,255,255,0.06); color: #e5e7eb; }
:global(.dark) .btn:hover { background: rgba(255,255,255,0.1); }
:global(.dark) .btn-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }

.err-bar { padding: 4px 10px; font-size: 10px; color: #ef4444; background: rgba(239,68,68,0.05); flex-shrink: 0; }

/* ── 双栏 ── */
.diff-cols { display: grid; grid-template-columns: 1fr 1fr; flex: 1; min-height: 0; overflow: hidden; }
.col { display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.col-left { border-right: 1px solid rgba(0,0,0,0.05); }
:global(.dark) .col-left { border-right-color: rgba(255,255,255,0.06); }

.col-hd {
  padding: 5px 10px; font-size: 10px; font-weight: 600; letter-spacing: 1px;
  color: #86868b; display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
:global(.dark) .col-hd { border-bottom-color: rgba(255,255,255,0.04); }
.dot { width: 5px; height: 5px; border-radius: 50%; }
.dot-a { background: #f59e0b; }
.dot-b { background: #3b82f6; }

/* ── 编辑区（始终可见） ── */
.raw-input {
  width: 100%; height: 160px; flex-shrink: 0; resize: none; padding: 6px 10px;
  border: none; border-bottom: 1px solid rgba(0,0,0,0.04); outline: none;
  font-family: 'SF Mono','Fira Code','Menlo',monospace; font-size: 12px; line-height: 1.5;
  background: transparent; color: #1d1d1f;
}
.raw-input::placeholder { color: #86868b; }
:global(.dark) .raw-input { color: #e5e7eb; border-bottom-color: rgba(255,255,255,0.04); }

/* ── Diff 区域 ── */
.diff-body { flex: 1; overflow-y: auto; min-height: 0; }
.diff-body::-webkit-scrollbar { width: 4px; }
.diff-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 2px; }
:global(.dark) .diff-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

.diff-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 11px; color: #86868b; }

/* ── Diff 行 ── */
.sep-line { height: 1px; background: rgba(0,0,0,0.05); }
:global(.dark) .sep-line { background: rgba(255,255,255,0.05); }

.dline {
  display: flex; align-items: stretch; min-height: 22px;
  font-family: 'SF Mono','Fira Code','Menlo',monospace; font-size: 12px; line-height: 22px;
  border-left: 3px solid transparent;
  transition: background .1s;
}
.ln {
  width: 30px; flex-shrink: 0; text-align: right; padding-right: 5px;
  font-size: 10px; color: #c7c7cc; user-select: none;
  display: flex; align-items: center; justify-content: flex-end;
}
.mk {
  width: 14px; flex-shrink: 0; text-align: center; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.lc { flex: 1; padding: 0 8px 0 2px; white-space: pre; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; }

/* ── 删除行（左栏） ── */
.dl-removed {
  background: rgba(239,68,68,0.12);
  border-left-color: #ef4444;
}
.dl-removed .ln { color: #f87171; background: rgba(239,68,68,0.06); }
.dl-removed .lc { color: #b91c1c; }
.mk-red { color: #dc2626; }
:global(.dark) .dl-removed { background: rgba(239,68,68,0.15); border-left-color: #f87171; }
:global(.dark) .dl-removed .ln { color: #991b1b; background: rgba(239,68,68,0.08); }
:global(.dark) .dl-removed .lc { color: #fca5a5; }

/* ── 新增行（右栏） ── */
.dl-added {
  background: rgba(16,185,129,0.12);
  border-left-color: #10b981;
}
.dl-added .ln { color: #34d399; background: rgba(16,185,129,0.06); }
.dl-added .lc { color: #047857; }
.mk-green { color: #059669; }
:global(.dark) .dl-added { background: rgba(16,185,129,0.15); border-left-color: #34d399; }
:global(.dark) .dl-added .ln { color: #065f46; background: rgba(16,185,129,0.08); }
:global(.dark) .dl-added .lc { color: #6ee7b7; }

/* ── 修改行 ── */
.dl-modified { }
.col-left .dl-modified {
  background: rgba(245,158,11,0.12);
  border-left-color: #f59e0b;
}
.col-left .dl-modified .ln { color: #fbbf24; background: rgba(245,158,11,0.06); }
.col-left .dl-modified .lc { color: #92400e; }
.mk-orange { color: #d97706; }
:global(.dark) .col-left .dl-modified { background: rgba(245,158,11,0.15); border-left-color: #fbbf24; }
:global(.dark) .col-left .dl-modified .ln { color: #78350f; background: rgba(245,158,11,0.08); }
:global(.dark) .col-left .dl-modified .lc { color: #fcd34d; }

.col-right .dl-modified {
  background: rgba(59,130,246,0.12);
  border-left-color: #3b82f6;
}
.col-right .dl-modified .ln { color: #60a5fa; background: rgba(59,130,246,0.06); }
.col-right .dl-modified .lc { color: #1e40af; }
.mk-blue { color: #2563eb; }
:global(.dark) .col-right .dl-modified { background: rgba(59,130,246,0.15); border-left-color: #60a5fa; }
:global(.dark) .col-right .dl-modified .ln { color: #1e3a5f; background: rgba(59,130,246,0.08); }
:global(.dark) .col-right .dl-modified .lc { color: #93c5fd; }

.dl-empty { background: rgba(0,0,0,0.02); }
:global(.dark) .dl-empty { background: rgba(255,255,255,0.025); }

/* ── 字符高亮 ── */
:deep(.char-removed) {
  background: rgba(239,68,68,0.3);
  border-radius: 3px; padding: 1px 2px;
  text-decoration: line-through;
  text-decoration-color: rgba(239,68,68,0.6);
}
:deep(.char-added) {
  background: rgba(16,185,129,0.35);
  border-radius: 3px; padding: 1px 2px;
  font-weight: 600;
}

/* ── JSON 语法 ── */
:deep(.json-key) { color: #2563eb; } :deep(.json-string) { color: #059669; }
:deep(.json-number) { color: #d97706; } :deep(.json-bool) { color: #7c3aed; }
:deep(.json-null) { color: #9ca3af; } :deep(.json-bracket) { color: #6b7280; }
:global(.dark) :deep(.json-key) { color: #60a5fa; } :global(.dark) :deep(.json-string) { color: #34d399; }
:global(.dark) :deep(.json-number) { color: #fbbf24; } :global(.dark) :deep(.json-bool) { color: #a78bfa; }
:global(.dark) :deep(.json-null) { color: #6b7280; } :global(.dark) :deep(.json-bracket) { color: #9ca3af; }
</style>
