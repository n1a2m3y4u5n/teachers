'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Heart } from 'lucide-react';

const RADAR_DATA = [
  { subject: '교사 사기', value: 72 },
  { subject: '학생 안전', value: 85 },
  { subject: '민원 관리', value: 58 },
  { subject: '업무 효율', value: 63 },
  { subject: '소통 문화', value: 76 },
  { subject: '교권 보호', value: 55 },
];

const HEALTH_INDICATORS = [
  { label: '이번 달 D타입 민원', value: '2건', status: 'warning', detail: '지난달 대비 +1건' },
  { label: '교사 번아웃 평균', value: '52점', status: 'ok', detail: '전국 평균 수준' },
  { label: '처리 완료 민원', value: '91%', status: 'good', detail: '목표 90% 달성' },
  { label: '미처리 공문', value: '3건', status: 'warning', detail: '이번 주 마감 포함' },
  { label: '학생 보고 처리율', value: '67%', status: 'warning', detail: '미검토 1건 있음' },
  { label: '상담 완료율', value: '100%', status: 'good', detail: '이번 달 5건 모두 완료' },
];

const STATUS_CONFIG = {
  good: { className: 'bg-green-100 text-success', dot: 'bg-success' },
  ok: { className: 'bg-blue-100 text-primary', dot: 'bg-primary' },
  warning: { className: 'bg-yellow-100 text-warning', dot: 'bg-warning' },
};

export default function SchoolHealthPage() {
  const overallScore = Math.round(RADAR_DATA.reduce((s, d) => s + d.value, 0) / RADAR_DATA.length);

  return (
    <PageContainer title="학교 건강 대시보드">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 종합 점수 */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">학교 건강 종합 지수</p>
            <div className="text-4xl font-bold">{overallScore}<span className="text-2xl text-blue-200">/ 100</span></div>
            <p className="text-blue-100 text-sm mt-1">전국 상위 38% · 전월 대비 +3점</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 레이더 차트 */}
          <div className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-4">영역별 건강 지수</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#475569' }} />
                <Radar dataKey="value" stroke="#1B4F8A" fill="#1B4F8A" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip formatter={(value) => [`${value}점`, '']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 개별 지표 */}
          <div className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-4">주요 건강 지표</h3>
            <div className="space-y-3">
              {HEALTH_INDICATORS.map(ind => {
                const config = STATUS_CONFIG[ind.status as keyof typeof STATUS_CONFIG];
                return (
                  <div key={ind.label} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">{ind.label}</span>
                        <span className={`text-xs font-bold ${config.className.split(' ')[1]}`}>{ind.value}</span>
                      </div>
                      <div className="text-[10px] text-text-muted">{ind.detail}</div>
                    </div>
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
