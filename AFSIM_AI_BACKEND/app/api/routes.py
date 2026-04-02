from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import (
    Message, ChatRequest, ChatResponse,
    GenerationRequest, GenerationResponse,
    SettingsUpdate, SettingsResponse
)
from ..services import llm_service, knowledge_base
from ..config import settings
from ..utils import update_env_file

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """通用聊天接口"""
    try:
        messages = [msg.model_dump() for msg in request.messages]
        
        result = llm_service.chat(
            messages=messages,
            provider=request.provider,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        content = result["choices"][0]["message"]["content"]
        
        return ChatResponse(
            content=content,
            provider=request.provider,
            model=result.get("model", ""),
            usage=result.get("usage")
        )
    except Exception as e:
        error_msg = str(e)
        if request.provider == "ollama":
            raise HTTPException(status_code=500, detail=f"[Ollama] {error_msg}")
        elif request.provider == "deepseek":
            raise HTTPException(status_code=500, detail=f"[DeepSeek] {error_msg}")
        else:
            raise HTTPException(status_code=500, detail=error_msg)


@router.post("/generate", response_model=GenerationResponse)
async def generate_script(request: GenerationRequest):
    """AFSIM 脚本生成接口"""
    try:
        system_instruction = knowledge_base.get_system_instruction()
        
        if request.mode == "fix":
            user_message = f"""请修复以下 AFSIM 脚本中的错误：

错误信息：
{request.error_context}

原始脚本：
请提供需要修复的脚本内容，我会帮你分析和修复。

请生成修复后的正确 AFSIM 脚本，并说明问题原因和修复方法。"""
        else:
            user_message = f"""请根据以下描述生成 AFSIM 脚本：

{request.description}

请生成完整、可运行的 AFSIM 脚本。"""
        
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_message}
        ]
        
        try:
            result = llm_service.chat(
                messages=messages,
                provider=request.provider,
                temperature=0.2
            )
        except Exception as e:
            error_msg = str(e)
            if request.provider == "ollama":
                raise HTTPException(status_code=500, detail=f"[Ollama] {error_msg}")
            elif request.provider == "deepseek":
                raise HTTPException(status_code=500, detail=f"[DeepSeek] {error_msg}")
            else:
                raise HTTPException(status_code=500, detail=error_msg)
        
        content = result["choices"][0]["message"]["content"]
        
        # 提取脚本和说明
        script = content
        explanation = None
        
        # 简单的解析逻辑
        if "```afsim" in content:
            parts = content.split("```afsim")
            if len(parts) > 1:
                script_part = parts[1].split("```")[0] if "```" in parts[1] else parts[1]
                script = script_part.strip()
        
        if "### 说明" in content:
            explanation = content.split("### 说明")[-1].strip()
        
        return GenerationResponse(
            script=script,
            explanation=explanation,
            provider=request.provider
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/knowledge/files")
async def get_knowledge_files():
    """获取知识库文件列表"""
    return {
        "files": knowledge_base.get_file_list()
    }


@router.get("/settings", response_model=SettingsResponse)
async def get_settings():
    """获取当前设置（不包含敏感信息）"""
    return SettingsResponse(
        provider=settings.provider,
        deepseek_api_base=settings.deepseek_api_base,
        deepseek_model=settings.deepseek_model,
        ollama_enabled=settings.ollama_enabled,
        ollama_base_url=settings.ollama_base_url,
        ollama_model=settings.ollama_model
    )


@router.post("/settings")
async def update_settings(update: SettingsUpdate):
    """更新设置（持久化到 .env 文件）"""
    try:
        print(f"[Settings] 收到更新请求: {update}")
        
        env_updates = {}
        
        if update.provider is not None:
            settings.provider = update.provider
            env_updates["PROVIDER"] = update.provider
            print(f"[Settings] 更新 provider: {update.provider}")
        if update.deepseek_api_key is not None:
            settings.deepseek_api_key = update.deepseek_api_key
            env_updates["DEEPSEEK_API_KEY"] = update.deepseek_api_key
        if update.deepseek_api_base is not None:
            settings.deepseek_api_base = update.deepseek_api_base
            env_updates["DEEPSEEK_API_BASE"] = update.deepseek_api_base
        if update.deepseek_model is not None:
            settings.deepseek_model = update.deepseek_model
            env_updates["DEEPSEEK_MODEL"] = update.deepseek_model
        if update.ollama_enabled is not None:
            settings.ollama_enabled = update.ollama_enabled
            env_updates["OLLAMA_ENABLED"] = str(update.ollama_enabled)
        if update.ollama_base_url is not None:
            settings.ollama_base_url = update.ollama_base_url
            env_updates["OLLAMA_BASE_URL"] = update.ollama_base_url
        if update.ollama_model is not None:
            settings.ollama_model = update.ollama_model
            env_updates["OLLAMA_MODEL"] = update.ollama_model
        
        print(f"[Settings] 准备写入 env: {env_updates}")
        
        if env_updates:
            update_env_file(env_updates)
        
        print(f"[Settings] 保存成功")
        
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Settings] 保存失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health/{provider}")
async def health_check(provider: str):
    """健康检查接口"""
    result = llm_service.check_connection(provider)
    return result
