import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: [
      // 父项目内部使用的别名（带斜杠的优先匹配）
      { find: "@/types", replacement: path.resolve(__dirname, "../src/types") },
      { find: "@/layouts", replacement: path.resolve(__dirname, "../src/layouts") },
      { find: "@/composables", replacement: path.resolve(__dirname, "../src/composables") },
      // 复用父项目的核心代码（不带斜杠）
      { find: "@composables", replacement: path.resolve(__dirname, "../src/composables") },
      { find: "@layouts", replacement: path.resolve(__dirname, "../src/layouts") },
      { find: "@types", replacement: path.resolve(__dirname, "../src/types") },
      // 移动端自己的 @ 别名
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // 确保父项目引用的 npm 包从 mobile 的 node_modules 解析
      { find: "@tauri-apps/api", replacement: path.resolve(__dirname, "node_modules/@tauri-apps/api") },
      { find: "@tauri-apps/plugin-dialog", replacement: path.resolve(__dirname, "node_modules/@tauri-apps/plugin-dialog") },
      { find: "@tauri-apps/plugin-fs", replacement: path.resolve(__dirname, "node_modules/@tauri-apps/plugin-fs") },
    ],
  },
  clearScreen: false,
  server: {
    port: 1421,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1422 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
}));
