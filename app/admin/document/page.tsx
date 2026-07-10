'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { ResultCard } from '@/components/AI/ResultCard';
import { useState, useEffect } from 'react';
import { Loader2, FileText, Clock, RefreshCw } from 'lucide-react';

const DOC_TYPES = [
  { value: '협조 요청', label: '📤 협조 요청' },
  { value: '학부모 안내', label: '👨‍👩‍👧 학부모 안내' },
  { value: '결과 보고', label: '📊 결과 보고' },
  { value: '행사 안내', label: '🎉 행사 안내' },
  { value: '기타', label: '📄 기타' },
];

interface DocRecord {
  id: number;
  type: string;
  title: string;
  input_summary: string;
  content: string;
  created_at: string;
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DocumentPage() {
  const [docType, setDocType] = useState('협조 요청');
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<DocRecord[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<DocRecord | null>(null);

  useEffect(() => {
    fetch('/api/document').then(r => r.json()).then(setHistory).catch(() => {});
  }, []);

  async function handleGenerate() {
    if (!content.trim()) return;
    setResult('');
    setIsStreaming(true);
    setProgress(0);
    setSelectedHistory(null);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 8, 90));
    }, 300);

    try {
      const res = await fetch('/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: docType, content, recipient, title }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
        setResult(text);
      }

      setProgress(100);
      // 이력 새로고침
      setTimeout(() => {
        fetch('/api/document').then(r => r.json()).then(setHistory).catch(() => {});
      }, 1000);
    } finally {
      clearInterval(progressInterval);
      setIsStreaming(false);
    }
  }

  const displayContent = selectedHistory ? selectedHistory.content : result;
  const displayStreaming = selectedHistory ? false : isStreaming;

  return (
    <PageContainer title="공문 초안 생성">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 좌측 — 입력 */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-border shadow-card p-5 space-y-4">
              <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                공문 정보 입력
              </h2>

              {/* 공문 종류 */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">공문 종류</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DOC_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setDocType(type.value)}
                      className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors text-left ${
                        docType === type.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">공문 제목 (선택)</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 5월 학예회 안내"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* 수신처 */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">수신처 (선택)</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="예: 서울시교육청 교육국장"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* 핵심 내용 */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  핵심 내용 <span className="text-danger">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={5}
                  placeholder="예: 5월 15일 오후 2시 학예회 개최. 학부모 관람 가능. 학교 강당에서 진행. 학생별 2매 초대권 배부 예정."
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <p className="text-xs text-text-muted mt-1">날짜·금액 미입력 시 AI가 자동으로 [확인 필요] 표시합니다</p>
              </div>

              {/* 생성 버튼 */}
              <button
                onClick={handleGenerate}
                disabled={!content.trim() || isStreaming}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI가 공문을 작성 중입니다...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    30초 생성하기
                  </>
                )}
              </button>

              {/* 프로그레스 바 */}
              {isStreaming && (
                <div>
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>교육부 공문 규정 적용 중...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 이전 공문 이력 */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">이전 공문 이력</span>
                </div>
                <div className="divide-y divide-border">
                  {history.map(doc => (
                    <div
                      key={doc.id}
                      className={`px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedHistory?.id === doc.id ? 'bg-primary-light' : ''}`}
                      onClick={() => setSelectedHistory(doc)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-text-primary truncate">{doc.title ?? doc.input_summary ?? '(제목 없음)'}</div>
                          <div className="text-xs text-text-muted mt-0.5">{doc.type} · {formatDate(doc.created_at)}</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedHistory(doc); }}
                          className="text-xs text-primary hover:underline flex-shrink-0"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 우측 — 결과 */}
          <div>
            <ResultCard
              content={displayContent}
              isStreaming={displayStreaming}
              title={selectedHistory ? `이전 공문 — ${selectedHistory.title ?? ''}` : '공문 초안'}
              onSave={() => {}}
            />

            {/* AI 제안 칩 */}
            {result && !isStreaming && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-text-muted mr-1">AI 제안:</span>
                {['격식체로 수정', '간결하게 줄이기', '수신 기관 추가'].map(chip => (
                  <button
                    key={chip}
                    className="text-xs px-2.5 py-1 bg-primary-light text-primary rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
