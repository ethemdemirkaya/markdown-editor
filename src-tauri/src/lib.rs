use tauri::{Emitter, Manager};

fn extract_file_args(args: &[String]) -> Vec<String> {
    args.iter()
        .skip(1)
        .filter(|a| !a.starts_with("--") && !a.starts_with('-'))
        .map(|s| s.to_string())
        .collect()
}

#[tauri::command]
fn get_startup_files() -> Vec<String> {
    let args: Vec<String> = std::env::args().collect();
    extract_file_args(&args)
}

#[tauri::command]
fn force_exit(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            let files = extract_file_args(&args);
            if !files.is_empty() {
                let _ = app.emit("cli://open-files", files);
            }
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
                let _ = window.unminimize();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_startup_files, force_exit])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
