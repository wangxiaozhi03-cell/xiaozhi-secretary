<script setup lang="ts">
import { ref, computed } from "vue";
import { useJsonHistory } from "../../../composables/json-toolkit/useJsonHistory";
import type { HistoryEntry } from "../../../composables/json-toolkit/useJsonHistory";

const emit = defineEmits<{
  select: [entry: HistoryEntry];
  close: [];
}>();

const { entries, count, isEmpty, removeEntry, clearAll, formatTime, formatSize } = useJsonHistory();

const searchText = ref("");
const viewMode = ref<"list" | "grid">("list");

const filteredEntries = computed(() => {
  const query = searchText.value.toLowerCase();
  if (!query) return entries.value;
  return entries.value.filter(
    (e) => e.preview.toLowerCase().includes(query) || e.json.toLowerCase().includes(query)
  );
});

function handleSelect(entry: HistoryEntry) {
  emit("select", entry);
}

function handleRemove(id: string, event: Event) {
  event.stopPropagation();
  removeEntry(id);
}

function handleClearAll() {
  if (entries.value.length > 0) {
    clearAll();
  }
}
</script>

<template>
  <div class="history-panel flex flex-col h-full">
    <!-- 头部 -->
    <div class="px-3 py-2 border-b border-black/[0.04] dark:border-white/[0.06] flex-shrink-0">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-medium text-tertiary uppercase tracking-widest">History</span>
          <span class="text-[10px] text-tertiary">{{ count }} 条记录</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
            :class="viewMode === 'list' ? 'bg-blue-500/[0.08] text-blue-500' : 'text-tertiary hover:text-secondary'"
            @click="viewMode = 'list'"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            class="text-[10px] px-1.5 py-0.5 rounded transition-colors"
            :class="viewMode === 'grid' ? 'bg-blue-500/[0.08] text-blue-500' : 'text-tertiary hover:text-secondary'"
            @click="viewMode = 'grid'"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <div class="w-px h-4 bg-black/[0.06] dark:bg-white/[0.08] mx-0.5" />
          <button
            class="text-[10px] px-1.5 py-0.5 rounded text-rose-500 hover:bg-rose-500/[0.08] transition-colors"
            :class="{ 'opacity-30 cursor-not-allowed': isEmpty }"
            :disabled="isEmpty"
            @click="handleClearAll"
          >清空</button>
          <button
            class="text-[10px] px-1.5 py-0.5 rounded text-tertiary hover:text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            @click="emit('close')"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <!-- 搜索 -->
      <div class="relative">
        <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchText"
          type="text"
          class="w-full pl-7 pr-2 py-1.5 text-xs bg-black/[0.03] dark:bg-white/[0.05] rounded-lg outline-none text-primary placeholder:text-tertiary border border-transparent focus:border-blue-500/30 transition-colors"
          placeholder="搜索历史记录..."
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="isEmpty" class="flex-1 flex flex-col items-center justify-center text-tertiary gap-2">
      <svg class="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-xs">暂无历史记录</span>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="viewMode === 'list'" class="flex-1 overflow-y-auto">
      <div
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="group px-3 py-2.5 border-b border-black/[0.02] dark:border-white/[0.03] hover:bg-blue-500/[0.03] transition-colors cursor-pointer"
        @click="handleSelect(entry)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="text-xs text-primary font-mono truncate leading-relaxed">{{ entry.preview }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] text-tertiary">{{ formatTime(entry.timestamp) }}</span>
              <span class="text-[10px] text-tertiary">{{ formatSize(entry.size) }}</span>
            </div>
          </div>
          <button
            class="p-1 rounded opacity-0 group-hover:opacity-100 text-tertiary hover:text-rose-500 hover:bg-rose-500/[0.08] transition-all flex-shrink-0"
            title="删除"
            @click="handleRemove(entry.id, $event)"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div v-if="filteredEntries.length === 0" class="p-4 text-center text-xs text-tertiary">
        无匹配结果
      </div>
    </div>

    <!-- 网格视图 -->
    <div v-else class="flex-1 overflow-y-auto p-2">
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="group p-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.06] hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all cursor-pointer"
          @click="handleSelect(entry)"
        >
          <p class="text-[11px] text-primary font-mono truncate leading-relaxed line-clamp-3">{{ entry.preview }}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-[9px] text-tertiary">{{ formatTime(entry.timestamp) }}</span>
            <button
              class="p-0.5 rounded opacity-0 group-hover:opacity-100 text-tertiary hover:text-rose-500 transition-all"
              @click="handleRemove(entry.id, $event)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredEntries.length === 0" class="p-4 text-center text-xs text-tertiary">
        无匹配结果
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-panel {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
