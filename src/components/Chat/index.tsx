import { useEffect, useState } from 'react'
import {
  Input,
  Button,
  Select,
  Space,
  Spin,
  Empty,
  message,
} from 'antd'
import {
  SendOutlined,
  PlusOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { useChatStore, useModelStore } from '../../stores'
import type { Message } from '../../stores/chatStore'

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

  const { models } = useModelStore()

  const [inputValue, setInputValue] = useState('')

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  )

  useEffect(() => {
    if (conversations.length === 0) {
      createConversation()
    }
  }, [])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addMessage(userMessage, 'user')
    setLoading(true)

    try {
      // TODO: Call Tauri backend
      // Simulate response
      await new Promise((resolve) => setTimeout(resolve, 1000))
      addMessage(
        `这是一个来自 ${selectedModel} 模型的模拟回复。\n\n\`\`\`typescript\nfunction example() {\n  console.log("Hello, World!");\n}\n\`\`\``,
        'assistant',
        selectedModel
      )
    } catch (error) {
      message.error('发送消息失败')
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
      <div className="chat-header" style={{ marginBottom: 16 }}>
        <Space>
          <Select
            value={selectedModel}
            onChange={setModel}
            style={{ width: 150 }}
            options={models.map((m) => ({
              label: `${m.alias} (${m.size})`,
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
