import React, { useState, useEffect } from 'react';

interface Settings {
  provider: 'deepseek' | 'ollama';
  deepseek_api_key: string;
  deepseek_api_base: string;
  deepseek_model: string;
  ollama_enabled: boolean;
  ollama_base_url: string;
  ollama_model: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => Promise<void>;
  onTestConnection: (provider: string) => Promise<{ status: string }>;
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
      {label}
    </label>
    {children}
  </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
      ...props.style,
    }}
    onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
    onBlur={(e) => (e.currentTarget.style.borderColor = '#4b5563')}
  />
);

const ProviderSelector: React.FC<{
  value: 'deepseek' | 'ollama';
  onChange: (v: 'deepseek' | 'ollama') => void;
  ollamaEnabled: boolean;
}> = ({ value, onChange, ollamaEnabled }) => {
  const options = [
    { id: 'deepseek', label: 'DeepSeek 云端', icon: '☁️', color: '#3b82f6' },
    { id: 'ollama', label: 'Ollama 本地', icon: '💻', color: '#10b981', disabled: !ollamaEnabled }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '24px'
    }}>
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          disabled={opt.disabled}
          onClick={() => !opt.disabled && onChange(opt.id as 'deepseek' | 'ollama')}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '12px',
            border: `2px solid ${value === opt.id ? opt.color : '#374151'}`,
            backgroundColor: value === opt.id ? `${opt.color}15` : '#111827',
            color: opt.disabled ? '#6b7280' : '#fff',
            cursor: opt.disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontSize: '24px' }}>{opt.icon}</span>
          <span style={{ fontWeight: 500 }}>{opt.label}</span>
          {opt.disabled && <span style={{ fontSize: '11px', color: '#6b7280' }}>未启用</span>}
        </button>
      ))}
    </div>
  );
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onTestConnection
}) => {
  const [formData, setFormData] = useState<Settings>({
    provider: 'deepseek',
    deepseek_api_key: '',
    deepseek_api_base: '',
    deepseek_model: '',
    ollama_enabled: false,
    ollama_base_url: 'http://localhost:11434',
    ollama_model: 'llama3',
    ...settings
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      provider: settings.provider || prev.provider,
      deepseek_api_key: settings.deepseek_api_key || prev.deepseek_api_key,
      deepseek_api_base: settings.deepseek_api_base || prev.deepseek_api_base,
      deepseek_model: settings.deepseek_model || prev.deepseek_model,
      ollama_enabled: settings.ollama_enabled ?? prev.ollama_enabled,
      ollama_base_url: settings.ollama_base_url || prev.ollama_base_url,
      ollama_model: settings.ollama_model || prev.ollama_model,
    }));
  }, [settings]);

  if (!isOpen) return null;

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      showStatus('success', '设置已成功保存');
      setTimeout(onClose, 1200);
    } catch (error: any) {
      showStatus('error', error.message || '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (provider: string) => {
    setTesting(provider);
    try {
      const result = await onTestConnection(provider);
      const status = result?.status || result;
      const isSuccess = status === 'connected' || status === 'success';
      showStatus(isSuccess ? 'success' : 'error',
        isSuccess ? `${provider === 'deepseek' ? 'DeepSeek' : 'Ollama'} 连接正常` : `${provider === 'deepseek' ? 'DeepSeek' : 'Ollama'} 连接失败`
      );
    } catch (error: any) {
      showStatus('error', '连接测试失败');
    } finally {
      setTesting(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1f2937', borderRadius: '16px', padding: '28px',
        width: '95%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', border: '1px solid #374151'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>应用设置</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>选择并配置您的 AI 模型提供商</p>
          </div>
          <button onClick={onClose} style={{
            background: '#374151', border: 'none', color: '#fff', width: '32px', height: '32px',
            borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div style={{
            padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px',
            backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${statusMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
            textAlign: 'center', animation: 'fadeIn 0.3s ease'
          }}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Ollama Enable Toggle (Always visible) */}
          <div style={{ 
            backgroundColor: '#111827', 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '16px',
            border: '1px dashed #374151'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>💻</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 500 }}>启用本地 Ollama 模型</div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>使用 Ollama 运行本地大语言模型</div>
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={formData.ollama_enabled}
                  onChange={(e) => {
                    const newEnabled = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      ollama_enabled: newEnabled,
                      provider: newEnabled ? prev.provider : 'deepseek'
                    }));
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: formData.ollama_enabled ? '#10b981' : '#374151',
                  transition: '0.3s', borderRadius: '26px'
                }}>
                  <span style={{
                    position: 'absolute', content: '', height: '20px', width: '20px',
                    left: formData.ollama_enabled ? '26px' : '3px', bottom: '3px',
                    backgroundColor: '#fff', transition: '0.3s', borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>
          </div>

          {/* Provider Selector */}
          <ProviderSelector
            value={formData.provider}
            onChange={(v) => setFormData(prev => ({ ...prev, provider: v }))}
            ollamaEnabled={formData.ollama_enabled}
          />

          {/* DeepSeek Settings */}
          {formData.provider === 'deepseek' && (
            <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#3b82f6', margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>☁️</span> DeepSeek 云端服务
                </h3>
                <button
                  type="button"
                  disabled={!!testing}
                  onClick={() => handleTest('deepseek')}
                  style={{
                    fontSize: '12px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                    backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6',
                  }}
                >
                  {testing === 'deepseek' ? '测试中...' : '测试连接'}
                </button>
              </div>
              
              <FormField label="API Key">
                <StyledInput
                  type="password"
                  value={formData.deepseek_api_key}
                  onChange={(e) => setFormData({...formData, deepseek_api_key: e.target.value})}
                  placeholder="sk-xxxxxxxxxxxx"
                />
              </FormField>

              <FormField label="API Base URL">
                <StyledInput
                  type="text"
                  value={formData.deepseek_api_base}
                  onChange={(e) => setFormData({...formData, deepseek_api_base: e.target.value})}
                  placeholder="https://api.deepseek.com"
                />
              </FormField>

              <FormField label="模型名称">
                <StyledInput
                  type="text"
                  value={formData.deepseek_model}
                  onChange={(e) => setFormData({...formData, deepseek_model: e.target.value})}
                  placeholder="deepseek-chat"
                />
              </FormField>
            </div>
          )}

          {/* Ollama Settings */}
          {formData.provider === 'ollama' && formData.ollama_enabled && (
            <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#10b981', margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💻</span> Ollama 本地服务
                </h3>
                <button
                  type="button"
                  disabled={!!testing}
                  onClick={() => handleTest('ollama')}
                  style={{
                    fontSize: '12px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                    backgroundColor: 'transparent', border: '1px solid #10b981', color: '#10b981',
                  }}
                >
                  {testing === 'ollama' ? '测试中...' : '测试连接'}
                </button>
              </div>

              <FormField label="Ollama 服务地址">
                <StyledInput
                  type="text"
                  value={formData.ollama_base_url}
                  onChange={(e) => setFormData({...formData, ollama_base_url: e.target.value})}
                  placeholder="http://localhost:11434"
                />
              </FormField>

              <FormField label="本地模型名称">
                <StyledInput
                  type="text"
                  value={formData.ollama_model}
                  onChange={(e) => setFormData({...formData, ollama_model: e.target.value})}
                  placeholder="llama3"
                />
              </FormField>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #4b5563',
                backgroundColor: 'transparent', color: '#fff', cursor: 'pointer'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2, padding: '12px', borderRadius: '8px', border: 'none',
                backgroundColor: saving ? '#4b5563' : '#3b82f6',
                color: '#fff', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {saving ? '正在保存...' : '应用并保存'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
