<script setup lang="ts">
/**
 * ToolBackground — 鸿蒙沉浸微光背景
 * 为所有工具页面提供柔和的光斑 + 点阵装饰背景，
 * 颜色鲜艳但柔和，不干扰工具内容的阅读。
 */
</script>

<template>
  <div class="tool-bg-layer" aria-hidden="true">
    <!-- 柔色光斑 -->
    <div class="tool-blob tb-1"></div>
    <div class="tool-blob tb-2"></div>
    <div class="tool-blob tb-3"></div>
    <div class="tool-blob tb-4"></div>
    <div class="tool-blob tb-5"></div>
    <!-- 点阵纹理 -->
    <div class="tool-dots"></div>
    <!-- 微光线 -->
    <div class="tool-streak ts-1"></div>
    <div class="tool-streak ts-2"></div>
    <div class="tool-streak ts-3"></div>
  </div>
</template>

<style scoped>
.tool-bg-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* ══════════════════════════════════
   柔色光斑 · Vibrant Light Blobs
   ══════════════════════════════════ */
.tool-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  will-change: transform;
  animation: blobFloat 22s ease-in-out infinite;
}

/* 右上 · 天蓝 */
.tb-1 {
  width: 320px; height: 320px;
  top: -60px; right: -40px;
  background: rgb(var(--blob-1-r), var(--blob-1-g), var(--blob-1-b));
  opacity: 0.22;
}
/* 左下 · 薰衣草紫 */
.tb-2 {
  width: 280px; height: 280px;
  bottom: -40px; left: -30px;
  background: rgb(var(--blob-2-r), var(--blob-2-g), var(--blob-2-b));
  opacity: 0.18;
  animation-delay: -6s;
}
/* 中左 · 薄荷绿 */
.tb-3 {
  width: 220px; height: 220px;
  top: 45%; left: 25%;
  background: rgb(var(--blob-3-r), var(--blob-3-g), var(--blob-3-b));
  opacity: 0.14;
  animation-delay: -11s;
}
/* 右上偏中 · 樱花粉 */
.tb-4 {
  width: 200px; height: 200px;
  top: 18%; right: 22%;
  background: rgb(var(--blob-4-r), var(--blob-4-g), var(--blob-4-b));
  opacity: 0.10;
  animation-delay: -16s;
}
/* 右下 · 琥珀金 */
.tb-5 {
  width: 180px; height: 180px;
  bottom: 15%; right: 8%;
  background: rgb(var(--blob-5-r), var(--blob-5-g), var(--blob-5-b));
  opacity: 0.10;
  animation-delay: -9s;
}

/* 深色模式：降低光斑透明度 */
:global(.dark) .tool-blob { opacity: 0.10; }
:global(.dark) .tb-3 { opacity: 0.07; }
:global(.dark) .tb-4 { opacity: 0.06; }
:global(.dark) .tb-5 { opacity: 0.06; }

@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -20px) scale(1.04); }
  50% { transform: translate(-15px, 15px) scale(0.96); }
  75% { transform: translate(10px, 10px) scale(1.02); }
}

/* ══════════════════════════════════
   点阵纹理 · Dot Grid
   ══════════════════════════════════ */
.tool-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(79, 140, 255, 0.035) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 72%);
}

:global(.dark) .tool-dots {
  background-image: radial-gradient(circle, rgba(79, 140, 255, 0.025) 1px, transparent 1px);
}

/* ══════════════════════════════════
   微光线 · Light Streaks
   ══════════════════════════════════ */
.tool-streak {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(79, 140, 255, 0.05), transparent);
  height: 1px;
}

.ts-1 {
  width: 200px; top: 22%; left: 12%;
  transform: rotate(-12deg);
  animation: streakShimmer 9s ease-in-out infinite;
}
.ts-2 {
  width: 160px; top: 55%; right: 18%;
  transform: rotate(18deg);
  animation: streakShimmer 9s ease-in-out infinite;
  animation-delay: -3s;
}
.ts-3 {
  width: 140px; bottom: 28%; left: 38%;
  transform: rotate(-6deg);
  animation: streakShimmer 9s ease-in-out infinite;
  animation-delay: -6s;
}

:global(.dark) .tool-streak {
  background: linear-gradient(90deg, transparent, rgba(79, 140, 255, 0.04), transparent);
}

@keyframes streakShimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
</style>
