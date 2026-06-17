<script setup lang="ts">
import { ref, watch } from "vue";
import { useNameCase } from "../../composables/namecase/useNameCase";
import type { NameStyle } from "../../composables/namecase/useNameCase";

const {
  input,
  preserveAcronyms,
  results,
  totalCount,
  convertBatch,
  loadExample,
  clearAll,
  STYLE_LABELS,
} = useNameCase();

const copiedId = ref<string | null>(null);
const targetFormat = ref<NameStyle>("camelCase");

// 输入变化时自动转换
let debounceTimer: ReturnType<typeof setTimeout>;
watch(input, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(convertBatch, 300);
});

function handleCopy(text: string, id: string) {
  navigator.clipboard.writeText(text);
  copiedId.value = id;
  setTimeout(() => { copiedId.value = null; }, 1500);
}

function copyAll() {
  const lines = results.value.map((r) => r.conversions[targetFormat.value]);
  handleCopy(lines.join("\n"), "all");
}

const styleColors: Record<string, string> = {
  camelCase: "#3B82F6",
  PascalCase: "#8B5CF6",
  snake_case: "#10B981",
  "kebab-case": "#F59E0B",
  CONSTANT_CASE: "#EF4444",
  unknown: "#9CA3AF",
};

const styleIcons: Record<string, string> = {
  camelCase: "aa",
  PascalCase: "Aa",
  snake_case: "a_a",
  "kebab-case": "a-a",
  CONSTANT_CASE: "A_A",
  unknown: "?",
};
</script>

<template>
  <div class="namecase-root flex flex-col h-full overflow-hidden">
    <!-- 顶部工具栏 -->
    <header class="nc-header flex items-center justify-between px-5 py-3 flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F7CFF] to-[#7C5CFF] flex items-center justify-center shadow-sm">
          <span class="text-white text-[11px] font-bold">Aa</span>
        </div>
        <div>
          <h1 class="text-[14px] font-semibold text-[#1F2A37]">NameCase Studio</h1>
          <p class="text-[11px] text-[#8896AB]">
            {{ totalCount > 0 ? `已识别 ${totalCount} 个变量` : '命名规范转换工具' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button class="nc-btn-ghost" @click="loadExample">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
          示例
        </button>
        <button class="nc-btn-ghost" @click="clearAll">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          清空
        </button>
      </div>
    </header>

    <!-- 三栏内容区 -->
    <div class="flex-1 flex overflow-hidden gap-2 px-2 pb-2">
      <!-- 左侧：输入区 -->
      <div class="nc-panel flex flex-col w-[280px] flex-shrink-0">
        <div class="px-4 py-2.5 border-b border-[rgba(120,160,255,0.10)] flex items-center justify-between">
          <span class="text-[11px] font-semibold text-[#1F2A37] uppercase tracking-wider">输入</span>
          <span class="text-[10px] text-[#8896AB]">{{ input.split('\n').filter(l => l.trim()).length }} 行</span>
        </div>

        <textarea
          v-model="input"
          class="flex-1 resize-none p-4 text-[13px] font-mono leading-[1.7] bg-transparent outline-none text-[#1F2A37] placeholder:text-[#B0BCC8]"
          placeholder="每行一个变量名&#10;&#10;例如：&#10;user_name&#10;getUserProfile&#10;API_RESPONSE_DATA"
          spellcheck="false"
        />

        <div class="px-4 py-2 border-t border-[rgba(120,160,255,0.10)] flex items-center gap-2">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input v-model="preserveAcronyms" type="checkbox" class="w-3.5 h-3.5 rounded accent-[#4F7CFF]" />
            <span class="text-[11px] text-[#8896AB]">保留缩写</span>
          </label>
        </div>
      </div>

      <!-- 中间：转换预览区 -->
      <div class="nc-panel flex-1 flex flex-col min-w-0">
        <div class="px-4 py-2.5 border-b border-[rgba(120,160,255,0.10)] flex items-center justify-between">
          <span class="text-[11px] font-semibold text-[#1F2A37] uppercase tracking-wider">转换结果</span>
          <div v-if="totalCount > 0" class="flex items-center gap-1.5">
            <button
              class="nc-copy-all-btn"
              @click="copyAll"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
              {{ copiedId === 'all' ? '已复制 ✓' : '复制全部' }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <!-- 空状态 -->
          <div v-if="results.length === 0" class="flex-1 flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-[#4F7CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
            </div>
            <p class="text-[13px] text-[#8896AB] mb-1">在左侧输入变量名</p>
            <p class="text-[11px] text-[#B0BCC8]">支持 camelCase / snake_case / kebab-case 等格式</p>
          </div>

          <!-- 转换结果卡片 -->
          <div
            v-for="(result, idx) in results"
            :key="idx"
            class="nc-result-card"
          >
            <!-- 输入标识 -->
            <div class="flex items-center gap-2 mb-2">
              <span class="nc-style-badge" :style="{ background: styleColors[result.detectedStyle] + '15', color: styleColors[result.detectedStyle] }">
                {{ styleIcons[result.detectedStyle] }}
              </span>
              <code class="text-[12px] font-mono text-[#1F2A37] font-medium">{{ result.input }}</code>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F0F4FF] text-[#8896AB]">
                {{ STYLE_LABELS[result.detectedStyle] }}
              </span>
            </div>

            <!-- 5种格式 -->
            <div class="space-y-1">
              <div
                v-for="(style, styleKey) in STYLE_LABELS"
                :key="styleKey"
                v-show="styleKey !== 'unknown'"
                class="nc-conversion-row group"
                @click="handleCopy(result.conversions[styleKey as NameStyle], `${idx}-${styleKey}`)"
              >
                <span class="nc-format-label" :style="{ color: styleColors[styleKey] }">
                  {{ style }}
                </span>
                <code class="flex-1 text-[12px] font-mono text-[#1F2A37] truncate">
                  {{ result.conversions[styleKey as NameStyle] }}
                </code>
                <span class="nc-copy-icon opacity-0 group-hover:opacity-100">
                  {{ copiedId === `${idx}-${styleKey}` ? '✓' : '复制' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：操作面板 -->
      <div class="nc-panel w-[200px] flex-shrink-0 flex flex-col">
        <div class="px-4 py-2.5 border-b border-[rgba(120,160,255,0.10)]">
          <span class="text-[11px] font-semibold text-[#1F2A37] uppercase tracking-wider">快捷操作</span>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-4">
          <!-- 批量转换按钮 -->
          <div class="space-y-1.5">
            <button
              v-for="(style, styleKey) in STYLE_LABELS"
              :key="styleKey"
              v-show="styleKey !== 'unknown'"
              class="nc-action-btn w-full"
              :class="targetFormat === styleKey ? 'active' : ''"
              @click="targetFormat = styleKey as NameStyle; copyAll()"
            >
              <span class="nc-action-icon" :style="{ background: styleColors[styleKey] + '12', color: styleColors[styleKey] }">
                {{ styleIcons[styleKey] }}
              </span>
              <span class="text-[12px] text-[#1F2A37]">{{ style }}</span>
              <svg class="w-3.5 h-3.5 text-[#B0BCC8] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
            </button>
          </div>

          <!-- 分隔线 -->
          <div class="h-px bg-[rgba(120,160,255,0.10)]" />

          <!-- 高级设置 -->
          <div>
            <h3 class="text-[11px] font-semibold text-[#1F2A37] uppercase tracking-wider mb-2">高级设置</h3>
            <label class="flex items-center gap-2 cursor-pointer py-1">
              <input v-model="preserveAcronyms" type="checkbox" class="w-3.5 h-3.5 rounded accent-[#4F7CFF]" />
              <span class="text-[12px] text-[#5A6B7E]">保留缩写 (HTTP/API)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 根容器 - 亮色鸿蒙光感背景 */
.namecase-root {
  background: linear-gradient(135deg, #F6F8FC 0%, #EEF2FF 50%, #F0F5FF 100%);
  border-radius: 20px;
  position: relative;
}

.namecase-root::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(79, 124, 255, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

/* 顶部栏 */
.nc-header {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-bottom: 1px solid rgba(120, 160, 255, 0.10);
}

/* 面板通用 */
.nc-panel {
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
  border-radius: 16px;
  border: 1px solid rgba(120, 160, 255, 0.12);
  box-shadow: 0 4px 20px rgba(120, 140, 180, 0.06);
  overflow: hidden;
  transition: all 0.25s ease-out;
}

.nc-panel:hover {
  box-shadow: 0 8px 30px rgba(120, 140, 180, 0.10);
  border-color: rgba(120, 160, 255, 0.18);
}

/* 幽灵按钮 */
.nc-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  color: #5A6B7E;
  background: rgba(79, 124, 255, 0.06);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-out;
}

.nc-btn-ghost:hover {
  background: rgba(79, 124, 255, 0.12);
  color: #4F7CFF;
  transform: translateY(-1px);
}

/* 复制全部按钮 */
.nc-copy-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  color: #4F7CFF;
  background: rgba(79, 124, 255, 0.08);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-out;
}

.nc-copy-all-btn:hover {
  background: rgba(79, 124, 255, 0.15);
}

/* 结果卡片 */
.nc-result-card {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.70);
  border: 1px solid rgba(120, 160, 255, 0.10);
  transition: all 0.25s ease-out;
}

.nc-result-card:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 16px rgba(79, 124, 255, 0.08);
  transform: translateY(-1px);
}

/* 风格标识 */
.nc-style-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 20px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  font-family: monospace;
  flex-shrink: 0;
}

/* 转换行 */
.nc-conversion-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease-out;
}

.nc-conversion-row:hover {
  background: rgba(79, 124, 255, 0.06);
}

/* 格式标签 */
.nc-format-label {
  font-size: 10px;
  font-weight: 600;
  font-family: monospace;
  min-width: 85px;
  flex-shrink: 0;
}

/* 复制图标 */
.nc-copy-icon {
  font-size: 10px;
  color: #4F7CFF;
  font-weight: 500;
  transition: opacity 0.15s ease;
}

/* 操作按钮 */
.nc-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.50);
  border: 1px solid rgba(120, 160, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease-out;
}

.nc-action-btn:hover {
  background: rgba(255, 255, 255, 0.80);
  border-color: rgba(120, 160, 255, 0.18);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 124, 255, 0.08);
}

.nc-action-btn.active {
  background: rgba(79, 124, 255, 0.08);
  border-color: rgba(79, 124, 255, 0.20);
}

/* 操作图标 */
.nc-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 22px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  font-family: monospace;
  flex-shrink: 0;
}
</style>
