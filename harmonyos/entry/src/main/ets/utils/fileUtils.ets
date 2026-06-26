import photoAccessHelper from '@ohos.file.photoAccessHelper';
import picker from '@ohos.file.picker';
import image from '@ohos.multimedia.image';

/** 图片元数据接口 */
interface ImageMetadata {
  width: number;
  height: number;
}

/**
 * 选择图片
 * @returns 选中图片的 URI 列表
 */
export async function pickImages(): Promise<string[]> {
  try {
    let photoPicker = new photoAccessHelper.PhotoViewPicker();
    let result = await photoPicker.select({
      MIMEType: photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE,
      maxSelectNumber: 9
    });
    console.info(`[pickImages] result: ${JSON.stringify(result)}`);
    if (!result || !result.photoUris || result.photoUris.length === 0) {
      console.warn('[pickImages] no images selected');
      return [];
    }
    console.info(`[pickImages] picked ${result.photoUris.length} images`);
    return result.photoUris;
  } catch (err) {
    console.error(`[pickImages] error: ${err}`);
    console.error(`[pickImages] error detail: ${JSON.stringify(err)}`);
    return [];
  }
}

/**
 * 获取图片元数据（宽高）
 */
export async function getImageMetadata(uri: string): Promise<ImageMetadata | null> {
  try {
    console.info(`[getImageMetadata] uri: ${uri}`);
    let imageSource = image.createImageSource(uri);
    if (!imageSource) {
      console.error('[getImageMetadata] createImageSource returned null');
      return null;
    }
    return new Promise((resolve) => {
      imageSource.getImageInfo((err: Error, imageInfo: image.ImageInfo) => {
        if (err) {
          console.error(`[getImageInfo] error: ${JSON.stringify(err)}`);
          resolve(null);
          return;
        }
        if (!imageInfo) {
          console.error('[getImageInfo] imageInfo is null');
          resolve(null);
          return;
        }
        if (!imageInfo.size) {
          console.error('[getImageInfo] imageInfo.size is null');
          resolve(null);
          return;
        }
        console.info(`[getImageInfo] ok: ${imageInfo.size.width}x${imageInfo.size.height}`);
        resolve({
          width: imageInfo.size.width,
          height: imageInfo.size.height
        });
      });
    });
  } catch (err) {
    console.error(`[getImageMetadata] exception: ${err}`);
    return null;
  }
}

/**
 * 获取图片名称（从 URI 中提取）
 */
export function getImageName(uri: string): string {
  const parts: string[] = uri.split('/');
  const name: string = parts[parts.length - 1] || 'image';
  // 去除可能的查询参数
  const queryIdx: number = name.indexOf('?');
  return queryIdx > 0 ? name.substring(0, queryIdx) : name;
}

/**
 * 保存文件（导出用）
 * @param fileName 文件名
 * @returns 保存的 URI，失败返回 null
 */
export async function saveFile(fileName: string): Promise<string | null> {
  try {
    let documentPicker = new picker.DocumentViewPicker();
    let saveResult = await documentPicker.save({
      newFileNames: [fileName]
    });
    if (saveResult && saveResult.length > 0) {
      return saveResult[0];
    }
    return null;
  } catch (err) {
    console.error(`[saveFile] error: ${err}`);
    return null;
  }
}
