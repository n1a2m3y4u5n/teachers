'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { ResultCard } from '@/components/AI/ResultCard';
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const PURPOSES = ['학습 성과 공유', '칭찬 메시지', '행사 안내', '상담 안내', '학교생활 업데이트'];

export default function OutboundPage() {
  const [purpose, setPurpose] = useState('칭찬 메시지');
  const [studentName, setStudentName] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  async function handleGenerate() {
    if (!content.trim()) return;
    setResult('');
    setIsStreaming(true);

    const userPrompt = `역방향 소통 메시지\n목적: ${purpose}\n학생: ${studentName || '(학생명 미입력)'}\n내용: ${content}\n\n위 내용을 바탕으로 학부모에게 보내는 따뜻하고 긍정적인 메시지를 작성해 주세요.`;

    try {
      const res = await fetch('/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: '역방향 메시지', content: userPrompt, title: `${purpose} — ${studentName}` }),
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
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <PageContainer title="역방향 채널 — 교사가 먼저 소통하기">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <strong>역방향 소통</strong>이란 학부모의 민원을 기다리지 않고, 교사가 먼저 좋은 소식을 전달하는 방식입니다.
            긍정적 관계 형성으로 민원 발생을 사전에 예방합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border shadow-card p-5 space-y-4">
            <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              메시지 작성
            </h2>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">메시지 목적</label>
              <div className="flex flex-wrap gap-1.5">
                {PURPOSES.map(p => (
                  <button key={p} onClick={() => setPurpose(p)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                      purpose === p ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">학생 이름 (선택)</label>
              <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
                placeholder="예: 김민준"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">전달할 내용 *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
                placeholder="예: 이번 주 모둠 발표에서 리더십을 발휘하여 친구들을 이끌었습니다. 발표 준비도 꼼꼼하게 해왔습니다."
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <button onClick={handleGenerate} disabled={!content.trim() || isStreaming}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
              {isStreaming ? <><Loader2 className="w-4 h-4 animate-spin" /> 메시지 작성 중...</> : <><Send className="w-4 h-4" /> 메시지 생성</>}
            </button>
          </div>

          <ResultCard content={result} isStreaming={isStreaming} title="학부모 전달 메시지" onSave={() => {}} />
        </div>
      </div>
    </PageContainer>
  );
}
