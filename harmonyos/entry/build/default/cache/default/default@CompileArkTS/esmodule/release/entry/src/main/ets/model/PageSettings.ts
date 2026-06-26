export type PaperSize = 'A4' | 'A3' | 'Letter';
export type Orientation = 'portrait' | 'landscape';
export type GapMode = 'gapped' | 'edge-to-edge';
export type LayoutKey = 1 | 2 | 3 | 4 | 6 | 9;
export class PaperDimension {
    width: number = 0;
    height: number = 0;
    constructor(m: number, n: number) {
        this.width = m;
        this.height = n;
    }
}
export class PageSettingsData {
    paperSize: PaperSize = 'A4';
    orientation: Orientation = 'landscape';
    gapMode: GapMode = 'gapped';
    gapMm: number = 8;
    imagesPerPage: LayoutKey | null = null;
}
const PAPER_A4 = new PaperDimension(210, 297);
const PAPER_A3 = new PaperDimension(297, 420);
const PAPER_LETTER = new PaperDimension(215.9, 279.4);
export function getPaperDimensions(j: PaperSize, k: Orientation): PaperDimension {
    let l: PaperDimension;
    if (j === 'A3') {
        l = PAPER_A3;
    }
    else if (j === 'Letter') {
        l = PAPER_LETTER;
    }
    else {
        l = PAPER_A4;
    }
    if (k === 'landscape') {
        return new PaperDimension(l.height, l.width);
    }
    return new PaperDimension(l.width, l.height);
}
export const PAGE_MARGIN_MM: number = 10;
