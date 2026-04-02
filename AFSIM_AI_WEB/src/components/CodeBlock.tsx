import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'afsim' }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      borderRadius: '8px',
      overflow: 'hidden',
      marginTop: '8px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #3d3d3d'
      }}>
        <span style={{ color: '#888', fontSize: '12px' }}>{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px 8px'
          }}
        >
          复制
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '16px',
        overflow: 'auto',
        fontSize: '13px',
        lineHeight: '1.5',
        color: '#d4d4d4'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};
