'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText, MessageSquare, Shield, TrendingUp, Bell, BookOpen, Users, ChevronRight, AlertTriangle } from 'lucide-react';

interface DashboardData {
  notifications: Array<{
    id: number;
    type: string;
    title: string;
    summary: string;
    is_read: number;
    created_at: string;
  }>;
  stats: {
    pendingComplaints: number;
    todayConsultation: { parent_name: string; scheduled_at: string } | null;
    pendingReports: number;
    recentDocuments: Array<{ id: number; type: string; title: string; created_at: string }>;
  };
}

const QUICK_ACTIONS = [
  { label: '공문 작성', href: '/admin/document', icon: FileText, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { label: '가정통신문', href: '/admin/notice', icon: Bell, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
  { label: '수업 지도안', href: '/admin/lesson', icon: BookOpen, color: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100' },
  { label: '민원 확인', href: '/communication/complaint', icon: MessageSquare, color: 'bg-green-50 text-green-600 hover:bg-green-100' },
  { label: '상담 관리', href: '/communication/consultation', icon: Users, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { label: '법적 보호', href: '/protection/legal', icon: Shield, color: 'bg-red-50 text-red-600 hover:bg-red-100' },
];

function formatTime(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function getTypeIcon(type: string) {
  const map: Record<string, string> = { complaint: '⚠️', deadline: '📋', attendance: '👤', consultation: '💬' };
  return map[type] ?? '🔔';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageContainer title="교사 대시보드">
      <div className="max-w-7xl mx-auto">
        {/* 환영 배너 */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">2026년 5월 24일 토요일</p>
              <h2 className="text-xl font-bold">안녕하세요, 김민수 선생님</h2>
              <p className="text-blue-100 text-sm mt-1">3학년 2반 담임 · 처리 대기 업무가 있습니다</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {data?.stats.pendingComplaints ?? 0}건
              </div>
              <div className="text-blue-200 text-xs">미처리 민원</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 중앙 컬럼 */}
          <div className="lg:col-span-2 space-y-5">
            {/* 오늘의 할 일 */}
            <div className="bg-white rounded-xl border border-border shadow-card">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-text-primary text-sm">오늘의 할 일</h3>
                <span className="text-xs text-text-muted">우선순위 순</span>
              </div>
              <div className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="skeleton w-6 h-6 rounded" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3.5 rounded w-48" />
                        <div className="skeleton h-3 rounded w-32" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <TodoItem
                      icon="📋" label="공문 마감 D-1" sub="학예회 안내 공문 제출 필요"
                      href="/admin/document" urgent
                    />
                    {(data?.stats.pendingComplaints ?? 0) > 0 && (
                      <TodoItem
                        icon="⚠️" label={`민원 대기 ${data!.stats.pendingComplaints}건`}
                        sub="D타입 위험 민원 포함 · 즉시 확인 필요"
                        href="/communication/complaint" urgent
                      />
                    )}
                    {data?.stats.todayConsultation && (
                      <TodoItem
                        icon="💬" label="오늘 상담 예약"
                        sub={`${data.stats.todayConsultation.parent_name} 학부모`}
                        href="/communication/consultation"
                      />
                    )}
                    {(data?.stats.pendingReports ?? 0) > 0 && (
                      <TodoItem
                        icon="👤" label={`학생 자기보고 ${data!.stats.pendingReports}건`}
                        sub="미검토 익명 보고서"
                        href="/students/report"
                      />
                    )}
                    <TodoItem
                      icon="📚" label="3학년 2반 출결 확인"
                      sub="김○○ 3일 연속 결석 감지"
                      href="/students/attendance"
                    />
                  </>
                )}
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-xl border border-border shadow-card">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-text-primary text-sm">빠른 액션</h3>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {QUICK_ACTIONS.map(action => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${action.color}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 최근 생성 문서 */}
            {data?.stats.recentDocuments && data.stats.recentDocuments.length > 0 && (
              <div className="bg-white rounded-xl border border-border shadow-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-text-primary text-sm">최근 생성 문서</h3>
                  <Link href="/admin/document" className="text-xs text-primary hover:underline">전체 보기</Link>
                </div>
                <div className="divide-y divide-border">
                  {data.stats.recentDocuments.map(doc => (
                    <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-text-primary truncate">{doc.title ?? '(제목 없음)'}</div>
                        <div className="text-xs text-text-muted">{doc.type} · {formatTime(doc.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 우측 컬럼 — 알림 피드 */}
          <div className="space-y-5">
            {/* 번아웃 미니 게이지 */}
            <Link href="/protection/burnout" className="block bg-white rounded-xl border border-border shadow-card hover:shadow-elevated transition-shadow">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-text-primary text-sm">번아웃 지수</h3>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
              <div className="p-5 flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="-rotate-90" width="64" height="64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#F59E0B" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${26 * 2 * Math.PI}`}
                      strokeDashoffset={`${26 * 2 * Math.PI * (1 - 58 / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-yellow-600">58</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-600">주의 단계</div>
                  <div className="text-xs text-text-muted mt-0.5">전교 평균 대비 +6점</div>
                  <div className="text-xs text-primary mt-1">상세 분석 보기 →</div>
                </div>
              </div>
            </Link>

            {/* 알림 피드 */}
            <div className="bg-white rounded-xl border border-border shadow-card">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-text-primary text-sm">최근 알림</h3>
                <span className="text-xs bg-danger text-white px-1.5 py-0.5 rounded-full">
                  {data?.notifications.filter(n => !n.is_read).length ?? 0}
                </span>
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 space-y-1.5">
                      <div className="skeleton h-3.5 rounded w-40" />
                      <div className="skeleton h-3 rounded w-56" />
                    </div>
                  ))
                  : data?.notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 ${!n.is_read ? 'bg-primary-light/20' : ''}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{getTypeIcon(n.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-text-primary">{n.title}</div>
                          <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.summary}</div>
                          <div className="text-[10px] text-text-muted mt-1">{formatTime(n.created_at)}</div>
                        </div>
                        {!n.is_read && <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* 통계 요약 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileText, label: '이번 달 문서', value: '12건', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: MessageSquare, label: '처리 민원', value: '8건', color: 'text-green-600', bg: 'bg-green-50' },
                { icon: Users, label: '상담 완료', value: '5건', color: 'text-purple-600', bg: 'bg-purple-50' },
                { icon: TrendingUp, label: '성장 리포트', value: '3건', color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`${stat.bg} rounded-xl p-3.5`}>
                    <Icon className={`w-4 h-4 ${stat.color} mb-1.5`} />
                    <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-text-secondary">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function TodoItem({
  icon, label, sub, href, urgent
}: {
  icon: string; label: string; sub: string; href: string; urgent?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
      <span className="text-lg w-7 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${urgent ? 'text-danger' : 'text-text-primary'}`}>{label}</div>
        <div className="text-xs text-text-secondary truncate">{sub}</div>
      </div>
      {urgent && <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />}
      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  );
}
