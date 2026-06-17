<script setup lang="ts">
defineProps<{
  activeTab: string;
}>();

const emit = defineEmits<{
  select: [tabId: string];
}>();

const menuItems = [
  { id: "appearance", label: "外观", icon: "palette" },
  { id: "editor", label: "编辑器", icon: "code" },
  { id: "json-toolkit", label: "JSON工具", icon: "brackets" },
  { id: "data", label: "数据", icon: "database" },
  { id: "plugins", label: "插件", icon: "puzzle" },
  { id: "shortcuts", label: "快捷键", icon: "keyboard" },
  { id: "about", label: "关于", icon: "info" },
];
</script>

<template>
  <div class="settings-menu w-[220px] flex-shrink-0 overflow-y-auto py-3 px-2">
    <button
      v-for="item in menuItems"
      :key="item.id"
      class="menu-item w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] transition-all duration-200 text-left"
      :class="activeTab === item.id ? 'active' : ''"
      @click="emit('select', item.id)"
    >
      <!-- Icon -->
      <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <template v-if="item.icon === 'palette'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </template>
        <template v-else-if="item.icon === 'code'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </template>
        <template v-else-if="item.icon === 'brackets'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </template>
        <template v-else-if="item.icon === 'database'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </template>
        <template v-else-if="item.icon === 'puzzle'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </template>
        <template v-else-if="item.icon === 'keyboard'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </template>
        <template v-else-if="item.icon === 'info'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </template>
      </svg>
      <span>{{ item.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.settings-menu {
  background: #F8F9FC;
  border-right: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .settings-menu {
  background: rgba(20, 25, 35, 0.5);
  border-right-color: rgba(255, 255, 255, 0.06);
}

.menu-item {
  color: rgba(0, 0, 0, 0.55);
  position: relative;
}

.menu-item:hover {
  background: #EEF4FF;
  color: #3B82F6;
}

.dark .menu-item {
  color: rgba(255, 255, 255, 0.55);
}

.dark .menu-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #60A5FA;
}

.menu-item.active {
  background: #E8F1FF;
  color: #2563EB;
  font-weight: 600;
}

.menu-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #3B82F6;
  border-radius: 0 4px 4px 0;
}

.dark .menu-item.active {
  background: rgba(59, 130, 246, 0.15);
  color: #60A5FA;
}

.dark .menu-item.active::before {
  background: #60A5FA;
}
</style>
