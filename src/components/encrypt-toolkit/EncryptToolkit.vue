<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import EncryptSidebar from "./EncryptSidebar.vue";
import EncryptEditor from "./EncryptEditor.vue";
import EncryptConfig from "./EncryptConfig.vue";
import EncryptActions from "./EncryptActions.vue";
import {
  processEncrypt,
  processDecrypt,
  shaHash,
  base64Encode,
  base64Decode,
  generateRandomKey,
  generateRandomIv,
  rsaGenerateKeys,
} from "../../composables/encrypt-toolkit/useEncrypt";
import type {
  EncryptAlgorithm,
  AesMode,
  OperationType,
  EncryptResult,
  HistoryItem,
} from "../../composables/encrypt-toolkit/types";

// 状态
const algorithm = ref<EncryptAlgorithm>("aes-256");
const operation = ref<OperationType>("encrypt");
const inputText = ref("");
const outputText = ref("");
const isProcessing = ref(false);
const lastResult = ref<EncryptResult | null>(null);

// AES 参数
const aesMode = ref<AesMode>("CBC");
const aesKey = ref("");
const aesIv = ref("");
const autoIv = ref(true);

// RSA 参数
const rsaPublicKey = ref("");
const rsaPrivateKey = ref("");
const rsaKeyLength = ref<2048 | 4096>(2048);

// 历史记录
const history = ref<HistoryItem[]>([]);

// 是否支持加密/解密
const canEncrypt = computed(() => ["aes-128", "aes-256", "aes-cryptojs", "rsa", "base64"].includes(algorithm.value));
const canDecrypt = computed(() => ["aes-128", "aes-256", "aes-cryptojs", "rsa", "base64"].includes(algorithm.value));
const isHash = computed(() => ["sha-256", "sha-512"].includes(algorithm.value));

// 执行操作
async function handleProcess() {
  if (!inputText.value.trim()) {
    lastResult.value = { success: false, data: "", error: "请输入内容" };
    return;
  }

  isProcessing.value = true;
  const start = performance.now();

  try {
    let result: EncryptResult;

    if (isHash.value) {
      result = shaHash(inputText.value, algorithm.value as "sha-256" | "sha-512");
      operation.value = "hash";
    } else if (operation.value === "encrypt") {
      result = processEncrypt(algorithm.value, inputText.value, {
        key: aesKey.value,
        mode: aesMode.value,
        iv: autoIv.value ? undefined : aesIv.value,
      });
    } else if (operation.value === "decrypt") {
      result = processDecrypt(algorithm.value, inputText.value, {
        key: aesKey.value,
        mode: aesMode.value,
        iv: autoIv.value ? undefined : aesIv.value,
      });
    } else if (operation.value === "encode") {
      result = base64Encode(inputText.value);
    } else {
      result = base64Decode(inputText.value);
    }

    result.duration = Math.round(performance.now() - start);
    lastResult.value = result;
    outputText.value = result.data;

    // 添加历史记录
    if (result.success) {
      history.value.unshift({
        id: Date.now().toString(),
        algorithm: algorithm.value,
        operation: operation.value,
        inputPreview: inputText.value.substring(0, 50),
        outputPreview: result.data.substring(0, 50),
        timestamp: Date.now(),
      });
      if (history.value.length > 50) history.value.pop();
    }
  } catch (e: any) {
    lastResult.value = { success: false, data: "", error: e.message || "处理失败" };
  } finally {
    isProcessing.value = false;
  }
}

// 快捷操作
function handleCopy() {
  if (outputText.value) {
    navigator.clipboard.writeText(outputText.value);
  }
}

function handleClear() {
  inputText.value = "";
  outputText.value = "";
  lastResult.value = null;
}

function handleSwap() {
  const tmp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = tmp;
}

function handleRandomKey() {
  aesKey.value = generateRandomKey(algorithm.value === "aes-128" ? 16 : 32);
}

function handleRandomIv() {
  aesIv.value = generateRandomIv();
}

async function handleGenerateRsaKeys() {
  isProcessing.value = true;
  try {
    const keys = await rsaGenerateKeys(rsaKeyLength.value);
    rsaPublicKey.value = keys.publicKey;
    rsaPrivateKey.value = keys.privateKey;
  } finally {
    isProcessing.value = false;
  }
}

function handleImportFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,.json,.md,.log,.key,.pem";
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        inputText.value = ev.target?.result as string;
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function handleExportResult() {
  if (!outputText.value) return;
  const blob = new Blob([outputText.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `encrypted_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function loadHistoryItem(item: HistoryItem) {
  algorithm.value = item.algorithm;
  operation.value = item.operation;
  inputText.value = item.inputPreview;
  outputText.value = item.outputPreview;
}

// 快捷键
function handleKeydown(e: KeyboardEvent) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modifier = isMac ? e.metaKey : e.ctrlKey;
  if (modifier && e.key === "Enter") {
    e.preventDefault();
    handleProcess();
  }
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <div class="encrypt-toolkit-root flex flex-col h-full overflow-hidden">
    <!-- 内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧：算法选择 + 历史 -->
      <EncryptSidebar
        :algorithm="algorithm"
        :history="history"
        @select="(a) => algorithm = a"
        @select-history="loadHistoryItem"
      />

      <!-- 中间：编辑区 -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- 操作类型切换 + 执行按钮 -->
        <div class="encrypt-top-bar flex-shrink-0 px-4 py-2.5 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06]">
          <div class="flex items-center gap-2">
            <!-- 操作类型 -->
            <div class="flex items-center gap-1 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
              <button
                v-if="canEncrypt"
                class="op-btn"
                :class="operation === 'encrypt' ? 'active' : ''"
                @click="operation = 'encrypt'"
              >
                🔐 加密
              </button>
              <button
                v-if="canDecrypt"
                class="op-btn"
                :class="operation === 'decrypt' ? 'active' : ''"
                @click="operation = 'decrypt'"
              >
                🔓 解密
              </button>
              <button
                v-if="isHash"
                class="op-btn active"
              >
                # 哈希
              </button>
              <button
                v-if="algorithm === 'base64'"
                class="op-btn"
                :class="operation === 'encode' ? 'active' : ''"
                @click="operation = 'encode'"
              >
                📦 编码
              </button>
              <button
                v-if="algorithm === 'base64'"
                class="op-btn"
                :class="operation === 'decode' ? 'active' : ''"
                @click="operation = 'decode'"
              >
                📦 解码
              </button>
            </div>

            <!-- 算法名 -->
            <span class="text-xs text-tertiary font-mono">{{ algorithm.toUpperCase() }}</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- 处理时间 -->
            <span v-if="lastResult?.duration" class="text-[10px] text-tertiary">
              {{ lastResult.duration }}ms
            </span>

            <!-- 执行按钮 -->
            <button
              class="encrypt-btn"
              :disabled="isProcessing || !inputText.trim()"
              @click="handleProcess"
            >
              <span v-if="isProcessing" class="animate-spin">⏳</span>
              <span v-else>{{ isHash ? '计算哈希' : operation === 'encrypt' ? '🔐 加密' : '🔓 解密' }}</span>
            </button>
          </div>
        </div>

        <!-- 双栏编辑区 -->
        <div class="flex-1 flex overflow-hidden">
          <!-- 输入区 -->
          <EncryptEditor
            v-model="inputText"
            title="原文 / 待处理内容"
            class="w-1/2 min-w-0"
            @import-file="handleImportFile"
            @clear="inputText = ''"
          />

          <!-- 中间箭头 + 快捷操作 -->
          <div class="flex flex-col items-center justify-center w-12 flex-shrink-0 border-x border-black/[0.04] dark:border-white/[0.04]">
            <EncryptActions
              :can-swap="!!outputText"
              :can-copy="!!outputText"
              :can-export="!!outputText"
              @swap="handleSwap"
              @copy="handleCopy"
              @clear="handleClear"
              @export-result="handleExportResult"
              @random-key="handleRandomKey"
              @random-iv="handleRandomIv"
            />
          </div>

          <!-- 输出区 -->
          <EncryptEditor
            v-model="outputText"
            title="加密结果 / 输出"
            class="w-1/2 min-w-0"
            readonly
            :result="lastResult"
          />
        </div>
      </div>

      <!-- 右侧：配置面板 -->
      <EncryptConfig
        :algorithm="algorithm"
        :aes-mode="aesMode"
        :aes-key="aesKey"
        :aes-iv="aesIv"
        :auto-iv="autoIv"
        :rsa-public-key="rsaPublicKey"
        :rsa-private-key="rsaPrivateKey"
        :rsa-key-length="rsaKeyLength"
        @update:aes-mode="aesMode = $event"
        @update:aes-key="aesKey = $event"
        @update:aes-iv="aesIv = $event"
        @update:auto-iv="autoIv = $event"
        @update:rsa-public-key="rsaPublicKey = $event"
        @update:rsa-private-key="rsaPrivateKey = $event"
        @update:rsa-key-length="rsaKeyLength = $event"
        @generate-key="handleRandomKey"
        @generate-iv="handleRandomIv"
        @generate-rsa="handleGenerateRsaKeys"
      />
    </div>

    <!-- 底部状态栏 -->
    <div class="encrypt-status-bar flex-shrink-0 px-4 py-1.5 flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.06]">
      <div class="flex items-center gap-3 text-[11px] text-tertiary">
        <span>算法: {{ algorithm.toUpperCase() }}</span>
        <span>输入: {{ inputText.length }} 字符</span>
        <span>输出: {{ outputText.length }} 字符</span>
      </div>
      <div class="flex items-center gap-3 text-[11px] text-tertiary">
        <span v-if="lastResult?.success" class="text-emerald-600 dark:text-emerald-400">✓ 成功</span>
        <span v-else-if="lastResult?.error" class="text-rose-600 dark:text-rose-400">✗ {{ lastResult.error }}</span>
        <span v-else>就绪</span>
        <span>⌘Enter 执行</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.encrypt-toolkit-root {
  position: relative;
}

.encrypt-top-bar {
  background: rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(20px);
}

:global(.dark) .encrypt-top-bar {
  background: rgba(255, 255, 255, 0.03);
}

.op-btn {
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.35);
  transition: all 0.2s ease;
  cursor: pointer;
}

:global(.dark) .op-btn {
  color: rgba(255, 255, 255, 0.35);
}

.op-btn:hover {
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark) .op-btn:hover {
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.06);
}

.op-btn.active {
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.08);
}

:global(.dark) .op-btn.active {
  color: #60A5FA;
  background: rgba(59, 130, 246, 0.12);
}

.encrypt-btn {
  padding: 8px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #3B82F6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;
}

.encrypt-btn:hover:not(:disabled) {
  background: #2563EB;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.encrypt-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.encrypt-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.encrypt-status-bar {
  background: rgba(0, 0, 0, 0.01);
}

:global(.dark) .encrypt-status-bar {
  background: rgba(255, 255, 255, 0.02);
}
</style>
