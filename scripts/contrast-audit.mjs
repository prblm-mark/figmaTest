/**
 * WCAG 2.1 AA contrast audit across all six design-system modes.
 *
 * Reads the GENERATED token CSS (never the Figma JSON) so it audits exactly what ships.
 * Each mode file carries a complete 99-token colour palette, so a mode is self-contained —
 * no cascade merging is needed.
 *
 * Run: node scripts/contrast-audit.mjs [--md]
 *   (no flag) human-readable report; exits 1 if any AA failure is found
 *   --md      emits the markdown report body for docs/contrast-audit.md
 */

import { readFileSync } from 'node:fs';

// ─── Modes ────────────────────────────────────────────────────────────────────

// TOKENS_DIR lets the same audit run against a different build of the token CSS — used to
// diff the current palette against a pre-change baseline and tell regressions apart from
// pre-existing failures.
const DIR = process.env.TOKENS_DIR ?? 'css';

const MODES = [
  { key: 'Light',     file: `${DIR}/tokens.css`,           selector: ':root' },
  { key: 'Dark',      file: `${DIR}/tokens-dark.css`,      selector: '[data-theme="dark"]' },
  { key: 'ChatLight', file: `${DIR}/tokens-chat.css`,      selector: '[data-surface="chat"]' },
  { key: 'ChatDark',  file: `${DIR}/tokens-chat-dark.css`, selector: '[data-theme="dark"] [data-surface="chat"]' },
  { key: 'CCLight',   file: `${DIR}/tokens-cc.css`,        selector: '[data-brand="cc"]' },
  { key: 'CCDark',    file: `${DIR}/tokens-cc-dark.css`,   selector: '[data-brand="cc"][data-theme="dark"]' },
];

function loadPalette(file) {
  const map = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?);/);
    if (m) map[m[1]] = m[2].trim();
  }
  return map;
}

// ─── Colour maths (WCAG 2.1) ──────────────────────────────────────────────────

function parseColor(v) {
  if (!v) return null;
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  m = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  return null;
}

const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const luminance = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

/** Composite a possibly-translucent colour over an opaque backdrop. */
function over(fg, bg) {
  if (fg.a >= 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function ratio(fg, bg) {
  const a = luminance(fg), b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// ─── Pairings ─────────────────────────────────────────────────────────────────
// Only pairings the design system actually produces. `need` is the AA threshold:
// 4.5 for normal text, 3 for large text / icons / meaningful UI boundaries.
// A transparent background resolves against --ai-surface-primary (the page).

// severity:
//   'blocking' — SC 1.4.3 text contrast, or a boundary/indicator SC 1.4.11 clearly covers
//                (control outlines, focus rings, meaning-bearing icons).
//   'advisory' — decorative reinforcement that 1.4.11 arguably exempts: a border alongside a
//                tinted fill and coloured text that already carry the meaning, table gridlines,
//                and the explicitly-muted icon token. Reported, not counted as a failure.
//   'exempt'   — WCAG explicitly excludes it (disabled controls). Informational only.
const T = (fg, bg, need, group, note, severity = 'blocking') => ({ fg, bg, need, group, note, severity });

const SURFACES = ['--ai-surface-primary', '--ai-surface-elevated-1', '--ai-surface-elevated-2',
                  '--ai-surface-minimal', '--ai-surface-secondary'];
const STATUSES = ['info', 'success', 'warning', 'error', 'neutral'];

const PAIRS = [];

// A. Body text on the surfaces it sits on
for (const s of SURFACES) {
  for (const t of ['--ai-text-primary', '--ai-text-secondary', '--ai-text-contrast']) {
    PAIRS.push(T(t, s, 4.5, 'Body text on surfaces'));
  }
}
PAIRS.push(
  T('--ai-text-invert', '--ai-surface-invert', 4.5, 'Body text on surfaces'),
  T('--ai-text-invert-secondary', '--ai-surface-invert', 4.5, 'Body text on surfaces'),
  T('--ai-text-primary', '--ai-surface-input', 4.5, 'Body text on surfaces'),
  T('--ai-text-contrast', '--ai-surface-input', 4.5, 'Body text on surfaces', 'placeholder'),
  T('--ai-text-brand', '--ai-surface-primary', 4.5, 'Body text on surfaces'),
  T('--ai-text-brand', '--ai-surface-brand-soft-extra', 4.5, 'Body text on surfaces'),
);

// B/C. Status: text on soft fill, text on page, invert text on the solid fill, borders
for (const s of STATUSES) {
  PAIRS.push(
    T(`--ai-text-${s}`, `--ai-surface-${s}-soft`, 4.5, 'Status text on soft fill'),
    T(`--ai-text-${s}`, '--ai-surface-primary', 4.5, 'Status text on page'),
    T('--ai-text-invert', `--ai-surface-${s}`, 4.5, 'Invert text on solid status fill'),
    // The tinted fill and the coloured text already carry the status; the border is
    // reinforcement, so 1.4.11 arguably does not require 3:1 here.
    T(`--ai-border-${s}`, '--ai-surface-primary', 3, 'Status border on page', null, 'advisory'),
    T(`--ai-border-${s}`, `--ai-surface-${s}-soft`, 3, 'Status border on soft fill', null, 'advisory'),
  );
}

// D. Buttons
PAIRS.push(
  T('--ai-btn-primary-text', '--ai-btn-primary-bg', 4.5, 'Buttons'),
  T('--ai-btn-primary-text-hover', '--ai-btn-primary-bg-hover', 4.5, 'Buttons', 'hover'),
  T('--ai-btn-primary-text', '--ai-btn-primary-bg-pressed', 4.5, 'Buttons', 'pressed'),
  T('--ai-btn-secondary-text', '--ai-btn-secondary-bg', 4.5, 'Buttons', 'transparent bg'),
  T('--ai-btn-secondary-text-hover', '--ai-btn-secondary-bg-hover', 4.5, 'Buttons', 'hover'),
  T('--ai-btn-secondary-text', '--ai-btn-secondary-bg-pressed', 4.5, 'Buttons', 'pressed'),
  T('--ai-btn-tertiary-text', '--ai-btn-tertiary-bg', 4.5, 'Buttons', 'transparent bg'),
  T('--ai-btn-tertiary-text-hover', '--ai-btn-tertiary-bg-hover', 4.5, 'Buttons', 'hover'),
  T('--ai-btn-tertiary-text', '--ai-btn-tertiary-bg-pressed', 4.5, 'Buttons', 'pressed'),
  T('--ai-btn-text-disabled', '--ai-btn-bg-disabled', 4.5, 'Buttons', 'disabled control', 'exempt'),
);

// E. Icons (3:1 as meaningful graphical objects)
for (const s of ['--ai-surface-primary', '--ai-surface-minimal', '--ai-surface-secondary']) {
  for (const i of ['--ai-icon-primary', '--ai-icon-secondary', '--ai-icon-brand']) {
    PAIRS.push(T(i, s, 3, 'Icons on surfaces'));
  }
  // icon-contrast is documented as the muted/disabled icon — decorative by intent.
  PAIRS.push(T('--ai-icon-contrast', s, 3, 'Icons on surfaces', 'muted/disabled icon', 'advisory'));
}
PAIRS.push(
  T('--ai-icon-invert', '--ai-surface-invert', 3, 'Icons on surfaces'),
  T('--ai-icon-invert-secondary', '--ai-surface-invert', 3, 'Icons on surfaces'),
);

// F/G. Structural borders and the focus indicator
PAIRS.push(
  T('--ai-border-primary', '--ai-surface-primary', 3, 'Structural borders'),
  T('--ai-border-secondary', '--ai-surface-primary', 3, 'Structural borders', 'default input/card border — a control boundary'),
  T('--ai-border-contrast', '--ai-surface-primary', 3, 'Structural borders'),
  T('--ai-btn-secondary-border', '--ai-surface-primary', 3, 'Buttons', 'outline button boundary'),
  T('--ai-border-brand', '--ai-surface-primary', 3, 'Focus indicator'),
  T('--ai-surface-brand', '--ai-surface-primary', 3, 'Focus indicator', 'focus ring'),
  T('--ai-surface-brand', '--ai-surface-minimal', 3, 'Focus indicator', 'focus ring'),
  T('--ai-datatable-table-border', '--ai-datatable-table-bg', 3, 'Structural borders', 'table gridlines', 'advisory'),
);

// H. Chat surfaces
PAIRS.push(
  T('--ai-chat-msg-text', '--ai-chat-msg-bg', 4.5, 'Chat'),
  T('--ai-chat-sidebar-text', '--ai-chat-sidebar-bg', 4.5, 'Chat'),
  T('--ai-text-primary', '--ai-src-carousel-card-bg', 4.5, 'Chat', 'sources carousel card'),
);

// I. Datatable
for (const bg of ['--ai-datatable-table-header-bg', '--ai-datatable-table-footer-bg',
                  '--ai-datatable-table-expanded-bg', '--ai-datatable-table-subheader-bg']) {
  PAIRS.push(T('--ai-text-primary', bg, 4.5, 'Datatable'),
             T('--ai-text-secondary', bg, 4.5, 'Datatable'));
}

// J. CC component tokens.
// Every mode file emits the --cc-* tokens, but CC chrome only ever renders inside
// [data-brand="cc"] (all 18 CC HTML files set it), so these pairs are meaningless in the
// non-CC modes and are restricted to CCLight/CCDark via `modes`.
const CC_ONLY = ['CCLight', 'CCDark'];
PAIRS.push(...[
  T('--cc-header-icon', '--cc-header-primary-bg', 3, 'CC chrome'),
  // NOT paired with --cc-header-secondary-bg: that token backs the Header pattern
  // (Header.css), while --cc-header-icon is only used inside TopNavigation, whose own
  // background is --cc-header-primary-bg. The two never meet.
  T('--cc-mainmenu-icon', '--cc-mainmenu-primary-bg', 3, 'CC chrome'),
  T('--cc-mainmenu-icon', '--cc-mainmenu-secondary-bg', 3, 'CC chrome'),
  T('--cc-actions-menu-icon', '--cc-actions-menu-primary-bg', 3, 'CC chrome'),
  T('--cc-actions-menu-icon', '--cc-actions-menu-secondary-bg', 3, 'CC chrome'),
  T('--cc-actions-menu-icon-active', '--cc-actions-menu-primary-bg', 3, 'CC chrome'),
  T('--cc-actions-menu-icon-active', '--cc-actions-menu-secondary-bg', 3, 'CC chrome'),
  T('--ai-text-primary', '--cc-ui-primary-bg', 4.5, 'CC chrome'),
  T('--ai-text-primary', '--cc-ui-secondary-bg', 4.5, 'CC chrome'),
].map(p => ({ ...p, modes: CC_ONLY })));

// ─── Run ──────────────────────────────────────────────────────────────────────

const results = [];
for (const mode of MODES) {
  const pal = loadPalette(mode.file);
  const pageBg = parseColor(pal['--ai-surface-primary']);
  for (const p of PAIRS) {
    if (p.modes && !p.modes.includes(mode.key)) continue;
    const rawFg = pal[p.fg], rawBg = pal[p.bg];
    if (rawFg === undefined || rawBg === undefined) continue;
    let fg = parseColor(rawFg), bg = parseColor(rawBg);
    if (!fg || !bg) continue;
    const bgTransparent = bg.a < 1;
    bg = over(bg, pageBg);
    fg = over(fg, bg);
    const r = ratio(fg, bg);
    results.push({
      mode: mode.key, ...p,
      fgVal: rawFg,
      bgVal: bgTransparent ? `${rawBg} over ${pal['--ai-surface-primary']}` : rawBg,
      ratio: r, pass: r >= p.need,
    });
  }
}

const fails = results.filter(r => !r.pass);
const realFails = fails.filter(r => r.severity === 'blocking');
const advisory = fails.filter(r => r.severity === 'advisory');
const informational = fails.filter(r => r.severity === 'exempt');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(results.map(r => ({
    mode: r.mode, fg: r.fg, bg: r.bg, fgVal: r.fgVal, bgVal: r.bgVal,
    // Full precision, not rounded: consumers round once for display. Emitting 3 decimals
    // here made 1.8845 print as 1.89 after a second rounding.
    need: r.need, ratio: r.ratio, pass: r.pass,
    severity: r.severity, group: r.group, note: r.note ?? null,
  })), null, 0));
  process.exit(0);
}

if (process.argv.includes('--md')) {
  const esc = (s) => s.replace(/\|/g, '\\|');
  console.log(`Audited **${results.length} pairings** across ${MODES.length} modes: **${realFails.length} fail**, ${results.length - fails.length} pass.\n`);
  for (const mode of MODES) {
    const mf = realFails.filter(r => r.mode === mode.key);
    console.log(`### ${mode.key} — ${mf.length ? `${mf.length} failure${mf.length > 1 ? 's' : ''}` : 'all pass'}`);
    console.log(`\nSelector: \`${mode.selector}\`\n`);
    if (!mf.length) { console.log('No failures.\n'); continue; }
    console.log('| Foreground | Background | Ratio | Needs | Role |');
    console.log('|---|---|---|---|---|');
    for (const r of mf.sort((a, b) => a.ratio - b.ratio)) {
      console.log(`| \`${r.fg}\`<br>\`${r.fgVal}\` | \`${r.bg}\`<br>\`${esc(r.bgVal)}\` | **${r.ratio.toFixed(2)}:1** | ${r.need}:1 | ${r.group}${r.note ? ` — ${r.note}` : ''} |`);
    }
    console.log('');
  }
  if (advisory.length) {
    console.log(`## Advisory — ${advisory.length} decorative pairings below threshold\n`);
    console.log('These are borders sitting alongside a tinted fill and coloured text that already');
    console.log('carry the meaning, table gridlines, and the explicitly-muted icon token. SC 1.4.11');
    console.log('covers boundaries *required to understand the content*, so these are arguably exempt —');
    console.log('but they are the reason the UI can read as low-definition, so they are listed in full.\n');
    console.log('| Mode | Foreground | Background | Ratio | Role |');
    console.log('|---|---|---|---|---|');
    for (const r of advisory.sort((a, b) => a.ratio - b.ratio || a.mode.localeCompare(b.mode))) {
      console.log(`| ${r.mode} | \`${r.fg}\` \`${r.fgVal}\` | \`${r.bg}\` \`${esc(r.bgVal)}\` | ${r.ratio.toFixed(2)}:1 | ${r.group}${r.note ? ` — ${r.note}` : ''} |`);
    }
    console.log('');
  }
  if (informational.length) {
    console.log('## Informational — disabled states\n');
    console.log('WCAG 2.1 exempts disabled controls from contrast minimums, so these are reported but not counted as failures.\n');
    console.log('| Mode | Foreground | Background | Ratio |');
    console.log('|---|---|---|---|');
    for (const r of informational) {
      console.log(`| ${r.mode} | \`${r.fg}\` \`${r.fgVal}\` | \`${r.bg}\` \`${r.bgVal}\` | ${r.ratio.toFixed(2)}:1 |`);
    }
    console.log('');
  }
} else {
  console.log(`\nWCAG 2.1 AA contrast audit - ${results.length} pairings across ${MODES.length} modes\n`);
  for (const mode of MODES) {
    const mr = results.filter(r => r.mode === mode.key);
    const mf = mr.filter(r => !r.pass && r.severity === 'blocking');
    const ma = mr.filter(r => !r.pass && r.severity === 'advisory').length;
    console.log(`${mode.key.padEnd(10)} ${String(mr.length).padStart(3)} pairs   ${mf.length ? `${mf.length} FAIL` : 'all pass'}${ma ? `   (+${ma} advisory)` : ''}`);
    for (const r of mf.sort((a, b) => a.ratio - b.ratio)) {
      console.log(`   ${r.ratio.toFixed(2).padStart(5)}:1 (needs ${r.need})  ${r.fg} ${r.fgVal}  on  ${r.bg} ${r.bgVal}`);
    }
  }
  console.log(`\n${realFails.length} blocking failures, ${results.length - fails.length} passing.`);
  if (advisory.length) console.log(`${advisory.length} advisory (decorative borders / muted icons) below threshold.`);
  if (informational.length) console.log(`${informational.length} disabled-state pairings below threshold (WCAG-exempt, not counted).`);
}

process.exit(realFails.length ? 1 : 0);
