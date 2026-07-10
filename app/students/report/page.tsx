'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { useEffect, useState } from 'react';
import { UserCheck, Eye, CheckCircle } from 'lucide-react';

interface Report {
  id: number;
  category: string;
  content: string;
  urgency: string;
  ai_summary: string | null;
  status: string;
  created_at: string;
}

const URGENCY_CONFIG = {
  긴급: { className: 'bg-red-100 text-danger', icon: '🔴' },
  보통: { className: 'bg-yellow-100 text-warning', icon: '🟡' },
  낮음: { className: 'bg-green-100 text-success', icon: '🟢' },
};

function formatTime(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function StudentReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [filter, setFilter] = useState('전체');

  useEffect(() => {
    fetch('/api/student-reports').then(r => r.json()).then(setReports).catch(() => {
      // API가 없으면 Mock 데이터
      setReports([
        { id: 1, category: '교우관계', content: '친구들이 저를 무시하고 대화에 끼워주지 않아요.', urgency: '보통', ai_summary: '또래 관계 소외감 호소. 담임 면담 및 또래 중재 프로그램 검토 필요.', status: 'pending', created_at: new Date(Date.now() - 3*3600000).toISOString() },
        { id: 2, category: '학업', content: '수학을 따라가기가 너무 힘들어요. 학원도 다니는데 모르겠어요.', urgency: '보통', ai_summary: '기초 학습 부진 가능성. 방과후 보충 지도 또는 학습 도움 연계 권장.', status: 'reviewed', created_at: new Date(Date.now() - 24*3600000).toISOString() },
        { id: 3, category: '가정', content: '요즘 집에서 부모님이 많이 싸워서 학교 오기 싫어요.', urgency: '긴급', ai_summary: '가정 불화로 인한 학교 회피. Wee클래스 상담 연계 및 담임 면담 즉시 필요.', status: 'pending', created_at: new Date(Date.now() - 1*3600000).toISOString() },
      ]);
    });
  }, []);

  const filtered = filter === '전체' ? reports : reports.filter(r => r.category === filter);
  const categories = ['전체', ...Array.from(new Set(reports.map(r => r.category)))];

  return (
    <PageContainer title="학생 익명 자기보고">
      <div className="max-w-5xl mx-auto">
        {/* 안내 배너 */}
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary">학생 익명 자기보고 시스템</p>
            <p className="text-xs text-text-secondary mt-0.5">학생들이 익명으로 학교생활 어려움을 보고하면 AI가 분류하여 교사에게 알립니다. 학생 개인정보는 기록되지 않습니다.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* 좌측 — 목록 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === c ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              <div className="divide-y divide-border">
                {filtered.map(r => {
                  const urgency = URGENCY_CONFIG[r.urgency as keyof typeof URGENCY_CONFIG] ?? { className: 'bg-gray-100 text-gray-600', icon: '⚪' };
                  return (
                    <button key={r.id} onClick={() => setSelected(r)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors ${selected?.id === r.id ? 'bg-primary-light' : ''} ${r.urgency === '긴급' ? 'border-l-4 border-l-danger' : ''}`}>
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-0.5 rounded">{r.category}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${urgency.className}`}>
                              {urgency.icon} {r.urgency}
                            </span>
                          </div>
                          <div className="text-xs text-text-primary line-clamp-2">{r.content}</div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-text-muted">{formatTime(r.created_at)}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${r.status === 'reviewed' ? 'bg-green-100 text-success' : 'bg-yellow-100 text-warning'}`}>
                              {r.status === 'reviewed' ? '검토됨' : '미검토'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 우측 — 상세 */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-border shadow-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-semibold text-text-primary">{selected.category} 영역</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(URGENCY_CONFIG[selected.urgency as keyof typeof URGENCY_CONFIG] ?? { className: 'bg-gray-100' }).className}`}>
                      {selected.urgency}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-text-primary leading-relaxed border-l-4 border-gray-300 mb-4">
                    &ldquo;{selected.content}&rdquo;
                  </div>
                  {selected.ai_summary && (
                    <div>
                      <div className="text-xs font-medium text-text-secondary mb-2">AI 분석 요약</div>
                      <div className="bg-blue-50 rounded-lg p-3.5 text-xs text-primary leading-relaxed">
                        {selected.ai_summary}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      면담 일정 잡기
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 border border-success text-success rounded-lg hover:bg-green-50 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                      검토 완료
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border shadow-card h-64 flex flex-col items-center justify-center">
                <UserCheck className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm text-text-muted">보고서를 선택해 상세 내용을 확인하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
