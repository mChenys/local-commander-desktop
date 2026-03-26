use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Knowledge {
    pub id: String,
    pub text: String,
    pub category: String,
    pub tags: Vec<String>,
    pub score: Option<f32>,
    pub created_at: String,
}

#[tauri::command]
pub async fn add_knowledge(
    text: String,
    category: String,
    tags: Vec<String>,
    importance: Option<f32>,
) -> Result<Knowledge, String> {
    // TODO: Call Python backend
    Ok(Knowledge {
        id: uuid::Uuid::new_v4().to_string(),
        text,
        category,
        tags,
        score: None,
        created_at: chrono::Local::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn search_knowledge(
    query: String,
    top_k: Option<i32>,
    category: Option<String>,
) -> Result<Vec<Knowledge>, String> {
    // TODO: Call Python backend semantic search
    println!("Searching knowledge: {}", query);
    Ok(vec![])
}

#[tauri::command]
pub async fn list_knowledge(
    category: Option<String>,
    limit: Option<i32>,
) -> Result<Vec<Knowledge>, String> {
    // TODO: Call Python backend
    Ok(vec![])
}

#[tauri::command]
pub async fn delete_knowledge(id: String) -> Result<(), String> {
    // TODO: Call Python backend
    println!("Deleting knowledge: {}", id);
    Ok(())
}
