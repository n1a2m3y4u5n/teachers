import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '@/lib/claude';
import getDb from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';


export async function GET() {
  try {
    const db = getDb();
    const consultations = db.prepare(`SELECT * FROM consultations ORDER BY scheduled_at ASC`).all();
    return NextResponse.json(consultations);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  if (body.action === 'summarize') {
    const { id, notes } = body;
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPTS.consultation,
        messages: [{ role: 'user', content: `상담 기록:\n${notes}` }],
      });

      const summary = response.content[0].type === 'text' ? response.content[0].text : '';

      const db = getDb();
      db.prepare(`UPDATE consultations SET ai_summary = ?, status = 'completed', notes = ? WHERE id = ?`)
        .run(summary, notes, id);

      return NextResponse.json({ summary });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: '요약 실패' }, { status: 500 });
    }
  }

  // 새 상담 등록
  const { parent_name, student_name, scheduled_at, topic } = body;
  try {
    const db = getDb();
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO consultations (parent_name, student_name, scheduled_at, topic)
      VALUES (?, ?, ?, ?)
    `).run(parent_name, student_name, scheduled_at, topic);

    return NextResponse.json({ id: lastInsertRowid });
  } catch {
    return NextResponse.json({ error: '등록 실패' }, { status: 500 });
  }
}
