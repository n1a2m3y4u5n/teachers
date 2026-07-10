import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(req: NextRequest) {
  const { subject, grade, unit, purpose } = await req.json();

  const systemPrompt = `당신은 교육자료 큐레이션 AI입니다. 요청에 맞는 교육자료를 JSON 배열로 추천하세요.
형식:
[
  {
    "title": "자료명",
    "source": "출처 (에듀넷/KERIS/EBS 등)",
    "type": "영상|문서|활동지|PPT|앱",
    "description": "자료 설명 2-3문장",
    "url": "실제 URL (없으면 null)",
    "license": "공공누리 1유형 등",
    "usage": "수업 활용 방법"
  }
]
5-7개 추천. JSON만 응답, 마크다운 코드블록 없이.`;

  const userPrompt = `교과: ${subject}, 학년: ${grade}학년, 단원: ${unit}, 목적: ${purpose ?? '수업 보조'}`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '[]';
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const materials = JSON.parse(text);
    return NextResponse.json(materials);
  } catch {
    // Mock 데이터 반환
    return NextResponse.json([
      {
        title: `${subject} ${unit} 개념 정리 영상`,
        source: 'EBS',
        type: '영상',
        description: `${grade}학년 ${subject} ${unit} 핵심 개념을 쉽게 설명한 교육 영상입니다. 수업 도입부 또는 예습·복습 자료로 활용 가능합니다.`,
        url: null,
        license: '공공누리 1유형',
        usage: '수업 도입 10분 활용 또는 가정학습 안내',
      },
      {
        title: `${unit} 단원 활동지`,
        source: '에듀넷',
        type: '활동지',
        description: `학생 참여 중심의 활동지로 그룹 토의 및 개인 정리에 활용할 수 있습니다.`,
        url: null,
        license: '공공누리 2유형',
        usage: '전개 활동 및 형성평가 대체',
      },
      {
        title: `${subject} 디지털 교과서`,
        source: 'KERIS',
        type: '문서',
        description: `2022 개정 교육과정 반영 디지털 교과서. 인터랙티브 콘텐츠 포함.`,
        url: null,
        license: '공공누리 1유형',
        usage: '수업 전 과정 활용',
      },
    ]);
  }
}
