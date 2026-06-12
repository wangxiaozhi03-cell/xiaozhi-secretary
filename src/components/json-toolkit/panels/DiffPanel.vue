<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{ jsonA: string }>();

const inputB = ref("");
const errorMsg = ref("");
const compared = ref(false);

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

function compare() {
  errorMsg.value = "";
  diffLines.value = [];
  compared.value = true;
  const tA = props.jsonA.trim();
  const tB = inputB.value.trim();
  if (!tA || !tB) return;
  try {
    const fA = JSON.stringify(JSON.parse(tA), null, 2);
    const fB = JSON.stringify(JSON.parse(tB), null, 2);
    diffLines.value = computeDiff(fA.split("\n"), fB.split("\n"));
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
}));
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div class="px-3 py-1.5 text-[10px] font-medium text-tertiary uppercase tracking-widest border-b border-black/[0.03] dark:border-white/[0.04] flex items-center justify-between flex-shrink-0">
      <span>JSON B</span>
      <div class="flex items-center gap-1">
        <button class="text-[10px] px-2 py-0.5 rounded bg-blue-500/[0.08] text-blue-500 font-medium hover:bg-blue-500/[0.14] transition-colors" @click="compare">Compare</button>
        <button class="text-[10px] px-1.5 py-0.5 rounded text-tertiary hover:text-secondary transition-colors" @click="inputB = ''; compared = false; diffLines = []">Clear</button>
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
        </template>
        <span v-if="compared && diffLines.length === 0 && !errorMsg" class="normal-case tracking-normal text-emerald-500">✓ 一致</span>
      </div>

      <div v-if="!compared" class="flex-1 flex items-center justify-center text-[11px] text-tertiary">粘贴 JSON B 后点击 Compare</div>
      <div v-else class="flex-1 overflow-y-auto font-mono text-[12px] leading-relaxed">
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
