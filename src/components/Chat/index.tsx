import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Input,
  Button,
  Select,
  Space,
  Spin,
  Empty,
  message,
  Alert,
} from 'antd'
import {
  SendOutlined,
  PlusOutlined,
  CopyOutlined,
  ReloadOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useChatStore, useModelStore } from '../../stores'
import type { Message } from '../../stores/chatStore'
import api from '../../services/api'

const { TextArea } = Input

// 本地存储键
const STORAGE_KEY = 'local-commander-conversations'

// 从 localStorage 加载对话
const loadConversations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // ignore
  }
  return null
}

// 保存对话到 localStorage
const saveConversations = (conversations: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {
    // ignore
  }
}

export default function Chat() {
  const {
    conversations,
    currentConversationId,
    selectedModel,
    isLoading,
    createConversation,
    setModel,
    addMessage,
    setLoading,
    setConversations,
  } = useChatStore()

  const { models, setModels } = useModelStore()

  const [inputValue, setInputValue] = useState('')
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef<(() => void) | null>(null)

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  )

  // 从 localStorage 加载对话历史
  useEffect(() => {
    const saved = loadConversations()
    if (saved && saved.length > 0) {
      setConversations(saved)
    }
  }, [setConversations])

  // 保存对话历史到 localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations)
    }
  }, [conversations])

  // 检查后端状态并获取模型列表
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.healthCheck()
        setBackendStatus('online')

        // 获取模型列表
        const { models: modelList } = await api.getModels()
        setModels(modelList.map(m => ({
          name: m.name,
          alias: m.alias,
          size: m.size,
          downloaded: m.downloaded,
          memory: m.memory,
        })))
      } catch {
        setBackendStatus('offline')
      }
    }

    checkBackend()
    // 每30秒检查一次后端状态
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [setModels])

  useEffect(() => {
    if (conversations.length === 0) {
      createConversation()
    }
  }, [conversations.length, createConversation])

  // 更新最后一条消息的内容（用于流式输出）
  const updateLastMessage = useCallback((content: string) => {
    setStreamingContent(content)
  }, [])

  // 完成流式输出，添加完整消息
  const finalizeMessage = useCallback((content: string, model: string) => {
    setStreamingContent('')
    addMessage(content, 'assistant', model)
  }, [addMessage])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addMessage(userMessage, 'user')
    setLoading(true)
    setStreamingContent('')

    try {
      if (backendStatus === 'offline') {
        // 后端离线时使用模拟响应
        await new Promise((resolve) => setTimeout(resolve, 500))
        addMessage(
          `⚠️ 后端服务未启动，这是模拟回复。\n\n请先启动 Python 后端：\n\`\`\`bash\ncd python-backend && python main.py\n\`\`\``,
          'assistant',
          selectedModel
        )
        return
      }

      // 使用流式输出
      let fullContent = ''

      const abort = api.streamMessage(
        {
          conversation_id: currentConversationId || '',
          message: userMessage,
          model: selectedModel,
        },
        (chunk) => {
          fullContent += chunk
          updateLastMessage(fullContent)
        },
        () => {
          finalizeMessage(fullContent, selectedModel)
          setLoading(false)
        },
        (error) => {
          message.error('发送消息失败: ' + error)
          setLoading(false)
          setStreamingContent('')
        }
      )

      abortRef.current = abort

    } catch (error) {
      message.error('发送消息失败: ' + (error as Error).message)
      setLoading(false)
    }
  }

  // 停止流式输出
  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
    }
    if (streamingContent) {
      // 保存已生成的内容
      finalizeMessage(streamingContent, selectedModel)
    }
    setLoading(false)
  }

  // 清空对话历史
  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    message.success('对话历史已清空')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    message.success('已复制到剪贴板')
  }

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user'

    // Simple code block rendering
    const renderContent = (content: string) => {
      const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      let match

      while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${match.index}`}>
              {content.slice(lastIndex, match.index)}
            </span>
          )
        }

        // Add code block
        const lang = match[1] || 'text'
        const code = match[2]
        parts.push(
          <div key={`code-${match.index}`} className="code-block">
            <div className="code-header">
              <span>{lang}</span>
              <div className="code-actions">
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => copyCode(code)}
                >
                  复制
                </Button>
              </div>
            </div>
            <pre>
              <code>{code}</code>
            </pre>
          </div>
        )

        lastIndex = match.index + match[0].length
      }

      // Add remaining text
      if (lastIndex < content.length) {
        parts.push(
          <span key={`text-end`}>{content.slice(lastIndex)}</span>
        )
      }

      return parts.length > 0 ? parts : content
    }

    return (
      <div
        key={msg.id}
        className={`message ${isUser ? 'user' : 'assistant'}`}
        style={{ marginLeft: isUser ? 'auto' : 0 }}
      >
        <div className="message-header">
          {isUser ? '👤 你' : `🤖 ${msg.model || 'AI'}`}
        </div>
        <div className="message-content">{renderContent(msg.content)}</div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      {/* 后端状态提示 */}
      {backendStatus === 'checking' && (
        <Alert
          message="正在检查后端服务..."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {backendStatus === 'offline' && (
        <Alert
          message="后端服务未启动"
          description="请先启动 Python 后端服务: cd python-backend && python main.py"
          type="warning"
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
              重试
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      {backendStatus === 'online' && (
        <Alert
          message="后端服务已连接"
          type="success"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="chat-header" style={{ marginBottom: 16 }}>
        <Space>
          <Select
            value={selectedModel}
            onChange={setModel}
            style={{ width: 150 }}
            options={models.map((m) => ({
              label: `${m.alias} (${m.size})${m.downloaded ? '' : ' [未下载]'}`,
              value: m.alias,
              disabled: !m.downloaded,
            }))}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={createConversation}
          >
            新对话
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={handleClearHistory}
            danger
          >
            清空历史
          </Button>
        </Space>
      </div>

      <div className="chat-messages">
        {currentConversation?.messages.length ? (
          currentConversation.messages.map(renderMessage)
        ) : (
          <Empty description="开始新对话" style={{ marginTop: 100 }} />
        )}
        {/* 流式输出内容 */}
        {streamingContent && (
          <div className="message assistant" style={{ marginLeft: 0 }}>
            <div className="message-header">
              🤖 {selectedModel}
              <Spin size="small" style={{ marginLeft: 8 }} />
            </div>
            <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
              {streamingContent}
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          autoSize={{ minRows: 2, maxRows: 6 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        {isLoading ? (
          <Button
            danger
            icon={<StopOutlined />}
            onClick={handleStop}
          >
            停止
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            发送
          </Button>
        )}
      </div>
    </div>
  )
}
