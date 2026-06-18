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

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  iconPath: string;
}

interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    items: [
      { id: "home", icon: "home", label: "首页", iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    ],
  },
  {
    label: "主要功能",
    items: [
      { id: "image-layout", icon: "image", label: "图片", iconPath: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { id: "json-toolkit", icon: "code", label: "JSON", iconPath: "M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" },
      { id: "md-toolkit", icon: "markdown", label: "Markdown", iconPath: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
      { id: "java-generator", icon: "java", label: "Java生成", iconPath: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" },
      { id: "namecase", icon: "namecase", label: "命名转换", iconPath: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
      { id: "curl-toolkit", icon: "curl", label: "Curl", iconPath: "M6.75 7.5l3 2.25-3 2.25m8.5 0l3 2.25-3 2.25M3.375 3h17.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V4.125C2.25 3.504 2.754 3 3.375 3z" },
      { id: "java-packager", icon: "package", label: "Java打包", iconPath: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" },
      { id: "sql-toolkit", icon: "sql", label: "SQL", iconPath: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" },
    ],
  },
];

function handleItemClick(item: MenuItem) {
  emit("select", item.id);
}
</script>

<template>
  <aside
    class="glass-sidebar flex flex-col overflow-hidden transition-all duration-300 flex-shrink-0"
    :class="collapsed ? 'w-[68px]' : 'w-[260px]'"
  >
    <!-- 内置装饰光斑 -->
    <div class="sidebar-glow" aria-hidden="true">
      <div class="sg-blob sg-1"></div>
      <div class="sg-blob sg-2"></div>
      <div class="sg-blob sg-3"></div>
    </div>

    <!-- Logo 区域 -->
    <div class="flex items-center gap-3 px-4 pt-5 pb-3 flex-shrink-0">
      <button
        class="group relative flex-shrink-0"
        @click="emit('select', 'home')"
        title="首页"
      >
        <img
          :src="logoUrl"
          alt="Logo"
          class="rounded-xl shadow-md shadow-blue-400/15 transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-400/30"
          :class="[
            collapsed ? 'w-8 h-8' : 'w-9 h-9',
            activeModule === 'home' ? 'ring-2 ring-blue-500/50 ring-offset-1' : ''
          ]"
        />
      </button>
      <Transition name="fade">
        <div v-if="!collapsed" class="min-w-0">
          <h2 class="text-[14px] font-semibold text-primary truncate">小志秘书</h2>
          <p class="text-[10px] text-tertiary truncate">assistant xiao zhi</p>
        </div>
      </Transition>
    </div>

    <!-- 菜单列表 -->
    <nav class="flex-1 overflow-y-auto px-2.5 py-1 space-y-1">
      <template v-for="(group, gi) in menuGroups" :key="gi">
        <!-- 分组标签 -->
        <div v-if="group.label && !collapsed" class="px-3 pt-3 pb-1">
          <span class="text-[10px] font-medium text-tertiary uppercase tracking-wider">{{ group.label }}</span>
        </div>
        <div v-else-if="group.label && collapsed" class="px-1 pt-3 pb-1">
          <div class="w-6 h-px bg-black/[0.06] dark:bg-white/[0.08] mx-auto" />
        </div>

        <!-- 菜单项 -->
        <button
          v-for="item in group.items"
          :key="item.id"
          class="sidebar-item w-full transition-all duration-200"
          :class="[
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2',
            activeModule === item.id ? 'active' : '',
          ]"
          :title="collapsed ? item.label : undefined"
          @click="handleItemClick(item)"
        >
          <svg
            class="sidebar-icon flex-shrink-0 transition-all duration-200"
            :class="collapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.iconPath" />
          </svg>
          <span v-if="!collapsed" class="sidebar-label text-[13px] truncate">{{ item.label }}</span>
        </button>
      </template>
    </nav>

    <!-- 底部区域 -->
    <div class="flex-shrink-0 px-2.5 pb-3 space-y-1">
      <!-- 分隔线 -->
      <div class="mx-3 my-1 h-px bg-black/[0.06] dark:bg-white/[0.08]" />

      <!-- 设置 -->
      <button
        class="sidebar-item w-full transition-all duration-200"
        :class="collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'"
        :title="collapsed ? '设置' : undefined"
        @click="showSettings = true"
      >
        <svg
          class="sidebar-icon flex-shrink-0 transition-all duration-200"
          :class="collapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span v-if="!collapsed" class="sidebar-label text-[13px] truncate">设置</span>
      </button>

      <!-- 折叠/展开按钮 -->
      <button
        class="sidebar-item w-full transition-all duration-200"
        :class="collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'"
        :title="collapsed ? '展开' : undefined"
        @click="collapsed = !collapsed"
      >
        <svg
          class="sidebar-icon flex-shrink-0 transition-transform duration-300"
          :class="collapsed ? 'w-5 h-5 rotate-180' : 'w-[18px] h-[18px]'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <span v-if="!collapsed" class="sidebar-label text-[13px] truncate">收起</span>
      </button>
    </div>

    <!-- 设置中心弹窗 -->
    <SettingsCenter :visible="showSettings" @close="showSettings = false" />
  </aside>
</template>

<style scoped>
/* ── 鸿蒙沉浸光感侧栏 ── */
.glass-sidebar {
  background: rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.72);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-right: 0.5px solid rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.4);
  position: relative;
}
/* 顶部极光线 */
.glass-sidebar::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4F8CFF, #A78BFA, #34D399, #F59E0B);
  opacity: 0.7;
  z-index: 2;
}
/* 内侧微光 */
.glass-sidebar::after {
  content: '';
  position: absolute;
  top: 2px; left: 0; right: 0;
  height: 40px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

/* ── 侧栏内置装饰光斑 ── */
.sidebar-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.sg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(45px);
  animation: sgFloat 18s ease-in-out infinite;
}
.sg-1 {
  width: 140px; height: 140px;
  top: -30px; left: -30px;
  background: rgb(var(--blob-1-r), var(--blob-1-g), var(--blob-1-b));
  opacity: 0.35;
}
.sg-2 {
  width: 120px; height: 120px;
  bottom: 20%; right: -25px;
  background: rgb(var(--blob-2-r), var(--blob-2-g), var(--blob-2-b));
  opacity: 0.25;
  animation-delay: -6s;
}
.sg-3 {
  width: 100px; height: 100px;
  bottom: -20px; left: 20%;
  background: rgb(var(--blob-3-r), var(--blob-3-g), var(--blob-3-b));
  opacity: 0.20;
  animation-delay: -12s;
}
@keyframes sgFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(8px, -12px) scale(1.05); }
  66% { transform: translate(-6px, 8px) scale(0.95); }
}

:global(.dark) .sg-1 { opacity: 0.20; }
:global(.dark) .sg-2 { opacity: 0.15; }
:global(.dark) .sg-3 { opacity: 0.12; }

.dark .glass-sidebar {
  background: rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.35);
  border-right-color: rgba(255, 255, 255, 0.08);
}
.dark .glass-sidebar::before {
  opacity: 0.5;
}
.dark .glass-sidebar::after {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
}

/* ── 菜单项：鸿蒙透光按钮风格 ── */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  position: relative;
  background: linear-gradient(
    180deg,
    rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.30) 0%,
    rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.15) 100%
  );
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 0.5px solid rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.30);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.40);
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 所有菜单项都有隐藏的指示器，激活时淡入 */
.sidebar-item::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--accent), var(--accent-hover));
  box-shadow: 0 0 8px var(--accent-glow, rgba(79, 140, 255, 0.5));
  opacity: 0;
  transform: scaleY(0.5);
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.sidebar-item:hover {
  background: linear-gradient(
    180deg,
    rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.45) 0%,
    rgba(var(--glass-r), var(--glass-g), var(--glass-b), 0.25) 100%
  );
  color: rgba(0, 0, 0, 0.8);
  border-color: rgba(79, 140, 255, 0.15);
  box-shadow:
    0 4px 14px rgba(79, 140, 255, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.50);
}

.sidebar-item:hover .sidebar-icon {
  transform: scale(1.12);
  color: var(--accent, #4F8CFF);
}

/* 激活态：渐变底色 + 左侧辉光指示器 */
.sidebar-item.active {
  background: linear-gradient(135deg, rgba(79, 140, 255, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
  color: var(--accent, #4F8CFF);
  border-color: rgba(79, 140, 255, 0.2);
  box-shadow:
    0 4px 16px rgba(79, 140, 255, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}
/* 左侧3px辉光指示器 — 激活时淡入展开 */
.sidebar-item.active::before {
  opacity: 1;
  transform: scaleY(1);
}

.sidebar-item.active .sidebar-icon {
  filter: drop-shadow(0 0 6px rgba(79, 140, 255, 0.35));
}

/* ── 深色模式菜单项 ── */
.dark .sidebar-item {
  color: rgba(255, 255, 255, 0.40);
  background: linear-gradient(
    180deg,
    rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.20) 0%,
    rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.10) 100%
  );
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.dark .sidebar-item:hover {
  background: linear-gradient(
    180deg,
    rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.30) 0%,
    rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.16) 100%
  );
  color: rgba(255, 255, 255, 0.9);
  border-color: var(--accent-light, rgba(79, 140, 255, 0.15));
  box-shadow:
    0 4px 14px var(--accent-light, rgba(79, 140, 255, 0.08)),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.dark .sidebar-item.active {
  background: linear-gradient(135deg, var(--accent-light, rgba(79, 140, 255, 0.18)) 0%, rgba(var(--glass-dark-r), var(--glass-dark-g), var(--glass-dark-b), 0.22) 100%);
  color: var(--accent);
  border-color: var(--accent-light, rgba(79, 140, 255, 0.25));
  box-shadow:
    0 4px 16px var(--accent-light, rgba(79, 140, 255, 0.12)),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.dark .sidebar-item.active::before {
  background: linear-gradient(180deg, var(--accent), var(--accent-hover));
  box-shadow: 0 0 10px var(--accent-glow, rgba(96, 165, 250, 0.5));
}

.dark .sidebar-item.active .sidebar-icon {
  filter: drop-shadow(0 0 6px var(--accent-glow, rgba(96, 165, 250, 0.4)));
}

/* ── 按压反馈 ── */
.sidebar-item:active {
  transform: scale(0.97);
  transition-duration: 0.08s;
}

/* Fade transition for labels */
.fade-enter-active {
  transition: opacity 0.2s ease 0.1s;
}
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
