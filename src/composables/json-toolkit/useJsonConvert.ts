/**
 * JSON 格式转换工具
 * 支持 JSON ↔ XML / YAML / TOML / Properties / URL Params
 */
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import * as yaml from "js-yaml";
import * as toml from "smol-toml";
import { safeParse } from "./safeParse";
import JSON5 from "json5";

export type ConvertFormat = "xml" | "yaml" | "toml" | "properties" | "url" | "json5";

export interface ConvertResult {
  output: string;
  error?: string;
}

export function useJsonConvert() {
  /**
   * JSON → 其他格式
   */
  function jsonTo(jsonString: string, format: ConvertFormat): ConvertResult {
    const trimmed = jsonString.trim();
    if (!trimmed) return { output: "" };

    let parsed: unknown;
    try {
      parsed = safeParse(trimmed);
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "无效的 JSON" };
    }

    switch (format) {
      case "xml":
        return jsonToXml(parsed);
      case "yaml":
        return jsonToYaml(parsed);
      case "toml":
        return jsonToToml(parsed);
      case "properties":
        return jsonToProperties(parsed);
      case "url":
        return jsonToUrlParams(parsed);
      case "json5":
        return jsonToJson5(parsed);
    }
  }

  /**
   * 其他格式 → JSON
   */
  function toJson(input: string, format: ConvertFormat): ConvertResult {
    const trimmed = input.trim();
    if (!trimmed) return { output: "" };

    switch (format) {
      case "xml":
        return xmlToJson(trimmed);
      case "yaml":
        return yamlToJson(trimmed);
      case "toml":
        return tomlToJson(trimmed);
      case "properties":
        return propertiesToJson(trimmed);
      case "url":
        return urlParamsToJson(trimmed);
      case "json5":
        return json5ToJson(trimmed);
    }
  }

  /**
   * 自动检测格式并转为 JSON
   */
  function autoDetectToJson(input: string): ConvertResult & { format?: ConvertFormat } {
    const trimmed = input.trim();
    if (!trimmed) return { output: "" };

    // Try each format
    if (trimmed.startsWith("<")) {
      const r = xmlToJson(trimmed);
      if (!r.error) return { ...r, format: "xml" };
    }

    if (trimmed.includes("=") && (trimmed.includes("&") || trimmed.startsWith("?"))) {
      const r = urlParamsToJson(trimmed);
      if (!r.error) return { ...r, format: "url" };
    }

    // Try YAML (superset of JSON, but check for YAML-specific features)
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      const r = yamlToJson(trimmed);
      if (!r.error) return { ...r, format: "yaml" };
    }

    // Try JSON5 (has comments, trailing commas, unquoted keys, etc.)
    if (!trimmed.startsWith("<")) {
      const json5Result = json5ToJson(trimmed);
      if (!json5Result.error && json5Result.output !== trimmed) {
        return { ...json5Result, format: "json5" };
      }
    }

    // Try TOML
    const tomlResult = tomlToJson(trimmed);
    if (!tomlResult.error) return { ...tomlResult, format: "toml" };

    // Try properties
    const propResult = propertiesToJson(trimmed);
    if (!propResult.error) return { ...propResult, format: "properties" };

    return { output: "", error: "无法识别输入格式" };
  }

  // === XML ===
  function jsonToXml(data: unknown): ConvertResult {
    try {
      const builder = new XMLBuilder({
        indentBy: "  ",
        format: true,
        suppressEmptyNode: true,
      });
      // Wrap in root element if data is an array
      const wrapped = Array.isArray(data) ? { root: data } : data;
      const xml = builder.build(wrapped);
      return { output: `<?xml version="1.0" encoding="UTF-8"?>\n${xml}` };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "XML 转换失败" };
    }
  }

  function xmlToJson(xmlString: string): ConvertResult {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        parseTagValue: true,
        trimValues: true,
      });
      const result = parser.parse(xmlString);
      return { output: JSON.stringify(result, null, 2) };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "XML 解析失败" };
    }
  }

  // === YAML ===
  function jsonToYaml(data: unknown): ConvertResult {
    try {
      const output = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });
      return { output };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "YAML 转换失败" };
    }
  }

  function yamlToJson(yamlString: string): ConvertResult {
    try {
      // Support multi-document YAML (--- separated)
      if (yamlString.includes("\n---")) {
        return yamlToJsonMultiDoc(yamlString);
      }
      const result = yaml.load(yamlString);
      return { output: JSON.stringify(result, null, 2) };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "YAML 解析失败" };
    }
  }

  // === TOML ===
  function jsonToToml(data: unknown): ConvertResult {
    try {
      const output = toml.stringify(data as Record<string, unknown>);
      return { output };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "TOML 转换失败" };
    }
  }

  function tomlToJson(tomlString: string): ConvertResult {
    try {
      const result = toml.parse(tomlString);
      return { output: JSON.stringify(result, null, 2) };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "TOML 解析失败" };
    }
  }

  // === Properties ===
  function jsonToProperties(data: unknown, prefix = ""): ConvertResult {
    try {
      const lines: string[] = [];
      flatten(data, prefix, lines);
      return { output: lines.join("\n") };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "Properties 转换失败" };
    }
  }

  function flatten(data: unknown, prefix: string, lines: string[]) {
    if (data === null || data === undefined) {
      if (prefix) lines.push(`${prefix}=`);
      return;
    }
    if (typeof data !== "object") {
      lines.push(`${prefix}=${String(data)}`);
      return;
    }
    if (Array.isArray(data)) {
      data.forEach((item, i) => {
        const key = prefix ? `${prefix}[${i}]` : `[${i}]`;
        flatten(item, key, lines);
      });
      return;
    }
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      flatten(v, key, lines);
    }
  }

  function propertiesToJson(propString: string): ConvertResult {
    try {
      const result: Record<string, string> = {};
      const lines = propString.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        result[key] = value;
      }
      if (Object.keys(result).length === 0) {
        return { output: "", error: "未找到有效的 Properties 数据" };
      }
      return { output: JSON.stringify(result, null, 2) };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "Properties 解析失败" };
    }
  }

  // === URL Params ===
  function jsonToUrlParams(data: unknown): ConvertResult {
    try {
      if (typeof data !== "object" || data === null) {
        return { output: "", error: "JSON 必须是对象类型" };
      }
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
        if (v === null || v === undefined) continue;
        if (typeof v === "object") {
          params.set(k, JSON.stringify(v));
        } else {
          params.set(k, String(v));
        }
      }
      return { output: params.toString() };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "URL Params 转换失败" };
    }
  }

  function urlParamsToJson(urlString: string): ConvertResult {
    try {
      // Remove leading ? if present
      const cleaned = urlString.startsWith("?") ? urlString.slice(1) : urlString;
      const params = new URLSearchParams(cleaned);
      const result: Record<string, string | string[]> = {};
      for (const [key, value] of params.entries()) {
        if (result[key] !== undefined) {
          if (Array.isArray(result[key])) {
            (result[key] as string[]).push(value);
          } else {
            result[key] = [result[key] as string, value];
          }
        } else {
          result[key] = value;
        }
      }
      if (Object.keys(result).length === 0) {
        return { output: "", error: "未找到有效的 URL 参数" };
      }
      return { output: JSON.stringify(result, null, 2) };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "URL Params 解析失败" };
    }
  }

  // === JSON5 ===
  function jsonToJson5(data: unknown): ConvertResult {
    try {
      const output = JSON5.stringify(data, null, 2);
      return { output };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "JSON5 序列化失败" };
    }
  }

  function json5ToJson(json5String: string): ConvertResult {
    try {
      const result = JSON5.parse(json5String);
      return { output: JSON.stringify(result, null, 2) };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "JSON5 解析失败" };
    }
  }

  // === Multi-doc YAML ===
  function yamlToJsonMultiDoc(yamlString: string): ConvertResult {
    try {
      const docs: unknown[] = [];
      yaml.loadAll(yamlString, (doc) => { docs.push(doc); });
      if (docs.length === 1) {
        return { output: JSON.stringify(docs[0], null, 2) };
      }
      return { output: JSON.stringify(docs, null, 2) };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : "YAML 多文档解析失败" };
    }
  }

  return {
    jsonTo,
    toJson,
    autoDetectToJson,
  };
}
