import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(req: NextRequest) {
  const { incidentDate, incidentTime, location, persons, messages, additionalStatement, docType } = await req.json();

  const systemPrompt = `당신은 교사 교권 보호 법률 전문 AI입니다.
교원지위법, 아동복지법 관련 조항을 인용하여 다음 문서를 작성하세요:
- 사실 중심, 감정적 표현 배제
- 날짜·장소·발언 내용 정확히 기재
- 법적 근거 조항 명시
- 작성 형식: [초안] 워터마크 첫 줄에 표시`;

  const docTypeLabel = docType === 'report' ? '경위서' : docType === 'evidence' ? '증거 자료 목록' : '교권보호위원회 신고 초안';

  const userPrompt = `문서 유형: ${docTypeLabel}
발생 일시: ${incidentDate} ${incidentTime}
장소: ${location}
관련 당사자: ${persons}
관련 메시지/내용: ${messages}
추가 진술: ${additionalStatement ?? '없음'}

위 내용으로 ${docTypeLabel}을 작성해 주세요.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const chunk of aiStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
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
