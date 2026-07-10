'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { ResultCard } from '@/components/AI/ResultCard';
import { useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';

const MOCK_STUDENTS = ['김민준', '이서연', '박지훈', '최유나', '정도현', '한지수', '오준혁', '임채원'];
const PERIODS = ['2026년 5월', '2026년 4월', '2026년 3월', '2026년 2분기'];

export default function GrowthPage() {
  const [studentName, setStudentName] = useState('');
  const [period, setPeriod] = useState('2026년 5월');
  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [behaviorNotes, setBehaviorNotes] = useState('');
  const [academicNotes, setAcademicNotes] = useState('');
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  async function handleGenerate() {
    if (!studentName) return;
    setResult('');
    setIsStreaming(true);
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, period, attendanceNotes, behaviorNotes, academicNotes }),
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
    <PageContainer title="학생 성장 리포트">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-border shadow-card p-5 space-y-4">
            <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              학생 정보 입력
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">학생 선택 *</label>
                <select value={studentName} onChange={e => setStudentName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">학생을 선택하세요</option>
                  {MOCK_STUDENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">기간</label>
                <select value={period} onChange={e => setPeriod(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">출결 특이사항</label>
              <textarea value={attendanceNotes} onChange={e => setAttendanceNotes(e.target.value)} rows={2}
                placeholder="예: 5월 3주차 화요일 무단결석 1회"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">행동 관찰 메모</label>
              <textarea value={behaviorNotes} onChange={e => setBehaviorNotes(e.target.value)} rows={3}
                placeholder="예: 모둠 활동 시 리더십 발휘, 급식 시간 식사량 감소 관찰됨"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">학습 성취 메모</label>
              <textarea value={academicNotes} onChange={e => setAcademicNotes(e.target.value)} rows={3}
                placeholder="예: 수학 분수 단원 우수, 국어 독서 감상문 창의적 표현 탁월"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <button onClick={handleGenerate} disabled={!studentName || isStreaming}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
              {isStreaming ? <><Loader2 className="w-4 h-4 animate-spin" /> 리포트 생성 중...</> : <><TrendingUp className="w-4 h-4" /> AI 성장 리포트 생성</>}
            </button>
          </div>

          {/* NEIS 연동 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded mt-0.5">데모 데이터</span>
              <p className="text-xs text-text-secondary">
                NEIS_API_KEY 설정 시 실제 출결 데이터가 자동 연동됩니다.
              </p>
            </div>
          </div>
        </div>

        <ResultCard content={result} isStreaming={isStreaming} title={studentName ? `${studentName} 성장 리포트 — ${period}` : '학생 성장 리포트'} onSave={() => {}} />
      </div>
    </PageContainer>
  );
}
