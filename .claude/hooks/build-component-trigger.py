#!/usr/bin/env python3
"""
UserPromptSubmit hook — detect component-build triggers and remind the
assistant to invoke the /build-component skill. See CLAUDE.md §0.
"""
import json
import re
import sys


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    prompt = data.get("prompt") or ""

    triggers = [
        r"\b(build|create|make|scaffold|implement|audit|refine|fix|update)\b[^\n]{0,80}\b(component|pattern|template)\b",
        r"figma\.com/(design|file)/",
        r"\bnode[-_]?id\b",
        r"\bsrc/(components|patterns|templates)/",
    ]

    if any(re.search(p, prompt, re.IGNORECASE) for p in triggers):
        msg = (
            "[harness reminder] Component-build trigger detected. You MUST invoke "
            "Skill(skill=\"build-component\") as your first action — before any Figma "
            "MCP call, file read, or edit. Follow every step of "
            ".claude/commands/build-component.md in order (1-11), all pre-flight "
            "checks, all STOP rules, every variant. No corner-cutting. Edits under "
            "src/(components|patterns|templates)/ are DENIED by "
            ".claude/hooks/build-component-guard.py until the skill is invoked."
        )
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": msg,
            }
        }))

    return 0


if __name__ == "__main__":
    sys.exit(main())
