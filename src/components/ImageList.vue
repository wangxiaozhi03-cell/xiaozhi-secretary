<script setup lang="ts">
import type { ImageItem } from "@/types";

defineProps<{
  images: ImageItem[];
}>();

const emit = defineEmits<{
  add: [];
  remove: [id: string];
  removeLast: [];
}>();

function onDrop(e: DragEvent) {
  e.preventDefault();
  // Tauri 拖拽处理后续实现
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 flex-shrink-0">
      <div class="flex items-center justify-between mb-2.5">
        <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">图片</h2>
        <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
          {{ images.length }} 张
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-1.5 mb-3">
        <button
          class="flex-1 border-2 border-dashed border-gray-200 rounded-lg py-2 text-xs text-gray-400 flex items-center justify-center gap-1 hover:border-blue-400 hover:text-blue-500 transition-colors"
          @click="emit('add')"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          添加
        </button>
        <button
          class="flex-1 border-2 border-dashed border-red-100 rounded-lg py-2 text-xs text-red-300 flex items-center justify-center gap-1 hover:border-red-300 hover:text-red-400 transition-colors"
          :disabled="images.length === 0"
          @click="emit('removeLast')"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
          移除
        </button>
      </div>
    </div>

    <!-- 图片列表 -->
    <div class="flex-1 overflow-y-auto px-4 pb-4 min-h-0" @drop="onDrop" @dragover.prevent>
      <div class="space-y-1">
        <div
          v-for="img in images"
          :key="img.id"
          class="img-enter flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img
            :src="img.thumbUrl"
            :alt="img.name"
            class="w-12 h-9 object-cover rounded flex-shrink-0 bg-gray-100"
          />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-gray-700 truncate">{{ img.name }}</p>
            <p class="text-xs text-gray-400">{{ img.width }}×{{ img.height }}</p>
          </div>
          <button
            class="text-gray-300 hover:text-red-400 p-0.5 flex-shrink-0"
            @click="emit('remove', img.id)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 空状态 -->
        <div v-if="images.length === 0" class="text-center py-8">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-xs text-gray-400">拖拽图片到此处或点击添加</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.img-enter {
  animation: slideIn 0.2s ease;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
