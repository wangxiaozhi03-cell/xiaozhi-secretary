<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const currentTime = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

function formatTime(date: Date): string {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

onMounted(() => {
  timer = setInterval(() => { currentTime.value = new Date(); }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <footer class="glass-statusbar flex items-center justify-between px-6 flex-shrink-0">
    <!-- 左侧格言 -->
    <div class="flex items-center gap-2">
      <span class="text-[11px] text-tertiary">工欲善其事，必先利其器。</span>
    </div>

    <!-- 右侧状态信息 -->
    <div class="flex items-center gap-4">
      <!-- 系统状态 -->
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span class="text-[11px] text-tertiary">系统正常</span>
      </div>

      <!-- 分隔线 -->
      <div class="w-px h-3 bg-black/[0.06] dark:bg-white/[0.08]" />

      <!-- 日期 -->
      <span class="text-[11px] text-tertiary">{{ formatDate(currentTime) }}</span>

      <!-- 时间 -->
      <span class="text-[11px] font-mono text-secondary tabular-nums">{{ formatTime(currentTime) }}</span>
    </div>
  </footer>
</template>

<style scoped>
.glass-statusbar {
  height: 50px;
  background: rgba(255, 255, 255, 0.50);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-top: 0.5px solid rgba(255, 255, 255, 0.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.dark .glass-statusbar {
  background: rgba(22, 28, 38, 0.50);
  border-top-color: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
