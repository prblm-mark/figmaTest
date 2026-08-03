#!/usr/bin/env python3
"""
UserPromptSubmit hook — detect component-build triggers and remind the
assistant to invoke the /build-component skill. See CLAUDE.md §0.

This hook is a REMINDER, not the enforcement. `build-component-guard.py`
independently denies Write/Edit under src/(components|patterns|templates)/
until the skill is invoked, whatever this hook decides. So a missed reminder
degrades to "the guard catches it", while a spurious reminder trains the
assistant to ignore a signal that should mean something — which is why the
matching below is deliberately narrower than "mentions the word component".
"""
import json
import re
import sys

# Talking *about* a skill is not a request to run it. Stripped before matching:
# "we use the stops when build-component is used" contains build + component
# and used to fire every time.
SKILL_SELF_REF = re.compile(
    r"/?\b(build-component|build-prototype|review-component|update-components"
    r"|pull-tokens|hub-job|publish-kb|lucide-fill)\b",
    re.IGNORECASE,
)

URL = re.compile(r"https?://\S+", re.IGNORECASE)

BUILD_VERB = r"(?:build|create|make|scaffold|implement|audit|refine|fix|update|componenti[sz]e)"
DS_NOUN = r"(?:components?|patterns?|templates?)"

SRC_PATH = re.compile(r"\bsrc/(components|patterns|templates)/", re.IGNORECASE)
VERB_NEAR_NOUN = re.compile(rf"\b{BUILD_VERB}\b[^\n]{{0,80}}\b{DS_NOUN}\b", re.IGNORECASE)
NOUN = re.compile(rf"\b{DS_NOUN}\b", re.IGNORECASE)
BUILD_VERB_RE = re.compile(rf"\b{BUILD_VERB}\b", re.IGNORECASE)
FIGMA_REF = re.compile(r"figma\.com/(design|file)/|\bnode[-_]?id\b", re.IGNORECASE)
COMPONENTISE = re.compile(r"\bcomponenti[sz]e", re.IGNORECASE)

# Our own push-destination pages come up constantly in pipeline/admin talk, always
# with a Figma link and a node id, and never as a build request. Naming them is
# the clearest available signal that a link is being discussed, not built from.
DEST_PAGE = re.compile(
    r"\b(spec team|archive page|prototypes page|destination page)\b"
    r"|\b(2025:803|3273:4346|3273:4717)\b",
    re.IGNORECASE,
)

SRC_TEMPLATES = re.compile(r"\bsrc/(cc/)?templates/", re.IGNORECASE)
TEMPLATE_BUILD = re.compile(
    rf"\b{BUILD_VERB}\b[^\n]{{0,80}}\b(templates?|screens?|dashboards?|landing|home page|home screen)\b"
    rf"|\b(templates?|screens?|dashboards?|landing)\b[^\n]{{0,40}}\b{BUILD_VERB}\b",
    re.IGNORECASE,
)


def url_dominant(prompt: str) -> bool:
    """A bare Figma link (little else in the prompt) IS a build instruction —
    CLAUDE.md §0 lists it as a trigger. A link inside a sentence about pages,
    docs or naming is not."""
    return len(URL.sub("", prompt).strip()) < 40


def should_fire(prompt: str) -> bool:
    if SRC_PATH.search(prompt):
        return True  # unambiguous: a real path under a governed directory
    if VERB_NEAR_NOUN.search(prompt) or COMPONENTISE.search(prompt):
        return True
    # "build the analytics dashboard screen" is a Tier=Template build with no
    # component/pattern/template noun in it. The old hook missed these entirely.
    if TEMPLATE_BUILD.search(prompt):
        return True
    if FIGMA_REF.search(prompt):
        # A Figma reference alone is not enough — it is equally how we discuss
        # push destinations, frame ids and archive pages.
        if DEST_PAGE.search(prompt) and not NOUN.search(prompt):
            return False
        return bool(NOUN.search(prompt) or BUILD_VERB_RE.search(prompt)) or url_dominant(prompt)
    return False


def is_template_build(prompt: str) -> bool:
    return bool(SRC_TEMPLATES.search(prompt) or TEMPLATE_BUILD.search(prompt))


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    raw = data.get("prompt") or ""
    prompt = SKILL_SELF_REF.sub(" ", raw)

    if not should_fire(prompt):
        return 0

    msg = (
        "[harness reminder] Component-build trigger detected. You MUST invoke "
        "Skill(skill=\"build-component\") as your first action — before any Figma "
        "MCP call, file read, or edit. Follow every step of "
        ".claude/commands/build-component.md in order (1-11), all pre-flight "
        "checks, all STOP rules, every variant. No corner-cutting. Edits under "
        "src/(components|patterns|templates)/ are DENIED by "
        ".claude/hooks/build-component-guard.py until the skill is invoked."
    )
    # Stronger reminder for template builds: the "layout-only" framing makes it
    # easy to skip the get_design_context fetch on the template root and write
    # shell paint values (bg / padding / gap) from intuition. Concrete mistake:
    # ControlScreen body bg + page padding (2026-06-01).
    if is_template_build(prompt):
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
