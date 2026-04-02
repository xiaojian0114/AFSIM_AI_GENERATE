export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  provider: 'deepseek' | 'ollama';
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerationRequest {
  description: string;
  mode: 'generate' | 'fix';
  error_context?: string;
  provider: 'deepseek' | 'ollama';
}

export interface GenerationResponse {
  script: string;
  explanation?: string;
  provider: string;
}

export interface Settings {
  deepseek_api_base: string;
  deepseek_model: string;
  ollama_enabled: boolean;
  ollama_base_url: string;
  ollama_model: string;
}

export interface HealthCheck {
  status: 'connected' | 'error' | 'not_configured';
  provider: string;
  available_models?: string[];
  error?: string;
}
