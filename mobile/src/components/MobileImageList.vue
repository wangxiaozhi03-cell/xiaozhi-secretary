<script setup lang="ts">
import type { ImageItem } from "@/types/index";

defineProps<{
  images: ImageItem[];
}>();

const emit = defineEmits<{
  add: [];
  remove: [id: string];
  removeLast: [];
}>();
</script>

<template>
  <div class="p-4">
    <!-- 标题和操作按钮 -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-base font-semibold text-primary">图片列表</h2>
        <p class="text-xs text-tertiary mt-0.5">{{ images.length }} 张图片</p>
      </div>
      <div class="flex gap-2">
        <button class="btn !py-2 !px-4" @click="emit('add')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
          添加
        </button>
        <button
          class="btn !py-2 !px-4 !text-rose-400"
          :disabled="images.length === 0"
          @click="emit('removeLast')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 12H4" />
          </svg>
          撤销
        </button>
      </div>
    </div>

    <!-- 图片列表 -->
    <div class="space-y-2 max-h-[50vh] overflow-y-auto">
      <div
        v-for="img in images"
        :key="img.id"
        class="flex items-center gap-3 p-3 rounded-xl glass-panel"
      >
        <img
          :src="img.thumbUrl"
          :alt="img.name"
          class="w-16 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-primary truncate">{{ img.name }}</p>
          <p class="text-xs text-tertiary mt-0.5">{{ img.width }} × {{ img.height }}</p>
        </div>
        <button
          class="touch-target text-gray-300 hover:text-rose-400 transition-colors"
          @click="emit('remove', img.id)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="images.length === 0" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
          <svg class="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm text-secondary">还没有图片</p>
        <p class="text-xs text-tertiary mt-1">点击上方「添加」按钮选择图片</p>
      </div>
    </div>
  </div>
</template>
