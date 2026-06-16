import { invoke } from "@tauri-apps/api/core";
import type { ParsedRequest, Environment } from "./types";

/**
 * 解析 curl 命令字符串为结构化请求对象
 */
export function parseCurl(curlStr: string): ParsedRequest {
  const result: ParsedRequest = {
    method: "GET",
    url: "",
    headers: {},
    body: null,
    query: {},
    hostname: "",
    port: null,
    protocol: "https",
    path: "",
  };

  // 预处理：移除换行符和反斜杠续行
  let s = curlStr
    .replace(/\\\n/g, " ")
    .replace(/\\\r\n/g, " ")
    .trim();

  // 移除开头的 curl 命令
  s = s.replace(/^curl\s+/, "");

  // 提取所有 token（处理引号）
  const tokens = tokenize(s);

  let i = 0;
  let urlFound = false;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === "-X" || token === "--request") {
      result.method = (tokens[i + 1] || "GET").toUpperCase();
      i += 2;
    } else if (token === "-H" || token === "--header") {
      const headerStr = tokens[i + 1] || "";
      const colonIdx = headerStr.indexOf(":");
      if (colonIdx > 0) {
        const key = headerStr.substring(0, colonIdx).trim();
        const value = headerStr.substring(colonIdx + 1).trim();
        result.headers[key] = value;
      }
      i += 2;
    } else if (token === "-d" || token === "--data" || token === "--data-raw" || token === "--data-binary") {
      result.body = tokens[i + 1] || "";
      // 如果没有显式指定 method，默认改为 POST
      if (!curlStr.includes("-X") && !curlStr.includes("--request")) {
        result.method = "POST";
      }
      i += 2;
    } else if (token === "-u" || token === "--user") {
      // Basic auth
      const auth = tokens[i + 1] || "";
      const encoded = btoa(auth);
      result.headers["Authorization"] = `Basic ${encoded}`;
      i += 2;
    } else if (token === "-A" || token === "--user-agent") {
      result.headers["User-Agent"] = tokens[i + 1] || "";
      i += 2;
    } else if (token === "-b" || token === "--cookie") {
      result.headers["Cookie"] = tokens[i + 1] || "";
      i += 2;
    } else if (token === "-e" || token === "--referer") {
      result.headers["Referer"] = tokens[i + 1] || "";
      i += 2;
    } else if (token === "-k" || token === "--insecure") {
      // 忽略 SSL 选项
      i += 1;
    } else if (token.startsWith("-")) {
      // 其他未知选项，跳过
      i += 1;
    } else if (!urlFound) {
      // 这是 URL
      result.url = token.replace(/^['"]|['"]$/g, "");
      urlFound = true;
      i += 1;
    } else {
      i += 1;
    }
  }

  // 解析 URL 各部分
  if (result.url) {
    try {
      // 补全协议
      let urlStr = result.url;
      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        urlStr = "https://" + urlStr;
      }
      const parsed = new URL(urlStr);
      result.protocol = parsed.protocol.replace(":", "");
      result.hostname = parsed.hostname;
      result.port = parsed.port || null;
      result.path = parsed.pathname;
      result.url = parsed.toString();

      // 提取 query 参数
      parsed.searchParams.forEach((value, key) => {
        result.query[key] = value;
      });
    } catch {
      // URL 解析失败，保留原始值
    }
  }

  return result;
}

/**
 * 根据环境替换域名后重建 URL
 */
export function buildUrl(parsed: ParsedRequest, env: Environment | null, appendApi = false): string {
  if (!parsed.url) return parsed.url;

  try {
    const urlObj = new URL(parsed.url);

    // 替换环境域名
    if (env) {
      urlObj.hostname = env.domain;
      urlObj.protocol = env.protocol + ":";
      if (env.port) {
        urlObj.port = env.port;
      } else {
        urlObj.port = "";
      }
    }

    // 处理 /api 路径前缀
    const currentPath = urlObj.pathname;
    if (appendApi) {
      // 需要 /api：如果没有就加上
      if (!currentPath.startsWith("/api")) {
        urlObj.pathname = "/api" + (currentPath.startsWith("/") ? "" : "/") + currentPath;
      }
    } else {
      // 不需要 /api：如果有就去掉
      if (currentPath.startsWith("/api")) {
        let rest = currentPath.substring(4); // 去掉 "/api"
        if (!rest.startsWith("/")) rest = "/" + rest;
        if (rest === "/") rest = "/";
        urlObj.pathname = rest || "/";
      }
    }

    return urlObj.toString();
  } catch {
    return parsed.url;
  }
}

/**
 * 执行 HTTP 请求（通过 Tauri 绕过 CORS）
 */
export async function executeRequest(
  parsed: ParsedRequest,
  env: Environment | null,
  appendApi = false
): Promise<{ status: number; statusText: string; headers: Record<string, string>; body: string; size: number; time: number; error: string | null }> {
  const finalUrl = buildUrl(parsed, env, appendApi);

  try {
    const result: any = await invoke("http_request", {
      params: {
        method: parsed.method,
        url: finalUrl,
        headers: parsed.headers,
        body: parsed.body || null,
      },
    });

    return {
      status: result.status,
      statusText: result.status_text,
      headers: result.headers || {},
      body: result.body || "",
      size: result.size || 0,
      time: result.time || 0,
      error: result.error || null,
    };
  } catch (e: any) {
    return {
      status: 0,
      statusText: "Error",
      headers: {},
      body: "",
      size: 0,
      time: 0,
      error: typeof e === "string" ? e : e.message || "请求失败",
    };
  }
}

/**
 * 将命令字符串拆分为 token 数组（处理引号）
 */
function tokenize(s: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    if (ch === " " && !inSingle && !inDouble) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * 格式化 JSON 字符串（带语法高亮标记）
 */
export function formatJson(str: string): { formatted: string; valid: boolean } {
  try {
    const obj = JSON.parse(str);
    return { formatted: JSON.stringify(obj, null, 2), valid: true };
  } catch {
    return { formatted: str, valid: false };
  }
}
