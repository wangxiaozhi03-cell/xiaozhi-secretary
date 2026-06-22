import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";

/** 导出为 HTML 文件 */
export async function exportHtml(html: string, title: string) {
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");

    const filePath = await save({
      filters: [{ name: "HTML", extensions: ["html"] }],
      defaultPath: `${title || "document"}.html`,
    });
    if (!filePath) return;

    const fullHtml = wrapHtml(html, title);
    await writeTextFile(filePath, fullHtml);
  } catch (err) {
    console.error("Export HTML failed:", err);
  }
}

/** 导出为 PDF 文件 */
export async function exportPdf(html: string, title: string) {
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { invoke } = await import("@tauri-apps/api/core");
    const html2canvas = (await import("html2canvas")).default;
    const { PDFDocument } = await import("pdf-lib");

    const filePath = await save({
      filters: [{ name: "PDF", extensions: ["pdf"] }],
      defaultPath: `${title || "document"}.pdf`,
    });
    if (!filePath) return;

    const container = document.createElement("div");
    container.innerHTML = wrapHtml(html, title);
    container.style.cssText =
      "position:fixed;left:-9999px;top:0;width:794px;background:#fff;padding:40px;";
    document.body.appendChild(container);

    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    document.body.removeChild(container);

    const imgDataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const base64 = imgDataUrl.split(",")[1];

    const pdfDoc = await PDFDocument.create();
    const jpg = await pdfDoc.embedJpg(base64);

    const pageW = 595.28;
    const pageH = 841.89;
    const scale = pageW / canvas.width;
    const imgH = canvas.height * scale;
    const sliceH = pageH;
    let y = 0;

    while (y < imgH) {
      const page = pdfDoc.addPage([pageW, pageH]);
      const h = Math.min(sliceH, imgH - y);
      page.drawImage(jpg, { x: 0, y: pageH - h, width: pageW, height: h });
      y += sliceH;
    }

    const bytes = await pdfDoc.save();
    await invoke("write_file", {
      request: { path: filePath, data: Array.from(new Uint8Array(bytes)) },
    });
  } catch (err) {
    console.error("Export PDF failed:", err);
    throw err;
  }
}

/** 导出为 DOCX 文件 */
export async function exportDocx(markdown: string, title: string) {
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const filePath = await save({
      filters: [{ name: "Word", extensions: ["docx"] }],
      defaultPath: `${title || "document"}.docx`,
    });
    if (!filePath) return;

    const elements = parseMarkdownToElements(markdown);
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { size: 24, font: "Microsoft YaHei" },
          },
        },
      },
      sections: [{ properties: {}, children: elements }],
    });

    const blob = await Packer.toBlob(doc);
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let binary = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const b64 = btoa(binary);

    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("write_base64_file", {
      request: { path: filePath, base64_data: b64 },
    });
  } catch (err) {
    console.error("Export DOCX failed:", err);
    throw err;
  }
}

/** 复制 HTML 到剪贴板 */
export async function copyHtml(html: string) {
  try {
    await navigator.clipboard.writeText(html);
  } catch (err) {
    console.error("Copy failed:", err);
  }
}

/** 复制 Markdown 源码到剪贴板 */
export async function copyMarkdown(md: string) {
  try {
    await navigator.clipboard.writeText(md);
  } catch (err) {
    console.error("Copy failed:", err);
  }
}

// ─── helpers ───────────────────────────────────────────

function parseMarkdownToElements(markdown: string): any[] {
  const lines = markdown.split("\n");
  const elements: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: codeLines.join("\n"), font: "Courier New", size: 20 })],
          spacing: { before: 200, after: 200 },
        }),
      );
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };
      elements.push(
        new Paragraph({
          children: parseInline(headingMatch[2]),
          heading: headingMap[level],
          spacing: { before: 300, after: 150 },
        }),
      );
      i++;
      continue;
    }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      elements.push(
        new Paragraph({
          children: [],
          border: { bottom: { style: "single" as any, size: 6, color: "999999" } },
          spacing: { before: 200, after: 200 },
        }),
      );
      i++;
      continue;
    }

    // List items
    if (/^(\d+\.\s|[-*+]\s)/.test(line)) {
      const listItems: { text: string; ordered: boolean }[] = [];
      while (i < lines.length && /^(\d+\.\s|[-*+]\s)/.test(lines[i])) {
        const ordered = /^\d+\.\s/.test(lines[i]);
        listItems.push({ text: lines[i].replace(/^(\d+\.\s|[-*+]\s)/, ""), ordered });
        i++;
      }
      for (const item of listItems) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({ text: (item.ordered ? "• " : "• ") }),
              ...parseInline(item.text),
            ],
            indent: { left: 720 },
            spacing: { before: 40, after: 40 },
          }),
        );
      }
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(new Paragraph({ children: [] }));
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      new Paragraph({
        children: parseInline(line),
        spacing: { before: 80, after: 80 },
      }),
    );
    i++;
  }

  return elements;
}

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
  const codeRegex = /`([^`]+)`/g;
  const strikeRegex = /~~([^~]+)~~/g;

  let match: RegExpExecArray | null;

  // Find all special segments
  const allMatches: { start: number; end: number; text: string; type: string; href?: string }[] = [];

  for (const regex of [
    { re: linkRegex, type: "link" },
    { re: codeRegex, type: "code" },
    { re: boldRegex, type: "bold" },
    { re: italicRegex, type: "italic" },
    { re: strikeRegex, type: "strike" },
  ]) {
    regex.re.lastIndex = 0;
    while ((match = regex.re.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
        type: regex.type,
        href: match[2],
      });
    }
  }

  // Sort by position
  allMatches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches
  const filtered: typeof allMatches = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  // Build runs
  let pos = 0;
  for (const m of filtered) {
    if (m.start > pos) {
      runs.push(new TextRun({ text: text.slice(pos, m.start) }));
    }
    switch (m.type) {
      case "bold":
        runs.push(new TextRun({ text: m.text, bold: true }));
        break;
      case "italic":
        runs.push(new TextRun({ text: m.text, italics: true }));
        break;
      case "code":
        runs.push(new TextRun({ text: m.text, font: "Courier New", size: 20 }));
        break;
      case "strike":
        runs.push(new TextRun({ text: m.text, strike: true }));
        break;
      case "link":
        runs.push(new TextRun({ text: m.text, color: "0969da", underline: {} }));
        break;
      default:
        runs.push(new TextRun({ text: m.text }));
    }
    pos = m.end;
  }
  if (pos < text.length) {
    runs.push(new TextRun({ text: text.slice(pos) }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

/** 包装为完整 HTML 文档 */
function wrapHtml(bodyHtml: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      max-width: 860px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: #24292f;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
    h1 { font-size: 2em; border-bottom: 1px solid #d1d9e0; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #d1d9e0; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    p { margin-top: 0; margin-bottom: 16px; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { padding: 0.2em 0.4em; font-size: 85%; background: #eff1f3; border-radius: 6px; }
    pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background: #161b22; color: #e6edf3; border-radius: 6px; }
    pre code { padding: 0; background: transparent; color: inherit; }
    blockquote { padding: 0 1em; margin: 0 0 16px 0; color: #57606a; border-left: 0.25em solid #d1d9e0; }
    table { border-spacing: 0; border-collapse: collapse; margin-bottom: 16px; }
    th, td { padding: 6px 13px; border: 1px solid #d1d9e0; }
    th { font-weight: 600; background: #f6f8fa; }
    img { max-width: 100%; }
    hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #d1d9e0; border: 0; }
    ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
    li + li { margin-top: 0.25em; }
    .hljs-code-block { position: relative; }
    .code-lang { position: absolute; top: 8px; right: 12px; font-size: 12px; color: #8b949e; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
