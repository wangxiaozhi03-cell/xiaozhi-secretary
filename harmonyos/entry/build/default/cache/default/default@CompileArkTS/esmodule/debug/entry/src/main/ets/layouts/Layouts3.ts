import { ImageSlot, LayoutDefinition } from "@bundle:com.example.imagetool/entry/ets/model/Types";
export const layouts3: LayoutDefinition[] = [
    new LayoutDefinition('three-horizontal', '三等分横', '一行3张', (w: number, h: number, gap: number, _count: number) => {
        const slotW = (w - gap * 2) / 3;
        return [
            new ImageSlot(0, 0, slotW, h),
            new ImageSlot(slotW + gap, 0, slotW, h),
            new ImageSlot((slotW + gap) * 2, 0, slotW, h),
        ];
    }),
    new LayoutDefinition('three-vertical', '三等分纵', '一列3张', (w: number, h: number, gap: number, _count: number) => {
        const slotH = (h - gap * 2) / 3;
        return [
            new ImageSlot(0, 0, w, slotH),
            new ImageSlot(0, slotH + gap, w, slotH),
            new ImageSlot(0, (slotH + gap) * 2, w, slotH),
        ];
    }),
    new LayoutDefinition('one-top-two-bottom', '一上两下', '上大+下两小', (w: number, h: number, gap: number, _count: number) => {
        const topH = (h - gap) * 0.6;
        const bottomH = h - gap - topH;
        const slotW = (w - gap) / 2;
        return [
            new ImageSlot(0, 0, w, topH),
            new ImageSlot(0, topH + gap, slotW, bottomH),
            new ImageSlot(slotW + gap, topH + gap, slotW, bottomH),
        ];
    }),
    new LayoutDefinition('two-top-one-bottom', '两上一下', '上两小+下大', (w: number, h: number, gap: number, _count: number) => {
        const topH = (h - gap) * 0.4;
        const bottomH = h - gap - topH;
        const slotW = (w - gap) / 2;
        return [
            new ImageSlot(0, 0, slotW, topH),
            new ImageSlot(slotW + gap, 0, slotW, topH),
            new ImageSlot(0, topH + gap, w, bottomH),
        ];
    }),
    new LayoutDefinition('one-big-two-small-right', '一大两小', '左大+右两小', (w: number, h: number, gap: number, _count: number) => {
        const leftW = (w - gap) * 0.65;
        const rightW = w - gap - leftW;
        const slotH = (h - gap) / 2;
        return [
            new ImageSlot(0, 0, leftW, h),
            new ImageSlot(leftW + gap, 0, rightW, slotH),
            new ImageSlot(leftW + gap, slotH + gap, rightW, slotH),
        ];
    }),
];
