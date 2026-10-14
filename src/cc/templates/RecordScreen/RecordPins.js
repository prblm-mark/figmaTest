/* RecordPins — pin kebab actions to the page (code-first, 2026-10-14; Markus via Mark).
 *
 * Any action in a pinnable kebab ([data-record-pins="<type>"]) gets a pin button. Pinned actions render
 * into every [data-pinned-actions] host on the page: the summary panel's quick actions (styles stack /
 * icon / list) or, on screens without a panel, the slim row under the header (style bar, hidden while
 * nothing is pinned). Saved per user per record type, 6 at most; the host's data-default-pins is where
 * a user starts. Pinned buttons copy the kebab link's own attributes, so they do exactly what the menu
 * item does (modals open through the same delegated handlers).
 *
 * The kebab stops being an ARIA menu here: a row with a second button in it is not a menuitem, so the
 * panel becomes a plain list of links + toggle buttons (aria-pressed) behind a disclosure trigger.
 */
document.addEventListener('DOMContentLoaded', function () {
  var kebab = document.querySelector('[data-record-pins]');
  if (!kebab) return;
  var type = kebab.getAttribute('data-record-pins');
  // TODO(backend:RecordScreen) record-pinned-actions: localStorage stands in for the user's preferences (GET/PUT the pinned action ids for this record type)
  var KEY = 'cc-pinned-actions:' + type;
  var hosts = Array.prototype.slice.call(document.querySelectorAll('[data-pinned-actions]'));
  var MAX = parseInt((hosts[0] && hosts[0].getAttribute('data-max-pins')) || '6', 10);

  // ── The actions, read from the kebab ──
  var panel = kebab.querySelector('.dropdown__panel');
  var trigger = kebab.querySelector('.dropdown__trigger');
  var rows = Array.prototype.slice.call(kebab.querySelectorAll('li[data-action-id]'));
  var actions = {};
  rows.forEach(function (li) {
    var a = li.querySelector('a');
    actions[li.getAttribute('data-action-id')] = {
      label: a.textContent.trim(), icon: li.getAttribute('data-action-icon'), link: a
    };
  });

  var defaults = ((hosts[0] && hosts[0].getAttribute('data-default-pins')) || '').split(',').filter(Boolean);
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  var pins = (Array.isArray(saved) ? saved : defaults).filter(function (id) { return actions[id]; }).slice(0, MAX);

  // ── De-menu the kebab, add the pin toggles and the count line ──
  panel.removeAttribute('role');
  trigger.removeAttribute('aria-haspopup');
  var list = panel.querySelector('.dropdown__list');
  rows.forEach(function (li) {
    li.removeAttribute('role');
    li.classList.add('record-pins__row');
    li.querySelector('a').removeAttribute('role');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'record-pins__toggle';
    b.setAttribute('data-pin-id', li.getAttribute('data-action-id'));
    b.innerHTML = '<i data-lucide="pin" aria-hidden="true"></i>';
    li.appendChild(b);
  });
  var note = document.createElement('li');
  note.className = 'record-pins__note';
  note.setAttribute('aria-live', 'polite');
  list.appendChild(note);

  // ── Rendering ──
  function icon(name) {
    var i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }

  function pinnedLink(act, cls, withLabel, labelCls) {
    var a = document.createElement('a');
    Array.prototype.forEach.call(act.link.attributes, function (at) {
      if (at.name !== 'class' && at.name !== 'role') a.setAttribute(at.name, at.value);
    });
    a.className = 'btn ' + cls;
    a.appendChild(icon(act.icon));
    if (withLabel) {
      var s = document.createElement('span');
      if (labelCls) s.className = labelCls;
      s.textContent = act.label;
      a.appendChild(s);
    }
    return a;
  }

  function tip(label) {
    var t = document.createElement('span');
    t.className = 'tooltip record-summary__tip';
    t.setAttribute('aria-hidden', 'true');
    t.innerHTML = '<span class="tooltip__text"></span>';
    t.firstChild.textContent = label;
    return t;
  }

  function renderHost(host) {
    var style = host.getAttribute('data-pinned-actions');
    host.textContent = '';
    pins.forEach(function (id) {
      var act = actions[id];
      var li = document.createElement('li');
      var a;
      if (style === 'icon' || style === 'bar') {
        li.className = 'record-summary__tip-anchor';
        a = style === 'icon'
          ? pinnedLink(act, 'btn--secondary btn--icon btn--sm', false)
          : pinnedLink(act, 'btn--secondary btn--xs', true, 'record-pins__label');
        a.setAttribute('aria-label', act.label);
        li.appendChild(a);
        li.appendChild(tip(act.label));
      } else {
        li.appendChild(pinnedLink(act, style === 'stack' ? 'btn--secondary btn--xs' : 'btn--tertiary btn--sm', true));
      }
      host.appendChild(li);
    });
    var bar = host.closest('[data-record-pins-bar]');
    if (bar) bar.hidden = pins.length === 0;
    else if (!pins.length) {
      var empty = document.createElement('li');
      empty.className = 'record-summary__pins-empty';
      empty.textContent = 'Pin actions from the ⋮ menu';
      host.appendChild(empty);
    }
  }

  function render() {
    hosts.forEach(renderHost);
    var full = pins.length >= MAX;
    rows.forEach(function (li) {
      var id = li.getAttribute('data-action-id');
      var b = li.querySelector('.record-pins__toggle');
      var on = pins.indexOf(id) !== -1;
      var label = actions[id].label;
      b.setAttribute('aria-pressed', String(on));
      li.classList.toggle('record-pins__row--pinned', on);
      if (!on && full) {
        b.setAttribute('aria-disabled', 'true');
        b.setAttribute('aria-label', 'Pin ' + label + ' to the page. ' + MAX + ' pinned already: unpin one first');
        b.title = 'Unpin one to add another (' + MAX + ' max)';
      } else {
        b.removeAttribute('aria-disabled');
        // A toggle keeps one name; aria-pressed carries pinned / not pinned.
        b.setAttribute('aria-label', 'Pin ' + label + ' to the page');
        b.title = on ? 'Unpin from the page' : 'Pin to the page';
      }
    });
    note.textContent = full ? MAX + ' of ' + MAX + ' pinned · unpin one to add another'
                            : pins.length + ' of ' + MAX + ' pinned to the page';
    if (window.lucide) window.lucide.createIcons();
  }

  // ── Pin / unpin ── (inside the panel, but not a .dropdown-item, so the menu stays open)
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('.record-pins__toggle');
    if (!b) return;
    e.preventDefault();
    if (b.getAttribute('aria-disabled') === 'true') return;
    var id = b.getAttribute('data-pin-id');
    var at = pins.indexOf(id);
    if (at === -1) pins.push(id); else pins.splice(at, 1);
    try { localStorage.setItem(KEY, JSON.stringify(pins)); } catch (err) {}
    render();
    b.focus();
  });

  render();
});
