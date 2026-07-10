'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { ResultCard } from '@/components/AI/ResultCard';
import { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

const SCHOOL_LEVELS = ['초등', '중등', '고등'];
const SUBJECTS_MAP: Record<string, string[]> = {
  초등: ['국어', '수학', '사회', '과학', '도덕', '체육', '음악', '미술', '영어'],
  중등: ['국어', '수학', '사회', '역사', '과학', '기술·가정', '정보', '체육', '음악', '미술', '영어'],
  고등: ['국어', '수학', '사회', '역사', '과학', '정보', '체육', '음악', '미술', '영어', '한국사'],
};
const TEACHING_STYLES = ['강의형', '토론형', '실험형', '프로젝트형', '플립러닝'];

export default function LessonPage() {
  const [schoolLevel, setSchoolLevel] = useState('초등');
  const [grade, setGrade] = useState('3');
  const [subject, setSubject] = useState('');
  const [unit, setUnit] = useState('');
  const [session, setSession] = useState('1');
  const [teachingStyle, setTeachingStyle] = useState('강의형');
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const subjects = SUBJECTS_MAP[schoolLevel];
  const grades = schoolLevel === '초등' ? ['1','2','3','4','5','6'] : schoolLevel === '중등' ? ['1','2','3'] : ['1','2','3'];

  async function handleGenerate() {
    if (!unit.trim() || !subject) return;
    setResult('');
    setIsStreaming(true);
    try {
      const res = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolLevel, grade, subject, unit, session, teachingStyle }),
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
    <PageContainer title="수업 지도안 생성">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-card p-5 space-y-4">
          <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            지도안 정보
          </h2>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">학교급</label>
            <div className="flex gap-2">
              {SCHOOL_LEVELS.map(l => (
                <button key={l} onClick={() => { setSchoolLevel(l); setSubject(''); }}
                  className={`flex-1 text-sm py-2 rounded-lg border font-medium transition-colors ${
                    schoolLevel === l ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">학년</label>
              <select value={grade} onChange={e => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                {grades.map(g => <option key={g} value={g}>{g}학년</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">교과</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">선택</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">단원명 <span className="text-danger">*</span></label>
            <input type="text" value={unit} onChange={e => setUnit(e.target.value)}
              placeholder="예: 분수의 덧셈과 뺄셈"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">차시</label>
              <select value={session} onChange={e => setSession(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                {['1','2','3','4','5'].map(s => <option key={s} value={s}>{s}차시</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">수업 방식</label>
              <select value={teachingStyle} onChange={e => setTeachingStyle(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                {TEACHING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={!unit.trim() || !subject || isStreaming}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
            {isStreaming ? <><Loader2 className="w-4 h-4 animate-spin" /> 지도안 작성 중...</> : <><BookOpen className="w-4 h-4" /> 지도안 생성</>}
          </button>
        </div>

        <ResultCard content={result} isStreaming={isStreaming} title={`${grade}학년 ${subject} ${unit} 지도안`} onSave={() => {}} />
      </div>
    </PageContainer>
  );
}
