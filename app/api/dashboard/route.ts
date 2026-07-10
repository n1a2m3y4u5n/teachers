import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const notifications = db.prepare(`
      SELECT * FROM teacher_notifications ORDER BY created_at DESC LIMIT 10
    `).all();

    const pendingComplaints = db.prepare(`
      SELECT COUNT(*) as cnt FROM complaints WHERE status = 'pending'
    `).get() as { cnt: number };

    const todayConsultation = db.prepare(`
      SELECT * FROM consultations
      WHERE DATE(scheduled_at) = DATE('now')
      ORDER BY scheduled_at ASC LIMIT 1
    `).get();

    const pendingReports = db.prepare(`
      SELECT COUNT(*) as cnt FROM student_reports WHERE status = 'pending'
    `).get() as { cnt: number };

    const recentDocuments = db.prepare(`
      SELECT * FROM documents ORDER BY created_at DESC LIMIT 3
    `).all();

    return NextResponse.json({
      notifications,
      stats: {
        pendingComplaints: pendingComplaints.cnt,
        todayConsultation,
        pendingReports: pendingReports.cnt,
        recentDocuments,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 });
  }
}
