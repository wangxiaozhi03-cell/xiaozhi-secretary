import type { ImageItem, PageSettings, PageLayout, PageOverrides } from "@/types";
import { getPaperDimensions, PAGE_MARGIN_MM } from "@/types/papers";
import { PDFDocument } from "pdf-lib";

/** 检测是否在 Tauri 环境中 */
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function calcFit(
  slotW: number, slotH: number,
  imgW: number, imgH: number,
  mode: "contain" | "cover"
) {
  const rW = slotW / imgW;
  const rH = slotH / imgH;
  const scale = mode === "cover" ? Math.max(rW, rH) : Math.min(rW, rH);
  return {
    offsetX: (slotW - imgW * scale) / 2,
    offsetY: (slotH - imgH * scale) / 2,
    width: imgW * scale,
    height: imgH * scale,
  };
}

export function useExport(
  images: () => ImageItem[],
  pages: () => PageLayout[],
  settings: () => PageSettings,
  getPageOverrides?: (pageIndex: number) => PageOverrides | undefined
) {
  function toBase64(bytes: Uint8Array): string {
    let binary = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  /** 浏览器环境：通过下载链接保存文件 */
  function downloadFile(filename: string, data: Uint8Array, mimeType: string) {
    const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function safeWriteFile(path: string, data: Uint8Array) {
    if (isTauri()) {
      try {
        const { writeFile } = await import("@tauri-apps/plugin-fs");
        await writeFile(path, data);
      } catch {
        const { invoke } = await import("@tauri-apps/api/core");
        const b64 = toBase64(data);
        await invoke("write_base64_file", { request: { path, base64_data: b64 } });
      }
    } else {
      // 浏览器环境：根据路径判断 MIME 类型
      const ext = path.split(".").pop()?.toLowerCase();
      const mime = ext === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      downloadFile(path.split("/").pop() || path, data, mime);
    }
  }

  /** 加载图片，带超时和错误处理 */
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const el = new Image();
      const timer = setTimeout(() => {
        el.src = "";
        reject(new Error("图片加载超时"));
      }, 30000);
      el.onload = () => {
        clearTimeout(timer);
        resolve(el);
      };
      el.onerror = () => {
        clearTimeout(timer);
        reject(new Error("图片加载失败"));
      };
      el.src = src;
    });
  }

  /** Canvas 渲染整页 → PNG */
  async function renderPageToPng(
    page: PageLayout,
    imgList: ImageItem[],
    s: PageSettings,
    pxPerMm: number,
    pageOverrides?: PageOverrides
  ): Promise<Uint8Array> {
    const paper = getPaperDimensions(s.paperSize, s.orientation);
    const isEdge = s.gapMode === "edge-to-edge";
    const margin = isEdge ? 0 : PAGE_MARGIN_MM;
    const mode = isEdge ? "cover" : "contain";

    // 使用覆盖的 slot 或原始 slot
    const slots = pageOverrides?.slots ?? page.slots;
    const imageIndices = pageOverrides?.imageIndices ?? page.imageIndices;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(paper.width * pxPerMm);
    canvas.height = Math.round(paper.height * pxPerMm);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < slots.length; i++) {
      const imgIdx = imageIndices[i];
      if (imgIdx === undefined || imgIdx >= imgList.length) {
        console.warn(`导出: slot ${i} 的图片索引 ${imgIdx} 无效`);
        continue;
      }

      const slot = slots[i];
      const imgInfo = imgList[imgIdx];

      let img: HTMLImageElement;
      try {
        img = await loadImage(imgInfo.thumbUrl);
      } catch (e) {
        console.error(`导出: 加载图片失败 [${imgInfo.name}]:`, e);
        continue;
      }

      if (!img.naturalWidth || !img.naturalHeight) {
        console.warn(`导出: 图片尺寸无效 [${imgInfo.name}]`);
        continue;
      }

      const slotX = (margin + slot.x) * pxPerMm;
      const slotY = (margin + slot.y) * pxPerMm;
      const slotW = slot.width * pxPerMm;
      const slotH = slot.height * pxPerMm;
      const fit = calcFit(slotW, slotH, img.naturalWidth, img.naturalHeight, mode);

      // 应用图片拖动偏移（cover 模式）
      let drawX = slotX + fit.offsetX;
      let drawY = slotY + fit.offsetY;
      const offset = pageOverrides?.offsets?.[imgIdx];
      if (offset && mode === "cover") {
        // fit.offsetX 是居中时的偏移（通常为 0 或负值）
        // excess = 图片超出 slot 的像素量
        const excessX = Math.max(0, fit.width - slotW);
        const excessY = Math.max(0, fit.height - slotH);
        // offset.offsetX: 0 = 显示左边缘, 0.5 = 居中, 1 = 显示右边缘
        // 对应的绘制偏移：从居中位置向左/右移动
        drawX = slotX + fit.offsetX - excessX * (offset.offsetX - 0.5);
        drawY = slotY + fit.offsetY - excessY * (offset.offsetY - 0.5);
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(slotX, slotY, slotW, slotH);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, fit.width, fit.height);
      ctx.restore();
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, "image/png");
    });
  }

  // ===== PDF =====
  async function exportPdf() {
    const imgList = images();
    if (imgList.length === 0) return;

    // 浏览器环境：使用 prompt 输入文件名
    let filePath = "document.pdf";
    if (isTauri()) {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const selected = await save({
        title: "导出 PDF",
        defaultPath: "document.pdf",
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      if (!selected) return;
      filePath = selected;
    } else {
      const filename = prompt("请输入文件名:", "document.pdf");
      if (!filename) return;
      filePath = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    }

    try {
      const s = settings();
      const paper = getPaperDimensions(s.paperSize, s.orientation);
      const pageList = pages();
      const MM2PT = 2.834645669;

      const pdfDoc = await PDFDocument.create();

      for (let pageIdx = 0; pageIdx < pageList.length; pageIdx++) {
        const pageOverrides = getPageOverrides?.(pageIdx);
        const pngBytes = await renderPageToPng(pageList[pageIdx], imgList, s, 3, pageOverrides);
        const pdfImage = await pdfDoc.embedPng(pngBytes);
        const pdfPage = pdfDoc.addPage([paper.width * MM2PT, paper.height * MM2PT]);
        pdfPage.drawImage(pdfImage, {
          x: 0, y: 0,
          width: paper.width * MM2PT,
          height: paper.height * MM2PT,
        });
      }

      const pdfBytes = await pdfDoc.save();
      await safeWriteFile(filePath, pdfBytes);
      if (isTauri()) {
        const { message } = await import("@tauri-apps/plugin-dialog");
        await message("PDF 导出成功！", { title: "ShibaSecretary" });
      } else {
        alert("PDF 导出成功！");
      }
    } catch (e) {
      console.error("PDF 导出失败:", e);
      if (isTauri()) {
        const { message } = await import("@tauri-apps/plugin-dialog");
        await message(`PDF 导出失败: ${String(e)}`, { title: "错误" });
      } else {
        alert(`PDF 导出失败: ${String(e)}`);
      }
    }
  }

  // ===== Word：直接生成 OOXML zip =====
  async function exportDocx() {
    const imgList = images();
    if (imgList.length === 0) return;

    // 浏览器环境：使用 prompt 输入文件名
    let filePath = "document.docx";
    if (isTauri()) {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const selected = await save({
        title: "导出 Word",
        defaultPath: "document.docx",
        filters: [{ name: "Word", extensions: ["docx"] }],
      });
      if (!selected) return;
      filePath = selected;
    } else {
      const filename = prompt("请输入文件名:", "document.docx");
      if (!filename) return;
      filePath = filename.endsWith(".docx") ? filename : `${filename}.docx`;
    }

    try {
      const s = settings();
      const paper = getPaperDimensions(s.paperSize, s.orientation);
      const pageList = pages();
      const isLandscape = s.orientation === "landscape";

      // 渲染每一页为 PNG
      const pagePngs: Uint8Array[] = [];
      for (let i = 0; i < pageList.length; i++) {
        const pageOverrides = getPageOverrides?.(i);
        pagePngs.push(await renderPageToPng(pageList[i], imgList, s, 3, pageOverrides));
      }

      // Word 中 w:pgSz 使用 twips 单位（1 mm = 56.6929 twips）
      const MM_TO_TWIPS = 56.6929;
      // 横向时交换宽高
      const pageWTwips = Math.round(paper.width * MM_TO_TWIPS);
      const pageHTwips = Math.round(paper.height * MM_TO_TWIPS);

      // 图片尺寸使用 EMU 单位（1 mm = 36000 EMU）
      const MM_TO_EMU = 36000;
      const imgWEmu = Math.round(paper.width * MM_TO_EMU);
      const imgHEmu = Math.round(paper.height * MM_TO_EMU);

      // 生成 OOXML
      const zip = new SimpleZip();
      const orientAttr = isLandscape ? ' w:orient="landscape"' : "";

      // [Content_Types].xml
      zip.add("[Content_Types].xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

      // _rels/.rels
      zip.add("_rels/.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

      // word/_rels/document.xml.rels
      const rels = pagePngs.map((_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i + 1}.png"/>`
      ).join("");
      zip.add("word/_rels/document.xml.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels}
</Relationships>`);

      // word/document.xml
      // 中间页面：sectPr 放在 pPr 中实现分页
      // 最后一页：只放图片，不带 sectPr；由 body 末尾的 sectPr 定义最终页面属性
      const pgSzXml = `<w:pgSz w:w="${pageWTwips}" w:h="${pageHTwips}"${orientAttr}/>`;
      const pgMarXml = `<w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/>`;

      function makeDrawing(i: number): string {
        return `<w:r><w:drawing>
          <wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="251658240" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:simplePos x="0" y="0"/>
            <wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH>
            <wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>
            <wp:extent cx="${imgWEmu}" cy="${imgHEmu}"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:wrapNone/>
            <wp:docPr id="${i + 1}" name="Page ${i + 1}"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="0" name=""/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="rId${i + 1}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="${imgWEmu}" cy="${imgHEmu}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect"/>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:anchor>
        </w:drawing></w:r>`;
      }

      // 中间页面（带 sectPr 分节）
      const intermediatePages = pagePngs.slice(0, -1).map((_, i) =>
        `<w:p><w:pPr><w:sectPr><w:type w:val="nextPage"/>${pgSzXml}${pgMarXml}</w:sectPr></w:pPr>${makeDrawing(i)}</w:p>`
      ).join("");

      // 最后一页（不带 sectPr）
      const lastPage = `<w:p>${makeDrawing(pagePngs.length - 1)}</w:p>`;

      // body 末尾的 sectPr 定义最终页面属性（直接子元素，不在 pPr 中）
      const finalSect = `<w:sectPr>${pgSzXml}${pgMarXml}</w:sectPr>`;

      zip.add("word/document.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<w:body>${intermediatePages}${lastPage}${finalSect}</w:body>
</w:document>`);

      // 添加图片
      for (let i = 0; i < pagePngs.length; i++) {
        zip.add(`word/media/image${i + 1}.png`, pagePngs[i]);
      }

      const docxBytes = await zip.generate();
      await safeWriteFile(filePath, docxBytes);
      if (isTauri()) {
        const { message } = await import("@tauri-apps/plugin-dialog");
        await message("Word 导出成功！", { title: "ShibaSecretary" });
      } else {
        alert("Word 导出成功！");
      }
    } catch (e) {
      console.error("Word 导出失败:", e);
      if (isTauri()) {
        const { message } = await import("@tauri-apps/plugin-dialog");
        await message(`Word 导出失败: ${String(e)}`, { title: "错误" });
      } else {
        alert(`Word 导出失败: ${String(e)}`);
      }
    }
  }

  return { exportPdf, exportDocx };
}

/** 简单 ZIP 生成器（docx 是 zip 格式） */
class SimpleZip {
  private files: { name: string; data: Uint8Array }[] = [];

  add(name: string, content: string | Uint8Array) {
    const data = typeof content === "string"
      ? new TextEncoder().encode(content)
      : content;
    this.files.push({ name, data });
  }

  async generate(): Promise<Uint8Array> {
    // 使用浏览器原生 Compression Streams 或手动实现
    // 简单方案：用 Blob + Response 构造 zip
    // 但浏览器没有原生 zip 支持，需要用 JS 实现
    return this.buildZip();
  }

  private buildZip(): Uint8Array {
    const encoder = new TextEncoder();
    let offset = 0;

    // 构建本地文件头 + 数据
    const localHeaders: Uint8Array[] = [];
    const centralDir: Uint8Array[] = [];

    for (const file of this.files) {
      const nameBytes = encoder.encode(file.name);
      const crc = this.crc32(file.data);

      // 本地文件头
      const local = new ArrayBuffer(30 + nameBytes.length);
      const lv = new DataView(local);
      lv.setUint32(0, 0x04034b50, true); // signature
      lv.setUint16(4, 20, true); // version needed
      lv.setUint16(6, 0, true); // flags
      lv.setUint16(8, 0, true); // compression (stored)
      lv.setUint16(10, 0, true); // mod time
      lv.setUint16(12, 0, true); // mod date
      lv.setUint32(14, crc, true); // crc32
      lv.setUint32(18, file.data.length, true); // compressed size
      lv.setUint32(22, file.data.length, true); // uncompressed size
      lv.setUint16(26, nameBytes.length, true); // name length
      lv.setUint16(28, 0, true); // extra length
      new Uint8Array(local).set(nameBytes, 30);

      localHeaders.push(new Uint8Array(local));
      localHeaders.push(file.data);

      // 中央目录
      const central = new ArrayBuffer(46 + nameBytes.length);
      const cv = new DataView(central);
      cv.setUint32(0, 0x02014b50, true); // signature
      cv.setUint16(4, 20, true); // version made by
      cv.setUint16(6, 20, true); // version needed
      cv.setUint16(8, 0, true); // flags
      cv.setUint16(10, 0, true); // compression
      cv.setUint16(12, 0, true); // mod time
      cv.setUint16(14, 0, true); // mod date
      cv.setUint32(16, crc, true); // crc32
      cv.setUint32(20, file.data.length, true); // compressed size
      cv.setUint32(24, file.data.length, true); // uncompressed size
      cv.setUint16(28, nameBytes.length, true); // name length
      cv.setUint16(30, 0, true); // extra length
      cv.setUint16(32, 0, true); // comment length
      cv.setUint16(34, 0, true); // disk number
      cv.setUint16(36, 0, true); // internal attrs
      cv.setUint32(38, 0, true); // external attrs
      cv.setUint32(42, offset, true); // local header offset
      new Uint8Array(central).set(nameBytes, 46);

      centralDir.push(new Uint8Array(central));
      offset += 30 + nameBytes.length + file.data.length;
    }

    const centralDirOffset = offset;
    let centralDirSize = 0;
    for (const cd of centralDir) {
      centralDirSize += cd.length;
    }

    // End of central directory
    const eocd = new ArrayBuffer(22);
    const ev = new DataView(eocd);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, this.files.length, true);
    ev.setUint16(10, this.files.length, true);
    ev.setUint32(12, centralDirSize, true);
    ev.setUint32(16, centralDirOffset, true);
    ev.setUint16(20, 0, true);

    // 合并所有部分
    const totalSize = offset + centralDirSize + 22;
    const result = new Uint8Array(totalSize);
    let pos = 0;
    for (const h of localHeaders) {
      result.set(h, pos);
      pos += h.length;
    }
    for (const cd of centralDir) {
      result.set(cd, pos);
      pos += cd.length;
    }
    result.set(new Uint8Array(eocd), pos);

    return result;
  }

  private crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
}
