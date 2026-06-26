import picker from '@ohos.file.picker';
import fs from '@ohos.file.fs';
import image from '@ohos.multimedia.image';
import { PageLayout, ImageSlot } from '../shared/types/index';

// ===== PDF 导出 =====

export async function exportPdf(
  pages: PageLayout[],
  imageUris: string[],
  paperWidth: number,
  paperHeight: number
): Promise<boolean> {
  try {
    let documentPicker = new picker.DocumentViewPicker();
    let saveResult = await documentPicker.save({ newFileNames: ['图片排版.pdf'] });
    if (!saveResult || saveResult.length === 0) return false;

    let pdfContent = buildPdf(pages, paperWidth, paperHeight);
    let file = fs.openSync(saveResult[0], fs.OpenMode.CREATE | fs.OpenMode.WRITE_ONLY);
    fs.writeSync(file.fd, pdfContent);
    fs.closeSync(file);
    return true;
  } catch (err) {
    console.error('[exportPdf] error:', JSON.stringify(err));
    return false;
  }
}

function buildPdf(pages: PageLayout[], paperW: number, paperH: number): ArrayBuffer {
  let objects: string[] = [];
  let offsets: number[] = [];
  let header: string = '%PDF-1.4\n';
  let firstPage: number = 3;

  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  let refs: string = '';
  for (let i = 0; i < pages.length; i++) refs += `${firstPage + i * 2} 0 R `;
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${refs}] /Count ${pages.length} >>\nendobj\n`);

  for (let i = 0; i < pages.length; i++) {
    let pn: number = firstPage + i * 2;
    let cn: number = pn + 1;
    let stream: string = buildPageStream(pages[i], paperW, paperH);
    objects.push(`${pn} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${(paperW * 2.835).toFixed(1)} ${(paperH * 2.835).toFixed(1)}] /Contents ${cn} 0 R /Resources << >> >>\nendobj\n`);
    objects.push(`${cn} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  }

  let body: string = header;
  let off: number = header.length;
  for (let i = 0; i < objects.length; i++) { offsets[i] = off; body += objects[i]; off += objects[i].length; }

  let xref: number = off;
  let total: number = objects.length + 1;
  body += `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 0; i < objects.length; i++) body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  body += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  let buf = new ArrayBuffer(body.length);
  let v = new Uint8Array(buf);
  for (let i = 0; i < body.length; i++) v[i] = body.charCodeAt(i);
  return buf;
}

function buildPageStream(page: PageLayout, paperW: number, paperH: number): string {
  let s: number = 2.835;
  let parts: string[] = [];
  parts.push('1 1 1 rg');
  parts.push(`0 0 ${(paperW * s).toFixed(1)} ${(paperH * s).toFixed(1)} re f`);
  let colors: number[][] = [[0.89, 0.95, 1.0], [0.93, 0.97, 0.95], [0.98, 0.95, 0.90], [0.95, 0.90, 0.98], [0.98, 0.90, 0.93], [0.90, 0.97, 0.98]];
  for (let i = 0; i < page.slots.length; i++) {
    let slot: ImageSlot = page.slots[i];
    let c: number[] = colors[i % colors.length];
    let x: number = slot.x * s;
    let y: number = (paperH - slot.y - slot.height) * s;
    let w: number = slot.width * s;
    let h: number = slot.height * s;
    parts.push(`${c[0]} ${c[1]} ${c[2]} rg ${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`);
    parts.push(`0.7 0.7 0.7 RG 0.5 w ${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re S`);
  }
  return parts.join('\n');
}

// ===== Word 导出（带真实图片）=====

export async function exportDocx(
  pages: PageLayout[],
  imageUris: string[],
  paperWidth: number,
  paperHeight: number
): Promise<boolean> {
  try {
    let documentPicker = new picker.DocumentViewPicker();
    let saveResult = await documentPicker.save({ newFileNames: ['图片排版.doc'] });
    if (!saveResult || saveResult.length === 0) return false;

    // 读取所有图片并转 base64
    let imageBase64List: string[] = [];
    for (let i = 0; i < imageUris.length; i++) {
      let b64: string = await readImageAsBase64(imageUris[i]);
      imageBase64List.push(b64);
    }

    let html: string = buildHtmlWithImages(pages, imageBase64List, paperWidth, paperHeight);
    let file = fs.openSync(saveResult[0], fs.OpenMode.CREATE | fs.OpenMode.WRITE_ONLY);
    fs.writeSync(file.fd, stringToBuffer(html));
    fs.closeSync(file);
    return true;
  } catch (err) {
    console.error('[exportDocx] error:', JSON.stringify(err));
    return false;
  }
}

/**
 * 读取图片文件并转为 base64
 */
async function readImageAsBase64(uri: string): Promise<string> {
  try {
    // 方式1: 直接用 fs 读取文件字节
    let file = fs.openSync(uri, fs.OpenMode.READ_ONLY);
    let stat = fs.statSync(file.fd);
    let buf = new ArrayBuffer(stat.size);
    fs.readSync(file.fd, buf);
    fs.closeSync(file);
    return arrayBufferToBase64(buf);
  } catch (err) {
    console.warn('[readImageAsBase64] fs failed, trying image API:', JSON.stringify(err));
    // 方式2: 用 image API 获取 PixelMap 再转 base64
    try {
      let source = image.createImageSource(uri);
      let pixelMap = await source.createPixelMap();
      let info = await pixelMap.getImageInfo();
      let bytes = new ArrayBuffer(info.size.width * info.size.height * 4);
      await pixelMap.readPixelsToBuffer(bytes);
      pixelMap.release();
      source.release();
      return arrayBufferToBase64(bytes);
    } catch (err2) {
      console.error('[readImageAsBase64] image API also failed:', JSON.stringify(err2));
      return '';
    }
  }
}

/**
 * ArrayBuffer 转 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let bytes = new Uint8Array(buffer);
  let chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result: string = '';
  let i: number = 0;
  while (i < bytes.length) {
    let b1: number = bytes[i++];
    let b2: number = i < bytes.length ? bytes[i++] : 0;
    let b3: number = i < bytes.length ? bytes[i++] : 0;
    result += chars.charAt(b1 >> 2);
    result += chars.charAt(((b1 & 3) << 4) | (b2 >> 4));
    result += i - 2 < bytes.length ? chars.charAt(((b2 & 15) << 2) | (b3 >> 6)) : '=';
    result += i - 1 < bytes.length ? chars.charAt(b3 & 63) : '=';
  }
  return result;
}

/**
 * 构建带真实图片的 HTML
 */
function buildHtmlWithImages(pages: PageLayout[], imageBase64List: string[], paperW: number, paperH: number): string {
  let html: string = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>图片排版</title>
<style>
  @page { size: ${paperW}mm ${paperH}mm; margin: 0; }
  body { margin: 0; padding: 0; }
  .page {
    width: ${paperW}mm; height: ${paperH}mm;
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

  for (let i = 0; i < pages.length; i++) {
    let page: PageLayout = pages[i];
    html += '<div class="page">';
    for (let j = 0; j < page.slots.length; j++) {
      let slot: ImageSlot = page.slots[j];
      let imgIdx: number = page.imageIndices[j];
      html += `<div class="slot" style="left:${slot.x}mm;top:${slot.y}mm;width:${slot.width}mm;height:${slot.height}mm;">`;
      if (imgIdx !== undefined && imgIdx < imageBase64List.length && imageBase64List[imgIdx] !== '') {
        html += `<img src="data:image/png;base64,${imageBase64List[imgIdx]}">`;
      }
      html += '</div>';
    }
    html += '</div>';
  }

  html += '</body></html>';
  return html;
}

function stringToBuffer(str: string): ArrayBuffer {
  let buf = new ArrayBuffer(str.length);
  let v = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) v[i] = str.charCodeAt(i);
  return buf;
}
