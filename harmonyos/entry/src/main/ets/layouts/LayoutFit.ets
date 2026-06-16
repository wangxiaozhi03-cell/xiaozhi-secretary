/**
 * 布局适配计算
 * 移植自 src/layouts/fit.ts
 */
import { ImageSlot } from '../model/Types'

class ImageDimension {
  width: number = 0
  height: number = 0
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }
}

/**
 * 计算统一缩放比
 */
export function computeUniformScale(
  regions: ImageSlot[],
  images: ImageDimension[],
  mode: string = 'fit'
): number {
  let bestRatio: number = mode === 'fit' ? Number.MAX_VALUE : 0

  for (let i = 0; i < regions.length && i < images.length; i++) {
    const region: ImageSlot = regions[i]
    const img: ImageDimension = images[i]
    const ratioW: number = region.width / img.width
    const ratioH: number = region.height / img.height

    if (mode === 'fit') {
      const fitRatio: number = Math.min(ratioW, ratioH)
      bestRatio = Math.min(bestRatio, fitRatio)
    } else {
      const coverRatio: number = Math.max(ratioW, ratioH)
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
 */
export function centerImageInRegion(
  region: ImageSlot,
  imgWidth: number,
  imgHeight: number,
  scale: number
): ImageSlot {
  const renderW: number = imgWidth * scale
  const renderH: number = imgHeight * scale
  return new ImageSlot(
    region.x + (region.width - renderW) / 2,
    region.y + (region.height - renderH) / 2,
    renderW,
    renderH
  )
}
