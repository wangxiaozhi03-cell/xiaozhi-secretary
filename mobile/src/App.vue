<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { LayoutKey } from "@/types/index";
import { useImages } from "@/composables/useImages";
import { usePageSettings } from "@/composables/usePageSettings";
import { useLayout } from "@/composables/useLayout";
import { useExport } from "@/composables/useExport";
import { useOverrides, computePageRanges } from "@/composables/useOverrides";

// 移动端组件
import MobileHomePage from "./components/MobileHomePage.vue";
import MobileProfilePage from "./components/MobileProfilePage.vue";
import MobilePreview from "./components/MobilePreview.vue";
import MobileImageList from "./components/MobileImageList.vue";
import MobileLayoutPicker from "./components/MobileLayoutPicker.vue";
import MobileExportPanel from "./components/MobileExportPanel.vue";
import MobilePageThumbnails from "./components/MobilePageThumbnails.vue";
import FloatingBall from "./components/FloatingBall.vue";
import DropZone from "./components/DropZone.vue";

// 页面状态
type PageKey = "home" | "tool" | "profile";
type NavKey = "home" | "profile";
type ToolTabKey = "images" | "layout" | "export";

const currentPage = ref<PageKey>("home");
const activeNav = ref<NavKey>("home");
const activeToolTab = ref<ToolTabKey>("images");
const showToolPanel = ref(false);
const currentTool = ref<string>("");

// 核心逻辑（复用桌面端 composables）
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

const currentPreviewPage = ref(0);

watch(() => images.value.length, () => {
  currentPreviewPage.value = 0;
});

function handlePageSettingsUpdate(key: string, value: string | number | null) {
  if (key === "imagesPerPage") {
    setImagesPerPage(value as LayoutKey | null);
  } else {
    (settings as Record<string, unknown>)[key] = value;
  }
}

function prevPage() {
  if (currentPreviewPage.value > 0) currentPreviewPage.value--;
}

function nextPage() {
  if (currentPreviewPage.value < pages.value.length - 1) currentPreviewPage.value++;
}

function goToPage(pageIndex: number) {
  if (pageIndex >= 0 && pageIndex < pages.value.length) {
    currentPreviewPage.value = pageIndex;
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

function closeToolPanel() {
  showToolPanel.value = false;
}

// 处理悬浮球选择
function handleFloatingBallSelect(tab: string) {
  activeToolTab.value = tab as ToolTabKey;
  showToolPanel.value = true;
}

// 导航到工具
function navigateToTool(toolId: string) {
  currentTool.value = toolId;
  currentPage.value = "tool";
  activeNav.value = "home";
}

// 返回首页
function goHome() {
  currentPage.value = "home";
  activeNav.value = "home";
  showToolPanel.value = false;
}

// 导航到个人页面
function goToProfile() {
  currentPage.value = "profile";
  activeNav.value = "profile";
  showToolPanel.value = false;
}

// 处理底部导航
function handleNavClick(nav: NavKey) {
  if (nav === "home") {
    goHome();
  } else if (nav === "profile") {
    goToProfile();
  }
}

// 处理拖拽放入的文件
function handleDropFiles(files: File[]) {
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 生成缩略图
        const canvas = document.createElement("canvas");
        const maxSize = 200;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = (h / w) * maxSize;
            w = maxSize;
          } else {
            w = (w / h) * maxSize;
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const thumbUrl = canvas.toDataURL("image/jpeg", 0.8);

        // 添加到图片列表
        images.value.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          path: file.name,
          width: img.width,
          height: img.height,
          thumbUrl: thumbUrl,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

// 底部导航配置
const navItems: { key: NavKey; label: string; icon: string }[] = [
  { key: "home", label: "首页", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "profile", label: "我的", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
];
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden toolbox-bg relative">
    <!-- 顶部状态栏占位（iOS safe area） -->
    <div class="safe-area-top flex-shrink-0" />

    <!-- 顶部标题栏（工具页面显示） -->
    <div v-if="currentPage === 'tool'" class="flex-shrink-0 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- 返回按钮 -->
        <button class="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center" @click="goHome">
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-lg font-semibold text-primary">图片排版</h1>
          <p v-if="images.length > 0" class="text-xs text-tertiary">
            {{ images.length }} 张图片 · {{ pages.length }} 页
          </p>
        </div>
      </div>
      <!-- 页面切换 -->
      <div v-if="pages.length > 1" class="flex items-center gap-2">
        <button class="btn-icon" @click="prevPage">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-sm text-secondary tabular-nums">{{ currentPreviewPage + 1 }}/{{ pages.length }}</span>
        <button class="btn-icon" @click="nextPage">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <!-- 首页 -->
      <div v-if="currentPage === 'home'" class="h-full">
        <MobileHomePage @navigate="navigateToTool" />
      </div>

      <!-- 个人页面 -->
      <div v-else-if="currentPage === 'profile'" class="h-full">
        <MobileProfilePage />
      </div>

      <!-- 工具页面 -->
      <div v-else-if="currentPage === 'tool'" class="h-full flex flex-col">
        <!-- 预览内容 -->
        <div class="flex-1 min-h-0">
          <DropZone @drop-files="handleDropFiles">
            <MobilePreview
              :images="images"
              :pages="mergedPages"
              :base-pages="pages"
              :settings="settings"
              :current-page="currentPreviewPage"
              :overrides="overrides"
              @set-image-offset="(imgIdx, ox, oy) => setImageOffset(currentPreviewPage, imgIdx, ox, oy)"
              @set-page-slots="(slots) => setPageSlots(currentPreviewPage, slots)"
              @drop-on-slot="handleDropOnSlot"
            />
          </DropZone>
        </div>

        <!-- 底部页面缩略图 -->
        <div v-if="pages.length > 1" class="flex-shrink-0 border-t border-black/5 bg-white/50 backdrop-blur-sm">
          <MobilePageThumbnails
            :images="images"
            :pages="mergedPages"
            :settings="settings"
            :current-page="currentPreviewPage"
            @go-to-page="goToPage"
          />
        </div>
      </div>

      <!-- 悬浮球（工具页面显示） -->
      <FloatingBall
        v-if="currentPage === 'tool'"
        :active-tab="activeToolTab"
        @select="handleFloatingBallSelect"
      />
    </div>

    <!-- 工具面板（右侧滑出） -->
    <Transition name="overlay">
      <div
        v-if="showToolPanel && currentPage === 'tool'"
        class="fixed inset-0 bg-black/30 z-40"
        @click="closeToolPanel"
      />
    </Transition>

    <Transition name="slide-right">
      <div
        v-if="showToolPanel && currentPage === 'tool'"
        class="fixed top-0 right-0 bottom-0 z-50 w-72 glass-card flex flex-col"
      >
        <!-- 面板标题 -->
        <div class="flex-shrink-0 px-4 py-3 flex items-center justify-between border-b border-black/5">
          <h2 class="text-base font-semibold text-primary">
            {{ activeToolTab === 'images' ? '图片列表' : activeToolTab === 'layout' ? '布局' : '导出文档' }}
          </h2>
          <button class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5" @click="closeToolPanel">
            <span class="text-gray-400">✕</span>
          </button>
        </div>

        <!-- 面板内容 -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <MobileImageList
            v-if="activeToolTab === 'images'"
            :images="images"
            @add="openFileDialog"
            @remove="removeImage"
            @remove-last="removeLastImage"
          />
          <MobileLayoutPicker
            v-else-if="activeToolTab === 'layout'"
            :layouts="availableLayouts"
            :active-index="activeLayoutIndex"
            :image-count="images.length"
            :settings="settings"
            @select="selectLayout"
            @update-settings="handlePageSettingsUpdate"
          />
          <MobileExportPanel
            v-else-if="activeToolTab === 'export'"
            :image-count="images.length"
            :page-count="pages.length"
            @export-pdf="exportPdf"
            @export-docx="exportDocx"
          />
        </div>
      </div>
    </Transition>

    <!-- 底部导航栏 -->
    <div class="bottom-nav safe-area-bottom">
      <button
        v-for="nav in navItems"
        :key="nav.key"
        class="nav-item"
        :class="{ active: activeNav === nav.key }"
        @click="handleNavClick(nav.key)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="nav.icon" />
        </svg>
        <span class="nav-label">{{ nav.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 底部导航栏 */
.bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(0, 0, 0, 0.06);
  z-index: 30;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(0, 0, 0, 0.35);
}

.nav-item.active {
  color: #3B82F6;
}

.nav-item:active {
  transform: scale(0.92);
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
}

/* 右侧滑出面板动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 遮罩层动画 */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
