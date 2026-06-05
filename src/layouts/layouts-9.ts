import type { ImageSlot, LayoutDefinition } from "@/types";

export const layouts9: LayoutDefinition[] = [
  {
    id: "grid-3x3",
    name: "3×3 网格",
    description: "标准九宫格",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap * 2) / 3;
      const slotH = (h - gap * 2) / 3;
      const slots: ImageSlot[] = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          slots.push({
            x: col * (slotW + gap),
            y: row * (slotH + gap),
            width: slotW,
            height: slotH,
          });
        }
      }
      return slots;
    },
  },
  {
    id: "one-big-eight-surround",
    name: "一大八小",
    description: "中心大+8环绕",
    computeSlots: (w, h, gap) => {
      const edgeW = (w - gap * 2) * 0.2;
      const centerW = w - gap * 2 - edgeW * 2;
      const edgeH = (h - gap * 2) * 0.2;
      const centerH = h - gap * 2 - edgeH * 2;
      // 8个小围绕1个大
      return [
        // top row
        { x: 0, y: 0, width: edgeW, height: edgeH },
        { x: edgeW + gap, y: 0, width: centerW, height: edgeH },
        { x: edgeW + centerW + gap * 2, y: 0, width: edgeW, height: edgeH },
        // middle row
        { x: 0, y: edgeH + gap, width: edgeW, height: centerH },
        { x: edgeW + gap, y: edgeH + gap, width: centerW, height: centerH }, // center big
        { x: edgeW + centerW + gap * 2, y: edgeH + gap, width: edgeW, height: centerH },
        // bottom row
        { x: 0, y: edgeH + centerH + gap * 2, width: edgeW, height: edgeH },
        { x: edgeW + gap, y: edgeH + centerH + gap * 2, width: centerW, height: edgeH },
        { x: edgeW + centerW + gap * 2, y: edgeH + centerH + gap * 2, width: edgeW, height: edgeH },
      ];
    },
  },
];
