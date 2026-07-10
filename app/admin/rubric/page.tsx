'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { ResultCard } from '@/components/AI/ResultCard';
import { useState } from 'react';
import { Award, Loader2 } from 'lucide-react';

const EVAL_TYPES = ['서술형', '수행형', '포트폴리오', '토론'];
const EVAL_ELEMENTS = ['내용 이해', '표현력', '창의성', '협력', '비판적 사고', '적용 능력', '참여도'];
const GRADE_SCALES = ['4단계', '5단계', 'A-E', '수우미양가'];

export default function RubricPage() {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('3');
  const [unit, setUnit] = useState('');
  const [evalType, setEvalType] = useState('수행형');
  const [elements, setElements] = useState<string[]>(['내용 이해', '표현력']);
  const [gradeScale, setGradeScale] = useState('4단계');
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  function toggleElement(el: string) {
    setElements(prev => prev.includes(el) ? prev.filter(e => e !== el) : [...prev, el]);
  }

  async function handleGenerate() {
    if (!unit.trim() || !subject) return;
    setResult('');
    setIsStreaming(true);
    try {
      const res = await fetch('/api/rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, unit, evalType, elements, gradeScale }),
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
    <PageContainer title="수행평가 루브릭 자동 생성">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-card p-5 space-y-4">
          <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            루브릭 정보
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">교과 <span className="text-danger">*</span></label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="예: 국어"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">학년</label>
              <select value={grade} onChange={e => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                {['1','2','3','4','5','6'].map(g => <option key={g} value={g}>{g}학년</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">단원 / 평가 주제 <span className="text-danger">*</span></label>
            <input type="text" value={unit} onChange={e => setUnit(e.target.value)}
              placeholder="예: 논설문 쓰기"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">평가 유형</label>
            <div className="grid grid-cols-2 gap-2">
              {EVAL_TYPES.map(t => (
                <button key={t} onClick={() => setEvalType(t)}
                  className={`text-sm py-2 rounded-lg border font-medium transition-colors ${
                    evalType === t ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">평가 요소 (복수 선택)</label>
            <div className="flex flex-wrap gap-1.5">
              {EVAL_ELEMENTS.map(el => (
                <button key={el} onClick={() => toggleElement(el)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                    elements.includes(el) ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                  }`}>
                  {el}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">점수 체계</label>
            <div className="flex gap-2">
              {GRADE_SCALES.map(s => (
                <button key={s} onClick={() => setGradeScale(s)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
                    gradeScale === s ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={!unit.trim() || !subject || isStreaming}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
            {isStreaming ? <><Loader2 className="w-4 h-4 animate-spin" /> 루브릭 생성 중...</> : <><Award className="w-4 h-4" /> 루브릭 자동 생성</>}
          </button>
        </div>

        <ResultCard content={result} isStreaming={isStreaming} title="수행평가 루브릭" onSave={() => {}} />
      </div>
    </PageContainer>
  );
}
