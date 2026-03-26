import { useState } from 'react'
import {
  Input,
  Button,
  Space,
  Card,
  List,
  Tag,
  Select,
  Modal,
  message,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

interface KnowledgeItem {
  id: string
  text: string
  category: string
  tags: string[]
  createdAt: string
}

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<string>()
  const [items, setItems] = useState<KnowledgeItem[]>([
    {
      id: '1',
      text: '在 Swift 中使用 @escaping 标记异步闭包',
      category: 'coding',
      tags: ['swift', 'async'],
      createdAt: '2026-03-20',
    },
    {
      id: '2',
      text: 'React 的 useEffect 清理函数应该返回一个函数',
      category: 'coding',
      tags: ['react', 'hooks'],
      createdAt: '2026-03-18',
    },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newKnowledge, setNewKnowledge] = useState({
    text: '',
    category: 'general',
    tags: '',
  })

  const handleSearch = async () => {
    message.info('搜索功能开发中')
  }

  const handleAddKnowledge = () => {
    if (!newKnowledge.text.trim()) {
      message.warning('请输入知识点内容')
      return
    }

    setItems([
      {
        id: Date.now().toString(),
        text: newKnowledge.text,
        category: newKnowledge.category,
        tags: newKnowledge.tags.split(',').map((t) => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString().split('T')[0],
      },
      ...items,
    ])

    setNewKnowledge({ text: '', category: 'general', tags: '' })
    setIsModalOpen(false)
    message.success('添加成功')
  }

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    message.success('删除成功')
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      coding: '代码技巧',
      architecture: '架构设计',
      debugging: '调试技巧',
      tools: '工具使用',
      concepts: '概念知识',
      general: '通用知识',
    }
    return labels[cat] || cat
  }

  return (
    <div className="knowledge-container">
      <div className="knowledge-search">
        <Space style={{ width: '100%' }}>
          <Input
            placeholder="搜索知识库..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="分类"
            value={category}
            onChange={setCategory}
            allowClear
            style={{ width: 150 }}
            options={[
              { label: '代码技巧', value: 'coding' },
              { label: '架构设计', value: 'architecture' },
              { label: '调试技巧', value: 'debugging' },
              { label: '工具使用', value: 'tools' },
              { label: '概念知识', value: 'concepts' },
              { label: '通用知识', value: 'general' },
            ]}
          />
          <Button icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            添加知识
          </Button>
        </Space>
      </div>

      <List
        dataSource={items}
        renderItem={(item) => (
          <div className="knowledge-item">
            <div style={{ marginBottom: 8 }}>{item.text}</div>
            <Space>
              <Tag color="blue">{getCategoryLabel(item.category)}</Tag>
              {item.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              <span style={{ color: '#999', fontSize: 12 }}>
                {item.createdAt}
              </span>
            </Space>
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Space>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => message.info('编辑功能开发中')}
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item.id)}
                >
                  删除
                </Button>
              </Space>
            </div>
          </div>
        )}
        locale={{ emptyText: '暂无知识点' }}
      />

      <Modal
        title="添加知识点"
        open={isModalOpen}
        onOk={handleAddKnowledge}
        onCancel={() => setIsModalOpen(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>内容</label>
            <Input.TextArea
              value={newKnowledge.text}
              onChange={(e) =>
                setNewKnowledge({ ...newKnowledge, text: e.target.value })
              }
              placeholder="输入知识点内容"
              rows={4}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>分类</label>
            <Select
              value={newKnowledge.category}
              onChange={(v) => setNewKnowledge({ ...newKnowledge, category: v })}
              style={{ width: '100%' }}
              options={[
                { label: '代码技巧', value: 'coding' },
                { label: '架构设计', value: 'architecture' },
                { label: '调试技巧', value: 'debugging' },
                { label: '工具使用', value: 'tools' },
                { label: '概念知识', value: 'concepts' },
                { label: '通用知识', value: 'general' },
              ]}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>
              标签 (逗号分隔)
            </label>
            <Input
              value={newKnowledge.tags}
              onChange={(e) =>
                setNewKnowledge({ ...newKnowledge, tags: e.target.value })
              }
              placeholder="python, async, 最佳实践"
            />
          </div>
        </Space>
      </Modal>
    </div>
  )
}
