'use client';

import { PageContainer } from '@/components/Layout/PageContainer';
import { useEffect, useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface ScheduleItem {
  date: string;
  eventName: string;
  isHoliday: boolean;
}

const DEADLINE_EVENTS = [
  { date: '20260525', title: '학예회 안내 공문', urgency: 'high', daysLeft: 1 },
  { date: '20260531', title: '5월 행정 업무 보고', urgency: 'medium', daysLeft: 7 },
  { date: '20260610', title: '2학기 수업 지도안 제출', urgency: 'low', daysLeft: 17 },
  { date: '20260615', title: '학부모 상담 주간 준비', urgency: 'low', daysLeft: 22 },
];

export default function CalendarPage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    fetch('/api/neis?type=schedule')
      .then(r => r.json())
      .then(d => { setSchedule(d.data ?? []); setIsMock(d.isMock); })
      .catch(() => {});
  }, []);

  function formatDate(date: string) {
    return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
  }

  return (
    <PageContainer title="공문 마감 캘린더">
      <div className="max-w-5xl mx-auto">
        {isMock && (
          <div className="mb-5 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
            <span className="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded">데모 데이터</span>
            <span className="text-xs text-text-secondary">NEIS_API_KEY 설정 시 실제 학사일정이 연동됩니다</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* 마감 임박 업무 */}
          <div className="bg-white rounded-xl border border-border shadow-card">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              <h3 className="font-semibold text-text-primary text-sm">마감 임박 공문</h3>
            </div>
            <div className="divide-y divide-border">
              {DEADLINE_EVENTS.map(ev => (
                <div key={ev.title} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                    ev.urgency === 'high' ? 'bg-red-100' : ev.urgency === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <span className={`text-sm font-bold leading-none ${
                      ev.urgency === 'high' ? 'text-danger' : ev.urgency === 'medium' ? 'text-warning' : 'text-success'
                    }`}>D-{ev.daysLeft}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{ev.title}</div>
                    <div className="text-xs text-text-muted">{formatDate(ev.date)}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    ev.urgency === 'high' ? 'bg-red-100 text-danger' : ev.urgency === 'medium' ? 'bg-yellow-100 text-warning' : 'bg-green-100 text-success'
                  }`}>
                    {ev.urgency === 'high' ? '긴급' : ev.urgency === 'medium' ? '보통' : '여유'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 학사 일정 */}
          <div className="bg-white rounded-xl border border-border shadow-card">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-text-primary text-sm">이번 달 학사 일정</h3>
            </div>
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {schedule.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">학사 일정을 불러오는 중...</div>
              ) : (
                schedule.map((item, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{item.date.slice(6, 8)}일</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{item.eventName}</div>
                      <div className="text-xs text-text-muted">{formatDate(item.date)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
