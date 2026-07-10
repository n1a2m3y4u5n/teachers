import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '@/lib/claude';
import getDb from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(req: NextRequest) {
  const { topic, tone, date, grade, language } = await req.json();

  const userPrompt = `가정통신문 내용: ${topic}
대상 학년: ${grade ?? '전학년'}
어투: ${tone ?? '친근한'}
관련 날짜: ${date ?? '[날짜 확인 필요]'}
${language && language !== 'ko' ? `번역 언어: ${language}` : ''}

위 정보로 가정통신문을 작성해 주세요.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';
      try {
        const aiStream = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: SYSTEM_PROMPTS.notice,
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
            .run('notice', topic.slice(0, 50), topic.slice(0, 100), fullText);
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
    const docs = db.prepare(`SELECT * FROM documents WHERE type = 'notice' ORDER BY created_at DESC LIMIT 10`).all();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([]);
  }
}
