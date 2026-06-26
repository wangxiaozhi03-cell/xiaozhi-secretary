<script setup lang="ts">
import { ref, onMounted } from "vue";

const emit = defineEmits<{
  navigate: [toolId: string];
}>();

// 入场动画状态
const isVisible = ref(false);
onMounted(() => {
  setTimeout(() => (isVisible.value = true), 50);
});

// 数据模型
const user = { name: "小志" };

const quickTools = [
  { id: "image-layout", name: "图片排版工具", icon: "image_layout" },
];

const recentTools = [
  { id: "image-layout", name: "图片排版工具", lastTime: "刚刚使用" },
];

const favoriteTools = ref<any[]>([]);

// 图标路径
const iconPaths: Record<string, string> = {
  image_layout: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

function handleQuickToolClick(id: string) {
  emit("navigate", id);
}

function handleAddTool() {
  // TODO: 提示敬请期待
  alert("敬请期待");
}
</script>

<template>
  <div class="h-full overflow-y-auto pb-4">
    <!-- Header -->
    <div
      class="px-4 pt-4 pb-3 transition-all duration-500"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-[#1F2937]">
            Hello，{{ user.name }} 👋
          </h1>
          <p class="text-xs text-[#9CA3AF] mt-0.5">高效工具箱，简单好用</p>
        </div>
        <button class="w-9 h-9 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <svg class="w-[18px] h-[18px] text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPaths.settings" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Banner -->
    <div
      class="px-4 mb-4 transition-all duration-500"
      :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
      :style="{ transitionDelay: '100ms' }"
    >
      <button
        class="w-full h-[160px] rounded-2xl overflow-hidden relative text-left"
        style="background: linear-gradient(135deg, #5B7CFA 0%, #7B95FF 100%); box-shadow: 0 10px 30px rgba(96,120,255,.15);"
        @click="emit('navigate', 'image-layout')"
      >
        <!-- 左侧内容 -->
        <div class="absolute left-5 top-5 z-10" style="width: 55%;">
          <h2 class="text-lg font-bold text-white mb-1">图片排版工具</h2>
          <p class="text-xs text-white/70 leading-relaxed mb-4">
            多种模板布局，轻松拼图<br />让图片更美观
          </p>
          <div class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <span class="text-xs font-semibold text-white">开始使用</span>
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- 右侧插画 -->
        <div class="absolute right-3 top-1/2 -translate-y-1/2 z-10">
          <div class="relative w-[100px] h-[120px]">
            <div
              class="absolute w-[60px] h-[75px] rounded-lg bg-white/20 backdrop-blur-md border border-white/30"
              style="top: 0; right: 0; transform: rotate(6deg);"
            />
            <div
              class="absolute w-[52px] h-[65px] rounded-lg bg-white/15 backdrop-blur-md border border-white/20"
              style="top: 15px; right: 22px; transform: rotate(-3deg);"
            />
            <div
              class="absolute w-[44px] h-[55px] rounded-lg bg-white/10 backdrop-blur-md border border-white/15"
              style="top: 35px; right: 40px; transform: rotate(2deg);"
            />
          </div>
        </div>
      </button>
    </div>

    <!-- 快捷入口 -->
    <div
      class="px-4 mb-4 transition-all duration-500"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      :style="{ transitionDelay: '200ms' }"
    >
      <h3 class="text-sm font-semibold text-[#1F2937] mb-2.5">快捷入口</h3>
      <div class="flex gap-2.5">
        <!-- 工具卡片 -->
        <button
          v-for="tool in quickTools"
          :key="tool.id"
          class="w-[88px] h-[88px] rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 flex flex-col items-center justify-center gap-1.5 active:scale-[0.96] transition-transform"
          style="box-shadow: 0 10px 30px rgba(96,120,255,.08);"
          @click="handleQuickToolClick(tool.id)"
        >
          <div class="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
            <svg class="w-[18px] h-[18px] text-[#5B7CFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPaths[tool.icon]" />
            </svg>
          </div>
          <span class="text-[11px] font-medium text-[#1F2937]">{{ tool.name }}</span>
        </button>

        <!-- 添加工具 -->
        <button
          class="w-[88px] h-[88px] rounded-2xl bg-white/40 backdrop-blur-sm border border-dashed border-[#D1D5DB] flex flex-col items-center justify-center gap-1.5 active:scale-[0.96] transition-transform"
          @click="handleAddTool"
        >
          <div class="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <svg class="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span class="text-[11px] text-[#9CA3AF]">添加工具</span>
        </button>
      </div>
    </div>

    <!-- 最近使用 -->
    <div
      class="px-4 mb-4 transition-all duration-500"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      :style="{ transitionDelay: '300ms' }"
    >
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-[#1F2937]">最近使用</h3>
        <button class="text-xs text-[#5B7CFA]">全部 ></button>
      </div>
      <div class="space-y-1.5">
        <button
          v-for="tool in recentTools"
          :key="tool.id"
          class="w-full flex items-center gap-2.5 p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 active:scale-[0.98] transition-transform"
          style="box-shadow: 0 10px 30px rgba(96,120,255,.08);"
          @click="emit('navigate', tool.id)"
        >
          <div class="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <svg class="w-[18px] h-[18px] text-[#5B7CFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPaths.image_layout" />
            </svg>
          </div>
          <div class="flex-1 text-left">
            <div class="text-[13px] font-medium text-[#1F2937]">{{ tool.name }}</div>
            <div class="text-[11px] text-[#9CA3AF] mt-0.5">{{ tool.lastTime }}</div>
          </div>
          <svg class="w-3.5 h-3.5 text-[#D1D5DB] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 收藏工具 -->
    <div
      class="px-4 mb-4 transition-all duration-500"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      :style="{ transitionDelay: '400ms' }"
    >
      <h3 class="text-sm font-semibold text-[#1F2937] mb-2">收藏工具</h3>

      <!-- 空状态 -->
      <div
        v-if="favoriteTools.length === 0"
        class="flex flex-col items-center justify-center py-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60"
        style="box-shadow: 0 10px 30px rgba(96,120,255,.08);"
      >
        <div class="text-2xl mb-2">⭐</div>
        <p class="text-xs font-medium text-[#6B7280] mb-0.5">暂无收藏工具</p>
        <p class="text-[11px] text-[#9CA3AF]">去探索更多好用工具吧</p>
      </div>
    </div>

    <!-- 底部留白 -->
    <div class="pb-20" />
  </div>
</template>
