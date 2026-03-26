#!/usr/bin/env python3
"""
Local Commander Desktop - Python Backend
FastAPI server for Tauri desktop application
"""

import os
import sys
import json
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import asyncio

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


@app.post("/api/chat/stream")
async def stream_message(request: MessageRequest):
    """Stream message response using SSE"""

    async def generate():
        router = get_router()
        executor = get_executor()

        model = router._get_model_by_alias(request.model)
        if not model:
            yield f"data: {json.dumps({'error': f'Unknown model: {request.model}'})}\n\n"
            return

        try:
            # 使用简单执行（不带上下文）
            result = executor.execute(
                model["id"],
                request.message,
                max_tokens=request.max_tokens,
                stream=True
            )

            # 处理流式输出
            if hasattr(result, '__iter__'):
                for success, chunk, meta in result:
                    if success:
                        data = {
                            "content": chunk,
                            "done": meta.get("done", False)
                        }
                        yield f"data: {json.dumps(data)}\n\n"

                        if meta.get("done"):
                            break
                    else:
                        yield f"data: {json.dumps({'error': chunk})}\n\n"
                        break
            else:
                # 非流式结果
                success, output, meta = result
                yield f"data: {json.dumps({'content': output, 'done': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


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


@app.get("/api/models/{alias}/status")
async def get_model_status(alias: str):
    """Get detailed status of a specific model"""
    router = get_router()
    model = router._get_model_by_alias(alias)

    if not model:
        raise HTTPException(status_code=404, detail=f"Model not found: {alias}")

    size_info = router.get_model_size(model["id"])

    return {
        "alias": alias,
        "model_id": model["id"],
        "downloaded": size_info["downloaded"],
        "size_bytes": size_info["size_bytes"],
        "size_gb": size_info["size_gb"]
    }


# 下载状态存储
_download_status = {}

@app.post("/api/models/{alias}/download")
async def download_model(alias: str):
    """Start downloading a model"""
    import subprocess
    import threading

    router = get_router()
    model = router._get_model_by_alias(alias)

    if not model:
        raise HTTPException(status_code=404, detail=f"Model not found: {alias}")

    model_id = model["id"]

    # 检查是否已下载
    if router._check_model_downloaded(model_id):
        return {
            "success": True,
            "message": "Model already downloaded",
            "alias": alias,
            "model_id": model_id
        }

    # 检查是否正在下载
    if _download_status.get(alias, {}).get("status") == "downloading":
        return {
            "success": False,
            "message": "Model is already downloading",
            "alias": alias
        }

    # 启动后台下载
    _download_status[alias] = {
        "status": "downloading",
        "progress": 0,
        "error": None
    }

    def download_task():
        try:
            # 使用 huggingface-cli 下载
            cmd = [
                "huggingface-cli", "download",
                model_id,
                "--local-dir-use-symlinks", "True"
            ]

            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )

            for line in iter(process.stdout.readline, ''):
                # 解析下载进度
                if 'Downloading' in line or '%' in line:
                    _download_status[alias]["last_line"] = line.strip()

            process.wait()

            if process.returncode == 0:
                _download_status[alias] = {
                    "status": "completed",
                    "progress": 100,
                    "error": None
                }
            else:
                _download_status[alias] = {
                    "status": "failed",
                    "progress": 0,
                    "error": "Download failed"
                }
        except Exception as e:
            _download_status[alias] = {
                "status": "failed",
                "progress": 0,
                "error": str(e)
            }

    thread = threading.Thread(target=download_task)
    thread.daemon = True
    thread.start()

    return {
        "success": True,
        "message": "Download started",
        "alias": alias,
        "model_id": model_id
    }


@app.get("/api/models/{alias}/download/status")
async def get_download_status(alias: str):
    """Get download status of a model"""
    status = _download_status.get(alias, {
        "status": "not_started",
        "progress": 0,
        "error": None
    })

    # 如果已完成，验证模型是否存在
    if status["status"] == "completed":
        router = get_router()
        model = router._get_model_by_alias(alias)
        if model and router._check_model_downloaded(model["id"]):
            status["verified"] = True

    return status


@app.delete("/api/models/{alias}")
async def delete_model(alias: str):
    """Delete a downloaded model"""
    import shutil

    router = get_router()
    model = router._get_model_by_alias(alias)

    if not model:
        raise HTTPException(status_code=404, detail=f"Model not found: {alias}")

    model_id = model["id"]
    cache_dir = Path.home() / ".cache" / "huggingface" / "hub"
    model_dir_name = f"models--{model_id.replace('/', '--')}"
    model_path = cache_dir / model_dir_name

    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Model not downloaded")

    try:
        shutil.rmtree(model_path)
        return {"success": True, "message": f"Model {alias} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
