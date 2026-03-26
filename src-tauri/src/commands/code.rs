use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewReport {
    pub score: i32,
    pub issues: Vec<CodeIssue>,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeIssue {
    pub severity: String, // "critical", "warning", "info"
    pub line: i32,
    pub message: String,
    pub suggestion: Option<String>,
}

#[tauri::command]
pub async fn review_code(
    code: String,
    language: String,
    focus: Option<String>,
) -> Result<ReviewReport, String> {
    // TODO: Call Python backend 27b model
    println!("Reviewing {} code, {} lines", language, code.lines().count());
    Ok(ReviewReport {
        score: 8,
        issues: vec![],
        summary: "Code review completed".to_string(),
    })
}

#[tauri::command]
pub async fn fix_code(
    code: String,
    issues: String,
    language: String,
) -> Result<String, String> {
    // TODO: Call Python backend coder model
    println!("Fixing {} code with issues: {}", language, issues);
    Ok(code)
}
