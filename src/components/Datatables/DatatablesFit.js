/* DatatablesFit — the listings' column fit for any Datatables table (Type=Orders styling).
 *
 * ListingScreen.js fits its one table per page with the whole screen engine (filters, selection,
 * Edit Columns, saved views). Dashboards carry several small tables and none of that, so this is
 * the fit on its own, driven by markup:
 *
 *   <section class="datatables datatables--orders">
 *     <div class="datatables__body">
 *       <table class="table" data-fit>
 *         <thead><tr>
 *           <th data-keep data-fluid>Product</th>   never dropped; wraps down to a floor
 *           <th data-drop="2">Order no.</th>          dropped 2nd when the row does not fit
 *           <th data-drop="1" data-snug>Product line</th> dropped 1st; grows to 224px at most
 *           <th data-keep data-hug>Value</th>         never dropped; never takes spare width
 *
 * The rules are the listings' (ListingScreen fitColumns / shareSpare, designer 2026-09-18 → 09-22):
 *   1. Every column starts at its natural width. `data-fluid` columns (a title that wraps) count
 *      at most `--ai-size-3` (192px), the listings' FLUID_MIN, so a long title cannot crowd the
 *      rest out.
 *   2. If they do not all fit, a kebab column appears and columns drop in `data-drop` order
 *      (1 first) until the row fits. A dropped column is shown in the row's detail panel, which
 *      the kebab opens (Datatables' pure-CSS :has(:checked) reveal) — so nothing is ever lost and
 *      nothing scrolls sideways.
 *   3. Spare width is SHARED: equal shares across every visible column except `data-hug` ones
 *      (counts, money, IDs, dates — fixed-shape content). `data-snug` columns (short text) stop at
 *      224px, the listings' SNUG_MAX, and what they cannot take goes to the others; when every
 *      sharer is capped (no long title), the rest is spread evenly across them all.
 *
 * `data-fit="even"` swaps rule 3 for equal column widths: every visible column takes available ÷ n,
 * except one whose content needs more (it keeps its natural width and the rest re-share). A header's
 * `data-weight="n"` gives that column n shares (a long title column).
 *
 * The row's last column gets `datatables__col--end` when no kebab follows it (for the table's end
 * gutter). Re-fits once web fonts and images have loaded: natural widths change with no resize.
 *
 * Rows are decorated on their own: a MutationObserver on the tbody adds each row's kebab cell
 * and detail row whenever the page re-renders it (Show more, a live refresh), and an open detail
 * row stays open across a re-render (keyed on the first cell's text). A ResizeObserver re-fits
 * when the column changes width with no window resize — the docked SidebarMenu, the full-width
 * toggle (CLAUDE.md §4a: no matchMedia).
 */
(function () {
  'use strict';
  if (window.DatatablesFit) return;

  var STATE = new WeakMap();
  var SNUG_MAX = 224;   // px — the listings' snug ceiling (ListingScreen.js SNUG_MAX); keep in step

  function remPx(token) {
    // A custom property reads back as "12rem" — measure a used value instead (custom-prop unit trap).
    var probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;inline-size:var(' + token + ')';
    document.body.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  }

  function heads(table) { return Array.prototype.slice.call(table.tHead.rows[0].cells); }
  function dataRows(table) {
    return Array.prototype.filter.call(table.tBodies[0].rows, function (tr) {
      return !tr.classList.contains('datatables__row-detail');
    });
  }
  function rowKey(tr) { return (tr.cells[0] && tr.cells[0].textContent.trim()) || ''; }

  /* ── Decorate: kebab header once; kebab cell + detail row per data row ── */
  function decorate(table) {
    var st = STATE.get(table);
    var ths = heads(table);
    if (!ths.some(function (th) { return th.classList.contains('datatables__col--kebab'); })) {
      var k = document.createElement('th');
      k.className = 'datatables__col--kebab';
      k.setAttribute('aria-label', 'Details');
      table.tHead.rows[0].appendChild(k);
      ths = heads(table);
    }
    var labels = ths.map(function (th) { return th.textContent.trim(); });
    dataRows(table).forEach(function (tr) {
      if (tr.hasAttribute('data-fit-row')) return;
      tr.setAttribute('data-fit-row', '');
      tr.classList.add('datatables__row');
      var key = rowKey(tr);
      var td = document.createElement('td');
      td.className = 'datatables__col--kebab';
      td.innerHTML = '<label class="datatables__kebab"><input type="checkbox" class="datatables__kebab__input"' +
        (st.open[key] ? ' checked' : '') + '><i data-lucide="ellipsis-vertical" aria-hidden="true"></i></label>';
      td.querySelector('input').setAttribute('aria-label', 'Show details for ' + key);
      tr.appendChild(td);

      var items = '';
      ths.forEach(function (th, i) {
        if (th.hasAttribute('data-keep') || th.classList.contains('datatables__col--kebab') || !tr.cells[i]) return;
        items += '<div class="datatables__detail-item" data-detail-col="' + i + '" hidden><dt></dt><dd>' +
          tr.cells[i].innerHTML + '</dd></div>';
      });
      var detail = document.createElement('tr');
      detail.className = 'datatables__row-detail';
      detail.innerHTML = '<td class="datatables__row-detail__cell" colspan="' + ths.length + '">' +
        '<dl class="datatables__detail-list">' + items + '</dl></td>';
      detail.querySelectorAll('dt').forEach(function (dt) {
        dt.textContent = labels[+dt.parentElement.getAttribute('data-detail-col')];
      });
      tr.after(detail);
    });
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  /* ── Fit: drop by priority, then share the spare ── */
  function fit(table) {
    var st = STATE.get(table);
    var ths = heads(table);
    var rows = dataRows(table);
    var details = table.querySelectorAll('tr.datatables__row-detail');
    var kebabAt = ths.length - 1;

    // Reset, then measure every column at its natural width (detail rows out of the way: one
    // spanning cell would otherwise hand its own width to every column).
    function mark(i, off) {
      ths[i].classList.toggle('datatables__col--nofit', off);
      rows.forEach(function (tr) { if (tr.cells[i]) tr.cells[i].classList.toggle('datatables__col--nofit', off); });
    }
    // `--end` marks the row's last column when there is no kebab after it, so a table can give it
    // the row's end gutter. It is ON while measuring (so the gutter is counted) and comes off if a
    // kebab turns out to be needed — which only ever frees width, never takes it.
    function end(i, on) {
      ths.forEach(function (th) { th.classList.remove('datatables__col--end'); });
      rows.forEach(function (tr) { Array.prototype.forEach.call(tr.cells, function (c) { c.classList.remove('datatables__col--end'); }); });
      if (!on) return;
      ths[i].classList.add('datatables__col--end');
      rows.forEach(function (tr) { if (tr.cells[i]) tr.cells[i].classList.add('datatables__col--end'); });
    }
    ths.forEach(function (th, i) { th.style.inlineSize = ''; mark(i, false); });
    end(kebabAt - 1, true);
    details.forEach(function (tr) { tr.classList.add('datatables__row-detail--measuring'); });
    table.style.inlineSize = 'max-content';
    var natural = ths.map(function (th) { return th.getBoundingClientRect().width; });
    // …and at its narrowest: a "fluid" column can only wrap as far as its content allows. An avatar +
    // name that never wraps ("Zachariah Markusson") is wider than the 192px floor, and planning it at
    // 192 let a row that did not fit pass as fitting — no kebab, the last column clipped (Mark, 2026-10-07).
    table.style.inlineSize = 'min-content';
    var least = ths.map(function (th) { return th.getBoundingClientRect().width; });
    table.style.inlineSize = '';
    details.forEach(function (tr) { tr.classList.remove('datatables__row-detail--measuring'); });

    var floor = remPx('--ai-size-3');
    var base = natural.map(function (w, i) {
      return ths[i].hasAttribute('data-fluid') ? Math.max(least[i], Math.min(w, floor)) : w;
    });
    var available = table.parentElement.clientWidth;
    var shown = ths.map(function (_, i) { return i !== kebabAt; });
    function sum() { return base.reduce(function (a, w, i) { return a + (shown[i] ? w : 0); }, 0); }

    if (sum() > available) {
      shown[kebabAt] = true;
      ths.map(function (th, i) { return { i: i, p: +th.getAttribute('data-drop') || 0 }; })
        .filter(function (c) { return c.p > 0; })
        .sort(function (a, b) { return a.p - b.p; })
        .forEach(function (c) { if (sum() > available) shown[c.i] = false; });
    }
    ths.forEach(function (_, i) { mark(i, !shown[i]); });
    end(kebabAt - 1, !shown[kebabAt]);

    // Share what is left: water-filling, as the listings' shareSpare. Every visible, non-hug data
    // column takes an equal slice; a `data-snug` column (short text — a team, an account) stops at
    // SNUG_MAX and the rest is shared again among those still growing, so the title takes the
    // remainder rather than a short column opening a gap.
    var spare = available - sum();
    var width = base.slice();
    if (table.getAttribute('data-fit') === 'even') {
      // Even mode (dashboards, Mark 2026-10-07): every visible column the SAME width where content
      // allows. Water-fill toward available ÷ n: a column wider than the target keeps its natural
      // width and drops out, the rest share what is left equally — so numbers no longer huddle
      // at the right while the text columns take the room. hug / snug do not apply here.
      var cols = [];
      ths.forEach(function (_, i) { if (shown[i] && i !== kebabAt) cols.push(i); });
      // `data-weight="n"` (default 1) gives a column n shares: long article titles get the room
      // (Mark, 2026-10-07) while the other columns stay even with each other.
      var weight = function (i) { return +ths[i].getAttribute('data-weight') || 1; };
      var room = available - (shown[kebabAt] ? base[kebabAt] : 0), even = cols.slice(), changed = true;
      var weights = function () { return even.reduce(function (a, i) { return a + weight(i); }, 0); };
      while (changed && even.length) {
        var unit = room / weights();
        changed = false;
        even = even.filter(function (i) {
          if (base[i] > unit * weight(i)) { room -= base[i]; changed = true; return false; }
          return true;
        });
      }
      if (even.length && room / weights() >= 1) {
        var share = room / weights();
        even.forEach(function (i) { width[i] = share * weight(i); });
        ths.forEach(function (th, i) { if (shown[i] && i !== kebabAt) th.style.inlineSize = width[i] + 'px'; });
      }
      table.querySelectorAll('.datatables__detail-item').forEach(function (el) {
        el.hidden = shown[+el.getAttribute('data-detail-col')];
      });
      st.fitted = available;
      return;
    }
    var open = [];
    ths.forEach(function (th, i) { if (shown[i] && i !== kebabAt && !th.hasAttribute('data-hug')) open.push(i); });
    for (var guard = open.length; spare >= 1 && open.length && guard >= 0; guard--) {
      var share = spare / open.length, still = [];
      open.forEach(function (i) {
        var room = ths[i].hasAttribute('data-snug') ? Math.max(SNUG_MAX - width[i], 0) : Infinity;
        var take = Math.min(share, room);
        width[i] += take; spare -= take;
        if (take >= share) still.push(i);
      });
      open = still;
    }
    // Every sharer hit its ceiling (no long title on this table): spread the rest evenly over them
    // all, so the leftover is shared rather than left for the browser to hand out unevenly.
    var sharers = [];
    ths.forEach(function (th, i) { if (shown[i] && i !== kebabAt && !th.hasAttribute('data-hug')) sharers.push(i); });
    if (spare >= 1 && sharers.length) {
      sharers.forEach(function (i) { width[i] += spare / sharers.length; });
      spare = 0;
    }
    if (width.some(function (w, i) { return w !== base[i]; })) {
      ths.forEach(function (th, i) { if (shown[i] && i !== kebabAt) th.style.inlineSize = width[i] + 'px'; });
    }

    // The detail panel shows exactly what the row could not.
    table.querySelectorAll('.datatables__detail-item').forEach(function (el) {
      el.hidden = shown[+el.getAttribute('data-detail-col')];
    });
    st.fitted = available;
  }

  function attach(table) {
    if (STATE.has(table)) return;
    var st = { open: {}, busy: false };
    STATE.set(table, st);
    function run() {
      if (st.busy) return;
      st.busy = true;
      decorate(table);
      fit(table);
      st.busy = false;
    }
    // Remember which rows are open, so a re-render (live refresh) does not snap them shut.
    table.addEventListener('change', function (e) {
      var input = e.target.closest('.datatables__kebab__input');
      if (input) st.open[rowKey(input.closest('tr'))] = input.checked;
    });
    new MutationObserver(function () { run(); }).observe(table.tBodies[0], { childList: true });
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        if (table.parentElement.clientWidth !== st.fitted) run();
      }).observe(table.parentElement);
    }
    run();
    // Natural widths change when the web font (and avatars) arrive, with no resize to say so — the
    // first fit ran on fallback metrics and a row that "fitted" was then clipped (Mark, 2026-10-07).
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(table); });
    window.addEventListener('load', function () { fit(table); });
  }

  function init(root) { (root || document).querySelectorAll('table[data-fit]').forEach(attach); }

  window.DatatablesFit = { init: init, fit: function (table) { attach(table); fit(table); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
