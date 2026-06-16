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
