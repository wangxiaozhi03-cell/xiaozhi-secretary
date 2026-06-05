import type { LayoutDefinition } from "@/types";

export const layouts2: LayoutDefinition[] = [
  {
    id: "top-bottom",
    name: "上下排列",
    description: "上1下1，等分",
    computeSlots: (w, h, gap) => {
      const slotH = (h - gap) / 2;
      return [
        { x: 0, y: 0, width: w, height: slotH },
        { x: 0, y: slotH + gap, width: w, height: slotH },
      ];
    },
  },
  {
    id: "left-right",
    name: "左右排列",
    description: "左1右1，等分",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap) / 2;
      return [
        { x: 0, y: 0, width: slotW, height: h },
        { x: slotW + gap, y: 0, width: slotW, height: h },
      ];
    },
  },
  {
    id: "big-small",
    name: "一大一小",
    description: "左7右3",
    computeSlots: (w, h, gap) => {
      const leftW = (w - gap) * 0.7;
      const rightW = w - gap - leftW;
      return [
        { x: 0, y: 0, width: leftW, height: h },
        { x: leftW + gap, y: 0, width: rightW, height: h },
      ];
    },
  },
  {
    id: "top-big-bottom-small",
    name: "上大下小",
    description: "上7下3",
    computeSlots: (w, h, gap) => {
      const topH = (h - gap) * 0.7;
      const bottomH = h - gap - topH;
      return [
        { x: 0, y: 0, width: w, height: topH },
        { x: 0, y: topH + gap, width: w, height: bottomH },
      ];
    },
  },
  {
    id: "diagonal",
    name: "对角排列",
    description: "左上+右下",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap) / 2;
      const slotH = (h - gap) / 2;
      return [
        { x: 0, y: 0, width: slotW, height: slotH },
        { x: slotW + gap, y: slotH + gap, width: slotW, height: slotH },
      ];
    },
  },
];
