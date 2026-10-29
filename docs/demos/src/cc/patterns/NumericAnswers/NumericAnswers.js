/* NumericAnswers (code-first, 2026-10-29; Hub TASK-575540): AI Profile's metric layer section.
 *
 *   - The column readings are an Accordion item, closed on load (Markus: a debug view). The trigger
 *     always shows the summary and the "need a look" count, so nothing important hides behind it.
 *   - Generation prompt: the state Badge reads "Standard wording" while the text equals the standard
 *     prompt (data-standard) and "Customised for this profile" otherwise; "Use standard wording"
 *     appears only while customised and puts the standard text back (v1: clearing the override).
 *     TODO(backend:RecordScreen) ml-prompt: store an empty override when the text equals the standard.
 * Delegated at the document, bound once.
 */
(function () {
  'use strict';
  if (window.__numericAnswersBound) return;
  window.__numericAnswersBound = true;

  function syncPrompt(wrap) {
    var ta = wrap.querySelector('.textarea__control');
    var standard = (wrap.getAttribute('data-standard') || '').trim();
    var isStandard = ta.value.trim() === standard;
    wrap.querySelector('[data-ml-prompt-state]').textContent = isStandard ? 'Standard wording' : 'Customised for this profile';
    wrap.querySelector('[data-ml-standard]').hidden = isStandard;
  }

  document.addEventListener('input', function (e) {
    var wrap = e.target.closest && e.target.closest('[data-ml-prompt]');
    if (wrap && e.target.classList.contains('textarea__control')) syncPrompt(wrap);
  });

  document.addEventListener('click', function (e) {
    var reset = e.target.closest && e.target.closest('[data-ml-standard]');
    if (reset) {
      var wrap = reset.closest('[data-ml-prompt]');
      var ta = wrap.querySelector('.textarea__control');
      ta.value = wrap.getAttribute('data-standard') || '';
      syncPrompt(wrap);
      ta.focus();
      return;
    }
    var trigger = e.target.closest && e.target.closest('.numeric-answers__columns [data-acc-trigger]');
    if (trigger) {
      var item = trigger.closest('.acc__item');
      var open = !item.classList.contains('acc__item--open');
      item.classList.toggle('acc__item--open', open);
      trigger.setAttribute('aria-expanded', String(open));
    }
  });
})();
