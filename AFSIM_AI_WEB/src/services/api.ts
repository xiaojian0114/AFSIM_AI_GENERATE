import axios from 'axios';
import type {
  ChatRequest,
  ChatResponse,
  GenerationRequest,
  GenerationResponse,
  Settings,
  HealthCheck,
  Message,
  User,
  Token,
  Conversation,
  ConversationDetail,
  OllamaModelsResponse,
  KnowledgeFilesResponse,
  KnowledgeFileContent,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5 minutes for local Ollama
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ 认证 API ============
export const authApi = {
  login: async (username: string, password: string): Promise<Token> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post<Token>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    const response = await api.post<User>('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// ============ 对话 API ============
export const conversationApi = {
  list: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/conversations');
    return response.data;
  },

  create: async (title?: string, provider?: string): Promise<Conversation> => {
    const response = await api.post<Conversation>('/conversations', {
      title: title || '新对话',
      provider: provider || 'deepseek',
    });
    return response.data;
  },

  get: async (id: number): Promise<ConversationDetail> => {
    const response = await api.get<ConversationDetail>(`/conversations/${id}`);
    return response.data;
  },

  update: async (id: number, title: string): Promise<Conversation> => {
    const response = await api.put<Conversation>(`/conversations/${id}`, { title });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/conversations/${id}`);
  },

  addMessage: async (conversationId: number, role: string, content: string): Promise<Message> => {
    const response = await api.post<Message>('/conversations/messages', {
      conversation_id: conversationId,
      role,
      content,
    });
    return response.data;
  },

  deleteMessage: async (messageId: number): Promise<void> => {
    await api.delete(`/conversations/messages/${messageId}`);
  },
};

// ============ 原有 Chat API ============
export const chatApi = {
  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/chat', request);
    return response.data;
  },

  generate: async (request: GenerationRequest): Promise<GenerationResponse> => {
    const response = await api.post<GenerationResponse>('/generate', request);
    return response.data;
  },

  getSettings: async (): Promise<Settings> => {
    const response = await api.get<Settings>('/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<Settings & { deepseek_api_key?: string }>): Promise<void> => {
    await api.post('/settings', settings);
  },

  healthCheck: async (provider: string): Promise<HealthCheck> => {
    const response = await api.get<HealthCheck>(`/health/${provider}`);
    return response.data;
  },
};

// ============ Ollama API ============
export const ollamaApi = {
  getModels: async (): Promise<OllamaModelsResponse> => {
    const response = await api.get<OllamaModelsResponse>('/ollama/models');
    return response.data;
  },
};

// ============ 知识库 API ============
export const knowledgeApi = {
  getFiles: async (): Promise<KnowledgeFilesResponse> => {
    const response = await api.get<KnowledgeFilesResponse>('/knowledge/files');
    return response.data;
  },

  getFileContent: async (filename: string): Promise<KnowledgeFileContent> => {
    const response = await api.get<KnowledgeFileContent>(`/knowledge/files/${filename}`);
    return response.data;
  },
};
