'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { useEffect, useState } from 'react';
import { Users, Plus, Loader2, Check, Calendar, ChevronRight } from 'lucide-react';

interface Consultation {
  id: number;
  parent_name: string;
  student_name: string;
  scheduled_at: string;
  topic: string;
  notes: string | null;
  ai_summary: string | null;
  status: string;
}

export default function ConsultationPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [tab, setTab] = useState<'scheduled' | 'completed'>('scheduled');
  const [notes, setNotes] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ parent_name: '', student_name: '', scheduled_at: '', topic: '' });

  useEffect(() => {
    fetch('/api/consultation').then(r => r.json()).then(setConsultations).catch(() => {});
  }, []);

  async function handleSummarize() {
    if (!selected || !notes.trim()) return;
    setSummarizing(true);
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summarize', id: selected.id, notes }),
      });
      const { summary } = await res.json();
      setSelected(s => s ? { ...s, ai_summary: summary, status: 'completed', notes } : s);
      setConsultations(cs => cs.map(c => c.id === selected.id ? { ...c, ai_summary: summary, status: 'completed', notes } : c));
    } finally {
      setSummarizing(false);
    }
  }

  async function handleAdd() {
    if (!addForm.parent_name || !addForm.student_name || !addForm.scheduled_at || !addForm.topic) return;
    const res = await fetch('/api/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    });
    const { id } = await res.json();
    const newConsultation: Consultation = { id, ...addForm, notes: null, ai_summary: null, status: 'scheduled' };
    setConsultations(cs => [newConsultation, ...cs]);
    setShowAdd(false);
    setAddForm({ parent_name: '', student_name: '', scheduled_at: '', topic: '' });
  }

  const filtered = consultations.filter(c => tab === 'scheduled' ? c.status === 'scheduled' : c.status === 'completed');

  return (
    <PageContainer title="학부모 상담 관리">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* 좌측 — 목록 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(['scheduled', 'completed'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                      tab === t ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                    }`}>
                    {t === 'scheduled' ? '예정 상담' : '완료 상담'}
                    <span className="ml-1 opacity-75">({consultations.filter(c => t === 'scheduled' ? c.status === 'scheduled' : c.status === 'completed').length})</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAdd(!showAdd)}
                className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                <Plus className="w-3.5 h-3.5" />
                추가
              </button>
            </div>

            {showAdd && (
              <div className="bg-white rounded-xl border border-primary shadow-card p-4 space-y-3 animate-fade-in">
                <h4 className="text-xs font-semibold text-text-primary">새 상담 등록</h4>
                <input type="text" placeholder="학부모 이름" value={addForm.parent_name}
                  onChange={e => setAddForm(f => ({ ...f, parent_name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="text" placeholder="학생 이름" value={addForm.student_name}
                  onChange={e => setAddForm(f => ({ ...f, student_name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="datetime-local" value={addForm.scheduled_at}
                  onChange={e => setAddForm(f => ({ ...f, scheduled_at: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="text" placeholder="상담 주제" value={addForm.topic}
                  onChange={e => setAddForm(f => ({ ...f, topic: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={handleAdd}
                  className="w-full bg-primary text-white py-2 rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors">
                  등록
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">
                  {tab === 'scheduled' ? '예정된 상담이 없습니다' : '완료된 상담이 없습니다'}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map(c => (
                    <button key={c.id} onClick={() => { setSelected(c); setNotes(c.notes ?? ''); }}
                      className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-primary-light' : ''}`}>
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{c.parent_name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-text-primary">{c.parent_name} 학부모</div>
                          <div className="text-xs text-text-secondary">{c.student_name} · {c.topic}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-text-muted" />
                            <span className="text-[10px] text-text-muted">
                              {new Date(c.scheduled_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 우측 — 상세 */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="space-y-4">
                {/* 상담 정보 */}
                <div className="bg-white rounded-xl border border-border shadow-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-text-primary">{selected.parent_name} 학부모</h3>
                      <p className="text-sm text-text-secondary">{selected.student_name} · {selected.topic}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      selected.status === 'completed' ? 'bg-green-100 text-success' : 'bg-blue-100 text-primary'
                    }`}>
                      {selected.status === 'completed' ? '완료' : '예정'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selected.scheduled_at).toLocaleString('ko-KR')}
                  </div>
                </div>

                {/* 상담 메모 */}
                {selected.status !== 'completed' && (
                  <div className="bg-white rounded-xl border border-border shadow-card p-5">
                    <h4 className="font-semibold text-text-primary text-sm mb-3">상담 기록</h4>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={6}
                      placeholder="상담 내용을 메모하세요. 상담이 끝난 후 AI가 요약해드립니다."
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3" />
                    <button onClick={handleSummarize} disabled={!notes.trim() || summarizing}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
                      {summarizing ? <><Loader2 className="w-4 h-4 animate-spin" /> AI 요약 생성 중...</> : <><Check className="w-4 h-4" /> 상담 완료 & AI 요약 생성</>}
                    </button>
                  </div>
                )}

                {/* AI 요약 */}
                {selected.ai_summary && (
                  <div className="bg-white rounded-xl border border-border shadow-card p-5">
                    <h4 className="font-semibold text-text-primary text-sm mb-3">AI 상담 요약</h4>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                      {selected.ai_summary}
                    </div>
                    <button className="mt-3 text-xs text-primary hover:underline flex items-center gap-1">
                      생활기록부 참고용 내보내기 →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border shadow-card h-64 flex flex-col items-center justify-center">
                <Users className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm text-text-muted">상담을 선택하거나 새 상담을 추가하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
