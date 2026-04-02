import React, { useState } from 'react';
import { ChatMessage, CodeBlock, SettingsPanel } from '../components';
import { chatApi } from '../services';
import type { Message, Settings } from '../types';

export const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<'deepseek' | 'ollama'>('deepseek');
  const [settings, setSettings] = useState<Settings & { deepseek_api_key: string }>({
    deepseek_api_key: '',
    deepseek_api_base: 'https://api.deepseek.com',
    deepseek_model: 'deepseek-chat',
    ollama_enabled: false,
    ollama_base_url: 'http://localhost:11434',
    ollama_model: 'llama3'
  });

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await chatApi.getSettings();
      const savedKey = localStorage.getItem('deepseek_api_key') || '';
      setSettings({
        ...data,
        deepseek_api_key: savedKey
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatApi.generate({
        description: input,
        mode: 'generate',
        provider
      });

      const assistantMessage: Message = { role: 'assistant', content: response.script };
      setMessages(prev => [...prev, assistantMessage]);

      if (response.explanation) {
        const explanationMessage: Message = { role: 'system', content: response.explanation };
        setMessages(prev => [...prev, explanationMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'system',
        content: `错误: ${error.response?.data?.detail || error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveSettings = async (newSettings: any) => {
    try {
      if (newSettings.deepseek_api_key) {
        localStorage.setItem('deepseek_api_key', newSettings.deepseek_api_key);
      }
      await chatApi.updateSettings(newSettings);
      setSettings(newSettings);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleTestConnection = async (providerType: string) => {
    try {
      const result = await chatApi.healthCheck(providerType);
      alert(`连接状态: ${result.status}\n${result.error || ''}`);
    } catch (error: any) {
      alert(`连接失败: ${error.message}`);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#111827'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#1f2937',
        borderBottom: '1px solid #374151'
      }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
          AFSIM AI - 脚本生成助手
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'deepseek' | 'ollama')}
            disabled={settings.ollama_enabled ? false : provider === 'ollama'}
            style={{
              padding: '8px 12px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: '#fff'
            }}
          >
            <option value="deepseek">DeepSeek 云端</option>
            {settings.ollama_enabled && <option value="ollama">本地 Ollama</option>}
          </select>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            设置
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            marginTop: '100px'
          }}>
            <h2>欢迎使用 AFSIM AI 脚本生成助手</h2>
            <p>请描述你想要生成的 AFSIM 脚本功能</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            AI 正在生成脚本...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px 24px',
        backgroundColor: '#1f2937',
        borderTop: '1px solid #374151'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="描述你想要生成的 AFSIM 脚本功能..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#fff',
              resize: 'none',
              minHeight: '48px',
              maxHeight: '200px',
              fontFamily: 'inherit',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#6b7280' : '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '生成中...' : '生成'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
};
