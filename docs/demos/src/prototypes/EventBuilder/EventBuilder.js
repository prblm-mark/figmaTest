/* Affino Event Builder — prototype behaviour
 *
 * Shared across all 8 screens. No framework, no build step, no imports — the
 * prototype convention (see src/prototypes/SeatingPlanner/SeatingPlanner.js).
 *
 * State lives in the DOM. JS hooks are always `data-eb-*` attributes, kept
 * separate from the BEM classes so styling and behaviour can move independently.
 *
 * Hook contract
 *   [data-eb-goto="file.html"]        navigate to another screen
 *   [data-eb-block="id"]              a selectable block on the canvas
 *   [data-eb-blockrow="id"]           the matching row in the left rail
 *   [data-eb-proposal="id"]           an AI proposal card in the dock
 *     [data-eb-accept] [data-eb-reject] [data-eb-refine]
 *   [data-eb-shape="tabs|scroll"]     page-shape control
 *   [data-eb-device="desktop|mobile"] preview width control
 *   [data-eb-etab="panel"]            event-page tab
 *   [data-eb-panel="panel"]           event-page tab panel
 *   [data-eb-move="up|down"]          reorder a rail row
 *   [data-eb-remove]                  remove a rail row (and its canvas block)
 *   [data-eb-library-open|-close]     block library panel
 *   [data-eb-add="id"]                add a block from the library
 *   [data-eb-toggle]                  a .toggle switch
 *   [data-acc-trigger]                an accordion header
 *   [data-eb-brief] / [data-eb-brief-echo]   carry the brief between screens
 *
 * TODO(backend:EventBuilder): every behaviour below is front-end only. Block
 * order, block membership, field values and AI proposals are held in the DOM
 * and lost on reload (bar the brief, which uses sessionStorage). Real version
 * needs an event-model API — see HANDOVER.md.
 */
(function () {
  'use strict';

  var BRIEF_KEY = 'eb:brief';

  /* ---------------------------------------------------------------- helpers */

  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function one(sel, root) {
    return (root || document).querySelector(sel);
  }

  /* Lucide has to be re-run whenever we inject markup containing <i data-lucide>. */
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function show(el) { if (el) el.removeAttribute('hidden'); }
  function hide(el) { if (el) el.setAttribute('hidden', ''); }

  /* ------------------------------------------------------- screen navigation */

  function initNav() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-eb-goto]');
      if (!target) return;
      var brief = one('[data-eb-brief]');
      if (brief && brief.value) {
        try { sessionStorage.setItem(BRIEF_KEY, brief.value); } catch (err) { /* private mode */ }
      }
      location.href = target.getAttribute('data-eb-goto');
    });
  }

  /* The brief typed on screen 01 is echoed on later screens. */
  function initBriefEcho() {
    var echoes = all('[data-eb-brief-echo]');
    if (!echoes.length) return;
    var stored = null;
    try { stored = sessionStorage.getItem(BRIEF_KEY); } catch (err) { /* ignore */ }
    if (!stored) return;
    echoes.forEach(function (el) { el.textContent = stored; });
  }

  /* ==================================================================== *
   * Block select + the contextual inspector
   * --------------------------------------------------------------------
   * There is no separate "refine" mode. The inspector is contextual:
   *   nothing selected -> page-level panel  ([data-eb-inspector-page])
   *   block selected   -> that block's options, rendered into
   *                       [data-eb-inspector-body] from BLOCK_PANELS below.
   *
   * Panels are generated from config rather than written out per screen so
   * every block gets correct options on every screen without duplicating a
   * few hundred lines of inspector markup per file.
   *
   * Row types: seg | toggle | text | upload | help
   * ==================================================================== */

  var BLOCK_PANELS = {
    hero: { title: 'Hero options', rows: [
      { type: 'seg', label: 'Layout', options: ['Banner', 'Split', 'Minimal'], active: 0 },
      { type: 'upload', label: 'Background image', hint: 'Currently using the brand gradient' },
      { type: 'toggle', label: 'Show countdown', on: false },
      { type: 'toggle', label: 'Show dress code', on: true },
      { type: 'toggle', label: 'Sticky sign-up bar', on: true }
    ]},
    overview: { title: 'Overview options', rows: [
      { type: 'seg', label: 'Columns', options: ['One', 'Two'], active: 0 },
      { type: 'toggle', label: 'Show call-to-action button', on: true },
      { type: 'upload', label: 'Intro image', hint: 'Optional — sits beside the copy' },
      { type: 'help', text: 'Writes to the Introduction and Main text fields.' }
    ]},
    judges: { title: 'Judges options', rows: [
      { type: 'seg', label: 'Max columns', options: ['3', '4', '5'], active: 1 },
      { type: 'text', label: 'Featured judge(s)', value: 'Priya Raman' },
      { type: 'toggle', label: 'Show biog popup', on: true },
      { type: 'toggle', label: 'Show "View profile"', on: true },
      { type: 'toggle', label: 'Let judges write their own bio', on: true },
      { type: 'help', text: '16 people, picked from your CRM. Writes to the Speakers field.' }
    ]},
    sponsors: { title: 'Sponsors options', rows: [
      { type: 'seg', label: 'Logo size', options: ['Small', 'Medium', 'Large'], active: 1 },
      { type: 'seg', label: 'Max columns', options: ['3', '4', '5'], active: 1 },
      { type: 'toggle', label: 'Show tier labels', on: true },
      { type: 'help', text: '4 tiers, 9 sponsors. A section per tier is created for you.' }
    ]},
    keydates: { title: 'Key dates options', rows: [
      { type: 'seg', label: 'Style', options: ['Timeline', 'List'], active: 0 },
      { type: 'toggle', label: 'Mark passed dates as done', on: true },
      { type: 'toggle', label: 'Hide once the event has passed', on: false },
      { type: 'help', text: '4 milestones. Edit the dates in Fields → Dates & calendar.' }
    ]},
    testimonials: { title: 'Testimonials options', rows: [
      { type: 'seg', label: 'Columns', options: ['One', 'Two', 'Four'], active: 1 },
      { type: 'seg', label: 'Style', options: ['Cards', 'Plain'], active: 0 },
      { type: 'toggle', label: 'Show organisation', on: true },
      { type: 'help', text: '4 quotes, added by the assistant from your 2026 page.' }
    ]},
    charity: { title: 'Charity options', rows: [
      { type: 'text', label: 'Total raised to date', value: '£525,000' },
      { type: 'toggle', label: 'Show total raised', on: true },
      { type: 'toggle', label: 'Show past partners', on: true }
    ]},
    winners: { title: 'Previous winners options', rows: [
      { type: 'seg', label: 'Grid columns', options: ['3', '4', '6'], active: 1 },
      { type: 'text', label: 'Media library section', value: '2026 Awards — photos' },
      { type: 'toggle', label: 'Show "View all" link', on: true }
    ]},
    faq: { title: 'FAQ options', rows: [
      { type: 'seg', label: 'Behaviour', options: ['One open', 'Many open'], active: 0 },
      { type: 'toggle', label: 'Open the first question', on: true },
      { type: 'toggle', label: 'Show a search box', on: false },
      { type: 'help', text: '5 questions drafted from your brief.' }
    ]},
    venue: { title: 'Venue options', rows: [
      { type: 'text', label: 'Venue name', value: 'JW Marriott Grosvenor House' },
      { type: 'text', label: 'Address', value: '86–90 Park Lane, London W1K 7TN' },
      { type: 'toggle', label: 'Show map', on: true },
      { type: 'toggle', label: 'Show travel notes', on: true },
      { type: 'help', text: 'The map is generated from the address — no embed code.' }
    ]},
    contact: { title: 'Contact options', rows: [
      { type: 'text', label: 'Contact record', value: 'TPF Club — Awards team' },
      { type: 'toggle', label: 'Show phone number', on: true },
      { type: 'toggle', label: 'Show postal address', on: true }
    ]},
    signup: { title: 'Sign-up options', rows: [
      { type: 'seg', label: 'Position', options: ['Base bar', 'Tab', 'None'], active: 0 },
      { type: 'text', label: 'Catalogue item', value: 'Awards — Entry Fee · £95' },
      { type: 'toggle', label: 'Show price', on: true },
      { type: 'toggle', label: 'Show "Book a table"', on: true },
      { type: 'help', text: 'Uses your existing catalogue items and sign-up positions.' }
    ]}
  };

  /* ==================================================================== *
   * Element-level panels
   * --------------------------------------------------------------------
   * Selection has two levels. Click a block -> block options. Click a
   * tagged element inside it (title, strapline, body copy, CTA…) -> that
   * element's style options, and the text becomes editable in place with a
   * caret and the floating format bar.
   *
   * Panels are keyed by [data-eb-el-type], not by element id, so every
   * block's title shares one "Heading" panel.
   * ==================================================================== */

  var EL_PANELS = {
    heading: { title: 'Heading', editable: true, rows: [
      { type: 'seg', label: 'Size', options: ['S', 'M', 'L', 'XL'], active: 3 },
      { type: 'seg', label: 'Weight', options: ['Regular', 'Semibold', 'Bold'], active: 2 },
      { type: 'seg', label: 'Alignment', options: ['Left', 'Centre'], active: 0 },
      { type: 'seg', label: 'Colour', options: ['Primary', 'Accent', 'White'], active: 2 },
      { type: 'help', text: 'Colours come from the client brand set — no free colour picking per element.' }
    ]},
    strap: { title: 'Strapline', editable: true, rows: [
      { type: 'seg', label: 'Size', options: ['S', 'M', 'L'], active: 1 },
      { type: 'seg', label: 'Colour', options: ['Accent', 'White', 'Muted'], active: 0 },
      { type: 'toggle', label: 'Show on secondary tabs', on: false }
    ]},
    eyebrow: { title: 'Eyebrow', editable: true, rows: [
      { type: 'toggle', label: 'Show eyebrow', on: true },
      { type: 'seg', label: 'Size', options: ['XS', 'S'], active: 0 },
      { type: 'seg', label: 'Colour', options: ['Accent', 'White'], active: 0 },
      { type: 'seg', label: 'Letter spacing', options: ['Normal', 'Wide'], active: 1 }
    ]},
    text: { title: 'Body text', editable: true, rows: [
      { type: 'seg', label: 'Size', options: ['S', 'M', 'L'], active: 1 },
      { type: 'seg', label: 'Alignment', options: ['Left', 'Justify'], active: 0 },
      { type: 'seg', label: 'Max width', options: ['Narrow', 'Wide', 'Full'], active: 0 },
      { type: 'help', text: 'Writes to the Main text field.' }
    ]},
    cta: { title: 'Button', editable: true, rows: [
      { type: 'seg', label: 'Style', options: ['Solid', 'Outline', 'Link'], active: 0 },
      { type: 'seg', label: 'Size', options: ['S', 'M', 'L'], active: 1 },
      { type: 'toggle', label: 'Full width', on: false },
      { type: 'text', label: 'Links to', value: 'Awards — Entry Fee (catalogue)' },
      { type: 'help', text: 'Edit the label directly on the page.' }
    ]},
    meta: { title: 'Detail row', editable: false, rows: [
      { type: 'toggle', label: 'Show date', on: true },
      { type: 'toggle', label: 'Show time', on: true },
      { type: 'toggle', label: 'Show venue', on: true },
      { type: 'toggle', label: 'Show dress code', on: true },
      { type: 'help', text: 'These read from the event\'s own date and venue fields — edit them in Fields.' }
    ]}
  };

  /* ---------------------------------------------------- format bar */

  /* One bar per screen, moved to whichever element is being edited.
     Right-aligned to the element: left-aligned would sit on top of the line
     above (the hero eyebrow, a section eyebrow) and read as missing content. */
  function positionFormatBar(el) {
    var bar = one('[data-eb-formatbar]');
    var canvas = one('.eb-canvas');
    if (!bar || !canvas || !el) return;

    show(bar); /* must be laid out before it can be measured */

    var elRect = el.getBoundingClientRect();
    var cRect = canvas.getBoundingClientRect();
    var barW = bar.getBoundingClientRect().width;

    var top = elRect.top - cRect.top + canvas.scrollTop - 44; /* 44px clears the bar */
    if (top < canvas.scrollTop) top = elRect.bottom - cRect.top + canvas.scrollTop + 8;

    var left = elRect.right - cRect.left + canvas.scrollLeft - barW;
    var min = elRect.left - cRect.left + canvas.scrollLeft;
    if (left < min) left = min; /* narrow elements: don't overhang to the left */

    bar.style.top = top + 'px';
    bar.style.left = left + 'px';
  }

  function hideFormatBar() {
    var bar = one('[data-eb-formatbar]');
    if (!bar) return;
    hide(bar);
    bar.style.top = '';
    bar.style.left = '';
  }

  function caretToEnd(node) {
    try {
      var range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (err) { /* selection API unavailable */ }
  }

  function clearEditables() {
    all('[data-eb-el]').forEach(function (el) {
      el.classList.remove('eb-el--selected');
      var target = one('[data-eb-text]', el) || el;
      target.removeAttribute('contenteditable');
      target.classList.remove('eb-editable--live');
    });
    all('[data-eb-block]').forEach(function (b) {
      b.classList.remove('eb-block--has-selection');
    });
    hideFormatBar();
  }

  function selectElement(el) {
    var type = el.getAttribute('data-eb-el-type');
    var cfg = EL_PANELS[type];
    var label = el.getAttribute('data-eb-label') || type;
    var block = el.closest('[data-eb-block]');

    clearEditables();
    all('[data-eb-block]').forEach(function (b) { b.classList.remove('eb-block--selected'); });
    all('[data-eb-blockrow]').forEach(function (r) { r.classList.remove('eb-blockrow--active'); });

    el.classList.add('eb-el--selected');
    if (block) {
      block.classList.add('eb-block--has-selection');
      var railRow = one('[data-eb-blockrow="' + block.getAttribute('data-eb-block') + '"]');
      if (railRow) railRow.classList.add('eb-blockrow--active');
    }

    /* Editable types get a caret and the format bar */
    if (cfg && cfg.editable) {
      var target = one('[data-eb-text]', el) || el;
      target.setAttribute('contenteditable', 'true');
      target.classList.add('eb-editable--live');
      target.focus();
      caretToEnd(target);
      positionFormatBar(el);
    }

    /* Inspector: breadcrumb up to the block, then the element's own options */
    var body = one('[data-eb-inspector-body]');
    if (!body) return;

    var blockLabel = block ? (block.getAttribute('data-eb-label') || '') : '';
    var crumb = block
      ? '<div class="eb-inspector__section eb-inspector__crumb">' +
        '<button class="eb-inspector__crumb-link" type="button" data-eb-crumb-up="' +
        block.getAttribute('data-eb-block') + '">' +
        '<i data-lucide="corner-left-up" aria-hidden="true"></i> ' + blockLabel +
        '</button>' +
        '<span class="eb-inspector__crumb-sep">/</span>' +
        '<span class="eb-inspector__crumb-current">' + label + '</span>' +
        '</div>'
      : '';

    body.innerHTML = crumb +
      '<div class="eb-inspector__section">' +
      '<p class="eb-inspector__section-title">' + (cfg ? cfg.title : label) + '</p>' +
      (cfg ? cfg.rows.map(rowHtml).join('')
           : '<p class="eb-field__help">No style options for this element yet.</p>') +
      '</div>';

    show(body);
    hide(one('[data-eb-inspector-page]'));
    show(one('[data-eb-inspector-foot]'));

    var title = one('[data-eb-inspector-title]');
    var eyebrow = one('[data-eb-inspector-eyebrow]');
    var icon = one('[data-eb-inspector-icon]');
    if (title) title.textContent = label;
    if (eyebrow) eyebrow.textContent = blockLabel ? 'In ' + blockLabel : 'Selected element';
    if (icon) icon.innerHTML = '<i data-lucide="type" aria-hidden="true"></i>';
    refreshIcons();
  }

  function rowHtml(row, i) {
    var id = 'ins-' + i;

    if (row.type === 'seg') {
      return '<div class="eb-field">' +
        '<span class="eb-field__label">' + row.label + '</span>' +
        '<div class="seg-control" role="radiogroup" aria-label="' + row.label + '">' +
        row.options.map(function (opt, n) {
          var on = n === row.active;
          return '<button class="seg-control__btn' + (on ? ' seg-control__btn--active' : '') +
            '" type="button" role="radio" aria-checked="' + (on ? 'true' : 'false') + '">' + opt + '</button>';
        }).join('') +
        '</div></div>';
    }

    if (row.type === 'toggle') {
      return '<div class="eb-inspector__row">' +
        '<p class="eb-inspector__row-label">' + row.label + '</p>' +
        '<button class="toggle toggle--xs' + (row.on ? ' toggle--active' : '') +
        '" type="button" role="switch" aria-checked="' + (row.on ? 'true' : 'false') +
        '" aria-label="' + row.label + '" data-eb-toggle>' +
        '<span class="toggle__track"><span class="toggle__knob"></span></span>' +
        '</button></div>';
    }

    if (row.type === 'text') {
      return '<div class="eb-field">' +
        '<label class="eb-field__label" for="' + id + '">' + row.label + '</label>' +
        '<div class="input"><div class="input__wrap">' +
        '<input id="' + id + '" type="text" class="input__control" value="' + row.value + '">' +
        '</div></div></div>';
    }

    if (row.type === 'upload') {
      return '<div class="eb-field">' +
        '<span class="eb-field__label">' + row.label + '</span>' +
        '<div class="drag-drop" data-drag-drop data-backend-todo="eb-upload">' +
        '<div class="drag-drop__icon-wrap"><i data-lucide="upload-cloud" aria-hidden="true"></i></div>' +
        '<div class="drag-drop__text">' +
        '<p class="drag-drop__title"><strong>Click to upload</strong> or drag and drop</p>' +
        '<p class="drag-drop__subtitle">' + (row.hint || 'SVG, PNG or JPG') + '</p>' +
        '</div>' +
        '<input type="file" class="drag-drop__native" data-drag-native accept="image/*">' +
        '</div></div>';
    }

    if (row.type === 'help') {
      return '<p class="eb-field__help">' + row.text + '</p>';
    }

    return '';
  }

  function renderBlockPanel(id, block) {
    var body = one('[data-eb-inspector-body]');
    if (!body) return;

    var cfg = BLOCK_PANELS[id];
    var label = block.getAttribute('data-eb-label') || id;

    if (!cfg) {
      /* A block with no bespoke panel still gets an honest one */
      body.innerHTML = '<div class="eb-inspector__section">' +
        '<p class="eb-inspector__section-title">' + label + ' options</p>' +
        '<p class="eb-field__help">No block-level options yet — edit the text on the page, ' +
        'or open all fields below.</p></div>';
    } else {
      body.innerHTML = '<div class="eb-inspector__section">' +
        '<p class="eb-inspector__section-title">' + cfg.title + '</p>' +
        cfg.rows.map(rowHtml).join('') +
        '</div>';
    }

    show(body);
    hide(one('[data-eb-inspector-page]'));
    show(one('[data-eb-inspector-foot]'));

    var title = one('[data-eb-inspector-title]');
    var eyebrow = one('[data-eb-inspector-eyebrow]');
    var icon = one('[data-eb-inspector-icon]');
    if (title) title.textContent = label;
    if (eyebrow) eyebrow.textContent = 'Selected block';
    if (icon) {
      var name = block.getAttribute('data-eb-icon');
      if (name) icon.innerHTML = '<i data-lucide="' + name + '" aria-hidden="true"></i>';
    }
    refreshIcons();
  }

  function selectBlock(id) {
    clearEditables();
    all('[data-eb-block]').forEach(function (block) {
      block.classList.toggle('eb-block--selected', block.getAttribute('data-eb-block') === id);
    });
    all('[data-eb-blockrow]').forEach(function (row) {
      row.classList.toggle('eb-blockrow--active', row.getAttribute('data-eb-blockrow') === id);
    });

    var block = one('[data-eb-block="' + id + '"]');
    if (block) renderBlockPanel(id, block);
  }

  /* Nothing selected: the inspector falls back to page-level settings */
  function deselectBlock() {
    clearEditables();
    all('[data-eb-block]').forEach(function (b) { b.classList.remove('eb-block--selected'); });
    all('[data-eb-blockrow]').forEach(function (r) { r.classList.remove('eb-blockrow--active'); });

    var body = one('[data-eb-inspector-body]');
    if (!body) return;
    body.innerHTML = '';
    hide(body);
    show(one('[data-eb-inspector-page]'));
    hide(one('[data-eb-inspector-foot]'));

    var title = one('[data-eb-inspector-title]');
    var eyebrow = one('[data-eb-inspector-eyebrow]');
    var icon = one('[data-eb-inspector-icon]');
    if (title) title.textContent = 'Page settings';
    if (eyebrow) eyebrow.textContent = 'Nothing selected';
    if (icon) {
      icon.innerHTML = '<i data-lucide="file-sliders" aria-hidden="true"></i>';
      refreshIcons();
    }
  }

  function initBlockSelect() {
    document.addEventListener('click', function (e) {
      /* Rail rows select their block (but the move/remove buttons don't) */
      var row = e.target.closest('[data-eb-blockrow]');
      if (row && !e.target.closest('[data-eb-move], [data-eb-remove]')) {
        selectBlock(row.getAttribute('data-eb-blockrow'));
        return;
      }

      /* Breadcrumb: step from the element back up to its block */
      var up = e.target.closest('[data-eb-crumb-up]');
      if (up) { selectBlock(up.getAttribute('data-eb-crumb-up')); return; }

      /* The format bar acts on the current selection — never changes it */
      if (e.target.closest('[data-eb-formatbar]')) return;

      /* Element beats block: clicking the title inside the hero selects the
         title, not the hero. Clicks inside the already-selected element are
         left alone so the caret isn't reset. */
      var el = e.target.closest('[data-eb-el]');
      if (el) {
        if (!el.classList.contains('eb-el--selected')) selectElement(el);
        return;
      }

      /* Don't hijack clicks on real controls inside a block */
      if (e.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;

      var block = e.target.closest('[data-eb-block]');
      if (block) { selectBlock(block.getAttribute('data-eb-block')); return; }

      /* Clicking the canvas background (not a block) deselects */
      if (e.target.closest('.eb-canvas')) deselectBlock();
    });

    /* Esc steps up a level: element -> its block -> nothing */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !one('[data-eb-inspector-body]')) return;
      var selEl = one('.eb-el--selected');
      if (selEl) {
        var parent = selEl.closest('[data-eb-block]');
        if (parent) { selectBlock(parent.getAttribute('data-eb-block')); return; }
      }
      deselectBlock();
    });

    /* Keep the format bar attached to the element while the canvas scrolls */
    var canvas = one('.eb-canvas');
    if (canvas) {
      canvas.addEventListener('scroll', function () {
        var selEl = one('.eb-el--selected');
        if (selEl && !one('[data-eb-formatbar]').hasAttribute('hidden')) positionFormatBar(selEl);
      });
    }

    /* A screen can open with a block, or a single element, already selected */
    var presetEl = one('[data-eb-el].eb-el--selected');
    if (presetEl) { selectElement(presetEl); return; }
    var preset = one('[data-eb-block].eb-block--selected');
    if (preset) selectBlock(preset.getAttribute('data-eb-block'));
  }

  /* --------------------------------------------------------- AI proposals */

  function resolveProposal(card, accepted) {
    var id = card.getAttribute('data-eb-proposal');
    var actions = one('[data-eb-proposal-actions]', card);
    var state = one('[data-eb-proposal-state]', card);

    card.classList.remove('eb-proposal--accepted', 'eb-proposal--rejected');
    card.classList.add(accepted ? 'eb-proposal--accepted' : 'eb-proposal--rejected');
    hide(actions);

    if (state) {
      state.innerHTML = accepted
        ? '<i data-lucide="check" aria-hidden="true"></i> Added'
        : '<i data-lucide="x" aria-hidden="true"></i> Dismissed';
      state.style.color = accepted ? '' : 'var(--ai-text-contrast)';
      show(state);
    }

    var block = one('[data-eb-block="' + id + '"]');
    if (block) {
      if (accepted) {
        /* Proposal becomes a normal block: drop the dashed outline and the bar */
        block.classList.remove('eb-block--proposed');
        var bar = one('[data-eb-block-actions]', block);
        if (bar) bar.remove();
        var tag = one('.eb-block__tag', block);
        if (tag) {
          tag.innerHTML = '<i data-lucide="square-dashed-mouse-pointer" aria-hidden="true"></i> ' +
            (block.getAttribute('data-eb-label') || id);
        }
      } else {
        block.remove();
      }
    }

    var railRow = one('[data-eb-blockrow="' + id + '"]');
    if (railRow) {
      if (accepted) {
        railRow.classList.remove('eb-blockrow--proposed');
        var note = one('[data-eb-blockrow-note]', railRow);
        if (note) note.remove();
      } else {
        var li = railRow.closest('li');
        (li || railRow).remove();
      }
    }

    refreshIcons();
    updateProposalCount();
  }

  function updateProposalCount() {
    var counter = one('[data-eb-proposal-count]');
    if (!counter) return;
    var pending = all('[data-eb-proposal]').filter(function (card) {
      return !card.classList.contains('eb-proposal--accepted') &&
             !card.classList.contains('eb-proposal--rejected');
    }).length;
    counter.textContent = pending
      ? pending + (pending === 1 ? ' suggestion to review' : ' suggestions to review')
      : 'All suggestions reviewed';
  }

  function initProposals() {
    document.addEventListener('click', function (e) {
      var accept = e.target.closest('[data-eb-accept]');
      var reject = e.target.closest('[data-eb-reject]');
      var refine = e.target.closest('[data-eb-refine]');

      if (accept) {
        var acceptId = accept.getAttribute('data-eb-accept');
        resolveProposal(one('[data-eb-proposal="' + acceptId + '"]') || accept.closest('[data-eb-proposal]'), true);
        return;
      }
      if (reject) {
        var rejectId = reject.getAttribute('data-eb-reject');
        resolveProposal(one('[data-eb-proposal="' + rejectId + '"]') || reject.closest('[data-eb-proposal]'), false);
        return;
      }
      if (refine) {
        /* Refining hands the item back to the prompt box, pre-filled. */
        var box = one('[data-eb-prompt]');
        if (box) {
          box.value = 'Refine the ' + (refine.getAttribute('data-eb-refine') || 'block') + ' suggestion: ';
          box.focus();
        }
      }
    });

    updateProposalCount();
  }

  /* ------------------------------------------------------------- page shape */

  function applyShape(shape) {
    var tabs = one('[data-eb-tabs]');
    var anchors = one('[data-eb-anchors]');
    var tabbed = shape === 'tabs';

    /* The control exists in two forms — the visual chooser in the page panel and
       the compact pair in the top bar. Only style whichever this element is. */
    all('[data-eb-shape]').forEach(function (opt) {
      var isActive = opt.getAttribute('data-eb-shape') === shape;
      if (opt.classList.contains('eb-iconbtn')) {
        opt.classList.toggle('eb-iconbtn--active', isActive);
      } else {
        opt.classList.toggle('eb-shape__opt--active', isActive);
      }
    });

    if (tabbed) { show(tabs); hide(anchors); } else { hide(tabs); show(anchors); }

    var activeTab = one('[data-eb-etab].eb-etab--active');
    var activePanel = activeTab ? activeTab.getAttribute('data-eb-etab') : null;

    all('[data-eb-panel]').forEach(function (panel) {
      if (!tabbed) { show(panel); return; }
      if (panel.getAttribute('data-eb-panel') === activePanel) show(panel);
      else hide(panel);
    });

    var label = one('[data-eb-shape-label]');
    if (label) label.textContent = tabbed ? 'Tabbed' : 'Long scroll';
  }

  function initShape() {
    if (!one('[data-eb-shape]')) return;

    document.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-eb-shape]');
      if (opt) { applyShape(opt.getAttribute('data-eb-shape')); return; }

      var tab = e.target.closest('[data-eb-etab]');
      if (tab) {
        all('[data-eb-etab]').forEach(function (t) {
          t.classList.toggle('eb-etab--active', t === tab);
        });
        applyShape('tabs');
      }
    });
  }

  /* Event-page tabs on screens without a shape control (e.g. 04) */
  function initTabsOnly() {
    if (one('[data-eb-shape]') || !one('[data-eb-etab]')) return;
    document.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-eb-etab]');
      if (!tab) return;
      var name = tab.getAttribute('data-eb-etab');
      all('[data-eb-etab]').forEach(function (t) {
        t.classList.toggle('eb-etab--active', t === tab);
      });
      all('[data-eb-panel]').forEach(function (p) {
        if (p.getAttribute('data-eb-panel') === name) show(p); else hide(p);
      });
    });
  }

  /* ------------------------------------------------------------ device width */

  function initDevice() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-eb-device]');
      if (!btn) return;
      var mode = btn.getAttribute('data-eb-device');
      all('[data-eb-device]').forEach(function (b) {
        b.classList.toggle('eb-iconbtn--active', b === btn);
      });
      var frame = one('[data-eb-frame]');
      if (frame) frame.classList.toggle('eb-frame--mobile', mode === 'mobile');
    });
  }

  /* -------------------------------------------------------- rail reorder etc */

  function initRail() {
    document.addEventListener('click', function (e) {
      var move = e.target.closest('[data-eb-move]');
      if (move) {
        var li = move.closest('li');
        if (!li) return;
        var dir = move.getAttribute('data-eb-move');
        if (dir === 'up' && li.previousElementSibling) {
          li.parentNode.insertBefore(li, li.previousElementSibling);
        } else if (dir === 'down' && li.nextElementSibling) {
          li.parentNode.insertBefore(li.nextElementSibling, li);
        }
        syncCanvasOrder();
        return;
      }

      var remove = e.target.closest('[data-eb-remove]');
      if (remove) {
        var row = remove.closest('[data-eb-blockrow]');
        if (!row) return;
        var id = row.getAttribute('data-eb-blockrow');
        var block = one('[data-eb-block="' + id + '"]');
        if (block) block.remove();
        var item = row.closest('li');
        (item || row).remove();
        updateRailCount();
      }
    });
  }

  /* Reordering the rail reorders the canvas — that's the whole point of it */
  function syncCanvasOrder() {
    var page = one('[data-eb-page-body]');
    if (!page) return;
    all('[data-eb-blockrow]').forEach(function (row) {
      var block = one('[data-eb-block="' + row.getAttribute('data-eb-blockrow') + '"]');
      if (block && block.parentNode === page) page.appendChild(block);
    });
  }

  /* Counts the optional spine only — core blocks and inspector links don't count */
  function updateRailCount() {
    var counter = one('[data-eb-rail-count]');
    var spine = one('[data-eb-spine]');
    if (!counter || !spine) return;
    var n = all('[data-eb-blockrow]', spine).length;
    counter.textContent = n + (n === 1 ? ' block' : ' blocks');
  }

  /* --------------------------------------------------------- block library */

  function initLibrary() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-eb-library-open]')) {
        show(one('[data-eb-library]'));
        show(one('[data-eb-scrim]'));
        return;
      }
      if (e.target.closest('[data-eb-library-close]') || e.target.closest('[data-eb-scrim]')) {
        hide(one('[data-eb-library]'));
        hide(one('[data-eb-scrim]'));
        return;
      }

      var add = e.target.closest('[data-eb-add]');
      if (add) {
        if (add.classList.contains('eb-blockcard--locked')) return;
        addBlock(add);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      hide(one('[data-eb-library]'));
      hide(one('[data-eb-scrim]'));
    });
  }

  function addBlock(card) {
    var id = card.getAttribute('data-eb-add');
    var label = card.getAttribute('data-eb-label') || id;
    var icon = card.getAttribute('data-eb-icon') || 'square';

    if (one('[data-eb-blockrow="' + id + '"]')) return; /* already in use */

    var list = one('[data-eb-spine]');
    if (list) {
      var li = document.createElement('li');
      li.innerHTML =
        '<div class="eb-blockrow eb-blockrow--active" data-eb-blockrow="' + id + '">' +
          '<span class="eb-blockrow__grip" aria-hidden="true"><i data-lucide="grip-vertical"></i></span>' +
          '<span class="eb-blockrow__icon"><i data-lucide="' + icon + '" aria-hidden="true"></i></span>' +
          '<span class="eb-blockrow__label">' + label + '</span>' +
          '<span class="eb-blockrow__note">new</span>' +
        '</div>';
      list.appendChild(li);
    }

    card.classList.add('eb-blockcard--in-use');
    var foot = one('[data-eb-add-state]', card);
    if (foot) foot.innerHTML = '<span class="badge badge--success badge--sm">In use</span>';

    updateRailCount();
    refreshIcons();
  }

  /* --------------------------------------------------- misc small behaviours */

  function initToggles() {
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('[data-eb-toggle]');
      if (!toggle || toggle.classList.contains('toggle--disabled')) return;
      var on = toggle.classList.toggle('toggle--active');
      toggle.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  /* Accordion has no shipped JS — same inline handler the Accordion prototype uses */
  function initAccordions() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-acc-trigger]');
      if (!trigger) return;
      var item = trigger.closest('.acc__item');
      var acc = trigger.closest('.acc');
      if (!item || !acc) return;
      if (acc.getAttribute('data-acc') === 'single') {
        all(':scope > .acc__item', acc).forEach(function (i) {
          if (i !== item) i.classList.remove('acc__item--open');
        });
      }
      item.classList.toggle('acc__item--open');
    });
  }

  function initDismiss() {
    document.addEventListener('click', function (e) {
      var close = e.target.closest('[data-eb-dismiss]');
      if (!close) return;
      var target = close.closest(close.getAttribute('data-eb-dismiss') || '.toast');
      if (target) target.remove();
    });
  }

  /* Advanced-form section rail scrolls the matching card into view */
  function initFormRail() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('[data-eb-form-section]');
      if (!link) return;
      var name = link.getAttribute('data-eb-form-section');
      var card = one('[data-eb-form-card="' + name + '"]');
      all('[data-eb-form-section]').forEach(function (l) {
        l.classList.toggle('eb-blockrow--active', l === link);
      });
      if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* On the gap-fill screen, bring the block being discussed into view so the
     question and the thing it's about are on screen together. */
  function initSpotlight() {
    var canvas = one('.eb-canvas--spotlight');
    var focus = one('.eb-block--focus');
    if (!canvas || !focus) return;
    canvas.scrollTop = focus.getBoundingClientRect().top -
                       canvas.getBoundingClientRect().top -
                       parseInt(getComputedStyle(canvas).paddingTop, 10);
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    initNav();
    initBriefEcho();
    initBlockSelect();
    initProposals();
    initShape();
    initTabsOnly();
    initDevice();
    initRail();
    initLibrary();
    initToggles();
    initAccordions();
    initDismiss();
    initFormRail();
    updateRailCount();
    initSpotlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
