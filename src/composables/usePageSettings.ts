import { computed, reactive } from "vue";
import type { PageSettings, LayoutKey } from "@/types";
import { getPaperDimensions } from "@/types/papers";

export function usePageSettings() {
  const settings = reactive<PageSettings>({
    paperSize: "A4",
    orientation: "landscape",
    gapMode: "gapped",
    gapMm: 8,
    imagesPerPage: null, // null = 自动
  });

  const paperDimensions = computed(() =>
    getPaperDimensions(settings.paperSize, settings.orientation)
  );

  function setImagesPerPage(val: LayoutKey | null) {
    settings.imagesPerPage = val;
  }

  return {
    settings,
    paperDimensions,
    setImagesPerPage,
  };
}
