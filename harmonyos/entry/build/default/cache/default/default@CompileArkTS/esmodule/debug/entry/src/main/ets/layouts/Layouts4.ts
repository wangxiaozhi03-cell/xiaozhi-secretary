import { ImageSlot, LayoutDefinition } from "@bundle:com.example.imagetool/entry/ets/model/Types";
export const layouts4: LayoutDefinition[] = [
    new LayoutDefinition('grid-2x2', '田字格', '2×2 网格', (w: number, h: number, gap: number, _count: number) => {
        const slotW = (w - gap) / 2;
        const slotH = (h - gap) / 2;
        return [
            new ImageSlot(0, 0, slotW, slotH),
            new ImageSlot(slotW + gap, 0, slotW, slotH),
            new ImageSlot(0, slotH + gap, slotW, slotH),
            new ImageSlot(slotW + gap, slotH + gap, slotW, slotH),
        ];
    }),
    new LayoutDefinition('four-vertical', '竖排四张', '4行×1列', (w: number, h: number, gap: number, _count: number) => {
        const slotH = (h - gap * 3) / 4;
        return [
            new ImageSlot(0, 0, w, slotH),
            new ImageSlot(0, slotH + gap, w, slotH),
            new ImageSlot(0, (slotH + gap) * 2, w, slotH),
            new ImageSlot(0, (slotH + gap) * 3, w, slotH),
        ];
    }),
    new LayoutDefinition('four-horizontal', '横排四张', '1行×4列', (w: number, h: number, gap: number, _count: number) => {
        const slotW = (w - gap * 3) / 4;
        return [
            new ImageSlot(0, 0, slotW, h),
            new ImageSlot(slotW + gap, 0, slotW, h),
            new ImageSlot((slotW + gap) * 2, 0, slotW, h),
            new ImageSlot((slotW + gap) * 3, 0, slotW, h),
        ];
    }),
    new LayoutDefinition('one-left-three-right', '一左三右', '左大+右3小', (w: number, h: number, gap: number, _count: number) => {
        const leftW = (w - gap) * 0.6;
        const rightW = w - gap - leftW;
        const slotH = (h - gap * 2) / 3;
        return [
            new ImageSlot(0, 0, leftW, h),
            new ImageSlot(leftW + gap, 0, rightW, slotH),
            new ImageSlot(leftW + gap, slotH + gap, rightW, slotH),
            new ImageSlot(leftW + gap, (slotH + gap) * 2, rightW, slotH),
        ];
    }),
    new LayoutDefinition('one-top-three-bottom', '一上三下', '上大+下3小', (w: number, h: number, gap: number, _count: number) => {
        const topH = (h - gap) * 0.55;
        const bottomH = h - gap - topH;
        const slotW = (w - gap * 2) / 3;
        return [
            new ImageSlot(0, 0, w, topH),
            new ImageSlot(0, topH + gap, slotW, bottomH),
            new ImageSlot(slotW + gap, topH + gap, slotW, bottomH),
            new ImageSlot((slotW + gap) * 2, topH + gap, slotW, bottomH),
        ];
    }),
    new LayoutDefinition('collage', '铺满拼贴', '无间距紧密', (w: number, h: number, gap: number, _count: number) => {
        const g = gap;
        const leftW = (w - g) * 0.6;
        const rightW = w - g - leftW;
        const leftTopH = (h - g) / 2;
        const leftBottomH = h - g - leftTopH;
        const rightTopH = (h - g) / 2;
        const rightBottomH = h - g - rightTopH;
        return [
            new ImageSlot(0, 0, leftW, leftTopH),
            new ImageSlot(leftW + g, 0, rightW, rightTopH),
            new ImageSlot(0, leftTopH + g, leftW, leftBottomH),
            new ImageSlot(leftW + g, rightTopH + g, rightW, rightBottomH),
        ];
    }),
    new LayoutDefinition('surround', '环绕布局', '中心大+3小', (w: number, h: number, gap: number, _count: number) => {
        const centerW = (w - gap * 2) * 0.5;
        const sideW = (w - gap * 2 - centerW) / 2;
        const centerH = (h - gap * 2) * 0.5;
        const sideH = (h - gap * 2 - centerH) / 2;
        return [
            new ImageSlot(0, 0, sideW, sideH),
            new ImageSlot(sideW + gap, 0, centerW, centerH),
            new ImageSlot(sideW + centerW + gap * 2, 0, sideW, sideH),
            new ImageSlot(0, sideH + gap, sideW, sideH),
        ];
    }),
];
