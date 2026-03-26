import { create } from 'zustand'

export interface ModelStatus {
  name: string
  alias: string
  size: string
  downloaded: boolean
  path?: string
}

interface ModelState {
  models: ModelStatus[]
  selectedModel: string
  loadingModels: string[]

  // Actions
  setModels: (models: ModelStatus[]) => void
  selectModel: (alias: string) => void
  setModelDownloading: (alias: string, downloading: boolean) => void
}

export const useModelStore = create<ModelState>((set) => ({
  models: [
    {
      name: 'Qwen2.5-Coder-14B-Instruct-4bit',
      alias: 'coder',
      size: '8.2 GB',
      downloaded: false,
    },
    {
      name: 'Qwen2.5-VL-7B-Instruct-4bit',
      alias: 'vl',
      size: '5.1 GB',
      downloaded: false,
    },
    {
      name: 'Qwen3.5-27B-4bit',
      alias: '27b',
      size: '15.3 GB',
      downloaded: false,
    },
    {
      name: 'Qwen2.5-7B-Instruct-4bit',
      alias: '7b',
      size: '4.2 GB',
      downloaded: false,
    },
  ],
  selectedModel: 'coder',
  loadingModels: [],

  setModels: (models) => set({ models }),

  selectModel: (alias) => set({ selectedModel: alias }),

  setModelDownloading: (alias, downloading) => {
    set((state) => ({
      loadingModels: downloading
        ? [...state.loadingModels, alias]
        : state.loadingModels.filter((a) => a !== alias),
    }))
  },
}))
