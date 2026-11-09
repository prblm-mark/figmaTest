import json, html, collections
d = json.load(open('view-only-inventory.json'))
S = d['screens']
e = lambda x: html.escape(str(x or ''))
AUDIT = {'Created', 'Created By', 'Last Updated', 'Last Updated By', 'Updated', 'Updated By'}

def label(it):
    if it.get('type') == 'cm':
        return (it.get('panelTitle') or it.get('label') or '').strip() or '(untitled panel)'
    return (it.get('label') or '').strip() or (it.get('source') or '(unlabelled)')

# frequency of non-audit, non-cm field labels
freq = collections.Counter()
where = collections.defaultdict(set)
for sc in S:
    seen = set()
    for it in sc['viewOnly']:
        if it.get('type') == 'cm':
            continue
        l = label(it)
        if l in AUDIT or l.lower() == 'comment' or l in seen:
            continue
        seen.add(l); freq[l] += 1; where[l].add(sc['screen'])
common = [(l, n) for l, n in freq.most_common() if n >= 3]

audit_count = sum(1 for sc in S if any(label(i) in AUDIT for i in sc['viewOnly']))
panels = d['summary']['viewOnlyCmPanels']
panel_rows = sorted(panels.items(), key=lambda kv: (-kv[1]['screenCount'], kv[0]))

by_mod = collections.defaultdict(list)
for sc in S:
    if sc['viewOnly']:
        by_mod[sc['module']].append(sc)

out = []
w = out.append
w('''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ViewOnlyInventory — view-only record sections — v1</title>
  <link rel="stylesheet" href="../../styles/base.css">
  <style>
    body { background: var(--ao-surface-secondary); color: var(--ao-text-primary); font-family: var(--ao-font-body); margin: 0; }
    .vo { max-width: var(--ao-size-14); margin: 0 auto; padding: var(--ao-spacing-8) var(--ao-spacing-7); display: flex; flex-direction: column; gap: var(--ao-spacing-7); }
    .vo h1 { font-family: var(--ao-font-title); font-size: var(--ao-font-fixed-2xl); margin: 0; }
    .vo h2 { font-family: var(--ao-font-title); font-size: var(--ao-font-fixed-lg); margin: 0 0 var(--ao-spacing-3); }
    .vo h3 { font-family: var(--ao-font-title); font-size: var(--ao-font-fixed-sm); margin: 0; }
    .vo p, .vo li { font-size: var(--ao-font-fixed-xs); line-height: var(--ao-leading-md); color: var(--ao-text-secondary); margin: 0; }
    .vo__lead { display: flex; flex-direction: column; gap: var(--ao-spacing-3); }
    .vo__card { background: var(--ao-surface-primary); border: 1px solid var(--ao-border-secondary); border-radius: var(--ao-radius-lg); padding: var(--ao-spacing-6); display: flex; flex-direction: column; gap: var(--ao-spacing-4); }
    .vo__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--ao-spacing-5); }
    .vo__stat { background: var(--ao-surface-primary); border: 1px solid var(--ao-border-secondary); border-radius: var(--ao-radius-lg); padding: var(--ao-spacing-5); }
    .vo__stat strong { display: block; font-family: var(--ao-font-title); font-size: var(--ao-font-fixed-2xl); color: var(--ao-text-primary); }
    .vo__stat span { font-size: var(--ao-font-fixed-xxs); color: var(--ao-text-contrast); }
    .vo table { width: 100%; border-collapse: collapse; font-size: var(--ao-font-fixed-xs); }
    .vo th { text-align: left; font-size: var(--ao-font-fixed-xxs); text-transform: uppercase; letter-spacing: 0.4px; color: var(--ao-text-contrast); font-weight: var(--ao-font-bold); padding: var(--ao-spacing-3) var(--ao-spacing-4); border-bottom: 1px solid var(--ao-border-secondary); }
    .vo td { padding: var(--ao-spacing-3) var(--ao-spacing-4); border-bottom: 1px solid var(--ao-border-secondary); vertical-align: top; line-height: var(--ao-leading-sm); }
    .vo td:first-child { font-weight: var(--ao-font-semibold); white-space: nowrap; }
    .vo__muted { color: var(--ao-text-contrast); }
    .vo__pill { display: inline-block; padding: 0 var(--ao-spacing-2); border-radius: var(--ao-radius-full); background: var(--ao-surface-secondary); font-size: var(--ao-font-fixed-xxs); color: var(--ao-text-secondary); margin: 0 var(--ao-spacing-1) var(--ao-spacing-1) 0; }
    .vo__pill--panel { background: var(--ao-surface-info-soft); color: var(--ao-text-info); }
    .vo__pill--audit { background: var(--ao-surface-success-soft); color: var(--ao-text-success); }
    .vo__group { font-size: var(--ao-font-fixed-xxs); color: var(--ao-text-contrast); font-weight: var(--ao-font-semibold); margin-right: var(--ao-spacing-2); }
    .vo__module { display: flex; flex-direction: column; gap: var(--ao-spacing-3); }
  </style>
</head>
<body>
<main class="vo">
''')
sm = d['summary']
w(f'''<section class="vo__lead">
  <h1>View-only record sections — Control Centre</h1>
  <p>What each Control Centre record screen shows on its <strong>View</strong> screen but not on its <strong>Edit</strong> screen. Read from the Affino.com source (instance Comrz) via the Hub, 2026-09-25. Every legacy record screen is defined by a <code>*Def.cfm</code> file: one row per field, and slot 9 lists the screens it appears on (<code>l</code> listing, <code>v</code> view, <code>e</code> edit, <code>s</code> search). <strong>View-only = <code>v</code> without <code>e</code></strong>, plus rows built only inside a view-mode branch. Fields are grouped by the renderer's dividers: Main · Advanced · Security · Publication · Audit · Other · Notes.</p>
</section>
<section class="vo__stats">
  <div class="vo__stat"><strong>{sm['defFiles']}</strong><span>record screens read (40 modules)</span></div>
  <div class="vo__stat"><strong>{sm['screensWithViewOnly']}</strong><span>screens with a view-only item</span></div>
  <div class="vo__stat"><strong>{sm['viewOnlyItems']:,}</strong><span>view-only items in total</span></div>
  <div class="vo__stat"><strong>{audit_count}</strong><span>screens carry the Audit block view-only</span></div>
</section>
''')
w('''<section class="vo__card">
  <h2>1 · The Audit block — on almost every screen</h2>
  <p><span class="vo__pill vo__pill--audit">Created</span><span class="vo__pill vo__pill--audit">Created By</span><span class="vo__pill vo__pill--audit">Last Updated</span><span class="vo__pill vo__pill--audit">Last Updated By</span> (some screens say Updated / Updated By). ''' + f'{audit_count}' + ''' of the screens show these view-only, in the Audit divider. They are the single most reusable view-only component; in the per-screen list below they are shown as one green "Audit" tag rather than repeated.</p>
</section>
''')
w('<section class="vo__card"><h2>2 · View-only panels</h2><p>Rows of type <code>cm</code>: either a divider that starts a section of fields (<em>heading</em>) or a whole included panel (<em>panel</em>). Ordered by how many screens use them.</p><table><thead><tr><th>Panel</th><th>Kind</th><th>Screens</th><th>Include</th></tr></thead><tbody>')
for name, p in panel_rows:
    w(f"<tr><td>{e(name)}</td><td>{e(', '.join(p.get('kind', [])))}</td><td>{p['screenCount']} · <span class='vo__muted'>{e(', '.join(p['screens']))}</span></td><td class='vo__muted'>{e(', '.join(i.split('/')[-1] for i in p.get('includes', [])))}</td></tr>")
w('</tbody></table></section>')
w('<section class="vo__card"><h2>3 · View-only fields shared by 3+ screens</h2><p>Excluding the Audit block. These are the candidates for shared definition-list rows.</p><table><thead><tr><th>Field</th><th>Screens</th></tr></thead><tbody>')
for l, n in common:
    ws = sorted(where[l]); more = f' +{len(ws)-12} more' if len(ws) > 12 else ''
    w(f"<tr><td>{e(l)}</td><td>{n} · <span class='vo__muted'>{e(', '.join(ws[:12]))}{more}</span></td></tr>")
w('</tbody></table></section>')
w('<section class="vo__card"><h2>4 · Every screen, by module</h2><p>View-only items per screen, grouped by divider. <span class="vo__pill vo__pill--panel">Blue</span> = panel · <span class="vo__pill vo__pill--audit">Audit</span> = the four Audit fields.</p>')
for mod in sorted(by_mod):
    w(f'<div class="vo__module"><h3>{e(mod)} <span class="vo__muted">· {len(by_mod[mod])} screens</span></h3><table><thead><tr><th>Screen</th><th>View-only</th></tr></thead><tbody>')
    for sc in sorted(by_mod[mod], key=lambda s: s['screen']):
        groups = collections.OrderedDict(); has_audit = False
        for it in sc['viewOnly']:
            l = label(it)
            if l in AUDIT: has_audit = True; continue
            if it.get('type') != 'cm' and l.lower() == 'comment': continue
            g = it.get('groupName') or it.get('section') or 'Other'
            groups.setdefault(g, [])
            cls = 'vo__pill vo__pill--panel' if it.get('type') == 'cm' else 'vo__pill'
            pill = f'<span class="{cls}">{e(l)}</span>'
            if pill not in groups[g]: groups[g].append(pill)
        cells = ''.join(f'<div><span class="vo__group">{e(g)}</span>{"".join(p)}</div>' for g, p in groups.items())
        if has_audit: cells += '<div><span class="vo__group">Audit</span><span class="vo__pill vo__pill--audit">Audit</span></div>'
        link = f" <span class='vo__muted'>{e(sc.get('link') or '')}</span>" if sc.get('link') else ''
        w(f"<tr><td>{e(sc['screen'])}{link}</td><td>{cells}</td></tr>")
    w('</tbody></table></div>')
w('</section>')
w('<section class="vo__card"><h2>5 · Gaps and caveats</h2><ul>')
for g in d.get('gaps', []):
    w(f'<li>{e(g if isinstance(g, str) else json.dumps(g))}</li>')
w('<li><strong>Articles shows none of the analytics panels</strong> in this source: Recent Viewers, Stats, Referring URLs and Index Status are defined on Section, Channel and Edition (Index Status also Forum Thread). Articles\' view-only items are Live, Created, Created By, Last View and Views. If the Article view shows those panels today, they come from another code path.</li>')
w('<li>Mode <code>r</code> (148 rows, mostly the Title link column) is unconfirmed — probably the related-items lookup listing.</li>')
w('<li>Hub-type profiles and any screen not rendered through the legacy View/Edit forms are not covered.</li>')
w('</ul></section></main></body></html>')
open('view-only-inventory.html', 'w').write('\n'.join(out))
print('ok', len(common), len(panel_rows), sum(len(v) for v in by_mod.values()))
