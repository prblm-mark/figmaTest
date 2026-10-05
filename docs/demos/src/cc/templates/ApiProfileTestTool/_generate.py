#!/usr/bin/env python3
"""Generate the two API Profile test tools from their classic CFML (TASK-470999, TASK-471000).

    python3 _generate.py --classic <dir>

<dir> holds the classic sources from affino.com's tree (AffinoComrz):
    APIProfileUserTestTool.cfm, APIProfileCRMTestTool.cfm   AfcControl/CC/
plus the six the help pages need (see ../ApiProfileHelp/_generate.py), because each test endpoint's
mock response is the help page's own documented example for that endpoint.

Reuses the help generator's ColdFusion evaluator, tolerant HTML parser and helpers, so there is one
implementation of each. The forms are extracted mechanically: every section, endpoint, field, label
and default value comes from the classic markup, none is retyped.

Agreed with Mark (2026-10-05), beyond a straight conversion:
  1. the API help pages' layout (rail / sticky Select, one card per section);
  2. a Sign button on every form (the same ?action=hash call, filling Time Stamp / Signature / MD5);
  3. one shared credentials card (API Key, and Access / Refresh Token where the page uses them),
     overridable per form;
  4. mock responses from the help pages' documented examples;
  5. generated, like the help pages.
"""
import argparse
import html
import importlib.util
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location('help_gen', HERE.parent / 'ApiProfileHelp' / '_generate.py')
H = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(H)

CF, Node, parse, text_of, norm, esc = H.CF, H.Node, H.parse, H.text_of, H.norm, H.esc
ENV = dict(H.ENV, **{'Request.AffinoEngine.Settings.CurrentURL': 'https://www.affino.com/'})

CREDS = ('APIKey', 'AccessToken', 'RefreshToken')
SIGNING = ('TimeStamp', 'Signature', 'MD5')
CRED_LABEL = {'APIKey': 'API Key', 'AccessToken': 'Access Token', 'RefreshToken': 'Refresh Token'}
TONE = H.TONE


# ── Classic page → resolved HTML ───────────────────────────────────────────────
def resolve(cfm):
    src = cfm.read_text()
    src = re.sub(r'<!---.*?--->', '', src, flags=re.S)
    start = re.search(r'<div id="(TestTool|CRMAPI)"[^>]*>', src)
    body = src[start.end():src.index('<script type="text/javascript">', start.end())]
    body = body.replace('<cfoutput>', '').replace('</cfoutput>', '')
    return CF(ENV).interpolate(body)


# ── Docs: each endpoint's documented example response ─────────────────────────
def norm_path(p):
    p = html.unescape(p).split('?')[0].strip().rstrip('/')
    p = re.sub(r'<[^>]*>|\{[^}]*\}', '{}', p)
    p = re.sub(r'/\d+(?=/|$)', '/{}', p)
    return p.lower()


def doc_examples(classic):
    """(METHOD, path) → (status, body) from the two help pages' Example → Response rows."""
    out = {}
    for cfm in ('APIProfileUserHelp.cfm', 'APIProfileCRMHelp.cfm'):
        resolved = H.resolve(classic / cfm, classic)
        for chunk in re.split(r'<h3>', resolved)[1:]:
            text = html.unescape(re.sub(r'<[^>]+>', ' ', chunk))
            m = re.search(r'\b(GET|POST|PUT|DELETE)\s+(/rest/\S+)', text)
            if not m:
                continue
            resp = text[text.find('Response:'):] if 'Response:' in text else ''
            st = re.search(r'Status\s*:\s*([0-9]{3}[^\n]*)', resp)
            bd = re.search(r'Body\s*:\s*(.*?)(?:\n\s*\n|$)', resp, re.S)
            status = norm(st.group(1)) if st else ''
            body = norm(bd.group(1)) if bd else ''
            body = re.sub(r'^Result:\s*', '', body)
            out.setdefault((m.group(1), norm_path(m.group(2))), (status, body))
    return out


# ── Forms ─────────────────────────────────────────────────────────────────────
def kids(n):
    return [k for k in n.kids if isinstance(k, Node)]


def is_cls(n, c):
    return c in n.attrs.get('class', '').split()


def parse_row(row, form):
    """One classic <div> row → onto the form model."""
    nodes = row.kids
    label_node = next((k for k in nodes if isinstance(k, Node) and k.tag == 'label'), None)
    controls = [k for k in iter_nodes(row) if k.tag in ('input', 'textarea', 'select')]
    if label_node is None:
        if controls:
            raise ValueError('unlabelled control row: %r' % norm(text_of(row))[:80])
        txt = norm(text_of(row))
        if txt:
            warn = next((k for k in iter_nodes(row) if k.tag == 'span' and 'red' in k.attrs.get('style', '')), None)
            form['intro'] = (txt, norm(text_of(warn)) if warn else '')
        return
    label = norm(text_of(label_node))
    after = Node('x'); after.kids = nodes[nodes.index(label_node) + 1:]
    rest_text = norm(text_of(after))
    if label == 'HTTP Method':
        sel = next((c for c in controls if c.tag == 'select'), None)
        if sel:
            form['method_options'] = [norm(text_of(o)) for o in kids(sel) if o.tag == 'option' and norm(text_of(o))]
        else:
            form['method'] = rest_text
        return
    if label == 'URI Pattern':
        span = next((k for k in iter_nodes(row) if k.tag == 'span' and k.attrs.get('data-uripattern')), None)
        if span:
            form['uri'] = span.attrs['data-uripattern']
        elif controls:                                              # User: "/rest/X/userInterest/<input name=ID>"
            parts = []
            for k in after.kids:
                if isinstance(k, str):
                    parts.append(k.strip())
                elif k.tag == 'input':
                    parts.append('{%s}' % k.attrs['name'].lower())
                    form['fields'].append(dict(role='path', name=k.attrs['name'], label='ID', value=k.attrs.get('value', '')))
            form['uri'] = ''.join(parts)
        elif controls == [] and rest_text:
            form['uri'] = rest_text
        else:
            form['uri_input'] = True                                   # Create Signature: a URI field
            form['fields'].append(field_from(controls[0], label))
        return
    if label == 'URL Variables':
        for c in controls:
            form['fields'].append(dict(role='query', name=c.attrs['name'], label=c.attrs['name'], value=c.attrs.get('value', ''),
                                       maxlength=c.attrs.get('maxlength', '')))
        return
    if not controls:
        raise ValueError('labelled row without a control: %s' % label)
    form['fields'].append(field_from(controls[0], label))


def field_from(c, label):
    name = c.attrs.get('name', '')
    f = dict(name=name, label=label, maxlength=c.attrs.get('maxlength', ''), readonly='readonly' in c.attrs)
    if c.tag == 'textarea':
        f.update(kind='textarea', value=text_of(c).strip('\n'))
    elif c.tag == 'select':
        f.update(kind='select', options=[norm(text_of(o)) for o in kids(c) if o.tag == 'option'], value='')
    else:
        f.update(kind='input', value=c.attrs.get('value', ''))
    f['role'] = ('cred' if name in CREDS else 'sign' if name in SIGNING else 'path' if name in ('ID', 'ID2')
                 else 'body' if name in ('JSON', 'BIData') else 'contenttype' if name == 'ContentType'
                 else 'uri' if name == 'URIPattern' else 'header')
    return f


def iter_nodes(n):
    for k in n.kids:
        if isinstance(k, Node):
            yield k
            yield from iter_nodes(k)


def new_form(title=None, method=None, uri=None):
    return dict(title=title, method=method, uri=uri, fields=[], intro=None, method_options=None, uri_input=False)


def forms_from_rows(rows, title=None, method=None, uri=None):
    """Rows of one container → forms, split at each .submit (User sections hold up to three)."""
    forms, cur = [], new_form(title, method, uri)
    for r in rows:
        if is_cls(r, 'submit'):
            forms.append(cur); cur = new_form(None, method, uri)
            continue
        if is_cls(r, 'result') or is_cls(r, 'Result'):
            continue
        parse_row(r, cur)
    return forms


def extract(resolved):
    root = parse(resolved)
    page = {'title': None, 'rest_url': None, 'sections': []}
    pending_title = None
    for n in kids(root):
        if n.tag == 'h1':
            page['title'] = norm(text_of(n))
        elif n.tag == 'div' and norm(text_of(n)).startswith('REST URL:') and not kids(n):
            page['rest_url'] = norm(text_of(n))[len('REST URL:'):].strip()
        elif n.tag == 'h2':                                          # CRM: a section heading
            page['sections'].append({'title': norm(text_of(n)).rstrip(':'), 'forms': []})
        elif n.tag == 'h3':                                          # CRM: the next form's name
            pending_title = norm(text_of(n))
        elif n.tag == 'div' and is_cls(n, 'settings'):               # CRM: one form
            f = forms_from_rows(kids(n), pending_title, n.attrs.get('data-method'), n.attrs.get('data-uripattern'))[0]
            page['sections'][-1]['forms'].append(f); pending_title = None
        elif n.tag == 'div' and n.attrs.get('id'):                   # a section container
            h2 = next((k for k in kids(n) if k.tag == 'h2'), None)
            title = norm(text_of(h2)) if h2 else n.attrs['id']
            settings = [k for k in kids(n) if is_cls(k, 'settings')]
            if settings:                                             # CRM's Create Signature
                forms = [forms_from_rows(kids(s), None, s.attrs.get('data-method'))[0] for s in settings]
            else:
                forms = forms_from_rows([k for k in kids(n) if k.tag == 'div'])
            page['sections'].append({'title': title, 'forms': forms})
    for s in page['sections']:
        for f in s['forms']:
            f['signature'] = bool(f['method_options']) or f['method'] == 'SIGNATURE'
            if f['signature']:
                f['method'] = None
    return page


# ── Render ────────────────────────────────────────────────────────────────────
def attr(s):
    return html.escape(str(s), quote=True)


def control(f, fid):
    """A DS Input / Textarea / Select for one field."""
    lab = '<label class="%s__label" for="%s">%s</label>'
    ml = ' maxlength="%s"' % attr(f['maxlength']) if f.get('maxlength') else ''
    data = ' data-role="%s" data-name="%s"' % (f['role'], attr(f['name']))
    if f.get('kind') == 'textarea':
        return ('<div class="textarea cc-api-test__wide">%s<textarea class="textarea__control cc-api-test__json" id="%s"%s spellcheck="false">%s</textarea></div>'
                % (lab % ('textarea', fid, esc(f['label'])), fid, data, esc(f['value'])))
    if f.get('kind') == 'select':
        opts = [o for o in f['options'] if o]
        first = opts[0] if opts else ''
        items = ''.join('<li><button type="button" class="sel__menu-item%s" role="option"%s>%s%s</button></li>'
                        % (' sel__menu-item--selected' if o == first else '', ' aria-selected="true"' if o == first else '',
                           esc(o), ' <i data-lucide="check"></i>' if o == first else '') for o in opts)
        return ('<div class="sel cc-api-test__select" data-sel%s><label class="sel__label" id="%s-l">%s</label>'
                '<button class="sel__control" type="button" data-sel-trigger aria-haspopup="listbox" aria-labelledby="%s-l">'
                '<span class="sel__value">%s</span><span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span></button>'
                '<ul class="sel__menu" role="listbox">%s</ul></div>' % (data, fid, esc(f['label']), fid, esc(first), items))
    ro = ' readonly' if f.get('readonly') else ''
    return ('<div class="input">%s<div class="input__wrap"><input type="text" class="input__control" id="%s" value="%s"%s%s%s autocomplete="off" spellcheck="false"></div></div>'
            % (lab % ('input', fid, esc(f['label'])), fid, attr(f['value']), ml, ro, data))


def render_form(f, fid, docs, creds_used):
    if f['signature']:
        return render_signature(f, fid)
    method, uri = f['method'], f['uri']
    doc = docs.get((method, norm_path(uri)))
    path_fields = [x for x in f['fields'] if x['role'] == 'path']
    query = [x for x in f['fields'] if x['role'] == 'query']
    headers = [x for x in f['fields'] if x['role'] in ('header', 'contenttype')]
    body = [x for x in f['fields'] if x['role'] == 'body']
    signing = [x for x in f['fields'] if x['role'] == 'sign']
    creds = [x['name'] for x in f['fields'] if x['role'] == 'cred']
    creds_used.update(creds)

    shown = uri
    for p in path_fields:
        shown = shown.replace('{%s}' % p['name'].lower(), p['value'] or '{%s}' % p['name'].lower())
    head = ('<h3 class="cc-api-help__h3">%s</h3>' % esc(f['title'])) if f['title'] else ''
    route = ('<p class="cc-api-help__route"><span class="badge badge--%s cc-api-help__method">%s</span>'
             '<code class="cc-api-help__path" data-uri-shown>%s</code></p>' % (TONE[method], method, esc(shown)))
    fields = ''.join(control(x, '%s-%s' % (fid, x['name'].lower())) for x in path_fields + query + headers)
    fields_html = '<div class="cc-api-test__fields">%s</div>' % fields if fields else ''
    body_html = ''.join(control(x, '%s-%s' % (fid, x['name'].lower())) for x in body)

    override = ''
    if creds:
        override = ('<details class="cc-api-test__override"><summary class="cc-api-test__summary">Use different credentials</summary>'
                    '<div class="cc-api-test__fields">%s</div></details>' % ''.join(
                        control(dict(role='cred-override', name=c, label=CRED_LABEL[c], value='', kind='input'), '%s-o-%s' % (fid, c.lower()))
                        for c in creds))
    sign = ('<div class="cc-api-test__signing"><div class="cc-api-test__fields">%s</div></div>'
            % ''.join(control(x, '%s-%s' % (fid, x['name'].lower())) for x in signing))
    actions = ('<div class="cc-api-test__actions">'
               '<button type="button" class="btn btn--secondary" data-sign><i data-lucide="pen-line" aria-hidden="true"></i><span>Sign</span></button>'
               '<button type="button" class="btn btn--primary" data-send><i data-lucide="send" aria-hidden="true"></i><span>Send request</span></button>'
               '</div>')
    response = '<div class="cc-api-test__response" data-response aria-live="polite" hidden></div>'
    data = ' data-method="%s" data-uri="%s" data-creds="%s" data-doc-status="%s" data-doc-body="%s"' % (
        method, attr(uri), ','.join(creds), attr(doc[0] if doc else ''), attr(doc[1] if doc else ''))
    return ('<article class="cc-api-help__endpoint cc-api-test__form" id="%s"%s>%s%s%s%s%s%s%s%s</article>'
            % (fid, data, head, route, fields_html, body_html, override, sign, actions, response))


def render_signature(f, fid):
    intro_txt, warn = f['intro'] or ('', '')
    # Classic's sentence, split around its red warning: "…MD5. <Do not call…>, you need to…"
    before, _, after = intro_txt.partition(warn) if warn else (intro_txt, '', '')
    alert = ('<div class="alert alert--warning" role="note"><div class="alert__header">'
             '<span class="alert__icon"><i data-lucide="triangle-alert" aria-hidden="true"></i></span>'
             '<div class="alert__text"><span class="alert__message">%s<strong>%s</strong>%s</span></div></div></div>'
             % (esc(before), esc(warn), esc(after)))
    method_field = dict(role='sigmethod', name='HTTPMethod', label='HTTP Method', kind='select', options=f['method_options'], value='')
    ordered = []
    for x in f['fields']:
        if x['name'] == 'URIPattern' and method_field not in ordered:
            ordered.append(method_field)
        ordered.append(x)
    if method_field not in ordered:
        ordered.insert(1, method_field)
    inputs = [x for x in ordered if x.get('kind') != 'textarea']
    for x in inputs:
        if x['name'] == 'TimeStamp':
            x['role'] = 'sigtime'
        elif x['name'] == 'APIKey':
            x['role'] = 'sigkey'
        elif x['name'] == 'URIPattern':
            x['role'] = 'siguri'
    ta = [dict(x, role='sigbody') for x in ordered if x.get('kind') == 'textarea']
    return ('<article class="cc-api-help__endpoint cc-api-test__form cc-api-test__form--signature" id="%s" data-signature>%s'
            '<div class="cc-api-test__fields">%s</div>%s'
            '<div class="cc-api-test__actions"><button type="button" class="btn btn--primary" data-sig-submit>'
            '<i data-lucide="pen-line" aria-hidden="true"></i><span>Create signature</span></button></div>'
            '<div class="cc-api-test__response" data-response aria-live="polite" hidden></div></article>'
            % (fid, alert, ''.join(control(x, '%s-%s' % (fid, x['name'].lower())) for x in inputs),
               ''.join(control(x, '%s-%s' % (fid, x['name'].lower())) for x in ta)))


def page_content(page, docs, key):
    creds_used = set()
    sections_html, toc, jump = [], [], []
    rendered = []
    for si, s in enumerate(page['sections']):
        sid = H.slug(s['title'])
        forms = ''.join(render_form(f, '%s-%d' % (sid, i + 1), docs, creds_used) for i, f in enumerate(s['forms']))
        n = sum(1 for f in s['forms'] if not f['signature'])
        rendered.append((sid, s['title'], n, forms))

    # The shared credentials card: the classic page's own <h1> and REST URL, then one field per
    # credential any form sends. The demo pre-fills the API help pages' example key.
    # TODO(backend:ApiProfileTestTool) api-test-demo-key: the key is the docs' example; live leaves it empty.
    cred_fields = ''.join(control(dict(role='shared-cred', name=c, label=CRED_LABEL[c],
                                       value='49yRcAR9J9' if c == 'APIKey' else '', kind='input'), 'cred-%s' % c.lower())
                          for c in CREDS if c in creds_used)
    intro = ('<section class="record-section cc-api-help__section" id="overview" aria-labelledby="overview-title">'
             '<div class="record-section__header"><h2 class="record-section__title" id="overview-title">%s</h2></div>'
             '<div class="record-section__body cc-api-help__body">'
             '<ul class="cc-api-help__kvlist"><li class="cc-api-help__kv"><span class="cc-api-help__key">REST URL</span>'
             '<code class="cc-api-help__value">%s</code></li></ul>'
             '<p class="cc-api-help__desc">Entered once, used by every request on this page. A form can override them.</p>'
             '<div class="cc-api-test__fields" data-shared-creds data-backend-todo="api-test-demo-key">%s</div></div></section>'
             % (esc(page['title']), esc(page['rest_url']), cred_fields))
    rendered.insert(0, ('overview', page['title'], 0, None))

    def count(n):
        return ('<span class="badge badge--neutral badge--sm cc-api-help__count" aria-label="%d endpoints">%d</span>' % (n, n)) if n else ''

    for i, (sid, title, n, forms) in enumerate(rendered):
        toc.append('<li><a class="cc-api-help__toc-link" href="#%s">%s%s</a></li>' % (sid, esc(title), count(n)))
        jump.append('<li><button type="button" class="sel__menu-item%s" role="option"%s data-jump="%s">'
                    '<span class="cc-api-help__jump-label">%s</span>%s%s</button></li>' % (
                        ' sel__menu-item--selected' if i == 0 else '', ' aria-selected="true"' if i == 0 else '', sid,
                        esc(title), count(n), ' <i data-lucide="check"></i>' if i == 0 else ''))
        if forms is None:
            sections_html.append(intro)
        else:
            sections_html.append(
                '<section class="record-section cc-api-help__section" id="%s" aria-labelledby="%s-title">'
                '<div class="record-section__header"><h2 class="record-section__title" id="%s-title">%s</h2></div>'
                '<div class="record-section__body cc-api-help__body">%s</div></section>' % (sid, sid, sid, esc(title), forms))

    return (
        '<div class="cc-control__page cc-api-help cc-api-test" data-api-test="%s">\n'
        '     <div class="cc-api-help__layout">\n'
        '      <div class="sel cc-api-help__jump" data-sel>'
        '<button class="sel__control" type="button" data-sel-trigger aria-haspopup="listbox" aria-label="On this page">'
        '<span class="cc-api-help__jump-current"><span class="sel__value" data-jump-value>%s</span>'
        '<span class="badge badge--neutral badge--sm cc-api-help__count" data-jump-count hidden></span></span>'
        '<span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span></button>'
        '<ul class="sel__menu" role="listbox" aria-label="On this page">%s</ul></div>\n'
        '      <nav class="record-section cc-api-help__toc" aria-label="On this page">'
        '<div class="record-section__header"><h2 class="record-section__title">On this page</h2></div>'
        '<ul class="cc-api-help__toc-list">%s</ul></nav>\n'
        '      <div class="cc-api-help__content">\n%s\n      </div>\n'
        '     </div>\n'
        '    </div>\n' % (key, esc(page['title']), ''.join(jump), ''.join(toc), '\n'.join(sections_html)))


# ── Shell ─────────────────────────────────────────────────────────────────────
PAGES = [
    ('APIProfileUserTestTool.cfm', 'ApiProfileUserTestTool.html', 'API Profile User Test Tool', 'user', 'TASK-470999', '/control/api-profile-user-test-tool'),
    ('APIProfileCRMTestTool.cfm', 'ApiProfileCRMTestTool.html', 'API Profile CRM Test Tool', 'crm', 'TASK-471000', '/control/api-profile-crm-test-tool'),
]


def shell_page(title, content, task, link, cfm):
    s = H.SHELL.read_text()

    def rep(old, new):
        nonlocal s
        if s.count(old) != 1:
            raise ValueError('shell anchor %dx: %r' % (s.count(old), old[:70]))
        s = s.replace(old, new)

    rep('<title>Update — Affino Control Centre</title>', '<title>%s — Affino Control Centre</title>' % title)
    rep('  <link rel="stylesheet" href="UpdateScreen.css">',
        '  <link rel="stylesheet" href="../../../components/Textarea/Textarea.css">\n'
        '  <link rel="stylesheet" href="../ApiProfileHelp/ApiProfileHelp.css">\n'
        '  <link rel="stylesheet" href="ApiProfileTestTool.css">')
    rep('<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">System</a></li>',
        '<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Settings</a></li>\n'
        '              <li class="breadcrumb__separator breadcrumb__separator--collapse" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>\n'
        '              <li class="breadcrumb__item breadcrumb__item--collapse"><a class="breadcrumb__link" href="#">API Profiles</a></li>')
    rep('aria-current="page">Update</li>', 'aria-current="page">%s</li>' % title)
    rep('<h1 class="cc-header__title">Update</h1>', '<h1 class="cc-header__title">%s</h1>' % title)
    page = ('    <!-- Page content: %s on the v3 framework (%s, no-design). GENERATED by _generate.py from\n'
            '         /AfcControl/CC/%s (affino.com): edit the generator, not this markup.\n'
            '         TODO(backend:ApiProfileTestTool) api-test-send: requests are mock (ApiProfileTestTool.js). Live:\n'
            '         each form sends to /rest/<site>/… with its fields as headers, exactly as classic does.\n'
            '         TODO(backend:ApiProfileTestTool) api-test-sign: Sign and Create signature are mock. Live: POST\n'
            '         {thisDoc}?action=hash {APIKey, HTTPMethod, URIPattern, TimeStamp, Body} → the key\'s secret. -->\n    %s'
            % (link, task, cfm, content))
    s2, n = re.subn(r'    <!-- Page content: /control/update on the v3 framework.*?\n    </div>\n(?=  </main>)',
                    lambda m: page, s, count=1, flags=re.S)
    assert n == 1, 'page block'
    s = s2
    s2, n = re.subn(r'  <!-- Confirm before a destructive update.*?</div>\n  </div>\n\n', '', s, count=1, flags=re.S)
    assert n == 1, 'modal'
    s = s2
    rep('  <script src="UpdateScreen.js"></script>',
        '  <script src="../ApiProfileHelp/ApiProfileHelp.js"></script>\n  <script src="ApiProfileTestTool.js"></script>')
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--classic', required=True, type=Path)
    a = ap.parse_args()
    docs = doc_examples(a.classic)
    report = {}
    for cfm, out, title, key, task, link in PAGES:
        page = extract(resolve(a.classic / cfm))
        (HERE / out).write_text(shell_page(title, page_content(page, docs, key), task, link, cfm))
        forms = [f for s in page['sections'] for f in s['forms'] if not f['signature']]
        report[out] = {'sections': len(page['sections']), 'forms': len(forms),
                       'with_doc_example': sum(1 for f in forms if (f['method'], norm_path(f['uri'])) in docs),
                       'no_doc': ['%s %s' % (f['method'], f['uri']) for f in forms if (f['method'], norm_path(f['uri'])) not in docs]}
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    sys.exit(main())
