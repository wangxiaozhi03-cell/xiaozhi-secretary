import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import type { MdStats } from "./types";

// 模块级单例
let md: MarkdownIt | null = null;

function getMd(): MarkdownIt {
  if (!md) {
    md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight(str: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="hljs-code-block"><div class="code-lang">${lang}</div><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
          } catch {
            // fall through
          }
        }
        return `<pre class="hljs-code-block"><code>${md!.utils.escapeHtml(str)}</code></pre>`;
      },
    });
  }
  return md;
}

/** 渲染 Markdown 为 HTML */
export function renderHtml(markdown: string): string {
  if (!markdown.trim()) return "";
  return getMd().render(markdown);
}

/** 计算文档统计 */
export function computeStats(markdown: string): MdStats {
  if (!markdown) {
    return { chars: 0, words: 0, lines: 0, paragraphs: 0, codeBlocks: 0, images: 0, readTime: "0 分钟" };
  }

  const chars = markdown.length;
  const lines = markdown.split("\n").length;

  // 段落数：非空行块
  const paragraphs = markdown.split(/\n\s*\n/).filter((p) => p.trim()).length;

  // 代码块数
  const codeBlocks = (markdown.match(/```/g) || []).length / 2;

  // 图片数
  const images = (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length;

  // 单词数：中文按字符计，英文按空格分词
  const noCode = markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`]+`/g, "");
  const chineseChars = (noCode.match(/[一-鿿]/g) || []).length;
  const englishWords = noCode
    .replace(/[一-鿿]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const words = chineseChars + englishWords;

  // 阅读时间：中文约 300 字/分钟
  const minutes = Math.max(1, Math.ceil(chars / 300));
  const readTime = `${minutes} 分钟`;

  return { chars, words, lines, paragraphs, codeBlocks: Math.floor(codeBlocks), images, readTime };
}
