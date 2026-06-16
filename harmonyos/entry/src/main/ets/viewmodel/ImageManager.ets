/**
 * 图片状态管理
 * 移植自 src/composables/useImages.ts
 */
import { image } from '@kit.ImageKit'
import { fileIo } from '@kit.CoreFileKit'
import { photoAccessHelper } from '@kit.MediaLibraryKit'
import { ImageItem } from '../model/Types'

let nextId: number = 1

@ObservedV2
export class ImageManager {
  @Trace images: ImageItem[] = []

  /**
   * 通过系统图片选择器添加图片
   */
  async addImagesFromPicker(context: Context): Promise<void> {
    try {
      const photoPicker: photoAccessHelper.PhotoViewPicker = new photoAccessHelper.PhotoViewPicker()
      const selectOptions: photoAccessHelper.PhotoSelectOptions = new photoAccessHelper.PhotoSelectOptions()
      selectOptions.MIMEType = photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE
      selectOptions.maxSelectNumber = 20
      const result: photoAccessHelper.PhotoSelectResult = await photoPicker.select(selectOptions)
      const uris: string[] = result.photoUris
      if (uris && uris.length > 0) {
        await this.addImagesFromUris(context, uris)
      }
    } catch (e) {
      console.error('图片选择失败:', String(e))
    }
  }

  /**
   * 从 URI 列表添加图片
   */
  async addImagesFromUris(context: Context, uris: string[]): Promise<void> {
    for (const uri of uris) {
      try {
        // 读取图片元数据
        const source: image.ImageSource = image.createImageSource(uri)
        const imageInfo: image.ImageInfo = await source.getImageInfo()
        const width: number = imageInfo.size.width
        const height: number = imageInfo.size.height

        // 生成缩略图
        const thumbnail: image.PixelMap = await source.createPixelMap({
          desiredSize: { width: 200, height: 200 },
        })
        // 缩略图保存到临时目录
        const thumbPath: string = await this.saveThumbnail(context, thumbnail, nextId)
        thumbnail.release()

        const name: string = this.extractFileName(uri)
        this.images.push(new ImageItem(
          `img-${nextId++}`,
          name,
          uri,
          width,
          height,
          thumbPath
        ))

        source.release()
      } catch (e) {
        console.error('处理图片失败:', uri, String(e))
      }
    }
  }

  /**
   * 保存缩略图到临时目录
   */
  private async saveThumbnail(context: Context, pixelMap: image.PixelMap, id: number): Promise<string> {
    const cacheDir: string = context.cacheDir
    const thumbPath: string = `${cacheDir}/thumb_${id}.jpg`
    const file: fileIo.File = fileIo.openSync(thumbPath, fileIo.OpenMode.CREATE | fileIo.OpenMode.READ_WRITE)
    const imagePacker: image.ImagePacker = image.createImagePacker()
    const packOptions: image.PackingOption = {
      format: 'image/jpeg',
      quality: 80,
    }
    const data: ArrayBuffer = await imagePacker.packing(pixelMap, packOptions)
    fileIo.writeSync(file.fd, data)
    fileIo.closeSync(file)
    imagePacker.release()
    return thumbPath
  }

  /**
   * 从 URI 中提取文件名
   */
  private extractFileName(uri: string): string {
    const parts: string[] = uri.split('/')
    const last: string = parts[parts.length - 1] || 'image'
    return last.split('?')[0]
  }

  /**
   * 移除指定图片
   */
  removeImage(id: string): void {
    this.images = this.images.filter((img: ImageItem) => img.id !== id)
  }

  /**
   * 移除最后一张图片
   */
  removeLastImage(): void {
    if (this.images.length > 0) {
      this.images.pop()
      this.images = [...this.images]
    }
  }

  /**
   * 重新排序图片
   */
  reorderImages(fromIndex: number, toIndex: number): void {
    const arr: ImageItem[] = [...this.images]
    if (fromIndex < 0 || fromIndex >= arr.length) return
    if (toIndex < 0 || toIndex >= arr.length) return
    const item: ImageItem = arr[fromIndex]
    arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, item)
    this.images = arr
  }

  /**
   * 清空所有图片
   */
  clearImages(): void {
    this.images = []
  }
}
