# Local Commander Desktop

<p align="center">
  <strong>本地 AI 编程助手桌面应用</strong>
</p>

<p align="center">
  调用本地 MLX 模型，实现代码生成、图像分析、UI 自动化测试等功能<br>
  节省 90%+ Token 成本，保护代码隐私
</p>

---

## ✨ 功能特性

- 💬 **对话模块** - 多模型对话，代码生成，Markdown 渲染
- 📱 **Android 自动化** - ADB 控制，测试录制回放
- 🖼️ **图像分析** - VL 模型分析 UI，OCR 支持
- 🔍 **代码审查** - 自动审查，一键修复
- 📚 **知识库** - 语义搜索，持久化存储
- ⚙️ **模型管理** - 下载/删除模型，状态监控

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Ant Design |
| 桌面框架 | Tauri 2.0 |
| 后端 | Python + FastAPI |
| 模型 | MLX (Qwen2.5-Coder, Qwen2.5-VL, Qwen3.5-27B) |

## 📦 安装

### 前置要求

- macOS 12.0+ (Apple Silicon)
- Node.js 18+
- Python 3.10+
- Rust 1.70+

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

## 📁 项目结构

```
local-commander-desktop/
├── src/                    # React 前端
│   ├── components/         # UI 组件
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

## 🚀 使用

1. 启动应用后，首先在 **设置** 中下载所需模型
2. 在 **对话** 模块中开始使用
3. 连接 Android 设备可使用自动化功能
4. 上传图片进行 UI 分析

## 📝 开发进度

- [x] 项目框架搭建
- [x] React 组件结构
- [x] Tauri 命令定义
- [x] Python 后端 API
- [ ] 模型下载功能
- [ ] 实际模型调用
- [ ] Android 自动化
- [ ] 知识库集成
- [ ] 打包发布

## 📄 许可证

Copyright © 2026 mChenys. All rights reserved.
