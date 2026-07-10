import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '@/lib/claude';
import getDb from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(req: NextRequest) {
  const { content } = await req.json();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPTS.complaint,
      messages: [{ role: 'user', content: `민원 내용:\n${content}` }],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const result = JSON.parse(text);

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO complaints (content, complaint_type, reason, response, emotion, emotion_score, is_violence_risk, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const { lastInsertRowid } = stmt.run(
      content,
      result.type,
      result.reason,
      result.response,
      result.emotion,
      result.emotion_score,
      result.is_violence_risk ? 1 : 0,
      result.auto_send ? 'completed' : 'pending'
    );

    // D타입이면 알림 생성
    if (result.type === 'D') {
      db.prepare(`
        INSERT INTO teacher_notifications (type, title, summary, related_id)
        VALUES ('complaint', '새 D타입 민원 접수', ?, ?)
      `).run(result.teacher_alert, lastInsertRowid);
    }

    return NextResponse.json({ id: lastInsertRowid, ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '분류 실패' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const complaints = db.prepare(`SELECT * FROM complaints ORDER BY created_at DESC LIMIT 50`).all();
    return NextResponse.json(complaints);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PATCH(req: NextRequest) {
  const { id, status, teacher_response } = await req.json();
  try {
    const db = getDb();
    db.prepare(`UPDATE complaints SET status = ?, teacher_response = ? WHERE id = ?`)
      .run(status, teacher_response, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '업데이트 실패' }, { status: 500 });
  }
}
