import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '@/lib/claude';
import getDb from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(req: NextRequest) {
  const { type, content, recipient, title } = await req.json();

  const userPrompt = `공문 종류: ${type}
수신처: ${recipient ?? '[수신처 미입력]'}
제목: ${title ?? '[제목 미입력]'}
핵심 내용: ${content}

위 정보를 바탕으로 교육 행정 공문 초안을 작성해 주세요.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';
      try {
        const aiStream = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: SYSTEM_PROMPTS.document,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const chunk of aiStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // DB 저장
        try {
          const db = getDb();
          db.prepare(`INSERT INTO documents (type, title, input_summary, content) VALUES (?, ?, ?, ?)`)
            .run('document', title ?? type, content.slice(0, 100), fullText);
        } catch {}

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  });
}

export async function GET() {
  try {
    const db = getDb();
    const docs = db.prepare(`SELECT * FROM documents WHERE type = 'document' ORDER BY created_at DESC LIMIT 10`).all();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([]);
  }
}
