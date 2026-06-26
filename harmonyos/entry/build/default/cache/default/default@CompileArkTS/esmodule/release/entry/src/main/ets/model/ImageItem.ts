export class ImageItemData {
    id: string = '';
    name: string = '';
    path: string = '';
    uri: string = '';
    width: number = 0;
    height: number = 0;
    thumbUrl: string = '';
    constructor(e: string, f: string, g: string, h: number, i: number) {
        this.id = e;
        this.name = f;
        this.uri = g;
        this.width = h;
        this.height = i;
    }
}
