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
      <div class="search-box flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm transition-all duration-200">
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
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.dark .glass-topbar {
  background: rgba(30, 38, 50, 0.60);
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.search-box:focus-within {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08), 0 4px 12px rgba(59, 130, 246, 0.1);
}

.dark .search-box {
  background: rgba(30, 38, 50, 0.60);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .search-box:focus-within {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15);
}

.dark .search-box kbd {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
