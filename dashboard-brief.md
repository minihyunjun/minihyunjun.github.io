# OpenClaw Dashboard 개선 작업 브리핑

## 개요

GitHub Pages에 배포된 OpenClaw 에이전트 토큰 모니터링 대시보드를 개선한다.
현준님 요청: **신기능 추가 + UI 개선**

- **레포:** `github.com/minihyunjun/minihyunjun.github.io`
- **배포 URL:** `https://minihyunjun.github.io/dashboard/`
- **스택:** Astro 4.15, 순수 HTML/CSS/JS (외부 라이브러리 없음)
- **페이지:** `src/pages/index.astro` (로그인), `src/pages/dashboard.astro` (대시보드)

---

## 현재 상태 및 문제점

### 구조

```
src/pages/
├── index.astro      # 패스워드 로그인 (SHA-256 hash 비교)
└── dashboard.astro  # 에이전트 토큰 현황
```

### 현재 기능

- 에이전트 3명(개리/주디/닉) 총 토큰 합산 표시
- 에이전트별 바 차트
- 에이전트별 카드 (토큰 수, 비율)

### 핵심 문제: 토큰 데이터 하드코딩

```js
// dashboard.astro — 빌드 시점에 고정된 값, 실제 데이터가 아님
const agents = [
  { id: 'gary',  tokens: 231426 },
  { id: 'judy',  tokens: 364044 },
  { id: 'nick',  tokens: 493374 },
];
```

---

## 요청 작업

### 1. 토큰 데이터 자동화 (최우선)

현재 하드코딩된 토큰 값을 실제 `sessions.json` 기반으로 자동 갱신되도록 구성한다.

**방안:** GitHub Actions 워크플로우 추가

- 트리거: 수동 dispatch + 매일 자동 실행 (cron)
- 동작: `~/.openclaw/agents/*/sessions/sessions.json` 읽어서 `src/data/tokens.json` 생성 후 커밋
- 대시보드는 빌드 시 `tokens.json`을 import해서 사용

읽어야 할 필드 (sessions.json 기준):

```json
{
  "inputTokens": 24677,
  "outputTokens": 101,
  "totalTokens": 11228,
  "contextTokens": 32768,
  "updatedAt": 1774160314606
}
```

단, sessions.json에는 여러 세션 키가 있으므로 같은 에이전트의 세션을 합산해야 함.
세션 키 패턴: `agent:admin:*`, `agent:main:*`, `agent:develop:*`

### 2. 표시 데이터 확장

현재 총 토큰만 보여주는 것을 아래 항목으로 확장:

| 항목 | 설명 | 소스 필드 |
|------|------|-----------|
| Input tokens | 입력 토큰 | `inputTokens` |
| Output tokens | 출력 토큰 | `outputTokens` |
| 컨텍스트 사용률 | `totalTokens / contextTokens * 100` (%) | `totalTokens`, `contextTokens` |
| 마지막 활동 | `updatedAt` → 한국 시간 포맷 | `updatedAt` |
| 사용 모델 | 에이전트별 모델명 | 하드코딩 가능 |

모델 정보 (하드코딩):
- 개리: `github-copilot/gpt-4o`
- 주디: `ollama/qwen2.5-coder:14b`
- 닉: `ollama/llama3.1:8b`

### 3. 다크/라이트 모드 지원

- 기본값: 시스템 설정 따름 (`prefers-color-scheme`)
- 헤더에 토글 버튼 추가 (수동 전환)
- 선택값 `localStorage`에 저장 (새로고침 후에도 유지)
- 적용 범위: `index.astro`(로그인 페이지) + `dashboard.astro` 양쪽 모두
- CSS 변수로 색상 토큰 관리 (`--bg`, `--surface`, `--border`, `--text` 등)

라이트 모드 참고 팔레트:
```
--bg: #f5f5f5
--surface: #ffffff
--border: #e0e0e0
--text: #1a1a1a
--text-muted: #6b6b6b
```

### 4. UI 개선

- 에이전트 카드에 input/output 토큰 분리 표시
- 컨텍스트 사용률 progress bar 추가 (카드 내)
- 마지막 활동 시간 표시 ("3시간 전" 형식 권장)
- 모델명 뱃지 표시
- 모바일 레이아웃 개선 (현재 카드가 좁은 화면에서 깨짐)

---

## 제약 조건

- **정적 사이트** (GitHub Pages) — 런타임 서버 없음
- 외부 라이브러리 추가는 최소화 (현재 zero-dependency)
- 기존 다크 테마 + 디자인 시스템 유지
- 로그인 방식(SHA-256 패스워드) 변경 없음

---

## 역할 분담 제안

- **개리:** 아키텍처 검토, GitHub Actions 워크플로우 설계, PR 리뷰
- **주디:** 실제 구현 (Actions 워크플로우, dashboard.astro 수정, UI, 다크/라이트 모드)

---

## 참고 파일 경로

```
~/.openclaw/agents/main/sessions/sessions.json      # 개리 세션
~/.openclaw/agents/develop/sessions/sessions.json   # 주디 세션
~/.openclaw/agents/admin/sessions/sessions.json     # 닉 세션
```
