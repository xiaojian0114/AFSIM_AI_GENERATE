from pydantic import BaseModel, EmailStr
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
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


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
    id: int
    title: str
    provider: str
    model: Optional[str]
    created_at: datetime
    updated_at: datetime
    messages_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ConversationDetailResponse(ConversationResponse):
    messages: List["MessageResponse"] = []


# ============ 消息 Schema ============
class MessageCreate(BaseModel):
    conversation_id: int
    role: str  # user, assistant, system
    content: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


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
