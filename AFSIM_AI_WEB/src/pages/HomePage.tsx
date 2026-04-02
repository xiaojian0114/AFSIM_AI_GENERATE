import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, SettingsPanel } from '../components';
import { chatApi } from '../services';
import type { Message, Settings } from '../types';

// 抽离样式常量，保持渲染逻辑整洁
const COLORS = {
  bg: '#111827',
  panel: '#1f2937',
  border: '#374151',
  text: '#f3f4f6',
  primary: '#3b82f6',
  danger: '#ef4444',
  accent: '#4b5563'
};

export const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<'deepseek' | 'ollama'>('deepseek');
  const [settings, setSettings] = useState<Settings>({
    provider: 'deepseek',
    deepseek_api_key: '',
    deepseek_api_base: 'https://api.deepseek.com',
    deepseek_model: 'deepseek-chat',
    ollama_enabled: false,
    ollama_base_url: 'http://localhost:11434',
    ollama_model: 'llama3'
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      try {
        const data = await chatApi.getSettings();
        const savedKey = localStorage.getItem('deepseek_api_key') || '';
        const newSettings = { ...data, deepseek_api_key: savedKey };
        setSettings(newSettings);
        setProvider(data.provider || 'deepseek');
      } catch (err) {
        console.error('Settings load failed', err);
      }
    };
    init();
  }, []);

  // 滚动到底部逻辑优化：使用 requestAnimationFrame 确保在 DOM 更新后触发
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const scrollContainer = chatContainerRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // 同步 provider 与 settings.provider
  useEffect(() => {
    if (settings.provider) {
      setProvider(settings.provider as 'deepseek' | 'ollama');
    }
  }, [settings.provider]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // 处理输入框高度自适应
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input;
    setInput(''); // 立即清空，提升反馈速度
    setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
    setLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await chatApi.generate({
        description: currentInput,
        mode: 'generate',
        provider
      });

      // 批量更新消息，减少渲染次数
      const newMessages: Message[] = [{ role: 'assistant', content: response.script }];
      if (response.explanation) {
        newMessages.push({ role: 'system', content: response.explanation });
      }
      setMessages(prev => [...prev, ...newMessages]);
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        setMessages(prev => [...prev, { 
          role: 'system', 
          content: `❌ 错误: ${error.response?.data?.detail || error.message}` 
        }]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text }}>
      
      {/* 顶部导航栏 */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 24px', height: '64px', backgroundColor: COLORS.panel,
        borderBottom: `1px solid ${COLORS.border}`, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS.primary }}></div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>AFSIM AI <span style={{ fontWeight: 300, opacity: 0.7 }}>Script Assistant</span></h1>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={provider}
            onChange={(e) => {
              const newProvider = e.target.value as 'deepseek' | 'ollama';
              setProvider(newProvider);
              setSettings(prev => ({ ...prev, provider: newProvider }));
            }}
            style={{
              padding: '6px 12px', borderRadius: '6px', backgroundColor: COLORS.accent,
              color: '#fff', border: 'none', outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="deepseek">DeepSeek (Cloud)</option>
            {settings.ollama_enabled && <option value="ollama">Ollama (Local)</option>}
          </select>
          <button 
            onClick={() => setShowSettings(true)}
            style={{ padding: '6px 16px', borderRadius: '6px', border: `1px solid ${COLORS.accent}`, background: 'transparent', color: '#fff', cursor: 'pointer' }}
          >
            ⚙️ 设置
          </button>
        </div>
      </header>

      {/* 聊天主体 */}
      <main 
        ref={chatContainerRef}
        style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '15vh', opacity: 0.5 }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
              <h2>准备好编写 AFSIM 脚本了吗？</h2>
              <p>可以尝试：“创建一个带有 4 个传感器的侦察平台”</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
              <ChatMessage role={msg.role} content={msg.content} />
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', color: COLORS.primary }}>
              <span className="dot-pulse"></span>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>AI 正在思考并编写脚本...</span>
            </div>
          )}
        </div>
      </main>

      {/* 输入区 */}
      <footer style={{ padding: '24px', backgroundColor: COLORS.bg }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'flex', gap: '12px', padding: '12px', 
            backgroundColor: COLORS.panel, borderRadius: '12px',
            border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入任务描述，按 Enter 发送..."
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', color: '#fff',
                resize: 'none', outline: 'none', fontSize: '15px', lineHeight: '1.5',
                padding: '8px 4px'
              }}
            />
            <button
              onClick={loading ? handleStop : handleSend}
              style={{
                alignSelf: 'flex-end', width: '40px', height: '40px', borderRadius: '8px',
                backgroundColor: loading ? COLORS.danger : COLORS.primary,
                color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? '■' : '▲'}
            </button>
          </div>
          <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px', color: COLORS.accent }}>
            支持 Shift + Enter 换行
          </p>
        </div>
      </footer>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={async (s) => {
          if (s.deepseek_api_key) localStorage.setItem('deepseek_api_key', s.deepseek_api_key);
          try {
            await chatApi.updateSettings(s);
            setSettings(s);
          } catch (err: any) {
            console.error('保存失败:', err);
            throw err;
          }
        }}
        onTestConnection={async (p) => {
          return await chatApi.healthCheck(p);
        }}
      />

      <style>{`
        .dot-pulse {
          width: 8px; height: 8px; border-radius: 50%;
          background-color: ${COLORS.primary};
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.accent}; border-radius: 10px; }
      `}</style>
    </div>
  );
};