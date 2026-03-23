#!/usr/bin/env python3
"""
Read ~/.openclaw/agents/*/sessions/sessions.json and write src/data/tokens.json.
Run this locally or via a self-hosted GitHub Actions runner.
"""

import json
import os
import time
from pathlib import Path

AGENTS = [
    {
        "id": "gary",
        "agentId": "main",
        "emoji": "🐍",
        "name": "개리",
        "englishName": "Gary",
        "role": "기술 검토 · 설계 결정",
        "model": "github-copilot/gpt-4o",
        "color": "#6ee7b7",
    },
    {
        "id": "judy",
        "agentId": "develop",
        "emoji": "🐰",
        "name": "주디",
        "englishName": "Judy",
        "role": "기능 구현 · 코드 작성",
        "model": "ollama/qwen2.5-coder:14b",
        "color": "#a78bfa",
    },
    {
        "id": "nick",
        "agentId": "admin",
        "emoji": "🦊",
        "name": "닉",
        "englishName": "Nick",
        "role": "일정 관리 · 진행 추적",
        "model": "ollama/llama3.1:8b",
        "color": "#fbbf24",
    },
]

BASE = Path.home() / ".openclaw" / "agents"


def load_agent(agent):
    sessions_file = BASE / agent["agentId"] / "sessions" / "sessions.json"
    if not sessions_file.exists():
        print(f"  [WARN] {sessions_file} not found, skipping")
        return None

    with open(sessions_file, encoding="utf-8") as f:
        data = json.load(f)

    input_tokens = 0
    output_tokens = 0
    total_tokens = 0
    context_tokens = 32768
    updated_at = 0

    for key, session in data.items():
        if not key.startswith("agent:"):
            continue
        input_tokens += session.get("inputTokens") or 0
        output_tokens += session.get("outputTokens") or 0
        tt = session.get("totalTokens") or 0
        ct = session.get("contextTokens") or 32768
        ua = session.get("updatedAt") or 0
        if ua > updated_at:
            updated_at = ua
            total_tokens = tt
            context_tokens = ct

    return {
        **agent,
        "inputTokens": input_tokens,
        "outputTokens": output_tokens,
        "totalTokens": total_tokens,
        "contextTokens": context_tokens,
        "updatedAt": updated_at,
    }


def main():
    result = []
    latest_at = 0

    for agent in AGENTS:
        print(f"Processing {agent['agentId']}...")
        entry = load_agent(agent)
        if entry:
            result.append(entry)
            if entry["updatedAt"] > latest_at:
                latest_at = entry["updatedAt"]
            print(f"  input={entry['inputTokens']}, output={entry['outputTokens']}, total={entry['totalTokens']}")

    out = Path(__file__).parent.parent / "public" / "data" / "tokens.json"
    out.parent.mkdir(parents=True, exist_ok=True)

    payload = {"updatedAt": int(time.time() * 1000), "agents": result}
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"\nWritten to {out}")


if __name__ == "__main__":
    main()
