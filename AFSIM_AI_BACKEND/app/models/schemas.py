from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


# ============ 用户认证 Schema ============
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    role: str
    is_active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ============ 对话 Schema ============
class ConversationCreate(BaseModel):
    title: Optional[str] = "新对话"
    provider: str = "deepseek"
    model: Optional[str] = None


class ConversationUpdate(BaseModel):
    title: Optional[str] = None


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    provider: str
    model: Optional[str]
    created_at: datetime
    updated_at: datetime
    messages_count: Optional[int] = 0


class ConversationDetailResponse(ConversationResponse):
    messages: List["MessageResponse"] = []


# ============ 消息 Schema ============
class MessageCreate(BaseModel):
    conversation_id: int
    role: str  # user, assistant, system
    content: str


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime


# ============ 设置 Schema ============
class SettingsResponse(BaseModel):
    provider: str
    deepseek_api_base: str
    deepseek_model: str
    ollama_enabled: bool
    ollama_base_url: str
    ollama_model: str
    user_id: Optional[int] = None


class SettingsUpdate(BaseModel):
    provider: Optional[str] = None
    deepseek_api_key: Optional[str] = None
    deepseek_api_base: Optional[str] = None
    deepseek_model: Optional[str] = None
    ollama_enabled: Optional[bool] = None
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None


# 更新 forward reference
ConversationDetailResponse.model_rebuild()


# ============ 消息 Schema ============
class Message(BaseModel):
    role: str
    content: str


# ============ Chat Request/Response Schema ============
class ChatRequest(BaseModel):
    messages: List[Message]
    provider: str = "deepseek"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2048


class UsageInfo(BaseModel):
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None


class ChatResponse(BaseModel):
    content: str
    provider: str
    model: Optional[str] = None
    usage: Optional[UsageInfo] = None


# ============ Generate Request/Response Schema ============
class GenerationRequest(BaseModel):
    description: Optional[str] = None
    error_context: Optional[str] = None
    mode: str = "generate"  # generate or fix
    provider: str = "deepseek"


class GenerationResponse(BaseModel):
    script: str
    explanation: Optional[str] = None
    provider: str
