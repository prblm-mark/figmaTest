#!/usr/bin/env node
/**
 * gen-figma-rebind.mjs — emit a `use_figma` payload that audits a captured Figma
 * frame's colour bindings and rebinds them to the right SEMANTIC token, choosing
 * the token FAMILY from what each colour is used for.
 *
 *   node scripts/gen-figma-rebind.mjs <nodeId> [--page 2025:803] [--apply]
 *
 * Dry run by default: the payload reports and changes nothing. `--apply` mutates.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 * A capture binds colours by resolved VALUE, never by token name — the browser
 * turns `var(--ai-icon-secondary)` into `rgb(103,103,108)` before the page is
 * serialised, so neither the capture nor the Re-tokenise plugin ever sees which
 * token it was. Value is lossy three ways:
 *
 *   1. Every Semantic variable ALIASES a Primitive, so a semantic and its
 *      primitive resolve to the same hex. Value alone cannot prefer the semantic.
 *   2. One hex spans FAMILIES. #67676C is `--ai-text-contrast` AND
 *      `--ai-icon-secondary`; #212123 is `--ai-text-primary` AND
 *      `--ai-icon-primary`. Only the node says which is meant.
 *   3. One hex can repeat WITHIN a family (#FFFFFF is surface-primary,
 *      surface-elevated-1 and surface-elevated-2).
 *
 * Measured on the SeatingPlanner mobile capture: 79 fills landed on primitives,
 * and separately 144 icon paints — Lucide icons are STROKED vectors, which an
 * earlier fills-only version of this script missed entirely. 16 of those were on
 * a Semantic token from the wrong family (a chat text token on an icon), which a
 * naive "already Semantic → skip" rule waves straight through.
 *
 * ─── THE FAMILY RULE ────────────────────────────────────────────────────────
 * The family is decided by node type + property, because that is what the colour
 * is being used FOR:
 *
 *     TEXT           fill    → text/*
 *     vector-like    fill    → icon/*     (VECTOR, BOOLEAN_OPERATION, LINE,
 *     vector-like    stroke  → icon/*      ELLIPSE, STAR, POLYGON)
 *     anything else  fill    → surface/*
 *     anything else  stroke  → border/*
 *
 * Family-scoping resolves most of the cross-family ambiguity for free. What is
 * left is intra-family ties, which must be listed in OVERRIDES below, each citing
 * the CSS line that settles it. Anything ambiguous and un-overridden is REPORTED,
 * never bound — a wrong semantic looks correct forever, whereas a primitive at
 * least looks wrong in dark mode.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FAMILIES = ['surface', 'text', 'icon', 'border'];

/* ─── OVERRIDES: family|hex → Figma variable name ────────────────────────────
 * Only needed where one family has several tokens on the same hex. Cite the
 * source that settles it so the next person can re-check rather than trust it. */
const OVERRIDES = {
  // .sp-dot--vip / .sp-role--vip { background: var(--ai-surface-neutral) }
  // — SeatingPlanner.css:564. Value matching offers 15 candidates for this hex.
  'surface|#2E2E32': { name: 'surface/neutral', because: 'SeatingPlanner.css:564 .sp-dot--vip' },
  // Search-input placeholder: a TEXT fill, so text/contrast rather than the icon
  // or button-disabled tokens that share this hex.
  'text|#67676C': { name: 'text/contrast', because: 'placeholder text is a TEXT fill' },
};

/* Tokens whose Figma name does NOT follow `--ai-<family>-<rest>` → `<family>/<rest>`.
 * `--ai-btn-*` lives under `components/global/button/*` in Figma, for instance.
 * Anything not listed is derived by convention AND verified to exist in the
 * Semantic collection before use; an unverified name is reported, not applied. */
const NAME_FIXUPS = {};

function parseTokens() {
  // Base tokens.css only — it carries the LIGHT values, and captures are taken in
  // the light theme. Dark/chat/CC values would add hexes absent from the capture
  // and could only manufacture false matches.
  const css = readFileSync(join(ROOT, 'css/tokens.css'), 'utf8');
  const perFamily = Object.fromEntries(FAMILIES.map((f) => [f, new Map()]));
  const re = /--ai-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g;
  let m;
  while ((m = re.exec(css))) {
    const token = m[1];
    const hex = m[2].toUpperCase();
    const family = FAMILIES.find((f) => token === f || token.startsWith(f + '-'));
    if (!family) continue;                    // radius/spacing/btn/etc — not colour families
    if (!perFamily[family].has(hex)) perFamily[family].set(hex, []);
    perFamily[family].get(hex).push(token);
  }
  return perFamily;
}

function figmaName(token) {
  if (NAME_FIXUPS[token]) return NAME_FIXUPS[token];
  const i = token.indexOf('-');
  return i === -1 ? token : token.slice(0, i) + '/' + token.slice(i + 1);
}

const args = process.argv.slice(2);
const nodeId = args.find((a) => !a.startsWith('--'));
const apply = args.includes('--apply');
const pIdx = args.indexOf('--page');
const pageId = pIdx > -1 ? args[pIdx + 1] : '2025:803';

if (!nodeId) {
  console.error('usage: node scripts/gen-figma-rebind.mjs <nodeId> [--page 2025:803] [--apply]');
  process.exit(1);
}

const perFamily = parseTokens();
const map = {};            // "family|#HEX" -> { name, source }
const ambiguous = [];
for (const family of FAMILIES) {
  for (const [hex, tokens] of perFamily[family]) {
    const key = family + '|' + hex;
    if (OVERRIDES[key]) {
      map[key] = { name: OVERRIDES[key].name, source: 'override: ' + OVERRIDES[key].because };
    } else if (tokens.length === 1) {
      map[key] = { name: figmaName(tokens[0]), source: '--ai-' + tokens[0] };
    } else {
      ambiguous.push({ key, tokens });
    }
  }
}

console.error(`[gen] families indexed: ${FAMILIES.map((f) => f + '=' + perFamily[f].size).join(' ')}`);
console.error(`[gen] ${Object.keys(map).length} resolvable  ·  ${ambiguous.length} ambiguous (reported, never bound)`);
for (const a of ambiguous) {
  console.error(`        ${a.key}  ${a.tokens.map((t) => '--ai-' + t).join(', ')}`);
}
console.error(`[gen] emitting ${apply ? 'APPLY' : 'DRY RUN'} for ${nodeId} on page ${pageId}`);

process.stdout.write(`// GENERATED by scripts/gen-figma-rebind.mjs — do not edit by hand
// Target ${nodeId} on page ${pageId} · ${apply ? 'APPLY' : 'DRY RUN'}
// Keys are "family|#HEX". Family comes from node type + property, because one hex
// spans families: #67676C is text/contrast AND icon/secondary.
const APPLY = ${apply};
const MAP = ${JSON.stringify(map, null, 2)};

const VECTORISH = { VECTOR:1, BOOLEAN_OPERATION:1, LINE:1, ELLIPSE:1, STAR:1, POLYGON:1 };
function familyFor(node, prop) {
  if (VECTORISH[node.type]) return 'icon';           // fills AND strokes — Lucide is stroked
  if (node.type === 'TEXT') return prop === 'fills' ? 'text' : 'icon';
  return prop === 'fills' ? 'surface' : 'border';
}

const page = await figma.getNodeByIdAsync('${pageId}');
if (!page) throw new Error('page not found');
await figma.setCurrentPageAsync(page);
let frame = await figma.getNodeByIdAsync('${nodeId}');
// Node ids are NOT stable across a Re-tokenise run — fall back to name.
if (!frame) {
  frame = page.children.filter(function (n) { return n.id === '${nodeId}'; })[0] || null;
}
if (!frame) throw new Error('node ${nodeId} not found — re-check the id, it may have changed');

function hex(c){function h(x){return ('0'+Math.round(x*255).toString(16)).slice(-2);}return '#'+(h(c.r)+h(c.g)+h(c.b)).toUpperCase();}

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const semantic = cols.filter(function (c) { return c.name === 'Semantic'; })[0];
if (!semantic) throw new Error('no Semantic collection');
const byName = {};
for (const vid of semantic.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(vid);
  if (v) byName[v.name] = v;
}
const cache = {};
async function nameOf(id) {
  if (cache[id]) return cache[id];
  const v = await figma.variables.getVariableByIdAsync(id);
  return (cache[id] = v ? v.name : '?');
}

const out = { mode: APPLY ? 'APPLY' : 'DRY RUN', frame: frame.name,
              wouldRebind: {}, alreadyCorrect: 0, UNRESOLVED: {}, mapNamesMissing: [] };
for (const k of Object.keys(MAP)) if (!byName[MAP[k].name]) out.mapNamesMissing.push(MAP[k].name);
const mutated = [];

for (const n of frame.findAll(function () { return true; })) {
  let nodeChanged = false;
  for (const prop of ['fills', 'strokes']) {
    if (!Array.isArray(n[prop]) || !n[prop].length) continue;
    const fam = familyFor(n, prop);
    const copy = n[prop].slice();
    let touched = false;
    for (let i = 0; i < copy.length; i++) {
      const p = copy[i];
      if (!p || p.type !== 'SOLID') continue;
      const bvc = p.boundVariables && p.boundVariables.color;
      const cur = bvc && bvc.id ? await nameOf(bvc.id) : null;
      // Right family already — leave it. NB "is on Semantic" is NOT good enough:
      // an icon bound to a chat text token is semantic and still wrong.
      if (cur && cur.indexOf(fam + '/') === 0) { out.alreadyCorrect++; continue; }
      const k = fam + '|' + hex(p.color);
      const target = MAP[k] ? byName[MAP[k].name] : null;
      if (!target) {
        const why = hex(p.color) + ' as ' + fam + (cur ? ' (currently ' + cur + ')' : ' (unbound)');
        out.UNRESOLVED[why] = (out.UNRESOLVED[why] || 0) + 1;
        continue;
      }
      const key = MAP[k].name + ' ← ' + hex(p.color) + ' ' + prop + (cur ? ' (was ' + cur + ')' : '');
      out.wouldRebind[key] = (out.wouldRebind[key] || 0) + 1;
      if (APPLY) { copy[i] = figma.variables.setBoundVariableForPaint(p, 'color', target); touched = true; }
    }
    if (touched) { n[prop] = copy; nodeChanged = true; }
  }
  if (nodeChanged) mutated.push(n.id);
}

// Re-audit: measured, not assumed.
let right = 0, wrong = 0;
for (const n of frame.findAll(function () { return true; })) {
  for (const prop of ['fills', 'strokes']) {
    if (!Array.isArray(n[prop])) continue;
    const fam = familyFor(n, prop);
    for (const p of n[prop]) {
      if (!p || p.type !== 'SOLID') continue;
      const bvc = p.boundVariables && p.boundVariables.color;
      const nm = bvc && bvc.id ? await nameOf(bvc.id) : null;
      if (nm && nm.indexOf(fam + '/') === 0) right++; else wrong++;
    }
  }
}
out.audit = { paintsOnCorrectFamily: right, paintsNotOnCorrectFamily: wrong };
out.mutatedNodeCount = mutated.length;
out.mutatedNodeIds = mutated.slice(0, 8);
return out;
`);
