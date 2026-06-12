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
}
</script>

<template>
  <div class="flex flex-col">
    <div class="p-5 flex-shrink-0">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[11px] font-medium text-tertiary uppercase tracking-widest">图片</h2>
        <span class="tag">{{ images.length }} 张</span>
      </div>

      <div class="flex gap-2">
        <button class="flex-1 btn !py-2.5" @click="emit('add')">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
          添加
        </button>
        <button
          class="flex-1 btn !py-2.5 !text-rose-400 !bg-rose-50 hover:!bg-rose-100"
          :disabled="images.length === 0"
          @click="emit('removeLast')"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 12H4" />
          </svg>
          移除
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-5 pb-3 min-h-0 max-h-[180px]" @drop="onDrop" @dragover.prevent>
      <div class="space-y-1">
        <div
          v-for="img in images"
          :key="img.id"
          class="slide-in flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/50 transition-all duration-200 group"
        >
          <img
            :src="img.thumbUrl"
            :alt="img.name"
            class="w-11 h-8 object-cover rounded-lg flex-shrink-0 bg-gray-100"
          />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-primary truncate">{{ img.name }}</p>
            <p class="text-[10px] text-tertiary">{{ img.width }}×{{ img.height }}</p>
          </div>
          <button
            class="text-transparent group-hover:text-gray-300 hover:!text-rose-400 p-1 flex-shrink-0 transition-all duration-200"
            @click="emit('remove', img.id)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="images.length === 0" class="text-center py-10">
          <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
            <svg class="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-xs text-tertiary">拖拽图片到此处或点击添加</p>
        </div>
      </div>
    </div>
  </div>
</template>
