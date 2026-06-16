<script setup lang="ts">
import type { EncryptResult } from "../../composables/encrypt-toolkit/types";

const props = withDefaults(defineProps<{
  modelValue: string;
  title: string;
  readonly?: boolean;
  result?: EncryptResult | null;
}>(), {
  readonly: false,
  result: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  importFile: [];
  clear: [];
}>();

function handleInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="editor-pane flex flex-col h-full overflow-hidden">
    <!-- 标题栏 -->
    <div class="editor-header flex-shrink-0 px-4 py-2.5 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04]">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-secondary">{{ title }}</span>
        <span v-if="modelValue" class="text-[10px] text-tertiary font-mono">{{ modelValue.length }} chars</span>
      </div>
      <div v-if="!readonly" class="flex items-center gap-1">
        <button
          class="editor-btn"
          title="导入文件"
          @click="emit('importFile')"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </button>
        <button
          class="editor-btn"
          title="清空"
          @click="emit('clear')"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div v-else class="flex items-center gap-1">
        <span
          v-if="result"
          class="text-[10px] px-2 py-0.5 rounded-full"
          :class="result.success
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'"
        >
          {{ result.success ? '✓ 成功' : '✗ 失败' }}
        </span>
      </div>
    </div>

    <!-- 编辑区 -->
    <textarea
      class="editor-textarea flex-1 resize-none p-4 text-sm font-mono leading-relaxed bg-transparent text-primary outline-none overflow-auto"
      :value="modelValue"
      :readonly="readonly"
      :placeholder="readonly ? '等待输出...' : '输入内容...'"
      spellcheck="false"
      @input="handleInput"
    />

    <!-- 错误信息 -->
    <div
      v-if="result?.error"
      class="flex-shrink-0 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/5 border-t border-rose-200 dark:border-rose-500/10"
    >
      {{ result.error }}
    </div>
  </div>
</template>

<style scoped>
.editor-pane {
  background: rgba(0, 0, 0, 0.01);
}

:global(.dark) .editor-pane {
  background: rgba(255, 255, 255, 0.01);
}

.editor-header {
  background: rgba(0, 0, 0, 0.02);
}

:global(.dark) .editor-header {
  background: rgba(255, 255, 255, 0.02);
}

.editor-btn {
  padding: 6px;
  border-radius: 8px;
  color: rgba(0, 0, 0, 0.35);
  transition: all 0.15s ease;
  cursor: pointer;
}

:global(.dark) .editor-btn {
  color: rgba(255, 255, 255, 0.35);
}

.editor-btn:hover {
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .editor-btn:hover {
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.06);
}

.editor-textarea::placeholder {
  color: rgba(0, 0, 0, 0.3);
}

:global(.dark) .editor-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.editor-textarea::-webkit-scrollbar {
  width: 6px;
}

.editor-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.editor-textarea::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}

:global(.dark) .editor-textarea::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
}

.editor-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

:global(.dark) .editor-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>
