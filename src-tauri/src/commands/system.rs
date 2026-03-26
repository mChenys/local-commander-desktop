use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub memory_gb: f32,
    pub cpu_cores: i32,
    pub chip: String,
}

#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    // Get system information
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();

    // TODO: Get actual memory and CPU info
    Ok(SystemInfo {
        os,
        arch,
        memory_gb: 16.0,
        cpu_cores: 8,
        chip: "Apple M1".to_string(),
    })
}

#[tauri::command]
pub async fn check_python_backend() -> Result<bool, String> {
    // Check if Python backend is running
    // TODO: Check via HTTP request
    Ok(false)
}

#[tauri::command]
pub async fn start_python_backend(app_handle: tauri::AppHandle) -> Result<(), String> {
    // Start Python backend process
    let resource_path = app_handle
        .path_resolver()
        .resource_dir()
        .ok_or("Failed to get resource directory")?;

    let python_path = resource_path.join("python-backend");

    // TODO: Start Python process
    println!("Starting Python backend at: {:?}", python_path);

    Ok(())
}
