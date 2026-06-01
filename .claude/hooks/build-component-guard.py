#!/usr/bin/env python3
"""
PreToolUse hook — deny Write/Edit/NotebookEdit on files under
src/(components|patterns|templates)/ unless Skill(skill="build-component")
has been invoked in this session's transcript. See CLAUDE.md §0.
"""
import json
import os
import re
import sys


def skill_invoked(transcript_path: str) -> bool:
    if not transcript_path or not os.path.isfile(transcript_path):
        return False
    try:
        with open(transcript_path, encoding="utf-8") as f:
            for line in f:
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                content = (obj.get("message") or {}).get("content", [])
                if not isinstance(content, list):
                    continue
                for item in content:
                    if (
                        isinstance(item, dict)
                        and item.get("type") == "tool_use"
                        and item.get("name") == "Skill"
                        and ((item.get("input") or {}).get("skill") == "build-component")
                    ):
                        return True
    except Exception:
        return False
    return False


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    tool_name = data.get("tool_name") or ""
    if tool_name not in ("Write", "Edit", "NotebookEdit"):
        return 0

    file_path = (data.get("tool_input") or {}).get("file_path") or ""
    if not re.search(r"/src/(components|patterns|templates)/", file_path):
        return 0

    if skill_invoked(data.get("transcript_path") or ""):
        return 0

    reason = (
        "DENIED by .claude/hooks/build-component-guard.py: edits under "
        "src/(components|patterns|templates)/ require invoking the /build-component "
        "skill first. Call Skill(skill=\"build-component\") and follow every step "
        "(1-11) of .claude/commands/build-component.md — no corner-cutting. "
        "See CLAUDE.md §0."
    )
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
