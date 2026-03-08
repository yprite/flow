# 기름값 헌터

근처 최저가 주유소와 전국 평균 유가를 빠르게 비교하는 웹 서비스입니다.

## 핵심 기능

- 현재 위치 또는 프리셋 지역 기준 주유소 최저가 검색
- 휘발유, 경유, 고급유, LPG 지원
- 가격순 / 거리순 정렬
- 브랜드 필터
- 전국 평균 유가 노출
- 네이버지도, 카카오맵, 티맵 바로가기
- SEO 랜딩: `/`, `/regions/[slug]`, `/gas-finder`
- 유입/행동 분석: 페이지뷰, 검색 실행, 결과 노출, 지도 클릭, 공유 클릭

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Vercel
- Upstash Redis REST API

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 필요한 환경변수

```bash
OPINET_API_KEY=your_opinet_api_key
KV_REST_API_URL=your_upstash_rest_url
KV_REST_API_TOKEN=your_upstash_rest_token
```

`/admin` 보호는 앱 내부 로그인 대신 Vercel의 프로젝트 보호 기능을 사용한다고 가정합니다.

## 주요 라우트

- `/`: 서비스 소개 및 SEO 랜딩
- `/gas-finder`: 실제 검색 화면
- `/regions/[slug]`: 지역 인텐트 페이지
- `/admin`: 유입/행동 분석 대시보드
- `/api/gas`: 근처 주유소 검색 API
- `/api/gas/average`: 전국 평균 유가 API
- `/api/news`: 유가 관련 뉴스 API
- `/api/analytics`: 분석 이벤트 적재 및 조회 API

## 분석 이벤트

- `search_executed`
- `results_rendered`
- `results_empty`
- `map_click`
- `share_click`
- `preset_location_loaded`

## SEO/공유 구성

- `app/sitemap.ts`
- `app/robots.ts`
- `app/opengraph-image.tsx`
- `app/twitter-image.tsx`

## 데이터 출처

- 한국석유공사 오피넷

## 라이선스

Private
