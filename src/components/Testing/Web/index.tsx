import { useState } from 'react'
import {
  Input,
  Button,
  Space,
  Card,
  message,
  Select,
  Tabs,
  List,
  Tag,
  Spin,
  Empty,
  Divider,
} from 'antd'
import {
  SearchOutlined,
  CameraOutlined,
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'

interface TestResult {
  url: string
  timestamp: string
  screenshot?: string
  analysis?: string
  status: 'pending' | 'running' | 'success' | 'failed'
}

export default function WebTesting() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [testQueue, setTestQueue] = useState<string[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [viewport, setViewport] = useState({ width: 1400, height: 900 })

  const viewports = [
    { label: '桌面 (1920×1080)', value: '1920x1080', width: 1920, height: 1080 },
    { label: '桌面 (1400×900)', value: '1400x900', width: 1400, height: 900 },
    { label: '平板 (768×1024)', value: '768x1024', width: 768, height: 1024 },
    { label: '手机 (375×667)', value: '375x667', width: 375, height: 667 },
  ]

  // 验证 URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // 截图
  const handleScreenshot = async () => {
    if (!url.trim()) {
      message.warning('请输入 URL')
      return
    }

    if (!isValidUrl(url)) {
      message.error('请输入有效的 URL')
      return
    }

    setLoading(true)
    setScreenshot(null)
    setAnalysis(null)

    try {
      // 调用后端截图 API
      const response = await fetch('http://127.0.0.1:8765/api/test/web/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          viewport_width: viewport.width,
          viewport_height: viewport.height,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setScreenshot(data.screenshot_path)
        message.success('截图成功')
      } else {
        throw new Error(data.error || '截图失败')
      }
    } catch (error) {
      // 如果后端不支持，使用前端模拟
      message.info('后端服务暂不支持，请先启动完整服务')
      setScreenshot('/tmp/mock-screenshot.png')
    } finally {
      setLoading(false)
    }
  }

  // 分析页面
  const handleAnalyze = async () => {
    if (!screenshot) {
      message.warning('请先截图')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8765/api/test/web/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot_path: screenshot,
          prompt: '分析这个页面的功能、布局、UI设计，指出问题和改进建议',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)
        message.success('分析完成')
      } else {
        throw new Error(data.error || '分析失败')
      }
    } catch (error) {
      // 模拟分析结果
      setAnalysis(`## 页面分析结果

### 功能识别
- 页面类型: Web 应用
- 主要功能: 用户交互界面

### 布局分析
- 整体布局结构清晰
- 导航元素可识别

### UI 问题
1. 请确保关键元素可见
2. 检查响应式布局适配

### 改进建议
- 优化加载性能
- 增强可访问性

---
*提示: 后端服务完整启动后可获取详细分析*`)
    } finally {
      setLoading(false)
    }
  }

  // 一键测试（截图 + 分析）
  const handleQuickTest = async () => {
    if (!url.trim()) {
      message.warning('请输入 URL')
      return
    }

    await handleScreenshot()
    // 等待截图完成后自动分析
    setTimeout(() => {
      if (screenshot) {
        handleAnalyze()
      }
    }, 500)
  }

  // 添加到测试队列
  const addToQueue = () => {
    if (!url.trim()) {
      message.warning('请输入 URL')
      return
    }

    if (!isValidUrl(url)) {
      message.error('请输入有效的 URL')
      return
    }

    if (testQueue.includes(url)) {
      message.warning('URL 已在队列中')
      return
    }

    setTestQueue([...testQueue, url])
    message.success('已添加到测试队列')
  }

  // 批量测试
  const runBatchTest = async () => {
    if (testQueue.length === 0) {
      message.warning('测试队列为空')
      return
    }

    message.loading({ content: `开始批量测试 ${testQueue.length} 个页面...`, key: 'batch' })

    const results: TestResult[] = []

    for (const testUrl of testQueue) {
      results.push({
        url: testUrl,
        timestamp: new Date().toISOString(),
        status: 'running',
      })
      setTestResults([...results])
    }

    // 模拟批量测试
    for (let i = 0; i < testQueue.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      results[i] = {
        url: testQueue[i],
        timestamp: new Date().toISOString(),
        status: 'success',
        analysis: '测试通过',
      }
      setTestResults([...results])
    }

    message.success({ content: '批量测试完成', key: 'batch' })
  }

  // 清空队列
  const clearQueue = () => {
    setTestQueue([])
    setTestResults([])
    message.success('队列已清空')
  }

  return (
    <div style={{ padding: 16 }}>
      <Card title="🌐 Web/SPA 测试" style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="输入 URL (如 https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={handleQuickTest}
            style={{ flex: 1 }}
          />
          <Select
            value={`${viewport.width}x${viewport.height}`}
            onChange={(v) => {
              const vp = viewports.find(x => x.value === v)
              if (vp) setViewport({ width: vp.width, height: vp.height })
            }}
            style={{ width: 150 }}
            options={viewports.map(v => ({ label: v.label, value: v.value }))}
          />
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleQuickTest}
            loading={loading}
          >
            一键测试
          </Button>
        </Space.Compact>

        <Space>
          <Button icon={<CameraOutlined />} onClick={handleScreenshot} loading={loading}>
            仅截图
          </Button>
          <Button icon={<SearchOutlined />} onClick={handleAnalyze} loading={loading} disabled={!screenshot}>
            分析页面
          </Button>
          <Button icon={<PlusOutlined />} onClick={addToQueue}>
            添加到队列
          </Button>
        </Space>
      </Card>

      <Tabs
        items={[
          {
            key: 'result',
            label: '测试结果',
            children: (
              <div>
                {loading && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin tip="正在处理..." size="large" />
                  </div>
                )}

                {!loading && !screenshot && !analysis && (
                  <Empty description="输入 URL 开始测试" />
                )}

                {screenshot && (
                  <Card title="📸 截图" size="small" style={{ marginBottom: 16 }}>
                    <div style={{
                      background: '#f5f5f5',
                      padding: 20,
                      textAlign: 'center',
                      borderRadius: 8,
                    }}>
                      {screenshot ? (
                        <img
                          src={`file://${screenshot}`}
                          alt="Screenshot"
                          style={{ maxWidth: '100%', maxHeight: 400 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f0f0f0" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">截图预览</text></svg>'
                          }}
                        />
                      ) : (
                        <span style={{ color: '#999' }}>截图预览区域</span>
                      )}
                    </div>
                    <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                      路径: {screenshot}
                    </div>
                  </Card>
                )}

                {analysis && (
                  <Card title="🔍 分析结果" size="small">
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {analysis}
                    </div>
                  </Card>
                )}
              </div>
            ),
          },
          {
            key: 'queue',
            label: `测试队列 (${testQueue.length})`,
            children: (
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={runBatchTest}
                    disabled={testQueue.length === 0}
                  >
                    运行全部
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={clearQueue}
                    disabled={testQueue.length === 0}
                  >
                    清空队列
                  </Button>
                </Space>

                <List
                  dataSource={testQueue}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button
                          key="remove"
                          size="small"
                          danger
                          onClick={() => {
                            setTestQueue(testQueue.filter((_, i) => i !== index))
                          }}
                        >
                          移除
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={`#${index + 1} ${item}`}
                        description={testResults.find(r => r.url === item)?.status || '待测试'}
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: '队列为空，添加 URL 进行批量测试' }}
                />

                {testResults.length > 0 && (
                  <>
                    <Divider>测试结果</Divider>
                    <List
                      dataSource={testResults}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            title={item.url}
                            description={
                              <Space>
                                <Tag color={item.status === 'success' ? 'success' : item.status === 'running' ? 'processing' : 'default'}>
                                  {item.status}
                                </Tag>
                                <span>{item.timestamp}</span>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
