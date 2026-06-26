import type { ImageSlot } from '../types/index';
class ImageSizeInfo {
    width: number = 0;
    height: number = 0;
    constructor(i20: number, j20: number) {
        this.width = i20;
        this.height = j20;
    }
}
export function computeUniformScale(x19: ImageSlot[], y19: ImageSizeInfo[], z19: "fit" | "cover" = "fit"): number {
    let a20 = z19 === "fit" ? Infinity : 0;
    for (let b20 = 0; b20 < x19.length && b20 < y19.length; b20++) {
        const c20: ImageSlot = x19[b20];
        const d20: ImageSizeInfo = y19[b20];
        const e20: number = c20.width / d20.width;
        const f20: number = c20.height / d20.height;
        if (z19 === "fit") {
            const h20: number = Math.min(e20, f20);
            a20 = Math.min(a20, h20);
        }
        else {
            const g20: number = Math.max(e20, f20);
            a20 = Math.max(a20, g20);
        }
    }
    if (z19 === "fit") {
        return a20 === Infinity ? 1 : a20;
    }
    return a20 === 0 ? 1 : a20;
}
export function centerImageInRegion(r19: ImageSlot, s19: number, t19: number, u19: number): ImageSlot {
    const v19: number = s19 * u19;
    const w19: number = t19 * u19;
    return {
        x: r19.x + (r19.width - v19) / 2,
        y: r19.y + (r19.height - w19) / 2,
        width: v19,
        height: w19,
    };
}
