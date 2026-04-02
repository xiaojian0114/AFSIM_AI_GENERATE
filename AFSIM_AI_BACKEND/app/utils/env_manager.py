import os
from pathlib import Path
from typing import Optional


def get_env_path() -> Path:
    """获取 .env 文件路径"""
    return Path(__file__).parent.parent / ".env"


def read_env_file() -> dict:
    """读取 .env 文件内容"""
    env_path = get_env_path()
    if not env_path.exists():
        return {}
    
    result = {}
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                result[key.strip()] = value.strip()
    return result


def update_env_file(updates: dict) -> None:
    """更新 .env 文件"""
    env_path = get_env_path()
    current = read_env_file()
    current.update(updates)
    
    with open(env_path, "w", encoding="utf-8") as f:
        f.write("# AFSIM AI Backend Configuration\n\n")
        for key, value in current.items():
            if value is not None:
                f.write(f"{key}={value}\n")
            else:
                f.write(f"{key}=\n")
