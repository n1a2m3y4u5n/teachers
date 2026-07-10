import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '@/lib/claude';
import getDb from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(req: NextRequest) {
  const { subject, grade, unit, evalType, elements, gradeScale } = await req.json();

  const userPrompt = `교과: ${subject}
학년: ${grade}학년
단원: ${unit}
평가 유형: ${evalType}
평가 요소: ${Array.isArray(elements) ? elements.join(', ') : elements}
점수 체계: ${gradeScale ?? '4단계'}

위 조건으로 수행평가 루브릭을 마크다운 표 형식으로 작성해 주세요.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';
      try {
        const aiStream = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          system: SYSTEM_PROMPTS.rubric,
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
            .run('rubric', `${grade}학년 ${subject} ${evalType}`, unit, fullText);
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
    const docs = db.prepare(`SELECT * FROM documents WHERE type = 'rubric' ORDER BY created_at DESC LIMIT 10`).all();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([]);
  }
}
