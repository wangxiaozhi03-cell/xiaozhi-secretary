use serde::Deserialize;

#[derive(Deserialize)]
pub struct WriteFileRequest {
    pub path: String,
    pub data: Vec<u8>,
}

#[derive(Deserialize)]
pub struct WriteBase64Request {
    pub path: String,
    pub base64_data: String,
}

/// 将前端生成的二进制数据写入文件
#[tauri::command]
pub fn write_file(request: WriteFileRequest) -> Result<(), String> {
    // 确保父目录存在
    if let Some(parent) = std::path::Path::new(&request.path).parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {}", e))?;
    }
    std::fs::write(&request.path, &request.data)
        .map_err(|e| format!("写入文件失败: {}", e))?;
    Ok(())
}

/// 将 base64 编码的数据写入文件
#[tauri::command]
pub fn write_base64_file(request: WriteBase64Request) -> Result<(), String> {
    use base64::Engine;
    let data = base64::engine::general_purpose::STANDARD
        .decode(&request.base64_data)
        .map_err(|e| format!("base64 解码失败: {}", e))?;
    // 确保父目录存在
    if let Some(parent) = std::path::Path::new(&request.path).parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {}", e))?;
    }
    std::fs::write(&request.path, &data)
        .map_err(|e| format!("写入文件失败: {}", e))?;
    Ok(())
}
