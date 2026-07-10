'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { ResultCard } from '@/components/AI/ResultCard';
import { useState } from 'react';
import { Bell, Loader2, Globe } from 'lucide-react';

const TONES = [
  { value: '친근한', label: '😊 친근한' },
  { value: '공식적', label: '🏫 공식적' },
  { value: '따뜻한', label: '💛 따뜻한' },
];

const GRADES = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년', '전학년'];

const LANGUAGES = [
  { value: 'ko', label: '🇰🇷 한국어' },
  { value: 'en', label: '🇺🇸 영어' },
  { value: 'zh', label: '🇨🇳 중국어' },
  { value: 'vi', label: '🇻🇳 베트남어' },
];

export default function NoticePage() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('친근한');
  const [grade, setGrade] = useState('전학년');
  const [date, setDate] = useState('');
  const [language, setLanguage] = useState('ko');
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setResult('');
    setIsStreaming(true);
    try {
      const res = await fetch('/api/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, grade, date, language }),
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
    <PageContainer title="가정통신문 생성">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-border shadow-card p-5 space-y-4">
            <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              가정통신문 정보
            </h2>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">어투 선택</label>
              <div className="flex gap-2">
                {TONES.map(t => (
                  <button key={t.value} onClick={() => setTone(t.value)}
                    className={`flex-1 text-xs py-2 rounded-lg border font-medium transition-colors ${
                      tone === t.value ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">대상 학년</label>
              <div className="flex flex-wrap gap-1.5">
                {GRADES.map(g => (
                  <button key={g} onClick={() => setGrade(g)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                      grade === g ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">관련 날짜 (선택)</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">내용 <span className="text-danger">*</span></label>
              <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={5}
                placeholder="예: 5월 15일 운동회 개최. 학부모 관람 가능. 弁당 도시락 지참 요망."
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                번역 (다문화 학부모용)
              </label>
              <div className="flex gap-2">
                {LANGUAGES.map(l => (
                  <button key={l.value} onClick={() => setLanguage(l.value)}
                    className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
                      language === l.value ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                    }`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={!topic.trim() || isStreaming}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
              {isStreaming ? <><Loader2 className="w-4 h-4 animate-spin" /> 작성 중...</> : <><Bell className="w-4 h-4" /> 가정통신문 생성</>}
            </button>
          </div>
        </div>

        <div>
          <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
            📄 실제 가정통신문 레이아웃(A4)으로 미리보기됩니다
          </div>
          <ResultCard content={result} isStreaming={isStreaming} title="가정통신문 초안" onSave={() => {}} />
        </div>
      </div>
    </PageContainer>
  );
}
