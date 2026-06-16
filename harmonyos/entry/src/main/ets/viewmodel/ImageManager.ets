/**
 * 图片状态管理
 * 移植自 src/composables/useImages.ts
 * 鸿蒙版使用 @ObservedV2 + @Trace 实现响应式
 */
import { image } from '@kit.ImageKit'
import { photoAccessHelper } from '@kit.MediaLibraryKit'
import { fileIo } from '@kit.CoreFileKit'
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
      const helper = photoAccessHelper.getPhotoAccessHelper(context)
      const selectOptions: photoAccessHelper.PhotoSelectOptions = {
        MIMEType: photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE,
        maxSelectNumber: 20,
      }
      const uris = await helper.select(selectOptions)
      if (uris && uris.length > 0) {
        await this.addImagesFromUris(context, uris)
      }
    } catch (e) {
      console.error('图片选择失败:', JSON.stringify(e))
    }
  }

  /**
   * 从 URI 列表添加图片
   */
  async addImagesFromUris(context: Context, uris: string[]): Promise<void> {
    for (const uri of uris) {
      try {
        // 读取图片元数据
        const source = image.createImageSource(uri)
        const imageInfo = await source.getImageInfo()
        const width = imageInfo.size.width
        const height = imageInfo.size.height

        // 生成缩略图
        const thumbnail = await source.createPixelMap({
          desiredSize: { width: 200, height: 200 },
        })
        // 缩略图保存到临时目录，获取路径
        const thumbPath = await this.saveThumbnail(context, thumbnail, nextId)
        thumbnail.release()

        const name = this.extractFileName(uri)
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
        console.error('处理图片失败:', uri, JSON.stringify(e))
      }
    }
  }

  /**
   * 保存缩略图到临时目录
   */
  private async saveThumbnail(context: Context, pixelMap: image.PixelMap, id: number): Promise<string> {
    const cacheDir = context.cacheDir
    const thumbPath = `${cacheDir}/thumb_${id}.jpg`
    const file = fileIo.openSync(thumbPath, fileIo.OpenMode.CREATE | fileIo.OpenMode.READ_WRITE)
    const imagePacker = image.createImagePacker()
    const packOptions: image.PackingOption = {
      format: 'image/jpeg',
      quality: 80,
    }
    const data = await imagePacker.packing(pixelMap, packOptions)
    fileIo.writeSync(file.fd, data)
    fileIo.closeSync(file)
    imagePacker.release()
    return thumbPath
  }

  /**
   * 从 URI 中提取文件名
   */
  private extractFileName(uri: string): string {
    const parts = uri.split('/')
    const last = parts[parts.length - 1] || 'image'
    // 去除查询参数
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
      // 触发重新赋值以更新 UI
      this.images = [...this.images]
    }
  }

  /**
   * 重新排序图片
   */
  reorderImages(fromIndex: number, toIndex: number): void {
    const arr = [...this.images]
    if (fromIndex < 0 || fromIndex >= arr.length) return
    if (toIndex < 0 || toIndex >= arr.length) return
    const item = arr[fromIndex]
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
