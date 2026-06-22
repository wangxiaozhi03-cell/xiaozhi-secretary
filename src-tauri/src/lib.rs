mod commands;

use commands::{export_pdf, file_dialog, http_request, maven_builder, system};
use tauri::Emitter;
use tauri::Manager;
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

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
            maven_builder::list_maven_modules,
            maven_builder::list_maven_leaf_modules,
            maven_builder::start_build,
            maven_builder::check_maven_available,
            maven_builder::upload_to_server,
            maven_builder::copy_files_to_dir,
            maven_builder::scan_maven_installations,
            maven_builder::scan_jdk_installations,
        ])
        .setup(|app| {
            // Build system tray
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("小志秘书")
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Read close action from frontend localStorage via JS
                // We use a simple approach: always prevent close, let frontend decide
                let _ = api.prevent_close();
                let _ = window.emit("close-requested", ());
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
