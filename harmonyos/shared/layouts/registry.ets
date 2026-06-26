import { LayoutKey, LayoutDefinition, ImageSlot } from '../types/index';

// ===== 1-image layouts =====
function fullPage(pageW: number, pageH: number): ImageSlot[] {
  return [{ x: 0, y: 0, width: pageW, height: pageH }];
}

const layouts1: LayoutDefinition[] = [
  { id: "center-fit", name: "居中适配", description: "等比缩放，可能留白", computeSlots: fullPage },
  { id: "fill-page", name: "填满页面", description: "等比缩放，居中裁剪", computeSlots: fullPage },
];

// ===== 2-image layouts =====
function topBottom(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const h = (pageH - gap) / 2;
  return [
    { x: 0, y: 0, width: pageW, height: h },
    { x: 0, y: h + gap, width: pageW, height: h },
  ];
}

function leftRight(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap) / 2;
  return [
    { x: 0, y: 0, width: w, height: pageH },
    { x: w + gap, y: 0, width: w, height: pageH },
  ];
}

function bigSmall(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const bigW = pageW * 0.65;
  const smallW = pageW - bigW - gap;
  return [
    { x: 0, y: 0, width: bigW, height: pageH },
    { x: bigW + gap, y: 0, width: smallW, height: pageH },
  ];
}

function topBigBottomSmall(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const bigH = pageH * 0.65;
  const smallH = pageH - bigH - gap;
  return [
    { x: 0, y: 0, width: pageW, height: bigH },
    { x: 0, y: bigH + gap, width: pageW, height: smallH },
  ];
}

function diagonal(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap) / 2;
  const h = (pageH - gap) / 2;
  return [
    { x: 0, y: 0, width: w, height: h },
    { x: w + gap, y: h + gap, width: w, height: h },
  ];
}

const layouts2: LayoutDefinition[] = [
  { id: "top-bottom", name: "上下排列", description: "两张图片上下排列", computeSlots: topBottom },
  { id: "left-right", name: "左右排列", description: "两张图片左右排列", computeSlots: leftRight },
  { id: "big-small", name: "大小排列", description: "左大右小", computeSlots: bigSmall },
  { id: "top-big-bottom-small", name: "上大下小", description: "上大下小", computeSlots: topBigBottomSmall },
  { id: "diagonal", name: "对角排列", description: "左上和右下", computeSlots: diagonal },
];

// ===== 3-image layouts =====
function threeHorizontal(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap * 2) / 3;
  return [
    { x: 0, y: 0, width: w, height: pageH },
    { x: w + gap, y: 0, width: w, height: pageH },
    { x: (w + gap) * 2, y: 0, width: w, height: pageH },
  ];
}

function threeVertical(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const h = (pageH - gap * 2) / 3;
  return [
    { x: 0, y: 0, width: pageW, height: h },
    { x: 0, y: h + gap, width: pageW, height: h },
    { x: 0, y: (h + gap) * 2, width: pageW, height: h },
  ];
}

function oneTopTwoBottom(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const topH = pageH * 0.55;
  const bottomH = pageH - topH - gap;
  const w = (pageW - gap) / 2;
  return [
    { x: 0, y: 0, width: pageW, height: topH },
    { x: 0, y: topH + gap, width: w, height: bottomH },
    { x: w + gap, y: topH + gap, width: w, height: bottomH },
  ];
}

function twoTopOneBottom(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const bottomH = pageH * 0.55;
  const topH = pageH - bottomH - gap;
  const w = (pageW - gap) / 2;
  return [
    { x: 0, y: 0, width: w, height: topH },
    { x: w + gap, y: 0, width: w, height: topH },
    { x: 0, y: topH + gap, width: pageW, height: bottomH },
  ];
}

function oneBigTwoSmallRight(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const bigW = pageW * 0.6;
  const smallW = pageW - bigW - gap;
  const smallH = (pageH - gap) / 2;
  return [
    { x: 0, y: 0, width: bigW, height: pageH },
    { x: bigW + gap, y: 0, width: smallW, height: smallH },
    { x: bigW + gap, y: smallH + gap, width: smallW, height: smallH },
  ];
}

const layouts3: LayoutDefinition[] = [
  { id: "three-horizontal", name: "三横排", description: "三张图片横向排列", computeSlots: threeHorizontal },
  { id: "three-vertical", name: "三竖排", description: "三张图片纵向排列", computeSlots: threeVertical },
  { id: "one-top-two-bottom", name: "上一下二", description: "上一张下两张", computeSlots: oneTopTwoBottom },
  { id: "two-top-one-bottom", name: "上二下一", description: "上两张下一张", computeSlots: twoTopOneBottom },
  { id: "one-big-two-small-right", name: "左大右小", description: "左侧大图右侧两张小图", computeSlots: oneBigTwoSmallRight },
];

// ===== 4-image layouts =====
function grid2x2(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap) / 2;
  const h = (pageH - gap) / 2;
  return [
    { x: 0, y: 0, width: w, height: h },
    { x: w + gap, y: 0, width: w, height: h },
    { x: 0, y: h + gap, width: w, height: h },
    { x: w + gap, y: h + gap, width: w, height: h },
  ];
}

function fourVertical(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const h = (pageH - gap * 3) / 4;
  return [
    { x: 0, y: 0, width: pageW, height: h },
    { x: 0, y: h + gap, width: pageW, height: h },
    { x: 0, y: (h + gap) * 2, width: pageW, height: h },
    { x: 0, y: (h + gap) * 3, width: pageW, height: h },
  ];
}

function fourHorizontal(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap * 3) / 4;
  return [
    { x: 0, y: 0, width: w, height: pageH },
    { x: w + gap, y: 0, width: w, height: pageH },
    { x: (w + gap) * 2, y: 0, width: w, height: pageH },
    { x: (w + gap) * 3, y: 0, width: w, height: pageH },
  ];
}

function oneLeftThreeRight(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const bigW = pageW * 0.55;
  const smallW = pageW - bigW - gap;
  const smallH = (pageH - gap * 2) / 3;
  return [
    { x: 0, y: 0, width: bigW, height: pageH },
    { x: bigW + gap, y: 0, width: smallW, height: smallH },
    { x: bigW + gap, y: smallH + gap, width: smallW, height: smallH },
    { x: bigW + gap, y: (smallH + gap) * 2, width: smallW, height: smallH },
  ];
}

function oneTopThreeBottom(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const topH = pageH * 0.55;
  const bottomH = pageH - topH - gap;
  const w = (pageW - gap * 2) / 3;
  return [
    { x: 0, y: 0, width: pageW, height: topH },
    { x: 0, y: topH + gap, width: w, height: bottomH },
    { x: w + gap, y: topH + gap, width: w, height: bottomH },
    { x: (w + gap) * 2, y: topH + gap, width: w, height: bottomH },
  ];
}

function threeTopOneLeft(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const topH = pageH * 0.5;
  const bottomH = pageH - topH - gap;
  const topW = (pageW - gap * 2) / 3;
  const bottomW = (pageW - gap) / 2;
  return [
    { x: 0, y: 0, width: topW, height: topH },
    { x: topW + gap, y: 0, width: topW, height: topH },
    { x: (topW + gap) * 2, y: 0, width: topW, height: topH },
    { x: 0, y: topH + gap, width: bottomW, height: bottomH },
  ];
}

function collage(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const bigW = pageW * 0.6;
  const smallW = pageW - bigW - gap;
  const smallH = (pageH - gap) / 2;
  return [
    { x: 0, y: 0, width: bigW, height: pageH },
    { x: bigW + gap, y: 0, width: smallW, height: smallH },
    { x: bigW + gap, y: smallH + gap, width: smallW, height: smallH },
  ];
}

function surround(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap * 2) / 3;
  const h = (pageH - gap) / 2;
  return [
    { x: 0, y: 0, width: w, height: h },
    { x: w + gap, y: 0, width: w, height: h },
    { x: (w + gap) * 2, y: 0, width: w, height: h },
    { x: 0, y: h + gap, width: w, height: h },
    { x: (w + gap) * 2, y: h + gap, width: w, height: h },
  ];
}

const layouts4: LayoutDefinition[] = [
  { id: "grid-2x2", name: "2×2 网格", description: "四张图片网格排列", computeSlots: grid2x2 },
  { id: "four-vertical", name: "四竖排", description: "四张图片纵向排列", computeSlots: fourVertical },
  { id: "four-horizontal", name: "四横排", description: "四张图片横向排列", computeSlots: fourHorizontal },
  { id: "one-left-three-right", name: "左一右三", description: "左侧大图右侧三张小图", computeSlots: oneLeftThreeRight },
  { id: "one-top-three-bottom", name: "上一下三", description: "上一张下三张", computeSlots: oneTopThreeBottom },
  { id: "three-top-one-left", name: "上三下一左", description: "上三张下一张左对齐", computeSlots: threeTopOneLeft },
  { id: "collage", name: "拼贴", description: "左大右两小", computeSlots: collage },
  { id: "surround", name: "环绕", description: "五张环绕排列", computeSlots: surround },
];

// ===== 6-image layouts =====
function grid2x3(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap * 2) / 3;
  const h = (pageH - gap) / 2;
  const slots: ImageSlot[] = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      slots.push({
        x: col * (w + gap),
        y: row * (h + gap),
        width: w,
        height: h,
      });
    }
  }
  return slots;
}

function grid3x2(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap) / 2;
  const h = (pageH - gap * 2) / 3;
  const slots: ImageSlot[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      slots.push({
        x: col * (w + gap),
        y: row * (h + gap),
        width: w,
        height: h,
      });
    }
  }
  return slots;
}

function oneTopFiveBottom(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const topH = pageH * 0.5;
  const bottomH = pageH - topH - gap;
  const w = (pageW - gap * 4) / 5;
  const slots: ImageSlot[] = [
    { x: 0, y: 0, width: pageW, height: topH },
  ];
  for (let i = 0; i < 5; i++) {
    slots.push({
      x: i * (w + gap),
      y: topH + gap,
      width: w,
      height: bottomH,
    });
  }
  return slots;
}

const layouts6: LayoutDefinition[] = [
  { id: "grid-2x3", name: "2×3 网格", description: "六张图片网格排列", computeSlots: grid2x3 },
  { id: "grid-3x2", name: "3×2 网格", description: "六张图片网格排列", computeSlots: grid3x2 },
  { id: "one-top-five-bottom", name: "上一下五", description: "上一张下五张", computeSlots: oneTopFiveBottom },
];

// ===== 9-image layouts =====
function grid3x3(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const w = (pageW - gap * 2) / 3;
  const h = (pageH - gap * 2) / 3;
  const slots: ImageSlot[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      slots.push({
        x: col * (w + gap),
        y: row * (h + gap),
        width: w,
        height: h,
      });
    }
  }
  return slots;
}

function oneBigEightSurround(pageW: number, pageH: number, gap: number): ImageSlot[] {
  const smallW = (pageW - gap * 2) / 3;
  const smallH = (pageH - gap * 2) / 3;
  const bigW = smallW;
  const bigH = smallH;
  return [
    { x: 0, y: 0, width: smallW, height: smallH },
    { x: smallW + gap, y: 0, width: bigW, height: smallH },
    { x: (smallW + gap) * 2, y: 0, width: smallW, height: smallH },
    { x: 0, y: smallH + gap, width: smallW, height: bigH },
    { x: smallW + gap, y: smallH + gap, width: bigW, height: bigH },
    { x: (smallW + gap) * 2, y: smallH + gap, width: smallW, height: bigH },
    { x: 0, y: (smallH + gap) * 2, width: smallW, height: smallH },
    { x: smallW + gap, y: (smallH + gap) * 2, width: bigW, height: smallH },
    { x: (smallW + gap) * 2, y: (smallH + gap) * 2, width: smallW, height: smallH },
  ];
}

const layouts9: LayoutDefinition[] = [
  { id: "grid-3x3", name: "3×3 网格", description: "九张图片网格排列", computeSlots: grid3x3 },
  { id: "one-big-eight-surround", name: "中心环绕", description: "中心大图周围八张小图", computeSlots: oneBigEightSurround },
];

// ===== Registry =====
export const LAYOUT_REGISTRY: Record<LayoutKey, LayoutDefinition[]> = {
  1: layouts1,
  2: layouts2,
  3: layouts3,
  4: layouts4,
  6: layouts6,
  9: layouts9,
};

/** 根据图片数量确定布局 key */
export function getLayoutKey(imageCount: number): LayoutKey {
  if (imageCount <= 1) return 1;
  if (imageCount <= 2) return 2;
  if (imageCount <= 3) return 3;
  if (imageCount <= 4) return 4;
  if (imageCount <= 6) return 6;
  return 9;
}
