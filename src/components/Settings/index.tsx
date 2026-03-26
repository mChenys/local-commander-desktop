import { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Space,
  Switch,
  Select,
  message,
  Divider,
  Statistic,
  Tag,
} from 'antd'
import {
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useModelStore } from '../../stores'
import api from '../../services/api'

interface DownloadStatus {
  [key: string]: {
    status: 'not_started' | 'downloading' | 'completed' | 'failed'
    progress: number
    error: string | null
    last_line?: string
  }
}

export default function Settings() {
  const { models, setModels } = useModelStore()
  const [theme, setTheme] = useState('system')
  const [autoSave, setAutoSave] = useState(true)
  const [defaultModel, setDefaultModel] = useState('coder')
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({})
  const [refreshing, setRefreshing] = useState(false)

  // 刷新模型列表
  const refreshModels = useCallback(async () => {
    setRefreshing(true)
    try {
      const { models: modelList } = await api.getModels()
      setModels(modelList.map(m => ({
        name: m.name,
        alias: m.alias,
        size: m.size,
        downloaded: m.downloaded,
        memory: m.memory,
      })))
    } catch {
      message.error('获取模型列表失败')
    } finally {
      setRefreshing(false)
    }
  }, [setModels])

  // 轮询下载状态
  useEffect(() => {
    const downloadingModels = Object.entries(downloadStatus)
      .filter(([_, status]) => status.status === 'downloading')
      .map(([alias]) => alias)

    if (downloadingModels.length === 0) return

    const interval = setInterval(async () => {
      for (const alias of downloadingModels) {
        try {
          const status = await api.getDownloadStatus(alias)
          setDownloadStatus(prev => ({
            ...prev,
            [alias]: status
          }))

          // 如果下载完成，刷新模型列表
          if (status.status === 'completed') {
            message.success(`模型 ${alias} 下载完成`)
            refreshModels()
          } else if (status.status === 'failed') {
            message.error(`模型 ${alias} 下载失败: ${status.error}`)
          }
        } catch {
          // ignore
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [downloadStatus, refreshModels])

  // 初始加载
  useEffect(() => {
    refreshModels()
  }, [refreshModels])

  const handleDownloadModel = async (alias: string) => {
    try {
      const result = await api.downloadModel(alias)

      if (result.message === 'Model already downloaded') {
        message.info('模型已下载')
        refreshModels()
        return
      }

      if (result.success) {
        message.loading({ content: `开始下载模型 ${alias}...`, key: alias })
        setDownloadStatus(prev => ({
          ...prev,
          [alias]: { status: 'downloading', progress: 0, error: null }
        }))
      } else {
        message.warning(result.message)
      }
    } catch {
      message.error('启动下载失败')
    }
  }

  const handleDeleteModel = async (alias: string) => {
    try {
      await api.deleteModel(alias)
      message.success(`已删除模型: ${alias}`)
      refreshModels()
    } catch {
      message.error('删除模型失败')
    }
  }

  const getStatusTag = (alias: string) => {
    const status = downloadStatus[alias]

    if (!status || status.status === 'not_started') {
      return null
    }

    switch (status.status) {
      case 'downloading':
        return (
          <Tag icon={<SyncOutlined spin />} color="processing">
            下载中
          </Tag>
        )
      case 'completed':
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            已完成
          </Tag>
        )
      case 'failed':
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="error">
            失败
          </Tag>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="settings-section">
        <h3>
          📦 模型管理
          <Button
            size="small"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={refreshModels}
            style={{ marginLeft: 12 }}
            loading={refreshing}
          >
            刷新
          </Button>
        </h3>
        <div className="model-list">
          {models.map((model) => {
            const status = downloadStatus[model.alias]
            const isDownloading = status?.status === 'downloading'

            return (
              <div key={model.alias} className="model-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {model.alias.toUpperCase()}
                    {getStatusTag(model.alias)}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    {model.name}
                  </div>
                  <div style={{ color: '#999', fontSize: 11 }}>
                    内存占用: {model.size}
                  </div>
                  {isDownloading && status?.last_line && (
                    <div style={{ color: '#1890ff', fontSize: 11, marginTop: 4 }}>
                      {status.last_line}
                    </div>
                  )}
                </div>
                <Space>
                  {model.downloaded ? (
                    <>
                      <Tag color="success">已下载</Tag>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteModel(model.alias)}
                      >
                        删除
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="primary"
                      size="small"
                      icon={isDownloading ? <SyncOutlined spin /> : <DownloadOutlined />}
                      onClick={() => handleDownloadModel(model.alias)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? '下载中...' : '下载'}
                    </Button>
                  )}
                </Space>
              </div>
            )
          })}
        </div>
      </div>

      <Divider />

      <div className="settings-section">
        <h3>⚙️ 常规设置</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>主题</span>
            <Select
              value={theme}
              onChange={setTheme}
              style={{ width: 150 }}
              options={[
                { label: '跟随系统', value: 'system' },
                { label: '亮色', value: 'light' },
                { label: '暗色', value: 'dark' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>默认模型</span>
            <Select
              value={defaultModel}
              onChange={setDefaultModel}
              style={{ width: 150 }}
              options={models.map((m) => ({
                label: m.alias.toUpperCase(),
                value: m.alias,
              }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>自动保存对话</span>
            <Switch checked={autoSave} onChange={setAutoSave} />
          </div>
        </Space>
      </div>

      <Divider />

      <div className="settings-section">
        <h3>💾 存储</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <Statistic
              title="模型占用"
              value={models.filter(m => m.downloaded).length * 8}
              suffix="GB (约)"
            />
            <Statistic title="已下载" value={models.filter(m => m.downloaded).length} suffix={`/ ${models.length}`} />
          </div>
          <Button icon={<DeleteOutlined />}>清理缓存</Button>
        </Space>
      </div>

      <Divider />

      <div className="settings-section">
        <h3>ℹ️ 关于</h3>
        <Space direction="vertical">
          <div>版本: 0.1.0</div>
          <div>作者: mChenys</div>
          <Button icon={<ReloadOutlined />}>检查更新</Button>
        </Space>
      </div>
    </div>
  )
}
