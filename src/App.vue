<script setup lang="ts">
import { ref, watch } from "vue";
import AppHeader from "./components/AppHeader.vue";
import ImageList from "./components/ImageList.vue";
import PageSettings from "./components/PageSettings.vue";
import LayoutPicker from "./components/LayoutPicker.vue";
import DocumentPreview from "./components/DocumentPreview.vue";
import PreviewToolbar from "./components/PreviewToolbar.vue";
import PageThumbnails from "./components/PageThumbnails.vue";
import type { LayoutKey } from "./types";
import { useImages } from "./composables/useImages";
import { usePageSettings } from "./composables/usePageSettings";
import { useLayout } from "./composables/useLayout";
import { useExport } from "./composables/useExport";

const { images, removeImage, removeLastImage, openFileDialog } = useImages();
const { settings, setImagesPerPage } = usePageSettings();
const {
  availableLayouts,
  activeLayoutIndex,
  selectLayout,
  pages,
} = useLayout(() => images.value, () => settings);
const { exportPdf, exportDocx } = useExport(
  () => images.value,
  () => pages.value,
  () => settings
);

const currentPage = ref(0);
const showLeftPanel = ref(true);
const showRightPanel = ref(true);

// 图片数量变化时重置页码
watch(() => images.value.length, () => {
  currentPage.value = 0;
});

function handlePageSettingsUpdate(key: string, value: string | number | null) {
  if (key === "imagesPerPage") {
    setImagesPerPage(value as LayoutKey | null);
  } else {
    (settings as Record<string, unknown>)[key] = value;
  }
}

function prevPage() {
  if (currentPage.value > 0) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < pages.value.length - 1) currentPage.value++;
}

function goToPage(pageIndex: number) {
  if (pageIndex >= 0 && pageIndex < pages.value.length) {
    currentPage.value = pageIndex;
  }
}

function toggleLeftPanel() {
  showLeftPanel.value = !showLeftPanel.value;
}

function toggleRightPanel() {
  showRightPanel.value = !showRightPanel.value;
}
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gray-50">
    <AppHeader
      :image-count="images.length"
      :page-count="pages.length"
      @export-pdf="exportPdf"
      @export-docx="exportDocx"
    />

    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧图片面板 -->
      <aside
        class="bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden transition-all duration-300"
        :class="showLeftPanel ? 'w-64' : 'w-10'"
      >
        <!-- 折叠按钮 -->
        <button
          class="h-8 flex items-center justify-center hover:bg-gray-100 border-b border-gray-200 text-gray-500"
          @click="toggleLeftPanel"
        >
          <svg
            class="w-4 h-4 transition-transform"
            :class="showLeftPanel ? 'rotate-0' : 'rotate-180'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <!-- 图片列表内容 -->
        <div v-if="showLeftPanel" class="flex-1 overflow-hidden flex flex-col">
          <ImageList
            class="flex-1 min-h-0"
            :images="images"
            @add="openFileDialog"
            @remove="removeImage"
            @remove-last="removeLastImage"
          />
        </div>
      </aside>

      <!-- 中间预览区 -->
      <main class="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0 transition-all duration-300">
        <PreviewToolbar
          :current-page="currentPage"
          :total-pages="pages.length"
          @prev="prevPage"
          @next="nextPage"
        />
        <DocumentPreview
          :images="images"
          :pages="pages"
          :settings="settings"
          :current-page="currentPage"
        />
        <!-- 底部缩略图导航（始终显示） -->
        <PageThumbnails
          :images="images"
          :pages="pages"
          :settings="settings"
          :current-page="currentPage"
          @go-to-page="goToPage"
        />
      </main>

      <!-- 右侧设置面板 -->
      <aside
        class="bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden transition-all duration-300"
        :class="showRightPanel ? 'w-72' : 'w-10'"
      >
        <!-- 折叠按钮 -->
        <button
          class="h-8 flex items-center justify-center hover:bg-gray-100 border-b border-gray-200 text-gray-500"
          @click="toggleRightPanel"
        >
          <svg
            class="w-4 h-4 transition-transform"
            :class="showRightPanel ? 'rotate-0' : 'rotate-180'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        <!-- 设置内容 -->
        <div v-if="showRightPanel" class="flex-1 overflow-y-auto">
          <PageSettings
            :settings="settings"
            :image-count="images.length"
            @update="handlePageSettingsUpdate"
          />
          <LayoutPicker
            :layouts="availableLayouts"
            :active-index="activeLayoutIndex"
            :image-count="images.length"
            @select="selectLayout"
          />
        </div>
      </aside>
    </div>
  </div>
</template>
