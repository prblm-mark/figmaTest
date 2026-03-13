/**
 * Sidebar theme detection — sets data-sidebar-theme="light|dark" on the sidebar
 * element so CSS color-mix() rules can compute hover/selected overlay colors.
 *
 * Re-run after theme changes or sidebar bg customisation.
 */

function getLuminance(r, g, b) {
  const [rl, gl, bl] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function parseColor(str) {
  // Hex: #rgb, #rrggbb
  const hex = str.replace(/^#/, '');
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  // rgb(r, g, b)
  const match = str.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (match) {
    return { r: +match[1], g: +match[2], b: +match[3] };
  }
  // Fallback — assume dark
  return { r: 0, g: 0, b: 0 };
}

export function initSidebarTheme(sidebarEl) {
  const bg = getComputedStyle(sidebarEl)
    .getPropertyValue('--ai-chat-sidebar-bg').trim();
  const { r, g, b } = parseColor(bg);
  const lum = getLuminance(r, g, b);
  sidebarEl.setAttribute('data-sidebar-theme', lum > 0.5 ? 'light' : 'dark');
}
