export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Conversation {
  id: number;
  title: string;
  provider: string;
  model?: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ChatRequest {
  messages: Message[];
  stream: boolean;
  provider: string;
  temperature?: number;
  max_tokens?: number;
}

export interface GenerationRequest {
  description: string;
  mode: 'generate' | 'fix';
  error_context?: string;
  provider: string;
}

export interface GenerationResponse {
  script: string;
  explanation?: string;
  provider: string;
}

export interface Settings {
  provider: string;
  deepseek_api_base: string;
  deepseek_model: string;
  ollama_enabled: boolean;
  ollama_base_url: string;
  ollama_model: string;
  user_id?: number;
}

export interface HealthCheck {
  status: 'ok' | 'error';
  message?: string;
  model?: string;
}
