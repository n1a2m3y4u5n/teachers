'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { TypeBadge } from '@/components/AI/TypeBadge';
import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Shield, ChevronRight, MessageSquare, Timer } from 'lucide-react';
import Link from 'next/link';

interface Complaint {
  id: number;
  content: string;
  complaint_type: 'A' | 'B' | 'C' | 'D';
  reason: string;
  response: string;
  emotion: string;
  emotion_score: number;
  is_violence_risk: number;
  status: string;
  created_at: string;
}

function formatTime(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function EmotionBar({ score }: { score: number }) {
  const color = score < 0.3 ? 'bg-success' : score < 0.6 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score * 100}%` }} />
      </div>
      <span className="text-xs text-text-muted w-8 text-right">{Math.round(score * 100)}%</span>
    </div>
  );
}

export default function ComplaintPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filterType, setFilterType] = useState<string>('전체');
  const [newContent, setNewContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(60);
  const [cooldownActive, setCooldownActive] = useState(false);

  useEffect(() => {
    fetch('/api/complaint').then(r => r.json()).then(setComplaints).catch(() => {});
  }, []);

  async function handleAnalyze() {
    if (!newContent.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      await res.json();
      setNewContent('');
      // 새 민원 목록에 추가
      const updatedRes = await fetch('/api/complaint');
      const updated = await updatedRes.json();
      setComplaints(updated);
      // 새로 추가된 것 선택
      const newest = updated[0];
      setSelected(newest);

      if (newest.complaint_type === 'C') setShowCooldown(true);
    } finally {
      setAnalyzing(false);
    }
  }

  function startCooldown() {
    setCooldownActive(true);
    setShowCooldown(false);
    let count = 60;
    setCooldownTimer(count);
    const interval = setInterval(() => {
      count--;
      setCooldownTimer(count);
      if (count <= 0) {
        clearInterval(interval);
        setCooldownActive(false);
      }
    }, 1000);
  }

  const filtered = filterType === '전체' ? complaints : complaints.filter(c => c.complaint_type === filterType);

  return (
    <PageContainer title="학부모 민원 AI 중개">
      <div className="max-w-7xl mx-auto">
        {/* D타입 경고 배너 */}
        {complaints.some(c => c.complaint_type === 'D' && c.status === 'pending') && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-danger">D타입 위험 민원이 대기 중입니다</span>
              <span className="text-sm text-red-600 ml-2">법적 위협이 포함된 민원 — 즉시 확인하세요</span>
            </div>
            <Link href="/protection/legal" className="flex items-center gap-1.5 text-xs font-medium text-danger border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              <Shield className="w-3.5 h-3.5" />
              법적 보호 문서 생성
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 좌측 — 민원 목록 */}
          <div className="space-y-4">
            {/* 새 민원 입력 */}
            <div className="bg-white rounded-xl border border-border shadow-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">새 민원 분석</h3>
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={4}
                placeholder="학부모 메시지를 붙여넣기 하세요..."
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={!newContent.trim() || analyzing}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                {analyzing ? 'AI 분석 중...' : 'AI 분류 분석'}
              </button>
            </div>

            {/* 필터 */}
            <div className="flex gap-1.5 flex-wrap">
              {['전체', 'A', 'B', 'C', 'D'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    filterType === t
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border text-text-secondary hover:border-primary'
                  }`}
                >
                  {t === '전체' ? '전체' : `${t}타입`}
                  {t !== '전체' && (
                    <span className="ml-1 opacity-75">({complaints.filter(c => c.complaint_type === t).length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* 목록 */}
            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">민원이 없습니다</div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-primary-light' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <TypeBadge type={c.complaint_type} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-text-primary line-clamp-2 mt-0.5">{c.content}</div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-text-muted">{formatTime(c.created_at)}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              c.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {c.status === 'completed' ? '처리됨' : '대기'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 중앙 + 우측 — 상세 */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-4">
                {/* 민원 내용 */}
                <div className="bg-white rounded-xl border border-border shadow-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <TypeBadge type={selected.complaint_type} />
                    <span className="text-xs text-text-muted">{formatTime(selected.created_at)}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3.5 text-sm text-text-primary leading-relaxed mb-4 border-l-4 border-gray-300">
                    &ldquo;{selected.content}&rdquo;
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-text-secondary mb-1">감정 강도</div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-text-muted w-8">{selected.emotion}</span>
                        <EmotionBar score={selected.emotion_score} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-text-secondary mb-1">분류 근거</div>
                      <p className="text-xs text-text-secondary bg-gray-50 rounded-lg p-3">{selected.reason}</p>
                    </div>
                  </div>
                </div>

                {/* D타입 처리 방법 */}
                {selected.complaint_type === 'D' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-danger" />
                      <span className="text-sm font-semibold text-danger">법적 위험 민원 — 즉각 조치 필요</span>
                    </div>
                    <p className="text-xs text-red-700 mb-3">이 민원에는 법적 위협이 포함되어 있습니다. 직접 응답하기 전에 법적 보호 문서를 생성하세요.</p>
                    <Link
                      href="/protection/legal"
                      className="flex items-center justify-center gap-2 w-full bg-danger text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      법적 보호 문서 바로 생성
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* C타입 쿨다운 챔버 */}
                {selected.complaint_type === 'C' && (showCooldown || cooldownActive) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="w-4 h-4 text-warning" />
                      <span className="text-sm font-semibold text-orange-700">쿨다운 챔버</span>
                    </div>
                    <p className="text-xs text-orange-700 mb-3">
                      지금 바로 답장하지 마세요. 감정적으로 작성된 응답은 상황을 악화시킬 수 있습니다.
                    </p>
                    {cooldownActive ? (
                      <div className="text-center py-3">
                        <div className="text-2xl font-bold text-orange-600">{cooldownTimer}초</div>
                        <div className="text-xs text-orange-500 mt-1">잠시 후 답변 초안을 받을 수 있습니다</div>
                      </div>
                    ) : (
                      <button
                        onClick={startCooldown}
                        className="w-full bg-warning text-white py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                      >
                        60초 후 답변 초안 받기
                      </button>
                    )}
                  </div>
                )}

                {/* AI 응답 초안 */}
                {selected.response && !(selected.complaint_type === 'C' && showCooldown) && (
                  <div className="bg-white rounded-xl border border-border shadow-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-text-primary">AI 응답 초안</h4>
                      {selected.complaint_type === 'A' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">자동 발송 가능</span>
                      )}
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3.5 text-sm text-text-primary leading-relaxed border-l-4 border-primary mb-3">
                      {selected.response}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 text-xs py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors">
                        수정하기
                      </button>
                      <button className="flex-1 text-xs py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        답변 발송
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border shadow-card h-64 flex flex-col items-center justify-center">
                <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm text-text-muted">민원을 선택하거나 새 민원을 분석해 보세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
