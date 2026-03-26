use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelStatus {
    pub name: String,
    pub alias: String,
    pub size: String,
    pub downloaded: bool,
    pub path: Option<String>,
}

#[tauri::command]
pub async fn get_models() -> Result<Vec<ModelStatus>, String> {
    // TODO: Check HuggingFace cache directory
    Ok(vec![
        ModelStatus {
            name: "Qwen2.5-Coder-14B-Instruct-4bit".to_string(),
            alias: "coder".to_string(),
            size: "8.2 GB".to_string(),
            downloaded: false,
            path: None,
        },
        ModelStatus {
            name: "Qwen2.5-VL-7B-Instruct-4bit".to_string(),
            alias: "vl".to_string(),
            size: "5.1 GB".to_string(),
            downloaded: false,
            path: None,
        },
        ModelStatus {
            name: "Qwen3.5-27B-4bit".to_string(),
            alias: "27b".to_string(),
            size: "15.3 GB".to_string(),
            downloaded: false,
            path: None,
        },
        ModelStatus {
            name: "Qwen2.5-7B-Instruct-4bit".to_string(),
            alias: "7b".to_string(),
            size: "4.2 GB".to_string(),
            downloaded: false,
            path: None,
        },
    ])
}

#[tauri::command]
pub async fn download_model(name: String) -> Result<(), String> {
    // TODO: Download from HuggingFace
    println!("Downloading model: {}", name);
    Ok(())
}

#[tauri::command]
pub async fn delete_model(name: String) -> Result<(), String> {
    // TODO: Delete from cache
    println!("Deleting model: {}", name);
    Ok(())
}
