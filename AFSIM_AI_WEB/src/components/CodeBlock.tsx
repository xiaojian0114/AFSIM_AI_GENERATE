import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'cpp' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒后重置状态
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  // AFSIM 脚本通常类似 C++/Java 结构，如果没有专门的 afsim 高亮，建议默认用 cpp 或 clike
  const displayLanguage = language.toLowerCase() === 'afsim' ? 'cpp' : language;

  return (
    <div style={{
      margin: '16px 0',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid #374151',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      {/* 代码块头部 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#2d333b', // 稍浅的灰色区分主体
        borderBottom: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }}></span>
          </div>
          <span style={{ 
            color: '#9ca3af', 
            fontSize: '11px', 
            fontWeight: 600, 
            letterSpacing: '0.05em',
            marginLeft: '8px' 
          }}>
            {language.toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#065f46' : '#374151',
            border: 'none',
            color: copied ? '#34d399' : '#d1d5db',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {copied ? '✓ 已复制' : '复制代码'}
        </button>
      </div>

      {/* 代码主体 */}
      <div style={{ position: 'relative' }}>
        <SyntaxHighlighter
          language={displayLanguage}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '13.5px',
            lineHeight: '1.6',
            backgroundColor: '#111827', // 与 HomePage 背景呼应
            fontFamily: '"Fira Code", "JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
          }}
          // 显示行号增强专业感
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: '2em', paddingRight: '1em', color: '#4b5563', textAlign: 'right' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      <style>{`
        /* 美化代码块滚动条 */
        pre::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        pre::-webkit-scrollbar-track {
          background: #111827;
        }
        pre::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        pre::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
};