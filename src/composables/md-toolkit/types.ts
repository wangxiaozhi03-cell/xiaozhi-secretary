/** 文档管理 */
export interface MdDocument {
  id: string;
  title: string;
  content: string;
  filePath: string | null;
  createdAt: number;
  updatedAt: number;
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
