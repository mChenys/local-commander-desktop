#!/usr/bin/env python3
"""
Local Commander Desktop - Python Backend
FastAPI server for Tauri desktop application
"""

import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add lib to path
BACKEND_DIR = Path(__file__).parent
sys.path.insert(0, str(BACKEND_DIR))

# Import routers (will be copied from local-commander)
from router import get_router
from executor import get_executor
from knowledge_base_chroma import get_knowledge_base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan"""
    print("🚀 Local Commander Desktop Backend starting...")
    yield
    print("👋 Local Commander Desktop Backend shutting down...")


app = FastAPI(
    title="Local Commander Desktop",
    description="Python backend for Local Commander Desktop application",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS for Tauri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["tauri://localhost", "http://localhost:1420"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Models ==============

class MessageRequest(BaseModel):
    conversation_id: str
    message: str
    model: str = "coder"
    max_tokens: int = 4096


class ImageAnalyzeRequest(BaseModel):
    image_path: str
    prompt: str
    model: str = "vl"


class CodeReviewRequest(BaseModel):
    code: str
    language: str
    focus: str = "all"


class CodeFixRequest(BaseModel):
    code: str
    issues: str
    language: str


class KnowledgeAddRequest(BaseModel):
    text: str
    category: str = "general"
    tags: list[str] = []
    importance: float = 0.5


class KnowledgeSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    category: str | None = None


class AndroidTapRequest(BaseModel):
    device_id: str
    x: int
    y: int


class AndroidSwipeRequest(BaseModel):
    device_id: str
    start_x: int
    start_y: int
    end_x: int
    end_y: int
    duration: int = 300


# ============== Chat Endpoints ==============

@app.post("/api/chat/send")
async def send_message(request: MessageRequest):
    """Send message and get AI response"""
    router = get_router()
    executor = get_executor()

    model = router._get_model_by_alias(request.model)
    if not model:
        raise HTTPException(status_code=400, detail=f"Unknown model: {request.model}")

    # Execute with context
    success, output, meta = executor.execute_with_context(
        model["id"],
        request.message,
        Path.cwd(),
        max_context=8192
    )

    return {
        "success": success,
        "content": output,
        "model": request.model,
        "meta": meta
    }


# ============== Model Endpoints ==============

@app.get("/api/models")
async def get_models():
    """Get available models and their status"""
    router = get_router()
    models = router.list_models()

    return {
        "models": [
            {
                "name": m["id"],
                "alias": m["alias"],
                "size": m.get("size", "Unknown"),
                "downloaded": m.get("downloaded", False),
                "memory": m.get("memory", "Unknown")
            }
            for m in models
        ]
    }


# ============== Image Analysis Endpoints ==============

@app.post("/api/image/analyze")
async def analyze_image(request: ImageAnalyzeRequest):
    """Analyze image with VL model"""
    router = get_router()

    model = router._get_model_by_alias("vl")
    if not model:
        raise HTTPException(status_code=500, detail="VL model not configured")

    # Execute VL model
    from executor import call_vl_model
    result = call_vl_model(
        model["id"],
        request.image_path,
        request.prompt,
        max_tokens=4096
    )

    return {
        "success": True,
        "result": result
    }


# ============== Code Review Endpoints ==============

@app.post("/api/code/review")
async def review_code(request: CodeReviewRequest):
    """Review code with 27b model"""
    router = get_router()

    model = router._get_model_by_alias("27b")
    if not model:
        model = router._get_model_by_alias("coder")

    prompt = f"""请审查以下 {request.language} 代码，关注 {request.focus} 方面：

```{request.language}
{request.code}
```

请提供：
1. 代码评分 (1-10)
2. 发现的问题列表（按严重程度分类）
3. 改进建议
"""

    executor = get_executor()
    success, output, _ = executor.execute_with_context(
        model["id"],
        prompt,
        Path.cwd()
    )

    return {
        "success": success,
        "report": output
    }


@app.post("/api/code/fix")
async def fix_code(request: CodeFixRequest):
    """Fix code issues with coder model"""
    router = get_router()

    model = router._get_model_by_alias("coder")

    prompt = f"""请修复以下代码中的问题：

原始代码：
```{request.language}
{request.code}
```

问题：
{request.issues}

请提供修复后的完整代码。
"""

    executor = get_executor()
    success, output, _ = executor.execute_with_context(
        model["id"],
        prompt,
        Path.cwd()
    )

    return {
        "success": success,
        "fixed_code": output
    }


# ============== Knowledge Endpoints ==============

@app.post("/api/knowledge/add")
async def add_knowledge(request: KnowledgeAddRequest):
    """Add knowledge to database"""
    kb = get_knowledge_base()

    item = kb.add(
        text=request.text,
        category=request.category,
        tags=request.tags,
        importance=request.importance
    )

    return {"success": True, "id": item["id"]}


@app.post("/api/knowledge/search")
async def search_knowledge(request: KnowledgeSearchRequest):
    """Search knowledge base"""
    kb = get_knowledge_base()

    results = kb.search(
        query=request.query,
        top_k=request.top_k,
        category=request.category
    )

    return {"results": results}


@app.get("/api/knowledge/list")
async def list_knowledge(category: str | None = None, limit: int = 20):
    """List knowledge entries"""
    kb = get_knowledge_base()

    items = kb.list(category=category, limit=limit)

    return {"items": items}


@app.delete("/api/knowledge/{item_id}")
async def delete_knowledge(item_id: str):
    """Delete knowledge entry"""
    kb = get_knowledge_base()

    success = kb.delete(item_id)

    return {"success": success}


# ============== Android Endpoints ==============

@app.get("/api/android/devices")
async def get_android_devices():
    """Get connected Android devices"""
    try:
        import subprocess
        result = subprocess.run(
            ["adb", "devices", "-l"],
            capture_output=True,
            text=True,
            timeout=10
        )

        devices = []
        lines = result.stdout.strip().split("\n")[1:]  # Skip header

        for line in lines:
            if line.strip():
                parts = line.split()
                if len(parts) >= 2 and parts[1] == "device":
                    devices.append({
                        "id": parts[0],
                        "name": parts[2] if len(parts) > 2 else "Unknown",
                        "model": parts[3].split(":")[1] if len(parts) > 3 else "Unknown"
                    })

        return {"devices": devices}
    except Exception as e:
        return {"devices": [], "error": str(e)}


@app.post("/api/android/screenshot")
async def android_screenshot(device_id: str):
    """Take screenshot from Android device"""
    try:
        import subprocess
        output_path = "/tmp/android_screenshot.png"

        subprocess.run(
            ["adb", "-s", device_id, "exec-out", "screencap", "-p"],
            capture_output=True,
            timeout=30
        )

        return {"success": True, "path": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/android/tap")
async def android_tap(request: AndroidTapRequest):
    """Tap on Android device"""
    try:
        import subprocess
        subprocess.run(
            ["adb", "-s", request.device_id, "shell", "input", "tap",
             str(request.x), str(request.y)],
            capture_output=True,
            timeout=10
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/android/swipe")
async def android_swipe(request: AndroidSwipeRequest):
    """Swipe on Android device"""
    try:
        import subprocess
        subprocess.run(
            ["adb", "-s", request.device_id, "shell", "input", "swipe",
             str(request.start_x), str(request.start_y),
             str(request.end_x), str(request.end_y),
             str(request.duration)],
            capture_output=True,
            timeout=10
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/android/dump-ui/{device_id}")
async def android_dump_ui(device_id: str):
    """Dump UI hierarchy from Android device"""
    try:
        import subprocess
        result = subprocess.run(
            ["adb", "-s", device_id, "shell", "uiautomator", "dump", "/sdcard/ui.xml"],
            capture_output=True,
            timeout=30
        )

        result = subprocess.run(
            ["adb", "-s", device_id, "shell", "cat", "/sdcard/ui.xml"],
            capture_output=True,
            text=True,
            timeout=10
        )

        # TODO: Parse XML and return structured data
        return {"success": True, "xml": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== System Endpoints ==============

@app.get("/api/system/info")
async def get_system_info():
    """Get system information"""
    import platform

    return {
        "os": platform.system(),
        "os_version": platform.version(),
        "arch": platform.machine(),
        "python_version": platform.python_version(),
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8765))
    uvicorn.run(app, host="127.0.0.1", port=port)
