import React from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    deepseek_api_key: string;
    deepseek_api_base: string;
    deepseek_model: string;
    ollama_enabled: boolean;
    ollama_base_url: string;
    ollama_model: string;
  };
  onSave: (settings: any) => void;
  onTestConnection: (provider: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onTestConnection
}) => {
  const [formData, setFormData] = React.useState(settings);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', margin: 0 }}>设置</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '24px'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <h3 style={{ color: '#10b981', marginBottom: '12px' }}>DeepSeek API</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>API Key</label>
            <input
              type="password"
              value={formData.deepseek_api_key}
              onChange={(e) => setFormData({...formData, deepseek_api_key: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#fff'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>API Base</label>
            <input
              type="text"
              value={formData.deepseek_api_base}
              onChange={(e) => setFormData({...formData, deepseek_api_base: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#fff'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>Model</label>
            <input
              type="text"
              value={formData.deepseek_model}
              onChange={(e) => setFormData({...formData, deepseek_model: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#fff'
              }}
            />
          </div>

          <h3 style={{ color: '#10b981', marginBottom: '12px' }}>本地 Ollama (可选)</h3>

          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="ollama_enabled"
              checked={formData.ollama_enabled}
              onChange={(e) => setFormData({...formData, ollama_enabled: e.target.checked})}
            />
            <label htmlFor="ollama_enabled" style={{ color: '#ccc', marginLeft: '8px' }}>启用本地 Ollama</label>
          </div>

          {formData.ollama_enabled && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>Ollama URL</label>
                <input
                  type="text"
                  value={formData.ollama_base_url}
                  onChange={(e) => setFormData({...formData, ollama_base_url: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>Model</label>
                <input
                  type="text"
                  value={formData.ollama_model}
                  onChange={(e) => setFormData({...formData, ollama_model: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              保存设置
            </button>
            <button
              type="button"
              onClick={() => onTestConnection('deepseek')}
              style={{
                padding: '10px 16px',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              测试 DeepSeek
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
