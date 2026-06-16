<script setup lang="ts">
defineProps<{
  canSwap: boolean;
  canCopy: boolean;
  canExport: boolean;
}>();

const emit = defineEmits<{
  swap: [];
  copy: [];
  clear: [];
  exportResult: [];
  randomKey: [];
  randomIv: [];
}>();

interface ActionItem {
  label: string;
  icon: string;
  action: () => void;
  show?: boolean;
}

function getActions(props: any): ActionItem[] {
  return [
    {
      label: "交换",
      icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
      action: () => emit("swap"),
      show: props.canSwap,
    },
    {
      label: "复制",
      icon: "M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184",
      action: () => emit("copy"),
      show: props.canCopy,
    },
    {
      label: "清空",
      icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
      action: () => emit("clear"),
    },
    {
      label: "导出",
      icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
      action: () => emit("exportResult"),
      show: props.canExport,
    },
    {
      label: "随机Key",
      icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a1.5 1.5 0 01-1.06.44H8.53a1.5 1.5 0 01-1.06-.44L5 14.5",
      action: () => emit("randomKey"),
    },
  ];
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <button
      v-for="action in getActions({ canSwap, canCopy, canExport })"
      :key="action.label"
      v-show="action.show !== false"
      class="action-btn"
      :title="action.label"
      @click="action.action()"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="action.icon" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.action-btn {
  padding: 6px;
  border-radius: 8px;
  color: rgba(0, 0, 0, 0.3);
  transition: all 0.15s ease;
  cursor: pointer;
}

:global(.dark) .action-btn {
  color: rgba(255, 255, 255, 0.3);
}

.action-btn:hover {
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.08);
}

:global(.dark) .action-btn:hover {
  color: #60A5FA;
  background: rgba(59, 130, 246, 0.12);
}
</style>
