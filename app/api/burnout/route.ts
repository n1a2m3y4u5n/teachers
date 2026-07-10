import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const pendingComplaints = (db.prepare(`SELECT COUNT(*) as cnt FROM complaints WHERE status = 'pending'`).get() as { cnt: number }).cnt;
    const dComplaints = (db.prepare(`SELECT COUNT(*) as cnt FROM complaints WHERE complaint_type = 'D'`).get() as { cnt: number }).cnt;
    const cComplaints = (db.prepare(`SELECT COUNT(*) as cnt FROM complaints WHERE complaint_type = 'C'`).get() as { cnt: number }).cnt;
    const recentDocs = (db.prepare(`SELECT COUNT(*) as cnt FROM documents WHERE created_at > datetime('now', '-7 days')`).get() as { cnt: number }).cnt;
    const pendingReports = (db.prepare(`SELECT COUNT(*) as cnt FROM student_reports WHERE status = 'pending'`).get() as { cnt: number }).cnt;

    // 번아웃 지수 계산 (0~100)
    const complaintStress = Math.min(100, (dComplaints * 25 + cComplaints * 10 + pendingComplaints * 5));
    const adminBurden = Math.max(0, 40 - recentDocs * 5);
    const studentIssue = Math.min(100, pendingReports * 15);
    const overallScore = Math.round((complaintStress * 0.4 + adminBurden * 0.3 + studentIssue * 0.3));
    const clampedScore = Math.min(100, Math.max(15, overallScore));

    // 주간 트렌드 (Mock)
    const weeklyTrend = [
      { week: '4주 전', score: Math.max(10, clampedScore - 18) },
      { week: '3주 전', score: Math.max(10, clampedScore - 12) },
      { week: '2주 전', score: Math.max(10, clampedScore - 5) },
      { week: '이번 주', score: clampedScore },
    ];

    return NextResponse.json({
      overall: clampedScore,
      components: {
        complaintStress: Math.min(100, complaintStress),
        adminBurden: Math.min(100, adminBurden + 20),
        studentIssue: Math.min(100, studentIssue + 20),
        pendingWork: Math.min(100, pendingComplaints * 12 + 20),
      },
      weeklyTrend,
      averageScore: 52,
      recommendation: clampedScore >= 70
        ? `최근 D타입 민원 ${dComplaints}건, 미처리 업무 누적. 학교 상담사 연결을 권장합니다.`
        : clampedScore >= 40
        ? '번아웃 주의 단계입니다. 미처리 민원을 우선 처리하고 휴식을 취하세요.'
        : '번아웃 지수가 안정적입니다. 지금의 균형을 유지하세요.',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 });
  }
}
