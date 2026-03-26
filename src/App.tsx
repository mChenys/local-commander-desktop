import { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  MessageOutlined,
  AndroidOutlined,
  PictureOutlined,
  CodeOutlined,
  BookOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import Chat from './components/Chat'
import Android from './components/Android'
import Image from './components/Image'
import CodeReview from './components/CodeReview'
import Knowledge from './components/Knowledge'
import Settings from './components/Settings'
import './App.css'

const { Header, Sider, Content } = Layout

type PageKey = 'chat' | 'android' | 'image' | 'code' | 'knowledge' | 'settings'

const menuItems = [
  { key: 'chat', icon: <MessageOutlined />, label: '对话' },
  { key: 'android', icon: <AndroidOutlined />, label: 'Android 自动化' },
  { key: 'image', icon: <PictureOutlined />, label: '图像分析' },
  { key: 'code', icon: <CodeOutlined />, label: '代码审查' },
  { key: 'knowledge', icon: <BookOutlined />, label: '知识库' },
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
      case 'android':
        return <Android />
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
            <span className="page-title">
              {menuItems.find((item) => item.key === currentPage)?.label}
            </span>
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
