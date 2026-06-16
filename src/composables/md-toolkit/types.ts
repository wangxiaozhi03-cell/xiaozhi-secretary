/** 文档管理 */
export interface MdDocument {
  id: string;
  title: string;
  content: string;
  filePath: string | null;
  createdAt: number;
  updatedAt: number;
}

/** 大纲标题项 */
export interface HeadingItem {
  id: string;
  level: 1 | 2 | 3 | 4;
  text: string;
  line: number;
  children: HeadingItem[];
}

/** 字数统计 */
export interface MdStats {
  chars: number;
  words: number;
  lines: number;
  paragraphs: number;
  codeBlocks: number;
  images: number;
  readTime: string;
}

/** 编辑器视图模式 */
export type MdViewMode = "editor" | "preview" | "split";
