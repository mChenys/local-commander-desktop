import { useState } from 'react'
import {
  Upload,
  Button,
  Select,
  Input,
  Space,
  Card,
  message,
  Empty,
} from 'antd'
import {
  UploadOutlined,
  CameraOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'

export default function Image() {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [analysisType, setAnalysisType] = useState('ui')
  const [prompt, setPrompt] = useState('分析这个UI')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (fileList.length === 0) {
      message.warning('请先上传图片')
      return
    }

    setAnalyzing(true)
    try {
      // TODO: Call Tauri backend
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setResult(`
## 分析结果

**类型**: 移动应用界面
**主题**: 深色模式

### 发现的问题
1. 按钮对比度不足
2. 标题字体过小
3. 间距不一致

### 改进建议
1. 增大按钮尺寸，提高可点击性
2. 提高文字对比度，改善可读性
3. 统一间距规范
      `)
      message.success('分析完成')
    } catch (error) {
      message.error('分析失败')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="image-container">
      <div className="image-preview">
        {fileList.length > 0 ? (
          <img
            src={URL.createObjectURL(fileList[0].originFileObj as File)}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }}
          />
        ) : (
          <Empty description="上传图片进行分析">
            <Space direction="vertical">
              <Upload
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList.slice(-1))}
                beforeUpload={() => false}
                accept="image/*"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
              <Button icon={<CameraOutlined />}>截图</Button>
            </Space>
          </Empty>
        )}
      </div>

      <div className="analysis-result">
        <Card title="分析设置" size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8 }}>
                分析类型
              </label>
              <Select
                value={analysisType}
                onChange={setAnalysisType}
                style={{ width: '100%' }}
                options={[
                  { label: 'UI 验收', value: 'ui' },
                  { label: 'OCR 文字识别', value: 'ocr' },
                  { label: '通用分析', value: 'general' },
                ]}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8 }}>
                提示词
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="输入分析提示词"
              />
            </div>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleAnalyze}
              loading={analyzing}
              block
              disabled={fileList.length === 0}
            >
              开始分析
            </Button>
          </Space>
        </Card>

        {result && (
          <Card title="分析结果" size="small">
            <div style={{ whiteSpace: 'pre-wrap' }}>{result}</div>
          </Card>
        )}
      </div>
    </div>
  )
}
