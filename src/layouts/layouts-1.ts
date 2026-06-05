import type { ImageSlot, LayoutDefinition } from "@/types";

function fullPage(pageW: number, pageH: number): ImageSlot[] {
  return [{ x: 0, y: 0, width: pageW, height: pageH }];
}

export const layouts1: LayoutDefinition[] = [
  {
    id: "center-fit",
    name: "居中适配",
    description: "等比缩放，可能留白",
    computeSlots: fullPage,
  },
  {
    id: "fill-page",
    name: "填满页面",
    description: "等比缩放，居中裁剪",
    computeSlots: fullPage,
  },
];
