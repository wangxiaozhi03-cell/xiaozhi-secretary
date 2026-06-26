import photoAccessHelper from "@ohos:file.photoAccessHelper";
import picker from "@ohos:file.picker";
import image from "@ohos:multimedia.image";
interface ImageMetadata {
    width: number;
    height: number;
}
export async function pickImages(): Promise<string[]> {
    try {
        let n29 = new photoAccessHelper.PhotoViewPicker();
        let o29 = await n29.select({
            MIMEType: photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE,
            maxSelectNumber: 9
        });
        console.info(`[pickImages] result: ${JSON.stringify(o29)}`);
        if (!o29 || !o29.photoUris || o29.photoUris.length === 0) {
            console.warn('[pickImages] no images selected');
            return [];
        }
        console.info(`[pickImages] picked ${o29.photoUris.length} images`);
        return o29.photoUris;
    }
    catch (m29) {
        console.error(`[pickImages] error: ${m29}`);
        console.error(`[pickImages] error detail: ${JSON.stringify(m29)}`);
        return [];
    }
}
export async function getImageMetadata(g29: string): Promise<ImageMetadata | null> {
    try {
        console.info(`[getImageMetadata] uri: ${g29}`);
        let i29 = image.createImageSource(g29);
        if (!i29) {
            console.error('[getImageMetadata] createImageSource returned null');
            return null;
        }
        return new Promise((j29) => {
            i29.getImageInfo((k29: Error, l29: image.ImageInfo) => {
                if (k29) {
                    console.error(`[getImageInfo] error: ${JSON.stringify(k29)}`);
                    j29(null);
                    return;
                }
                if (!l29) {
                    console.error('[getImageInfo] imageInfo is null');
                    j29(null);
                    return;
                }
                if (!l29.size) {
                    console.error('[getImageInfo] imageInfo.size is null');
                    j29(null);
                    return;
                }
                console.info(`[getImageInfo] ok: ${l29.size.width}x${l29.size.height}`);
                j29({
                    width: l29.size.width,
                    height: l29.size.height
                });
            });
        });
    }
    catch (h29) {
        console.error(`[getImageMetadata] exception: ${h29}`);
        return null;
    }
}
export function getImageName(c29: string): string {
    const d29: string[] = c29.split('/');
    const e29: string = d29[d29.length - 1] || 'image';
    const f29: number = e29.indexOf('?');
    return f29 > 0 ? e29.substring(0, f29) : e29;
}
export async function saveFile(y28: string): Promise<string | null> {
    try {
        let a29 = new picker.DocumentViewPicker();
        let b29 = await a29.save({
            newFileNames: [y28]
        });
        if (b29 && b29.length > 0) {
            return b29[0];
        }
        return null;
    }
    catch (z28) {
        console.error(`[saveFile] error: ${z28}`);
        return null;
    }
}
