# 일정비서 사업 대시보드

일정비서 사업의 전체 진행 상황을 추적하는 모니터링 대시보드

## 기능

- 📊 사업 준비 & 개발 트랙 병렬 진행률 표시
- ✅ 상세 체크리스트 (완료/진행중/블록/대기)
- 💰 비용 및 유저 메트릭 추적
- 📈 성장 분석 대시보드 (주간 MAU, Activation, D30 Retention)
- 🚀 온보딩 퍼널 분석 및 개선 전/후 지표 추적
- ⚠️ 블로커 로그 및 타임라인
- 🎯 단계별 마일스톤 (MVP → 성장 → 스케일)

## 기술 스택

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Vercel** - 배포

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 데이터 업데이트

`data/progress.json` 파일을 직접 수정하여 진행 상황을 업데이트할 수 있습니다.
성장 분석 이벤트는 `data/analytics-events.json`에서 관리됩니다.
온보딩 개선 실험 결과는 `data/activation-improvements.json`에서 관리됩니다.

### 태스크 상태 변경

```json
{
  "id": "prep-1",
  "title": "사업자 등록",
  "status": "completed",  // "pending" | "in_progress" | "blocked" | "completed"
  "completedAt": "2025-01-31"
}
```

### 메트릭 업데이트

```json
{
  "metrics": {
    "costs": {
      "invested": 150000,
      "revenue": 0,
      "balance": -150000
    },
    "users": {
      "signups": 5,
      "paid": 2,
      "churned": 0
    }
  }
}
```

### 블로커 추가

```json
{
  "blockers": [
    {
      "date": "2025-01-31",
      "title": "카카오 템플릿 승인 지연",
      "description": "문구 수정 후 재심사 필요",
      "affectedTasks": ["prep-4"],
      "resolved": false
    }
  ]
}
```

### 성장 분석 이벤트 포맷

```json
{
  "eventName": "signup_completed",
  "userId": "u100",
  "occurredAt": "2026-03-01T10:00:00.000Z",
  "source": "web",
  "properties": {
    "channel": "seo",
    "plan": "free"
  }
}
```

Taxonomy:
- `landing_viewed` (acquisition)
- `signup_completed` (acquisition)
- `first_query_completed` (activation)
- `session_started` (engagement)
- `query_executed` (retention)

## Analytics API

- `GET /api/analytics`: 성장 지표 + taxonomy + 최근 이벤트 조회
- `POST /api/analytics`: 이벤트 적재 (taxonomy 기반 필수 속성 검증)

## SEO Foundation

- Intent index: `/bitcoin`
- Intent landing pages: `/bitcoin/[slug]`
  - `bitcoin-address-lookup`
  - `bitcoin-fee-estimator`
  - `mempool-congestion-tracker`
  - `bitcoin-transaction-tracker`
  - `bitcoin-whale-alerts`
- Technical SEO:
  - `app/sitemap.ts` (자동 sitemap.xml 생성)
  - `app/robots.ts` (크롤러 정책 + sitemap 연결)
- Performance guardrails:
  - LCP <= 2.5s
  - INP <= 200ms
  - CLS <= 0.1
  - Initial JS <= 200KB gzip

## 배포

Vercel로 자동 배포됩니다.

```bash
# Vercel CLI 설치 (선택사항)
npm i -g vercel

# 배포
vercel --prod
```

## 라이선스

Private - 일정비서 프로젝트 전용
