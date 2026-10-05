"""Markup fragments for the record screens (Article View / Edit / Steps).

ONE source for every fragment: _generate.py builds the three templates from these, and the
component demos were generated from the same functions, so a demo can never show markup the
screen does not render (feedback: a renderer silently drops component markup).

Figma: Lus07xi8pPXLN87sQIyrEt · View & Edit page (3842:146669) · kit section 3861:1902.
Content is what the Figma screens show; step titles/openings are the Hub rows in
steps_data.py (copied from the ArticleSteps prototype; content only — no styling is taken from it).
"""
from html import escape as e

IMG = "../../../../img/record/article-thumb.jpg"  # relative to src/cc/templates/RecordScreen/
PARA_SEP = "\n\n"


def icon(name, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<i data-lucide="{name}"{c} aria-hidden="true"></i>'


def btn(label, kind="secondary", size="", icon_left=None, icon_only=False, attrs="", tag="button", href="#"):
    cls = f"btn btn--{kind}" + (f" btn--{size}" if size else "") + (" btn--icon" if icon_only else "")
    inner = (icon(icon_left) if icon_left else "") + ("" if icon_only else f"<span>{e(label)}</span>")
    aria = f' aria-label="{e(label)}"' if icon_only else ""
    if tag == "a":
        return f'<a class="{cls}" href="{href}"{aria}{attrs}>{inner}</a>'
    return f'<button type="button" class="{cls}"{aria}{attrs}>{inner}</button>'


def chip(label, kind="tertiary", size="xs"):
    """Linked value chip — Button Tertiary xs (view tags, viewer companies)."""
    return btn(label, kind, size, tag="a")


# ── RecordHeader → CC Header Type=Record ─────────────────────────────
def record_header(record_type, title, mode, view_href="ArticleView.html", edit_href="ArticleEdit.html"):
    # Every header button has an icon, and its label sits in .cc-header__btn-label, which the
    # mobile container query hides — icon-only below 768 (the agreed CC header rule; Figma
    # 4105:3637). aria-label keeps the name once the label is display:none.
    def hbtn(label, kind, ic, tag="button", href="#", attrs="", icon_cls=""):
        inner = f'{icon(ic, icon_cls) if icon_cls else icon(ic)}<span class="cc-header__btn-label">{e(label)}</span>'
        cls = f"btn btn--{kind}"
        if tag == "a":
            return f'<a class="{cls}" href="{href}" aria-label="{e(label)}"{attrs}>{inner}</a>'
        return f'<button type="button" class="{cls}" aria-label="{e(label)}"{attrs}>{inner}</button>'
    if mode == "edit":
        # Delete sits between Cancel and Save as Button Type=Alert (Figma 60:2407) and asks first
        # (designer, 2026-10-05; Hub TASK-531782 Q2). It is the one Edit exception to the
        # one-primary + one-secondary rule: Save stays the page's only primary. Cancel is a
        # text-only tertiary on desktop; on mobile, where the labels collapse, it shows its icon and a
        # Secondary border.
        actions = (hbtn("Cancel", "tertiary cc-header__btn--bordered-mobile", "x", tag="a", href=view_href, attrs=' data-keep-width',
                        icon_cls="cc-header__btn-icon--mobile")
                   + hbtn("Delete", "alert", "trash-2", attrs=' aria-haspopup="dialog" data-record-modal-open="modal-delete"')
                   + hbtn("Save", "primary", "check"))
    else:
        actions = (hbtn("Add", "secondary", "plus")
                   + hbtn("Edit", "primary", "pencil", tag="a", href=edit_href, attrs=' data-keep-width')
                   + record_kebab())
    return f'''<div class="cc-header-cq">
        <header class="cc-header cc-header--record">
          <div class="cc-header__title-block">
            <div class="cc-header__title-block-text">
              <p class="cc-header__record-type">{e(record_type)}</p>
              <h1 class="cc-header__title">{e(title)}</h1>
            </div>
          </div>
          <div class="cc-header__actions">{actions}</div>
        </header>
        </div>'''


# The CC header rule (designer, 2026-09-30; Figma CC Header 4105:3640): the header carries at most
# ONE primary and ONE secondary button — every other action goes in the kebab menu at its right
# edge. The Article record's four icon actions from the live screen are those extra actions.
RECORD_MORE = [
    ("Live view", "external-link", ' href="#" target="_blank" rel="noopener" data-backend-todo="record-live-view"'),
    ("Related items", "link-2", ' href="#" data-backend-todo="record-related-items"'),
    ("Go to list", "list", ' href="../ListingScreen/Articles.html" data-keep-width'),
    ("Copy", "copy", ' href="#" data-backend-todo="record-copy"'),
]


def record_kebab(items=RECORD_MORE):
    rows = "".join(f'<li role="none"><a class="dropdown-item dropdown-item--sm" role="menuitem"{attrs}>{icon(ic)}<span data-text="{e(label)}">{e(label)}</span></a></li>'
                   for label, ic, attrs in items)
    return f'''<div class="dropdown">
            <button class="cc-header__kebab dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="More actions">{icon("ellipsis-vertical")}</button>
            <div class="dropdown__panel" role="menu" aria-label="More actions">
              <ul class="dropdown__list">{rows}</ul>
            </div>
          </div>'''


# ── RecordTabs ───────────────────────────────────────────────────────
def record_tabs(active, steps_count=8, actions=False, back="ArticleView.html", sidebar=None, form=None, save_todo="steps-import-save"):
    """sidebar: None = no toggle (Steps); True / False = the "Show sidebar" switch and its default
    (View on, Edit off — designer, 2026-09-29). Desktop only (RecordTabs.css)."""
    def tab(label, href, is_active, count=None):
        cur = ' aria-current="page"' if is_active else ""
        cls = "record-tab record-tab--active" if is_active else "record-tab"
        c = f'<span class="record-tab__count" aria-label="{count} steps">{count}</span>' if count else ""
        return f'<a class="{cls}" href="{href}"{cur} data-keep-width>{e(label)}{c}</a>'
    acts = ""
    if sidebar is not None:
        on = "true" if sidebar else "false"
        active_cls = " toggle--active" if sidebar else ""
        acts = ('<div class="record-tabs__actions">'
                '<span class="record-tabs__sidebar-toggle">'
                f'<button class="toggle toggle--xxs{active_cls}" type="button" role="switch" aria-checked="{on}" '
                'aria-labelledby="record-sidebar-label" aria-controls="record-sidebar" data-record-sidebar>'
                '<span class="toggle__track"><span class="toggle__knob"></span></span></button>'
                '<span id="record-sidebar-label">Show sidebar</span></span></div>')
    if actions:
        acts = ('<div class="record-tabs__actions">'
                + '<a class="btn btn--secondary btn--sm record-tabs__import" href="ArticleStepImport.html" data-keep-width><span>Import</span></a>'
                + ('<button type="button" class="btn btn--primary btn--sm" aria-label="Add a step" '
                   'data-record-modal-open="modal-add-step" aria-haspopup="dialog">'
                   f'{icon("plus")}<span class="record-tabs__btn-label">Add</span></button>')
                + '</div>')
    if form:
        # A form under the tabs (Import step, designer 2026-09-30): the tab actions become the
        # form's Cancel / Save, and the tabs stay so Details still leads back to the article.
        # Icon + label, the label hidden on mobile (RecordTabs.css) like + Add — at ~390 the tabs
        # and Cancel / Save ran into each other (designer, 2026-09-30).
        acts = ('<div class="record-tabs__actions">'
                f'<a class="btn btn--secondary btn--sm" href="{form}" aria-label="Cancel" data-keep-width>'
                f'{icon("x")}<span class="record-tabs__btn-label">Cancel</span></a>'
                f'<a class="btn btn--primary btn--sm" href="{form}" aria-label="Save" data-keep-width data-backend-todo="{save_todo}">'
                f'{icon("check")}<span class="record-tabs__btn-label">Save</span></a>'
                '</div>')
    return f'''<nav class="record-tabs" aria-label="Record sections">
        <div class="record-tabs__list">
          {tab("Details", back, active == "details")}
          {tab("Article steps", "ArticleSteps.html", active == "steps", steps_count)}
        </div>{acts}
      </nav>'''


# ── MediaMeta / MediaPicker ──────────────────────────────────────────
MEDIA = [("Alt text", "Affino 9.0.11.25 - The Refinement Update"), ("File name", "ai-1786980189773-12-4bd8a8.jpg"),
         ("File size", "108 KB"), ("Dimensions", "800 × 800")]


def media_meta(src=IMG, rows=None):
    """View-mode image value: thumbnail + alt-text caption; the file facts sit behind an
    "Image details" button in a DS Dropdown panel (designer chose layout B, 2026-09-29 —
    the Google Drive / Photos "details" pattern). Dropdown.js owns open / outside-click / Escape."""
    rows = rows or MEDIA
    alt = rows[0][1]
    rows = "".join(f'<dt class="media-meta__term">{e(a)}</dt><dd class="media-meta__value">{e(b)}</dd>' for a, b in rows)
    return f'''<div class="media-meta">
              <img class="media-meta__thumb" src="{src}" alt="{e(alt)}">
              <div class="media-meta__summary">
                <div class="media-meta__caption">{e(alt)}</div>
                <div class="dropdown media-meta__info" data-dropdown="stay-open">
                  <button type="button" class="btn btn--secondary btn--xs dropdown__trigger" aria-expanded="false" aria-haspopup="dialog"><i data-lucide="info" aria-hidden="true"></i><span>Image details</span></button>
                  <div class="dropdown__panel media-meta__panel" role="dialog" aria-label="Image details">
                    <dl class="media-meta__list">{rows}</dl>
                  </div>
                </div>
              </div>
            </div>'''


def media_picker(label, src=None, modal="modal-media", placeholder="image"):
    """Empty slot: placeholder + Choose file. Filled: the image + pencil (change) + trash (remove)
    (designer, 2026-09-29). Both action sets are rendered; `media-picker--empty` shows one, so
    choosing or removing an image flips it client-side (Selector.js / MediaPicker.js)."""
    thumb = f'<img src="{src}" alt="">' if src else icon(placeholder)
    empty = "" if src else " media-picker--empty"
    return f'''<div class="media-picker{empty}" data-media-picker>
              <button type="button" class="media-picker__thumb" aria-label="Choose {e(label)}" aria-haspopup="dialog" data-selector-open="{modal}" data-placeholder-icon="{placeholder}">{thumb}</button>
              <div class="media-picker__actions">
                {btn("Choose file", "secondary", "sm", icon_left="upload", attrs=f' aria-label="Choose {e(label)}" aria-haspopup="dialog" data-selector-open="{modal}" data-media-choose')}
                {btn(f"Edit {label}", "secondary", "sm", icon_left="pencil", icon_only=True, attrs=f' aria-haspopup="dialog" data-selector-open="{modal}" data-media-edit')}
                {btn(f"Remove {label}", "secondary", "sm", icon_left="trash-2", icon_only=True, attrs=' data-media-remove')}
              </div>
            </div>'''


# ── FieldRow (view) ──────────────────────────────────────────────────
def view_row(label, kind, value=None, compact=False):
    mods = ["field-row"]
    if compact:
        mods.append("field-row--compact")
    if kind in ("paragraph", "media", "rich"):
        mods.append(f"field-row--{'paragraph' if kind == 'rich' else kind}")
    if kind == "tags":
        val = '<div class="field-row__tags">' + "".join(chip(t) for t in value) + '</div>'
    elif kind == "media":
        val = media_meta(rows=value) if value else media_meta()
    elif kind == "rich":
        # Rich text (HTML body) — value is [(tag, text)]; code-first, flagged for Figma (2026-09-29)
        val = '<div class="field-row__rich">' + "".join(f"<{t}>{e(x)}</{t}>" for t, x in value) + '</div>'
    elif kind == "paragraph":
        paras = value if isinstance(value, list) else [value]
        val = "".join(f"<p>{e(p)}</p>" for p in paras)
    else:
        val = e(value)
    return f'''<div class="{' '.join(mods)}">
            <dt class="field-row__label">{e(label)}</dt>
            <dd class="field-row__value">{val}</dd>
          </div>'''


# ── FieldRow (edit) ──────────────────────────────────────────────────
_uid = [0]


def _id(label):
    _uid[0] += 1
    return "f-" + "".join(ch for ch in label.lower() if ch.isalnum())[:24] + f"-{_uid[0]}"


def edit_row(label, kind, value="", required=False, help_text=None, tags=None, modal=None, placeholder="None selected", options=None):
    fid = _id(label)
    req = '<span class="field-row__required" aria-hidden="true">*</span>' if required else ""
    reqattr = " required aria-required=\"true\"" if required else ""
    if kind == "input":
        help_html = f'<span class="input__help" id="{fid}-help">{e(help_text)}</span>' if help_text else ""
        desc = f' aria-describedby="{fid}-help"' if help_text else ""
        ctl = f'''<div class="input">
              <div class="input__wrap"><input id="{fid}" type="text" class="input__control" value="{e(value)}"{reqattr}{desc}></div>
              {help_html}
            </div>'''
    elif kind == "select":
        placeholder = not value or value == "Select..."
        shown = "Select..." if placeholder else value
        vcls = "sel__value sel__value--placeholder" if placeholder else "sel__value"
        ctl = f'''<div class="sel" data-sel>
              <button id="{fid}" class="sel__control" type="button" data-sel-trigger aria-haspopup="listbox">
                <span class="{vcls}">{e(shown)}</span>
                <span class="sel__chevron">{icon("chevron-down")}</span>
              </button>
              <ul class="sel__menu" role="listbox">
                {"".join(f'<li><button type="button" class="sel__menu-item{" sel__menu-item--selected" if o == shown else ""}" role="option">{e(o)}</button></li>' for o in (options or [shown]))}
              </ul>
            </div>'''
        # TODO(backend:RecordScreen): select options are the current value only (unless the field
        #   passes its own list, e.g. Priority 1–30) → option source per field
    elif kind == "textarea":
        paras = value if isinstance(value, list) else [value]
        ctl = f'''<div class="textarea">
              <textarea class="textarea__control" id="{fid}" rows="{8 if len(paras) > 1 else 4}">{PARA_SEP.join(e(p) for p in paras)}</textarea>
            </div>'''
    elif kind == "tagbox":
        items = "".join(f'''<li class="badge badge--neutral"><span>{e(t)}</span><button type="button" class="badge__close" aria-label="Remove {e(t)}">{icon("x")}</button></li>''' for t in tags)
        ctl = f'''<div class="tag-box" data-tag-box>
              <ul class="tag-box__tags" id="{fid}" aria-label="{e(label)}" data-empty="None selected">{items}</ul>
              {btn("Select", "secondary", "sm", attrs=f' data-tag-box-select="{modal}" aria-haspopup="dialog"')}
            </div>'''
    elif kind == "media":
        ctl = media_picker(label)
    # ── New edit types (Article 10007, code-first — flagged for Figma 2026-09-29) ──
    elif kind == "checkbox":
        # The row label IS the checkbox's label (aria-labelledby) — repeating it beside the box read twice.
        ctl = f'''<label class="checkbox">
              <input type="checkbox" class="checkbox__input" id="{fid}" aria-labelledby="{fid}-label"{' checked' if value else ''}>
              <span class="checkbox__indicator">{icon("check")}</span>
            </label>'''
    elif kind in ("date", "datetime"):
        ph = "Select date and time" if kind == "datetime" else "Select date"
        ctl = f'''<div class="datepicker" data-datepicker data-mode="single">
              <div class="input">
                <div class="input__wrap">
                  <input id="{fid}" class="input__control" type="text" readonly placeholder="{ph}" value="{e(value)}" data-datepicker-input aria-label="{e(label)}">
                  {icon("calendar", "datepicker__field-icon")}
                </div>
              </div>
            </div>'''
        # TODO(backend:RecordScreen) record-datetime: DatePicker picks a date only — the time half of
        #   Publish Start / End and Embargo End is not built yet → DatePicker + TimePicker pairing
    elif kind == "lookup":
        ctl = f'''<div class="field-row__lookup">
              <div class="input"><div class="input__wrap"><input id="{fid}" type="text" class="input__control" value="{e(value)}" readonly placeholder="{e(placeholder)}" data-selector-value></div></div>
              {btn("Select", "secondary", attrs=f' aria-haspopup="dialog" aria-label="Select {e(label)}"' + (f' data-selector-open="{modal}"' if modal else ' data-backend-todo="record-lookup"'))}
            </div>'''
    elif kind == "image":
        # One markup for filled and empty slots: the options are always rendered and CSS hides
        # them while the picker is empty, so choosing an image reveals them (designer, 2026-09-29).
        opts = value or {}
        align = opts.get("align")
        # Alignment is a SegmentedControl with icon + text (designer, 2026-09-29; was three radios):
        # the editor-standard alignment control, and 40px tall so it sits level with Width.
        segs = "".join(f'''<button class="seg-control__btn{' seg-control__btn--active' if a == align else ''}" type="button" role="radio" aria-checked="{'true' if a == align else 'false'}" data-value="{a}">{icon(ic)}<span class="seg-control__btn-label">{a}</span></button>'''
                       for a, ic in (("Left", "align-left"), ("Center", "align-center"), ("Right", "align-right")))
        if opts.get("alt_only"):
            # Thumbnails carry alt text only; caption, alignment and width are for content images
            # (designer, 2026-09-29).
            ctl = f'''<div class="field-row__image">
              {media_picker(label, IMG if opts.get("src") else None)}
              <div class="field-row__image-options field-row__image-options--single">
                {_mini_input("Alt text", opts.get("alt", ""), fid + "-alt")}
              </div>
            </div>'''
        else:
            ctl = f'''<div class="field-row__image">
                  {media_picker(label, IMG if opts.get("src") else None)}
                  <div class="field-row__image-options">
                    {_mini_input("Alt text", opts.get("alt", ""), fid + "-alt")}
                    {_mini_input("Caption", opts.get("caption", ""), fid + "-cap")}
                    <div class="field-row__image-option"><span class="input__label" id="{fid}-align">Alignment</span><div class="seg-control field-row__align" role="radiogroup" aria-labelledby="{fid}-align" data-seg-control>{segs}</div></div>
                    <div class="field-row__image-option"><span class="input__label">Width</span>{_mini_select(opts.get("width") or "100%")}</div>
                  </div>
                </div>'''
    elif kind == "rich":
        # TinyMCE, as the live CC runs it (RichTextEditor, designer 2026-09-29). The textarea holds
        # the field's HTML and stays the form value; without the CDN it is a plain textarea.
        html = "".join(f"<{t}>{e(x)}</{t}>" for t, x in value) if value else ""
        ctl = f'''<div class="textarea rich-text">
              <textarea class="textarea__control" id="{fid}" rows="10" data-rich-text>{e(html)}</textarea>
            </div>'''
    elif kind == "color":
        # ColorPickerInput (DS component) — swatch + hex over a hidden native picker. Empty is
        # allowed (legacy default ""), so it reads "None" until a colour is chosen; RecordScreen.js
        # keeps the swatch and hex in step with the picker (code-first, 2026-09-30).
        hexv = value or ""
        ctl = f'''<label class="color-picker-input" data-color-input>
              <span class="color-picker-input__swatch"><span class="color-picker-input__swatch-inner"{f' style="background-color: {e(hexv)};"' if hexv else ''}></span></span>
              <span class="color-picker-input__value">{e(hexv.upper()) if hexv else "None"}</span>
              <input type="color" class="color-picker-input__native" id="{fid}" value="{e(hexv or '#000000')}" aria-label="{e(label)}">
            </label>'''
        # TODO(backend:RecordScreen) record-color: native picker cannot be emptied → a Clear action + hex text entry
    elif kind == "multimedia":
        # Multimedia — a MediaPicker slot whose Selector lists every media type (designer, 2026-09-29).
        ctl = media_picker(label, modal="modal-multimedia", placeholder="film")
    elif kind == "file":
        ctl = f'''<div class="media-picker">
              <span class="media-picker__thumb">{icon("file-audio")}</span>
              <div class="media-picker__actions">
                {btn("Choose file", "secondary", "sm", icon_left="upload", attrs=f' aria-label="Choose {e(label)}" data-backend-todo="record-media-file"')}
              </div>
            </div>'''
    lab_tag = "label" if kind in ("input", "textarea", "rich", "lookup", "date", "datetime") else "span"
    lab_for = f' for="{fid}"' if kind in ("input", "textarea", "rich", "lookup", "date", "datetime") else f' id="{fid}-label"'
    row_mods = "field-row field-row--edit" + (" field-row--check" if kind == "checkbox" else "")
    return f'''<div class="{row_mods}">
            <{lab_tag} class="field-row__label"{lab_for}>{e(label)}{req}</{lab_tag}>
            <div class="field-row__value">{ctl}</div>
          </div>'''


def _mini_input(label, value, fid):
    return f'''<div class="input">
                  <label class="input__label" for="{fid}">{e(label)}</label>
                  <div class="input__wrap"><input id="{fid}" type="text" class="input__control" value="{e(value)}"></div>
                </div>'''


def _mini_select(value):
    return f'''<div class="sel" data-sel>
                  <button class="sel__control" type="button" data-sel-trigger aria-haspopup="listbox"><span class="sel__value">{e(value)}</span><span class="sel__chevron">{icon("chevron-down")}</span></button>
                  <ul class="sel__menu" role="listbox">{''.join(f'<li><button type="button" class="sel__menu-item{" sel__menu-item--selected" if w == value else ""}" role="option">{w}</button></li>' for w in ("100%", "75%", "66%", "50%", "33%", "25%"))}</ul>
                </div>'''


# ── RecordSection ────────────────────────────────────────────────────
def prompt_modifier(pid, title, fills, prompt, outputs):
    """PromptModifier (code-first, designer 2026-09-29) — the section's AI prompt: a one-line
    preview + Generate always visible; Edit prompt discloses the prompt textarea and Copy.
    `outputs` are the MOCK results Generate writes into the section's fields, in order."""
    import json
    return f'''<div class="prompt-modifier" data-prompt-modifier data-outputs="{e(json.dumps(outputs))}">
            <div class="prompt-modifier__head">
              <span class="prompt-modifier__icon">{icon("sparkles")}</span>
              <div class="prompt-modifier__text">
                <p class="prompt-modifier__title">{e(title)}<span class="prompt-modifier__fills">{e(fills)}</span></p>
                <p class="prompt-modifier__preview" data-prompt-preview>{e(prompt)}</p>
              </div>
              <div class="prompt-modifier__actions">
                {btn("Edit prompt", "tertiary", "sm", icon_left="chevron-down", attrs=f' aria-expanded="false" aria-controls="{pid}-body" data-prompt-toggle')}
                {btn("Generate", "secondary", "sm", icon_left="sparkles", attrs=' data-prompt-generate data-backend-todo="record-prompt-generate"')}
              </div>
            </div>
            <div class="prompt-modifier__body" id="{pid}-body" hidden>
              <div class="textarea">
                <label class="input__label" for="{pid}-prompt">Prompt modifier</label>
                <textarea class="textarea__control" id="{pid}-prompt" rows="4" data-prompt-text>{e(prompt)}</textarea>
              </div>
              <div class="prompt-modifier__body-foot">
                <span class="prompt-modifier__hint">Sent with the article's content each time you generate.</span>
                {btn("Copy prompt", "tertiary", "sm", icon_left="copy", attrs=' data-prompt-copy')}
              </div>
            </div>
            <p class="prompt-modifier__status" data-prompt-status aria-live="polite" hidden><span data-prompt-status-text></span>{btn("Undo", "tertiary", "sm", icon_left="undo-2", attrs=' data-prompt-undo')}</p>
          </div>'''


def record_section(title, rows_html, mode, prompt=""):
    sid = "sec-" + "".join(ch for ch in title.lower() if ch.isalnum())
    body_tag = "dl" if mode == "view" else "div"
    return f'''<section class="record-section" aria-labelledby="{sid}">
          <div class="record-section__header"><h2 class="record-section__title" id="{sid}">{e(title)}</h2></div>
          <{body_tag} class="record-section__body">{prompt}{''.join(rows_html)}</{body_tag}>
        </section>'''


# ── FactPanel / FactList ─────────────────────────────────────────────
def fact_panel(title, content, subtitle=None, badge=None, action=None):
    pid = "panel-" + "".join(ch for ch in title.lower() if ch.isalnum())
    sub = f'<p class="fact-panel__subtitle">{e(subtitle)}</p>' if subtitle else ""
    trail = ""
    if badge or action:
        b = f'<span class="badge badge--pill badge--success"><span class="badge__dot"></span><span>{e(badge)}</span></span>' if badge else ""  # Badge Type=Indicator (designer, 2026-09-28)
        trail = f'<div class="fact-panel__trailing">{b}{action or ""}</div>'
    return f'''<section class="fact-panel" aria-labelledby="{pid}">
          <div class="fact-panel__header">
            <div class="fact-panel__title-block"><h2 class="fact-panel__title" id="{pid}">{e(title)}</h2>{sub}</div>{trail}
          </div>
          {content}
        </section>'''


def fact_list(rows):
    out = []
    for label, v in rows:
        out.append(view_row(label, "tags" if isinstance(v, list) else "text", v, compact=True))
    return f'<dl class="fact-list">{"".join(out)}</dl>'


# ── ViewerItem / ViewerList ──────────────────────────────────────────
def viewer_item(name, role, time, companies, seed):
    chips = "".join(chip(c) for c in companies)
    return f'''<li class="viewer-item">
              <div class="avatar"><img class="portrait" src="https://i.pravatar.cc/64?u={seed}" alt=""></div>
              <div class="viewer-item__body">
                <div class="viewer-item__identity">
                  <div class="viewer-item__who"><p class="viewer-item__name">{e(name)}</p><p class="viewer-item__role">{e(role)}</p></div>
                  <p class="viewer-item__time">{e(time)}</p>
                </div>
                <div class="viewer-item__companies">{chips}</div>
              </div>
            </li>'''


VIEWERS = [("Simon Hassell", "Principal, Argutus Consulting", "5 days, 18hrs", ["Argutus", "Playbook Media Trading Company"], "simon"),
           ("David Delawa", "VP of Media, Ocean Media Group Ltd", "5 days, 18hrs", ["Ocean Media Group Ltd"], "david")]


def viewer_list(viewers=None, todo="viewers-add-to-contact-list", empty="No recent viewers yet."):
    viewers = VIEWERS if viewers is None else viewers
    if not viewers:
        # The live record can have no recent viewers — say so rather than show an empty list.
        return f'<p class="fact-panel__empty">{e(empty)}</p>'
    items = "".join(viewer_item(*v) for v in viewers)
    return f'''<div class="viewer-list">
            <ul class="viewer-list__items">{items}</ul>
            <!-- TODO(backend:RecordScreen): "Add to Contact List" → add these people to a contact list (list picker + POST) -->
            {btn("Add to Contact List", "secondary", "sm", attrs=f' data-backend-todo="{todo}"')}
          </div>'''


# ── AdvisoryItem / AdvisoryList ──────────────────────────────────────
ADVISORIES = [("No social sharelines entered", "Enter alternative versions of the title for visitors to easily share your content.", True),
              ("No topics selected", "Add topics and keywords so this article appears in related listings and search.", False),  # placeholder copy — Figma draws only the first description
              ("Use subheadings (H2, H3) in the Main Body", "Break the Main Body into sections with H2 and H3 headings to help readers and search engines scan it.", False)]  # placeholder copy


def advisory_item(i, title, desc, expanded):
    did = f"advisory-{i}"
    cls = "advisory-item advisory-item--expanded" if expanded else "advisory-item"
    body = f'<p class="advisory-item__description" id="{did}">{e(desc)}</p>' if desc else f'<p class="advisory-item__description" id="{did}" data-backend-todo="seo-advisory-detail"></p>'
    verb = "Hide details: " if expanded else "Show details: "
    return f'''<li class="{cls}">
              <div class="advisory-item__row">
                {icon("circle-alert", "advisory-item__icon")}
                <p class="advisory-item__title">{e(title)}</p>
                <button type="button" class="btn btn--secondary btn--xs btn--icon advisory-item__toggle" data-advisory-toggle aria-expanded="{'true' if expanded else 'false'}" aria-controls="{did}" aria-label="{verb}{e(title)}">{icon("plus", "advisory-item__plus")}{icon("minus", "advisory-item__minus")}</button>
              </div>
              {body}
            </li>'''


def advisory_list():
    # TODO(backend:RecordScreen): advisories + their descriptions come from the SEO health check → SEO health endpoint
    return '<ul class="advisory-list">' + "".join(advisory_item(i + 1, *a) for i, a in enumerate(ADVISORIES)) + '</ul>'


# ── PerformanceSummary ───────────────────────────────────────────────
def stat(title, value, colour, ico):
    return f'''<div class="stat-card stat-card--sm stat-card--{colour}">
                <div class="stat-card__icon-wrap">{icon(ico)}</div>
                <div class="stat-card__text"><p class="stat-card__title">{e(title)}</p><p class="stat-card__value">{e(value)}</p></div>
              </div>'''


PERF = {"impressions": "330", "consumed": "4.68", "bookmarked": "48",
        "accounts": ["Ocean Media Group", "Playbook Media", "Argutus"], "total": "89", "per_day": "4.68"}


def performance_summary(canvas_id="perf-chart", perf=None):
    p = perf or PERF
    chips = "".join(chip(c, "secondary", "xs") for c in p["accounts"])
    return f'''<div class="performance-summary">
            <div class="performance-summary__stats">
              {stat("Total Impressions", p["impressions"], "violet-radix", "chart-no-axes-combined")}
              <div class="performance-summary__stats-row">
                {stat("Consumed", p["consumed"], "indigo", "eye")}
                {stat("Bookmarked", p["bookmarked"], "jade", "book-open")}
              </div>
              <div class="performance-summary__accounts">
                <p class="performance-summary__accounts-heading">Top Account Impressions</p>
                <div class="performance-summary__account-chips">{chips}</div>
              </div>
            </div>
            <div class="performance-summary__chart">
              <div class="chart"><div class="chart__canvas"><canvas id="{canvas_id}" aria-label="Impressions, last 7 days" role="img"></canvas></div></div>
            </div>
            <dl class="performance-summary__totals">
              <div class="performance-summary__total"><dt>Total Impressions</dt><dd>{e(p["total"])}</dd></div>
              <div class="performance-summary__total"><dt>Impression Per Day</dt><dd>{e(p["per_day"])}</dd></div>
            </dl>
            <!-- TODO(backend:RecordScreen): "View full analytics" → the record's analytics report URL -->
            <a class="performance-summary__link" href="#" data-backend-todo="performance-full-analytics"><span>View full analytics</span>{icon("arrow-right")}</a>
          </div>'''


# ── v1 analytics panels (code-first, designer 2026-10-05; Hub TASK-531782 Q1) ──
# v1 draws these six at the end of the Introduction section on View (LiveEditViewDisplay.cfm,
# AfcStandard/CC/*Include.cfm). Here they sit in the sidebar after Audit as a starting point for
# design, each built only from kit parts. v1 hides a panel that has no rows; so does the build.
CONVERSIONS = {  # 12-month series per type — v1's Registration / Purchase switch (user setting)
    "registration": {"total": "64", "per_day": "0.18", "rate": "1.94%",
                     "series": [2, 4, 3, 6, 5, 7, 4, 8, 6, 9, 5, 5]},
    "purchase": {"total": "17", "per_day": "0.05", "rate": "0.52%",
                 "series": [0, 1, 2, 1, 0, 2, 3, 1, 2, 2, 1, 2]},
}
CONVERTERS = [("Hannah Roe", "Purchase · Order 104821", "2 days", ["Ocean Media Group Ltd"], "hannah"),
              ("Tom Brierley", "Registration", "3 days, 4hrs", ["Playbook Media Trading Company"], "tom"),
              ("Priya Nair", "Purchase · Order 104790", "6 days", ["Argutus"], "priya")]
ITINERARY = [("Grace Okafor", "Head of Events, Argutus Consulting", "1 day, 2hrs", ["Argutus"], "grace"),
             ("Leo Martins", "Marketing Director, Ocean Media Group Ltd", "4 days", ["Ocean Media Group Ltd"], "leo")]
REFERRERS = [("linkedin.com/feed", "42"), ("google.com", "31"), ("news.ycombinator.com/item?id=41822", "12"),
             ("bing.com", "6"), ("t.co/x8Kq2LmA", "4")]
LINK_CLICKS = [("affino.com/pricing", "38"), ("affino.com/release-notes/9-0-11", "21"),
               ("docs.affino.com/orders-api", "14")]
CLICKERS = [("Simon Hassell", "affino.com/pricing", "5 days, 18hrs", ["Argutus"], "simon"),
            ("Hannah Roe", "docs.affino.com/orders-api", "6 days", ["Ocean Media Group Ltd"], "hannah")]


def converting_articles(canvas_id="conv-chart"):
    c = CONVERSIONS["registration"]
    switch = (f'<div class="seg-control seg-control--sm" role="radiogroup" aria-label="Conversion type" data-seg-control data-conv-switch>'
              f'<button class="seg-control__btn seg-control__btn--active" type="button" role="radio" aria-checked="true" data-value="registration">Registration</button>'
              f'<button class="seg-control__btn" type="button" role="radio" aria-checked="false" data-value="purchase">Purchase</button></div>')
    body = f'''<div class="performance-summary">
            <div class="performance-summary__stats">
              <div data-conv-stat="total">{stat("Conversions", c["total"], "violet-radix", "target")}</div>
              <div class="performance-summary__stats-row">
                <div data-conv-stat="per_day">{stat("Per Day", c["per_day"], "indigo", "calendar-days")}</div>
                <div data-conv-stat="rate">{stat("Per Impression", c["rate"], "jade", "percent")}</div>
              </div>
            </div>
            <div class="performance-summary__chart">
              <div class="chart"><div class="chart__canvas"><canvas id="{canvas_id}" aria-label="Conversions per month, last 12 months" role="img"></canvas></div></div>
            </div>
          </div>'''
    # TODO(backend:RecordScreen) record-analytics-conversions: Converting Articles → per-type totals + 12-month series (AppUser/OrderConvertingStandardItem)
    return fact_panel("Converting Articles", body, subtitle="Last 12 Months", action=switch).replace(
        '<section class="fact-panel"', '<section class="fact-panel" data-backend-todo="record-analytics-conversions"', 1)


def ranked_table(caption, col, rows, todo, count="Clicks"):
    trs = "".join(f'<tr><td class="record-screen__cell-truncate" title="{e(k)}">{e(k)}</td><td class="table__cell--right">{e(v)}</td></tr>' for k, v in rows)
    return f'''<!-- TODO(backend:RecordScreen): {e(caption)} rows → {todo} -->
          <div class="table-wrap" data-backend-todo="{todo}"><div class="table-wrap__scroll"><table class="table" aria-label="{e(caption)}">
            <thead><tr><th scope="col">{e(col)}</th><th scope="col" class="table__cell--right">{e(count)}</th></tr></thead>
            <tbody>{trs}</tbody>
          </table></div></div>'''


def referring_urls():
    internal = ('<label class="checkbox"><input type="checkbox" class="checkbox__input" data-backend-todo="record-analytics-referrers">'
                f'<span class="checkbox__indicator">{icon("check")}</span>'
                '<span class="checkbox__label"><span class="checkbox__label-text">Show internal URLs</span></span></label>')
    link = ('<a class="performance-summary__link" href="#" data-backend-todo="record-analytics-referrers">'
            f'<span>Referral analysis</span>{icon("arrow-right")}</a>')
    body = ranked_table("Referring URLs", "Referrer", REFERRERS, "record-analytics-referrers", count="Visits") + internal + link
    return fact_panel("Referring URLs", body)


def link_clicks():
    # v1 shows one column per month for 12 months — too wide for the sidebar, so this shows the
    # 12-month total per link (deviation; the monthly grid belongs in full analytics).
    return fact_panel("Link Clicks", ranked_table("Link clicks", "Link", LINK_CLICKS, "record-analytics-link-clicks"), subtitle="Last 12 Months")


def recent_clicks():
    opts = ["All links"] + [l for l, _ in LINK_CLICKS]
    def opt(i, o):
        on = i == 0
        cls = "sel__menu-item sel__menu-item--selected" if on else "sel__menu-item"
        sel = ' aria-selected="true"' if on else ""
        return f'<li><button type="button" class="{cls}" role="option"{sel}>{e(o)}{icon("check") if on else ""}</button></li>'
    menu = "".join(opt(i, o) for i, o in enumerate(opts))
    flt = f'''<div class="sel" data-sel data-backend-todo="record-analytics-recent-clicks-filter">
            <label class="sel__label" for="recent-clicks-link">Link</label>
            <button id="recent-clicks-link" class="sel__control" type="button" data-sel-trigger>
              <span class="sel__value">All links</span><span class="sel__chevron">{icon("chevron-down")}</span>
            </button>
            <ul class="sel__menu" role="listbox">{menu}</ul>
          </div>'''
    return fact_panel("Recent Clicks", flt + viewer_list(CLICKERS, "record-analytics-people"))


def analytics_panels(seminar=True):
    out = [converting_articles(),
           fact_panel("Recent Conversions", viewer_list(CONVERTERS, "record-analytics-people"))]
    if seminar:  # v1: Advanced Seminar only (ContentTypeCode 17)
        out.append(fact_panel("Added to Itinerary", viewer_list(ITINERARY, "record-analytics-people"),
                              subtitle="Advanced Seminar only"))
    out += [referring_urls(), link_clicks(), recent_clicks()]
    return "".join(out)


# ── Sidebar ──────────────────────────────────────────────────────────
FACTS = {
    "Record": [("Article Code", "626353"), ("Batch Reference", "—")],
    "Meta Information": [("Publisher", "Affino"), ("Creator", ["Markus Karlsson"]), ("Rights", "Markus Karlsson"),
                         ("Date", "17:03 02 September 2026"), ("Language", "English")],
    "Index Status": [("Site Search", "03/09/2026 08:32"), ("Affino.com Assistant", "03/09/2026 08:33")],
    "Audit": [("Created", "02/09/2026 17:03"), ("Created by", ["Markus Karlsson"]), ("Last updated", "03/09/2026 08:32"),
              ("Last updated by", ["Luis Montiel"]), ("Last view", "22/09/2026 03:21"), ("Impressions", "89")],
}


def sidebar(canvas_id="perf-chart", facts=None, perf=None, viewers=None, analytics=False):
    facts = facts or FACTS
    expand = '<button type="button" class="btn btn--secondary btn--xs" data-advisory-expand-all aria-expanded="false"><span>Expand all</span></button>'
    return "".join([
        fact_panel("Performance", performance_summary(canvas_id, perf), subtitle="Last 12 Months", badge="LIVE"),
        fact_panel("Recent Viewers", viewer_list(viewers)),
        fact_panel("Record", fact_list(facts["Record"])),
        fact_panel("SEO Health", advisory_list(), action=expand),
        fact_panel("Meta Information", fact_list(facts["Meta Information"])),
        fact_panel("Index Status", fact_list(facts["Index Status"])),
        fact_panel("Audit", fact_list(facts["Audit"])),
        analytics_panels() if analytics else "",
    ])


# ── Record content (Article) ─────────────────────────────────────────
TITLE = "Affino 9.0.11.25 - The Refinement Update"
INTRO = ("Affino 9.0.11.25, The Refinement Update, puts the work into the platform you already run: exports and reports "
         "that finish on real data, screens that hold your place as you move through them, sharper defences in front of "
         "your site, a one-tap unsubscribe for your recipients, and a new Orders API your other systems can read.")
ENTRY = ["Affino 9.0.11.25, The Refinement Update, puts the work into the platform you already run. Exports and reports "
         "finish on real data, screens hold your place as you move through them, the defences in front of your site are "
         "sharper, and your recipients get a one-tap unsubscribe.",
         "Five headline updates lead the release. We rebuilt more than twenty exports this release, spanning content, "
         "commerce, subscriptions, CRM, analytics, ad serving, events, and messaging, along with the listings and reports "
         "behind them."]
PAGE_DESC = ("Exports and reports that finish on real data, screens that hold your place, sharper defences against bots "
             "and spoofing, a one-tap unsubscribe your recipients can actually find, and a new Orders API.")


def view_sections():
    return "".join([
        record_section("Navigation", [view_row("Zone", "tags", ["Affino"]), view_row("Section", "tags", ["Affino Social Commerce Blog"]),
                                      view_row("Sort Order", "text", "1"), view_row("Multi Display", "tags", ["Coronavirus Hub", "AI", "Insight & Blogs"]),
                                      view_row("Priority", "text", "-")], "view"),
        record_section("Introduction", [view_row("Title", "text", TITLE), view_row("Screen Name", "text", "affino-901125-the-refinement-update"),
                                        view_row("Alt Title", "text", "-"), view_row("Thumbnail", "media")], "view"),
        record_section("Main Body", [view_row("Alignment", "text", "Center"), view_row("Main Image", "media"),
                                     view_row("Blog Intro", "paragraph", INTRO), view_row("Blog Entry", "paragraph", ENTRY)], "view"),
        record_section("Topics", [view_row("Category Topic", "tags", ["Affino"]),
                                  view_row("Topic & Keywords", "tags", ["Affino Social Commerce Blog", "Affino", "Saas"])], "view"),
        record_section("SEO", [view_row("Page Title", "text", TITLE), view_row("Page Description", "paragraph", PAGE_DESC)], "view"),
        record_section("Social", [view_row(f"Shareline {i}", "text", "-") for i in (1, 2, 3)], "view"),
    ])


def edit_sections():
    return "".join([
        record_section("Navigation", [edit_row("Zone", "select", "Affino", required=True), edit_row("Section", "select", "Affino Social Commerce Blog", required=True),
                                      edit_row("Sort Order", "input", "1"),
                                      edit_row("Multi Display", "tagbox", tags=["Coronavirus Hub", "AI", "Insight & Blogs"], modal="modal-multi-display"),
                                      edit_row("Priority", "select", "")], "edit"),
        record_section("Introduction", [edit_row("Title", "input", TITLE, required=True),
                                        edit_row("Screen Name", "input", "affino-901125-the-refinement-update", help_text="Used in the article URL."),
                                        edit_row("Alternative Title", "input", ""), edit_row("Thumbnail", "media")], "edit"),
        record_section("Main Body", [edit_row("Alignment", "select", "Center"), edit_row("Main Image", "media"),
                                     edit_row("Blog Intro", "textarea", INTRO), edit_row("Blog Entry", "textarea", ENTRY)], "edit"),
        record_section("Topics", [edit_row("Category Topic", "select", ""),
                                  edit_row("Topics and Keywords", "tagbox", tags=["Platform", "Release", "Security"], modal="modal-topics")], "edit"),
        record_section("SEO", [edit_row("Page Title", "input", TITLE), edit_row("Page Description", "textarea", PAGE_DESC)], "edit"),
        record_section("Social", [edit_row(f"Shareline {i}", "input", "") for i in (1, 2, 3)], "edit"),
    ])


# ── Multi Select Modal (FilterDropdowns Type=Multi Select Modal) ─────
SECTIONS_SOURCE = [("Coronavirus Hub", "", "Coronavirus Hub", "Affino"), ("AI", "", "AI", "Affino"), ("Insight & Blogs", "", "Insight & Blogs", "Affino"),
                   ("Commercial Hub", "", "Commercial Hub", "Affino"), ("Events", "", "Events", "Affino"), ("Affino Social Commerce Blog", "", "Blog", "Affino")]
TOPICS_SOURCE = [("Platform", "", "Topics", "Affino"), ("Release", "", "Topics", "Affino"), ("Security", "", "Topics", "Affino"),
                 ("Affino", "", "Topics", "Affino"), ("Saas", "", "Topics", "Affino"), ("Analytics", "", "Topics", "Affino")]


def facet_chip(name):
    """FilterItem (full slot set) as a Selector facet — Selector.js mounts its value checklist."""
    return f'''<div class="filter-item filter-item--empty filter-item--rounded" data-filter-name="{e(name)}" data-selector-facet>
          <button type="button" class="filter-item__clear" aria-label="Clear {e(name)} filter">{icon("x")}</button>
          <button type="button" class="filter-item__trigger" aria-haspopup="dialog" aria-expanded="false">{icon("plus", "filter-item__add")}<span class="filter-item__name">{e(name)}</span><span class="filter-item__sep" aria-hidden="true">·</span><span class="filter-item__values"></span>{icon("chevron-down", "filter-item__chevron")}</button>
        </div>'''


def multi_select_modal(mid, title, source):
    facets = "".join(facet_chip(f)
                     for f in ["Parent Section", "Channel", "Zone"])
    cb = lambda lbl: f'<label class="checkbox"><input type="checkbox" class="checkbox__input" aria-label="{e(lbl)}"><span class="checkbox__indicator">{icon("check")}</span></label>'
    rows = "".join(f'<tr><td>{cb("Select " + n)}</td><td>{e(n)}</td><td>{e(p) or "—"}</td><td>{e(c)}</td><td>{e(z)}</td><td><a class="filter-dropdowns__linkcell" href="#" aria-label="Open {e(n)}">{icon("external-link")}</a></td></tr>' for n, p, c, z in source)
    return f'''<div class="modal-overlay" id="{mid}" role="presentation" data-selector="multi">
    <div class="modal filter-dropdowns__modal" role="dialog" aria-modal="true" aria-labelledby="{mid}-title">
      <div class="modal__header">
        <h2 class="modal__title" id="{mid}-title">{e(title)}</h2>
        <button class="modal__close" type="button" aria-label="Close">{icon("x")}</button>
      </div>
      <div class="filter-dropdowns__facets filter-dropdowns__modal-facets">{selector_search(mid, "Search by name")}{facets}</div>
      <div class="filter-dropdowns__table-region modal__scroll">
        <div class="datatables"><div class="datatables__body">
          <table class="table">
            <thead><tr>
              <th class="datatables__col--tight">{cb("Select all")}</th>
              <th><button class="datatables__sort datatables__sort--active" type="button">Name {icon("chevrons-up-down")}</button></th>
              <th><button class="datatables__sort" type="button">Parent Section {icon("chevrons-up-down")}</button></th>
              <th><button class="datatables__sort" type="button">Channel {icon("chevrons-up-down")}</button></th>
              <th><button class="datatables__sort" type="button">Zone {icon("chevrons-up-down")}</button></th>
              <th class="datatables__col--tight" aria-label="Open"></th>
            </tr></thead>
            <tbody>{rows}</tbody>
          </table>
          {selector_empty()}
        </div></div>
      </div>
      <div class="modal__footer selector__footer">
        <span class="selector__status" data-selector-count aria-live="polite"></span>
        <button type="button" class="btn btn--secondary" data-modal-cancel>Cancel</button>
        <button type="button" class="btn btn--primary" data-filter-dropdowns-apply>Apply</button>
      </div>
    </div>
  </div>'''


# ── Delete confirm — Modal Type=Confirmation (2464:761), as the Modal demo draws it ──
def delete_confirm_modal(mid, noun, name):
    return f'''<div class="modal-overlay" id="{mid}" role="presentation">
    <div class="modal modal--confirm" role="alertdialog" aria-modal="true" aria-labelledby="{mid}-title" aria-describedby="{mid}-desc">
      <div class="modal__body">
        <div class="modal__icon-wrap">{icon("triangle-alert")}</div>
        <h2 class="modal__confirm-title" id="{mid}-title">Delete this {e(noun)}?</h2>
        <p class="modal__confirm-desc" id="{mid}-desc">“{e(name)}” will be permanently deleted. This cannot be undone.</p>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn--secondary" data-modal-cancel>Cancel</button>
        <!-- TODO(backend:RecordScreen): Delete is mock (closes only) → v1 delete action for the article, then return to the listing -->
        <button type="button" class="btn btn--alert" data-modal-cancel data-backend-todo="record-delete">{icon("trash-2")}<span>Delete</span></button>
      </div>
    </div>
  </div>'''


# ── Selector (code-first, flagged for Figma 2026-09-29) ─────────────
# Four pickers, one pattern (src/cc/patterns/Selector): single / multi / media / sort. The multi
# mode IS the Multi Select Modal above (TagBox owns its Apply); Selector.js adds the search and
# the count to it, and owns the other three outright.
def selector_search(mid, placeholder):
    return f'''<div class="search search--sm selector__search">
          <span class="search__icon">{icon("search")}</span>
          <input class="search__input" type="search" placeholder="{e(placeholder)}" aria-label="{e(placeholder)}" aria-controls="{mid}-results" data-selector-search>
        </div>'''


def selector_empty():
    return f'<p class="selector__empty" data-selector-empty hidden>{icon("search-x")}<span>No matches. Try a different search.</span></p>'


def _modal_head(mid, title, sub=None):
    subline = f'<p class="modal__subtitle">{e(sub)}</p>' if sub else ""
    return f'''<div class="modal__header">
        <div class="modal__title-block"><h2 class="modal__title" id="{mid}-title">{e(title)}</h2>{subline}</div>
        <button class="modal__close" type="button" aria-label="Close">{icon("x")}</button>
      </div>'''


def single_select_modal(mid, title, source, noun="section", columns=("Name", "Parent Section", "Channel", "Zone"),
                        facets=("Parent Section", "Channel", "Zone"), search="Search by name", value=None, total=None):
    """Single select — click a row to choose it and close (designer, 2026-09-29).
    The current value is pinned to the top and ticked when the modal opens (Selector.js).
    Each source row is (name, *other columns); `value(row)` is what the field receives and what
    search matches (default: the name). The Article Step lookup passes "Step — Article", so a
    search matches either column and two same-named steps stay distinguishable."""
    value = value or (lambda r: r[0])
    facets = "".join(facet_chip(f) for f in facets)
    rows = "".join(f'''<tr class="selector__row" data-selector-item="{e(value(r))}">
              <td><button type="button" class="selector__pick" data-selector-pick>{icon("check", "selector__tick")}<span>{e(r[0])}</span></button></td>
              {"".join(f"<td>{e(c) or '—'}</td>" for c in r[1:])}</tr>''' for r in source)
    head = "".join(f"<th>{e(c)}</th>" for c in columns)
    more = (f'<div class="selector__more"><span class="selector__more-count">Showing {len(source)} of {total:,}</span></div>'
            if total else "")
    return f'''<div class="modal-overlay" id="{mid}" role="presentation" data-selector="single">
    <div class="modal filter-dropdowns__modal selector" role="dialog" aria-modal="true" aria-labelledby="{mid}-title">
      {_modal_head(mid, title, f"Choose one {noun}. Click a row to select it.")}
      <div class="filter-dropdowns__facets filter-dropdowns__modal-facets">{selector_search(mid, search)}{facets}</div>
      <div class="filter-dropdowns__table-region modal__scroll" id="{mid}-results">
        <div class="datatables"><div class="datatables__body">
          <table class="table selector__table{' selector__table--pair' if len(columns) == 2 else ''}">
            <thead><tr>{head}</tr></thead>
            <tbody>{rows}</tbody>
          </table>
          {selector_empty()}
        </div></div>
        {more}
      </div>
      <div class="modal__footer selector__footer">
        <span class="selector__status" data-selector-count aria-live="polite"></span>
        <button type="button" class="btn btn--tertiary" data-selector-clear>Clear selection</button>
        <button type="button" class="btn btn--secondary" data-modal-cancel>Cancel</button>
      </div>
    </div>
  </div>'''
    # TODO(backend:RecordScreen) selector-single-source: static rows → paged search over the field's source


GLYPH = {"image": "image", "video": "film", "document": "file-text", "audio": "file-audio"}


def media_select_modal(mid, title, items, total, apply_label="Use image"):
    import json
    """Media item selector — the Media Items listing's grid, as a picker. One pick, then Use image."""
    facets = "".join(facet_chip(f)
                     for f in ["Media Type", "Section", "Creator"])
    tiles = "".join(f'''<li class="selector__tile-item" data-selector-item="{e(t)}" data-facets="{e(json.dumps({"Media Type": f, "Section": sec, "Creator": who}))}">
            <button type="button" class="selector__tile" data-selector-pick aria-pressed="false" data-src="{e(u)}" data-icon="{GLYPH.get(fam, 'file')}" data-meta="{e(f)} · {e(d)}">
              <span class="selector__tile-media">{f'<img src="{e(u)}" alt="" loading="lazy">' if u else f'<span class="selector__tile-glyph">{icon(GLYPH.get(fam, "file"))}</span>'}<span class="selector__tile-check">{icon("check")}</span></span>
              <span class="selector__tile-text"><span class="selector__tile-name">{e(t)}</span><span class="selector__tile-meta">{e(f)} · {e(d)}</span></span>
            </button>
          </li>''' for t, u, f, d, sec, who, fam in items)
    return f'''<div class="modal-overlay" id="{mid}" role="presentation" data-selector="media">
    <div class="modal selector selector--media" role="dialog" aria-modal="true" aria-labelledby="{mid}-title">
      {_modal_head(mid, title)}
      <div class="filter-dropdowns__facets filter-dropdowns__modal-facets selector__toolbar">
        {selector_search(mid, "Search media")}{facets}
        <label class="checkbox selector__mine"><input type="checkbox" class="checkbox__input"><span class="checkbox__indicator">{icon("check")}</span><span class="checkbox__label"><span class="checkbox__label-text">My media</span></span></label>
        {btn("Upload", "secondary", "sm", icon_left="upload", attrs=' data-backend-todo="selector-media-upload"')}
      </div>
      <div class="selector__region modal__scroll" id="{mid}-results">
        <ul class="selector__grid" role="list">{tiles}</ul>
        <div class="selector__empty selector__empty--action" data-selector-empty hidden>
          {icon("image-off")}
          <p class="selector__empty-text">No media matches. Upload it, or try a different search or filter.</p>
          {btn("Upload", "primary", "sm", icon_left="upload", attrs=' data-backend-todo="selector-media-upload"')}
        </div>
        <div class="selector__more"><span class="selector__more-count">Showing {len(items)} of {total}</span>{btn("Load more", "secondary", "sm", attrs=' data-backend-todo="selector-media-source"')}</div>
      </div>
      <div class="modal__footer selector__footer">
        <span class="selector__status" data-selector-count aria-live="polite">Nothing selected</span>
        <button type="button" class="btn btn--secondary" data-modal-cancel>Cancel</button>
        <button type="button" class="btn btn--primary" data-selector-apply disabled>{e(apply_label)}</button>
      </div>
    </div>
  </div>'''
    # TODO(backend:RecordScreen) selector-media-source: 24 demo tiles → media search (filters + paging) and upload


def sort_order_modal(mid, title, section, items, current, noun="articles", this_label="This article",
                     jump_label="Jump to this article", find_label="Find an article"):
    """Sort order — drag by the grip (Edit Columns' handle), ↑ ↓ one place, ⤒ ⤓ to the ends, or
    type a position. Search narrows the list (drag pauses while it does). The record being edited
    is highlighted and scrolled into view on open (designer, 2026-09-29)."""
    n = len(items)
    rows = "".join(f'''<li class="selector__sort-row{' selector__sort-row--current' if code == current else ''}" data-selector-item="{e(t)}" data-sort-key="{code}">
            <span class="selector__grip" data-sort-grip title="Drag to reorder" aria-hidden="true">{icon("grip-vertical")}</span>
            <input class="selector__position" type="text" inputmode="numeric" value="{i}" aria-label="Position of {e(t)}, 1 to {n}" data-sort-position>
            {f'<span class="selector__sort-thumb"><img src="{e(u)}" alt="" loading="lazy"></span>' if u else ''}
            <span class="selector__sort-title">{e(t)}{f'<span class="badge badge--info badge--sm selector__this">{e(this_label)}</span>' if code == current else ''}</span>
            <span class="selector__sort-actions">
              {btn("Move to top", "tertiary", "sm", icon_left="arrow-up-to-line", icon_only=True, attrs=' data-sort-move="top"')}
              {btn("Move up", "tertiary", "sm", icon_left="arrow-up", icon_only=True, attrs=' data-sort-move="up"')}
              {btn("Move down", "tertiary", "sm", icon_left="arrow-down", icon_only=True, attrs=' data-sort-move="down"')}
              {btn("Move to bottom", "tertiary", "sm", icon_left="arrow-down-to-line", icon_only=True, attrs=' data-sort-move="bottom"')}
            </span>
          </li>''' for i, (code, t, u) in enumerate(items, 1))
    return f'''<div class="modal-overlay" id="{mid}" role="presentation" data-selector="sort" data-sort-this="{e(this_label)}">
    <div class="modal selector selector--sort" role="dialog" aria-modal="true" aria-labelledby="{mid}-title">
      {_modal_head(mid, title, f"{n} {noun} in {section}. Drag, use the arrows, or type a position.")}
      <div class="filter-dropdowns__facets filter-dropdowns__modal-facets selector__toolbar">
        {selector_search(mid, find_label)}
        {btn(jump_label, "tertiary", "sm", icon_left="locate-fixed", attrs=' data-sort-jump')}
      </div>
      <p class="selector__hint" data-sort-hint hidden>{icon("info")}<span>Dragging is paused while searching. The arrows and positions still work.</span></p>
      <div class="selector__region modal__scroll" id="{mid}-results">
        <ol class="selector__sort-list" data-sort-list>{rows}</ol>
        {selector_empty()}
      </div>
      <p class="selector__live" aria-live="polite" data-sort-live></p>
      <div class="modal__footer selector__footer">
        <span class="selector__status" data-selector-count></span>
        <button type="button" class="btn btn--tertiary" data-sort-reset>Reset</button>
        <button type="button" class="btn btn--secondary" data-modal-cancel>Cancel</button>
        <button type="button" class="btn btn--primary" data-selector-apply>Save order</button>
      </div>
    </div>
  </div>'''
    # TODO(backend:RecordScreen) selector-sort-order: order kept in the DOM → PUT the section's ordered item ids


def add_step_modal(mid="modal-add-step"):
    """Add a step — which type? (designer, 2026-09-30: a modal of cards, not the legacy chooser
    page). Two ActionCards (Right Chevron + description) link to the two Add screens. The
    Dynamic Form card is disabled when the article already has one (the legacy one-per-article
    rule) — RecordScreen.js applies that for the ?form=exists demo state."""
    def card(title, desc, href, key):
        return f'''<a class="action-card action-card--chevron" href="{href}" data-keep-width data-step-type="{key}">
          <span class="action-card__text"><span class="action-card__title">{e(title)}</span><span class="action-card__desc" data-step-desc>{e(desc)}</span></span>
          {icon("chevron-right", "action-card__chevron")}
        </a>'''
    return f'''<div class="modal-overlay" id="{mid}" role="presentation" data-record-modal>
    <div class="modal modal--sm" role="dialog" aria-modal="true" aria-labelledby="{mid}-title">
      {_modal_head(mid, "Add a step", "Select the type of step you want to add.")}
      <div class="modal__body">
        {card("Content Step", "Text, images and multimedia - the standard Article Step.", "ArticleStepContent.html", "content")}
        {card("Dynamic Form Step", "Places a Dynamic Form inside the article flow.", "ArticleStepForm.html", "form")}
      </div>
    </div>
  </div>'''
    # TODO(backend:RecordScreen) steps-add-form-limit: ?form=exists is a demo switch → the article's
    #   own "has a Dynamic Form Step" flag decides whether the Dynamic Form card is available


# ── StepsTable ───────────────────────────────────────────────────────
COLS = [("Order", True), ("Title", True), ("Type", True), ("Float", True), ("Design frame", False), ("Lookup", False),
        ("Created by", True), ("Publish start", True), ("Live", False)]


def step_detail(body_html):
    chips = "".join(f'<li class="step-detail__chip">{icon(i)}{e(t)}</li>' for i, t in [("image-off", "No step image"), ("image-off", "No presentation image"), ("film", "No multimedia")])
    return f'''<div class="step-detail">
                <ul class="step-detail__media" aria-label="Step media">{chips}</ul>
                <div class="step-detail__body">{body_html}</div>
                <a class="step-detail__link" href="#" data-backend-todo="steps-read-full">Read the full step {icon("arrow-right")}</a>
              </div>'''


# The static steps_table() was retired 2026-09-29: the steps table now runs on the listing engine.

import os as _os
_HERE = _os.path.dirname(_os.path.abspath(__file__))


def _swap(src, old, new):
    assert old in src, f"anchor not found: {old[:60]!r}"
    return src.replace(old, new, 1)


def _articles_html():
    return open(_os.path.join(_HERE, "../ListingScreen/Articles.html"), encoding="utf-8").read()


def listing_datatable():
    ARTICLES = _articles_html()
    a = ARTICLES.index('        <div class="datatables datatables--orders"')
    b = ARTICLES.index("\n        </div>\n", a) + len("\n        </div>")
    block = ARTICLES[a:b]
    block = _swap(block, '<div class="datatables datatables--orders" data-backend-todo="listing-orders-rows">',
                 '<div class="datatables datatables--orders steps-table" data-steps-table data-backend-todo="steps-rows">')
    toggle = ('<span class="steps-table__details-toggle">\n'
              '                <button class="toggle toggle--xxs" type="button" role="switch" aria-checked="false" '
              'aria-labelledby="steps-details-label" data-steps-details><span class="toggle__track"><span class="toggle__knob"></span></span></button>\n'
              '                <span id="steps-details-label">Show details</span>\n'
              '              </span>\n              ')
    block = _swap(block, '<div class="dropdown cc-listing__columns"', toggle + '<div class="dropdown cc-listing__columns"')
    return block


def steps_listing():
    return f'''<!-- TODO(backend:RecordScreen) steps-rows: steps, paging and the step bodies are demo data (Hub article
             626347) → the article's steps endpoint. Column prefs / overflow mode ride on the listing's
             listing-column-prefs + listing-overflow-mode items. -->
      <div class="cc-listing" data-listing="article-steps">
{listing_datatable()}
      </div>'''

