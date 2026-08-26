/* Seating Planner — Table form, New / Edit (TASK-342307)
 *
 * Sixth sub-task onto the workspace shell:
 *
 *     SeatingPlannerWorkspace.on('table-edit', openEdit)
 *
 * Fields: name (required) · type/tier · sponsor (account lookup) · host ·
 * seats/capacity · shape.
 *
 * Capacity is the interesting one. Reducing it below the seated count returns
 * the surplus to Unassigned, so the form says what will happen BEFORE you save
 * ("10 of 10 seated. Reducing seats below 10 returns the extra people to
 * Unassigned.") and escalates to a warning once the entered number is lower.
 * The people bumped are the HIGHEST-numbered seats — the only sensible
 * automatic rule, but see the handover: whether the user should choose is a
 * question for the spec team.
 *
 * TODO(backend:SeatingPlanner): DOM-only. Real version writes a Table row with
 * FKs — Type → Table Type lookup, Sponsor → Account — plus a sort order, and
 * adds/removes TableSeat rows when capacity changes, unassigning the surplus in
 * the same transaction.
 */
(function () {
  'use strict';

  /* The tier set named by the brief. Order = rank, which is what the interim
     colour ramp encodes. `cls` maps to .sp-table--tier-*; Standard has none. */
  var TIERS = [
    { label: 'Standard',   cls: '' },
    { label: 'Head table', cls: 'head' },
    { label: 'VIP',        cls: 'vip' },
    { label: 'Gold',       cls: 'gold' },
    { label: 'Silver',     cls: 'silver' },
    { label: 'Bronze',     cls: 'bronze' },
    { label: 'Sponsor',    cls: 'sponsor' }
  ];

  /* TODO(backend:SeatingPlanner): Accounts are mock → GET /crm/accounts?q= */
  var ACCOUNTS = [
    'Barclaycard', 'Mastercard', 'Visa Europe', 'Wise', 'Monzo', 'Stripe',
    'Revolut', 'Klarna', 'GoCardless', 'Adyen', 'Checkout.com', 'Worldpay',
    'FIS', 'Thales', 'Ingenico', 'Priority Pass', 'Fiserv', 'Elavon'
  ];

  var editing = null;   /* card being edited, or null in New mode */

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  function roleOf(dot) {
    var m = (dot.className || '').match(/sp-dot--(attendee|sponsor|vip|speaker|host|guest)/);
    return m ? m[1] : null;
  }
  function seatedOn(card) { return all('.sp-dot', card).filter(roleOf).length; }

  /* ------------------------------------------------------------- tier select */

  function setTier(label) {
    var value = one('[data-tf-tier-value]');
    if (value) value.textContent = label;
    all('[data-tf-modal] .sel__menu-item').forEach(function (item) {
      var on = item.getAttribute('data-tf-tier') === label;
      item.classList.toggle('sel__menu-item--selected', on);
      item.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function currentTier() {
    return (one('[data-tf-tier-value]') || {}).textContent || 'Standard';
  }

  function tierClassFor(label) {
    for (var i = 0; i < TIERS.length; i++) {
      if (TIERS[i].label === label) return TIERS[i].cls;
    }
    return '';
  }

  /* ------------------------------------------------------ sponsor lookup */

  function setSponsor(name) {
    var chosen = one('[data-tf-sponsor-chosen]');
    var field = one('[data-tf-sponsor]');
    if (field) field.value = '';
    if (!chosen) return;
    if (name) {
      chosen.innerHTML = '<i data-lucide="star" aria-hidden="true"></i>' + name +
        '<button class="sp-iconbtn" type="button" aria-label="Remove sponsor" data-tf-sponsor-clear>' +
        '<i data-lucide="x" aria-hidden="true"></i></button>';
      chosen.setAttribute('data-value', name);
      chosen.removeAttribute('hidden');
    } else {
      chosen.innerHTML = '';
      chosen.setAttribute('data-value', '');
      chosen.setAttribute('hidden', '');
    }
    refreshIcons();
  }

  function chosenSponsor() {
    var chosen = one('[data-tf-sponsor-chosen]');
    return chosen ? (chosen.getAttribute('data-value') || '') : '';
  }

  function renderLookup() {
    var field = one('[data-tf-sponsor]');
    var menu = one('[data-tf-lookup-menu]');
    if (!field || !menu) return;

    var q = field.value.trim().toLowerCase();
    if (!q) { menu.setAttribute('hidden', ''); return; }

    var hits = ACCOUNTS.filter(function (a) { return a.toLowerCase().indexOf(q) !== -1; });
    menu.innerHTML = hits.length
      ? hits.slice(0, 8).map(function (a) {
          return '<button class="sp-lookup__item" type="button" data-tf-account="' + a + '">' +
            '<i data-lucide="star" aria-hidden="true"></i>' + a + '</button>';
        }).join('')
      : '<p class="sp-lookup__none">No accounts match “' + field.value + '”.</p>';
    menu.removeAttribute('hidden');
    refreshIcons();
  }

  /* ------------------------------------------------------- capacity note */

  function updateCapacityNote() {
    var note = one('[data-tf-capacity-note]');
    var seatsField = one('[data-tf-seats]');
    if (!note || !seatsField) return;

    var seated = editing ? seatedOn(editing) : 0;
    var wanted = parseInt(seatsField.value, 10);

    if (!editing) {
      note.className = 'sp-capacity__note';
      note.textContent = 'New tables start with every seat empty.';
      return;
    }

    if (!isNaN(wanted) && wanted < seated) {
      note.className = 'sp-capacity__note sp-capacity__note--warn';
      var surplus = seated - wanted;
      note.innerHTML = '<i data-lucide="triangle-alert" aria-hidden="true"></i>' +
        '<span>' + surplus + (surplus === 1 ? ' person' : ' people') +
        ' will be returned to Unassigned — the last ' +
        (surplus === 1 ? 'seat' : surplus + ' seats') + ' of ' + seated + ' seated.</span>';
      refreshIcons();
      return;
    }

    note.className = 'sp-capacity__note';
    note.textContent = seated + ' of ' + all('.sp-dot', editing).length +
      ' seated. Reducing seats below ' + seated + ' returns the extra people to Unassigned.';
  }

  /* ------------------------------------------------------------ open / close */

  function openEdit(ctx) {
    var overlay = one('[data-tf-overlay]');
    if (!overlay) return;

    editing = ctx && ctx.trigger ? ctx.trigger.closest('[data-sp-table]') : null;
    if (!editing) return;

    one('[data-tf-title]').textContent = 'Edit table';
    one('[data-tf-name]').value = editing.getAttribute('data-sp-name') || '';
    setTier(editing.getAttribute('data-sp-tier') || 'Standard');
    setSponsor(editing.getAttribute('data-sp-sponsor') || '');
    one('[data-tf-host]').value = editing.getAttribute('data-sp-host') || '';
    one('[data-tf-seats]').value = all('.sp-dot', editing).length;
    one('[data-tf-shape-value]').textContent = editing.getAttribute('data-sp-shape') || 'Round';

    clearErrors();
    updateCapacityNote();
    overlay.classList.add('modal-overlay--open');
    var name = one('[data-tf-name]');
    name.focus(); name.select();
  }

  function closeModal() {
    var overlay = one('[data-tf-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
    var menu = one('[data-tf-lookup-menu]');
    if (menu) menu.setAttribute('hidden', '');
    editing = null;
  }

  /* ------------------------------------------------------------- validation */

  function clearErrors() {
    all('[data-tf-modal] .input').forEach(function (wrap) {
      wrap.classList.remove('input--error');
      var c = one('.input__control', wrap);
      if (c) c.removeAttribute('aria-invalid');
      var h = one('.input__help', wrap);
      if (h && h.hasAttribute('data-tf-help-original')) {
        h.textContent = h.getAttribute('data-tf-help-original');
      }
    });
  }

  function validate() {
    clearErrors();
    var name = one('[data-tf-name]');
    if (!name.value.trim()) {
      var wrap = name.closest('.input');
      wrap.classList.add('input--error');
      name.setAttribute('aria-invalid', 'true');
      var help = one('.input__help', wrap);
      if (help) {
        if (!help.hasAttribute('data-tf-help-original')) {
          help.setAttribute('data-tf-help-original', help.textContent);
        }
        help.textContent = 'Table name is required.';
      }
      name.focus();
      return false;
    }
    return true;
  }

  /* ------------------------------------------------------------------- save */

  function save() {
    if (!editing) { closeModal(); return; }

    var name = one('[data-tf-name]').value.trim();
    var tier = currentTier();
    var sponsor = chosenSponsor();
    var host = one('[data-tf-host]').value.trim();
    var shape = one('[data-tf-shape-value]').textContent;
    var wanted = parseInt(one('[data-tf-seats]').value, 10);
    var dots = all('.sp-dot', editing);
    if (isNaN(wanted) || wanted < 1) wanted = dots.length;

    /* ── capacity change ── */
    var returned = 0;
    if (wanted < dots.length) {
      /* Drop from the END; anyone seated in a removed seat goes to Unassigned */
      for (var i = dots.length - 1; i >= wanted; i--) {
        var role = roleOf(dots[i]);
        if (role && window.SeatingPlannerWorkspace && window.SeatingPlannerWorkspace.addToTray) {
          window.SeatingPlannerWorkspace.addToTray(role,
            (editing.getAttribute('data-sp-name') || 'Table') + ' · seat ' + (i + 1), 'returned');
          returned++;
        }
        dots[i].remove();
      }
    } else if (wanted > dots.length) {
      var wrap = one('.sp-table__dots', editing);
      for (var j = dots.length; j < wanted; j++) {
        wrap.insertAdjacentHTML('beforeend', '<span class="sp-dot sp-dot--empty"></span>');
      }
    }

    /* ── identity + attributes ── */
    editing.setAttribute('data-sp-name', name);
    editing.setAttribute('data-sp-shape', shape);
    if (host) editing.setAttribute('data-sp-host', host); else editing.removeAttribute('data-sp-host');

    var nameEl = one('.sp-table__name', editing);
    var tierLabel = tier && tier !== 'Standard'
      ? '<span class="sp-table__tier">' + tier + '</span>' : '';
    if (nameEl) nameEl.innerHTML = name + tierLabel;

    /* tier: class + attribute, label always rendered above */
    TIERS.forEach(function (t) {
      if (t.cls) editing.classList.remove('sp-table--tier-' + t.cls);
    });
    if (tier && tier !== 'Standard') {
      editing.setAttribute('data-sp-tier', tier);
      var cls = tierClassFor(tier);
      if (cls) editing.classList.add('sp-table--tier-' + cls);
    } else {
      editing.removeAttribute('data-sp-tier');
    }

    /* sponsor line */
    var sponsorEl = one('.sp-table__sponsor', editing);
    if (sponsor) {
      editing.setAttribute('data-sp-sponsor', sponsor);
      var html = '<i data-lucide="star" aria-hidden="true"></i>' + sponsor;
      if (sponsorEl) sponsorEl.innerHTML = html;
      else one('.sp-table__head', editing).insertAdjacentHTML('afterend',
        '<p class="sp-table__sponsor">' + html + '</p>');
    } else {
      editing.removeAttribute('data-sp-sponsor');
      if (sponsorEl) sponsorEl.remove();
    }

    /* counts + pill */
    var finalDots = all('.sp-dot', editing);
    var seated = finalDots.filter(roleOf).length;
    var count = one('[data-sp-count]', editing);
    if (count) count.textContent = seated + ' / ' + finalDots.length + ' seated';
    var pill = one('[data-sp-fill]', editing);
    if (pill) {
      pill.className = 'badge badge--sm';
      if (seated === 0) { pill.classList.add('badge--neutral'); pill.textContent = 'Empty'; }
      else if (seated < finalDots.length) { pill.classList.add('badge--warning'); pill.textContent = seated + '/' + finalDots.length; }
      else { pill.classList.add('badge--success'); pill.textContent = 'Full'; }
    }

    all('[data-sp-action="table-edit"], [data-sp-action="table-delete"]', editing).forEach(function (b) {
      var verb = b.getAttribute('data-sp-action') === 'table-edit' ? 'Edit ' : 'Delete ';
      b.setAttribute('aria-label', verb + name);
    });

    var card = editing;
    var planKey = card.getAttribute('data-sp-belongs');
    closeModal();
    refreshIcons();

    if (window.SeatingPlannerWorkspace) {
      if (window.SeatingPlannerWorkspace.syncPlanChip) window.SeatingPlannerWorkspace.syncPlanChip(planKey);
      if (window.SeatingPlannerWorkspace.selectTable) window.SeatingPlannerWorkspace.selectTable(card);
      if (window.SeatingPlannerWorkspace.refresh) window.SeatingPlannerWorkspace.refresh();
      if (window.SeatingPlannerWorkspace.toast) {
        window.SeatingPlannerWorkspace.toast('<strong>' + name + '</strong> saved' +
          (returned ? ' · ' + returned + ' returned to Unassigned' : '') + '.');
      }
    }
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-tf-modal]')) return;

    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('table-edit', openEdit);
    }

    var sponsorField = one('[data-tf-sponsor]');
    if (sponsorField) sponsorField.addEventListener('input', renderLookup);

    var seatsField = one('[data-tf-seats]');
    if (seatsField) seatsField.addEventListener('input', updateCapacityNote);

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-tf-cancel]') || e.target.closest('[data-tf-close]')) {
        e.preventDefault(); closeModal(); return;
      }
      if (e.target.closest('[data-tf-save]')) {
        e.preventDefault(); if (validate()) save(); return;
      }
      var acct = e.target.closest('[data-tf-account]');
      if (acct) {
        e.preventDefault();
        setSponsor(acct.getAttribute('data-tf-account'));
        one('[data-tf-lookup-menu]').setAttribute('hidden', '');
        return;
      }
      if (e.target.closest('[data-tf-sponsor-clear]')) { e.preventDefault(); setSponsor(''); return; }

      var tierItem = e.target.closest('[data-tf-tier]');
      if (tierItem) {
        e.preventDefault();
        setTier(tierItem.getAttribute('data-tf-tier'));
        var sel = tierItem.closest('.sel');
        if (sel) sel.classList.remove('sel--open');
        return;
      }

      var overlay = one('[data-tf-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
