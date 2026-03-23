# ZPD Dashboard

🤖 AI 에이전트 모니터링 대시보드. 토큰 사용량, 활동 시간, 칸반 보드를 한 곳에서 조회.

## 🛠 기술 스택

- **Astro 4.15** — 정적 사이트 생성
- **순수 HTML/CSS/JS** — 외부 UI 라이브러리 없음
- **GitHub Pages** — 자동 배포

## 💻 로컬 실행

```bash
npm install
npm run dev
```

## 🔄 토큰 데이터 갱신

```bash
python scripts/generate-tokens.py
```

`~/.openclaw/agents/*/sessions/` 데이터를 읽어 `public/data/tokens.json`을 생성한다.
생성 후 커밋하면 배포 시 반영된다.

## 📋 칸반 데이터

`public/data/kanban.json`을 직접 편집하거나 대시보드 UI에서 관리.

## 🚀 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드·배포한다.
