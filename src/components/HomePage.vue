<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const emit = defineEmits<{
  navigate: [moduleId: string];
}>();

const isVisible = ref(false);
const currentTime = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  setTimeout(() => (isVisible.value = true), 50);
  timer = setInterval(() => { currentTime.value = new Date(); }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const toolCategories = [
  {
    label: "文档工具",
    desc: "写作、排版、图片处理",
    tools: [
      {
        id: "image-layout",
        label: "图片工具",
        desc: "多图自动排版，支持 A4/A3 文档导出 PDF 和 Word",
        icon: "image",
        gradient: "from-[#3B82F6] to-[#60A5FA]",
        bgGradient: "from-[#EEF4FF] to-[#E0EAFF]",
        features: ["拖拽排序", "多种布局", "实时预览", "PDF导出"],
      },
      {
        id: "md-toolkit",
        label: "MD 工具",
        desc: "Markdown 编辑、实时预览、大纲目录、导出 HTML，一站式写作体验",
        icon: "markdown",
        gradient: "from-[#F59E0B] to-[#FBBF24]",
        bgGradient: "from-[#FFFBEB] to-[#FEF3C7]",
        features: ["实时预览", "大纲目录", "自动保存", "字数统计"],
      },
    ],
  },
  {
    label: "开发工具",
    desc: "数据处理、编码转换",
    tools: [
      {
        id: "json-toolkit",
        label: "JSON 工具",
        desc: "格式化、校验、转义、对比、树形可视化，一站式 JSON 处理",
        icon: "code",
        gradient: "from-[#10B981] to-[#34D399]",
        bgGradient: "from-[#ECFDF5] to-[#D1FAE5]",
        features: ["格式化", "校验", "转义", "对比", "可视化"],
      },
      {
        id: "namecase",
        label: "命名转换",
        desc: "智能命名风格转换，支持 camelCase / snake_case / kebab-case 等多种格式",
        icon: "namecase",
        gradient: "from-[#4F7CFF] to-[#7C5CFF]",
        bgGradient: "from-[#EEF2FF] to-[#E0E7FF]",
        features: ["自动识别", "批量转换", "智能拆词", "一键复制"],
      },
      {
        id: "java-generator",
        label: "Java 生成器",
        desc: "SQL 转 Java 后端代码，自动生成 Entity、Mapper、Service、Controller 全套代码",
        icon: "java",
        gradient: "from-[#EF4444] to-[#F97316]",
        bgGradient: "from-[#FEF2F2] to-[#FFF7ED]",
        features: ["SQL解析", "MyBatis-Plus", "Lombok", "Swagger"],
      },
    ],
  },
  {
    label: "安全工具",
    desc: "加密、解密、哈希",
    tools: [
      {
        id: "encrypt-toolkit",
        label: "加密工具",
        desc: "AES/RSA/SHA/Base64 多算法加密解密，可视化操作",
        icon: "encrypt",
        gradient: "from-[#8B5CF6] to-[#A78BFA]",
        bgGradient: "from-[#F5F3FF] to-[#EDE9FE]",
        features: ["AES-256", "RSA", "SHA-256", "Base64"],
      },
      {
        id: "curl-toolkit",
        label: "Curl 重放",
        desc: "粘贴 curl 命令自动解析，多环境域名切换，一键重放请求",
        icon: "curl",
        gradient: "from-[#F97316] to-[#FB923C]",
        bgGradient: "from-[#FFF7ED] to-[#FFEDD5]",
        features: ["自动解析", "域名替换", "环境切换", "请求重放"],
      },
    ],
  },
];

const stats = [
  { label: "可用工具", value: "5", suffix: "+", color: "#3B82F6" },
  { label: "支持格式", value: "PDF", suffix: " · Word", color: "#10B981" },
  { label: "系统平台", value: "Mac", suffix: " · Win", color: "#8B5CF6" },
  { label: "完全免费", value: "∞", suffix: "", color: "#F59E0B" },
];

const recentTools = [
  { label: "MD 编辑器", icon: "markdown", time: "刚刚" },
  { label: "图片排版", icon: "image", time: "2分钟前" },
  { label: "JSON 格式化", icon: "code", time: "昨天" },
];

const favoriteTools = [
  { label: "MD 编辑器", icon: "markdown", id: "md-toolkit" },
  { label: "图片排版", icon: "image", id: "image-layout" },
  { label: "JSON 格式化", icon: "code", id: "json-toolkit" },
  { label: "二维码生成", icon: "utility", id: "" },
  { label: "UUID 生成", icon: "dev", id: "" },
  { label: "Base64", icon: "dev", id: "" },
];

const iconPaths: Record<string, string> = {
  image: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  dev: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  utility: "M11.42 15.17l-5.384 3.18A1.5 1.5 0 014 17.035V6.965a1.5 1.5 0 012.036-1.415l5.384 3.18m0 0l5.384 3.18A1.5 1.5 0 0118.84 13.5l-5.384 3.18m0-6.36V12m0 0v5.17",
  encrypt: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  curl: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  markdown: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  namecase: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  java: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
};

const iconColors: Record<string, string> = {
  image: "text-[#3B82F6]",
  code: "text-[#10B981]",
  markdown: "text-[#F59E0B]",
  dev: "text-[#6366F1]",
  utility: "text-[#EC4899]",
  encrypt: "text-[#EF4444]",
  curl: "text-[#F97316]",
  namecase: "text-[#4F7CFF]",
  java: "text-[#EF4444]",
};
</script>

<template>
  <div class="home-page flex-1 overflow-y-auto rounded-2xl">
    <!-- 背景装饰层 -->
    <div class="bg-decoration fixed inset-0 pointer-events-none overflow-hidden">
      <div class="light-blob blob-1" />
      <div class="light-blob blob-2" />
      <div class="light-blob blob-3" />
      <div class="light-blob blob-4" />
      <div class="dot-grid" />
      <div class="geo-line line-1" />
      <div class="geo-line line-2" />
      <div class="geo-line line-3" />
    </div>

    <div class="relative z-10">
      <!-- Hero Section -->
      <div class="px-6 pt-8 pb-4">
        <!-- Welcome badge -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#3B82F6]/20 mb-4 transition-all duration-500 shadow-sm"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
          <span class="text-xs font-medium text-[#3B82F6]">欢迎回来</span>
        </div>

        <!-- Main heading -->
        <h1
          class="text-[26px] font-semibold text-[#2B2F36] mb-2 transition-all duration-500"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          小志秘书
        </h1>

        <p
          class="text-sm text-[#5F6B76] max-w-md mb-5 transition-all duration-500"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          轻盈、治愈、高效的多功能工具集合
          <br />
          <span class="text-[#98A2B3] text-xs">为你的创意工作流加速</span>
        </p>

        <!-- Stats -->
        <div
          class="flex gap-3 transition-all duration-500"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card text-center px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm"
          >
            <div class="text-lg font-semibold text-[#2B2F36]">
              {{ stat.value }}<span class="text-xs" :style="{ color: stat.color }">{{ stat.suffix }}</span>
            </div>
            <div class="text-[10px] text-[#98A2B3] mt-0.5">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Tool Categories -->
      <div
        v-for="(category, catIndex) in toolCategories"
        :key="category.label"
        class="px-6 pb-5"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        :style="{ transitionDelay: `${200 + catIndex * 100}ms` }"
      >
        <div class="mb-3">
          <h2 class="text-sm font-semibold text-[#2B2F36]">{{ category.label }}</h2>
          <p class="text-xs text-[#98A2B3] mt-0.5">{{ category.desc }}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          <button
            v-for="tool in category.tools"
            :key="tool.id"
            class="quick-card group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 flex flex-col"
            @click="emit('navigate', tool.id)"
          >
            <!-- 背景渐变 -->
            <div class="absolute inset-0 opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.10]" :class="'bg-gradient-to-br ' + tool.bgGradient" />

            <div class="relative z-10 flex flex-col flex-1">
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" :class="'bg-gradient-to-br ' + tool.bgGradient">
                  <svg class="w-5 h-5" :class="iconColors[tool.icon] || 'text-[#3B82F6]'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPaths[tool.icon]" />
                  </svg>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="'bg-gradient-to-r ' + tool.gradient + ' text-white'">
                  可用
                </span>
              </div>

              <h3 class="text-[15px] font-semibold text-[#2B2F36] mb-1 group-hover:text-[#3B82F6] transition-colors duration-200">
                {{ tool.label }}
              </h3>
              <p class="text-xs text-[#5F6B76] leading-relaxed mb-3">
                {{ tool.desc }}
              </p>

              <div class="flex flex-wrap gap-1.5 mt-auto pt-1">
                <span
                  v-for="feature in tool.features"
                  :key="feature"
                  class="px-2 py-0.5 rounded-full text-[10px] bg-white/60 text-[#98A2B3] backdrop-blur-sm border border-white/50"
                >
                  {{ feature }}
                </span>
              </div>
            </div>

            <!-- Arrow -->
            <div class="absolute bottom-4 right-4 w-7 h-7 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 shadow-sm">
              <svg class="w-3.5 h-3.5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- 下方三栏区域 -->
      <div class="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 最近使用 -->
        <div class="glass-card-inner p-4 rounded-2xl">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[12px] font-semibold text-[#2B2F36]">最近使用</h3>
            <svg class="w-4 h-4 text-[#98A2B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div class="space-y-2">
            <div
              v-for="tool in recentTools"
              :key="tool.label"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer"
            >
              <div class="w-7 h-7 rounded-lg bg-[#EEF4FF] flex items-center justify-center flex-shrink-0">
                <svg class="w-3.5 h-3.5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPaths[tool.icon]" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-[12px] text-[#2B2F36] truncate block">{{ tool.label }}</span>
              </div>
              <span class="text-[10px] text-[#98A2B3] flex-shrink-0">{{ tool.time }}</span>
            </div>
          </div>
        </div>

        <!-- 收藏工具 -->
        <div class="glass-card-inner p-4 rounded-2xl">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[12px] font-semibold text-[#2B2F36]">收藏工具</h3>
            <svg class="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="tool in favoriteTools"
              :key="tool.label"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/50 hover:bg-white/80 border border-white/60 transition-all duration-200 hover:shadow-sm"
              @click="tool.id && emit('navigate', tool.id)"
            >
              <svg class="w-3 h-3 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPaths[tool.icon]" />
              </svg>
              <span class="text-[11px] text-[#2B2F36]">{{ tool.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-6 text-center">
        <p class="text-[11px] text-[#98A2B3]">
          持续开发中 · 更多功能即将上线
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  background: linear-gradient(135deg, #F7FAFF 0%, #EEF5FF 50%, #F0FFF4 30%, #F9FBFF 100%);
  position: relative;
}

/* 背景装饰层 */
.bg-decoration {
  z-index: 0;
}

.light-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  animation: float 20s ease-in-out infinite;
}

.blob-1 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #93C5FD, #60A5FA);
  top: -80px;
  right: -80px;
  animation-delay: 0s;
}

.blob-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #A78BFA, #818CF8);
  bottom: -60px;
  left: -60px;
  animation-delay: -5s;
}

.blob-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #6EE7B7, #34D399);
  top: 40%;
  left: 30%;
  animation-delay: -10s;
  opacity: 0.2;
}

.blob-4 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #F9A8D4, #F472B6);
  top: 20%;
  right: 20%;
  animation-delay: -15s;
  opacity: 0.15;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(15px, 15px) scale(1.02); }
}

.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(59, 130, 246, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

.geo-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.08), transparent);
  height: 1px;
}

.line-1 {
  width: 250px;
  top: 20%;
  left: 10%;
  transform: rotate(-15deg);
  animation: shimmer 8s ease-in-out infinite;
}

.line-2 {
  width: 200px;
  top: 60%;
  right: 15%;
  transform: rotate(20deg);
  animation: shimmer 8s ease-in-out infinite;
  animation-delay: -3s;
}

.line-3 {
  width: 180px;
  bottom: 25%;
  left: 40%;
  transform: rotate(-8deg);
  animation: shimmer 8s ease-in-out infinite;
  animation-delay: -6s;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.3; transform: rotate(var(--rotation, 0deg)) scaleX(0.8); }
  50% { opacity: 0.7; transform: rotate(var(--rotation, 0deg)) scaleX(1.2); }
}

/* 快捷功能卡片 */
.quick-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.quick-card:hover {
  box-shadow:
    0 16px 40px rgba(59, 130, 246, 0.12),
    0 0 0 1px rgba(59, 130, 246, 0.15),
    0 0 20px rgba(59, 130, 246, 0.06);
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(59, 130, 246, 0.25);
}

.quick-card:active {
  transform: translateY(0) scale(0.99);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* 内部卡片 */
.glass-card-inner {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease-out;
}

.glass-card-inner:hover {
  box-shadow:
    0 12px 32px rgba(59, 130, 246, 0.10),
    0 0 0 1px rgba(59, 130, 246, 0.12);
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.2);
}

/* 统计卡片 */
.stat-card {
  transition: all 0.25s ease-out;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 10px 28px rgba(59, 130, 246, 0.10),
    0 0 0 1px rgba(59, 130, 246, 0.12);
}

/* 收藏工具按钮 */
.glass-card-inner button {
  cursor: pointer;
  transition: all 0.2s ease-out;
}

.glass-card-inner button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
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
