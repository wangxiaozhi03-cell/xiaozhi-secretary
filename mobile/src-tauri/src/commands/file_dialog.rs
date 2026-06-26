use serde::Serialize;

#[derive(Serialize)]
pub struct ImageMetadata {
    pub width: u32,
    pub height: u32,
}

/// 打开文件选择器（支持移动端相册和文件管理器）
#[tauri::command]
pub async fn open_file_dialog(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let files = app
        .dialog()
        .file()
        .add_filter("Images", &["png", "jpg", "jpeg", "webp", "bmp", "heic"])
        .set_title("选择图片")
        .blocking_pick_files()
        .ok_or("未选择文件")?;

    let paths: Vec<String> = files
        .iter()
        .filter_map(|p| p.as_path().map(|p| p.to_string_lossy().to_string()))
        .collect();

    Ok(paths)
}

/// 读取图片元数据（宽高）
#[tauri::command]
pub fn read_image_metadata(path: String) -> Result<ImageMetadata, String> {
    let img = image::open(&path).map_err(|e| format!("无法读取图片: {}", e))?;
    Ok(ImageMetadata {
        width: img.width(),
        height: img.height(),
    })
}

/// 读取文件原始字节
#[tauri::command]
pub fn read_file_bytes(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| format!("读取文件失败 {}: {}", path, e))
}

/// 读取图片文件并返回 base64 data URL
#[tauri::command]
pub fn read_image_as_data_url(path: String) -> Result<String, String> {
    use base64::Engine;

    let data = std::fs::read(&path).map_err(|e| format!("读取文件失败 {}: {}", path, e))?;

    let ext = path
        .rsplit('.')
        .next()
        .unwrap_or("")
        .to_lowercase();
    let mime = match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "gif" => "image/gif",
        "heic" => "image/heic",
        _ => "image/png",
    };

    let b64 = base64::engine::general_purpose::STANDARD.encode(&data);
    Ok(format!("data:{};base64,{}", mime, b64))
}

/// 读取文件并返回原始字节的 base64 编码（无 data URL 前缀）
#[tauri::command]
pub fn read_file_as_base64(path: String) -> Result<String, String> {
    use base64::Engine;
    let data = std::fs::read(&path).map_err(|e| format!("读取文件失败 {}: {}", path, e))?;
    Ok(base64::engine::general_purpose::STANDARD.encode(&data))
}

/// 将图片转换为 PNG 格式并返回 base64
#[tauri::command]
pub fn convert_to_png_base64(path: String) -> Result<String, String> {
    use base64::Engine;
    let img = image::open(&path).map_err(|e| format!("打开图片失败 {}: {}", path, e))?;
    let mut cursor = std::io::Cursor::new(Vec::new());
    img.write_to(&mut cursor, image::ImageFormat::Png)
        .map_err(|e| format!("转换 PNG 失败: {}", e))?;
    let data = cursor.into_inner();
    Ok(base64::engine::general_purpose::STANDARD.encode(&data))
}
