import { NextResponse } from 'next/server';

// Mock 출결 데이터 (NEIS API 연동 또는 Mock)
export async function GET() {
  const mockData = [
    { studentName: '김민준', grade: 3, classNum: 2, absenceDays: 3, lateDays: 1, pattern: '연속결석', riskLevel: 'high', lastDate: '2026-05-22' },
    { studentName: '이서연', grade: 3, classNum: 2, absenceDays: 2, lateDays: 4, pattern: '지각 반복', riskLevel: 'medium', lastDate: '2026-05-24' },
    { studentName: '박지훈', grade: 3, classNum: 2, absenceDays: 1, lateDays: 0, pattern: '일반결석', riskLevel: 'low', lastDate: '2026-05-20' },
    { studentName: '최유나', grade: 3, classNum: 1, absenceDays: 5, lateDays: 2, pattern: '장기결석', riskLevel: 'high', lastDate: '2026-05-23' },
    { studentName: '정도현', grade: 3, classNum: 3, absenceDays: 0, lateDays: 6, pattern: '지각 반복', riskLevel: 'medium', lastDate: '2026-05-24' },
  ];

  return NextResponse.json({
    data: mockData,
    isMock: true,
    summary: {
      totalAbsence: mockData.reduce((s, d) => s + d.absenceDays, 0),
      highRisk: mockData.filter(d => d.riskLevel === 'high').length,
      mediumRisk: mockData.filter(d => d.riskLevel === 'medium').length,
    },
  });
}
