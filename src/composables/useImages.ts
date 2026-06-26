import { ref } from "vue";
import type { ImageItem } from "@/types";

let nextId = 1;

/** 检测是否在 Tauri 环境中 */
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function useImages() {
  const images = ref<ImageItem[]>([]);

  async function addImages(paths: string[]) {
    // Tauri 环境：通过后端读取图片
    if (isTauri()) {
      const { invoke } = await import("@tauri-apps/api/core");
      for (const path of paths) {
        try {
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
  }

  /** 浏览器环境：从 File 对象加载图片 */
  async function addImagesFromFiles(files: File[]) {
    for (const file of files) {
      try {
        const thumbUrl = await readFileAsDataUrl(file);
        const { width, height } = await getImageDimensions(thumbUrl);
        images.value.push({
          id: `img-${nextId++}`,
          name: file.name,
          path: file.name,
          width,
          height,
          thumbUrl,
        });
      } catch (e) {
        console.error("处理图片失败:", file.name, e);
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
    // Tauri 环境：使用原生文件对话框
    if (isTauri()) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const paths = await invoke<string[]>("open_file_dialog");
        if (paths && paths.length > 0) {
          await addImages(paths);
        }
      } catch (e) {
        console.error("文件对话框失败:", e);
      }
      return;
    }

    // 浏览器环境：使用 HTML file input
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (files.length > 0) {
        await addImagesFromFiles(files);
      }
    };
    input.click();
  }

  return {
    images,
    addImages,
    addImagesFromFiles,
    removeImage,
    removeLastImage,
    reorderImages,
    clearImages,
    openFileDialog,
  };
}

/** 读取文件为 Data URL */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** 获取图片尺寸 */
function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
  });
}
