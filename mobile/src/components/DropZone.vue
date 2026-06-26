<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  dropFiles: [files: File[]];
}>();

const isDragging = ref(false);
let dragCounter = 0;

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  dragCounter++;
  if (e.dataTransfer?.types.includes("Files")) {
    isDragging.value = true;
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  dragCounter = 0;

  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const imageFiles: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith("image/")) {
      imageFiles.push(file);
    }
  }

  if (imageFiles.length > 0) {
    emit("dropFiles", imageFiles);
  }
}
</script>

<template>
  <div
    class="relative w-full h-full"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- 默认内容 -->
    <slot />

    <!-- 拖拽遮罩 -->
    <Transition name="fade">
      <div
        v-if="isDragging"
        class="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-400 rounded-2xl"
      >
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-lg font-semibold text-blue-600">松开添加图片</p>
          <p class="text-sm text-blue-400 mt-1">支持 PNG、JPG、WEBP、BMP</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
