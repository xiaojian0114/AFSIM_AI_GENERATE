import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
        backgroundColor: isUser ? '#3b82f6' : isSystem ? '#10b981' : '#1f2937',
        color: '#fff',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
          {isUser ? '你' : isSystem ? '系统' : 'AI'}
        </div>
        {content}
      </div>
    </div>
  );
};
