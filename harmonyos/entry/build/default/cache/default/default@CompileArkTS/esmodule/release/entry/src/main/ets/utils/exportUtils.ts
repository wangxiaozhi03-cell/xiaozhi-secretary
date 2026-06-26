import picker from "@ohos:file.picker";
import fs from "@ohos:file.fs";
import image from "@ohos:multimedia.image";
import type { PageLayout, ImageSlot } from '../shared/types/index';
export async function exportPdf(p28: PageLayout[], q28: string[], r28: number, s28: number): Promise<boolean> {
    try {
        let u28 = new picker.DocumentViewPicker();
        let v28 = await u28.save({ newFileNames: ['图片排版.pdf'] });
        if (!v28 || v28.length === 0)
            return false;
        let w28 = buildPdf(p28, r28, s28);
        let x28 = fs.openSync(v28[0], fs.OpenMode.CREATE | fs.OpenMode.WRITE_ONLY);
        fs.writeSync(x28.fd, w28);
        fs.closeSync(x28);
        return true;
    }
    catch (t28) {
        console.error('[exportPdf] error:', JSON.stringify(t28));
        return false;
    }
}
function buildPdf(t27: PageLayout[], u27: number, v27: number): ArrayBuffer {
    let w27: string[] = [];
    let x27: number[] = [];
    let y27: string = '%PDF-1.4\n';
    let z27: number = 3;
    w27.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    let a28: string = '';
    for (let o28 = 0; o28 < t27.length; o28++)
        a28 += `${z27 + o28 * 2} 0 R `;
    w27.push(`2 0 obj\n<< /Type /Pages /Kids [${a28}] /Count ${t27.length} >>\nendobj\n`);
    for (let k28 = 0; k28 < t27.length; k28++) {
        let l28: number = z27 + k28 * 2;
        let m28: number = l28 + 1;
        let n28: string = buildPageStream(t27[k28], u27, v27);
        w27.push(`${l28} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${(u27 * 2.835).toFixed(1)} ${(v27 * 2.835).toFixed(1)}] /Contents ${m28} 0 R /Resources << >> >>\nendobj\n`);
        w27.push(`${m28} 0 obj\n<< /Length ${n28.length} >>\nstream\n${n28}\nendstream\nendobj\n`);
    }
    let b28: string = y27;
    let c28: number = y27.length;
    for (let j28 = 0; j28 < w27.length; j28++) {
        x27[j28] = c28;
        b28 += w27[j28];
        c28 += w27[j28].length;
    }
    let d28: number = c28;
    let e28: number = w27.length + 1;
    b28 += `xref\n0 ${e28}\n0000000000 65535 f \n`;
    for (let i28 = 0; i28 < w27.length; i28++)
        b28 += `${String(x27[i28]).padStart(10, '0')} 00000 n \n`;
    b28 += `trailer\n<< /Size ${e28} /Root 1 0 R >>\nstartxref\n${d28}\n%%EOF`;
    let f28 = new ArrayBuffer(b28.length);
    let g28 = new Uint8Array(f28);
    for (let h28 = 0; h28 < b28.length; h28++)
        g28[h28] = b28.charCodeAt(h28);
    return f28;
}
function buildPageStream(g27: PageLayout, h27: number, i27: number): string {
    let j27: number = 2.835;
    let k27: string[] = [];
    k27.push('1 1 1 rg');
    k27.push(`0 0 ${(h27 * j27).toFixed(1)} ${(i27 * j27).toFixed(1)} re f`);
    let l27: number[][] = [[0.89, 0.95, 1.0], [0.93, 0.97, 0.95], [0.98, 0.95, 0.90], [0.95, 0.90, 0.98], [0.98, 0.90, 0.93], [0.90, 0.97, 0.98]];
    for (let m27 = 0; m27 < g27.slots.length; m27++) {
        let n27: ImageSlot = g27.slots[m27];
        let o27: number[] = l27[m27 % l27.length];
        let p27: number = n27.x * j27;
        let q27: number = (i27 - n27.y - n27.height) * j27;
        let r27: number = n27.width * j27;
        let s27: number = n27.height * j27;
        k27.push(`${o27[0]} ${o27[1]} ${o27[2]} rg ${p27.toFixed(1)} ${q27.toFixed(1)} ${r27.toFixed(1)} ${s27.toFixed(1)} re f`);
        k27.push(`0.7 0.7 0.7 RG 0.5 w ${p27.toFixed(1)} ${q27.toFixed(1)} ${r27.toFixed(1)} ${s27.toFixed(1)} re S`);
    }
    return k27.join('\n');
}
export async function exportDocx(u26: PageLayout[], v26: string[], w26: number, x26: number): Promise<boolean> {
    try {
        let z26 = new picker.DocumentViewPicker();
        let a27 = await z26.save({ newFileNames: ['图片排版.doc'] });
        if (!a27 || a27.length === 0)
            return false;
        let b27: string[] = [];
        for (let e27 = 0; e27 < v26.length; e27++) {
            let f27: string = await readImageAsBase64(v26[e27]);
            b27.push(f27);
        }
        let c27: string = buildHtmlWithImages(u26, b27, w26, x26);
        let d27 = fs.openSync(a27[0], fs.OpenMode.CREATE | fs.OpenMode.WRITE_ONLY);
        fs.writeSync(d27.fd, stringToBuffer(c27));
        fs.closeSync(d27);
        return true;
    }
    catch (y26) {
        console.error('[exportDocx] error:', JSON.stringify(y26));
        return false;
    }
}
async function readImageAsBase64(k26: string): Promise<string> {
    try {
        let r26 = fs.openSync(k26, fs.OpenMode.READ_ONLY);
        let s26 = fs.statSync(r26.fd);
        let t26 = new ArrayBuffer(s26.size);
        fs.readSync(r26.fd, t26);
        fs.closeSync(r26);
        return arrayBufferToBase64(t26);
    }
    catch (l26) {
        console.warn('[readImageAsBase64] fs failed, trying image API:', JSON.stringify(l26));
        try {
            let n26 = image.createImageSource(k26);
            let o26 = await n26.createPixelMap();
            let p26 = await o26.getImageInfo();
            let q26 = new ArrayBuffer(p26.size.width * p26.size.height * 4);
            await o26.readPixelsToBuffer(q26);
            o26.release();
            n26.release();
            return arrayBufferToBase64(q26);
        }
        catch (m26) {
            console.error('[readImageAsBase64] image API also failed:', JSON.stringify(m26));
            return '';
        }
    }
}
function arrayBufferToBase64(c26: ArrayBuffer): string {
    let d26 = new Uint8Array(c26);
    let e26: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let f26: string = '';
    let g26: number = 0;
    while (g26 < d26.length) {
        let h26: number = d26[g26++];
        let i26: number = g26 < d26.length ? d26[g26++] : 0;
        let j26: number = g26 < d26.length ? d26[g26++] : 0;
        f26 += e26.charAt(h26 >> 2);
        f26 += e26.charAt(((h26 & 3) << 4) | (i26 >> 4));
        f26 += g26 - 2 < d26.length ? e26.charAt(((i26 & 15) << 2) | (j26 >> 6)) : '=';
        f26 += g26 - 1 < d26.length ? e26.charAt(j26 & 63) : '=';
    }
    return f26;
}
function buildHtmlWithImages(s25: PageLayout[], t25: string[], u25: number, v25: number): string {
    let w25: string = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>图片排版</title>
<style>
  @page { size: ${u25}mm ${v25}mm; margin: 0; }
  body { margin: 0; padding: 0; }
  .page {
    width: ${u25}mm; height: ${v25}mm;
    position: relative; overflow: hidden;
    page-break-after: always;
    background: white; box-sizing: border-box;
  }
  .slot {
    position: absolute; overflow: hidden;
    border: 0.5pt solid #E5E7EB;
  }
  .slot img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
</style>
</head>
<body>`;
    for (let x25 = 0; x25 < s25.length; x25++) {
        let y25: PageLayout = s25[x25];
        w25 += '<div class="page">';
        for (let z25 = 0; z25 < y25.slots.length; z25++) {
            let a26: ImageSlot = y25.slots[z25];
            let b26: number = y25.imageIndices[z25];
            w25 += `<div class="slot" style="left:${a26.x}mm;top:${a26.y}mm;width:${a26.width}mm;height:${a26.height}mm;">`;
            if (b26 !== undefined && b26 < t25.length && t25[b26] !== '') {
                w25 += `<img src="data:image/png;base64,${t25[b26]}">`;
            }
            w25 += '</div>';
        }
        w25 += '</div>';
    }
    w25 += '</body></html>';
    return w25;
}
function stringToBuffer(o25: string): ArrayBuffer {
    let p25 = new ArrayBuffer(o25.length);
    let q25 = new Uint8Array(p25);
    for (let r25 = 0; r25 < o25.length; r25++)
        q25[r25] = o25.charCodeAt(r25);
    return p25;
}
