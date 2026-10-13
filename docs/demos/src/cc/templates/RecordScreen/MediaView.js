/* Media View — the image viewer (code-first, 2026-10-13).
 *
 * The live media item screen shows every stored version of the item (master, Main Image, Thumbnail,
 * Original, an MP4's stills) and opens each one full size. Here the preview and every version card
 * carry data-media-view="<index>" plus data-record-modal-open, so RecordScreen.js opens the modal
 * (focus, Escape, backdrop) and this file fills it with that version: title, file · size line, the
 * image, "n of N", Download. Previous / Next and the ← → keys step through the versions.
 * Runs on DOMContentLoaded: the generator puts the page's modals after its scripts. */
document.addEventListener('DOMContentLoaded', function () {
  var viewer = document.querySelector('[data-media-viewer]');
  var list = document.querySelector('[data-media-assets]');
  if (!viewer || !list) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.media-asset'));
  var img = viewer.querySelector('[data-media-viewer-img]');
  var title = viewer.querySelector('.modal__title');
  var sub = viewer.querySelector('.modal__subtitle');
  var count = viewer.querySelector('[data-media-viewer-count]');
  var download = viewer.querySelector('[data-media-viewer-download]');
  var current = 0;

  function show(i) {
    current = (i + items.length) % items.length;
    var it = items[current].dataset;
    img.src = it.mediaFull;
    img.alt = it.mediaLabel + ': ' + it.mediaName;
    title.textContent = it.mediaLabel;
    sub.textContent = it.mediaName + ' · ' + it.mediaMeta;
    count.textContent = (current + 1) + ' of ' + items.length;
    download.href = it.mediaFull;
    download.setAttribute('download', it.mediaName);
  }

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-media-view]');
    if (open) { show(parseInt(open.getAttribute('data-media-view'), 10)); return; }
    var step = e.target.closest('[data-media-viewer-step]');
    if (step && viewer.contains(step)) show(current + parseInt(step.getAttribute('data-media-viewer-step'), 10));
  });
  document.addEventListener('keydown', function (e) {
    if (!viewer.classList.contains('modal-overlay--open')) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
});
