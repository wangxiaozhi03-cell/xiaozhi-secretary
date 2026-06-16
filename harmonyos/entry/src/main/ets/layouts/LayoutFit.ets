/**
 * 布局适配计算
 * 移植自 src/layouts/fit.ts
 */
import { ImageSlot } from '../model/Types'

/**
 * 计算统一缩放比
 * @param mode 'fit' = 图片完整显示在区域内（可能留白）
 *             'cover' = 图片填满区域（可能裁剪）
 */
export function computeUniformScale(
  regions: ImageSlot[],
  images: Array<{ width: number; height: number }>,
  mode: string = 'fit'
): number {
  let bestRatio: number = mode === 'fit' ? Number.MAX_VALUE : 0

  for (let i = 0; i < regions.length && i < images.length; i++) {
    const region = regions[i]
    const img = images[i]
    const ratioW = region.width / img.width
    const ratioH = region.height / img.height

    if (mode === 'fit') {
      const fitRatio = Math.min(ratioW, ratioH)
      bestRatio = Math.min(bestRatio, fitRatio)
    } else {
      const coverRatio = Math.max(ratioW, ratioH)
      bestRatio = Math.max(bestRatio, coverRatio)
    }
  }

  if (mode === 'fit') {
    return bestRatio === Number.MAX_VALUE ? 1 : bestRatio
  }
  return bestRatio === 0 ? 1 : bestRatio
}

/**
 * 计算图片在区域中的居中位置
 * 返回实际渲染的 x, y, width, height
 */
export function centerImageInRegion(
  region: ImageSlot,
  imgWidth: number,
  imgHeight: number,
  scale: number
): ImageSlot {
  const renderW = imgWidth * scale
  const renderH = imgHeight * scale
  return new ImageSlot(
    region.x + (region.width - renderW) / 2,
    region.y + (region.height - renderH) / 2,
    renderW,
    renderH
  )
}
