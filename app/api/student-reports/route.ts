import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const reports = db.prepare(`SELECT * FROM student_reports ORDER BY created_at DESC`).all();
    return NextResponse.json(reports);
  } catch {
    return NextResponse.json([]);
  }
}
