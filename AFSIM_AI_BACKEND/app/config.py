from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """应用配置"""
    
    # 默认提供商
    provider: str = "deepseek"
    
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
        # 重新读取 .env 文件
        from ..utils import read_env_file
        env_data = read_env_file()
        for key, value in env_data.items():
            if hasattr(self, key):
                # 转换类型
                field_type = type(getattr(self.__class__, key, str))
                if field_type == bool:
                    value = value.lower() in ('true', '1', 'yes')
                elif field_type == int:
                    value = int(value)
                setattr(self, key, value)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
