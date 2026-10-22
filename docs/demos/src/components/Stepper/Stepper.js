/* Stepper — renders and updates a `.stepper` from data.
 *
 *   Stepper.render(navEl, {
 *     steps:   ['Upload', 'Map columns', 'Review', 'Results'],
 *     current: 1,          // index of the current step
 *     reached: 1,          // furthest step reached (steps before `current` up to here are complete)
 *     errors:  [2],        // indexes shown in the error state (a done step that needs attention)
 *     locked:  false       // true = no step is clickable (e.g. once an import has run)
 *   });
 *
 * A complete (or error) step before the current one is a <button>; clicking it dispatches
 * `stepper:select` on the nav with `detail.index`. The owner decides whether to move — the
 * Stepper never changes step by itself.
 */
(function () {
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function render(nav, state) {
    var list = nav.querySelector('.stepper__list');
    if (!list) { list = el('ol', 'stepper__list'); nav.appendChild(list); }
    list.textContent = '';
    var errors = state.errors || [];
    var total = state.steps.length;

    state.steps.forEach(function (label, i) {
      var li = el('li', 'stepper__step');
      var isCurrent = i === state.current;
      var isError = !isCurrent && errors.indexOf(i) !== -1 && i < state.current;
      var isDone = !isCurrent && !isError && i < state.current;
      if (isCurrent) { li.classList.add('stepper__step--current'); li.setAttribute('aria-current', 'step'); }
      if (isDone) li.classList.add('stepper__step--complete');
      if (isError) li.classList.add('stepper__step--error');

      var clickable = (isDone || isError) && !state.locked;
      var item = el(clickable ? 'button' : 'span', 'stepper__item');
      if (clickable) {
        item.type = 'button';
        item.setAttribute('data-stepper-index', String(i));
      }

      var marker = el('span', 'stepper__marker');
      marker.setAttribute('aria-hidden', 'true');
      if (isDone) {
        var icon = el('i'); icon.setAttribute('data-lucide', 'check'); marker.appendChild(icon);
      } else if (isError) {
        marker.textContent = '!';
      } else {
        marker.textContent = String(i + 1);
      }

      // The label carries the state for screen readers ("Step 2 of 4: Map columns, done").
      var lab = el('span', 'stepper__label', label);
      var sr = 'Step ' + (i + 1) + ' of ' + total + ': ' + label +
        (isDone ? ', done' : isError ? ', needs attention' : isCurrent ? ', current' : '');
      item.setAttribute('aria-label', sr);

      item.appendChild(marker);
      item.appendChild(lab);
      li.appendChild(item);
      list.appendChild(li);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.stepper [data-stepper-index]');
    if (!b) return;
    var nav = b.closest('.stepper');
    nav.dispatchEvent(new CustomEvent('stepper:select', {
      bubbles: true,
      detail: { index: Number(b.getAttribute('data-stepper-index')) }
    }));
  });

  window.Stepper = { render: render };
})();
