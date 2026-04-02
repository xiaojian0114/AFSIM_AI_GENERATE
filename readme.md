# AFSIM AI

AFSIM 脚本生成助手 - 基于 AI 的 AFSIM 场景配置工具

> 本项目基于 [HuangJZh/AFSIM_AI_Coder](https://github.com/HuangJZh/AFSIM_AI_Coder) 改进而来。

## 项目结构

```
AFSIM_AI/
├── AFSIM_AI_BACKEND/     # 后端 (Python FastAPI)
│   ├── app/              # 应用代码
│   │   ├── api/          # API 路由
│   │   ├── models/       # 数据模型
│   │   └── services/     # 业务服务
│   ├── tutorials/        # AFSIM 知识库
│   └── requirements.txt   # Python 依赖
├── AFSIM_AI_WEB/         # 前端 (React + TypeScript + Vite)
│   ├── src/              # 前端源代码
│   └── package.json      # Node 依赖
└── readme.md
```

## 快速开始

### 1. 后端设置

```bash
cd AFSIM_AI_BACKEND

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境
.venv\Scripts\activate  # Windows
# 或 source .venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
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

## 环境变量

### 后端 (.env)

```env
# DeepSeek API (必需)
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# 生成参数
MAX_TOKENS=8192
TEMPERATURE=0.2

# Ollama (可选，设为 true 启用)
OLLAMA_ENABLED=false
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

## API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/generate` | POST | 生成 AFSIM 脚本 |
| `/api/settings` | GET/POST | 获取/更新设置 |
| `/api/knowledge/files` | GET | 知识库文件列表 |
| `/api/health/{provider}` | GET | 健康检查 |

## 功能特性

- 支持 DeepSeek 云端 API
- 支持本地 Ollama 大模型
- 基于本地知识库生成 AFSIM 脚本
- 暗色主题界面
- 代码复制功能

## 技术栈

**后端:**
- Python 3.10+
- FastAPI
- OpenAI 兼容 API

**前端:**
- React 18
- TypeScript
- Vite
- CSS Modules
