<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

defineProps<{
  activeTab: string;
}>();

const emit = defineEmits<{
  select: [tab: string];
}>();

const isExpanded = ref(false);
const ballX = ref(0);
const ballY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const ballRef = ref<HTMLDivElement | null>(null);

// 初始化位置（右下角）
onMounted(() => {
  const padding = 16;
  ballX.value = window.innerWidth - 60 - padding;
  ballY.value = window.innerHeight - 200;
});

// 菜单项
const menuItems = [
  { key: "images", label: "图片", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "#3B82F6", bg: "#EFF6FF" },
  { key: "layout", label: "布局", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", color: "#10B981", bg: "#ECFDF5" },
  { key: "export", label: "导出", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "#F97316", bg: "#FFF7ED" },
];

// 切换展开/收起
function toggle() {
  if (isDragging.value) return;
  isExpanded.value = !isExpanded.value;
}

// 选择菜单项
function selectItem(key: string) {
  emit("select", key);
  isExpanded.value = false;
}

// 点击外部关闭
function onClickOutside(e: MouseEvent) {
  if (ballRef.value && !ballRef.value.contains(e.target as Node)) {
    isExpanded.value = false;
  }
}

// 拖拽开始
function onPointerDown(e: PointerEvent) {
  isDragging.value = false;
  dragStartX.value = e.clientX - ballX.value;
  dragStartY.value = e.clientY - ballY.value;

  const onMove = (moveE: PointerEvent) => {
    const dx = moveE.clientX - (ballX.value + dragStartX.value);
    const dy = moveE.clientY - (ballY.value + dragStartY.value);
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragging.value = true;
    }
    ballX.value = moveE.clientX - dragStartX.value;
    ballY.value = moveE.clientY - dragStartY.value;

    // 边界限制
    ballX.value = Math.max(8, Math.min(window.innerWidth - 56, ballX.value));
    ballY.value = Math.max(8, Math.min(window.innerHeight - 56, ballY.value));
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);

    // 吸附到最近的边缘
    const centerX = ballX.value + 24;
    if (centerX < window.innerWidth / 2) {
      ballX.value = 8;
    } else {
      ballX.value = window.innerWidth - 56;
    }

    // 延迟重置拖拽状态
    setTimeout(() => {
      isDragging.value = false;
    }, 50);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});

// 计算菜单位置（扇形展开）
function getMenuItemStyle(index: number) {
  if (!isExpanded.value) {
    return {
      transform: "scale(0)",
      opacity: 0,
      transition: `all 0.2s ease ${index * 0.05}s`,
    };
  }

  const radius = 70;
  const isRightSide = ballX.value > window.innerWidth / 2;

  // 根据位置决定展开方向
  let angle: number;
  if (isRightSide) {
    // 在右侧，向左展开（从 180° 开始，逆时针）
    angle = 180 + (index - 1) * 45;
  } else {
    // 在左侧，向右展开（从 0° 开始，顺时针）
    angle = 0 + (index - 1) * 45;
  }

  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return {
    transform: `translate(${x}px, ${y}px) scale(1)`,
    opacity: 1,
    transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s`,
  };
}
</script>

<template>
  <div
    ref="ballRef"
    class="floating-ball-container"
    :style="{ left: `${ballX}px`, top: `${ballY}px` }"
  >
    <!-- 菜单项（扇形展开） -->
    <div
      v-for="(item, index) in menuItems"
      :key="item.key"
      class="menu-item"
      :class="{ active: activeTab === item.key && isExpanded }"
      :style="getMenuItemStyle(index)"
      @click.stop="selectItem(item.key)"
    >
      <div class="menu-item-icon" :style="{ background: item.bg }">
        <svg class="w-[18px] h-[18px]" fill="none" :style="{ color: item.color }" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="item.icon" />
        </svg>
      </div>
    </div>

    <!-- 主悬浮球 -->
    <div
      class="ball"
      :class="{ expanded: isExpanded }"
      @click.stop="toggle"
      @pointerdown.stop="onPointerDown"
    >
      <!-- 收起状态：3 个小圆点 -->
      <div v-if="!isExpanded" class="ball-dots">
        <div class="dot" />
        <div class="dot" />
        <div class="dot" />
      </div>
      <!-- 展开状态：关闭图标 -->
      <svg v-else class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.floating-ball-container {
  position: fixed;
  z-index: 50;
  width: 48px;
  height: 48px;
}

/* 主悬浮球 */
.ball {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 1px 3px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 2;
  touch-action: none;
}

.ball:active {
  transform: scale(0.92);
}

.ball.expanded {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.98);
}

/* 3 个小圆点 */
.ball-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #9CA3AF;
}

/* 菜单项 */
.menu-item {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.menu-item-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 1px 4px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.menu-item:active .menu-item-icon {
  transform: scale(0.88);
}

.menu-item.active .menu-item-icon {
  box-shadow:
    0 4px 16px rgba(59, 130, 246, 0.3),
    0 1px 4px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
</style>
