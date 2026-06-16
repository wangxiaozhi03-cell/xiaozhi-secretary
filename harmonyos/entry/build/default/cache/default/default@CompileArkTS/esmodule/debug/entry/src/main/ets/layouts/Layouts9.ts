import { ImageSlot, LayoutDefinition } from "@bundle:com.example.imagetool/entry/ets/model/Types";
export const layouts9: LayoutDefinition[] = [
    new LayoutDefinition('grid-3x3', '3×3 网格', '标准九宫格', (w: number, h: number, gap: number, _count: number) => {
        const slotW = (w - gap * 2) / 3;
        const slotH = (h - gap * 2) / 3;
        const slots: ImageSlot[] = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                slots.push(new ImageSlot(col * (slotW + gap), row * (slotH + gap), slotW, slotH));
            }
        }
        return slots;
    }),
    new LayoutDefinition('one-big-eight-surround', '一大八小', '中心大+8环绕', (w: number, h: number, gap: number, _count: number) => {
        const edgeW = (w - gap * 2) * 0.2;
        const centerW = w - gap * 2 - edgeW * 2;
        const edgeH = (h - gap * 2) * 0.2;
        const centerH = h - gap * 2 - edgeH * 2;
        return [
            // top row
            new ImageSlot(0, 0, edgeW, edgeH),
            new ImageSlot(edgeW + gap, 0, centerW, edgeH),
            new ImageSlot(edgeW + centerW + gap * 2, 0, edgeW, edgeH),
            // middle row
            new ImageSlot(0, edgeH + gap, edgeW, centerH),
            new ImageSlot(edgeW + gap, edgeH + gap, centerW, centerH),
            new ImageSlot(edgeW + centerW + gap * 2, edgeH + gap, edgeW, centerH),
            // bottom row
            new ImageSlot(0, edgeH + centerH + gap * 2, edgeW, edgeH),
            new ImageSlot(edgeW + gap, edgeH + centerH + gap * 2, centerW, edgeH),
            new ImageSlot(edgeW + centerW + gap * 2, edgeH + centerH + gap * 2, edgeW, edgeH),
        ];
    }),
];
