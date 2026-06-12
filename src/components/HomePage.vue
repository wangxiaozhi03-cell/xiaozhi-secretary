<script setup lang="ts">
import { ref, onMounted } from "vue";

const emit = defineEmits<{
  navigate: [moduleId: string];
}>();

const isVisible = ref(false);

onMounted(() => {
  setTimeout(() => (isVisible.value = true), 50);
});

const tools = [
  {
    id: "image-layout",
    label: "图片工具",
    desc: "多图自动排版，支持 A4/A3 文档导出 PDF 和 Word",
    icon: "image",
    features: ["拖拽排序", "多种布局", "实时预览"],
  },
  {
    id: "json-toolkit",
    label: "JSON 工具",
    desc: "格式化、校验、转义、对比、树形可视化，一站式 JSON 处理",
    icon: "code",
    features: ["格式化", "校验", "转义", "对比"],
  },
  {
    id: "system-monitor",
    label: "系统监控",
    desc: "实时 CPU/内存/磁盘监控，进程管理，一键内存清理",
    icon: "system",
    features: ["实时监控", "进程管理", "内存清理"],
  },
];

const stats = [
  { label: "可用工具", value: "3", suffix: "" },
  { label: "支持格式", value: "PDF", suffix: "Word" },
  { label: "系统平台", value: "Mac", suffix: "Win" },
  { label: "完全免费", value: "∞", suffix: "" },
];
</script>

<template>
  <div class="home-page flex-1 overflow-y-auto">
    <!-- 背景装饰层 -->
    <div class="bg-decoration fixed inset-0 pointer-events-none overflow-hidden">
      <!-- 渐变光斑 -->
      <div class="light-blob blob-1" />
      <div class="light-blob blob-2" />
      <div class="light-blob blob-3" />
      <div class="light-blob blob-4" />

      <!-- 网格点阵 -->
      <div class="dot-grid" />

      <!-- 几何装饰线 -->
      <div class="geo-line line-1" />
      <div class="geo-line line-2" />
      <div class="geo-line line-3" />
    </div>

    <!-- Hero Section -->
    <div class="relative z-10">
      <div class="px-6 pt-10 pb-6">
        <!-- Welcome badge -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#3B82F6]/20 mb-5 transition-all duration-200 shadow-sm"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
          <span class="text-xs font-medium text-[#3B82F6]">欢迎回来</span>
        </div>

        <!-- Main heading -->
        <h1
          class="text-[28px] font-semibold text-[#2B2F36] mb-3 transition-all duration-200"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          小志工具箱
        </h1>

        <p
          class="text-sm text-[#5F6B76] max-w-md mb-6 transition-all duration-200"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          轻盈、治愈、高效的多功能工具集合
          <br />
          <span class="text-[#98A2B3] text-xs">为你的创意工作流加速</span>
        </p>

        <!-- Stats -->
        <div
          class="flex gap-6 transition-all duration-200"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card text-center px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm"
          >
            <div class="text-xl font-semibold text-[#2B2F36]">
              {{ stat.value }}<span class="text-[#3B82F6]">{{ stat.suffix }}</span>
            </div>
            <div class="text-[11px] text-[#98A2B3] mt-0.5">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tools Grid -->
    <div class="relative z-10 px-6 pb-6">
      <div class="mb-4">
        <h2 class="text-sm font-semibold text-[#2B2F36]">所有工具</h2>
        <p class="text-xs text-[#98A2B3] mt-0.5">选择一个工具开始使用</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="(tool, index) in tools"
          :key="tool.id"
          class="tool-card group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 bg-white/90 backdrop-blur-sm border border-white/80"
          :class="[
            'cursor-pointer hover:shadow-lg hover:border-[#3B82F6]/20',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          ]"
          :style="{ transitionDelay: `${200 + index * 50}ms` }"
          @click="emit('navigate', tool.id)"
        >
          <!-- Content -->
          <div class="relative z-10">
            <!-- Icon -->
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EEF4FF] to-[#E0EAFF] flex items-center justify-center shadow-sm">
                <svg v-if="tool.icon === 'image'" class="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg v-else-if="tool.icon === 'code'" class="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <svg v-else-if="tool.icon === 'document'" class="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <svg v-else-if="tool.icon === 'pdf'" class="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <svg v-else-if="tool.icon === 'ai'" class="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <svg v-else-if="tool.icon === 'system'" class="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
                </svg>
              </div>

              <!-- Status badge -->
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E8F1FF] text-[#3B82F6]">
                可用
              </span>
            </div>

            <!-- Title & Desc -->
            <h3 class="text-sm font-semibold text-[#2B2F36] mb-1 group-hover:text-[#3B82F6] transition-colors duration-200">
              {{ tool.label }}
            </h3>
            <p class="text-xs text-[#5F6B76] leading-relaxed mb-3">
              {{ tool.desc }}
            </p>

            <!-- Features -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="feature in tool.features"
                :key="feature"
                class="px-2 py-0.5 rounded-full text-[10px] bg-[#F5F7FA]/80 text-[#98A2B3] backdrop-blur-sm"
              >
                {{ feature }}
              </span>
            </div>
          </div>

          <!-- Arrow -->
          <div
            class="absolute bottom-4 right-4 w-7 h-7 rounded-lg bg-gradient-to-br from-[#EEF4FF] to-[#E0EAFF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 shadow-sm"
          >
            <svg class="w-3.5 h-3.5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="relative z-10 px-6 pb-6 text-center">
      <p class="text-[11px] text-[#98A2B3]">
        持续开发中 · 更多功能即将上线
      </p>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  background: #DAF4F6;
  position: relative;
}

/* 背景装饰层 */
.bg-decoration {
  z-index: 0;
}

/* 渐变光斑 */
.light-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s ease-in-out infinite;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #93C5FD, #60A5FA);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #A78BFA, #818CF8);
  bottom: -80px;
  left: -80px;
  animation-delay: -5s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #6EE7B7, #34D399);
  top: 40%;
  left: 30%;
  animation-delay: -10s;
  opacity: 0.25;
}

.blob-4 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #F9A8D4, #F472B6);
  top: 20%;
  right: 20%;
  animation-delay: -15s;
  opacity: 0.2;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(15px, 15px) scale(1.02);
  }
}

/* 网格点阵 */
.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

/* 几何装饰线 */
.geo-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  height: 1px;
}

.line-1 {
  width: 300px;
  top: 20%;
  left: 10%;
  transform: rotate(-15deg);
  animation: shimmer 8s ease-in-out infinite;
}

.line-2 {
  width: 250px;
  top: 60%;
  right: 15%;
  transform: rotate(20deg);
  animation: shimmer 8s ease-in-out infinite;
  animation-delay: -3s;
}

.line-3 {
  width: 200px;
  bottom: 25%;
  left: 40%;
  transform: rotate(-8deg);
  animation: shimmer 8s ease-in-out infinite;
  animation-delay: -6s;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0.3;
    transform: rotate(var(--rotation, 0deg)) scaleX(0.8);
  }
  50% {
    opacity: 0.7;
    transform: rotate(var(--rotation, 0deg)) scaleX(1.2);
  }
}

/* 卡片样式 */
.tool-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
}

.tool-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0));
  pointer-events: none;
}

.tool-card:hover:not([disabled]) {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.tool-card:active:not([disabled]) {
  transform: translateY(0) scale(0.98);
}

/* 统计卡片 */
.stat-card {
  transition: all 0.2s ease-out;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* 脉冲动画 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
