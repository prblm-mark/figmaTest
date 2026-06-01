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

    # Stronger reminder for template builds: the "layout-only" framing
    # makes it easy to skip the get_design_context fetch on the template
    # root and write shell paint values (bg / padding / gap) from
    # intuition. Concrete mistake: ControlScreen body bg + page padding
    # (2026-06-01).
    template_triggers = [
        r"\btemplate\b",
        r"\b(screen|dashboard|landing|home page|home screen)\b",
        r"\bsrc/(cc/)?templates/",
    ]
    is_template = any(re.search(p, prompt, re.IGNORECASE) for p in template_triggers)

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
        if is_template:
            msg += (
                "\n\n[template-shell rule] This looks like a Tier=Template build. "
                "Source-of-truth rule #5 + Step 3a apply: the template SHELL "
                "(body bg, page-content bg/padding/gap, section frames) is "
                "Figma-bound exactly like any component property. Call "
                "`get_design_context` on the template root frame and build the "
                "shell-paint-values table BEFORE writing any shell CSS. Values "
                "written from a plan-mode write-up or visual intuition are "
                "unverified by definition. See memory: "
                "feedback_template_shell_is_figma_too.md."
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
