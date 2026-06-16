/**
 * 布局注册表
 * 移植自 src/layouts/registry.ts
 */
import { LayoutDefinition } from '../model/Types'
import { layouts1 } from './Layouts1'
import { layouts2 } from './Layouts2'
import { layouts3 } from './Layouts3'
import { layouts4 } from './Layouts4'
import { layouts6 } from './Layouts6'
import { layouts9 } from './Layouts9'

export const LAYOUT_REGISTRY: Record<number, LayoutDefinition[]> = {
  1: layouts1,
  2: layouts2,
  3: layouts3,
  4: layouts4,
  6: layouts6,
  9: layouts9,
}

/** 根据图片数量确定布局 key */
export function getLayoutKey(imageCount: number): number {
  if (imageCount <= 1) return 1
  if (imageCount <= 2) return 2
  if (imageCount <= 3) return 3
  if (imageCount <= 4) return 4
  if (imageCount <= 6) return 6
  return 9
}
