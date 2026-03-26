// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{chat, models, android, image, code, knowledge, system};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Chat commands
            chat::send_message,
            chat::get_conversations,
            chat::delete_conversation,
            // Model commands
            models::get_models,
            models::download_model,
            models::delete_model,
            // Android commands
            android::get_devices,
            android::screenshot,
            android::tap,
            android::swipe,
            android::dump_ui,
            android::run_test,
            // Image commands
            image::analyze_image,
            // Code commands
            code::review_code,
            code::fix_code,
            // Knowledge commands
            knowledge::add_knowledge,
            knowledge::search_knowledge,
            knowledge::list_knowledge,
            knowledge::delete_knowledge,
            // System commands
            system::get_system_info,
            system::check_python_backend,
            system::start_python_backend,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
