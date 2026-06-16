mod commands;

use commands::{export_pdf, file_dialog, http_request, system};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            file_dialog::open_file_dialog,
            file_dialog::read_image_metadata,
            file_dialog::read_file_bytes,
            file_dialog::read_image_as_data_url,
            file_dialog::read_file_as_base64,
            file_dialog::convert_to_png_base64,
            export_pdf::write_file,
            export_pdf::write_base64_file,
            system::get_system_info,
            system::kill_process,
            system::clean_memory,
            http_request::http_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
