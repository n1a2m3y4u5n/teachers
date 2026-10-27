# Teachers

교사의 행정, 소통, 보호 업무를 돕는 AI 포털입니다.

## 소개

공문, 가정통신문, 수업 지도안 같은 행정 문서 작성부터 학부모 민원 대응, 교권 보호 문서 작성까지 교사의 반복 업무를 Claude API로 돕는 웹 서비스입니다. 생성한 결과와 민원, 상담, 학생 기록은 서버의 SQLite 데이터베이스에 저장합니다.

## 주요 기능

사이드바 기준 네 개 영역입니다.

- 행정 AI: 공문 초안, 가정통신문, 수업 지도안, 수행평가 루브릭, 교육자료 찾기, 마감 캘린더
- 소통 AI: 학부모 민원 분류와 답변 초안, 학부모 상담, 역방향 메시지(교사가 학부모에게 보내는 글)
- 보호 AI: 번아웃 지수, 교권 보호 법적 문서(경위서, 증거 자료 목록, 교권보호위원회 신고 초안), 학교 건강 지수
- 학생 관리: 익명 자기보고, 출결 이상 감지, 성장 리포트
- 대시보드: 처리 대기 민원 등 현황 요약
- NEIS 연동: 급식, 학사일정 조회 (`lib/neis.ts`)

## 기술

- Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts
- 데이터베이스: SQLite (better-sqlite3)
- AI: Anthropic SDK (스트리밍 응답)
- 배포: Docker, fly.io (도쿄, 볼륨에 DB 저장)

## 실행 방법

`.env.local`에 키를 설정합니다.

```
ANTHROPIC_API_KEY=
NEIS_API_KEY=          # 선택: 급식, 학사일정 조회
DB_PATH=               # 선택: 기본값은 프로젝트 루트의 teachers.db
```

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start
npm run lint
```

처음 실행하면 데이터베이스 스키마가 만들어지고, 비어 있으면 화면 확인용 샘플 데이터가 들어갑니다.
