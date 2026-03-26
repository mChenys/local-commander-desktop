// Local Commander Desktop - API Service
// 与 Python 后端通信的服务层

const API_BASE = 'http://127.0.0.1:8765'

// ============ Types ============

export interface ModelInfo {
  name: string
  alias: string
  size: string
  downloaded: boolean
  memory?: string
}

export interface ChatRequest {
  conversation_id: string
  message: string
  model: string
  max_tokens?: number
}

export interface ChatResponse {
  success: boolean
  content: string
  model: string
  meta?: {
    tokens?: number
    time?: number
  }
}

export interface CodeReviewRequest {
  code: string
  language: string
  focus: 'quality' | 'security' | 'performance' | 'all'
}

export interface CodeReviewResponse {
  success: boolean
  report: string
}

export interface CodeFixRequest {
  code: string
  issues: string
  language: string
}

export interface CodeFixResponse {
  success: boolean
  fixed_code: string
}

export interface KnowledgeItem {
  id: string
  text: string
  category: string
  tags: string[]
  importance: number
  created_at: string
}

export interface AndroidDevice {
  id: string
  name: string
  model: string
}

// ============ API Client ============

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // ============ Health ============

  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health')
  }

  // ============ Models ============

  async getModels(): Promise<{ models: ModelInfo[] }> {
    return this.request('/api/models')
  }

  // ============ Chat ============

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // ============ Image Analysis ============

  async analyzeImage(
    imagePath: string,
    prompt: string,
    model: string = 'vl'
  ): Promise<{ success: boolean; result: string }> {
    return this.request('/api/image/analyze', {
      method: 'POST',
      body: JSON.stringify({
        image_path: imagePath,
        prompt,
        model,
      }),
    })
  }

  // ============ Code Review ============

  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    return this.request('/api/code/review', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async fixCode(request: CodeFixRequest): Promise<CodeFixResponse> {
    return this.request('/api/code/fix', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // ============ Knowledge Base ============

  async addKnowledge(
    text: string,
    category: string = 'general',
    tags: string[] = [],
    importance: number = 0.5
  ): Promise<{ success: boolean; id: string }> {
    return this.request('/api/knowledge/add', {
      method: 'POST',
      body: JSON.stringify({ text, category, tags, importance }),
    })
  }

  async searchKnowledge(
    query: string,
    topK: number = 5,
    category?: string
  ): Promise<{ results: KnowledgeItem[] }> {
    const params = new URLSearchParams({
      query,
      top_k: topK.toString(),
    })
    if (category) params.append('category', category)

    return this.request(`/api/knowledge/search?${params}`, {
      method: 'POST',
      body: JSON.stringify({ query, top_k: topK, category }),
    })
  }

  async listKnowledge(
    category?: string,
    limit: number = 20
  ): Promise<{ items: KnowledgeItem[] }> {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (category) params.append('category', category)

    return this.request(`/api/knowledge/list?${params}`)
  }

  async deleteKnowledge(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/knowledge/${id}`, {
      method: 'DELETE',
    })
  }

  // ============ Android ============

  async getAndroidDevices(): Promise<{ devices: AndroidDevice[]; error?: string }> {
    return this.request('/api/android/devices')
  }

  async androidScreenshot(deviceId: string): Promise<{ success: boolean; path: string }> {
    return this.request(`/api/android/screenshot?device_id=${deviceId}`, {
      method: 'POST',
    })
  }

  async androidTap(deviceId: string, x: number, y: number): Promise<{ success: boolean }> {
    return this.request('/api/android/tap', {
      method: 'POST',
      body: JSON.stringify({ device_id: deviceId, x, y }),
    })
  }

  async androidSwipe(
    deviceId: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number = 300
  ): Promise<{ success: boolean }> {
    return this.request('/api/android/swipe', {
      method: 'POST',
      body: JSON.stringify({
        device_id: deviceId,
        start_x: startX,
        start_y: startY,
        end_x: endX,
        end_y: endY,
        duration,
      }),
    })
  }

  // ============ System ============

  async getSystemInfo(): Promise<{
    os: string
    os_version: string
    arch: string
    python_version: string
  }> {
    return this.request('/api/system/info')
  }
}

// ============ Export ============

export const api = new ApiClient()

export default api
