/**
 * 纸张尺寸定义
 * 移植自 src/types/papers.ts
 */
class PaperDimension {
    width: number = 0;
    height: number = 0;
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}
// 纸张尺寸（毫米）
const PAPER_A4: PaperDimension = new PaperDimension(210, 297);
const PAPER_A3: PaperDimension = new PaperDimension(297, 420);
const PAPER_LETTER: PaperDimension = new PaperDimension(215.9, 279.4);
function getPaperDim(size: string): PaperDimension {
    if (size === 'A4')
        return PAPER_A4;
    if (size === 'A3')
        return PAPER_A3;
    if (size === 'Letter')
        return PAPER_LETTER;
    return PAPER_A4;
}
/** 获取纸张尺寸（考虑方向） */
export function getPaperDimensions(size: string, orientation: string): PaperDimension {
    const dim: PaperDimension = getPaperDim(size);
    if (orientation === 'landscape') {
        return new PaperDimension(dim.height, dim.width);
    }
    return new PaperDimension(dim.width, dim.height);
}
/** 页面边距（mm） */
export const PAGE_MARGIN_MM: number = 10;
