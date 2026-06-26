import { ImageSlot } from '../types/index';

/** 图片尺寸信息 */
class ImageSizeInfo {
  width: number = 0;
  height: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

/**
 * 计算统一缩放比
 * @param mode 'fit' = 图片完整显示在区域内（可能留白）
 *             'cover' = 图片填满区域（可能裁剪）
 */
export function computeUniformScale(
  regions: ImageSlot[],
  images: ImageSizeInfo[],
  mode: "fit" | "cover" = "fit"
): number {
  let bestRatio = mode === "fit" ? Infinity : 0;

  for (let i = 0; i < regions.length && i < images.length; i++) {
    const region: ImageSlot = regions[i];
    const img: ImageSizeInfo = images[i];
    const ratioW: number = region.width / img.width;
    const ratioH: number = region.height / img.height;

    if (mode === "fit") {
      const fitRatio: number = Math.min(ratioW, ratioH);
      bestRatio = Math.min(bestRatio, fitRatio);
    } else {
      const coverRatio: number = Math.max(ratioW, ratioH);
      bestRatio = Math.max(bestRatio, coverRatio);
    }
  }

  if (mode === "fit") {
    return bestRatio === Infinity ? 1 : bestRatio;
  }
  return bestRatio === 0 ? 1 : bestRatio;
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
  const renderW: number = imgWidth * scale;
  const renderH: number = imgHeight * scale;
  return {
    x: region.x + (region.width - renderW) / 2,
    y: region.y + (region.height - renderH) / 2,
    width: renderW,
    height: renderH,
  };
}
