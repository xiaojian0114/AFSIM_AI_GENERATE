import requests
from typing import List, Dict, Any, Optional
from ..config import settings


class LLMService:
    """大模型服务 - 支持 DeepSeek 和 Ollama"""
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        provider: str = "deepseek",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """调用大模型聊天"""
        if provider == "deepseek":
            return self._chat_deepseek(messages, model, temperature, max_tokens)
        elif provider == "ollama":
            return self._chat_ollama(messages, model, temperature, max_tokens)
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.deepseek_api_key}"
        }
    
    def _chat_deepseek(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """调用 DeepSeek API"""
        model = model or settings.deepseek_model
        temperature = temperature if temperature is not None else settings.temperature
        max_tokens = max_tokens or settings.max_tokens
        
        # 检查 API Key
        if not settings.deepseek_api_key or settings.deepseek_api_key == "your_api_key_here":
            raise ValueError("DeepSeek API Key 未配置或未设置，请在设置中配置 API Key")
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        print(f"[LLMService] 发送请求到 DeepSeek API: {settings.deepseek_api_base}")
        print(f"[LLMService] Model: {model}, Temperature: {temperature}, MaxTokens: {max_tokens}")
        print(f"[LLMService] 消息数量: {len(messages)}")
        
        try:
            response = requests.post(
                f"{settings.deepseek_api_base}/chat/completions",
                headers=self._get_headers(),
                json=payload,
                timeout=120
            )
            
            print(f"[LLMService] 响应状态: {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                print(f"[LLMService] API 错误: {error_text}")
                raise Exception(f"DeepSeek API 错误 ({response.status_code}): {error_text}")
            
            return response.json()
            
        except requests.exceptions.Timeout:
            raise Exception("请求超时，请检查网络连接")
        except requests.exceptions.ConnectionError as e:
            raise Exception(f"无法连接到 DeepSeek API: {str(e)}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"请求错误: {str(e)}")
    
    def _chat_ollama(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """调用 Ollama 本地 API"""
        model = model or settings.ollama_model
        
        # 将消息格式转换为 Ollama 格式
        ollama_messages = [{"role": m["role"], "content": m["content"]} for m in messages]
        
        payload = {
            "model": model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": temperature if temperature is not None else settings.temperature,
                "num_predict": max_tokens or settings.max_tokens
            }
        }
        
        print(f"[LLMService] 发送请求到 Ollama: {settings.ollama_base_url}")
        
        response = requests.post(
            f"{settings.ollama_base_url}/api/chat",
            json=payload,
            timeout=120
        )
        response.raise_for_status()
        result = response.json()
        
        # 转换为 OpenAI 兼容格式
        return {
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": result.get("message", {}).get("content", "")
                }
            }],
            "model": model,
            "usage": result.get("total_duration", {})
        }
    
    def check_connection(self, provider: str) -> Dict[str, Any]:
        """检查连接状态"""
        if provider == "deepseek":
            return self._check_deepseek()
        elif provider == "ollama":
            return self._check_ollama()
        return {"status": "unknown", "provider": provider}
    
    def _check_deepseek(self) -> Dict[str, Any]:
        """检查 DeepSeek 连接"""
        try:
            if not settings.deepseek_api_key or settings.deepseek_api_key == "your_api_key_here":
                return {"status": "not_configured", "provider": "deepseek"}
            
            # 发送一个简单的测试请求
            payload = {
                "model": settings.deepseek_model,
                "messages": [{"role": "user", "content": "Hi"}],
                "max_tokens": 5
            }
            response = requests.post(
                f"{settings.deepseek_api_base}/chat/completions",
                headers=self._get_headers(),
                json=payload,
                timeout=10
            )
            if response.status_code == 200:
                return {"status": "connected", "provider": "deepseek"}
            else:
                return {"status": "error", "provider": "deepseek", "error": response.text}
        except Exception as e:
            return {"status": "error", "provider": "deepseek", "error": str(e)}
    
    def _check_ollama(self) -> Dict[str, Any]:
        """检查 Ollama 连接"""
        try:
            response = requests.get(
                f"{settings.ollama_base_url}/api/tags",
                timeout=5
            )
            if response.status_code == 200:
                models = response.json().get("models", [])
                return {
                    "status": "connected",
                    "provider": "ollama",
                    "available_models": [m.get("name") for m in models]
                }
            else:
                return {"status": "error", "provider": "ollama", "error": response.text}
        except Exception as e:
            return {"status": "error", "provider": "ollama", "error": str(e)}


llm_service = LLMService()
