import React, { useState, useEffect } from 'react';
import { knowledgeApi } from '../services/api';

interface KnowledgeFile {
  name: string;
  path: string;
  size: number;
}

interface KnowledgeBasePageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const result = await knowledgeApi.getFiles();
      setFiles(result.files || []);
    } catch (error) {
      console.error('加载知识库文件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (filename: string) => {
    setLoadingContent(true);
    try {
      const result = await knowledgeApi.getFileContent(filename);
      setFileContent(result.content);
      setSelectedFile(filename);
    } catch (error) {
      console.error('加载文件内容失败:', error);
      setFileContent('加载失败');
    } finally {
      setLoadingContent(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1f2937', borderRadius: '16px', padding: '24px',
        width: '95%', maxWidth: '1000px', height: '85vh',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', border: '1px solid #374151',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>📚 本地知识库</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>AFSIM 相关知识和最佳实践</p>
          </div>
          <button onClick={onClose} style={{
            background: '#374151', border: 'none', color: '#fff', width: '32px', height: '32px',
            borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
          {/* File List */}
          <div style={{
            width: '250px',
            backgroundColor: '#111827',
            borderRadius: '12px',
            padding: '12px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>加载中...</div>
            ) : files.length === 0 ? (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px', fontSize: '13px' }}>
                暂无知识库文件
              </div>
            ) : (
              files.map(file => (
                <div
                  key={file.name}
                  onClick={() => loadFileContent(file.name)}
                  style={{
                    padding: '10px 12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedFile === file.name ? '#3b82f620' : 'transparent',
                    border: `1px solid ${selectedFile === file.name ? '#3b82f6' : 'transparent'}`,
                    color: selectedFile === file.name ? '#fff' : '#d1d5db',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{file.name.replace('.md', '')}</div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              ))
            )}
          </div>

          {/* File Content */}
          <div style={{
            flex: 1,
            backgroundColor: '#111827',
            borderRadius: '12px',
            padding: '20px',
            overflowY: 'auto'
          }}>
            {loadingContent ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>加载中...</div>
            ) : selectedFile ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #374151' }}>
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <h3 style={{ color: '#fff', margin: 0 }}>{selectedFile.replace('.md', '')}</h3>
                </div>
                <pre style={{
                  color: '#e5e7eb',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  margin: 0
                }}>
                  {fileContent}
                </pre>
              </>
            ) : (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
                <div>选择一个文件查看内容</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
