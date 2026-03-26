use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub role: String,
    pub content: String,
    pub model: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub title: String,
    pub model: String,
    pub messages: Vec<Message>,
    pub created_at: String,
    pub updated_at: String,
}

pub struct AppState {
    pub conversations: Mutex<Vec<Conversation>>,
    pub python_process: Mutex<Option<u32>>,
}

#[tauri::command]
pub async fn send_message(
    conversation_id: String,
    message: String,
    model: String,
) -> Result<Message, String> {
    // TODO: Call Python backend via HTTP
    let msg = Message {
        id: uuid::Uuid::new_v4().to_string(),
        role: "assistant".to_string(),
        content: format!("Response from {} for: {}", model, message),
        model: Some(model),
        created_at: chrono::Local::now().to_rfc3339(),
    };
    Ok(msg)
}

#[tauri::command]
pub async fn get_conversations() -> Result<Vec<Conversation>, String> {
    // TODO: Load from SQLite
    Ok(vec![])
}

#[tauri::command]
pub async fn delete_conversation(id: String) -> Result<(), String> {
    // TODO: Delete from SQLite
    println!("Deleting conversation: {}", id);
    Ok(())
}
