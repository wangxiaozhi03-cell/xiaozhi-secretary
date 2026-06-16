/**
 * 2张图片的布局定义
 * 移植自 src/layouts/layouts-2.ts
 */
import { ImageSlot, LayoutDefinition } from '../model/Types'

export const layouts2: LayoutDefinition[] = [
  new LayoutDefinition(
    'top-bottom',
    '上下排列',
    '上1下1，等分',
    (w: number, h: number, gap: number, _count: number) => {
      const slotH = (h - gap) / 2
      return [
        new ImageSlot(0, 0, w, slotH),
        new ImageSlot(0, slotH + gap, w, slotH),
      ]
    }
  ),
  new LayoutDefinition(
    'left-right',
    '左右排列',
    '左1右1，等分',
    (w: number, h: number, gap: number, _count: number) => {
      const slotW = (w - gap) / 2
      return [
        new ImageSlot(0, 0, slotW, h),
        new ImageSlot(slotW + gap, 0, slotW, h),
      ]
    }
  ),
  new LayoutDefinition(
    'big-small',
    '一大一小',
    '左7右3',
    (w: number, h: number, gap: number, _count: number) => {
      const leftW = (w - gap) * 0.7
      const rightW = w - gap - leftW
      return [
        new ImageSlot(0, 0, leftW, h),
        new ImageSlot(leftW + gap, 0, rightW, h),
      ]
    }
  ),
  new LayoutDefinition(
    'top-big-bottom-small',
    '上大下小',
    '上7下3',
    (w: number, h: number, gap: number, _count: number) => {
      const topH = (h - gap) * 0.7
      const bottomH = h - gap - topH
      return [
        new ImageSlot(0, 0, w, topH),
        new ImageSlot(0, topH + gap, w, bottomH),
      ]
    }
  ),
  new LayoutDefinition(
    'diagonal',
    '对角排列',
    '左上+右下',
    (w: number, h: number, gap: number, _count: number) => {
      const slotW = (w - gap) / 2
      const slotH = (h - gap) / 2
      return [
        new ImageSlot(0, 0, slotW, slotH),
        new ImageSlot(slotW + gap, slotH + gap, slotW, slotH),
      ]
    }
  ),
]
