use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub summary: String,
    pub issues: Vec<Issue>,
    pub suggestions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Issue {
    pub severity: String, // "high", "medium", "low"
    pub description: String,
    pub location: Option<String>,
}

#[tauri::command]
pub async fn analyze_image(
    image_path: String,
    prompt: String,
    model: Option<String>,
) -> Result<AnalysisResult, String> {
    // TODO: Call Python backend VL model
    println!("Analyzing image: {} with prompt: {}", image_path, prompt);
    Ok(AnalysisResult {
        summary: "Image analysis result".to_string(),
        issues: vec![],
        suggestions: vec![],
    })
}
