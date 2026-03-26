import { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  MessageOutlined,
  GlobalOutlined,
  AndroidOutlined,
  AppleOutlined,
  DesktopOutlined,
  ApiOutlined,
  PictureOutlined,
  CodeOutlined,
  BookOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import Chat from './components/Chat'
import WebTesting from './components/Testing/Web'
import Android from './components/Android'
import Image from './components/Image'
import CodeReview from './components/CodeReview'
import Knowledge from './components/Knowledge'
import Settings from './components/Settings'
import './App.css'

const { Header, Sider, Content } = Layout

type PageKey =
  | 'chat'
  | 'web'
  | 'android'
  | 'ios'
  | 'desktop'
  | 'api'
  | 'image'
  | 'code'
  | 'knowledge'
  | 'settings'

const menuItems = [
  { key: 'chat', icon: <MessageOutlined />, label: '对话' },
  { type: 'divider' as const },
  { key: 'testing-group', type: 'group' as const, label: 'UI 自动化测试' },
  { key: 'web', icon: <GlobalOutlined />, label: 'Web 测试' },
  { key: 'android', icon: <AndroidOutlined />, label: 'Android' },
  { key: 'ios', icon: <AppleOutlined />, label: 'iOS' },
  { key: 'desktop', icon: <DesktopOutlined />, label: '桌面应用' },
  { key: 'api', icon: <ApiOutlined />, label: 'API 测试' },
  { type: 'divider' as const },
  { key: 'tools-group', type: 'group' as const, label: '工具' },
  { key: 'image', icon: <PictureOutlined />, label: '图像分析' },
  { key: 'code', icon: <CodeOutlined />, label: '代码审查' },
  { key: 'knowledge', icon: <BookOutlined />, label: '知识库' },
  { type: 'divider' as const },
  { key: 'settings', icon: <SettingOutlined />, label: '设置' },
]

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('chat')
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const renderContent = () => {
    switch (currentPage) {
      case 'chat':
        return <Chat />
      case 'web':
        return <WebTesting />
      case 'android':
        return <Android />
      case 'ios':
        return (
          <div className="placeholder-page">
            <h2>🍎 iOS 测试</h2>
            <p>iOS 模拟器管理、真机连接、截图分析、操作录制</p>
            <p style={{ color: '#999' }}>开发中...</p>
          </div>
        )
      case 'desktop':
        return (
          <div className="placeholder-page">
            <h2>🖥️ 桌面应用测试</h2>
            <p>macOS 原生窗口、元素查询、UI 分析</p>
            <p style={{ color: '#999' }}>开发中...</p>
          </div>
        )
      case 'api':
        return (
          <div className="placeholder-page">
            <h2>🔗 API 测试</h2>
            <p>HTTP 请求、测试序列、断言验证</p>
            <p style={{ color: '#999' }}>开发中...</p>
          </div>
        )
      case 'image':
        return <Image />
      case 'code':
        return <CodeReview />
      case 'knowledge':
        return <Knowledge />
      case 'settings':
        return <Settings />
      default:
        return <Chat />
    }
  }

  const getCurrentLabel = () => {
    const item = menuItems.find((item) => 'key' in item && item.key === currentPage)
    return item && 'label' in item ? item.label : ''
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div className="logo">
          {collapsed ? 'LC' : 'Local Commander'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={(e) => setCurrentPage(e.key as PageKey)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="header-content">
            <span className="page-title">{getCurrentLabel()}</span>
          </div>
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
