/**
 * JSON 安全解析工具
 * 先尝试标准 JSON.parse，失败后自动 fallback 到 JSON5.parse
 * JSON 是 JSON5 的子集，对标准 JSON 无任何副作用
 */
import JSON5 from "json5";

/**
 * 解析 JSON / JSON5 字符串，返回解析结果。
 * 两者都失败时抛出 SyntaxError（错误信息来自 JSON5.parse，通常更精确）。
 */
export function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return JSON5.parse(text);
  }
}

/**
 * 尝试解析，返回 { data, error } 而非抛异常。
 */
export function tryParse(text: string): { data: unknown; error?: undefined } | { data?: undefined; error: string } {
  try {
    return { data: safeParse(text) };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}
