import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage, SettingsPanel } from '../components';
import { chatApi, conversationApi, authApi } from '../services';
import type { Message, Settings, User, Conversation, ConversationDetail } from '../types';

const COLORS = {
  bg: '#111827',
  panel: '#1f2937',
  border: '#374151',
  text: '#f3f4f6',
  primary: '#3b82f6',
  danger: '#ef4444',
  accent: '#4b5563',
  hover: '#293548'
};

interface HomePageProps {
  user: User;
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<'deepseek' | 'ollama'>('deepseek');
  const [settings, setSettings] = useState<Settings>({
    provider: 'deepseek',
    deepseek_api_base: 'https://api.deepseek.com',
    deepseek_model: 'deepseek-chat',
    ollama_enabled: false,
    ollama_base_url: 'http://localhost:11434',
    ollama_model: 'llama3'
  });

  // 对话相关状态
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  // 加载对话列表
  const loadConversations = async () => {
    try {
      const list = await conversationApi.list();
      setConversations(list);
    } catch (err) {
      console.error('加载对话列表失败:', err);
    }
  };

  // 加载对话详情
  const loadConversation = async (conv: Conversation) => {
    try {
      const detail = await conversationApi.get(conv.id);
      setMessages(detail.messages.map(m => ({
        id: m.id,
        conversation_id: m.conversation_id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        created_at: m.created_at
      })));
      setCurrentConversation(detail);
      setProvider((detail.provider || 'deepseek') as 'deepseek' | 'ollama');
    } catch (err) {
      console.error('加载对话失败:', err);
    }
  };

  // 初始化
  useEffect(() => {
    loadConversations();
    const init = async () => {
      try {
        const data = await chatApi.getSettings();
        setSettings(data);
        setProvider(data.provider as 'deepseek' | 'ollama');
      } catch (err) {
        console.error('Settings load failed', err);
      }
    };
    init();
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 输入框高度自适应
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // 创建新对话
  const handleNewChat = async () => {
    try {
      const conv = await conversationApi.create('新对话', provider);
      setConversations(prev => [conv, ...prev]);
      setCurrentConversation(conv);
      setMessages([]);
    } catch (err) {
      console.error('创建对话失败:', err);
    }
  };

  // 保存消息到服务器
  const saveMessage = async (role: string, content: string) => {
    if (!currentConversation) return;
    try {
      await conversationApi.addMessage(currentConversation.id, role, content);
    } catch (err) {
      console.error('保存消息失败:', err);
    }
  };

  // 更新对话标题
  const handleUpdateTitle = async () => {
    if (!currentConversation || !newTitle.trim()) return;
    try {
      const updated = await conversationApi.update(currentConversation.id, newTitle);
      setCurrentConversation(updated);
      setConversations(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingTitle(false);
    } catch (err) {
      console.error('更新标题失败:', err);
    }
  };

  // 删除对话
  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除这个对话吗？')) return;
    try {
      await conversationApi.delete(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('删除对话失败:', err);
    }
  };

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // 如果没有当前对话，先创建一个
    let conv = currentConversation;
    if (!conv) {
      try {
        conv = await conversationApi.create('新对话', provider);
        setConversations(prev => [conv, ...prev]);
        setCurrentConversation(conv);
      } catch (err) {
        console.error('创建对话失败:', err);
        return;
      }
    }

    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
    await saveMessage('user', currentInput);
    setLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await chatApi.generate({
        description: currentInput,
        mode: 'generate',
        provider
      });

      const newMessages: Message[] = [{ role: 'assistant', content: response.script }];
      if (response.explanation) {
        newMessages.push({ role: 'system', content: response.explanation });
      }
      setMessages(prev => [...prev, ...newMessages]);
      
      // 保存 AI 回复
      for (const msg of newMessages) {
        await saveMessage(msg.role, msg.content);
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        const errorMsg = `❌ 错误: ${error.response?.data?.detail || error.message}`;
        setMessages(prev => [...prev, { role: 'system', content: errorMsg }]);
        await saveMessage('system', errorMsg);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.text }}>
      
      {/* 顶部导航栏 */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 24px', height: '64px', backgroundColor: COLORS.panel,
        borderBottom: `1px solid ${COLORS.border}`, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              padding: '8px 12px', borderRadius: '6px', border: `1px solid ${COLORS.accent}`,
              background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '18px'
            }}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS.primary }}></div>
            <h1 style={{ fontSize: '18px', fontWeight: 600 }}>AFSIM AI</h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'deepseek' | 'ollama')}
            style={{
              padding: '6px 12px', borderRadius: '6px', backgroundColor: COLORS.accent,
              color: '#fff', border: 'none', outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="deepseek">DeepSeek</option>
            {settings.ollama_enabled && <option value="ollama">Ollama</option>}
          </select>
          <button 
            onClick={() => setShowSettings(true)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${COLORS.accent}`, background: 'transparent', color: '#fff', cursor: 'pointer' }}
          >
            ⚙️
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: COLORS.accent, borderRadius: '6px' }}>
            <span style={{ fontSize: '14px' }}>{user.username}</span>
            <button onClick={handleLogout} style={{ 
              background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' 
            }}>退出</button>
          </div>
        </div>
      </header>

      {/* 主体区域 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* 侧边栏 - 对话列表 */}
        <aside style={{
          width: showSidebar ? '280px' : '0',
          backgroundColor: COLORS.panel,
          borderRight: showSidebar ? `1px solid ${COLORS.border}` : 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px' }}>
            <button
              onClick={handleNewChat}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                backgroundColor: COLORS.primary, color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: '14px', fontWeight: 500
              }}
            >
              + 新建对话
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: currentConversation?.id === conv.id ? COLORS.hover : 'transparent',
                  borderLeft: currentConversation?.id === conv.id ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (currentConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = COLORS.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.title}
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.accent }}>
                      {formatTime(conv.updated_at)} · {conv.messages_count} 条消息
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    style={{
                      background: 'transparent', border: 'none', color: COLORS.accent,
                      cursor: 'pointer', padding: '4px', fontSize: '12px', opacity: 0.6
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: COLORS.accent, fontSize: '14px' }}>
                暂无对话记录
              </div>
            )}
          </div>
        </aside>

        {/* 聊天区域 */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* 对话标题栏 */}
          {currentConversation && (
            <div style={{
              padding: '12px 24px',
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {editingTitle ? (
                <>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                    autoFocus
                    style={{
                      flex: 1, padding: '6px 12px', backgroundColor: COLORS.accent,
                      border: '1px solid', borderColor: COLORS.primary, borderRadius: '6px',
                      color: '#fff', outline: 'none', fontSize: '14px'
                    }}
                  />
                  <button onClick={handleUpdateTitle} style={{ padding: '6px 12px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>保存</button>
                  <button onClick={() => setEditingTitle(false)} style={{ padding: '6px 12px', backgroundColor: COLORS.accent, border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>取消</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: '16px', fontWeight: 500 }}>{currentConversation.title}</span>
                  <button
                    onClick={() => { setNewTitle(currentConversation.title); setEditingTitle(true); }}
                    style={{ padding: '4px 8px', backgroundColor: 'transparent', border: `1px solid ${COLORS.accent}`, borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✏️ 重命名
                  </button>
                </>
              )}
            </div>
          )}

          {/* 消息列表 */}
          <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '15vh', opacity: 0.5 }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
                  <h2>准备好编写 AFSIM 脚本了吗？</h2>
                  <p>选择或创建对话开始</p>
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
                  <span style={{ fontSize: '14px', opacity: 0.8 }}>AI 正在思考...</span>
                </div>
              )}
            </div>
          </div>

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
        </main>
      </div>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={async (s) => {
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
