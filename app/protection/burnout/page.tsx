'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { BurnoutGauge } from '@/components/Charts/BurnoutGauge';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Phone } from 'lucide-react';

interface BurnoutData {
  overall: number;
  components: {
    complaintStress: number;
    adminBurden: number;
    studentIssue: number;
    pendingWork: number;
  };
  weeklyTrend: Array<{ week: string; score: number }>;
  averageScore: number;
  recommendation: string;
}

const COMPONENT_LABELS = {
  complaintStress: '민원 스트레스',
  adminBurden: '행정 업무 부담',
  studentIssue: '학생 이슈 빈도',
  pendingWork: '미처리 업무 누적',
};

export default function BurnoutPage() {
  const [data, setData] = useState<BurnoutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/burnout')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer title="번아웃 지수">
        <div className="max-w-4xl mx-auto space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border shadow-card p-5">
              <div className="skeleton h-5 rounded w-32 mb-4" />
              <div className="skeleton h-40 rounded" />
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  if (!data) return null;

  const componentData = Object.entries(data.components).map(([key, value]) => ({
    name: COMPONENT_LABELS[key as keyof typeof COMPONENT_LABELS],
    value,
    color: value < 40 ? '#22C55E' : value < 70 ? '#F59E0B' : '#EF4444',
  }));

  return (
    <PageContainer title="번아웃 지수">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* 메인 게이지 */}
          <div className="bg-white rounded-xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-text-primary">현재 번아웃 지수</h3>
              <span className="text-xs text-text-muted">전교 평균 {data.averageScore}점</span>
            </div>
            <div className="flex justify-center mb-4">
              <BurnoutGauge value={data.overall} size={180} />
            </div>
            <div className="text-center">
              <div className="text-xs text-text-secondary mb-2">전교 평균 대비</div>
              <div className={`text-sm font-semibold ${data.overall > data.averageScore ? 'text-danger' : 'text-success'}`}>
                {data.overall > data.averageScore ? '+' : ''}{data.overall - data.averageScore}점
              </div>
            </div>

            {/* 권고 사항 */}
            <div className={`mt-4 p-3.5 rounded-lg text-xs leading-relaxed ${
              data.overall >= 70 ? 'bg-red-50 text-red-700 border border-red-200'
              : data.overall >= 40 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {data.recommendation}
            </div>

            {data.overall >= 70 && (
              <div className="mt-3 space-y-2">
                <a href="tel:15887179" className="flex items-center gap-2 w-full justify-center bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                  <Phone className="w-4 h-4" />
                  교권보호 상담전화 1588-7179
                </a>
              </div>
            )}
          </div>

          {/* 구성 요소 분해 */}
          <div className="bg-white rounded-xl border border-border shadow-card p-6">
            <h3 className="font-semibold text-text-primary mb-5">구성 요소 분석</h3>
            <div className="space-y-4">
              {componentData.map(item => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-secondary">{item.name}</span>
                    <span className="font-medium" style={{ color: item.color }}>{item.value}점</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 바 차트 */}
            <div className="mt-5">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={componentData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`${value}점`, '']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {componentData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 주간 트렌드 */}
          <div className="md:col-span-2 bg-white rounded-xl border border-border shadow-card p-6">
            <h3 className="font-semibold text-text-primary mb-5">주간 트렌드 (최근 4주)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value}점`, '번아웃 지수']}
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E2E8F0' }}
                />
                {/* 평균선 */}
                <Line type="monotone" dataKey={() => data.averageScore} stroke="#CBD5E1" strokeDasharray="5 5" dot={false} strokeWidth={1.5} />
                <Line
                  type="monotone" dataKey="score"
                  stroke={data.overall >= 70 ? '#EF4444' : data.overall >= 40 ? '#F59E0B' : '#22C55E'}
                  strokeWidth={2.5} dot={{ r: 5, fill: 'white', strokeWidth: 2.5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-end">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="w-6 h-0.5 bg-gray-300 border-dashed border-t-2 border-gray-300" />
                전교 평균
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <div className="w-6 h-0.5 bg-yellow-400" />
                내 지수
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
