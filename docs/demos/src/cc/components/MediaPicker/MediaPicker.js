/* MediaPicker — empty / filled slot state.
 *
 *   Remove ([data-media-remove]) empties the slot: the placeholder icon comes back, the
 *   `media-picker--empty` modifier swaps the pencil + trash for Choose file, and focus moves to
 *   Choose file (the control that replaced the one just pressed).
 *   Filling is done by whatever picks the image (Selector.js Type=Media) through
 *   window.mediaPicker.fill(picker, src).
 *
 * Delegated at the document, bound once.
 */
// TODO(backend:RecordScreen) record-media-remove: client-side only → clear the field's MediaItemCode on save
(function () {
  'use strict';
  if (window.mediaPicker) return;

  function thumb(picker) { return picker.querySelector('.media-picker__thumb'); }

  function fill(picker, src) {
    var t = thumb(picker);
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    t.innerHTML = '';
    t.appendChild(img);
    picker.classList.remove('media-picker--empty');
  }

  function empty(picker) {
    thumb(picker).innerHTML = '<i data-lucide="image" aria-hidden="true"></i>';
    picker.classList.add('media-picker--empty');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    var choose = picker.querySelector('[data-media-choose]');
    if (choose) choose.focus();
  }

  window.mediaPicker = { fill: fill, empty: empty };

  document.addEventListener('click', function (e) {
    var remove = e.target.closest('[data-media-picker] [data-media-remove]');
    if (remove) empty(remove.closest('[data-media-picker]'));
  });
})();
