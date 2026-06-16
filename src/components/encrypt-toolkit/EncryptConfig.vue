<script setup lang="ts">
import type { EncryptAlgorithm, AesMode } from "../../composables/encrypt-toolkit/types";

const props = defineProps<{
  algorithm: EncryptAlgorithm;
  aesMode: AesMode;
  aesKey: string;
  aesIv: string;
  autoIv: boolean;
  rsaPublicKey: string;
  rsaPrivateKey: string;
  rsaKeyLength: 1024 | 2048 | 4096;
}>();

const emit = defineEmits<{
  "update:aesMode": [value: AesMode];
  "update:aesKey": [value: string];
  "update:aesIv": [value: string];
  "update:autoIv": [value: boolean];
  "update:rsaPublicKey": [value: string];
  "update:rsaPrivateKey": [value: string];
  "update:rsaKeyLength": [value: 1024 | 2048 | 4096];
  generateKey: [];
  generateIv: [];
  generateRsa: [];
}>();

const isAes = ["aes-128", "aes-256"].includes(props.algorithm);
const isAesCryptoJs = props.algorithm === "aes-cryptojs";
const isRsa = props.algorithm === "rsa";
const algoInfo: Record<string, { name: string; desc: string; security: string }> = {
  "aes-128": { name: "AES-128", desc: "对称加密算法，128位密钥，高性能", security: "中" },
  "aes-256": { name: "AES-256", desc: "对称加密算法，256位密钥，高安全性", security: "高" },
  "aes-cryptojs": { name: "AES-CryptoJS", desc: "CryptoJS/Java 兼容模式，Salted__ 格式", security: "高" },
  "rsa": { name: "RSA", desc: "非对称加密算法，用于安全密钥交换", security: "高" },
  "sha-256": { name: "SHA-256", desc: "不可逆哈希算法，256位摘要", security: "高" },
  "sha-512": { name: "SHA-512", desc: "不可逆哈希算法，512位摘要", security: "极高" },
  "base64": { name: "Base64", desc: "编码方式（非加密），用于数据传输", security: "无" },
};
</script>

<template>
  <aside class="encrypt-config flex flex-col flex-shrink-0 w-[260px] border-l border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
    <div class="flex-1 overflow-y-auto">
      <!-- 算法说明 -->
      <div class="px-4 pt-4 pb-3">
        <div class="config-card p-3 rounded-xl">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-semibold text-primary">{{ algoInfo[algorithm]?.name }}</span>
            <span
              class="text-[10px] px-2 py-0.5 rounded-full"
              :class="{
                'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': algoInfo[algorithm]?.security === '高' || algoInfo[algorithm]?.security === '极高',
                'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400': algoInfo[algorithm]?.security === '中',
                'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/30': algoInfo[algorithm]?.security === '无',
              }"
            >
              {{ algoInfo[algorithm]?.security }}安全
            </span>
          </div>
          <p class="text-[11px] text-tertiary leading-relaxed">{{ algoInfo[algorithm]?.desc }}</p>
        </div>
      </div>

      <!-- AES / CryptoJS 密钥输入 -->
      <template v-if="isAes || isAesCryptoJs">
        <div class="px-4 pb-3">
          <div class="flex items-center justify-between mb-1.5">
            <h3 class="config-label mb-0">密钥 (KEY)</h3>
            <button class="config-action-btn" @click="emit('generateKey')">🎲 随机</button>
          </div>
          <input
            class="config-input w-full"
            type="password"
            :value="aesKey"
            placeholder="输入密钥..."
            @input="emit('update:aesKey', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </template>

      <!-- RSA 配置 -->
      <template v-if="isRsa">
        <div class="px-4 pb-3">
          <div class="flex items-center justify-between mb-1.5">
            <h3 class="config-label mb-0">密钥对</h3>
            <button class="config-action-btn" @click="emit('generateRsa')">🔑 生成</button>
          </div>
        </div>

        <div class="px-4 pb-3">
          <h3 class="config-label">公钥</h3>
          <textarea
            class="config-textarea w-full"
            rows="4"
            :value="rsaPublicKey"
            placeholder="粘贴公钥或点击生成..."
            @input="emit('update:rsaPublicKey', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <div class="px-4 pb-3">
          <h3 class="config-label">私钥</h3>
          <textarea
            class="config-textarea w-full"
            rows="4"
            :value="rsaPrivateKey"
            placeholder="粘贴私钥或点击生成..."
            @input="emit('update:rsaPrivateKey', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.encrypt-config {
  background: rgba(0, 0, 0, 0.01);
}

:global(.dark) .encrypt-config {
  background: rgba(255, 255, 255, 0.02);
}

.config-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

:global(.dark) .config-label {
  color: rgba(255, 255, 255, 0.35);
}

.config-card {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

:global(.dark) .config-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.04);
}

.config-input,
.config-textarea {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: rgba(0, 0, 0, 0.85);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  outline: none;
  transition: all 0.15s ease;
}

:global(.dark) .config-input,
:global(.dark) .config-textarea {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.config-input:focus,
.config-textarea:focus {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.config-input::placeholder,
.config-textarea::placeholder {
  color: rgba(0, 0, 0, 0.3);
}

:global(.dark) .config-input::placeholder,
:global(.dark) .config-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.config-textarea {
  resize: none;
}

.config-action-btn {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.35);
  background: rgba(0, 0, 0, 0.03);
  transition: all 0.15s ease;
  cursor: pointer;
}

:global(.dark) .config-action-btn {
  color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.04);
}

.config-action-btn:hover {
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.08);
}

:global(.dark) .config-action-btn:hover {
  color: #60A5FA;
  background: rgba(59, 130, 246, 0.1);
}
</style>
