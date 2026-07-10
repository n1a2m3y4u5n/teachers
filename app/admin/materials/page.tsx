'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { useState } from 'react';
import { Search, Loader2, ExternalLink, BookOpen } from 'lucide-react';

interface Material {
  title: string;
  source: string;
  type: string;
  description: string;
  url: string | null;
  license: string;
  usage: string;
}

const TYPE_COLORS: Record<string, string> = {
  영상: 'bg-red-100 text-red-700',
  문서: 'bg-blue-100 text-blue-700',
  활동지: 'bg-green-100 text-green-700',
  PPT: 'bg-orange-100 text-orange-700',
  앱: 'bg-purple-100 text-purple-700',
};

export default function MaterialsPage() {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('3');
  const [unit, setUnit] = useState('');
  const [purpose, setPurpose] = useState('수업 보조');
  const [results, setResults] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!subject || !unit) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, unit, purpose }),
      });
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="교육자료 큐레이션">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border border-border shadow-card p-5">
          <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-primary" />
            자료 검색 조건
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">교과 *</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="예: 수학"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">학년</label>
              <select value={grade} onChange={e => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                {['1','2','3','4','5','6'].map(g => <option key={g} value={g}>{g}학년</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-2">단원명 *</label>
              <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="예: 분수의 덧셈"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-text-secondary mb-2">활용 목적</label>
            <div className="flex flex-wrap gap-2">
              {['수업 보조', '도입 자료', '예습·복습', '가정학습', '과제'].map(p => (
                <button key={p} onClick={() => setPurpose(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    purpose === p ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSearch} disabled={!subject || !unit || loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 검색 중...</> : <><Search className="w-4 h-4" /> 교육자료 찾기</>}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary font-medium">{results.length}개 자료 발견</p>
            {results.map((m, i) => (
              <div key={i} className="bg-white rounded-xl border border-border shadow-card p-4 hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[m.type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {m.type}
                      </span>
                      <span className="text-xs text-text-muted">{m.source}</span>
                      <span className="text-xs text-text-muted">· {m.license}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1">{m.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed mb-2">{m.description}</p>
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-primary">
                      <strong>활용 방법:</strong> {m.usage}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {m.url ? (
                      <a href={m.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        바로가기
                      </a>
                    ) : (
                      <button className="flex items-center gap-1.5 text-xs border border-border text-text-secondary px-3 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors">
                        <BookOpen className="w-3.5 h-3.5" />
                        자료 검색
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="bg-white rounded-xl border border-border shadow-card py-16 text-center">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-text-muted">교과와 단원을 입력하면 AI가 최적 자료를 추천합니다</p>
            <p className="text-xs text-text-muted mt-1">에듀넷, EBS, KERIS 등 공공누리 자료 우선 추천</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
