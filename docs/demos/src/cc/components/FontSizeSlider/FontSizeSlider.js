/**
 * FontSizeSlider — paints the filled portion of the track on the input's
 * background as a linear-gradient. Webkit doesn't have a `::-progress`
 * pseudo-element, so the filled bar is faked via a value-aware gradient
 * applied to the input itself. Firefox uses `::-moz-range-progress`
 * natively (already styled in CSS) — this JS is a no-op there but
 * harmless.
 *
 * Usage:
 *   import { initFontSizeSlider } from './FontSizeSlider.js';
 *   document.querySelectorAll('.font-size-slider__input').forEach(initFontSizeSlider);
 */

export function initFontSizeSlider(input) {
  if (!input) return;

  const paint = () => {
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const value = Number(input.value);
    const pct = ((value - min) / (max - min)) * 100;

    const fill = 'var(--ai-surface-brand)';
    const track = 'var(--cc-actions-menu-secondary-bg)';

    input.style.backgroundImage =
      `linear-gradient(to right, ${fill} 0%, ${fill} ${pct}%, ${track} ${pct}%, ${track} 100%)`;
  };

  paint();
  input.addEventListener('input', paint);
  input.addEventListener('change', paint);
}

// Auto-init any FontSizeSlider inputs present on the page when this
// module is imported. Demo pages don't need to wire each one manually.
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.font-size-slider__input').forEach(initFontSizeSlider);
  });
}
