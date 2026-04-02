import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === 'user';
  const isSystem = role === 'system';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px'
    }}>
      <div style={{
        maxWidth: isUser ? '75%' : '85%',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: isUser ? '#3b82f6' : isSystem ? '#374151' : '#1f2937',
        color: '#fff',
        fontSize: '14px',
        lineHeight: '1.5',
        position: 'relative'
      }}>
        {!isUser && (
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: copied ? '#22c55e' : '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {copied ? '已复制' : '复制'}
          </button>
        )}
        {isUser ? (
          content
        ) : isSystem ? (
          <div style={{ color: '#fbbf24' }}>{content}</div>
        ) : (
          <ReactMarkdown
            components={{
              code(props) {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || '');
                const isCodeBlock = match;

                return isCodeBlock ? (
                  <SyntaxHighlighter
                    {...rest}
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code {...rest} className={className} style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};
