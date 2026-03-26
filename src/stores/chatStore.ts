import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  model: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  selectedModel: string
  isLoading: boolean

  // Actions
  createConversation: () => void
  deleteConversation: (id: string) => void
  selectConversation: (id: string) => void
  setModel: (model: string) => void
  addMessage: (content: string, role: 'user' | 'assistant', model?: string) => void
  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  selectedModel: 'coder',
  isLoading: false,

  createConversation: () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: '新对话',
      model: get().selectedModel,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: newConversation.id,
    }))
  },

  deleteConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId:
        state.currentConversationId === id
          ? state.conversations[0]?.id || null
          : state.currentConversationId,
    }))
  },

  selectConversation: (id) => {
    set({ currentConversationId: id })
  },

  setModel: (model) => {
    set({ selectedModel: model })
  },

  addMessage: (content, role, model) => {
    const { currentConversationId } = get()
    if (!currentConversationId) return

    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      model,
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              messages: [...c.messages, message],
              updatedAt: new Date().toISOString(),
              title:
                c.messages.length === 0 && role === 'user'
                  ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
                  : c.title,
            }
          : c
      ),
    }))
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },
}))
