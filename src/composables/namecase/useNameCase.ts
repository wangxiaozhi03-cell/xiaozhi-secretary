import { ref, computed } from "vue";

export type NameStyle =
  | "camelCase"
  | "PascalCase"
  | "snake_case"
  | "kebab-case"
  | "CONSTANT_CASE"
  | "unknown";

export interface ConversionResult {
  input: string;
  detectedStyle: NameStyle;
  words: string[];
  conversions: Record<NameStyle, string>;
}

const STYLE_LABELS: Record<NameStyle, string> = {
  camelCase: "camelCase",
  PascalCase: "PascalCase",
  snake_case: "snake_case",
  "kebab-case": "kebab-case",
  CONSTANT_CASE: "CONSTANT_CASE",
  unknown: "未知",
};

export function useNameCase() {
  const input = ref("");
  const targetStyle = ref<NameStyle>("camelCase");
  const preserveAcronyms = ref(true);
  const results = ref<ConversionResult[]>([]);

  // ========== 智能拆词 ==========
  function splitWords(name: string): string[] {
    if (!name) return [];

    // 先按分隔符拆分（下划线、连字符、空格）
    let parts = name.split(/[-_\s]+/).filter(Boolean);

    // 再按驼峰拆分
    const words: string[] = [];
    for (const part of parts) {
      // 处理连续大写字母（如 HTTPAPI → HTTP, API）
      const acronymMatch = part.match(/[A-Z]{2,}/g);
      if (acronymMatch && preserveAcronyms.value) {
        // 将连续大写作为独立词
        let remaining = part;
        for (const acronym of acronymMatch) {
          const idx = remaining.indexOf(acronym);
          if (idx > 0) {
            words.push(remaining.substring(0, idx));
          }
          words.push(acronym);
          remaining = remaining.substring(idx + acronym.length);
        }
        if (remaining) words.push(remaining);
      } else {
        // 标准驼峰拆分
        const camelParts = part.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
        words.push(...camelParts.split(" ").filter(Boolean));
      }
    }

    return words.map((w) => w.toLowerCase());
  }

  // ========== 自动识别命名风格 ==========
  function detectStyle(name: string): NameStyle {
    if (!name.trim()) return "unknown";

    const trimmed = name.trim();

    // 检查 kebab-case
    if (/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(trimmed)) return "kebab-case";

    // 检查 snake_case
    if (/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(trimmed)) return "snake_case";

    // 检查 CONSTANT_CASE
    if (/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(trimmed)) return "CONSTANT_CASE";

    // 检查 PascalCase
    if (/^[A-Z][a-zA-Z0-9]*$/.test(trimmed) && /[a-z]/.test(trimmed)) return "PascalCase";

    // 检查 camelCase
    if (/^[a-z][a-zA-Z0-9]*$/.test(trimmed) && /[A-Z]/.test(trimmed)) return "camelCase";

    // 单个单词，无法确定
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(trimmed)) return "camelCase";

    return "unknown";
  }

  // ========== 格式转换函数 ==========
  function toCamelCase(words: string[]): string {
    return words
      .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join("");
  }

  function toPascalCase(words: string[]): string {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  }

  function toSnakeCase(words: string[]): string {
    return words.join("_");
  }

  function toKebabCase(words: string[]): string {
    return words.join("-");
  }

  function toConstantCase(words: string[]): string {
    return words.map((w) => w.toUpperCase()).join("_");
  }

  // ========== 转换单行 ==========
  function convertLine(input: string): ConversionResult {
    const detectedStyle = detectStyle(input);
    const words = splitWords(input);

    return {
      input,
      detectedStyle,
      words,
      conversions: {
        camelCase: toCamelCase(words),
        PascalCase: toPascalCase(words),
        snake_case: toSnakeCase(words),
        "kebab-case": toKebabCase(words),
        CONSTANT_CASE: toConstantCase(words),
        unknown: input,
      },
    };
  }

  // ========== 批量转换 ==========
  function convertBatch(): void {
    const lines = input.value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    results.value = lines.map((line) => convertLine(line));
  }

  // ========== 复制功能 ==========
  function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  function copyAllResults(style: NameStyle): void {
    const lines = results.value.map((r) => r.conversions[style]);
    copyToClipboard(lines.join("\n"));
  }

  function copySingleResult(result: ConversionResult, style: NameStyle): void {
    copyToClipboard(result.conversions[style]);
  }

  // ========== 统计 ==========
  const detectedStyles = computed(() => {
    const counts: Partial<Record<NameStyle, number>> = {};
    for (const r of results.value) {
      counts[r.detectedStyle] = (counts[r.detectedStyle] || 0) + 1;
    }
    return counts;
  });

  const totalCount = computed(() => results.value.length);

  // ========== 示例 ==========
  function loadExample(): void {
    input.value = [
      "user_name",
      "getUserProfile",
      "API_RESPONSE_DATA",
      "max-count",
      "firstName",
      "HTMLElement",
      "getHTTPSResponse",
      "some_snake_case_var",
    ].join("\n");
    convertBatch();
  }

  function clearAll(): void {
    input.value = "";
    results.value = [];
  }

  return {
    input,
    targetStyle,
    preserveAcronyms,
    results,
    detectedStyles,
    totalCount,
    splitWords,
    detectStyle,
    convertLine,
    convertBatch,
    copyToClipboard,
    copyAllResults,
    copySingleResult,
    loadExample,
    clearAll,
    STYLE_LABELS,
  };
}
