# AFSIM AI 项目

AFSIM 脚本生成助手 - 前后端分离架构

## 项目结构

```
AFSIM_AI_Coder/
├── AFSIM_AI_WEB/     # 前端 (React + TypeScript)
├── backend/          # 后端 (Python FastAPI)
│   └── tutorials/    # 本地知识库
└── tutorials/        # 知识库源文件
```

## 快速开始

### 1. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.template .env
# 编辑 .env 文件，填入你的 API Key

# 启动后端
uvicorn app.main:app --reload --port 8000
```

### 2. 前端设置

```bash
cd AFSIM_AI_WEB

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 3. 访问

打开浏览器访问: http://localhost:5173

## 一键启动 (Windows PowerShell)

```powershell
.\start.ps1
```

## 功能特性

- 支持 DeepSeek 云端 API
- 支持本地 Ollama 大模型
- 基于本地知识库生成 AFSIM 脚本
- 暗色主题界面
- 代码复制功能

## API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | 通用聊天 |
| `/api/generate` | POST | 生成 AFSIM 脚本 |
| `/api/settings` | GET/POST | 获取/更新设置 |
| `/api/health/{provider}` | GET | 健康检查 |
| `/api/knowledge/files` | GET | 知识库文件列表 |

## 环境变量 (.env)

```env
# DeepSeek API
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com
DEEPSEEK_API_VERSION=deepseek-chat
MAX_TOKENS=8192
TEMPERATURE=0.2

# Ollama (可选)
OLLAMA_ENABLED=false
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```
