use serde::{Deserialize, Serialize};

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
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();

    Ok(SystemInfo {
        os,
        arch,
        memory_gb: 16.0,
        cpu_cores: 8,
        chip: "Apple Silicon".to_string(),
    })
}

#[tauri::command]
pub async fn check_python_backend() -> Result<bool, String> {
    // TODO: Check via HTTP request
    Ok(false)
}

#[tauri::command]
pub async fn start_python_backend() -> Result<(), String> {
    // TODO: Start Python process using tauri-plugin-shell
    println!("Starting Python backend...");
    Ok(())
}
