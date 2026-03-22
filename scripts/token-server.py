#!/usr/bin/env python3
"""
OpenClaw Token Server
실시간 sessions.json 데이터를 HTTP로 제공한다.

실행: python3 scripts/token-server.py
접속: http://[Mac IP]:8789/tokens
"""

import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

PORT = 8789

# 대시보드 서버 URL 입력창에 ?token=값 으로 함께 전달
# 예: http://192.168.x.x:8789  →  토큰은 아래 값과 일치해야 함
# 변경하려면 이 값과 대시보드 저장 URL을 함께 바꿀 것
SECRET_TOKEN = "openclaw-dashboard"

AGENTS = [
    {"id": "gary",  "agentId": "main",    "emoji": "🐍", "name": "개리", "englishName": "Gary",  "role": "기술 검토 · 설계 결정", "model": "github-copilot/gpt-4o",        "color": "#6ee7b7", "contextTokens": 64000},
    {"id": "judy",  "agentId": "develop", "emoji": "🐰", "name": "주디", "englishName": "Judy",  "role": "기능 구현 · 코드 작성", "model": "ollama/qwen2.5-coder:14b",     "color": "#a78bfa", "contextTokens": 65536},
    {"id": "nick",  "agentId": "admin",   "emoji": "🦊", "name": "닉",   "englishName": "Nick",  "role": "일정 관리 · 진행 추적", "model": "ollama/llama3.1:8b",           "color": "#fbbf24", "contextTokens": 32768},
]

BASE = Path.home() / ".openclaw" / "agents"


def get_token_data():
    result = []
    for agent in AGENTS:
        sessions_file = BASE / agent["agentId"] / "sessions" / "sessions.json"
        input_tokens = output_tokens = total_tokens = updated_at = 0
        context_tokens = agent["contextTokens"]

        if sessions_file.exists():
            try:
                data = json.loads(sessions_file.read_text(encoding="utf-8"))
                for key, session in data.items():
                    if not key.startswith("agent:"):
                        continue
                    input_tokens  += session.get("inputTokens")  or 0
                    output_tokens += session.get("outputTokens") or 0
                    ua = session.get("updatedAt") or 0
                    if ua > updated_at:
                        updated_at     = ua
                        total_tokens   = session.get("totalTokens")   or 0
                        context_tokens = session.get("contextTokens") or agent["contextTokens"]
            except Exception:
                pass

        result.append({**agent, "inputTokens": input_tokens, "outputTokens": output_tokens,
                       "totalTokens": total_tokens, "contextTokens": context_tokens,
                       "updatedAt": updated_at})

    return {"updatedAt": int(time.time() * 1000), "agents": result}


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/tokens"):
            # 토큰 인증
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(self.path).query)
            provided = query.get("token", [None])[0]
            if provided != SECRET_TOKEN:
                self.send_response(401)
                self._cors()
                self.end_headers()
                return

            body = json.dumps(get_token_data(), ensure_ascii=False).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self._cors()
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")

    def log_message(self, fmt, *args):
        pass  # 로그 억제


if __name__ == "__main__":
    import socket
    hostname = socket.gethostname()
    try:
        local_ip = socket.gethostbyname(hostname)
    except Exception:
        local_ip = "127.0.0.1"

    server = HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Token server started")
    print(f"  로컬:    http://localhost:{PORT}/tokens")
    print(f"  네트워크: http://{local_ip}:{PORT}/tokens")
    print(f"  대시보드 서버 URL에 http://{local_ip}:{PORT} 을 입력하세요")
    server.serve_forever()
