# Local Commander Desktop

<p align="center">
  <strong>本地 AI 编程助手桌面应用</strong>
</p>

<p align="center">
  调用本地 MLX 模型，实现代码生成、图像分析、全平台 UI 自动化测试等功能<br>
  节省 90%+ Token 成本，保护代码隐私
</p>

---

## ✨ 功能特性

### 核心功能
- 💬 **对话模块** - 多模型对话，代码生成，Markdown 渲染
- 🖼️ **图像分析** - VL 模型分析 UI，OCR 支持
- 🔍 **代码审查** - 自动审查，一键修复
- 📚 **知识库** - 语义搜索，持久化存储
- ⚙️ **模型管理** - 下载/删除模型，状态监控

### 🆕 全平台 UI 自动化测试

| 平台 | 功能 | 依赖 |
|------|------|------|
| 🌐 **Web/SPA** | 截图、页面分析、批量测试、交互验证 | Playwright |
| 📱 **Android** | 设备控制、截图、点击、录制回放 | ADB |
| 🍎 **iOS 模拟器** | 模拟器管理、截图、操作、应用安装 | Xcode |
| 🍎 **iOS 真机** | 设备列表、截图 | libimobiledevice |
| 🖥️ **macOS 原生** | 窗口列表、元素查询 | AppleScript |
| 🔗 **API 测试** | HTTP 请求、测试序列 | requests |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Ant Design |
| 桌面框架 | Tauri 2.0 |
| 后端 | Python + FastAPI |
| 模型 | MLX (Qwen2.5-Coder, Qwen2.5-VL, Qwen3.5-27B) |

---

## 📦 安装

### 前置要求

- macOS 12.0+ (Apple Silicon)
- Node.js 18+
- Python 3.10+
- Rust 1.70+

### 平台依赖（可选）

```bash
# iOS 真机支持
brew install libimobiledevice

# Android 支持
brew install android-platform-tools
```

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/mChenys/local-commander-desktop.git
cd local-commander-desktop

# 安装前端依赖
npm install

# 安装 Python 依赖
cd python-backend
pip install -r requirements.txt
cd ..

# 开发模式
npm run tauri:dev
```

### 构建

```bash
npm run tauri:build
```

---

## 📁 项目结构

```
local-commander-desktop/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   │   ├── Chat/           # 对话模块
│   │   ├── Testing/        # 🆕 全平台测试模块
│   │   │   ├── Web/        # Web/SPA 测试
│   │   │   ├── Android/    # Android 测试
│   │   │   ├── iOS/        # iOS 测试
│   │   │   ├── Desktop/    # 桌面应用测试
│   │   │   └── API/        # API 测试
│   │   ├── Image/          # 图像分析
│   │   ├── CodeReview/     # 代码审查
│   │   ├── Knowledge/      # 知识库
│   │   └── Settings/       # 设置
│   ├── stores/             # Zustand 状态管理
│   └── App.tsx
├── src-tauri/              # Tauri 后端
│   ├── src/
│   │   ├── main.rs         # Rust 入口
│   │   └── commands/       # Tauri 命令
│   └── Cargo.toml
├── python-backend/         # Python 服务
│   ├── main.py             # FastAPI 入口
│   ├── router.py           # 模型路由
│   ├── executor.py         # 任务执行
│   └── requirements.txt
└── README.md
```

---

## 🚀 使用

### 基础使用
1. 启动应用后，首先在 **设置** 中下载所需模型
2. 在 **对话** 模块中开始使用
3. 上传图片进行 UI 分析

### 全平台测试
1. **Web 测试** - 输入 URL，自动截图分析
2. **Android 测试** - 连接设备，自动检测
3. **iOS 模拟器** - 选择模拟器，启动测试
4. **iOS 真机** - 连接设备，截图分析
5. **macOS 原生** - 选择窗口，分析 UI
6. **API 测试** - 配置请求，批量测试

---

## 📝 开发进度

### 已完成
- [x] 项目框架搭建
- [x] React 组件结构
- [x] Tauri 命令定义
- [x] Python 后端 API
- [x] 全平台测试架构设计

### 进行中
- [ ] 模型下载功能
- [ ] 实际模型调用

### 全平台测试模块
- [ ] Web/SPA 测试界面
- [ ] Android 测试界面（重构）
- [ ] iOS 模拟器测试界面
- [ ] iOS 真机测试界面
- [ ] macOS 原生窗口测试界面
- [ ] API 测试界面

### 其他
- [ ] 知识库集成
- [ ] 打包发布

---

## 📊 全平台测试架构

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    Local Commander Desktop - 全平台 UI 自动化测试                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ 🌐 Web/SPA  │  │ 📱 Android  │  │ 🍎 iOS Sim  │  │ 🍎 iOS Dev  │           │
│  │             │  │             │  │             │  │             │           │
│  │ • 截图      │  │ • 设备列表  │  │ • 模拟器列表│  │ • 设备列表  │           │
│  │ • 页面分析  │  │ • 截图      │  │ • 启动/关闭 │  │ • 截图      │           │
│  │ • 批量测试  │  │ • 点击      │  │ • 截图      │  │ • 操作      │           │
│  │ • 交互验证  │  │ • 录制回放  │  │ • 操作      │  │             │           │
│  │             │  │             │  │ • 应用管理  │  │             │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐                                              │
│  │ 🖥️ macOS   │  │ 🔗 API      │                                              │
│  │             │  │             │                                              │
│  │ • 窗口列表  │  │ • HTTP 请求 │                                              │
│  │ • 元素查询  │  │ • 测试序列  │                                              │
│  │ • 截图      │  │ • 断言验证  │                                              │
│  │             │  │             │                                              │
│  └─────────────┘  └─────────────┘                                              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        🤖 VL 视觉分析                                    │   │
│  │                                                                         │   │
│  │   所有平台截图 → VL 模型 → UI 分析报告 → 问题定位 → 自动修复建议        │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 许可证

Copyright © 2026 mChenys. All rights reserved.
