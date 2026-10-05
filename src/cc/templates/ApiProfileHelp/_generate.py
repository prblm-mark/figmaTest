#!/usr/bin/env python3
"""Generate the two API Profile help screens from their classic CFML (TASK-470997, TASK-470998).

    python3 _generate.py --classic <dir>

<dir> holds the classic sources, read from affino.com's tree (AffinoComrz):
    APIProfileUserHelp.cfm   AfcControl/CC/
    APIProfileCRMHelp.cfm    AfcControl/CC/
    AccountsAction.cfc, UsersAction.cfc, UserAccountsAction.cfc   AfcControl/rest/
    Subscription.cfc         AfcCRM/cfc/

WHY GENERATED. Both screens are long-form API documentation (624 + 1,458 lines). The task's
"done when" is that the content carries over complete and correctly formatted, so the words come
from the source mechanically and are never retyped:

  1. ColdFusion is resolved here. #ReplaceNoCase(Application.DB,…)# is the site name, #Hash()# and
     calculateSignature() are computed with hashlib (the classic page computes them per request),
     <cfset TimeStamp = GetTimestamp()> is a fixed demo instant, and the field lists that the CRM
     page builds from each REST action's getFieldsDef() are evaluated from those CFCs' own struct
     literals, with the page's own loop rules (required-on-create / -update, AutoScript, Allowed).
  2. <!--- … ---> blocks are dropped, exactly as ColdFusion drops them. On the CRM page that
     removes four sections that never render live (User Preferences, User Subscriptions,
     Permissions, Preferences).
  3. The remaining HTML (which has unclosed tags) is parsed tolerantly and mapped onto the DS:
     each <h2> becomes a RecordSection card, each endpoint an article with a method Badge and
     its path, key: value example rows a two-column list, JSON and hashes AutoAnswers' code style.

The output pages are committed; this script is how they were made. Edit the script, not the
HTML, and re-run it.
"""
import argparse
import hashlib
import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
SHELL = HERE.parent / 'UpdateScreen' / 'UpdateScreen.html'

# ── The demo's fixed environment ─────────────────────────────────────────────
# Classic evaluates these per request. The demo pins them so the page is stable; every hash below
# is still computed from them, so a reviewer can re-derive any value.
ENV = {
    'Application.DB': 'AffinoComrz',            # affino.com → sitename "Comrz"
    'CGI.HTTP_HOST': 'www.affino.com',
    'CGI.HTTP_USER_AGENT': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'Session.IPAddress': '203.0.113.24',        # RFC 5737 documentation range
}
NOW = dict(y=2026, mo=10, d=5, h=14, mi=30, s=15, ms=250)
UUID = '6c1f0a4e-9b2d-4e7a-a3f5c8d90e1b2a47'     # createUUID(): CF's 8-4-4-16 form, lower-cased


# ── A ColdFusion expression evaluator (the subset these two pages use) ───────────
class CF:
    def __init__(self, env):
        self.env = dict(env)

    # Text with #expr# interpolation (CFML output, or the inside of a "…" / '…' literal).
    def interpolate(self, s):
        out, i = [], 0
        while i < len(s):
            c = s[i]
            if c == '#':
                if s.startswith('##', i):
                    out.append('#'); i += 2; continue
                val, i = self.expr(s, i + 1)
                if i >= len(s) or s[i] != '#':
                    raise ValueError('unterminated #expr# near: ' + s[max(0, i - 60):i + 20])
                out.append(str(val)); i += 1
            else:
                out.append(c); i += 1
        return ''.join(out)

    def ws(self, s, i):
        while i < len(s) and s[i] in ' \t\r\n':
            i += 1
        return i

    def expr(self, s, i):
        i = self.ws(s, i)
        c = s[i]
        if c in '"\'':
            return self.string(s, i)
        if c == '{':
            return self.struct(s, i)
        if c == '[':
            return self.array(s, i)
        m = re.compile(r'-?\d+(\.\d+)?').match(s, i)
        if m:
            return (float(m.group()) if m.group(1) else int(m.group())), m.end()
        m = re.compile(r'[A-Za-z_][\w]*(\.[A-Za-z_][\w]*)*').match(s, i)
        if not m:
            raise ValueError('cannot parse expression at: ' + s[i:i + 60])
        name, i = m.group(), m.end()
        j = self.ws(s, i)
        if j < len(s) and s[j] == '(':
            args, kwargs, i = self.args(s, j + 1)
            return self.call(name, args, kwargs), i
        return self.ident(name), i

    def string(self, s, i):
        q, i, buf = s[i], i + 1, []
        while True:
            c = s[i]
            if c == q:
                if s.startswith(q * 2, i):
                    buf.append(q); i += 2; continue
                return ''.join(buf), i + 1
            if c == '#':
                if s.startswith('##', i):
                    buf.append('#'); i += 2; continue
                val, i = self.expr(s, i + 1)
                assert s[i] == '#', 'unterminated interpolation in string'
                buf.append(str(val)); i += 1; continue
            buf.append(c); i += 1

    def args(self, s, i):
        args, kwargs = [], {}
        i = self.ws(s, i)
        if s[i] == ')':
            return args, kwargs, i + 1
        while True:
            i = self.ws(s, i)
            m = re.compile(r'([A-Za-z_]\w*)\s*=(?!=)').match(s, i)
            if m:
                v, i = self.expr(s, m.end()); kwargs[m.group(1)] = v
            else:
                v, i = self.expr(s, i); args.append(v)
            i = self.ws(s, i)
            if s[i] == ',':
                i += 1; continue
            assert s[i] == ')', 'expected ) at ' + s[i:i + 40]
            return args, kwargs, i + 1

    def struct(self, s, i):
        out, i = {}, i + 1
        while True:
            i = self.ws(s, i)
            if s[i] == '}':
                return out, i + 1
            if s[i] in '"\'':
                key, i = self.string(s, i)
            else:
                m = re.compile(r'[A-Za-z_]\w*').match(s, i); key, i = m.group(), m.end()
            i = self.ws(s, i)
            assert s[i] in '=:', 'expected = in struct at ' + s[i:i + 40]
            val, i = self.expr(s, i + 1)
            out[key] = val
            i = self.ws(s, i)
            if s[i] == ',':
                i += 1

    def array(self, s, i):
        out, i = [], i + 1
        while True:
            i = self.ws(s, i)
            if s[i] == ']':
                return out, i + 1
            v, i = self.expr(s, i); out.append(v)
            i = self.ws(s, i)
            if s[i] == ',':
                i += 1

    def ident(self, name):
        if name in self.env:
            return self.env[name]
        parts = name.split('.')
        if parts[0] == 'variables' and parts[1] in self.env and isinstance(self.env[parts[1]], dict):
            return self.env[parts[1]][parts[2]]
        if name.startswith('variables.') and name[10:] in self.env:
            return self.env[name[10:]]
        raise KeyError('unknown identifier ' + name)

    def call(self, name, a, kw):
        n = name.lower()
        if n == 'replacenocase':
            return re.sub(re.escape(a[1]), a[2].replace('\\', '\\\\'), a[0], flags=re.I)
        if n == 'hash':
            alg = (a[1] if len(a) > 1 else 'MD5').upper().replace('-', '')
            return hashlib.new({'MD5': 'md5', 'SHA512': 'sha512', 'SHA256': 'sha256', 'SHA1': 'sha1'}[alg],
                               a[0].encode('utf-8')).hexdigest().upper()
        if n == 'lcase':
            return a[0].lower()
        if n == 'createuuid':
            return UUID.upper()
        if n == 'now':
            return 'NOW'
        if n == 'dateformat':
            assert a[1] == 'yyyy-mm-dd', a[1]
            return '%04d-%02d-%02d' % (NOW['y'], NOW['mo'], NOW['d'])
        if n == 'timeformat':
            assert a[1] == 'HH:mm:ss.l', a[1]
            return '%02d:%02d:%02d.%d' % (NOW['h'], NOW['mi'], NOW['s'], NOW['ms'])
        if n == 'gettimestamp':
            return '%04d-%02d-%02dT%02d:%02d:%02d.%03dZ' % (NOW['y'], NOW['mo'], NOW['d'], NOW['h'], NOW['mi'], NOW['s'], NOW['ms'])
        if n == 'calculatesignature':
            body = kw.get('Body', '')
            md5 = hashlib.md5(body.encode('utf-8')).hexdigest().upper() if body.strip() else ''
            sig = '%s+%s+%s+%s+%s' % (kw['HTTPMethod'], kw['URIPattern'], md5, kw['Secret'], kw['TimeStamp'])
            return hashlib.sha512(sig.encode('utf-8')).hexdigest().upper()
        raise KeyError('unknown function ' + name)


# ── getFieldsDef(): the CFCs' own struct literals, with the CRM page's loop rules ─
def fields_def(classic, component):
    src = (classic / (component + '.cfc')).read_text()
    fn = re.search(r'name="getFieldsDef".*?local\.strReturn\s*=\s*(\{.*?\});\s*return local\.strReturn', src, re.S)
    if not fn:
        raise ValueError('no getFieldsDef in ' + component)
    val, _ = CF({}).expr(fn.group(1), 0)
    return val


def eval_fields_block(block, classic):
    """One of the CRM page's <cfscript> field-list loops → the <li> rows it writes."""
    comp = re.search(r'rest/(\w+)"', block).group(1)
    fd = fields_def(classic, comp)
    flat = re.sub(r'\s+', ' ', block)
    loop_at = flat.index('for (')
    # Find the loop's closing brace.
    depth, j = 0, flat.index('{', loop_at)
    while True:
        if flat[j] == '{':
            depth += 1
        elif flat[j] == '}':
            depth -= 1
            if depth == 0:
                break
        j += 1
    head, loop, tail = flat[:loop_at], flat[loop_at:j + 1], flat[j + 1:]
    lit = lambda part: ''.join(CF({}).string(m.group(1), 0)[0] for m in re.finditer(r'writeoutput\(("(?:[^"]|"")*")\)', part))
    # Every construct in the loop must be one we model; anything else is a new shape — stop.
    known = re.sub(r'writeoutput\("(?:[^"]|"")*"\);', '', loop)
    known = re.sub(r'if \( variables\.Result\.ColumnDetails\[variables\.item\]\.(AutoScript|Required EQ "(Create|Update)"|Allowed EQ "all") ?\) \{', '', known)
    known = re.sub(r'if \( variables\.item NEQ "Password"\) \{', '', known)
    known = re.sub(r'for \( variables\.item in variables\.Result\.Columns \) \{', '', known)
    if known.replace('}', '').strip():
        raise ValueError('unmodelled loop construct in %s: %r' % (comp, known))
    need_auto = '.AutoScript )' in loop
    need_all = 'Allowed EQ "all"' in loop
    skip_pw = 'NEQ "Password"' in loop
    req = re.search(r'Required EQ "(Create|Update)"', loop)
    rows = []
    for col in fd['Columns'].split(','):
        d = fd['ColumnDetails'][col]
        if need_auto and not d.get('AutoScript'):
            continue
        if need_all and str(d.get('Allowed', '')).lower() != 'all':
            continue
        if skip_pw and col == 'Password':
            continue
        flag = ' - required' if req and str(d.get('Required', '')).lower() == req.group(1).lower() else ''
        rows.append('<li>%s%s (%s/%s) : %s</li>' % (col, flag, d['Type'], d['Length'], d['Help']))
    return lit(head) + ''.join(rows) + lit(tail)


def subscription_statuses(classic):
    src = (classic / 'Subscription.cfc').read_text()
    m = re.search(r'local\.SubScriptionStatusOptions\s*=\s*(\[.*?\]);', src, re.S)
    return CF({}).expr(m.group(1), 0)[0]


# ── Classic page → resolved HTML ───────────────────────────────────────────────
def resolve(cfm, classic):
    src = cfm.read_text()
    src = re.sub(r'<!---.*?--->', '', src, flags=re.S)            # CF comments render nothing
    src = src.split('</cfoutput>')[0]                                # trailing UDF definitions
    src = re.sub(r'<style>.*?</style>', '', src, flags=re.S)
    src = src.replace('<cfoutput>', '')
    body = src[src.index('<div class="control">') + len('<div class="control">'):]
    body = body[:body.rindex('</div>')]

    cf = CF(ENV)
    out, i = [], 0
    token = re.compile(r'<cfscript>(.*?)</cfscript>|<cfset\s+variables\.(\w+)\s*=\s*(.*?)>', re.S)
    for m in token.finditer(body):
        out.append(cf.interpolate(body[i:m.start()]))
        i = m.end()
        if m.group(2):                                               # <cfset variables.X = expr>
            cf.env[m.group(2)] = cf.expr(m.group(3), 0)[0]
            continue
        block = m.group(1)
        sm = re.search(r'variables\.strRequest\s*=\s*(\{.*\})\s*;', block, re.S)
        if sm:                                                       # User page: the request struct
            cf.env['strRequest'] = cf.expr(sm.group(1), 0)[0]
        elif 'getFieldsDef' in block:                                # CRM page: field lists
            out.append(eval_fields_block(block, classic))
        elif 'SubscriptionStatusOptions()' in block:                 # Lookups: load the options
            cf.env['SubscriptionStatusOptions'] = subscription_statuses(classic)
        elif 'variables.SubscriptionStatusOptions' in block:         # Lookups: "1 - Active, 2 - …"
            out.append(', '.join('%d - %s' % (n + 1, s) for n, s in enumerate(cf.env['SubscriptionStatusOptions'])))
        else:
            raise ValueError('unmodelled cfscript: ' + block[:200])
    out.append(cf.interpolate(body[i:]))
    return ''.join(out)


# ── Tolerant HTML → tree ──────────────────────────────────────────────────────
VOID = {'br', 'img', 'hr', 'input', 'meta', 'link'}


class Node:
    def __init__(self, tag, attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs or {}), parent, []


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('root'); self.cur = self.root

    def handle_starttag(self, tag, attrs):
        # Browsers' implied end tags, which the classic markup relies on (unclosed <li>, <p>).
        if tag == 'li':
            n = self.cur
            while n is not self.root and n.tag not in ('ul', 'ol'):
                if n.tag == 'li':
                    self.cur = n.parent; break
                n = n.parent
        if tag == 'p' and self.cur.tag == 'p':
            self.cur = self.cur.parent
        node = Node(tag, attrs, self.cur); self.cur.kids.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            # </li> only closes an <li> in list-item scope: a <ul>/<ol> is a boundary, as in the
            # HTML spec. The CRM page has a stray </li> before "Body: {…}" (Get User); browsers
            # ignore it and keep the text, so this must too.
            if tag == 'li' and n.tag in ('ul', 'ol'):
                return
            n = n.parent
        if n is not self.root:                                        # a stray close tag is ignored
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.kids.append(data)


def parse(fragment):
    t = Tree(); t.feed(fragment); t.close()
    return t.root


def text_of(n):
    return ''.join(k if isinstance(k, str) else text_of(k) for k in n.kids)


def norm(s):
    return re.sub(r'\s+', ' ', s).strip()


def esc(s):
    return html.escape(s, quote=False)


def inner(n):
    """Inline content, re-serialised; <b> becomes the parameter-name code style."""
    out = []
    for k in n.kids:
        if isinstance(k, str):
            out.append(esc(re.sub(r'\s+', ' ', k)))
        elif k.tag == 'b':
            out.append('<code class="cc-api-help__name">%s</code>' % esc(norm(text_of(k))))
        elif k.tag == 'a':
            out.append('<a class="cc-api-help__link" href="%s" target="_blank" rel="noopener">%s<i data-lucide="external-link" aria-hidden="true"></i></a>'
                       % (html.escape(k.attrs.get('href', '#')), esc(norm(text_of(k)))))
        elif k.tag in ('ul', 'ol'):
            out.append(render_list(k))
        else:
            out.append(inner(k))
    return ''.join(out)


# ── Tree → DS markup ──────────────────────────────────────────────────────────
METHOD = re.compile(r'^(GET|POST|PUT|DELETE)\s+(/\S.*)$')
TONE = {'GET': 'info', 'POST': 'success', 'PUT': 'warning', 'DELETE': 'danger'}
KV = ('Method', 'Url', 'Header', 'APIKey', 'AccessToken', 'TimeStamp', 'MD5', 'Signature', 'Filter', 'Body', 'Status')
GROUP = re.compile(r'^(Request parameters|Response parameters|Request|Response)\s*:\s*', re.I)


def route(text):
    m = METHOD.match(norm(text))
    return ('<span class="badge badge--%s cc-api-help__method">%s</span><code class="cc-api-help__path">%s</code>'
            % (TONE[m.group(1)], m.group(1), esc(m.group(2)))) if m else None


def render_li(li):
    lists = [k for k in li.kids if isinstance(k, Node) and k.tag in ('ul', 'ol')]
    head_kids = [k for k in li.kids if k not in lists]
    head = Node('x'); head.kids = head_kids
    head_text = norm(text_of(head))

    g = GROUP.match(head_text)
    if g:
        label = g.group(1)[0].upper() + g.group(1)[1:]
        return '<li class="cc-api-help__group"><span class="cc-api-help__label">%s</span>%s</li>' % (
            esc(label), ''.join(render_list(l) for l in lists))

    m = re.match(r'^(%s)\s*:\s*(.*)$' % '|'.join(KV), head_text, re.S)
    if m and (not head_kids or not isinstance(head_kids[0], Node) or head_kids[0].tag == 'b'):
        key, val = m.group(1), m.group(2).strip()
        if lists:
            v = ''.join(render_list(l) for l in lists)
        elif not val:
            v = '<span class="cc-api-help__empty" aria-label="empty">—</span>'
        elif key in ('Status', 'Method'):
            v = '<span class="cc-api-help__text">%s</span>' % esc(val)
        else:
            v = '<code class="cc-api-help__value">%s</code>' % esc(val)
        return '<li class="cc-api-help__kv"><span class="cc-api-help__key">%s</span>%s</li>' % (esc(key), v)

    return '<li>%s</li>' % inner(li).strip()


def render_list(ul):
    rows = []
    for k in ul.kids:
        if isinstance(k, str):                                          # loose text in a list: keep it
            if k.strip():
                loose = Node('li'); loose.kids = [k]
                rows.append(render_li(loose))
            continue
        if k.tag == 'li':
            rows.append(render_li(k))
        elif k.tag in ('ul', 'ol'):                                     # a list misplaced inside a list
            rows.append('<li class="cc-api-help__nested">%s</li>' % render_list(k))
    kv = rows and all('cc-api-help__kv' in r or 'cc-api-help__group' in r for r in rows)
    cls = 'cc-api-help__kvlist' if kv else 'cc-api-help__list'
    return '<ul class="%s">%s</ul>' % (cls, ''.join(rows))


def render_block(n):
    """A top-level element inside a section (or an endpoint)."""
    if isinstance(n, str):
        t = norm(n)
        return '<p class="cc-api-help__p">%s</p>' % esc(t) if t else ''
    t = norm(text_of(n))
    if n.tag in ('ul', 'ol'):
        return render_list(n)
    if n.tag == 'p':
        return '<p class="cc-api-help__p">%s</p>' % inner(n).strip() if t else ''
    if n.tag == 'h3':
        return '<h3 class="cc-api-help__h3">%s</h3>' % esc(t.rstrip(':'))
    if n.tag == 'div':
        ps = [k for k in n.kids if isinstance(k, Node) and k.tag == 'p']
        if ps:                                                        # a worked example: one line per <p>
            lines = [norm(text_of(p)) for p in ps]
            return '<pre class="cc-api-help__code">%s</pre>' % esc('\n'.join(lines).strip('\n'))
        r = route(t)
        if r:
            return '<p class="cc-api-help__route">%s</p>' % r
        if t.startswith('Description:'):
            return '<p class="cc-api-help__desc">%s</p>' % esc(t[len('Description:'):].strip())
        if t.rstrip(':') == 'Example':
            return '<h4 class="cc-api-help__h4">Example</h4>'
        return '<p class="cc-api-help__p">%s</p>' % inner(n).strip() if t else ''
    return inner(n)


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def build_sections(root):
    kids = [k for k in root.kids if not (isinstance(k, str) and not k.strip())]
    sections, cur = [], None
    for k in kids:
        if isinstance(k, Node) and k.tag in ('h1', 'h2'):
            cur = {'title': norm(text_of(k)).rstrip(':'), 'nodes': []}; sections.append(cur)
        else:
            cur['nodes'].append(k)
    return sections


def render_section(sec, first):
    nodes, html_parts, i, endpoints = sec['nodes'], [], 0, 0
    while i < len(nodes):
        n = nodes[i]
        nxt = next((x for x in nodes[i + 1:] if isinstance(x, Node)), None)
        is_h3 = isinstance(n, Node) and n.tag == 'h3'
        own_route = is_h3 and route(text_of(n))
        next_route = is_h3 and nxt is not None and nxt.tag == 'div' and route(text_of(nxt))
        if is_h3 and (own_route or next_route):
            j = i + 1
            while j < len(nodes) and not (isinstance(nodes[j], Node) and nodes[j].tag in ('h3',)):
                j += 1
            body = nodes[i + 1:j]
            if own_route:
                head = '<h3 class="cc-api-help__route cc-api-help__route--title">%s</h3>' % own_route
            else:
                head = '<h3 class="cc-api-help__h3">%s</h3>' % esc(norm(text_of(n)))
            html_parts.append('<article class="cc-api-help__endpoint">%s%s</article>'
                              % (head, ''.join(render_block(b) for b in body)))
            endpoints += 1
            i = j
        else:
            html_parts.append(render_block(n))
            i += 1
    sid = 'overview' if first else slug(sec['title'])
    return sid, endpoints, (
        '<section class="record-section cc-api-help__section" id="%s" aria-labelledby="%s-title">'
        '<div class="record-section__header"><h2 class="record-section__title" id="%s-title">%s</h2></div>'
        '<div class="record-section__body cc-api-help__body">%s</div></section>'
        % (sid, sid, sid, esc(sec['title']), ''.join(html_parts)))


def page_content(resolved, key):
    sections = build_sections(parse(resolved))
    rendered = [render_section(s, n == 0) for n, s in enumerate(sections)]
    toc = ''.join(
        '<li><a class="cc-api-help__toc-link" href="#%s">%s%s</a></li>' % (
            sid, esc(s['title']),
            ('<span class="badge badge--neutral badge--sm cc-api-help__count" aria-label="%d endpoints">%d</span>' % (n, n)) if n else '')
        for (sid, n, _), s in zip(rendered, sections))
    def count(n):
        # The rail's endpoint-count chip, on the narrow Select too (designer, 2026-10-05).
        return ('<span class="badge badge--neutral badge--sm cc-api-help__count" aria-label="%d endpoints">%d</span>' % (n, n)) if n else ''

    # Label FIRST: Select.js copies an option's first child into the trigger on a click.
    jump = ''.join(
        '<li><button type="button" class="sel__menu-item%s" role="option"%s data-jump="%s">'
        '<span class="cc-api-help__jump-label">%s</span>%s%s</button></li>' % (
            ' sel__menu-item--selected' if i == 0 else '', ' aria-selected="true"' if i == 0 else '', sid, esc(s['title']),
            count(n), ' <i data-lucide="check"></i>' if i == 0 else '')
        for i, ((sid, n, _), s) in enumerate(zip(rendered, sections)))
    return (
        # The grid is an INNER wrapper: .cc-control__page is the cs-page container, and an element
        # cannot query its own container, so the narrow rules must land on a descendant.
        '<div class="cc-control__page cc-api-help" data-api-help="%s">\n'
        '     <div class="cc-api-help__layout">\n'
        # Narrow page column: one sticky Select in place of the rail (DS Select, Select.js).
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
        '    </div>\n' % (key, esc(sections[0]['title']), jump, toc, '\n'.join(r[2] for r in rendered)))


# ── Shell ─────────────────────────────────────────────────────────────────────
PAGES = [
    # (classic file, output, <title>, header title, data key, hub task, control link)
    ('APIProfileUserHelp.cfm', 'ApiProfileUserHelp.html', 'API Profile User Help', 'user', 'TASK-470997', '/control/api-profile-user-help'),
    ('APIProfileCRMHelp.cfm', 'ApiProfileCRMHelp.html', 'API Profile CRM Help', 'crm', 'TASK-470998', '/control/api-profile-crm-help'),
]


def shell_page(title, content, task, link, cfm):
    s = SHELL.read_text()

    def rep(old, new):
        nonlocal s
        if s.count(old) != 1:
            raise ValueError('shell anchor %dx: %r' % (s.count(old), old[:70]))
        s = s.replace(old, new)

    rep('<title>Update — Affino Control Centre</title>', '<title>%s — Affino Control Centre</title>' % title)
    rep('  <link rel="stylesheet" href="UpdateScreen.css">', '  <link rel="stylesheet" href="ApiProfileHelp.css">')
    rep('<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">System</a></li>',
        '<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Settings</a></li>\n'
        '              <li class="breadcrumb__separator breadcrumb__separator--collapse" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>\n'
        '              <li class="breadcrumb__item breadcrumb__item--collapse"><a class="breadcrumb__link" href="#">API Profiles</a></li>')
    rep('aria-current="page">Update</li>', 'aria-current="page">%s</li>' % title)
    rep('<h1 class="cc-header__title">Update</h1>', '<h1 class="cc-header__title">%s</h1>' % title)
    page = ('    <!-- Page content: %s on the v3 framework (%s, no-design). GENERATED by _generate.py from\n'
            '         /AfcControl/CC/%s (affino.com): edit the generator, not this markup.\n'
            '         TODO(backend:ApiProfileHelp) api-help-render: the page is static here. Server-side it\n'
            '         renders with the site\'s own name and host and a live timestamp, so every example\n'
            '         MD5 / Signature is recomputed per request, as classic does.\n'
            '         TODO(backend:ApiProfileHelp) api-help-source-errors: the text is classic\'s as written,\n'
            '         typos and example inconsistencies included (listed in ApiProfileHelp.figma-notes.md). -->\n    %s'
            % (link, task, cfm, content))
    s2, n = re.subn(r'    <!-- Page content: /control/update on the v3 framework.*?\n    </div>\n(?=  </main>)',
                    lambda m: page, s, count=1, flags=re.S)
    if n != 1:
        raise ValueError('page block not found in shell')
    s = s2
    s2, n = re.subn(r'  <!-- Confirm before a destructive update.*?</div>\n  </div>\n\n', '', s, count=1, flags=re.S)
    if n != 1:
        raise ValueError('confirm modal not found in shell')
    s = s2
    rep('  <script src="UpdateScreen.js"></script>', '  <script src="ApiProfileHelp.js"></script>')
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--classic', required=True, type=Path)
    a = ap.parse_args()
    for cfm, out, title, key, task, link in PAGES:
        resolved = resolve(a.classic / cfm, a.classic)
        (HERE / out).write_text(shell_page(title, page_content(resolved, key), task, link, cfm))
        print('wrote', out)


if __name__ == '__main__':
    sys.exit(main())
