import { useState } from 'react'
import {
  Button,
  Space,
  Switch,
  Select,
  message,
  Divider,
  Statistic,
} from 'antd'
import {
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useModelStore } from '../../stores'

export default function Settings() {
  const { models, setModels } = useModelStore()
  const [theme, setTheme] = useState('system')
  const [autoSave, setAutoSave] = useState(true)
  const [defaultModel, setDefaultModel] = useState('coder')

  const handleDownloadModel = async (alias: string) => {
    message.info(`开始下载模型: ${alias}`)
    // TODO: Call Tauri backend
  }

  const handleDeleteModel = async (alias: string) => {
    setModels(
      models.map((m) =>
        m.alias === alias ? { ...m, downloaded: false, path: undefined } : m
      )
    )
    message.success(`已删除模型: ${alias}`)
  }

  return (
    <div>
      <div className="settings-section">
        <h3>📦 模型管理</h3>
        <div className="model-list">
          {models.map((model) => (
            <div key={model.alias} className="model-item">
              <div>
                <div style={{ fontWeight: 500 }}>
                  {model.alias.toUpperCase()} ({model.name})
                </div>
                <div style={{ color: '#666', fontSize: 12 }}>
                  大小: {model.size}
                </div>
              </div>
              <Space>
                {model.downloaded ? (
                  <>
                    <span style={{ color: '#52c41a' }}>✅ 已下载</span>
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
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadModel(model.alias)}
                  >
                    下载
                  </Button>
                )}
              </Space>
            </div>
          ))}
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
            <Statistic title="模型占用" value={17.5} suffix="GB" />
            <Statistic title="对话历史" value={128} suffix="MB" />
            <Statistic title="缓存" value={64} suffix="MB" />
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
