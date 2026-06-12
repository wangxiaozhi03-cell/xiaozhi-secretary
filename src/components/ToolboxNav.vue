<script setup lang="ts">
import { ref } from "vue";
import logoUrl from "../assets/logo.png";
import SettingsCenter from "./settings/SettingsCenter.vue";

defineProps<{
  activeModule: string;
}>();

const emit = defineEmits<{
  select: [moduleId: string];
}>();

const collapsed = ref(false);
const showSettings = ref(false);
</script>

<template>
  <aside
    class="flex flex-col items-center py-4 px-2 gap-1 transition-all duration-300 overflow-hidden flex-shrink-0"
    :class="collapsed ? 'w-12' : 'w-[68px]'"
  >
    <!-- Logo -->
    <button
      class="mb-4 group relative"
      @click="emit('select', 'home')"
      title="首页"
    >
      <img
        :src="logoUrl"
        alt="Logo"
        class="rounded-xl shadow-md shadow-blue-400/15 transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-400/30"
        :class="[
          collapsed ? 'w-6 h-6' : 'w-8 h-8',
          activeModule === 'home' ? 'ring-2 ring-blue-500/50 ring-offset-2' : ''
        ]"
      />
      <!-- Pulse effect on hover -->
      <div class="absolute inset-0 rounded-xl bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
    </button>

    <!-- 图片工具按钮 -->
    <button
      class="nav-item w-full transition-all duration-300"
      :class="[collapsed ? '!p-1.5' : '', activeModule === 'image-layout' ? 'active' : '']"
      @click="emit('select', 'image-layout')"
    >
      <svg
        class="transition-all duration-300"
        :class="collapsed ? 'w-5 h-5' : 'w-6 h-6'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span v-if="!collapsed" class="nav-label">图片</span>
    </button>

    <!-- JSON 工具按钮 -->
    <button
      class="nav-item w-full transition-all duration-300"
      :class="[collapsed ? '!p-1.5' : '', activeModule === 'json-toolkit' ? 'active' : '']"
      @click="emit('select', 'json-toolkit')"
    >
      <svg
        class="transition-all duration-300"
        :class="collapsed ? 'w-5 h-5' : 'w-6 h-6'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      <span v-if="!collapsed" class="nav-label">JSON</span>
    </button>

    <!-- 系统监控按钮 -->
    <button
      class="nav-item w-full transition-all duration-300"
      :class="[collapsed ? '!p-1.5' : '', activeModule === 'system-monitor' ? 'active' : '']"
      @click="emit('select', 'system-monitor')"
    >
      <svg
        class="transition-all duration-300"
        :class="collapsed ? 'w-5 h-5' : 'w-6 h-6'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
      </svg>
      <span v-if="!collapsed" class="nav-label">系统</span>
    </button>

    <!-- 底部区域 -->
    <div class="mt-auto flex flex-col items-center gap-1 w-full">
      <!-- 设置按钮 -->
      <button
        class="nav-item w-full transition-all duration-300"
        :class="collapsed ? '!p-1.5' : ''"
        @click="showSettings = true"
      >
        <svg
          class="transition-all duration-300"
          :class="collapsed ? 'w-5 h-5' : 'w-6 h-6'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span v-if="!collapsed" class="nav-label">设置</span>
      </button>

      <!-- 折叠/展开按钮 -->
      <button
        class="nav-item w-full transition-all duration-300"
        :class="collapsed ? '!p-1.5' : ''"
        @click="collapsed = !collapsed"
      >
        <svg
          class="transition-transform duration-300"
          :class="collapsed ? 'w-5 h-5 rotate-180' : 'w-6 h-6'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <span v-if="!collapsed" class="nav-label">收起</span>
      </button>
    </div>

    <!-- 设置中心弹窗 -->
    <SettingsCenter :visible="showSettings" @close="showSettings = false" />
  </aside>
</template>
