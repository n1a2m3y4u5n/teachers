import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '@/lib/claude';
import getDb from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(req: NextRequest) {
  const { studentName, period, attendanceNotes, behaviorNotes, academicNotes } = await req.json();

  const userPrompt = `학생명: ${studentName}
기간: ${period}
출결 특이사항: ${attendanceNotes ?? '특이사항 없음'}
행동 관찰 메모: ${behaviorNotes ?? '특이사항 없음'}
학습 성취 메모: ${academicNotes ?? '특이사항 없음'}

위 내용을 바탕으로 학생 성장 리포트를 작성해 주세요.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';
      try {
        const aiStream = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: SYSTEM_PROMPTS.growth,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const chunk of aiStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        try {
          const db = getDb();
          db.prepare(`
            INSERT INTO student_growth (student_name, period, attendance_notes, behavior_notes, academic_notes, ai_report)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(studentName, period, attendanceNotes, behaviorNotes, academicNotes, fullText);
        } catch {}

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function GET() {
  try {
    const db = getDb();
    const records = db.prepare(`SELECT * FROM student_growth ORDER BY created_at DESC LIMIT 20`).all();
    return NextResponse.json(records);
  } catch {
    return NextResponse.json([]);
  }
}
