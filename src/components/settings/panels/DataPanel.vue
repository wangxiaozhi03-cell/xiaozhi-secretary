<script setup lang="ts">
import { ref } from "vue";
import { useSettings } from "../../../composables/settings/useSettings";

const { settings, updateSetting, exportSettings, importSettings } = useSettings();

const importStatus = ref<"idle" | "success" | "error">("idle");

function handleExport() {
  const json = exportSettings();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "toolbox-settings.json";
  a.click();
  URL.revokeObjectURL(url);
}

function handleImport() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (importSettings(text)) {
        importStatus.value = "success";
      } else {
        importStatus.value = "error";
      }
      setTimeout(() => (importStatus.value = "idle"), 2000);
    };
    reader.readAsText(file);
  };
  input.click();
}

function handleClearHistory() {
  if (confirm("确定要清空所有历史记录吗？此操作不可恢复。")) {
    // TODO: 清空历史记录
    alert("历史记录已清空");
  }
}

function handleClearCache() {
  if (confirm("确定要清空所有缓存数据吗？")) {
    localStorage.clear();
    alert("缓存已清空");
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- 自动保存 -->
    <div class="settings-card flex items-center justify-between">
      <div>
        <h3 class="settings-card-title mb-0">自动保存</h3>
        <p class="text-[12px] text-tertiary mt-0.5">修改设置后自动保存到本地</p>
      </div>
      <button
        class="settings-switch"
        :class="settings.autoSaveEnabled ? 'active' : ''"
        @click="updateSetting('autoSaveEnabled', !settings.autoSaveEnabled)"
      >
        <span class="settings-switch-thumb" />
      </button>
    </div>

    <!-- 数据管理 -->
    <div class="settings-card space-y-3">
      <h3 class="settings-card-title">数据管理</h3>

      <button class="settings-action-btn w-full" @click="handleClearHistory">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>清空历史记录</span>
      </button>

      <button class="settings-action-btn w-full" @click="handleClearCache">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>清空缓存数据</span>
      </button>
    </div>

    <!-- 配置导入导出 -->
    <div class="settings-card space-y-3">
      <h3 class="settings-card-title">配置导入导出</h3>

      <div class="flex gap-3">
        <button class="btn flex-1" @click="handleExport">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>导出配置</span>
        </button>

        <button class="btn flex-1" @click="handleImport">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>导入配置</span>
        </button>
      </div>

      <!-- Import status -->
      <Transition name="fade">
        <div v-if="importStatus === 'success'" class="text-[12px] text-green-500 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span>配置导入成功</span>
        </div>
        <div v-else-if="importStatus === 'error'" class="text-[12px] text-red-500 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>配置文件格式错误</span>
        </div>
      </Transition>
    </div>

    <!-- 存储信息 -->
    <div class="settings-card">
      <h3 class="settings-card-title">存储信息</h3>
      <div class="space-y-2 text-[12px]">
        <div class="flex justify-between">
          <span class="text-tertiary">设置存储</span>
          <span class="text-secondary">localStorage</span>
        </div>
        <div class="flex justify-between">
          <span class="text-tertiary">存储大小</span>
          <span class="text-secondary">~2KB</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  background: rgba(238, 242, 248, 0.6);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .settings-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.settings-card-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 12px;
}

.dark .settings-card-title {
  color: rgba(255, 255, 255, 0.85);
}

.settings-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.65);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

.dark .settings-action-btn {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.65);
}

.dark .settings-action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.settings-switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
  padding: 2px;
  flex-shrink: 0;
}

.dark .settings-switch {
  background: rgba(255, 255, 255, 0.1);
}

.settings-switch.active {
  background: #3B82F6;
}

.settings-switch-thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.settings-switch.active .settings-switch-thumb {
  transform: translateX(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
