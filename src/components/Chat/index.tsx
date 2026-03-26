import { useEffect, useState } from 'react'
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
} from '@ant-design/icons'
import { useChatStore, useModelStore } from '../../stores'
import type { Message } from '../../stores/chatStore'
import api from '../../services/api'

const { TextArea } = Input

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
  } = useChatStore()

  const { models, setModels } = useModelStore()

  const [inputValue, setInputValue] = useState('')
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  )

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

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addMessage(userMessage, 'user')
    setLoading(true)

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

      // 调用真实后端
      const response = await api.sendMessage({
        conversation_id: currentConversationId || '',
        message: userMessage,
        model: selectedModel,
      })

      if (response.success) {
        addMessage(response.content, 'assistant', response.model)
      } else {
        throw new Error('请求失败')
      }
    } catch (error) {
      message.error('发送消息失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
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
        </Space>
      </div>

      <div className="chat-messages">
        {currentConversation?.messages.length ? (
          currentConversation.messages.map(renderMessage)
        ) : (
          <Empty description="开始新对话" style={{ marginTop: 100 }} />
        )}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin tip="正在生成..." />
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
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={isLoading}
        >
          发送
        </Button>
      </div>
    </div>
  )
}
