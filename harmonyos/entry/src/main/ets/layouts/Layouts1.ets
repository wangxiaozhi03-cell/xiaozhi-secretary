/**
 * 1张图片的布局定义
 * 移植自 src/layouts/layouts-1.ts
 */
import { ImageSlot, LayoutDefinition } from '../model/Types'

function fullPage(pageW: number, pageH: number): ImageSlot[] {
  return [new ImageSlot(0, 0, pageW, pageH)]
}

export const layouts1: LayoutDefinition[] = [
  new LayoutDefinition(
    'center-fit',
    '居中适配',
    '等比缩放，可能留白',
    (w: number, h: number, _gap: number, _count: number) => fullPage(w, h)
  ),
  new LayoutDefinition(
    'fill-page',
    '填满页面',
    '等比缩放，居中裁剪',
    (w: number, h: number, _gap: number, _count: number) => fullPage(w, h)
  ),
]
