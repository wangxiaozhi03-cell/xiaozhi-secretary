/**
 * 时间戳与时间格式互转工具
 * 自动识别 JSON 中的时间戳字段并转换
 */
import { safeParse } from "./safeParse";

export function useTimestamp() {
  /**
   * 判断数字是否可能是时间戳
   * 秒级：10 位（1970-2100 范围大约 0 ~ 4102444800）
   * 毫秒级：13 位
   */
  function isTimestamp(value: number): boolean {
    // 秒级时间戳 (1970 ~ 2100)
    if (value >= 0 && value <= 4102444800) return true;
    // 毫秒级时间戳
    if (value >= 100000000000 && value <= 4102444800000) return true;
    return false;
  }

  /**
   * 判断字符串是否是常见时间格式
   */
  function isTimeString(value: string): boolean {
    const patterns = [
      /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/, // ISO 8601
      /^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}/, // yyyy/MM/dd HH:mm:ss
      /^\d{4}-\d{2}-\d{2}$/, // yyyy-MM-dd
      /^\d{2}\/\d{2}\/\d{4}/, // MM/dd/yyyy
    ];
    return patterns.some((p) => p.test(value));
  }

  /**
   * 时间戳转为可读时间
   */
  function timestampToReadable(ts: number): string {
    // 如果是秒级，转为毫秒
    const ms = ts < 100000000000 ? ts * 1000 : ts;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return String(ts);

    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  /**
   * 时间字符串转为时间戳（毫秒）
   */
  function timeToTimestamp(timeStr: string): number | null {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return null;
    return d.getTime();
  }

  /**
   * 递归转换 JSON 中的所有时间戳为可读格式
   */
  function convertTimestampsInJson(
    data: unknown,
    direction: "toReadable" | "toTimestamp"
  ): { result: unknown; count: number } {
    let count = 0;

    function walk(value: unknown): unknown {
      if (direction === "toReadable") {
        if (typeof value === "number" && isTimestamp(value)) {
          count++;
          return timestampToReadable(value);
        }
        // 字符串类型的数字时间戳
        if (typeof value === "string" && /^\d{10,13}$/.test(value)) {
          count++;
          return timestampToReadable(Number(value));
        }
      } else {
        if (typeof value === "string" && isTimeString(value)) {
          const ts = timeToTimestamp(value);
          if (ts !== null) {
            count++;
            return String(ts);
          }
        }
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
   * 对 JSON 字符串执行时间戳转换
   */
  function convertJsonTimestamps(
    jsonString: string,
    direction: "toReadable" | "toTimestamp"
  ): { result: string; count: number; error?: string } {
    const trimmed = jsonString.trim();
    if (!trimmed) return { result: "", count: 0 };

    try {
      const parsed = safeParse(trimmed);
      const { result, count } = convertTimestampsInJson(parsed, direction);
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

  return {
    isTimestamp,
    isTimeString,
    timestampToReadable,
    timeToTimestamp,
    convertTimestampsInJson,
    convertJsonTimestamps,
  };
}
