import { ref } from "vue";
import type { ImageItem } from "@/types";
import { invoke } from "@tauri-apps/api/core";

let nextId = 1;

export function useImages() {
  const images = ref<ImageItem[]>([]);

  async function addImages(paths: string[]) {
    for (const path of paths) {
      try {
        // 并行读取元数据和 data URL
        const [meta, thumbUrl] = await Promise.all([
          invoke<{ width: number; height: number }>("read_image_metadata", { path }),
          invoke<string>("read_image_as_data_url", { path }),
        ]);
        const name = path.split("/").pop() || path.split("\\").pop() || "image";
        images.value.push({
          id: `img-${nextId++}`,
          name,
          path,
          width: meta.width,
          height: meta.height,
          thumbUrl,
        });
      } catch (e) {
        console.error("处理图片失败:", path, e);
      }
    }
  }

  function removeImage(id: string) {
    images.value = images.value.filter((img) => img.id !== id);
  }

  function removeLastImage() {
    if (images.value.length > 0) {
      images.value.pop();
    }
  }

  function reorderImages(fromIndex: number, toIndex: number) {
    const arr = images.value;
    if (fromIndex < 0 || fromIndex >= arr.length) return;
    if (toIndex < 0 || toIndex >= arr.length) return;
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
  }

  function clearImages() {
    images.value = [];
  }

  async function openFileDialog() {
    try {
      const paths = await invoke<string[]>("open_file_dialog");
      if (paths && paths.length > 0) {
        await addImages(paths);
      }
    } catch (e) {
      console.error("文件对话框失败:", e);
    }
  }

  return {
    images,
    addImages,
    removeImage,
    removeLastImage,
    reorderImages,
    clearImages,
    openFileDialog,
  };
}
