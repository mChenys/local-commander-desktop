import { useEffect, useState } from 'react'
import {
  Button,
  Select,
  Space,
  Card,
  List,
  Tag,
  message,
  Empty,
} from 'antd'
import {
  CameraOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useAndroidStore } from '../stores'

export default function Android() {
  const {
    devices,
    selectedDevice,
    screenshot,
    testSteps,
    isRecording,
    setDevices,
    selectDevice,
    setScreenshot,
    addTestStep,
    clearTestSteps,
    setRecording,
  } = useAndroidStore()

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // TODO: Fetch devices from Tauri backend
    // For now, show empty state
  }, [])

  const handleRefreshDevices = async () => {
    setIsLoading(true)
    try {
      // TODO: Call Tauri backend to get devices
      setDevices([
        {
          id: 'emulator-5554',
          name: 'Android Emulator',
          model: 'Pixel 6',
          androidVersion: '13',
        },
      ])
      message.success('已刷新设备列表')
    } catch (error) {
      message.error('获取设备列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleScreenshot = async () => {
    if (!selectedDevice) {
      message.warning('请先选择设备')
      return
    }
    setIsLoading(true)
    try {
      // TODO: Call Tauri backend
      setScreenshot('/tmp/screenshot.png')
      message.success('截图成功')
    } catch (error) {
      message.error('截图失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartRecording = () => {
    setRecording(true)
    clearTestSteps()
    message.info('开始录制')
  }

  const handleStopRecording = () => {
    setRecording(false)
    message.info('录制结束')
  }

  const handleRunTest = async () => {
    if (testSteps.length === 0) {
      message.warning('没有测试步骤')
      return
    }
    // TODO: Run test
    message.info('运行测试...')
  }

  return (
    <div className="android-container">
      <div className="device-screen">
        {screenshot ? (
          <img
            src={`file://${screenshot}`}
            alt="Device Screen"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        ) : (
          <Empty description="选择设备并截图" />
        )}
      </div>

      <div className="device-controls">
        <Card title="设备" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              placeholder="选择设备"
              value={selectedDevice}
              onChange={selectDevice}
              style={{ width: '100%' }}
              options={devices.map((d) => ({
                label: `${d.name} (${d.androidVersion})`,
                value: d.id,
              }))}
            />
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefreshDevices}
                loading={isLoading}
              >
                刷新
              </Button>
              <Button
                icon={<CameraOutlined />}
                onClick={handleScreenshot}
                loading={isLoading}
                disabled={!selectedDevice}
              >
                截图
              </Button>
            </Space>
          </Space>
        </Card>

        <Card title="测试步骤" size="small">
          <List
            size="small"
            dataSource={testSteps}
            renderItem={(step, index) => (
              <List.Item>
                <Space>
                  <span>{index + 1}.</span>
                  <Tag>{step.action}</Tag>
                  <span>
                    {step.element?.text || step.coords
                      ? `(${step.coords?.x}, ${step.coords?.y})`
                      : ''}
                  </span>
                  <Tag color={step.status === 'success' ? 'green' : step.status === 'failed' ? 'red' : 'default'}>
                    {step.status || 'pending'}
                  </Tag>
                </Space>
              </List.Item>
            )}
            locale={{ emptyText: '暂无步骤' }}
          />
        </Card>

        <Card title="操作" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button
                type={isRecording ? 'default' : 'primary'}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
              >
                {isRecording ? '停止录制' : '开始录制'}
              </Button>
              <Button
                icon={<PlayCircleOutlined />}
                onClick={handleRunTest}
                disabled={testSteps.length === 0}
              >
                运行测试
              </Button>
            </Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => message.info('查看元素功能开发中')}
              disabled={!selectedDevice}
            >
              查看元素
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  )
}
