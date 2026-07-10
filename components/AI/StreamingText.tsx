'use client';

import { Loader2 } from 'lucide-react';

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({ content, isStreaming, className = '' }: StreamingTextProps) {
  if (!content && !isStreaming) return null;

  return (
    <div className={`relative ${className}`}>
      {isStreaming && !content && (
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>AI가 작성 중입니다...</span>
        </div>
      )}
      <div
        className={`whitespace-pre-wrap text-sm text-text-primary leading-relaxed ${isStreaming && content ? 'ai-cursor' : ''}`}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
      />
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2 text-text-primary">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2 text-text-primary">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-5 mb-3 text-primary">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^\| (.+) \|$/gm, '<div class="table-row">$1</div>')
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-primary mt-0.5">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="my-0.5">$&</div>')
    .replace(/\n\n/g, '<div class="my-3"></div>')
    .replace(/\[확인 필요\]/g, '<span class="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded border border-yellow-300">[확인 필요]</span>');
}
