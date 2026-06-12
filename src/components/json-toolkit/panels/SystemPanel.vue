<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

interface CpuInfo { name: string; brand: string; usage: number; frequency: number; core_count: number; }
interface MemoryInfo { total: number; used: number; available: number; usage_percent: number; swap_total: number; swap_used: number; }
interface DiskInfo { name: string; mount_point: string; total: number; available: number; used: number; usage_percent: number; file_system: string; }
interface ProcessInfo { pid: number; name: string; memory: number; cpu_usage: number; }
interface NetworkInfo { name: string; received: number; transmitted: number; }
interface HealthScore { total: number; cpu: number; memory: number; disk: number; pressure: string; }
interface SystemSnapshot { cpu: CpuInfo; memory: MemoryInfo; disks: DiskInfo[]; top_processes: ProcessInfo[]; networks: NetworkInfo[]; uptime: number; health: HealthScore; }
interface CleanResult { freed_bytes: number; before_used: number; after_used: number; message: string; }

const data = ref<SystemSnapshot | null>(null);
const loading = ref(false);
const error = ref("");
const sortBy = ref<"memory" | "cpu" | "name">("memory");
let timer: ReturnType<typeof setInterval> | null = null;

// 清理状态
const cleaning = ref(false);
const cleanResult = ref<CleanResult | null>(null);
const cleanLevel = ref<"soft" | "normal" | "aggressive">("soft");

// 进程结束确认
const killConfirm = ref<number | null>(null);

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0) + " " + units[i];
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

function ringPath(percent: number): string {
  const r = 40, c = 2 * Math.PI * r;
  return `${c} ${c - (percent / 100) * c}`;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-rose-500";
}

function pressureInfo(p: string): { label: string; color: string; bg: string } {
  if (p === "high") return { label: "高", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" };
  if (p === "medium") return { label: "中", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" };
  return { label: "低", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" };
}

const sortedProcesses = computed(() => {
  if (!data.value) return [];
  const procs = [...data.value.top_processes];
  if (sortBy.value === "memory") procs.sort((a, b) => b.memory - a.memory);
  else if (sortBy.value === "cpu") procs.sort((a, b) => b.cpu_usage - a.cpu_usage);
  else procs.sort((a, b) => a.name.localeCompare(b.name));
  return procs;
});

const maxProcessMemory = computed(() => data.value ? Math.max(...data.value.top_processes.map(p => p.memory), 1) : 1);

async function refresh() {
  loading.value = true;
  error.value = "";
  try { data.value = await invoke<SystemSnapshot>("get_system_info"); }
  catch (e: unknown) { error.value = e instanceof Error ? e.message : String(e); }
  finally { loading.value = false; }
}

async function doClean() {
  cleaning.value = true;
  cleanResult.value = null;
  try {
    cleanResult.value = await invoke<CleanResult>("clean_memory", { level: cleanLevel.value });
    await refresh();
  } catch (e: unknown) {
    cleanResult.value = { freed_bytes: 0, before_used: 0, after_used: 0, message: e instanceof Error ? e.message : String(e) };
  } finally {
    cleaning.value = false;
  }
}

async function doKill(pid: number) {
  killConfirm.value = null;
  try {
    await invoke("kill_process", { pid });
    await refresh();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

onMounted(() => { refresh(); timer = setInterval(refresh, 3000); });
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 顶部状态栏 -->
    <header class="glass-bar px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-3">
        <h2 class="text-sm font-semibold text-primary">系统监控</h2>
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span class="text-[11px] text-secondary">运行中</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="data" class="text-[11px] text-tertiary">运行 {{ formatUptime(data.uptime) }}</span>
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center text-tertiary hover:text-primary hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all"
          :class="{ 'animate-spin': loading }"
          @click="refresh"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>
    </header>

    <div v-if="error" class="p-6 text-sm text-rose-500">{{ error }}</div>
    <div v-else-if="!data" class="flex-1 flex items-center justify-center text-xs text-tertiary">加载中...</div>

    <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- 核心指标圆环 -->
      <div class="grid grid-cols-3 gap-3">
        <!-- CPU -->
        <div class="glass-card p-4 flex flex-col items-center">
          <div class="relative w-24 h-24 mb-3">
            <svg class="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="6" class="text-black/[0.04] dark:text-white/[0.06]" />
              <circle cx="50" cy="50" r="40" fill="none" stroke-width="6" stroke-linecap="round" :stroke-dasharray="ringPath(data.cpu.usage)" class="text-[#3B82F6] transition-all duration-700" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-lg font-semibold text-[#3B82F6]">{{ data.cpu.usage.toFixed(1) }}%</span>
            </div>
          </div>
          <span class="text-[11px] font-medium text-secondary">CPU</span>
          <span class="text-[10px] text-tertiary text-center truncate max-w-full">{{ data.cpu.brand || data.cpu.name }}</span>
        </div>

        <!-- 内存 -->
        <div class="glass-card p-4 flex flex-col items-center">
          <div class="relative w-24 h-24 mb-3">
            <svg class="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="6" class="text-black/[0.04] dark:text-white/[0.06]" />
              <circle cx="50" cy="50" r="40" fill="none" stroke-width="6" stroke-linecap="round" :stroke-dasharray="ringPath(data.memory.usage_percent)" class="text-[#F59E0B] transition-all duration-700" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-lg font-semibold text-[#F59E0B]">{{ data.memory.usage_percent.toFixed(0) }}%</span>
            </div>
          </div>
          <span class="text-[11px] font-medium text-secondary">内存</span>
          <span class="text-[10px] text-tertiary">{{ formatBytes(data.memory.used) }} / {{ formatBytes(data.memory.total) }}</span>
        </div>

        <!-- 磁盘 -->
        <div class="glass-card p-4 flex flex-col items-center">
          <div class="relative w-24 h-24 mb-3">
            <svg class="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="6" class="text-black/[0.04] dark:text-white/[0.06]" />
              <circle cx="50" cy="50" r="40" fill="none" stroke-width="6" stroke-linecap="round" :stroke-dasharray="ringPath(data.disks[0]?.usage_percent ?? 0)" class="text-[#10B981] transition-all duration-700" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-lg font-semibold text-[#10B981]">{{ (data.disks[0]?.usage_percent ?? 0).toFixed(0) }}%</span>
            </div>
          </div>
          <span class="text-[11px] font-medium text-secondary">磁盘</span>
          <span class="text-[10px] text-tertiary">{{ formatBytes(data.disks[0]?.used ?? 0) }} / {{ formatBytes(data.disks[0]?.total ?? 0) }}</span>
        </div>
      </div>

      <!-- 健康评分 -->
      <div class="glass-card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[11px] font-medium text-tertiary uppercase tracking-widest">系统健康</h3>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold" :class="scoreColor(data.health.total)">{{ data.health.total }}</span>
            <span class="text-[11px] text-tertiary">/100</span>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-3 mb-3">
          <div v-for="item in [
            { label: 'CPU', score: data.health.cpu, color: '#3B82F6' },
            { label: '内存', score: data.health.memory, color: '#F59E0B' },
            { label: '磁盘', score: data.health.disk, color: '#10B981' },
          ]" :key="item.label" class="text-center">
            <div class="text-[11px] text-tertiary mb-1">{{ item.label }}</div>
            <div class="h-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: item.score + '%', background: item.color }" />
            </div>
            <div class="text-[10px] font-medium mt-0.5" :class="scoreColor(item.score)">{{ item.score }}</div>
          </div>
          <div class="text-center">
            <div class="text-[11px] text-tertiary mb-1">内存压力</div>
            <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium" :class="[pressureInfo(data.health.pressure).color, pressureInfo(data.health.pressure).bg]">
              {{ pressureInfo(data.health.pressure).label }}
            </span>
          </div>
        </div>
      </div>

      <!-- 内存清理 -->
      <div class="glass-card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[11px] font-medium text-tertiary uppercase tracking-widest">🧹 内存清理</h3>
        </div>

        <!-- 清理等级选择 -->
        <div class="flex gap-2 mb-3">
          <button
            v-for="opt in [
              { value: 'soft' as const, label: '轻度', desc: '释放文件缓存', color: 'emerald' },
              { value: 'normal' as const, label: '标准', desc: '缓存 + 内存回收', color: 'amber' },
              { value: 'aggressive' as const, label: '深度', desc: '全面释放（慎用）', color: 'rose' },
            ]"
            :key="opt.value"
            class="flex-1 p-2.5 rounded-xl border text-left transition-all"
            :class="cleanLevel === opt.value
              ? 'border-blue-400 bg-blue-500/[0.06]'
              : 'border-black/[0.06] dark:border-white/[0.08] hover:border-blue-300'"
            @click="cleanLevel = opt.value"
          >
            <div class="text-[12px] font-medium text-primary">{{ opt.label }}</div>
            <div class="text-[10px] text-tertiary mt-0.5">{{ opt.desc }}</div>
          </button>
        </div>

        <!-- 清理按钮 -->
        <button
          class="w-full py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-center gap-2"
          :class="cleaning
            ? 'bg-gray-100 dark:bg-white/[0.05] text-tertiary cursor-not-allowed'
            : cleanLevel === 'aggressive'
              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'"
          :disabled="cleaning"
          @click="doClean"
        >
          <svg v-if="cleaning" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
          {{ cleaning ? '清理中...' : '开始清理' }}
        </button>

        <!-- 清理结果 -->
        <div v-if="cleanResult" class="mt-3 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">{{ cleanResult.message }}</span>
          </div>
          <div class="text-[11px] text-emerald-600 dark:text-emerald-400">
            释放 {{ formatBytes(cleanResult.freed_bytes) }} · {{ formatBytes(cleanResult.before_used) }} → {{ formatBytes(cleanResult.after_used) }}
          </div>
        </div>
      </div>

      <!-- 进程列表 -->
      <div class="glass-card p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[11px] font-medium text-tertiary uppercase tracking-widest">进程 Top 20</h3>
          <div class="flex items-center gap-0.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-lg p-0.5">
            <button
              v-for="opt in [{ value: 'memory' as const, label: '内存' }, { value: 'cpu' as const, label: 'CPU' }, { value: 'name' as const, label: '名称' }]"
              :key="opt.value"
              class="text-[10px] px-2 py-0.5 rounded-md transition-colors"
              :class="sortBy === opt.value ? 'bg-white dark:bg-white/[0.1] text-primary shadow-sm' : 'text-tertiary hover:text-secondary'"
              @click="sortBy = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="space-y-1 max-h-[300px] overflow-y-auto">
          <div
            v-for="proc in sortedProcesses"
            :key="proc.pid"
            class="group flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
          >
            <div class="w-7 h-7 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0">
              <span class="text-[9px] font-mono text-tertiary">{{ proc.name.substring(0, 2).toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-0.5">
                <span class="text-[12px] text-primary truncate">{{ proc.name }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-mono text-secondary">{{ formatBytes(proc.memory) }}</span>
                  <span class="text-[10px] text-tertiary w-12 text-right">{{ proc.cpu_usage.toFixed(1) }}%</span>
                </div>
              </div>
              <div class="h-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="sortBy === 'cpu' ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]'"
                  :style="{ width: (sortBy === 'cpu' ? Math.min(proc.cpu_usage, 100) : (proc.memory / maxProcessMemory * 100)) + '%' }"
                />
              </div>
            </div>
            <!-- 结束进程按钮 -->
            <button
              v-if="killConfirm !== proc.pid"
              class="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all flex-shrink-0"
              title="结束进程"
              @click.stop="killConfirm = proc.pid"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <!-- 确认 -->
            <div v-else class="flex items-center gap-1 flex-shrink-0">
              <button class="text-[10px] px-1.5 py-0.5 rounded bg-rose-500 text-white hover:bg-rose-600 transition-colors" @click.stop="doKill(proc.pid)">确认</button>
              <button class="text-[10px] px-1.5 py-0.5 rounded text-tertiary hover:text-secondary transition-colors" @click.stop="killConfirm = null">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
