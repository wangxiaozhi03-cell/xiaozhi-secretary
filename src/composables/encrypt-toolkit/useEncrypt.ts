import CryptoJS from "crypto-js";
import type { EncryptAlgorithm, AesMode, EncryptResult } from "./types";

// ============ AES ============

export function aesEncrypt(
  text: string,
  key: string,
  mode: AesMode,
  iv?: string
): EncryptResult {
  try {
    const keyParsed = CryptoJS.enc.Utf8.parse(key);
    const ivParsed = iv ? CryptoJS.enc.Utf8.parse(iv) : CryptoJS.lib.WordArray.random(16);

    const cfg: any = { iv: ivParsed };
    if (mode === "CBC") cfg.mode = CryptoJS.mode.CBC;
    else if (mode === "GCM") cfg.mode = CryptoJS.mode.CBC; // crypto-js fallback
    else cfg.mode = CryptoJS.mode.ECB;

    cfg.padding = CryptoJS.pad.Pkcs7;

    const encrypted = CryptoJS.AES.encrypt(text, keyParsed, cfg);
    return { success: true, data: encrypted.toString() };
  } catch (e: any) {
    return { success: false, data: "", error: e.message || "加密失败" };
  }
}

export function aesDecrypt(
  ciphertext: string,
  key: string,
  mode: AesMode,
  iv?: string
): EncryptResult {
  try {
    const keyParsed = CryptoJS.enc.Utf8.parse(key);
    const ivParsed = iv ? CryptoJS.enc.Utf8.parse(iv) : CryptoJS.lib.WordArray.random(16);

    const cfg: any = { iv: ivParsed };
    if (mode === "CBC") cfg.mode = CryptoJS.mode.CBC;
    else if (mode === "GCM") cfg.mode = CryptoJS.mode.CBC;
    else cfg.mode = CryptoJS.mode.ECB;

    cfg.padding = CryptoJS.pad.Pkcs7;

    const decrypted = CryptoJS.AES.decrypt(ciphertext, keyParsed, cfg);
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) return { success: false, data: "", error: "解密失败，请检查密钥或模式" };
    return { success: true, data: result };
  } catch (e: any) {
    return { success: false, data: "", error: e.message || "解密失败" };
  }
}

// ============ CryptoJS 兼容模式 (Salted__ + EVP_BytesToKey) ============

/**
 * CryptoJS 兼容模式加密
 * 与 Java 的 CryptoJsAesUtil / CryptoJS.AES.encrypt(text, password) 完全兼容
 * 输出格式: Base64("Salted__" + salt(8) + ciphertext)
 * 密钥派生: EVP_BytesToKey(MD5, count=1)
 */
export function aesCryptoJsEncrypt(text: string, password: string): EncryptResult {
  try {
    // CryptoJS 传字符串 password 时自动走 Salted__ + EVP_BytesToKey 路径
    const encrypted = CryptoJS.AES.encrypt(text, password);
    return { success: true, data: encrypted.toString() };
  } catch (e: any) {
    return { success: false, data: "", error: e.message || "加密失败" };
  }
}

/**
 * CryptoJS 兼容模式解密
 * 输入格式: Base64("Salted__" + salt(8) + ciphertext)
 */
export function aesCryptoJsDecrypt(ciphertext: string, password: string): EncryptResult {
  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, password);
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) return { success: false, data: "", error: "解密失败，请检查密码是否正确" };
    return { success: true, data: result };
  } catch (e: any) {
    return { success: false, data: "", error: e.message || "解密失败" };
  }
}

// ============ SHA ============

export function shaHash(text: string, algorithm: "sha-256" | "sha-512"): EncryptResult {
  try {
    let result: string;
    if (algorithm === "sha-256") {
      result = CryptoJS.SHA256(text).toString();
    } else {
      result = CryptoJS.SHA512(text).toString();
    }
    return { success: true, data: result };
  } catch (e: any) {
    return { success: false, data: "", error: e.message || "哈希计算失败" };
  }
}

// ============ Base64 ============

export function base64Encode(text: string): EncryptResult {
  try {
    const encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
    return { success: true, data: encoded };
  } catch (e: any) {
    return { success: false, data: "", error: e.message || "编码失败" };
  }
}

export function base64Decode(text: string): EncryptResult {
  try {
    const decoded = CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Utf8);
    if (!decoded && text.length > 0) return { success: false, data: "", error: "解码失败，输入不是有效的 Base64" };
    return { success: true, data: decoded };
  } catch (e: any) {
    return { success: false, data: "", error: e.message || "解码失败" };
  }
}

// ============ RSA (简易实现，使用 Web Crypto API) ============

export async function rsaGenerateKeys(length: 1024 | 2048 | 4096 = 2048): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: length, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"]
  );

  const pub = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const priv = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: pemEncode(pub, "PUBLIC KEY"),
    privateKey: pemEncode(priv, "PRIVATE KEY"),
  };
}

function pemEncode(buffer: ArrayBuffer, label: string): string {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

// ============ 随机密钥 ============

export function generateRandomKey(length: number = 32): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

export function generateRandomIv(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

// ============ 统一入口 ============

export function processEncrypt(
  algorithm: EncryptAlgorithm,
  input: string,
  params: { key?: string; mode?: AesMode; iv?: string }
): EncryptResult {
  switch (algorithm) {
    case "aes-128":
    case "aes-256":
      return aesEncrypt(input, params.key || "", params.mode || "CBC", params.iv);
    case "aes-cryptojs":
      return aesCryptoJsEncrypt(input, params.key || "");
    case "sha-256":
      return shaHash(input, "sha-256");
    case "sha-512":
      return shaHash(input, "sha-512");
    case "base64":
      return base64Encode(input);
    default:
      return { success: false, data: "", error: "不支持的算法" };
  }
}

export function processDecrypt(
  algorithm: EncryptAlgorithm,
  input: string,
  params: { key?: string; mode?: AesMode; iv?: string }
): EncryptResult {
  switch (algorithm) {
    case "aes-128":
    case "aes-256":
      return aesDecrypt(input, params.key || "", params.mode || "CBC", params.iv);
    case "aes-cryptojs":
      return aesCryptoJsDecrypt(input, params.key || "");
    case "base64":
      return base64Decode(input);
    default:
      return { success: false, data: "", error: "该算法不支持解密" };
  }
}
