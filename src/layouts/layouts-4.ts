import type { LayoutDefinition } from "@/types";

export const layouts4: LayoutDefinition[] = [
  {
    id: "grid-2x2",
    name: "田字格",
    description: "2×2 网格",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap) / 2;
      const slotH = (h - gap) / 2;
      return [
        { x: 0, y: 0, width: slotW, height: slotH },
        { x: slotW + gap, y: 0, width: slotW, height: slotH },
        { x: 0, y: slotH + gap, width: slotW, height: slotH },
        { x: slotW + gap, y: slotH + gap, width: slotW, height: slotH },
      ];
    },
  },
  {
    id: "two-top-two-bottom",
    name: "两上两下",
    description: "2行×2列",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap) / 2;
      const slotH = (h - gap) / 2;
      return [
        { x: 0, y: 0, width: slotW, height: slotH },
        { x: slotW + gap, y: 0, width: slotW, height: slotH },
        { x: 0, y: slotH + gap, width: slotW, height: slotH },
        { x: slotW + gap, y: slotH + gap, width: slotW, height: slotH },
      ];
    },
  },
  {
    id: "four-vertical",
    name: "竖排四张",
    description: "4行×1列",
    computeSlots: (w, h, gap) => {
      const slotH = (h - gap * 3) / 4;
      return [
        { x: 0, y: 0, width: w, height: slotH },
        { x: 0, y: slotH + gap, width: w, height: slotH },
        { x: 0, y: (slotH + gap) * 2, width: w, height: slotH },
        { x: 0, y: (slotH + gap) * 3, width: w, height: slotH },
      ];
    },
  },
  {
    id: "four-horizontal",
    name: "横排四张",
    description: "1行×4列",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap * 3) / 4;
      return [
        { x: 0, y: 0, width: slotW, height: h },
        { x: slotW + gap, y: 0, width: slotW, height: h },
        { x: (slotW + gap) * 2, y: 0, width: slotW, height: h },
        { x: (slotW + gap) * 3, y: 0, width: slotW, height: h },
      ];
    },
  },
  {
    id: "one-left-three-right",
    name: "一左三右",
    description: "左大+右3小",
    computeSlots: (w, h, gap) => {
      const leftW = (w - gap) * 0.6;
      const rightW = w - gap - leftW;
      const slotH = (h - gap * 2) / 3;
      return [
        { x: 0, y: 0, width: leftW, height: h },
        { x: leftW + gap, y: 0, width: rightW, height: slotH },
        { x: leftW + gap, y: slotH + gap, width: rightW, height: slotH },
        { x: leftW + gap, y: (slotH + gap) * 2, width: rightW, height: slotH },
      ];
    },
  },
  {
    id: "one-top-three-bottom",
    name: "一上三下",
    description: "上大+下3小",
    computeSlots: (w, h, gap) => {
      const topH = (h - gap) * 0.55;
      const bottomH = h - gap - topH;
      const slotW = (w - gap * 2) / 3;
      return [
        { x: 0, y: 0, width: w, height: topH },
        { x: 0, y: topH + gap, width: slotW, height: bottomH },
        { x: slotW + gap, y: topH + gap, width: slotW, height: bottomH },
        { x: (slotW + gap) * 2, y: topH + gap, width: slotW, height: bottomH },
      ];
    },
  },
  {
    id: "three-top-one-left",
    name: "三上一左",
    description: "上3小+左下大",
    computeSlots: (w, h, gap) => {
      const topH = (h - gap) * 0.4;
      const bottomH = h - gap - topH;
      const topSlotW = (w - gap * 2) / 3;
      const bigW = (w - gap) * 0.6;
      const smallW = w - gap - bigW;
      return [
        { x: 0, y: 0, width: topSlotW, height: topH },
        { x: topSlotW + gap, y: 0, width: topSlotW, height: topH },
        { x: (topSlotW + gap) * 2, y: 0, width: topSlotW, height: topH },
        { x: 0, y: topH + gap, width: bigW, height: bottomH },
        // 第5个槽位用于 wrap 布局，这里用第4张图填充
        { x: bigW + gap, y: topH + gap, width: smallW, height: bottomH },
      ].slice(0, 4);
    },
  },
  {
    id: "collage",
    name: "铺满拼贴",
    description: "无间距紧密",
    computeSlots: (w, h, gap) => {
      const g = gap;
      // 左侧大图占 60%，右侧 40%
      const leftW = (w - g) * 0.6;
      const rightW = w - g - leftW;
      // 右侧上下各 50%
      const rightTopH = (h - g) / 2;
      const rightBottomH = h - g - rightTopH;
      // 左侧上下各 50%
      const leftTopH = (h - g) / 2;
      const leftBottomH = h - g - leftTopH;
      return [
        { x: 0, y: 0, width: leftW, height: leftTopH },
        { x: leftW + g, y: 0, width: rightW, height: rightTopH },
        { x: 0, y: leftTopH + g, width: leftW, height: leftBottomH },
        { x: leftW + g, y: rightTopH + g, width: rightW, height: rightBottomH },
      ];
    },
  },
  {
    id: "surround",
    name: "环绕布局",
    description: "中心大+3小",
    computeSlots: (w, h, gap) => {
      const centerW = (w - gap * 2) * 0.5;
      const sideW = (w - gap * 2 - centerW) / 2;
      const centerH = (h - gap * 2) * 0.5;
      const sideH = (h - gap * 2 - centerH) / 2;
      return [
        { x: 0, y: 0, width: sideW, height: sideH },
        { x: sideW + gap, y: 0, width: centerW, height: centerH },
        { x: sideW + centerW + gap * 2, y: 0, width: sideW, height: sideH },
        { x: 0, y: sideH + gap, width: sideW, height: sideH },
      ];
    },
  },
];
