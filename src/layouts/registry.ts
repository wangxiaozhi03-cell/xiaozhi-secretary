import type { LayoutKey, LayoutDefinition } from "@/types";
import { layouts1 } from "./layouts-1";
import { layouts2 } from "./layouts-2";
import { layouts3 } from "./layouts-3";
import { layouts4 } from "./layouts-4";
import { layouts6 } from "./layouts-6";
import { layouts9 } from "./layouts-9";

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
