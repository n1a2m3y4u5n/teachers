'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { ResultCard } from '@/components/AI/ResultCard';
import { useState } from 'react';
import { Shield, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';

const STEPS = ['기본 정보', '메시지 첨부', '추가 진술', '문서 생성'];
const DOC_TYPES = [
  { key: 'report', label: '경위서', icon: '📝' },
  { key: 'evidence', label: '증거 자료 목록', icon: '📋' },
  { key: 'committee', label: '교권보호위원회 신고 초안', icon: '⚖️' },
] as const;

export default function LegalPage() {
  const [protectionMode, setProtectionMode] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    incidentDate: '',
    incidentTime: '',
    location: '',
    persons: '',
    messages: '',
    additionalStatement: '',
  });
  const [activeDocType, setActiveDocType] = useState<'report' | 'evidence' | 'committee'>('report');
  const [results, setResults] = useState<Record<string, string>>({});
  const [isStreaming, setIsStreaming] = useState(false);

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function generateDoc(docType: 'report' | 'evidence' | 'committee') {
    setActiveDocType(docType);
    setIsStreaming(true);
    setResults(r => ({ ...r, [docType]: '' }));

    try {
      const res = await fetch('/api/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, docType }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
        setResults(r => ({ ...r, [docType]: text }));
      }
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <PageContainer title="법적 보호 문서 자동화">
      <div className="max-w-6xl mx-auto">
        {/* 교권 보호 모드 토글 */}
        <div className={`mb-6 rounded-xl border p-5 transition-all ${
          protectionMode
            ? 'bg-red-50 border-red-300 protection-mode'
            : 'bg-white border-border shadow-card'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${protectionMode ? 'bg-danger' : 'bg-gray-100'}`}>
                <Shield className={`w-5 h-5 ${protectionMode ? 'text-white' : 'text-text-muted'}`} />
              </div>
              <div>
                <div className={`font-semibold text-sm ${protectionMode ? 'text-danger' : 'text-text-primary'}`}>
                  교권 보호 모드 {protectionMode ? '활성화됨' : ''}
                </div>
                <div className="text-xs text-text-secondary">
                  {protectionMode ? '법적 보호 문서 생성이 준비되었습니다' : '교권 침해 상황에서 활성화하세요'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setProtectionMode(!protectionMode)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                protectionMode
                  ? 'bg-danger text-white hover:bg-red-700'
                  : 'bg-gray-100 text-text-primary hover:bg-gray-200'
              }`}
            >
              {protectionMode ? '모드 종료' : '교권 보호 모드 ON'}
            </button>
          </div>

          {protectionMode && (
            <div className="mt-4 flex items-start gap-2 bg-white rounded-lg p-3 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                현재 상황을 정확하게 기록하세요. 모든 정보는 법적 증거로 활용될 수 있습니다.
                감정적 표현 없이 사실만 기재하세요.
              </p>
            </div>
          )}
        </div>

        {/* 스텝퍼 */}
        <div className="bg-white rounded-xl border border-border shadow-card mb-6">
          <div className="flex">
            {STEPS.map((label, i) => (
              <button
                key={label}
                onClick={() => setStep(i)}
                className={`flex-1 py-3.5 text-xs font-medium border-b-2 transition-colors ${
                  step === i ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <span className={`inline-flex items-center gap-1.5 ${
                  i < step ? 'text-success' : step === i ? 'text-primary' : 'text-text-muted'
                }`}>
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                    i < step ? 'bg-green-100 text-success' : step === i ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}>{i < step ? '✓' : i + 1}</span>
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="p-5">
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">발생 날짜 *</label>
                    <input type="date" value={form.incidentDate} onChange={e => update('incidentDate', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">발생 시각 *</label>
                    <input type="time" value={form.incidentTime} onChange={e => update('incidentTime', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">발생 장소 *</label>
                  <input type="text" value={form.location} onChange={e => update('location', e.target.value)}
                    placeholder="예: 3학년 2반 교실, 학교 현관"
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">관련 당사자</label>
                  <input type="text" value={form.persons} onChange={e => update('persons', e.target.value)}
                    placeholder="예: 학부모 이○○, 학생 이도현"
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">관련 메시지 / 발언 내용 *</label>
                <textarea value={form.messages} onChange={e => update('messages', e.target.value)}
                  rows={6}
                  placeholder="학부모 메시지, 전화 통화 내용, 직접 발언 등을 있는 그대로 기재하세요."
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                <p className="text-xs text-text-muted mt-1.5">* 정확한 내용을 기재할수록 법적 효력이 높아집니다</p>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">추가 진술 (선택)</label>
                <textarea value={form.additionalStatement} onChange={e => update('additionalStatement', e.target.value)}
                  rows={6}
                  placeholder="상황에 대한 교사의 관점, 배경 설명, 목격자 정보 등을 추가하세요."
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">생성할 문서를 선택하세요. 각 문서를 개별적으로 생성할 수 있습니다.</p>
                <div className="grid grid-cols-3 gap-3">
                  {DOC_TYPES.map(dt => (
                    <button
                      key={dt.key}
                      onClick={() => generateDoc(dt.key)}
                      disabled={isStreaming}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        activeDocType === dt.key && (isStreaming || results[dt.key])
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-border bg-white text-text-secondary hover:border-primary hover:text-primary'
                      } disabled:opacity-50`}
                    >
                      <span className="text-2xl">{dt.icon}</span>
                      <span className="text-xs font-medium text-center">{dt.label}</span>
                      {isStreaming && activeDocType === dt.key && <Loader2 className="w-4 h-4 animate-spin" />}
                      {results[dt.key] && activeDocType !== dt.key && <span className="text-[10px] text-success">생성됨</span>}
                    </button>
                  ))}
                </div>

                {(results[activeDocType] || (isStreaming && activeDocType)) && (
                  <ResultCard
                    content={results[activeDocType] ?? ''}
                    isStreaming={isStreaming && activeDocType === activeDocType}
                    title={DOC_TYPES.find(d => d.key === activeDocType)?.label}
                  />
                )}

                <div className="bg-blue-50 rounded-lg p-3.5 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-primary">
                    <strong>교육청 제출 안내:</strong> 생성된 문서를 PDF로 저장 후 교육청 교권보호담당자에게 제출하세요.
                    긴급한 경우 교권보호 상담전화 1588-7179로 연락하세요.
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-5">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                이전
              </button>
              {step < 3 && (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  다음
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
