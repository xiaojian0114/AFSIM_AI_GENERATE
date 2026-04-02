from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .api import router
from .models.database import init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """启动和关闭时的处理"""
    # 启动时初始化数据库
    try:
        init_database()
    except Exception as e:
        print(f"[Database] 初始化失败: {e}")
        print("[Database] 请确保 MySQL 服务正在运行，并配置环境变量")
    yield
    # 关闭时


app = FastAPI(
    title="AFSIM AI API",
    description="AFSIM 脚本生成助手 API - 支持多用户和对话管理",
    version="2.0.0",
    lifespan=lifespan
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "AFSIM AI API", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
