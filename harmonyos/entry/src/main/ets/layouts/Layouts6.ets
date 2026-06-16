/**
 * 6张图片的布局定义
 * 移植自 src/layouts/layouts-6.ts
 */
import { ImageSlot, LayoutDefinition } from '../model/Types'

export const layouts6: LayoutDefinition[] = [
  new LayoutDefinition(
    'grid-2x3',
    '2×3 网格',
    '2行3列',
    (w: number, h: number, gap: number, _count: number) => {
      const slotW = (w - gap * 2) / 3
      const slotH = (h - gap) / 2
      const slots: ImageSlot[] = []
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          slots.push(new ImageSlot(
            col * (slotW + gap),
            row * (slotH + gap),
            slotW,
            slotH
          ))
        }
      }
      return slots
    }
  ),
  new LayoutDefinition(
    'grid-3x2',
    '3×2 网格',
    '3行2列',
    (w: number, h: number, gap: number, _count: number) => {
      const slotW = (w - gap) / 2
      const slotH = (h - gap * 2) / 3
      const slots: ImageSlot[] = []
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          slots.push(new ImageSlot(
            col * (slotW + gap),
            row * (slotH + gap),
            slotW,
            slotH
          ))
        }
      }
      return slots
    }
  ),
  new LayoutDefinition(
    'one-top-five-bottom',
    '一上五下',
    '大图+5小图',
    (w: number, h: number, gap: number, _count: number) => {
      const topH = (h - gap) * 0.45
      const bottomH = h - gap - topH
      const slotW = (w - gap * 4) / 5
      const slots: ImageSlot[] = [new ImageSlot(0, 0, w, topH)]
      for (let i = 0; i < 5; i++) {
        slots.push(new ImageSlot(i * (slotW + gap), topH + gap, slotW, bottomH))
      }
      return slots
    }
  ),
]
