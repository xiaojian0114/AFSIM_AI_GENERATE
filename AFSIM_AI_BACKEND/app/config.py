from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """应用配置"""
    
    # DeepSeek API 配置
    deepseek_api_key: str = ""
    deepseek_api_base: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"
    
    # 本地 Ollama 配置
    ollama_enabled: bool = False
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    
    # 默认设置
    max_tokens: int = 8192
    temperature: float = 0.2
    
    # 知识库路径 - 使用相对于 backend 目录的路径
    @property
    def knowledge_base_path(self) -> str:
        return os.path.join(os.path.dirname(os.path.dirname(__file__)), "tutorials")
    
    def reload(self):
        """重新加载配置"""
        self.__init__()

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
