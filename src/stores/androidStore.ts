import { create } from 'zustand'

export interface Device {
  id: string
  name: string
  model: string
  androidVersion: string
}

export interface TestStep {
  action: 'tap' | 'swipe' | 'input' | 'back' | 'screenshot'
  element?: {
    text?: string
    resourceId?: string
    contentDesc?: string
  }
  coords?: { x: number; y: number }
  input?: string
  expected?: string
  status?: 'pending' | 'success' | 'failed'
}

interface AndroidState {
  devices: Device[]
  selectedDevice: string | null
  screenshot: string | null
  testSteps: TestStep[]
  isRecording: boolean

  // Actions
  setDevices: (devices: Device[]) => void
  selectDevice: (id: string) => void
  setScreenshot: (path: string | null) => void
  addTestStep: (step: TestStep) => void
  clearTestSteps: () => void
  setRecording: (recording: boolean) => void
  updateStepStatus: (index: number, status: 'pending' | 'success' | 'failed') => void
}

export const useAndroidStore = create<AndroidState>((set) => ({
  devices: [],
  selectedDevice: null,
  screenshot: null,
  testSteps: [],
  isRecording: false,

  setDevices: (devices) => set({ devices }),

  selectDevice: (id) => set({ selectedDevice: id }),

  setScreenshot: (path) => set({ screenshot: path }),

  addTestStep: (step) =>
    set((state) => ({
      testSteps: [...state.testSteps, step],
    })),

  clearTestSteps: () => set({ testSteps: [] }),

  setRecording: (recording) => set({ isRecording: recording }),

  updateStepStatus: (index, status) =>
    set((state) => ({
      testSteps: state.testSteps.map((step, i) =>
        i === index ? { ...step, status } : step
      ),
    })),
}))
