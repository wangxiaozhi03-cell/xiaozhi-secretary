<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{ jsonA: string }>();

const inputB = ref("");
const errorMsg = ref("");
const compared = ref(false);

// 选项
const ignoreWhitespace = ref(false);
const ignoreKeyOrder = ref(false);

// A 内容变化时清除旧结果
watch(() => props.jsonA, () => {
  compared.value = false;
  diffLines.value = [];
  errorMsg.value = "";
});

interface DiffLine {
  type: "same" | "added" | "removed";
  lineA: string;
  lineB: string;
  lineNumA: number | null;
  lineNumB: number | null;
}
const diffLines = ref<DiffLine[]>([]);

// 规范化 JSON
function normalizeJson(json: string, _ignoreWhitespace: boolean, shouldIgnoreKeyOrder: boolean): string {
  try {
    const parsed = JSON.parse(json);

    if (shouldIgnoreKeyOrder) {
      // 深度排序 key
      const sorted = sortKeys(parsed);
      return JSON.stringify(sorted, null, 2);
    }

    return JSON.stringify(parsed, null, 2);
  } catch {
    return json;
  }
}

// 递归排序 key
function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    for (const key of keys) {
      sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

function compare() {
  errorMsg.value = "";
  diffLines.value = [];
  compared.value = true;
  const tA = props.jsonA.trim();
  const tB = inputB.value.trim();
  if (!tA || !tB) return;

  try {
    const fA = normalizeJson(tA, ignoreWhitespace.value, ignoreKeyOrder.value);
    const fB = normalizeJson(tB, ignoreWhitespace.value, ignoreKeyOrder.value);

    const linesA = ignoreWhitespace.value ? fA.split("\n").map(l => l.trim()) : fA.split("\n");
    const linesB = ignoreWhitespace.value ? fB.split("\n").map(l => l.trim()) : fB.split("\n");

    diffLines.value = computeDiff(linesA, linesB);
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Invalid JSON";
  }
}

function computeDiff(a: string[], b: string[]): DiffLine[] {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const temp: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { temp.push({ type: "same", lineA: a[i - 1], lineB: b[j - 1], lineNumA: i, lineNumB: j }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { temp.push({ type: "added", lineA: "", lineB: b[j - 1], lineNumA: null, lineNumB: j }); j--; }
    else { temp.push({ type: "removed", lineA: a[i - 1], lineB: "", lineNumA: i, lineNumB: null }); i--; }
  }
  return temp.reverse();
}

const stats = computed(() => ({
  added: diffLines.value.filter((d) => d.type === "added").length,
  removed: diffLines.value.filter((d) => d.type === "removed").length,
  unchanged: diffLines.value.filter((d) => d.type === "same").length,
}));

// 导出 Diff
async function exportDiff() {
  if (!compared.value || diffLines.value.length === 0) return;

  const lines: string[] = [
    "JSON Diff Report",
    "================",
    "",
    `Date: ${new Date().toLocaleString()}`,
    `Options: ${ignoreWhitespace.value ? 'Ignore Whitespace' : ''} ${ignoreKeyOrder.value ? 'Ignore Key Order' : ''}`,
    "",
    `Summary: +${stats.value.added} -${stats.value.removed} ${stats.value.unchanged} unchanged`,
    "",
    "--- A",
    "+++ B",
    "",
  ];

  for (const line of diffLines.value) {
    if (line.type === "same") {
      lines.push(`  ${line.lineA}`);
    } else if (line.type === "removed") {
      lines.push(`- ${line.lineA}`);
    } else if (line.type === "added") {
      lines.push(`+ ${line.lineB}`);
    }
  }

  const content = lines.join("\n");

  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const filePath = await save({
      filters: [
        { name: "Text", extensions: ["txt", "diff"] },
      ],
      defaultPath: "diff-result.txt",
    });
    if (filePath) {
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");
      await writeTextFile(filePath, content);
    }
  } catch {
    // 回退到剪贴板
    navigator.clipboard.writeText(content);
  }
}

// 清空
function clearAll() {
  inputB.value = "";
  compared.value = false;
  diffLines.value = [];
  errorMsg.value = "";
}

// 同步滚动
const leftPanelRef = ref<HTMLDivElement>();
const rightPanelRef = ref<HTMLDivElement>();
const isSyncingScroll = ref(false);

function syncScroll(source: "left" | "right") {
  if (isSyncingScroll.value) return;
  isSyncingScroll.value = true;

  const sourceEl = source === "left" ? leftPanelRef.value : rightPanelRef.value;
  const targetEl = source === "left" ? rightPanelRef.value : leftPanelRef.value;

  if (sourceEl && targetEl) {
    targetEl.scrollTop = sourceEl.scrollTop;
  }

  requestAnimationFrame(() => {
    isSyncingScroll.value = false;
  });
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div class="px-3 py-2 border-b border-black/[0.03] dark:border-white/[0.04] flex-shrink-0">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-medium text-tertiary uppercase tracking-widest">JSON B</span>
        <div class="flex items-center gap-1">
          <button
            class="text-[10px] px-2 py-0.5 rounded bg-blue-500/[0.08] text-blue-500 font-medium hover:bg-blue-500/[0.14] transition-colors"
            @click="compare"
          >
            Compare
          </button>
          <button
            class="text-[10px] px-1.5 py-0.5 rounded text-tertiary hover:text-secondary transition-colors"
            @click="clearAll"
          >
            Clear
          </button>
          <button
            class="text-[10px] px-1.5 py-0.5 rounded text-tertiary hover:text-secondary transition-colors"
            @click="exportDiff"
          >
            Export
          </button>
        </div>
      </div>

      <!-- 选项 -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input
            v-model="ignoreWhitespace"
            type="checkbox"
            class="w-3 h-3 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500/20"
          />
          <span class="text-[10px] text-tertiary">忽略空格</span>
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input
            v-model="ignoreKeyOrder"
            type="checkbox"
            class="w-3 h-3 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500/20"
          />
          <span class="text-[10px] text-tertiary">忽略 Key 顺序</span>
        </label>
      </div>
    </div>

    <!-- B 输入区 -->
    <div class="flex-1 min-h-0 flex flex-col">
      <textarea
        v-model="inputB"
        class="flex-1 resize-none p-3 text-[13px] font-mono leading-[1.5] bg-transparent outline-none text-primary placeholder:text-tertiary whitespace-pre break-all"
        placeholder="Paste JSON B here..."
        spellcheck="false"
      />
    </div>

    <!-- Diff 结果 -->
    <div class="flex-shrink-0 h-[40%] flex flex-col border-t border-black/[0.04] dark:border-white/[0.06]">
      <div class="px-3 py-1 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.02] dark:border-white/[0.03] flex items-center gap-2 flex-shrink-0">
        <span>Diff</span>
        <template v-if="diffLines.length">
          <span class="normal-case tracking-normal text-emerald-500">+{{ stats.added }}</span>
          <span class="normal-case tracking-normal text-rose-500">-{{ stats.removed }}</span>
          <span class="normal-case tracking-normal text-tertiary">{{ stats.unchanged }} unchanged</span>
        </template>
        <span v-if="compared && diffLines.length === 0 && !errorMsg" class="normal-case tracking-normal text-emerald-500">✓ 一致</span>
      </div>

      <div v-if="!compared" class="flex-1 flex items-center justify-center text-[11px] text-tertiary">粘贴 JSON B 后点击 Compare</div>
      <div
        v-else
        ref="leftPanelRef"
        class="flex-1 overflow-y-auto font-mono text-[12px] leading-relaxed"
        @scroll="syncScroll('left')"
      >
        <table class="w-full border-collapse">
          <tbody>
            <template v-for="(line, idx) in diffLines" :key="idx">
              <tr v-if="line.type !== 'same' && idx > 0 && diffLines[idx - 1]?.type === 'same'"><td colspan="4" class="h-1" /></tr>
              <tr :class="{ 'bg-emerald-50/70 dark:bg-emerald-500/[0.08]': line.type === 'added', 'bg-rose-50/70 dark:bg-rose-500/[0.08]': line.type === 'removed' }">
                <td class="w-7 text-right pr-1 py-px select-none text-tertiary text-[10px] border-r border-black/[0.03] dark:border-white/[0.04]">{{ line.lineNumA ?? '' }}</td>
                <td class="w-7 text-right pr-1 py-px select-none text-tertiary text-[10px] border-r border-black/[0.03] dark:border-white/[0.04]">{{ line.lineNumB ?? '' }}</td>
                <td class="w-4 text-center py-px select-none" :class="{ 'text-emerald-500': line.type === 'added', 'text-rose-500': line.type === 'removed' }">{{ line.type === 'added' ? '+' : '-' }}</td>
                <td class="py-px pl-1 pr-3 whitespace-pre overflow-hidden text-ellipsis">{{ line.type === 'removed' ? line.lineA : line.lineB }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="errorMsg" class="px-3 py-1.5 text-[10px] text-rose-500 bg-rose-50/80 dark:bg-rose-500/10 border-t border-rose-200 dark:border-rose-500/20 flex-shrink-0">{{ errorMsg }}</div>
  </div>
</template>
