/* PromptModifier — the AI prompt on a record section (Social, Article Questions, Summary).
 *
 * Markup contract (record_markup.prompt_modifier):
 *   <div class="prompt-modifier" data-prompt-modifier data-outputs='["…","…"]'>
 *     … [data-prompt-toggle] (aria-controls → the body)  [data-prompt-generate]
 *     <div class="prompt-modifier__body" hidden> <textarea data-prompt-text> … [data-prompt-copy]
 *     <p data-prompt-status hidden><span data-prompt-status-text></span> [data-prompt-undo]</p>
 *   </div>
 *   The fields it fills are the text inputs / textareas that FOLLOW it in the same
 *   .record-section__body, in order.
 *
 * Behaviour: Edit prompt discloses the prompt (the preview line hides while open, and follows
 * edits). Generate shows a busy state, writes the outputs into the fields, flashes them and offers
 * Undo (it overwrites, so the previous values are kept until the next Generate). Copy prompt puts
 * the prompt on the clipboard.
 * Delegated at the document, bound once.
 */
// TODO(backend:RecordScreen) record-prompt-generate: data-outputs are canned demo results → POST
//   { prompt, article content } to the AI endpoint, returning N sharelines / questions / a summary
//   TODO(backend:RecordScreen) record-prompt-save: the edited prompt is not persisted → save per
//   article (ShareLineGenerationPrompt / QuestionGenerationPrompt / SummaryGenerationPrompt)
(function () {
  'use strict';
  if (window.__promptModifierBound) return;
  window.__promptModifierBound = true;

  var DELAY = 1200; // mock generation time

  function $(root, sel) { return root.querySelector(sel); }

  function targets(panel) {
    var body = panel.closest('.record-section__body');
    if (!body) return [];
    return Array.prototype.filter.call(
      body.querySelectorAll('input.input__control[type="text"], textarea.textarea__control'),
      function (el) { return !panel.contains(el); }
    );
  }

  function status(panel, text, undo) {
    var p = $(panel, '[data-prompt-status]');
    $(p, '[data-prompt-status-text]').textContent = text;
    $(p, '[data-prompt-undo]').hidden = !undo;
    p.hidden = !text;
  }

  function toggle(panel, btn) {
    var body = document.getElementById(btn.getAttribute('aria-controls'));
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.hidden = !open;
    panel.classList.toggle('prompt-modifier--open', open);
    if (open) $(body, '[data-prompt-text]').focus();
  }

  function generate(panel, btn) {
    if (panel.classList.contains('prompt-modifier--busy')) return;
    var outputs;
    try { outputs = JSON.parse(panel.getAttribute('data-outputs') || '[]'); } catch (e) { outputs = []; }
    var fields = targets(panel);
    panel.classList.add('prompt-modifier--busy');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Generating…';
    status(panel, 'Generating from the article…', false);
    setTimeout(function () {
      panel.__previous = fields.map(function (f) { return f.value; });
      fields.forEach(function (f, i) {
        if (outputs[i] === undefined) return;
        f.value = outputs[i];
        f.dispatchEvent(new Event('input', { bubbles: true }));
        var box = f.closest('.input__wrap, .textarea') || f;
        box.classList.add('prompt-modifier-filled');
        setTimeout(function () { box.classList.remove('prompt-modifier-filled'); }, 1600);
      });
      panel.classList.remove('prompt-modifier--busy');
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Generate';
      var n = Math.min(outputs.length, fields.length);
      status(panel, 'Generated ' + n + (n === 1 ? ' field' : ' fields') + ' just now.', true);
      btn.focus();
    }, DELAY);
  }

  function undo(panel) {
    var prev = panel.__previous;
    if (!prev) return;
    targets(panel).forEach(function (f, i) { if (prev[i] !== undefined) f.value = prev[i]; });
    panel.__previous = null;
    status(panel, 'Restored the previous values.', false);
    $(panel, '[data-prompt-generate]').focus();
  }

  function copy(panel, btn) {
    var text = $(panel, '[data-prompt-text]').value;
    var done = function () {
      var label = btn.querySelector('span');
      label.textContent = 'Copied';
      setTimeout(function () { label.textContent = 'Copy prompt'; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
    else done();
  }

  document.addEventListener('click', function (e) {
    var panel = e.target.closest('[data-prompt-modifier]');
    if (!panel) return;
    var t;
    if ((t = e.target.closest('[data-prompt-toggle]'))) toggle(panel, t);
    else if ((t = e.target.closest('[data-prompt-generate]'))) generate(panel, t);
    else if ((t = e.target.closest('[data-prompt-copy]'))) copy(panel, t);
    else if (e.target.closest('[data-prompt-undo]')) undo(panel);
  });

  // The preview follows the edited prompt.
  document.addEventListener('input', function (e) {
    if (!e.target.matches('[data-prompt-text]')) return;
    var panel = e.target.closest('[data-prompt-modifier]');
    $(panel, '[data-prompt-preview]').textContent = e.target.value;
  });
})();
