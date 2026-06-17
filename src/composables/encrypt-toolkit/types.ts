/** 加密算法类型 */
export type EncryptAlgorithm =
  | "aes-128"
  | "aes-256"
  | "aes-cryptojs"
  | "rsa"
  | "sha-256"
  | "sha-512"
  | "base64";

/** 算法分类 */
export type AlgorithmCategory = "symmetric" | "asymmetric" | "hash" | "encoding";

/** AES 模式 */
export type AesMode = "CBC" | "GCM" | "ECB";

/** 输入格式 */
export type InputFormat = "text" | "json" | "hex";

/** 输出格式 */
export type OutputFormat = "text" | "base64" | "hex";

/** 操作类型 */
export type OperationType = "encrypt" | "decrypt" | "hash" | "encode" | "decode";

/** 算法配置 */
export interface AlgorithmConfig {
  id: EncryptAlgorithm;
  name: string;
  category: AlgorithmCategory;
  description: string;
  icon: string;
  supportsEncrypt: boolean;
  supportsDecrypt: boolean;
  supportsHash: boolean;
}

/** AES 参数 */
export interface AesParams {
  mode: AesMode;
  key: string;
  iv: string;
  autoIv: boolean;
}

/** RSA 参数 */
export interface RsaParams {
  publicKey: string;
  privateKey: string;
  keyLength: 1024 | 2048 | 4096;
}

/** 操作结果 */
export interface EncryptResult {
  success: boolean;
  data: string;
  error?: string;
  duration?: number;
}

/** 历史记录 */
export interface HistoryItem {
  id: string;
  algorithm: EncryptAlgorithm;
  operation: OperationType;
  inputPreview: string;
  outputPreview: string;
  timestamp: number;
}
