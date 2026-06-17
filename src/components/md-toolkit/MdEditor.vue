<script setup lang="ts">
import { ref, inject, type Ref, onMounted, nextTick } from "vue";

const emit = defineEmits<{
  "update:content": [value: string];
}>();

const content = inject<Ref<string>>("content")!;
const cursorLine = inject<Ref<number>>("cursorLine")!;
const cursorCol = inject<Ref<number>>("cursorCol")!;
const isSaved = inject<Ref<boolean>>("isSaved")!;
const lastSavedAt = inject<Ref<Date | null>>("lastSavedAt")!;
const undo = inject<() => void>("undo")!;
const redo = inject<() => void>("redo")!;

const textareaRef = ref<HTMLTextAreaElement>();
const lineNumbersRef = ref<HTMLDivElement>();
const composing = ref(false);

// 行号列表
const lineCount = ref(1);
function updateLineCount() {
  lineCount.value = (content.value || "").split("\n").length;
}

// 输入处理
function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  emit("update:content", target.value);
  updateLineCount();
}

// 光标位置更新
function handleCursorUpdate() {
  if (!textareaRef.value) return;
  const pos = textareaRef.value.selectionStart;
  const textBefore = content.value.substring(0, pos);
  const lines = textBefore.split("\n");
  cursorLine.value = lines.length;
  cursorCol.value = lines[lines.length - 1].length + 1;
}

// 同步滚动
function handleScroll() {
  if (!textareaRef.value || !lineNumbersRef.value) return;
  lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop;
}

// Tab 键处理
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Tab") {
    e.preventDefault();
    const textarea = textareaRef.value!;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newVal = content.value.substring(0, start) + "  " + content.value.substring(end);
    emit("update:content", newVal);
    nextTick(() => {
      textarea.setSelectionRange(start + 2, start + 2);
    });
  }

  // Cmd/Ctrl + Z 撤销
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modifier = isMac ? e.metaKey : e.ctrlKey;
  if (modifier && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
    updateLineCount();
  }
  // Cmd/Ctrl + Shift + Z 恢复
  if (modifier && e.key === "z" && e.shiftKey) {
    e.preventDefault();
    redo();
    updateLineCount();
  }
}

// 格式化时间
function formatTime(date: Date | null): string {
  if (!date) return "--:--:--";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

onMounted(() => {
  updateLineCount();
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden bg-black/[0.04] dark:bg-white/[0.02]">
    <!-- 编辑区 -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- 行号 -->
      <div
        ref="lineNumbersRef"
        class="w-[50px] flex-shrink-0 overflow-hidden text-right pr-3 pt-3 pb-3 select-none bg-black/[0.02] dark:bg-white/[0.02] border-r border-black/[0.04] dark:border-white/[0.06]"
      >
        <div
          v-for="n in lineCount"
          :key="n"
          class="text-[12px] leading-[1.7] text-tertiary font-mono"
        >
          {{ n }}
        </div>
      </div>

      <!-- 编辑器 -->
      <textarea
        ref="textareaRef"
        class="md-editor-textarea flex-1 resize-none p-3 text-sm leading-[1.7] font-mono bg-transparent text-primary outline-none placeholder:text-tertiary overflow-auto"
        :value="content"
        placeholder="开始输入 Markdown..."
        spellcheck="false"
        @input="handleInput"
        @click="handleCursorUpdate"
        @keyup="handleCursorUpdate"
        @scroll="handleScroll"
        @keydown="handleKeydown"
        @compositionstart="composing = true"
        @compositionend="composing = false"
      />
    </div>

    <!-- 底部状态栏 -->
    <div class="flex-shrink-0 h-7 px-3 flex items-center justify-between text-[11px] text-tertiary border-t border-black/[0.04] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
      <div class="flex items-center gap-3">
        <span>第 {{ cursorLine }} 行</span>
        <span>第 {{ cursorCol }} 列</span>
        <span>{{ content.length }} 字符</span>
        <span>Markdown</span>
        <span>UTF-8</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full" :class="isSaved ? 'bg-emerald-500' : 'bg-amber-500'" />
          {{ isSaved ? '✓ 已保存' : '未保存' }}
        </span>
        <span>{{ formatTime(lastSavedAt) }}</span>
      </div>
    </div>
  </div>
</template>
