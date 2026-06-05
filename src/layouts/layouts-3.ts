import type { LayoutDefinition } from "@/types";

export const layouts3: LayoutDefinition[] = [
  {
    id: "three-horizontal",
    name: "三等分横",
    description: "一行3张",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap * 2) / 3;
      return [
        { x: 0, y: 0, width: slotW, height: h },
        { x: slotW + gap, y: 0, width: slotW, height: h },
        { x: (slotW + gap) * 2, y: 0, width: slotW, height: h },
      ];
    },
  },
  {
    id: "three-vertical",
    name: "三等分纵",
    description: "一列3张",
    computeSlots: (w, h, gap) => {
      const slotH = (h - gap * 2) / 3;
      return [
        { x: 0, y: 0, width: w, height: slotH },
        { x: 0, y: slotH + gap, width: w, height: slotH },
        { x: 0, y: (slotH + gap) * 2, width: w, height: slotH },
      ];
    },
  },
  {
    id: "one-top-two-bottom",
    name: "一上两下",
    description: "上大+下两小",
    computeSlots: (w, h, gap) => {
      const topH = (h - gap) * 0.6;
      const bottomH = h - gap - topH;
      const slotW = (w - gap) / 2;
      return [
        { x: 0, y: 0, width: w, height: topH },
        { x: 0, y: topH + gap, width: slotW, height: bottomH },
        { x: slotW + gap, y: topH + gap, width: slotW, height: bottomH },
      ];
    },
  },
  {
    id: "two-top-one-bottom",
    name: "两上一下",
    description: "上两小+下大",
    computeSlots: (w, h, gap) => {
      const topH = (h - gap) * 0.4;
      const bottomH = h - gap - topH;
      const slotW = (w - gap) / 2;
      return [
        { x: 0, y: 0, width: slotW, height: topH },
        { x: slotW + gap, y: 0, width: slotW, height: topH },
        { x: 0, y: topH + gap, width: w, height: bottomH },
      ];
    },
  },
  {
    id: "one-big-two-small-right",
    name: "一大两小",
    description: "左大+右两小",
    computeSlots: (w, h, gap) => {
      const leftW = (w - gap) * 0.65;
      const rightW = w - gap - leftW;
      const slotH = (h - gap) / 2;
      return [
        { x: 0, y: 0, width: leftW, height: h },
        { x: leftW + gap, y: 0, width: rightW, height: slotH },
        { x: leftW + gap, y: slotH + gap, width: rightW, height: slotH },
      ];
    },
  },
];
