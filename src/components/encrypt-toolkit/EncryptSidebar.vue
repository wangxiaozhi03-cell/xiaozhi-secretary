<script setup lang="ts">
import type { EncryptAlgorithm, AlgorithmCategory, HistoryItem } from "../../composables/encrypt-toolkit/types";

defineProps<{
  algorithm: EncryptAlgorithm;
  history: HistoryItem[];
}>();

const emit = defineEmits<{
  select: [algorithm: EncryptAlgorithm];
  selectHistory: [item: HistoryItem];
}>();

interface AlgorithmGroup {
  category: AlgorithmCategory;
  label: string;
  items: { id: EncryptAlgorithm; name: string; desc: string }[];
}

const groups: AlgorithmGroup[] = [
  {
    category: "symmetric",
    label: "对称加密",
    items: [
      { id: "aes-128", name: "AES-128", desc: "128位密钥" },
      { id: "aes-256", name: "AES-256", desc: "256位密钥" },
      { id: "aes-cryptojs", name: "AES-CryptoJS", desc: "Salted__ 兼容" },
    ],
  },
  {
    category: "asymmetric",
    label: "非对称加密",
    items: [
      { id: "rsa", name: "RSA", desc: "公钥/私钥" },
    ],
  },
  {
    category: "hash",
    label: "哈希",
    items: [
      { id: "sha-256", name: "SHA-256", desc: "不可逆哈希" },
      { id: "sha-512", name: "SHA-512", desc: "不可逆哈希" },
    ],
  },
  {
    category: "encoding",
    label: "编码",
    items: [
      { id: "base64", name: "Base64", desc: "编码/解码" },
    ],
  },
];

const categoryIcons: Record<string, string> = {
  symmetric: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  asymmetric: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  hash: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  encoding: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

function formatTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${Math.floor(diff / 86400000)}天前`;
}
</script>

<template>
  <aside class="encrypt-sidebar flex flex-col flex-shrink-0 w-[200px] border-r border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
    <!-- 标题 -->
    <div class="px-4 pt-4 pb-2 flex-shrink-0">
      <h2 class="text-xs font-semibold text-secondary uppercase tracking-wider">加密算法</h2>
    </div>

    <!-- 算法列表 -->
    <div class="flex-1 overflow-y-auto px-2 space-y-3">
      <div v-for="group in groups" :key="group.category">
        <!-- 分组标题 -->
        <div class="flex items-center gap-2 px-2 py-1.5">
          <svg class="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="categoryIcons[group.category]" />
          </svg>
          <span class="text-[10px] font-medium text-tertiary uppercase tracking-wider">{{ group.label }}</span>
        </div>

        <!-- 算法按钮 -->
        <button
          v-for="item in group.items"
          :key="item.id"
          class="algo-item w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200"
          :class="algorithm === item.id ? 'active' : ''"
          @click="emit('select', item.id)"
        >
          <div class="flex-1 text-left min-w-0">
            <div class="text-xs font-medium" :class="algorithm === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-secondary'">{{ item.name }}</div>
            <div class="text-[10px] text-tertiary">{{ item.desc }}</div>
          </div>
          <div v-if="algorithm === item.id" class="w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>
      </div>
    </div>

    <!-- 历史记录 -->
    <div class="flex-shrink-0 border-t border-black/[0.06] dark:border-white/[0.06]">
      <div class="px-4 py-2">
        <h3 class="text-[10px] font-semibold text-tertiary uppercase tracking-wider">历史记录</h3>
      </div>
      <div class="max-h-[180px] overflow-y-auto px-2 pb-2 space-y-0.5">
        <button
          v-for="item in history.slice(0, 10)"
          :key="item.id"
          class="history-item w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left"
          @click="emit('selectHistory', item)"
        >
          <span class="text-[10px] text-tertiary flex-shrink-0">{{ item.algorithm }}</span>
          <span class="text-[11px] text-secondary truncate flex-1">{{ item.inputPreview }}</span>
          <span class="text-[9px] text-tertiary flex-shrink-0">{{ formatTime(item.timestamp) }}</span>
        </button>
        <p v-if="history.length === 0" class="text-[10px] text-tertiary text-center py-3">暂无历史</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.encrypt-sidebar {
  background: rgba(0, 0, 0, 0.01);
}

:global(.dark) .encrypt-sidebar {
  background: rgba(255, 255, 255, 0.02);
}

.algo-item {
  cursor: pointer;
}

.algo-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

:global(.dark) .algo-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.algo-item.active {
  background: rgba(59, 130, 246, 0.06);
}

:global(.dark) .algo-item.active {
  background: rgba(59, 130, 246, 0.1);
}

.history-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

:global(.dark) .history-item:hover {
  background: rgba(255, 255, 255, 0.04);
}
</style>
