'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { useEffect, useState } from 'react';
import { BarChart2, User } from 'lucide-react';

interface AttendanceRecord {
  studentName: string;
  grade: number;
  classNum: number;
  absenceDays: number;
  lateDays: number;
  pattern: string;
  riskLevel: 'high' | 'medium' | 'low';
  lastDate: string;
}

const RISK_CONFIG = {
  high: { label: '고위험', className: 'bg-red-100 text-danger', icon: '🔴' },
  medium: { label: '주의', className: 'bg-yellow-100 text-warning', icon: '🟡' },
  low: { label: '관찰', className: 'bg-green-100 text-success', icon: '🟢' },
};

export default function AttendancePage() {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<{ totalAbsence: number; highRisk: number; mediumRisk: number } | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [filter, setFilter] = useState<string>('전체');

  useEffect(() => {
    fetch('/api/attendance')
      .then(r => r.json())
      .then(d => { setData(d.data); setSummary(d.summary); setIsMock(d.isMock); })
      .catch(() => {});
  }, []);

  const filtered = filter === '전체' ? data : data.filter(d => d.riskLevel === filter.toLowerCase());

  return (
    <PageContainer title="출결 이상 패턴 감지">
      <div className="max-w-5xl mx-auto space-y-5">
        {isMock && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
            <span className="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded">데모 데이터</span>
            <span className="text-xs text-text-secondary">NEIS_API_KEY 설정 시 실제 출결 데이터가 연동됩니다</span>
          </div>
        )}

        {/* 요약 통계 */}
        {summary && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '총 결석일수', value: summary.totalAbsence, color: 'text-text-primary', bg: 'bg-white' },
              { label: '고위험 학생', value: summary.highRisk, color: 'text-danger', bg: 'bg-red-50' },
              { label: '주의 학생', value: summary.mediumRisk, color: 'text-warning', bg: 'bg-yellow-50' },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} rounded-xl border border-border shadow-card p-4 text-center`}>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* 필터 */}
        <div className="flex gap-2">
          {['전체', '고위험', '주의', '관찰'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                filter === f ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-gray-50 grid grid-cols-6 gap-3 text-xs font-medium text-text-muted">
            <div className="col-span-2">학생</div>
            <div className="text-center">결석일수</div>
            <div className="text-center">지각일수</div>
            <div>패턴</div>
            <div className="text-center">위험도</div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((r, i) => {
              const risk = RISK_CONFIG[r.riskLevel];
              return (
                <div key={i} className={`px-5 py-3.5 grid grid-cols-6 gap-3 items-center hover:bg-gray-50 transition-colors ${r.riskLevel === 'high' ? 'bg-red-50/40' : ''}`}>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{r.studentName}</div>
                      <div className="text-xs text-text-muted">{r.grade}학년 {r.classNum}반</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-bold ${r.absenceDays >= 3 ? 'text-danger' : 'text-text-primary'}`}>
                      {r.absenceDays}일
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-bold ${r.lateDays >= 5 ? 'text-warning' : 'text-text-primary'}`}>
                      {r.lateDays}회
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary bg-gray-100 px-2 py-0.5 rounded">{r.pattern}</span>
                  </div>
                  <div className="flex justify-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${risk.className}`}>
                      {risk.icon} {risk.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-border shadow-card py-12 text-center">
            <BarChart2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-text-muted">해당 조건의 학생이 없습니다</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
