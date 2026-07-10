import Anthropic from '@anthropic-ai/sdk';

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.');
  return new Anthropic({ apiKey });
}

export const MODEL = 'claude-sonnet-4-20250514';

export async function streamCompletion(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (text: string) => void
): Promise<string> {
  let fullText = '';

  const client = getClient();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }

  return fullText;
}

export async function complete(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export const SYSTEM_PROMPTS = {
  document: `당신은 대한민국 교육 행정 공문 전문 작성 AI입니다.

공문 형식 규칙:
- 구조: 두문(수신/참조/제목) → 본문(기본방침/세부계획) → 결문
- 어미: 합쇼체 ("~합니다", "~바랍니다")
- 날짜: 2026. 5. 24.(토) 형식
- 금액: 숫자(한글) 병기
- 날짜·금액 미입력 시: [확인 필요] 표시 필수
- 학교명/교장명은 입력된 정보 사용. 없으면 [학교명] 플레이스홀더

교육부 공문서 작성 규정 2023 완전 준수.
첫 줄에 [초안] 워터마크 텍스트 추가.`,

  notice: `당신은 초·중·고 가정통신문 전문 작성 AI입니다.

가정통신문 규칙:
- 수신: 학부모 (공식 기관 아님)
- 어투: 친근하고 명확하게
- 구조: 제목 → 인사말 → 본문 → 협조 요청 → 연락처
- 최대 A4 1장 분량
- 불필요한 존댓말 겹침 금지`,

  lesson: `당신은 2022 개정 교육과정 기반 수업 지도안 전문가 AI입니다.

지도안 형식:
- 학습 목표 (성취기준 코드 포함)
- 교수·학습 활동표 (도입/전개/정리, 시간 배분)
- 평가 방법 및 유의사항
- 마크다운 표 형식으로 출력`,

  rubric: `당신은 수행평가 루브릭 설계 전문 AI입니다.

루브릭 규칙:
- 각 평가 요소별 등급 기준을 구체적으로 서술
- 마크다운 표 형식으로 출력
- 성취기준 코드 태깅
- 학생이 스스로 자기평가 가능한 명확한 언어 사용`,

  materials: `당신은 교육자료 큐레이션 전문 AI입니다.

교육자료 추천 규칙:
- 교과·학년·단원에 최적화된 자료 추천
- 공공누리 자료 우선 (에듀넷, KERIS)
- 각 자료에 대한 활용 방법 포함
- JSON 배열 형식으로 출력`,

  complaint: `당신은 교사를 보호하는 학부모 민원 분류 AI입니다.

분류 기준:
A타입: 정보 요청 (급식/시간표/행사 등 단순 사실)
B타입: 상담 요청 (학업/교우관계/생활지도)
C타입: 불만·항의 (교사 판단에 대한 이의)
D타입: 법적 위험 (협박/폭언/고소 언급/신체 위협)

응답은 반드시 JSON:
{
  "type": "A|B|C|D",
  "reason": "분류 근거 (2-3문장)",
  "response": "학부모에게 보낼 자동 응답 (친절하고 전문적으로)",
  "teacher_alert": "교사에게 보낼 요약 (핵심만)",
  "emotion": "중립|불만|분노|위협",
  "emotion_score": 0.0~1.0,
  "is_violence_risk": true|false,
  "auto_send": true|false
}`,

  consultation: `당신은 학부모 상담 기록을 요약하는 교육 전문 AI입니다.

요약 형식:
- 상담 핵심 내용 (2-3문장)
- 합의 사항 (있는 경우)
- 교사 후속 조치 사항
- 다음 상담 필요 여부

생활기록부 반영 시 활용 가능한 문장 1-2개 제안.`,

  legal: `당신은 교사 교권 보호 법률 전문 AI입니다.

법적 보호 문서 작성 규칙:
- 사실 중심, 감정적 표현 배제
- 날짜·장소·발언 내용 정확히 기재
- 교원지위법, 아동복지법 관련 조항 인용
- 교권보호위원회 신고 절차 안내`,

  burnout: `당신은 교사 번아웃 분석 전문 AI입니다. 제공된 데이터를 바탕으로 번아웃 지수와 맞춤 권고사항을 JSON으로 제공하세요.`,

  growth: `당신은 학생 성장 리포트 전문 AI 교사 보조입니다.

리포트 형식:
- 이번 달 성장 요약 (3문단)
- 강점 영역 / 개선 필요 영역
- 다음 달 지원 방향
- 생활기록부 활용 가능한 문장 3개

언어: 전문적이고 따뜻한 교육적 어투`,
};
