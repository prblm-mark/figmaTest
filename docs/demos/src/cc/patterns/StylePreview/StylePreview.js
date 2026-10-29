/* StylePreview (code-first, 2026-10-29; Hub TASK-575540): Design Style / Design Frame drawn in the
 * record's own CSS inside a sandboxed iframe (no scripts run in it; allow-same-origin only so this file
 * can measure it and push live values in).
 *
 * Markup contract (record_markup.style_preview):
 *   <section class="record-section record-section--preview">
 *     header: … <div class="seg-control … style-preview__widths" data-seg-control>desktop|tablet|mobile</div>
 *     <div class="style-preview" data-style-preview="style|frame" data-widths='{"tablet":"768px",…}' data-thumb="…">
 *       <template data-style-preview-css>…the record's CSS…</template>
 *       <iframe class="style-preview__frame" sandbox="allow-same-origin"></iframe>
 *
 * Behaviour:
 *   - the sample is v1's own (DC_DesignStyle.cfm / the frame's header + body), styled only by the template CSS;
 *   - the frame's height follows its content (re-measured on width change and when images load);
 *   - the width switch (SegmentedControl, seg-control:change) sets the site's Tablet / Mobile width;
 *   - Edit: a field row carrying data-preview-prop="--name" (+ optional data-preview-unit) sets that
 *     custom property on the preview's root as you type or pick, so the preview is live.
 *     TODO(backend:RecordScreen) style-preview-live: the record CSS reads these properties in the demo;
 *     live the CSS is generated from the fields → regenerate per change, or map fields to properties.
 */
(function () {
  'use strict';
  if (window.__stylePreviewBound) return;
  window.__stylePreviewBound = true;

  function sample(kind, thumb) {
    if (kind === 'frame') {
      return '<div class="df"><div class="df__h">Frame header</div>' +
        '<div class="df__b">Frame body - the content placed in this design frame sits here, with the ' +
        'frame\'s own padding, font and colours, inside its border.</div></div>';
    }
    // v1 DC_DesignStyle.cfm, text verbatim
    return '<div class="ds">' +
      '<div class="ds-H1">Page Title Sample &lt;H1&gt;</div>' +
      '<div class="ds-intro"><img class="ds-thumb" src="' + thumb + '" alt="Thumbnail" width="100" height="100">' +
      '<div><div class="ds-H2">Title Sample &lt;H2&gt;</div>' +
      '<div class="ds-H3">Title Sample &lt;H3&gt;</div>' +
      '<div class="ds-H4">Title Sample &lt;H4&gt;</div>' +
      '<div class="ds-Teaser">Teaser Sample - in the form of a two line introductory paragraph preceded by a sample ' +
      'thumbnail and containing no additional formatting or anything else particularly out of the ordinary &lt;N&gt;</div></div></div>' +
      '<div class="ds-N">A paragraph of Text - containing as it does examples of <a href="#">link formatting</a>, and ' +
      '<span class="ds-hl">Highlight Text</span> with line spacing along with typical HTML text, which might be typically ' +
      'used on a daily basis on any kind of typical website. &lt;N&gt;</div>' +
      '<div class="ds-N ds-error">An example of an error prompt text colour with background and outline colours applied also</div>' +
      '</div>';
  }

  /* Height = the sample's own height (the body's — documentElement never reports less than the frame, so
     it could only grow) + the frame's border (box-sizing is border-box). Measured, not a design value. */
  function fit(frame) {
    var doc = frame.contentDocument;
    if (!doc || !doc.body) return;
    var border = frame.offsetHeight - frame.clientHeight;
    frame.style.blockSize = Math.ceil(doc.body.getBoundingClientRect().height) + border + 'px';
  }

  function build(root) {
    var frame = root.querySelector('.style-preview__frame');
    var css = root.querySelector('template[data-style-preview-css]').innerHTML;
    frame.addEventListener('load', function () {
      var doc = frame.contentDocument;
      fit(frame);
      doc.querySelectorAll('img').forEach(function (img) { img.addEventListener('load', function () { fit(frame); }); });
      /* links inside a preview go nowhere */
      doc.addEventListener('click', function (e) { if (e.target.closest('a')) e.preventDefault(); });
      applyFields(root);
    });
    frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}' + css +
      '</style></head><body>' + sample(root.getAttribute('data-style-preview'), root.getAttribute('data-thumb')) + '</body></html>';
  }

  function setWidth(root, value) {
    var widths = JSON.parse(root.getAttribute('data-widths') || '{}');
    var frame = root.querySelector('.style-preview__frame');
    frame.style.inlineSize = widths[value] || '';            /* '' = Desktop: the CSS's 100% */
    requestAnimationFrame(function () { fit(frame); });
  }

  /* ── Live fields (Edit) ── */
  function fieldValue(row) {
    var ctl = row.querySelector('input[type="color"], .input__control, .textarea__control');
    if (ctl) return ctl.value;
    var sel = row.querySelector('.sel__value');
    return sel ? sel.textContent.trim() : '';
  }

  function pushField(root, row) {
    var frame = root.querySelector('.style-preview__frame');
    var doc = frame.contentDocument;
    if (!doc || !doc.documentElement) return;
    var v = fieldValue(row);
    var unit = row.getAttribute('data-preview-unit') || '';
    var prop = row.getAttribute('data-preview-prop');
    if (v === '' || v === 'Select...') doc.documentElement.style.removeProperty(prop);
    else doc.documentElement.style.setProperty(prop, v + unit);
    fit(frame);
  }

  function previewFor(row) {
    var screen = row.closest('[data-record-screen]') || document;
    return screen.querySelector('[data-style-preview]');
  }

  function applyFields(root) {
    var screen = root.closest('[data-record-screen]') || document;
    screen.querySelectorAll('[data-preview-prop]').forEach(function (row) { pushField(root, row); });
  }

  document.addEventListener('input', function (e) {
    var row = e.target.closest && e.target.closest('[data-preview-prop]');
    if (row && previewFor(row)) pushField(previewFor(row), row);
  });
  document.addEventListener('click', function (e) {
    var row = e.target.closest && e.target.closest('[data-preview-prop]');
    if (row && e.target.closest('.sel__menu-item') && previewFor(row)) {
      requestAnimationFrame(function () { pushField(previewFor(row), row); });   /* after Select.js writes the value */
    }
  });

  document.addEventListener('seg-control:change', function (e) {
    var section = e.target.closest('.record-section--preview');
    var root = section && section.querySelector('[data-style-preview]');
    if (root) setWidth(root, e.detail.value);
  });

  /* The column changes width with no window resize (a docked sidebar menu), so watch the preview itself. */
  var watcher = window.ResizeObserver && new ResizeObserver(function (entries) {
    entries.forEach(function (en) { fit(en.target.querySelector('.style-preview__frame')); });
  });

  function init() {
    document.querySelectorAll('[data-style-preview]').forEach(function (root) {
      build(root);
      if (watcher) watcher.observe(root);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
