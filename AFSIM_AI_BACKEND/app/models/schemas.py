from pydantic import BaseModel
from typing import List, Optional, Literal


class Message(BaseModel):
    """对话消息"""
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    """聊天请求"""
    messages: List[Message]
    stream: bool = False
    provider: Literal["deepseek", "ollama"] = "deepseek"
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


class ChatResponse(BaseModel):
    """聊天响应"""
    content: str
    provider: str
    model: str
    usage: Optional[dict] = None


class GenerationRequest(BaseModel):
    """AFSIM 脚本生成请求"""
    description: str
    mode: Literal["generate", "fix"] = "generate"
    error_context: Optional[str] = None
    provider: Literal["deepseek", "ollama"] = "deepseek"


class GenerationResponse(BaseModel):
    """AFSIM 脚本生成响应"""
    script: str
    explanation: Optional[str] = None
    provider: str


class SettingsUpdate(BaseModel):
    """设置更新"""
    deepseek_api_key: Optional[str] = None
    deepseek_api_base: Optional[str] = None
    deepseek_model: Optional[str] = None
    ollama_enabled: Optional[bool] = None
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None


class SettingsResponse(BaseModel):
    """设置响应（不包含敏感信息）"""
    deepseek_api_base: str
    deepseek_model: str
    ollama_enabled: bool
    ollama_base_url: str
    ollama_model: str
