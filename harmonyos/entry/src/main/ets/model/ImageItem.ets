/**
 * 图片数据模型
 */
export class ImageItemData {
  id: string = '';
  name: string = '';
  path: string = '';
  uri: string = '';
  width: number = 0;
  height: number = 0;
  thumbUrl: string = '';

  constructor(id: string, name: string, uri: string, width: number, height: number) {
    this.id = id;
    this.name = name;
    this.uri = uri;
    this.width = width;
    this.height = height;
  }
}
