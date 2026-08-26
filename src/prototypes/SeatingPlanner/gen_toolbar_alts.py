#!/usr/bin/env python3
"""Generate the three toolbar mobile options from workspace.html (2026-08-03).

    python3 gen_toolbar_alts.py

Each option is workspace.html plus a body attribute, one stylesheet, one script,
and a small markup change. Regenerate after editing workspace.html so the options
never drift from the adopted layout.

INDENTS IN workspace.html, because every anchor here depends on them:
    .sp-toolbar        button 10 · its <i> and text 12 · </button> 10
    .sp-split__wrap    wrap 10 · .sp-split 12 · button 14 · button text 16
                       menu <div> 12 · </div> 12 · wrap </span> 10
    .sp-plans__actions button 12 · its <i> and text 14 · </button> 12

Two bugs the first version of this script shipped, both from weak anchors — the
reason sub1() exists:
  1. Label needles used a 14-space indent where the file has 12. The guard only
     asserted the TEXT existed somewhere, so it passed while the replacement did
     nothing, and three of four buttons shipped without their short labels.
  2. The wrapper's end anchor took the FIRST "</span>" after the wrap, which
     closed .sp-split rather than .sp-split__wrap — leaving the export menu
     outside the wrapper and the markup mis-nested.
An anchor you have not proved you matched is not an anchor.
"""
import pathlib
import re
import sys

SRC = pathlib.Path("workspace.html")
if not SRC.exists():
    sys.exit("ABORT: run this from src/prototypes/SeatingPlanner/")
src = SRC.read_text()


def sub1(t, old, new, where):
    """Replace exactly once, and prove it happened."""
    n = t.count(old)
    if n != 1:
        sys.exit(f"ABORT: {where} — expected exactly 1 match, found {n}: {old[:70]!r}")
    return t.replace(old, new, 1)


def base(tb, title):
    t = sub1(src, '<link rel="stylesheet" href="SeatingPlannerShell.css">',
             '<link rel="stylesheet" href="SeatingPlannerShell.css">\n'
             '  <link rel="stylesheet" href="SeatingPlannerToolbarAlt.css">', f"{tb} css link")
    t = sub1(t, '  <script src="SeatingPlannerShell.js"></script>',
             '  <script src="SeatingPlannerShell.js"></script>\n'
             '  <script src="SeatingPlannerToolbarAlt.js"></script>', f"{tb} script")
    t = sub1(t, '<body class="sp-shell sp-shell--alt1"',
             f'<body class="sp-shell sp-shell--alt1" data-sp-tb="{tb}"', f"{tb} body attr")
    t, n = re.subn(r"<title>.*?</title>", f"<title>{title}</title>", t, count=1, flags=re.S)
    if n != 1:
        sys.exit(f"ABORT: {tb} title")
    return t


def abbreviate_filter(t, where):
    """"Only free seats" -> "Free seats" below sm. The switch already carries
    aria-label="Only free seats", so assistive tech is unaffected.

    Applied to all three options: it is what buys option A its second line. A's
    second line measured 454px of content on a 453px track — it missed by ONE
    pixel, and dropping "Only " frees ~35px."""
    return sub1(t, "            <span>Only free seats</span>",
                '            <span><span class="sp-tb-full">Only free seats</span>'
                '<span class="sp-tb-short">Free seats</span></span>', f"{where} filter label")


def add_aria(t, act, label):
    """Add aria-label to a [data-sp-action] button that has none."""
    i = t.find(f'data-sp-action="{act}" data-sp-task=')
    if i == -1:
        sys.exit(f"ABORT: aria — {act} not found")
    close = t.index(">", i)
    if "aria-label" in t[i:close]:
        return t
    return t[:close] + f' aria-label="{label}"' + t[close:]


ACTIONS = (("add-table", "Add table", "Add"),
           ("room-layout", "Room layout", "Layout"),
           ("tier-colours", "Table types", "Types"))

# ============================================================== OPTION A ======
a = abbreviate_filter(base("a", "Seating Planner · Toolbar option A — overflow menu"), "A")

MORE = '''          <!-- OPTION A — overflow. Below 640px the two plan-settings buttons above
               are hidden and reappear as items in here. The items carry the SAME
               data-sp-action, so the workspace registry dispatches them with no extra
               wiring: a menu item IS the button, relocated.

               Own data-sp-more-* attributes on purpose — the shell resolves the split
               menu with one('[data-sp-split-menu]'), the FIRST in the document, so a
               second menu on those attributes would toggle the export menu instead. -->
          <span class="sp-more">
            <button class="btn btn--secondary btn--sm" type="button" aria-label="More actions"
                    aria-haspopup="true" aria-expanded="false" data-sp-more-toggle>
              <i data-lucide="more-horizontal" aria-hidden="true"></i>
            </button>
            <div class="sp-split__menu sp-more__menu" data-sp-more-menu hidden>
              <button class="sp-split__item" type="button" data-sp-action="room-layout" data-sp-task="TASK-344760">
                <i data-lucide="map" aria-hidden="true"></i>Room layout
              </button>
              <button class="sp-split__item" type="button" data-sp-action="tier-colours" data-sp-task="TASK-342308">
                <i data-lucide="palette" aria-hidden="true"></i>Table types
              </button>
            </div>
          </span>

'''
SPLIT_COMMENT = "          <!-- Export split button: PDF is the default action, other formats in the menu -->"
a = sub1(a, SPLIT_COMMENT, MORE + SPLIT_COMMENT, "A insert more-menu")
pathlib.Path("toolbar-a-overflow.html").write_text(a)

# ============================================================== OPTION C ======
c = abbreviate_filter(base("c", "Seating Planner · Toolbar option C — sticky bottom bar"), "C")

for act, full, short in ACTIONS:                      # button text sits at 12 spaces
    c = sub1(c, f"            {full}\n",
             f'            <span class="sp-tb-full">{full}</span>'
             f'<span class="sp-tb-short">{short}</span>\n', f"C label {full}")
    c = add_aria(c, act, full)

c = sub1(c, "                Export PDF\n",           # split-wrap text sits at 16
         '                <span class="sp-tb-full">Export PDF</span>'
         '<span class="sp-tb-short">Export</span>\n', "C export label")

c_start = c.index('          <button class="btn btn--secondary btn--sm" type="button" data-sp-action="add-table"')
WRAP_CLOSE = "\n          </span>\n"                  # .sp-split__wrap's own close, AFTER the menu
c_end = c.index(WRAP_CLOSE, c.index("data-sp-split-menu")) + len(WRAP_CLOSE)
block = c[c_start:c_end]
if "sp-split__menu" not in block or block.count("<div") != block.count("</div>"):
    sys.exit("ABORT: C wrap — block does not enclose the split menu cleanly")
c = (c[:c_start]
     + '          <!-- OPTION C — one wrapper so the whole action group can dock to the\n'
       '               bottom below 640px. Above that it is a plain flex row and the\n'
       '               layout is unchanged. -->\n'
       '          <div class="sp-toolbar__actions">\n'
     + "".join(("  " + ln if ln.strip() else ln) for ln in block.splitlines(keepends=True))
     + '          </div>\n'
     + c[c_end:])
pathlib.Path("toolbar-c-bottombar.html").write_text(c)

# ============================================================== OPTION E ======
e = abbreviate_filter(base("e", "Seating Planner · Toolbar option E — plan settings on the plan"), "E")

lifted = []
for act, full, icon in (("room-layout", "Room layout", "map"),
                        ("tier-colours", "Table types", "palette")):
    m = re.search(r'          <button class="btn btn--secondary btn--sm" type="button" '
                  r'data-sp-action="' + act + r'"[^>]*>\n.*?\n          </button>\n', e, re.S)
    if not m:
        sys.exit(f"ABORT: E lift — {act}")
    task = re.search(r'data-sp-task="([^"]+)"', m.group(0)).group(1)
    e = e[:m.start()] + e[m.end():]
    lifted.append(
        f'            <button class="btn btn--secondary btn--sm" type="button" '
        f'data-sp-action="{act}" data-sp-task="{task}" aria-label="{full}">\n'
        f'              <i data-lucide="{icon}" aria-hidden="true"></i>\n'
        f'              <span class="sp-plans__btn-word">{full}</span>\n'
        f'            </button>\n')

COPY_BTN = ('            <button class="btn btn--secondary btn--sm" type="button" '
            'data-sp-action="copy-plans" data-sp-task="TASK-344756" aria-label="Copy plans">\n'
            '              <i data-lucide="copy" aria-hidden="true"></i>\n'
            '              Copy<span class="sp-plans__btn-word"> plans</span>\n'
            '            </button>\n')
e = sub1(e, COPY_BTN, COPY_BTN
         + '            <!-- OPTION E — plan-scoped settings, moved off the tables toolbar.\n'
           '                 They act on the ACTIVE plan. Labels collapse to icons below\n'
           '                 640px via the class the plans row already abbreviates with. -->\n'
         + "".join(lifted), "E plans row")
pathlib.Path("toolbar-e-planscope.html").write_text(e)

# ============================================================== VALIDATE ======
# Counting, not just presence — bug 1 above passed a presence check while doing
# nothing. sp-tb-short: A and E only abbreviate the filter (1); C also abbreviates
# its four action labels (5).
EXPECT = {
    "toolbar-a-overflow.html":  [("data-sp-more-menu", 1), ("sp-tb-short", 1)],
    "toolbar-c-bottombar.html": [("sp-toolbar__actions", 1), ("sp-tb-short", 5)],
    "toolbar-e-planscope.html": [("sp-plans__btn-word", 4), ("sp-tb-short", 1)],
}
bad = 0
for f, checks in EXPECT.items():
    parts = []
    t = pathlib.Path(f).read_text()
    for needle, n in checks:
        got = t.count(needle)
        ok = got == n
        bad += 0 if ok else 1
        parts.append(f"{'ok' if ok else 'BAD'} {needle}={got}/{n}")
    print(f"  {f:28s} {'  '.join(parts)}")
if bad:
    sys.exit(f"ABORT: {bad} validation failure(s) — the options are not trustworthy")
print("all three generated and validated")
