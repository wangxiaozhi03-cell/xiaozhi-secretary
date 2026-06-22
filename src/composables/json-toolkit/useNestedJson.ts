/**
 * 嵌套 JSON 字符串解析工具
 * 递归检测字符串值中的 JSON 字符串，自动解析为对象
 */
import { safeParse } from "./safeParse";

export function useNestedJson() {
  /**
   * 检测字符串是否是嵌套的 JSON
   */
  function isNestedJsonString(value: string): boolean {
    const trimmed = value.trim();
    if (
      !(trimmed.startsWith("{") && trimmed.endsWith("}")) &&
      !(trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      return false;
    }
    try {
      safeParse(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 递归展开嵌套的 JSON 字符串
   */
  function expandNestedJson(data: unknown): { result: unknown; count: number } {
    let count = 0;

    function walk(value: unknown): unknown {
      if (typeof value === "string") {
        if (isNestedJsonString(value)) {
          try {
            const parsed = safeParse(value.trim());
            count++;
            return walk(parsed);
          } catch {
            return value;
          }
        }
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((item) => walk(item));
      }

      if (value !== null && typeof value === "object") {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          result[k] = walk(v);
        }
        return result;
      }

      return value;
    }

    const result = walk(data);
    return { result, count };
  }

  /**
   * 对 JSON 字符串执行嵌套展开
   */
  function expandJsonString(jsonString: string): { result: string; count: number; error?: string } {
    const trimmed = jsonString.trim();
    if (!trimmed) return { result: "", count: 0 };

    try {
      const parsed = safeParse(trimmed);
      const { result, count } = expandNestedJson(parsed);
      return {
        result: JSON.stringify(result, null, 2),
        count,
      };
    } catch (e: unknown) {
      return {
        result: jsonString,
        count: 0,
        error: e instanceof Error ? e.message : "Invalid JSON",
      };
    }
  }

  /**
   * 检测 JSON 中有多少个嵌套的 JSON 字符串
   */
  function countNestedJsonStrings(data: unknown): number {
    let count = 0;

    function walk(value: unknown) {
      if (typeof value === "string") {
        if (isNestedJsonString(value)) count++;
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => walk(item));
        return;
      }
      if (value !== null && typeof value === "object") {
        for (const v of Object.values(value as Record<string, unknown>)) {
          walk(v);
        }
      }
    }

    walk(data);
    return count;
  }

  return {
    isNestedJsonString,
    expandNestedJson,
    expandJsonString,
    countNestedJsonStrings,
  };
}
