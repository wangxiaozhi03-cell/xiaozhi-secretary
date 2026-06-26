import type { LayoutKey, LayoutDefinition, ImageSlot } from '../types/index';
function fullPage(m25: number, n25: number): ImageSlot[] {
    return [{ x: 0, y: 0, width: m25, height: n25 }];
}
const layouts1: LayoutDefinition[] = [
    { id: "center-fit", name: "居中适配", description: "等比缩放，可能留白", computeSlots: fullPage },
    { id: "fill-page", name: "填满页面", description: "等比缩放，居中裁剪", computeSlots: fullPage },
];
function topBottom(i25: number, j25: number, k25: number): ImageSlot[] {
    const l25 = (j25 - k25) / 2;
    return [
        { x: 0, y: 0, width: i25, height: l25 },
        { x: 0, y: l25 + k25, width: i25, height: l25 },
    ];
}
function leftRight(e25: number, f25: number, g25: number): ImageSlot[] {
    const h25 = (e25 - g25) / 2;
    return [
        { x: 0, y: 0, width: h25, height: f25 },
        { x: h25 + g25, y: 0, width: h25, height: f25 },
    ];
}
function bigSmall(z24: number, a25: number, b25: number): ImageSlot[] {
    const c25 = z24 * 0.65;
    const d25 = z24 - c25 - b25;
    return [
        { x: 0, y: 0, width: c25, height: a25 },
        { x: c25 + b25, y: 0, width: d25, height: a25 },
    ];
}
function topBigBottomSmall(u24: number, v24: number, w24: number): ImageSlot[] {
    const x24 = v24 * 0.65;
    const y24 = v24 - x24 - w24;
    return [
        { x: 0, y: 0, width: u24, height: x24 },
        { x: 0, y: x24 + w24, width: u24, height: y24 },
    ];
}
function diagonal(p24: number, q24: number, r24: number): ImageSlot[] {
    const s24 = (p24 - r24) / 2;
    const t24 = (q24 - r24) / 2;
    return [
        { x: 0, y: 0, width: s24, height: t24 },
        { x: s24 + r24, y: t24 + r24, width: s24, height: t24 },
    ];
}
const layouts2: LayoutDefinition[] = [
    { id: "top-bottom", name: "上下排列", description: "两张图片上下排列", computeSlots: topBottom },
    { id: "left-right", name: "左右排列", description: "两张图片左右排列", computeSlots: leftRight },
    { id: "big-small", name: "大小排列", description: "左大右小", computeSlots: bigSmall },
    { id: "top-big-bottom-small", name: "上大下小", description: "上大下小", computeSlots: topBigBottomSmall },
    { id: "diagonal", name: "对角排列", description: "左上和右下", computeSlots: diagonal },
];
function threeHorizontal(l24: number, m24: number, n24: number): ImageSlot[] {
    const o24 = (l24 - n24 * 2) / 3;
    return [
        { x: 0, y: 0, width: o24, height: m24 },
        { x: o24 + n24, y: 0, width: o24, height: m24 },
        { x: (o24 + n24) * 2, y: 0, width: o24, height: m24 },
    ];
}
function threeVertical(h24: number, i24: number, j24: number): ImageSlot[] {
    const k24 = (i24 - j24 * 2) / 3;
    return [
        { x: 0, y: 0, width: h24, height: k24 },
        { x: 0, y: k24 + j24, width: h24, height: k24 },
        { x: 0, y: (k24 + j24) * 2, width: h24, height: k24 },
    ];
}
function oneTopTwoBottom(b24: number, c24: number, d24: number): ImageSlot[] {
    const e24 = c24 * 0.55;
    const f24 = c24 - e24 - d24;
    const g24 = (b24 - d24) / 2;
    return [
        { x: 0, y: 0, width: b24, height: e24 },
        { x: 0, y: e24 + d24, width: g24, height: f24 },
        { x: g24 + d24, y: e24 + d24, width: g24, height: f24 },
    ];
}
function twoTopOneBottom(v23: number, w23: number, x23: number): ImageSlot[] {
    const y23 = w23 * 0.55;
    const z23 = w23 - y23 - x23;
    const a24 = (v23 - x23) / 2;
    return [
        { x: 0, y: 0, width: a24, height: z23 },
        { x: a24 + x23, y: 0, width: a24, height: z23 },
        { x: 0, y: z23 + x23, width: v23, height: y23 },
    ];
}
function oneBigTwoSmallRight(p23: number, q23: number, r23: number): ImageSlot[] {
    const s23 = p23 * 0.6;
    const t23 = p23 - s23 - r23;
    const u23 = (q23 - r23) / 2;
    return [
        { x: 0, y: 0, width: s23, height: q23 },
        { x: s23 + r23, y: 0, width: t23, height: u23 },
        { x: s23 + r23, y: u23 + r23, width: t23, height: u23 },
    ];
}
const layouts3: LayoutDefinition[] = [
    { id: "three-horizontal", name: "三横排", description: "三张图片横向排列", computeSlots: threeHorizontal },
    { id: "three-vertical", name: "三竖排", description: "三张图片纵向排列", computeSlots: threeVertical },
    { id: "one-top-two-bottom", name: "上一下二", description: "上一张下两张", computeSlots: oneTopTwoBottom },
    { id: "two-top-one-bottom", name: "上二下一", description: "上两张下一张", computeSlots: twoTopOneBottom },
    { id: "one-big-two-small-right", name: "左大右小", description: "左侧大图右侧两张小图", computeSlots: oneBigTwoSmallRight },
];
function grid2x2(k23: number, l23: number, m23: number): ImageSlot[] {
    const n23 = (k23 - m23) / 2;
    const o23 = (l23 - m23) / 2;
    return [
        { x: 0, y: 0, width: n23, height: o23 },
        { x: n23 + m23, y: 0, width: n23, height: o23 },
        { x: 0, y: o23 + m23, width: n23, height: o23 },
        { x: n23 + m23, y: o23 + m23, width: n23, height: o23 },
    ];
}
function fourVertical(g23: number, h23: number, i23: number): ImageSlot[] {
    const j23 = (h23 - i23 * 3) / 4;
    return [
        { x: 0, y: 0, width: g23, height: j23 },
        { x: 0, y: j23 + i23, width: g23, height: j23 },
        { x: 0, y: (j23 + i23) * 2, width: g23, height: j23 },
        { x: 0, y: (j23 + i23) * 3, width: g23, height: j23 },
    ];
}
function fourHorizontal(c23: number, d23: number, e23: number): ImageSlot[] {
    const f23 = (c23 - e23 * 3) / 4;
    return [
        { x: 0, y: 0, width: f23, height: d23 },
        { x: f23 + e23, y: 0, width: f23, height: d23 },
        { x: (f23 + e23) * 2, y: 0, width: f23, height: d23 },
        { x: (f23 + e23) * 3, y: 0, width: f23, height: d23 },
    ];
}
function oneLeftThreeRight(w22: number, x22: number, y22: number): ImageSlot[] {
    const z22 = w22 * 0.55;
    const a23 = w22 - z22 - y22;
    const b23 = (x22 - y22 * 2) / 3;
    return [
        { x: 0, y: 0, width: z22, height: x22 },
        { x: z22 + y22, y: 0, width: a23, height: b23 },
        { x: z22 + y22, y: b23 + y22, width: a23, height: b23 },
        { x: z22 + y22, y: (b23 + y22) * 2, width: a23, height: b23 },
    ];
}
function oneTopThreeBottom(q22: number, r22: number, s22: number): ImageSlot[] {
    const t22 = r22 * 0.55;
    const u22 = r22 - t22 - s22;
    const v22 = (q22 - s22 * 2) / 3;
    return [
        { x: 0, y: 0, width: q22, height: t22 },
        { x: 0, y: t22 + s22, width: v22, height: u22 },
        { x: v22 + s22, y: t22 + s22, width: v22, height: u22 },
        { x: (v22 + s22) * 2, y: t22 + s22, width: v22, height: u22 },
    ];
}
function threeTopOneLeft(j22: number, k22: number, l22: number): ImageSlot[] {
    const m22 = k22 * 0.5;
    const n22 = k22 - m22 - l22;
    const o22 = (j22 - l22 * 2) / 3;
    const p22 = (j22 - l22) / 2;
    return [
        { x: 0, y: 0, width: o22, height: m22 },
        { x: o22 + l22, y: 0, width: o22, height: m22 },
        { x: (o22 + l22) * 2, y: 0, width: o22, height: m22 },
        { x: 0, y: m22 + l22, width: p22, height: n22 },
    ];
}
function collage(d22: number, e22: number, f22: number): ImageSlot[] {
    const g22 = d22 * 0.6;
    const h22 = d22 - g22 - f22;
    const i22 = (e22 - f22) / 2;
    return [
        { x: 0, y: 0, width: g22, height: e22 },
        { x: g22 + f22, y: 0, width: h22, height: i22 },
        { x: g22 + f22, y: i22 + f22, width: h22, height: i22 },
    ];
}
function surround(y21: number, z21: number, a22: number): ImageSlot[] {
    const b22 = (y21 - a22 * 2) / 3;
    const c22 = (z21 - a22) / 2;
    return [
        { x: 0, y: 0, width: b22, height: c22 },
        { x: b22 + a22, y: 0, width: b22, height: c22 },
        { x: (b22 + a22) * 2, y: 0, width: b22, height: c22 },
        { x: 0, y: c22 + a22, width: b22, height: c22 },
        { x: (b22 + a22) * 2, y: c22 + a22, width: b22, height: c22 },
    ];
}
const layouts4: LayoutDefinition[] = [
    { id: "grid-2x2", name: "2×2 网格", description: "四张图片网格排列", computeSlots: grid2x2 },
    { id: "four-vertical", name: "四竖排", description: "四张图片纵向排列", computeSlots: fourVertical },
    { id: "four-horizontal", name: "四横排", description: "四张图片横向排列", computeSlots: fourHorizontal },
    { id: "one-left-three-right", name: "左一右三", description: "左侧大图右侧三张小图", computeSlots: oneLeftThreeRight },
    { id: "one-top-three-bottom", name: "上一下三", description: "上一张下三张", computeSlots: oneTopThreeBottom },
    { id: "three-top-one-left", name: "上三下一左", description: "上三张下一张左对齐", computeSlots: threeTopOneLeft },
    { id: "collage", name: "拼贴", description: "左大右两小", computeSlots: collage },
    { id: "surround", name: "环绕", description: "五张环绕排列", computeSlots: surround },
];
function grid2x3(q21: number, r21: number, s21: number): ImageSlot[] {
    const t21 = (q21 - s21 * 2) / 3;
    const u21 = (r21 - s21) / 2;
    const v21: ImageSlot[] = [];
    for (let w21 = 0; w21 < 2; w21++) {
        for (let x21 = 0; x21 < 3; x21++) {
            v21.push({
                x: x21 * (t21 + s21),
                y: w21 * (u21 + s21),
                width: t21,
                height: u21,
            });
        }
    }
    return v21;
}
function grid3x2(i21: number, j21: number, k21: number): ImageSlot[] {
    const l21 = (i21 - k21) / 2;
    const m21 = (j21 - k21 * 2) / 3;
    const n21: ImageSlot[] = [];
    for (let o21 = 0; o21 < 3; o21++) {
        for (let p21 = 0; p21 < 2; p21++) {
            n21.push({
                x: p21 * (l21 + k21),
                y: o21 * (m21 + k21),
                width: l21,
                height: m21,
            });
        }
    }
    return n21;
}
function oneTopFiveBottom(a21: number, b21: number, c21: number): ImageSlot[] {
    const d21 = b21 * 0.5;
    const e21 = b21 - d21 - c21;
    const f21 = (a21 - c21 * 4) / 5;
    const g21: ImageSlot[] = [
        { x: 0, y: 0, width: a21, height: d21 },
    ];
    for (let h21 = 0; h21 < 5; h21++) {
        g21.push({
            x: h21 * (f21 + c21),
            y: d21 + c21,
            width: f21,
            height: e21,
        });
    }
    return g21;
}
const layouts6: LayoutDefinition[] = [
    { id: "grid-2x3", name: "2×3 网格", description: "六张图片网格排列", computeSlots: grid2x3 },
    { id: "grid-3x2", name: "3×2 网格", description: "六张图片网格排列", computeSlots: grid3x2 },
    { id: "one-top-five-bottom", name: "上一下五", description: "上一张下五张", computeSlots: oneTopFiveBottom },
];
function grid3x3(s20: number, t20: number, u20: number): ImageSlot[] {
    const v20 = (s20 - u20 * 2) / 3;
    const w20 = (t20 - u20 * 2) / 3;
    const x20: ImageSlot[] = [];
    for (let y20 = 0; y20 < 3; y20++) {
        for (let z20 = 0; z20 < 3; z20++) {
            x20.push({
                x: z20 * (v20 + u20),
                y: y20 * (w20 + u20),
                width: v20,
                height: w20,
            });
        }
    }
    return x20;
}
function oneBigEightSurround(l20: number, m20: number, n20: number): ImageSlot[] {
    const o20 = (l20 - n20 * 2) / 3;
    const p20 = (m20 - n20 * 2) / 3;
    const q20 = o20;
    const r20 = p20;
    return [
        { x: 0, y: 0, width: o20, height: p20 },
        { x: o20 + n20, y: 0, width: q20, height: p20 },
        { x: (o20 + n20) * 2, y: 0, width: o20, height: p20 },
        { x: 0, y: p20 + n20, width: o20, height: r20 },
        { x: o20 + n20, y: p20 + n20, width: q20, height: r20 },
        { x: (o20 + n20) * 2, y: p20 + n20, width: o20, height: r20 },
        { x: 0, y: (p20 + n20) * 2, width: o20, height: p20 },
        { x: o20 + n20, y: (p20 + n20) * 2, width: q20, height: p20 },
        { x: (o20 + n20) * 2, y: (p20 + n20) * 2, width: o20, height: p20 },
    ];
}
const layouts9: LayoutDefinition[] = [
    { id: "grid-3x3", name: "3×3 网格", description: "九张图片网格排列", computeSlots: grid3x3 },
    { id: "one-big-eight-surround", name: "中心环绕", description: "中心大图周围八张小图", computeSlots: oneBigEightSurround },
];
export const LAYOUT_REGISTRY: Record<LayoutKey, LayoutDefinition[]> = {
    1: layouts1,
    2: layouts2,
    3: layouts3,
    4: layouts4,
    6: layouts6,
    9: layouts9,
};
export function getLayoutKey(k20: number): LayoutKey {
    if (k20 <= 1)
        return 1;
    if (k20 <= 2)
        return 2;
    if (k20 <= 3)
        return 3;
    if (k20 <= 4)
        return 4;
    if (k20 <= 6)
        return 6;
    return 9;
}
