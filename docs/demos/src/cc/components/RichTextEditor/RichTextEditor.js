/* RichTextEditor — TinyMCE on a record screen's rich-text fields (Introduction, Main Body, Text 2–5).
 *
 * The live Control Centre runs TinyMCE (8.8.2 on affino.com, read 2026-09-29) with six editors per
 * article. This mirrors ITS configuration — toolbar, plugins, style formats, 300px height,
 * statusbar with word count, no menubar — so the demo edits the way the product does, and adds
 * one thing the product does not have: an Insert image button that opens the design system's
 * Selector Type=Media instead of TinyMCE's URL dialog.
 *
 * Markup contract:
 *   <div class="rich-text">
 *     <textarea class="textarea__control" data-rich-text id="…">…html…</textarea>
 *   </div>
 * The textarea stays the form value (TinyMCE writes back to it); without the CDN it is still a
 * working plain textarea.
 *
 * Theming: the editor's content is an iframe, so the page's tokens do not reach it — the token
 * files are loaded INTO the iframe (content_css) and the page's <html> data-* attributes
 * (data-brand, data-theme) are mirrored onto the iframe's <html>, so it resolves the same values.
 * The chrome (toolbar, frame, statusbar) is themed in RichTextEditor.css. Dark uses TinyMCE's
 * oxide-dark skin; the theme is read at init.
 */
// TODO(backend:RecordScreen) record-rich-text: TinyMCE 8.8.2 from jsDelivr with license_key 'gpl'
//   and a demo config → the product's own TinyMCE build, licence and config (content_css = the
//   site's LiveEditForm.css + CustomFonts.css, autosave keys, image handling)
(function () {
  'use strict';
  if (window.__richTextBound) return;
  window.__richTextBound = true;

  var CDN = 'https://cdn.jsdelivr.net/npm/tinymce@8.8.2/tinymce.min.js';
  var here = (document.currentScript && document.currentScript.src) || location.href;
  function asset(rel) { return new URL(rel, here).href; }

  // Tokens the content needs, relative to this file (src/cc/components/RichTextEditor/).
  var CONTENT_CSS = [
    asset('../../../../css/tokens.css'),
    asset('../../../../css/tokens-dark.css'),
    asset('../../../../css/tokens-cc.css'),
    asset('../../../../css/tokens-cc-dark.css'),
    asset('RichTextEditor.content.css')
  ];

  // Live's style formats (Headings / Inline / Blocks), as read from affino.com.
  var STYLE_FORMATS = [
    { title: 'Headings', items: [1, 2, 3, 4, 5, 6].map(function (n) { return { title: 'Heading ' + n, format: 'h' + n }; }) },
    { title: 'Inline', items: [
      { title: 'Bold', format: 'bold' }, { title: 'Italic', format: 'italic' },
      { title: 'Underline', format: 'underline' }, { title: 'Strikethrough', format: 'strikethrough' },
      { title: 'Superscript', format: 'superscript' }, { title: 'Subscript', format: 'subscript' },
      { title: 'Code', format: 'code' }] },
    { title: 'Blocks', items: [
      { title: 'Paragraph', format: 'p' },
      { title: 'Quote', block: 'div', classes: ['aos-ShortQuote'], wrapper: true, merge_siblings: true }] }
  ];

  function dark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  function mirrorTheme(editor) {
    var src = document.documentElement;
    var dst = editor.getDoc().documentElement;
    Array.prototype.forEach.call(src.attributes, function (a) {
      if (a.name.indexOf('data-') === 0) dst.setAttribute(a.name, a.value);
    });
  }

  function init() {
    var fields = document.querySelectorAll('textarea[data-rich-text]');
    if (!fields.length || !window.tinymce) return;
    window.tinymce.init({
      selector: 'textarea[data-rich-text]',
      license_key: 'gpl',
      menubar: false,
      promotion: false,
      branding: false,
      height: 300,
      min_height: 100,
      statusbar: true,
      skin: dark() ? 'oxide-dark' : 'oxide',
      content_css: CONTENT_CSS,
      plugins: 'autosave lists advlist link table fullscreen wordcount directionality nonbreaking',
      // Insert image only where the page has the media picker to open (the record Edit screen).
      toolbar: 'restoredraft | undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | ' +
               'link' + (document.querySelector('[data-selector="media"]') ? ' affinoimage' : '') +
               ' | bullist numlist outdent indent | pastetext removeformat | ltr rtl | table | fullscreen',
      toolbar_mode: 'wrap',
      style_formats: STYLE_FORMATS,
      autosave_prefix: 'cc-rte-{path}{query}-{id}-',
      relative_urls: false,
      setup: function (editor) {
        // Insert image → the design system's media picker (Selector Type=Media).
        editor.ui.registry.addButton('affinoimage', {
          icon: 'image',
          tooltip: 'Insert image',
          onAction: function () {
            if (!window.selector || !window.selector.openMedia) return;
            window.selector.openMedia(editor.getContainer(), function (src, name) {
              editor.insertContent('<img src="' + editor.dom.encode(src) + '" alt="' + editor.dom.encode(name || '') + '">');
              editor.focus();
            });
          }
        });
        editor.on('init', function () {
          mirrorTheme(editor);
          // A theme switched after load re-resolves the CONTENT's tokens at once; TinyMCE's own
          // skin (oxide / oxide-dark) is chosen at init, so the chrome follows on the next load.
          new MutationObserver(function () { mirrorTheme(editor); })
            .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-brand'] });
        });
        editor.on('change input undo redo', function () { editor.save(); });
      }
    });
  }

  function load() {
    if (!document.querySelector('textarea[data-rich-text]')) return;
    if (window.tinymce) { init(); return; }
    var s = document.createElement('script');
    s.src = CDN;
    s.referrerPolicy = 'origin';
    s.onload = init; // offline: the textareas simply stay plain textareas
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
