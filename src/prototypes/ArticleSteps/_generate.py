"""ArticleSteps — generates four display options for an article's steps on the record VIEW screen.
Run: python3 src/prototypes/ArticleSteps/_generate.py
The CC shell is taken from ../ControlRecordScreen/article-view-a.html (same depth, same paths), and
only the page column is replaced, so every option sits in the identical record screen."""
import html, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, 'steps-data.py')).read())
e = html.escape
TPL = open(os.path.join(HERE, '..', 'ControlRecordScreen', 'article-view-a.html')).read()
N = len(STEPS)

def icon(name, cls='as-icon'): return f'<i data-lucide="{name}" class="{cls}" aria-hidden="true"></i>'
def check(label): return f'<label class="checkbox"><input type="checkbox" class="checkbox__input" aria-label="{e(label)}"><span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span></label>'
def chip(): return '<button type="button" class="btn btn--tertiary btn--sm datatables__account-chip">Markus Karlsson</button>'
def yes(): return icon('check', 'as-icon as-icon--on')
def no(): return icon('minus', 'as-icon')
def edit(i): return f'<a class="datatables__row-edit" href="#step-{i}" aria-label="Edit step {i}"><i data-lucide="pencil" aria-hidden="true"></i></a>'
def kebab(i): return f'<label class="datatables__kebab"><input type="checkbox" class="datatables__kebab__input" aria-label="More for step {i}"><i data-lucide="ellipsis-vertical" aria-hidden="true"></i></label>'
def toggle(label, on=False):
    return (f'<span class="as-toggle"><button class="toggle toggle--xxs{" toggle--active" if on else ""}" type="button" role="switch" aria-checked="{"true" if on else "false"}" aria-label="{e(label)}">'
            f'<span class="toggle__track"><span class="toggle__knob"></span></span></button>{e(label)}</span>')
def media():
    return ('<div class="as-media">' + ''.join(f'<span class="as-media__slot">{icon(ic, "")}{e(t)}</span>' for ic, t in
            [('image-off', 'No step image'), ('image-off', 'No presentation image'), ('film', 'No multimedia')]) + '</div>')
def sort_th(label, active=False, cls=''):
    ic = 'chevron-up' if active else 'chevrons-up-down'
    a = ' datatables__sort--active' if active else ''
    return f'<th scope="col"{cls}><button type="button" class="datatables__sort{a}">{e(label)}<i data-lucide="{ic}" aria-hidden="true"></i></button></th>'

def toolbar(right=''):
    return ('<div class="datatables__toolbar"><span class="datatables__meta"><span class="datatables__meta-label">Show</span>'
            '<button type="button" class="datatables__select">20<i data-lucide="chevron-down" aria-hidden="true"></i></button>'
            f'<span>of <strong>{N}</strong></span></span><div class="datatables__actions as-toolbar-right">{right}</div></div>')
def footer(shown=20):
    return (f'<div class="datatables__footer"><span class="datatables__count">Showing <strong>1&#8211;{shown}</strong> of <strong>{N}</strong> results</span>'
            '<div class="datatables__pagination" role="group" aria-label="Pagination">'
            '<button class="datatables__page-btn" type="button" aria-label="Previous"><i data-lucide="chevron-left" aria-hidden="true"></i></button>'
            '<span class="datatables__page-numbers"><button class="datatables__page-btn datatables__page-btn--active" type="button" aria-current="page">1</button>'
            '<button class="datatables__page-btn" type="button">2</button></span>'
            '<button class="datatables__page-btn" type="button" aria-label="Next"><i data-lucide="chevron-right" aria-hidden="true"></i></button></div></div>')
EDIT_COLS = '<button type="button" class="btn btn--secondary">' + icon('columns-3', '') + '<span>Edit Columns</span></button>'

def note(letter, name, text):
    return f'<section class="as-note"><p class="as-note__title">Option {letter} · {e(name)}</p><p class="as-note__text">{text}</p></section>'

def tabbar():
    return ('<div class="as-tabbar"><div class="crs-tabs" role="tablist" aria-label="Record sections">'
            '<button class="crs-tab" type="button" role="tab" aria-selected="false">Details</button>'
            f'<button class="crs-tab crs-tab--active" type="button" role="tab" aria-selected="true">Article steps <span class="crs-tab__count">{N}</span></button></div>'
            '<div class="as-tabbar__actions"><button class="btn btn--secondary" type="button">' + icon('search', '') + ' Lookup</button>'
            '<button class="btn btn--primary" type="button">' + icon('plus', '') + ' Add step</button></div></div>')

# ── A · list view, "Show details" expands every row ───────────────────────
# Designer, 2026-09-25: A is the pick, for consistency. It is only a list view: every row is normal
# height, and nothing expands per row — the Show details toggle opens ALL of them at once, as the
# live screen does. No chevron column.
def option_a(details=False):
    T = ' class="as-tight"'
    head = ('<tr><th scope="col" class="as-tight">' + check('Select all') + '</th>'
            + sort_th('Order', True, T) + sort_th('Title') + sort_th('Type', False, T) + sort_th('Float', False, T) +
            '<th scope="col" class="as-center as-tight">Design frame</th><th scope="col" class="as-center as-tight">Lookup</th>' + sort_th('Created by', False, T) + sort_th('Publish start', False, T) +
            '<th scope="col" class="as-center as-tight">Live</th><th scope="col" class="datatables__kebab-cell as-tight" aria-label="Edit"></th></tr>')
    rows = []
    # No kebab on a step row (designer, 2026-09-25): the only detail is the Show details panel,
    # and that is governed by the toolbar toggle for every row at once. The pencil stays.
    for i, (t, x) in enumerate(STEPS, 1):
        rows.append(f'<tr class="datatables__row" data-as-row><td class="as-tight">{check("Select step " + str(i))}</td>'
                    f'<td class="as-tight">{i}</td><td class="as-titlecol"><a class="datatables__record-link as-trunc" href="#step-{i}" title="{e(t)}">{e(t)}</a></td><td class="as-tight">Content</td><td class="as-tight">None</td>'
                    f'<td class="as-center as-tight">{no()}</td><td class="as-center as-tight">{no()}</td><td class="as-tight">{chip()}</td><td class="as-tight">20 Jul 2026</td><td class="as-center as-tight">{yes()}</td>'
                    f'<td class="datatables__kebab-cell as-tight">{edit(i)}</td></tr>')
        body = STEP1_HTML if i == 1 else STEP2_HTML if i == 2 else f'<p>{e(x)}</p>'
        rows.append(f'<tr class="as-detail" data-as-detail{"" if details else " hidden"}><td></td><td colspan="10"><div class="as-detail__body">{media()}'
                    f'<div class="as-prose as-prose--clamp">{body}</div>'
                    f'<a class="as-link" href="#step-{i}">Read the full step{icon("arrow-right", "")}</a></div></td></tr>')
    table = ('<div class="datatables datatables--orders datatables--rows-clickable" data-as-list>' +
             toolbar('<span data-as-details-toggle>' + toggle('Show details', details) + '</span>' + EDIT_COLS) +
             '<div class="datatables__body"><table class="table"><thead>' + head + '</thead><tbody>' + ''.join(rows) + '</tbody></table></div>' + footer() + '</div>')
    state = 'Show details <strong>on</strong>: every row opens to its media and a 6-line preview of its text, with a link to the full step.' if details else 'Show details <strong>off</strong> (the default): a plain list view, every row at the normal listing height.'
    return note('A', 'List view · ' + ('details on' if details else 'details off'), state + ' The same columns as the live View screen. There is no per-row expand: the toggle opens every row at once, as the live screen does. Empty media collapses to one quiet line instead of three N/A blocks.') + table

# ── B · list + inspector ───────────────────────────────────────────────────
def option_b():
    T = ' class="as-tight"'
    head = ('<tr><th scope="col" class="as-tight">' + check('Select all') + '</th>' + sort_th('Order', True, T) + sort_th('Title') + sort_th('Type', False, T) +
            '<th scope="col" class="as-center as-tight">Live</th><th scope="col" class="datatables__kebab-cell as-tight" aria-label="Actions"></th></tr>')
    rows = ''.join(f'<tr class="datatables__row{" as-row--selected" if i == 1 else ""}"><td class="as-tight">{check("Select step " + str(i))}</td><td class="as-tight">{i}</td>'
                   f'<td class="as-wrap"><a class="datatables__record-link" href="#step-{i}">{e(t)}</a></td><td class="as-tight">Content</td><td class="as-center as-tight">{yes()}</td>'
                   f'<td class="datatables__kebab-cell as-tight">{kebab(i)}</td></tr>' for i, (t, x) in enumerate(STEPS, 1))
    table = ('<div class="datatables datatables--orders datatables--rows-clickable">' + toolbar(EDIT_COLS) +
             '<div class="datatables__body"><table class="table"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>' + footer() + '</div>')
    t1 = STEPS[0][0]
    dl = ''.join(f'<dt>{e(k)}</dt><dd>{v}</dd>' for k, v in [('Step type', 'Content'), ('Sort order', '1'), ('Float', 'None'), ('Design frame', 'No'),
                 ('Lookup', 'No'), ('Live', yes() + ' Yes'), ('Publish start', '20 Jul 2026 15:36'), ('Created by', chip())])
    insp = (f'<aside class="as-inspector" aria-label="Selected step"><div class="as-inspector__head"><div><p class="as-inspector__eyebrow">Step 1 of {N}</p>'
            f'<h3 class="as-inspector__title">{e(t1)}</h3></div><div class="as-inspector__actions">'
            '<button class="btn btn--tertiary btn--icon btn--sm" type="button" aria-label="Previous step"><i data-lucide="chevron-up" aria-hidden="true"></i></button>'
            '<button class="btn btn--tertiary btn--icon btn--sm" type="button" aria-label="Next step"><i data-lucide="chevron-down" aria-hidden="true"></i></button>'
            '<button class="btn btn--secondary btn--sm" type="button"><i data-lucide="pencil" aria-hidden="true"></i> Edit</button></div></div>'
            f'<div class="as-inspector__section"><p class="as-inspector__label">Step</p><dl class="as-dl">{dl}</dl></div>'
            f'<div class="as-inspector__section"><p class="as-inspector__label">Media</p>{media()}</div>'
            f'<div class="as-inspector__section"><p class="as-inspector__label">Step text</p><div class="as-prose">{STEP1_HTML}</div></div></aside>')
    return note('B', 'List + inspector', 'A lean list (order, title, type, live) with the selected step opening in a <strong>side panel</strong>: every property, its media, and the <strong>full step text</strong>, with previous / next to read through in order. The list never grows, so all 20 steps stay scannable. <strong>Best for:</strong> reading and checking long steps — the "contextual panel, not a mode" approach. <strong>Cost:</strong> less room for columns; on narrow screens the panel has to become a sheet.') + f'<div class="as-split">{table}{insp}</div>'

# ── C · step cards ─────────────────────────────────────────────────────────
def option_c():
    cards = []
    for i, (t, x) in enumerate(STEPS[:12], 1):
        cards.append(f'<article class="as-step"><span class="as-step__handle" aria-hidden="true"><i data-lucide="grip-vertical"></i></span><span class="as-step__num">{i}</span>'
                     f'<div class="as-step__body"><h3 class="as-step__title">{e(t)}</h3><p class="as-step__excerpt">{e(x)}</p>'
                     '<div class="as-step__meta"><span class="badge badge--success">Live</span><span>Content</span><span class="as-dot">Float: None</span>'
                     '<span class="as-dot">No media</span><span class="as-dot">Markus Karlsson · 20 Jul 2026</span></div></div>'
                     f'<div class="as-step__actions">{edit(i)}{kebab(i)}</div></article>')
    bar = (f'<div class="as-cards__bar"><p class="as-cards__count"><strong>{N} steps</strong> · shown in reading order · drag to reorder</p>'
           '<div class="as-toolbar-right">' + toggle('Show text', True) + '<div class="input input--sm"><div class="input__wrap"><i data-lucide="search" class="input__icon" aria-hidden="true"></i>'
           '<input type="search" class="input__control" placeholder="Find a step" aria-label="Find a step"></div></div></div></div>')
    return note('C', 'Step cards, in reading order', 'Steps as a <strong>numbered sequence</strong> rather than a table: title, a 2-line excerpt of the text, and the properties as one meta line — only the ones that say something. Drag handles make <strong>sort order</strong> direct instead of a number to edit. "Show text" collapses it to titles only. <strong>Best for:</strong> content editors who think of steps as a story. <strong>Cost:</strong> no column sorting or Edit Columns; not the listing pattern.') + f'<div class="as-cards">{bar}{"".join(cards)}</div>'

# ── D · title + excerpt listing ────────────────────────────────────────────
def option_d():
    T = ' class="as-tight"'
    head = ('<tr><th scope="col" class="as-tight">' + check('Select all') + '</th>' + sort_th('Order', True, T) + sort_th('Step') + sort_th('Type', False, T) +
            '<th scope="col" class="as-tight">Media</th><th scope="col" class="as-tight">Options</th>' + sort_th('Created', False, T) + '<th scope="col" class="as-tight">Status</th><th scope="col" class="datatables__kebab-cell as-tight" aria-label="Actions"></th></tr>')
    assets = '<span class="as-assets" aria-label="No media">' + icon('image', '') + icon('presentation', '') + icon('film', '') + '</span>'
    rows = ''.join(f'<tr class="datatables__row"><td class="as-tight">{check("Select step " + str(i))}</td><td class="as-tight">{i}</td>'
                   f'<td class="as-wrap"><div class="as-titlecell"><a class="datatables__record-link as-titlecell__title" href="#step-{i}">{e(t)}</a><span class="as-titlecell__excerpt">{e(x)}</span></div></td>'
                   f'<td class="as-tight">Content</td><td class="as-tight">{assets}</td><td class="as-muted as-tight">&#8212;</td>'
                   '<td class="as-tight"><div class="as-stack"><span>20 Jul 2026 15:36</span><span class="as-stack__sub">Markus Karlsson</span></div></td>'
                   f'<td class="as-tight"><span class="badge badge--success">Live</span></td><td class="datatables__kebab-cell as-tight">{edit(i)}{kebab(i)}</td></tr>' for i, (t, x) in enumerate(STEPS, 1))
    table = ('<div class="datatables datatables--orders datatables--rows-clickable">' + toolbar(EDIT_COLS) +
             '<div class="datatables__body"><table class="table"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>' + footer() + '</div>')
    return note('D', 'Title + excerpt listing', 'The listing pattern, denser: the title carries a <strong>2-line excerpt</strong> beneath it (like Customer + role on Orders), media becomes three icons that light up when set, the four rarely-used flags fold into one <strong>Options</strong> column that only lists what is switched on, and Created merges date and author. Opening a row goes to the step. <strong>Best for:</strong> one consistent listing across every child table. <strong>Cost:</strong> the full text is a click away.') + table

OPTIONS = [('a', 'List view — details off', option_a), ('a-details', 'List view — details on', lambda: option_a(True)), ('b', 'List + inspector', option_b), ('c', 'Step cards', option_c), ('d', 'Title + excerpt listing', option_d)]

start = TPL.index('    <div class="cc-control__page">')
main_close = TPL.index('\n  </main>')
end = TPL.rindex('\n    </div>', start, main_close) + len('\n    </div>')
for key, name, fn in OPTIONS:
    page = f'    <div class="cc-control__page">\n      <div class="as-page">\n{tabbar()}\n{fn()}\n      </div>\n    </div>'
    out = TPL[:start] + page + TPL[end:]
    out = re.sub(r'data-capture-name="[^"]*"', f'data-capture-name="Article steps — option {key[0].upper()} — {name}"', out, 1)
    out = re.sub(r'<title>[^<]*</title>', f'<title>Article steps · Option {key[0].upper()} · {name} — Affino Control Centre</title>', out, 1)
    out = out.replace('Affino 9.0.11.25 — The Refinement Update', ARTICLE)
    out = out.replace('<link rel="stylesheet" href="ControlRecordScreen.css">',
                      '<link rel="stylesheet" href="../ControlRecordScreen/ControlRecordScreen.css">\n  <link rel="stylesheet" href="ArticleSteps.css">', 1)
    out = out.replace('<script src="ControlRecordScreen.js"></script>', '<script src="../ControlRecordScreen/ControlRecordScreen.js"></script>\n  <script src="ArticleSteps.js"></script>', 1)
    open(os.path.join(HERE, f'article-steps-{key}.html'), 'w').write(out)
    print('wrote', key)
