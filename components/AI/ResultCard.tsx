'use client';

import { Copy, Download, Check, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { StreamingText } from './StreamingText';

interface ResultCardProps {
  content: string;
  isStreaming: boolean;
  title?: string;
  onSave?: () => void;
  showDownload?: boolean;
}

export function ResultCard({ content, isStreaming, title, onSave, showDownload = true }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title ?? '문서'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
        <span className="text-sm font-medium text-text-primary">{title ?? 'AI 생성 결과'}</span>
        {content && !isStreaming && (
          <div className="flex items-center gap-1.5">
            {showDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                다운로드
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사됨' : '복사'}
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  saved ? 'bg-primary text-white' : 'text-text-secondary hover:text-primary hover:bg-primary-light'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {saved ? '저장됨' : '저장'}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="p-5 min-h-32">
        {!content && isStreaming && (
          <div className="space-y-3">
            <div className="skeleton h-4 rounded w-3/4" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-5/6" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-2/3" />
          </div>
        )}
        <StreamingText content={content} isStreaming={isStreaming} />
        {!content && !isStreaming && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-sm text-text-secondary">AI가 문서를 생성하면 여기에 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
