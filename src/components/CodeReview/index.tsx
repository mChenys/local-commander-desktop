import { useState } from 'react'
import {
  Select,
  Button,
  Space,
  Card,
  Alert,
  message,
  Tabs,
} from 'antd'
import {
  SearchOutlined,
  ToolOutlined,
  CopyOutlined,
} from '@ant-design/icons'

export default function CodeReview() {
  const [language, setLanguage] = useState('typescript')
  const [code, setCode] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [result, setResult] = useState<{
    score: number
    issues: Array<{ severity: string; line: number; message: string }>
    summary: string
  } | null>(null)

  const handleReview = async () => {
    if (!code.trim()) {
      message.warning('请输入代码')
      return
    }

    setReviewing(true)
    try {
      // TODO: Call Tauri backend
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setResult({
        score: 7,
        issues: [
          { severity: 'warning', line: 5, message: '缺少类型定义' },
          { severity: 'info', line: 10, message: '可以简化逻辑' },
        ],
        summary: '代码整体结构良好，但存在一些可改进的地方。',
      })
      message.success('审查完成')
    } catch (error) {
      message.error('审查失败')
    } finally {
      setReviewing(false)
    }
  }

  const handleFix = async () => {
    message.info('自动修复功能开发中')
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={language}
          onChange={setLanguage}
          style={{ width: 150 }}
          options={[
            { label: 'TypeScript', value: 'typescript' },
            { label: 'JavaScript', value: 'javascript' },
            { label: 'Python', value: 'python' },
            { label: 'Kotlin', value: 'kotlin' },
            { label: 'Swift', value: 'swift' },
            { label: 'Rust', value: 'rust' },
          ]}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleReview}
          loading={reviewing}
        >
          审查代码
        </Button>
        <Button
          icon={<ToolOutlined />}
          onClick={handleFix}
          disabled={!result}
        >
          一键修复
        </Button>
        <Button
          icon={<CopyOutlined />}
          onClick={() => {
            navigator.clipboard.writeText(code)
            message.success('已复制')
          }}
        >
          复制代码
        </Button>
      </Space>

      <Tabs
        defaultActiveKey="code"
        items={[
          {
            key: 'code',
            label: '代码编辑器',
            children: (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="在此输入或粘贴代码..."
                style={{
                  width: '100%',
                  height: 400,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  padding: 16,
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  resize: 'vertical',
                }}
              />
            ),
          },
          {
            key: 'result',
            label: '审查报告',
            children: result ? (
              <div>
                <Alert
                  message={`代码评分: ${result.score}/10`}
                  type={result.score >= 7 ? 'success' : result.score >= 5 ? 'warning' : 'error'}
                  style={{ marginBottom: 16 }}
                />
                <Card title="问题列表" size="small">
                  {result.issues.map((issue, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '8px 0',
                        borderBottom:
                          index < result.issues.length - 1
                            ? '1px solid #f0f0f0'
                            : 'none',
                      }}
                    >
                      <Space>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            backgroundColor:
                              issue.severity === 'critical'
                                ? '#ff4d4f'
                                : issue.severity === 'warning'
                                ? '#faad14'
                                : '#1890ff',
                            color: '#fff',
                            fontSize: 12,
                          }}
                        >
                          {issue.severity}
                        </span>
                        <span>Line {issue.line}:</span>
                        <span>{issue.message}</span>
                      </Space>
                    </div>
                  ))}
                </Card>
                <Card title="总结" size="small" style={{ marginTop: 16 }}>
                  {result.summary}
                </Card>
              </div>
            ) : (
              <Alert message="请先进行代码审查" type="info" />
            ),
          },
        ]}
        style={{ flex: 1 }}
      />
    </div>
  )
}
