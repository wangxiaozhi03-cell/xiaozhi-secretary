import { ref } from "vue";

// 模块级单例状态
const content = ref("");
const cursorLine = ref(1);
const cursorCol = ref(1);
const isSaved = ref(true);
const lastSavedAt = ref<Date | null>(null);
const currentFilePath = ref<string | null>(null);

// 撤销/恢复历史
const history: string[] = [""];
const historyIndex = ref(0);
const MAX_HISTORY = 50;

// 自动保存定时器
let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function useMdEditor() {
  /** 推入历史记录 */
  function pushHistory() {
    // 丢弃 index 之后的记录
    history.splice(historyIndex.value + 1);
    history.push(content.value);
    if (history.length > MAX_HISTORY) {
      history.shift();
    }
    historyIndex.value = history.length - 1;
  }

  /** 撤销 */
  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      content.value = history[historyIndex.value];
      isSaved.value = false;
    }
  }

  /** 恢复 */
  function redo() {
    if (historyIndex.value < history.length - 1) {
      historyIndex.value++;
      content.value = history[historyIndex.value];
      isSaved.value = false;
    }
  }

  /**
   * 在光标位置插入文本
   * @param textarea 编辑器 textarea 元素
   * @param before 前缀
   * @param after 后缀（可选，不传则仅插入前缀）
   */
  function insertAtCursor(textarea: HTMLTextAreaElement, before: string, after?: string) {
    // after 明确传了就用，没传说明是纯前缀类型（标题/列表等），不需要后缀
    const end = after ?? "";
    const start = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const selected = content.value.substring(start, endPos);

    // 检测是否是列表/引用前缀
    const isListPrefix = /^(\d+\.\s|- |\* |\+ |> )$/.test(before);

    let insertBefore = before;
    let middle = selected;

    if (isListPrefix) {
      // 光标不在行首时先补换行
      const needsNewline = start > 0 && content.value[start - 1] !== "\n";

      if (selected.includes("\n")) {
        // 多行选中：每行加前缀
        const lines = selected.split("\n");
        const nl = needsNewline ? "\n" : "";
        if (/^\d+\.\s$/.test(before)) {
          const baseNum = parseInt(before) || 1;
          middle = lines.map((l, i) => `${baseNum + i}. ${l}`).join("\n");
        } else {
          middle = lines.map(l => before + l).join("\n");
        }
        insertBefore = nl;
      } else {
        insertBefore = (needsNewline ? "\n" : "") + before;
      }
    }

    const newText =
      content.value.substring(0, start) +
      insertBefore +
      middle +
      end +
      content.value.substring(endPos);

    content.value = newText;
    isSaved.value = false;
    pushHistory();

    // 恢复光标位置
    requestAnimationFrame(() => {
      const newStart = start + insertBefore.length;
      const newEnd = newStart + middle.length;
      textarea.setSelectionRange(newStart, newEnd);
      textarea.focus();
    });
  }

  /** 更新光标位置 */
  function updateCursorPos(textarea: HTMLTextAreaElement) {
    const pos = textarea.selectionStart;
    const textBefore = content.value.substring(0, pos);
    const lines = textBefore.split("\n");
    cursorLine.value = lines.length;
    cursorCol.value = lines[lines.length - 1].length + 1;
  }

  /** 内容变更时调用 */
  function onContentChange(newVal: string) {
    content.value = newVal;
    isSaved.value = false;
  }

  /** 保存到文件 */
  async function saveToFile() {
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");

      let filePath = currentFilePath.value;
      if (!filePath) {
        const selected = await save({
          filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
          defaultPath: "document.md",
        });
        if (!selected) return;
        filePath = selected;
        currentFilePath.value = filePath;
      }

      await writeTextFile(filePath, content.value);
      isSaved.value = true;
      lastSavedAt.value = new Date();
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  /** 从文件加载 */
  async function loadFromFile() {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { readTextFile } = await import("@tauri-apps/plugin-fs");

      const selected = await open({
        multiple: false,
        filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
      });
      if (selected) {
        const text = await readTextFile(selected as string);
        content.value = text;
        currentFilePath.value = selected as string;
        isSaved.value = true;
        lastSavedAt.value = new Date();
        pushHistory();
      }
    } catch (err) {
      console.error("Load failed:", err);
    }
  }

  /** 新建文档 */
  function newDocument() {
    content.value = "";
    currentFilePath.value = null;
    isSaved.value = true;
    lastSavedAt.value = null;
    history.splice(0);
    history.push("");
    historyIndex.value = 0;
  }

  /** 启动自动保存 */
  function startAutoSave(interval = 5000) {
    stopAutoSave();
    autoSaveTimer = setInterval(() => {
      if (!isSaved.value && currentFilePath.value) {
        saveToFile();
      }
    }, interval);
  }

  /** 停止自动保存 */
  function stopAutoSave() {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
  }

  return {
    content,
    cursorLine,
    cursorCol,
    isSaved,
    lastSavedAt,
    currentFilePath,
    pushHistory,
    undo,
    redo,
    insertAtCursor,
    updateCursorPos,
    onContentChange,
    saveToFile,
    loadFromFile,
    newDocument,
    startAutoSave,
    stopAutoSave,
  };
}
