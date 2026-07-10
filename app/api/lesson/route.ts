import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '@/lib/claude';
import getDb from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(req: NextRequest) {
  const { schoolLevel, grade, subject, unit, session, objectives, teachingStyle } = await req.json();

  const userPrompt = `학교급: ${schoolLevel}
학년: ${grade}학년
교과: ${subject}
단원명: ${unit}
차시: ${session ?? 1}차시
수업 방식: ${teachingStyle ?? '강의형'}
학습 목표: ${objectives ?? '(교육과정 기준 자동 설정)'}

위 정보로 1차시 분량의 수업 지도안 초안을 작성해 주세요. 마크다운 표 형식으로 작성하세요.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';
      try {
        const aiStream = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          system: SYSTEM_PROMPTS.lesson,
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
          db.prepare(`INSERT INTO documents (type, title, input_summary, content) VALUES (?, ?, ?, ?)`)
            .run('lesson', `${grade}학년 ${subject} ${unit}`, unit, fullText);
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
    const docs = db.prepare(`SELECT * FROM documents WHERE type = 'lesson' ORDER BY created_at DESC LIMIT 10`).all();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([]);
  }
}
