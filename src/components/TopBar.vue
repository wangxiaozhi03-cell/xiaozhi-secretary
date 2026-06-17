<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

const emit = defineEmits<{
  search: [query: string];
}>();

const searchQuery = ref("");
const searchInputRef = ref<HTMLInputElement>();
const currentTime = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

const greeting = computed(() => {
  const hour = currentTime.value.getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
});

const greetingEmoji = computed(() => {
  const hour = currentTime.value.getHours();
  if (hour < 6) return "🌙";
  if (hour < 12) return "☀️";
  if (hour < 14) return "🌤️";
  if (hour < 18) return "🌅";
  return "🌙";
});

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    searchInputRef.value?.focus();
  }
  if (e.key === "Escape") {
    searchQuery.value = "";
    searchInputRef.value?.blur();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  timer = setInterval(() => { currentTime.value = new Date(); }, 1000);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  if (timer) clearInterval(timer);
});
</script>

<template>
  <header class="glass-topbar flex items-center justify-between px-6 flex-shrink-0">
    <!-- 左侧问候语 -->
    <div class="flex items-center gap-3">
      <div>
        <h1 class="text-[16px] font-semibold text-primary">
          {{ greeting }}，小志 {{ greetingEmoji }}
        </h1>
        <p class="text-[12px] text-tertiary mt-0.5">
          高效 · 简洁 · 美观 · 你的全能工具箱
        </p>
      </div>
    </div>

    <!-- 右侧搜索框 -->
    <div class="relative">
      <div class="search-box flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EEF2F8]/80 backdrop-blur-sm border border-white/50 shadow-sm transition-all duration-200">
        <svg class="w-4 h-4 text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="搜索工具"
          class="w-[200px] bg-transparent outline-none text-[13px] text-primary placeholder:text-tertiary"
          @input="emit('search', searchQuery)"
        />
        <kbd class="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium text-tertiary bg-black/[0.04] border border-black/[0.06]">
          ⌘K
        </kbd>
      </div>
    </div>
  </header>
</template>

<style scoped>
.glass-topbar {
  height: 70px;
  background: rgba(235, 240, 248, 0.60);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
}
/* 底部微光线 */
.glass-topbar::after {
  content: '';
  position: absolute;
  bottom: 0; left: 5%; right: 5%;
  height: 0.5px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(79, 140, 255, 0.15) 30%,
    rgba(79, 140, 255, 0.2) 50%,
    rgba(79, 140, 255, 0.15) 70%,
    transparent 100%);
}

.dark .glass-topbar {
  background: rgba(22, 30, 42, 0.55);
  border-bottom-color: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
.dark .glass-topbar::after {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(79, 140, 255, 0.08) 30%,
    rgba(79, 140, 255, 0.12) 50%,
    rgba(79, 140, 255, 0.08) 70%,
    transparent 100%);
}

.search-box {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 0.5px solid rgba(255, 255, 255, 0.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.search-box:focus-within {
  border-color: rgba(79, 140, 255, 0.3);
  background: rgba(255, 255, 255, 0.65);
  box-shadow:
    0 0 0 3px rgba(79, 140, 255, 0.08),
    0 4px 12px rgba(79, 140, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.dark .search-box {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.dark .search-box:focus-within {
  border-color: rgba(79, 140, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0 0 3px rgba(79, 140, 255, 0.12),
    0 4px 12px rgba(79, 140, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.dark .search-box kbd {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
