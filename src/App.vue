<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettings } from "./composables/settings/useSettings";
import ToolboxNav from "./components/ToolboxNav.vue";
import TopBar from "./components/TopBar.vue";
import HomePage from "./components/HomePage.vue";
import AppHeader from "./components/AppHeader.vue";
import ImageList from "./components/ImageList.vue";
import PageSettings from "./components/PageSettings.vue";
import LayoutPicker from "./components/LayoutPicker.vue";
import DocumentPreview from "./components/DocumentPreview.vue";
import PreviewToolbar from "./components/PreviewToolbar.vue";
import PageThumbnails from "./components/PageThumbnails.vue";
import JsonToolkit from "./components/json-toolkit/JsonToolkit.vue";
import MdToolkit from "./components/md-toolkit/MdToolkit.vue";
import CurlToolkit from "./components/curl-toolkit/CurlToolkit.vue";
import NameCaseStudio from "./components/namecase/NameCaseStudio.vue";
import JavaGenerator from "./components/java-generator/JavaGenerator.vue";
import JavaPackager from "./components/java-packager/JavaPackager.vue";
import SqlToolkit from "./components/sql-toolkit/SqlToolkit.vue";
import ToolBackground from "./components/ToolBackground.vue";
import type { LayoutKey } from "./types";
import { useImages } from "./composables/useImages";
import { usePageSettings } from "./composables/usePageSettings";
import { useLayout } from "./composables/useLayout";
import { useExport } from "./composables/useExport";
import { useOverrides, computePageRanges } from "./composables/useOverrides";

const activeModule = ref<"home" | "image-layout" | "json-toolkit" | "md-toolkit" | "curl-toolkit" | "namecase" | "java-generator" | "java-packager" | "sql-toolkit">("home");

// Window close behavior
const { settings: appSettings } = useSettings();
let unlistenClose: (() => void) | null = null;

onMounted(async () => {
  const win = getCurrentWindow();
  unlistenClose = await win.listen("close-requested", async () => {
    if (appSettings.closeAction === "minimize") {
      await win.hide();
    } else {
      await win.close();
    }
  });
});

onUnmounted(() => {
  unlistenClose?.();
});

const { images, removeImage, removeLastImage, openFileDialog, reorderImages } = useImages();
const { settings, setImagesPerPage } = usePageSettings();
const {
  availableLayouts,
  activeLayoutIndex,
  selectLayout,
  pages,
  layoutKey,
} = useLayout(() => images.value, () => settings);

const {
  overrides,
  setImageOffset,
  setPageSlots,
  getMergedPages,
  resetAllOverrides,
} = useOverrides();

const mergedPages = computed(() => getMergedPages(pages.value));

const { exportPdf, exportDocx } = useExport(
  () => images.value,
  () => mergedPages.value,
  () => settings,
  (pageIndex) => overrides[pageIndex]
);

watch([layoutKey, activeLayoutIndex, () => images.value.length], () => {
  resetAllOverrides();
});

const currentPage = ref(0);
const showRightPanel = ref(true);

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

function handleDropOnSlot(fromPage: number, fromSlot: number, toPage: number, toSlot: number) {
  const merged = mergedPages.value;
  const fromPageData = merged[fromPage];
  const toPageData = merged[toPage];
  if (!fromPageData || !toPageData) return;

  const fromImageIdx = fromPageData.imageIndices[fromSlot];
  if (fromImageIdx === undefined) return;

  const ranges = computePageRanges(merged);
  const toRange = ranges[toPage];
  if (!toRange) return;
  let targetAbsIndex = toRange.start + toSlot;

  if (targetAbsIndex > fromImageIdx) {
    targetAbsIndex = Math.max(0, targetAbsIndex - 1);
  }

  if (targetAbsIndex === fromImageIdx) return;
  reorderImages(fromImageIdx, targetAbsIndex);
}
</script>

<template>
  <div class="toolbox-bg h-screen flex overflow-hidden">
    <!-- 左侧导航栏 -->
    <ToolboxNav
      :active-module="activeModule"
      @select="(m) => activeModule = m as any"
    />

    <!-- 右侧主区域 -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- 顶部导航栏（仅首页显示） -->
      <Transition name="fade-slide">
        <TopBar v-if="activeModule === 'home'" />
      </Transition>

      <!-- 内容区 -->
      <div class="flex-1 flex flex-col overflow-hidden py-2 px-2 relative">
        <!-- 工具页面微光背景 -->
        <Transition name="bg-fade">
          <ToolBackground v-if="activeModule !== 'home'" />
        </Transition>
        <div class="relative z-1 flex-1 flex flex-col overflow-hidden min-h-0">
          <Transition name="module-fade" mode="out-in">
            <!-- 首页 -->
            <HomePage v-if="activeModule === 'home'" key="home" @navigate="(m) => activeModule = m as any" />

            <!-- 图片工具模块 -->
            <div v-else-if="activeModule === 'image-layout'" key="image-layout" class="flex-1 flex flex-col overflow-hidden">
              <AppHeader
                :image-count="images.length"
                :page-count="pages.length"
                @export-pdf="exportPdf"
                @export-docx="exportDocx"
              />
              <div class="flex-1 flex overflow-hidden gap-2 mt-2">
                <div class="flex-1 flex flex-col overflow-hidden min-w-0">
                  <div class="glass-card flex-1 overflow-hidden flex flex-col">
                    <PreviewToolbar
                      :current-page="currentPage"
                      :total-pages="pages.length"
                      @prev="prevPage"
                      @next="nextPage"
                    />
                    <DocumentPreview
                      :images="images"
                      :pages="mergedPages"
                      :base-pages="pages"
                      :settings="settings"
                      :current-page="currentPage"
                      :overrides="overrides"
                      @set-image-offset="(imgIdx, ox, oy) => setImageOffset(currentPage, imgIdx, ox, oy)"
                      @set-page-slots="(slots) => setPageSlots(currentPage, slots)"
                      @drop-on-slot="handleDropOnSlot"
                    />
                    <PageThumbnails
                      :images="images"
                      :pages="mergedPages"
                      :settings="settings"
                      :current-page="currentPage"
                      @go-to-page="goToPage"
                    />
                  </div>
                </div>

                <aside
                  class="glass-panel flex flex-col flex-shrink-0 overflow-hidden transition-all duration-300"
                  :class="showRightPanel ? 'w-60' : 'w-10'"
                >
                  <button
                    class="h-9 flex items-center justify-center hover:bg-black/[0.02] transition-colors text-tertiary"
                    @click="showRightPanel = !showRightPanel"
                  >
                    <svg
                      class="w-4 h-4 transition-transform duration-300"
                      :class="showRightPanel ? 'rotate-0' : 'rotate-180'"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div v-if="showRightPanel" class="flex-1 overflow-y-auto">
                    <div class="max-h-[280px] overflow-hidden flex flex-col">
                      <ImageList
                        :images="images"
                        @add="openFileDialog"
                        @remove="removeImage"
                        @remove-last="removeLastImage"
                      />
                    </div>
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

            <!-- JSON 工具模块 -->
            <JsonToolkit v-else-if="activeModule === 'json-toolkit'" key="json-toolkit" />

            <!-- MD 工具模块 -->
            <MdToolkit v-else-if="activeModule === 'md-toolkit'" key="md-toolkit" />

            <!-- Curl 重放工具模块 -->
            <CurlToolkit v-else-if="activeModule === 'curl-toolkit'" key="curl-toolkit" />

            <!-- NameCase Studio 命名转换模块 -->
            <NameCaseStudio v-else-if="activeModule === 'namecase'" key="namecase" />

            <!-- Java 代码生成模块 -->
            <JavaGenerator v-else-if="activeModule === 'java-generator'" key="java-generator" />

            <!-- Java 打包工具模块 -->
            <JavaPackager v-else-if="activeModule === 'java-packager'" key="java-packager" />
            <SqlToolkit v-else-if="activeModule === 'sql-toolkit'" key="sql-toolkit" />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.module-fade-enter-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.module-fade-leave-active {
  transition: opacity 0.18s ease-in, transform 0.18s ease-in;
}
.module-fade-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.98);
}
.module-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.99);
}

.fade-slide-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-slide-leave-active { transition: all 0.2s ease-in; }
.fade-slide-enter-from { opacity: 0; transform: translateY(-10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-6px); }

.bg-fade-enter-active { transition: opacity 0.6s ease; }
.bg-fade-leave-active { transition: opacity 0.4s ease; }
.bg-fade-enter-from { opacity: 0; }
.bg-fade-leave-to { opacity: 0; }
</style>
