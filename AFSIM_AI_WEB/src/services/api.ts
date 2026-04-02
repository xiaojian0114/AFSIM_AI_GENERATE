import axios from 'axios';
import type {
  ChatRequest,
  ChatResponse,
  GenerationRequest,
  GenerationResponse,
  Settings,
  HealthCheck,
  Message
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

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

  getKnowledgeFiles: async (): Promise<{ files: Array<{ name: string; path: string; size: number }> }> => {
    const response = await api.get('/knowledge/files');
    return response.data;
  }
};
