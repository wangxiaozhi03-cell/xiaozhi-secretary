<script setup lang="ts">
import logoUrl from "../../../assets/logo.png";

const version = "1.0.0";
const buildDate = "2026-06-11";

const links = [
  { label: "官方网站", url: "https://example.com", icon: "globe" },
  { label: "GitHub", url: "https://github.com/example/toolbox", icon: "github" },
  { label: "反馈问题", url: "https://github.com/example/toolbox/issues", icon: "bug" },
  { label: "更新日志", url: "https://github.com/example/toolbox/releases", icon: "document" },
];

const changelog = [
  { version: "1.0.0", date: "2026-06-11", changes: ["初始版本发布", "支持图片排版工具", "支持 JSON 工具箱", "沉浸光感 UI 设计"] },
  { version: "0.9.0", date: "2026-05-20", changes: ["Beta 测试版本", "核心功能开发完成"] },
];
</script>

<template>
  <div class="space-y-5">
    <!-- 应用信息 -->
    <div class="settings-card">
      <div class="flex items-center gap-4 mb-4">
        <img :src="logoUrl" alt="Logo" class="w-14 h-14 rounded-2xl shadow-md" />
        <div>
          <h2 class="text-[18px] font-semibold text-primary">小志秘书</h2>
          <p class="text-[12px] text-tertiary">XiaoZhi Toolbox</p>
        </div>
      </div>
      <div class="space-y-2 text-[12px]">
        <div class="flex justify-between">
          <span class="text-tertiary">版本号</span>
          <span class="text-secondary">v{{ version }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-tertiary">构建日期</span>
          <span class="text-secondary">{{ buildDate }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-tertiary">框架</span>
          <span class="text-secondary">Vue 3 + Tauri</span>
        </div>
        <div class="flex justify-between">
          <span class="text-tertiary">许可证</span>
          <span class="text-secondary">MIT License</span>
        </div>
      </div>
    </div>

    <!-- 链接 -->
    <div class="settings-card">
      <h3 class="settings-card-title">相关链接</h3>
      <div class="space-y-2">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.url"
          target="_blank"
          class="link-item flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200"
        >
          <svg class="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <template v-if="link.icon === 'globe'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </template>
            <template v-else-if="link.icon === 'github'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </template>
            <template v-else-if="link.icon === 'bug'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </template>
            <template v-else>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </template>
          </svg>
          <span class="text-[13px] text-secondary">{{ link.label }}</span>
          <svg class="w-3.5 h-3.5 text-tertiary ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>

    <!-- 更新日志 -->
    <div class="settings-card">
      <h3 class="settings-card-title">更新日志</h3>
      <div class="space-y-4">
        <div v-for="log in changelog" :key="log.version">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[13px] font-semibold text-primary">v{{ log.version }}</span>
            <span class="text-[11px] text-tertiary">{{ log.date }}</span>
          </div>
          <ul class="space-y-1">
            <li v-for="(change, idx) in log.changes" :key="idx" class="flex items-start gap-2 text-[12px] text-secondary">
              <span class="text-blue-500 mt-1">•</span>
              <span>{{ change }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 版权信息 -->
    <div class="text-center text-[11px] text-tertiary py-2">
      <p>© 2026 小志秘书. All rights reserved.</p>
      <p class="mt-1">Made with ❤️ using Vue 3 + Tauri</p>
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

.link-item {
  text-decoration: none;
  cursor: pointer;
}

.link-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.dark .link-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
