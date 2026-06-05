import type { ImageSlot, LayoutDefinition } from "@/types";

export const layouts6: LayoutDefinition[] = [
  {
    id: "grid-2x3",
    name: "2×3 网格",
    description: "2行3列",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap * 2) / 3;
      const slotH = (h - gap) / 2;
      const slots: ImageSlot[] = [];
      for (let row = 0; row < 2; row++) {
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
    id: "grid-3x2",
    name: "3×2 网格",
    description: "3行2列",
    computeSlots: (w, h, gap) => {
      const slotW = (w - gap) / 2;
      const slotH = (h - gap * 2) / 3;
      const slots: ImageSlot[] = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
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
    id: "one-top-five-bottom",
    name: "一上五下",
    description: "大图+5小图",
    computeSlots: (w, h, gap) => {
      const topH = (h - gap) * 0.45;
      const bottomH = h - gap - topH;
      const slotW = (w - gap * 4) / 5;
      const slots: ImageSlot[] = [
        { x: 0, y: 0, width: w, height: topH },
      ];
      for (let i = 0; i < 5; i++) {
        slots.push({
          x: i * (slotW + gap),
          y: topH + gap,
          width: slotW,
          height: bottomH,
        });
      }
      return slots;
    },
  },
];
