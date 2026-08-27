#!/usr/bin/env node
/**
 * gen-figma-rebind.mjs — emit a `use_figma` payload that audits a captured Figma
 * frame's colour bindings and rebinds them to the right SEMANTIC token, choosing
 * the token FAMILY from what each colour is used for.
 *
 *   node scripts/gen-figma-rebind.mjs <nodeId>[,<nodeId>…] [--page 2025:803] [--theme cc|chat] [--apply]
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
 *
 * ─── THE FAMILY RULE DECIDES WHAT TO BIND, NOT WHAT IS WRONG ────────────────
 * CRITICAL, and got this wrong once: the family is used to CHOOSE a token for a
 * paint that needs one. It is NOT a test of correctness for paints that already
 * have one. The Semantic collection holds both generic families (`surface/*`,
 * `text/*`, `icon/*`, `border/*`) AND component-scoped tokens
 * (`components/global/button/secondary-border`, `components/cc/ui/primary-bg`),
 * and a component-scoped token is MORE specific — therefore better — than the
 * generic one with the same value.
 *
 * An earlier version required the bound name to start with the expected generic
 * family, so it "corrected" `components/global/button/secondary-border` on a
 * button border down to `border/contrast`, and 43 paints were made worse in a
 * single run before it was caught.
 *
 * So: anything already on ANY Semantic token is preserved. Only two things get
 * rebound — a paint not on a semantic token at all, and the one narrow
 * wrong-product case (`components/chat/*` on an icon in a Control Centre screen).
 * When in doubt, preserve: the existing binding was chosen with more context than
 * a hex comparison has.
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

function readTokenHexes(file) {
  const css = readFileSync(join(ROOT, file), 'utf8');
  const re = /--ai-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g;
  const out = new Map();                      // token -> HEX
  let m;
  while ((m = re.exec(css))) out.set(m[1], m[2].toUpperCase());
  return out;
}

function parseTokens(theme) {
  /* Base `css/tokens.css` carries the LIGHT values. That was the whole story while every capture
   * was a light-theme component page — but the Control Centre screens render under the CC theme,
   * whose values live in `css/tokens-cc.css`, so their paints resolve to hexes the light map has
   * never seen. Measured on 3565:1383 (2026-08-27): 44 of 160 paints unresolvable, among them
   * 29 on #A1B7C3 which IS `--ai-icon-invert-secondary` in CC and 2 on #667F89 which IS
   * `--ai-text-contrast` there. The old comment claimed a theme overlay "could only manufacture
   * false matches"; the opposite is true — without it a CC capture cannot be rebound at all.
   *
   * The overlay REPLACES a token's hex rather than adding to it, which is why this now resolves
   * token -> hex first and inverts afterwards. Adding would leave every light hex in the map and
   * let a light value match inside a CC frame — that WOULD be a false match. */
  const byToken = readTokenHexes('css/tokens.css');
  if (theme) {
    const overlay = readTokenHexes(`css/tokens-${theme}.css`);
    for (const [token, hex] of overlay) byToken.set(token, hex);
  }

  const perFamily = Object.fromEntries(FAMILIES.map((f) => [f, new Map()]));
  for (const [token, hex] of byToken) {
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
/* A push is almost never one frame — desktop + mobile of the same screen is the minimum, and
 * a multi-screen prototype is several more. Emitting one payload per frame meant the identical
 * 8.5KB MAP crossed the wire once per frame and each run re-read the whole Semantic collection.
 * A comma-separated list audits them all in one call: same page, one setCurrentPageAsync, one
 * variable read, one result to compare across frames. A single id still works unchanged. */
const nodeIds = (args.find((a) => !a.startsWith('--')) || '')
  .split(',').map((s) => s.trim()).filter(Boolean);
const apply = args.includes('--apply');
const pIdx = args.indexOf('--page');
const pageId = pIdx > -1 ? args[pIdx + 1] : '2025:803';
/* `--theme cc` for a Control Centre screen, `--theme chat` for a chat surface. Omit for a
 * plain light-theme component page. The name is the `css/tokens-<name>.css` suffix. */
const tIdx = args.indexOf('--theme');
const theme = tIdx > -1 ? args[tIdx + 1] : null;

if (!nodeIds.length) {
  console.error('usage: node scripts/gen-figma-rebind.mjs <nodeId>[,<nodeId>…] [--page 2025:803] [--theme cc|chat] [--apply]');
  process.exit(1);
}

const perFamily = parseTokens(theme);
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
console.error(`[gen] theme: ${theme || 'light (base)'}`);
console.error(`[gen] emitting ${apply ? 'APPLY' : 'DRY RUN'} for ${nodeIds.join(', ')} on page ${pageId}`);

process.stdout.write(`// GENERATED by scripts/gen-figma-rebind.mjs — do not edit by hand
// Target ${nodeIds.join(', ')} on page ${pageId} · ${apply ? 'APPLY' : 'DRY RUN'}
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
const NODE_IDS = ${JSON.stringify(nodeIds)};
const frames = [];
for (const id of NODE_IDS) {
  let f = await figma.getNodeByIdAsync(id);
  // Node ids are NOT stable across a Re-tokenise run — fall back to a page-children scan.
  if (!f) f = page.children.filter(function (n) { return n.id === id; })[0] || null;
  if (!f) throw new Error('node ' + id + ' not found — re-check the id, it may have changed');
  frames.push(f);
}

function hex(c){function h(x){return ('0'+Math.round(x*255).toString(16)).slice(-2);}return '#'+(h(c.r)+h(c.g)+h(c.b)).toUpperCase();}

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const semantic = cols.filter(function (c) { return c.name === 'Semantic'; })[0];
if (!semantic) throw new Error('no Semantic collection');
const byName = {};
const SEMANTIC_NAMES = {};
for (const vid of semantic.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(vid);
  if (v) { byName[v.name] = v; SEMANTIC_NAMES[v.name] = true; }
}
const cache = {};
async function nameOf(id) {
  if (cache[id]) return cache[id];
  const v = await figma.variables.getVariableByIdAsync(id);
  return (cache[id] = v ? v.name : '?');
}

const results = [];
for (const frame of frames) {
const out = { mode: APPLY ? 'APPLY' : 'DRY RUN', frame: frame.name, frameId: frame.id,
              size: Math.round(frame.width) + 'x' + Math.round(frame.height),
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
      // LEAVE ANYTHING ALREADY ON A SEMANTIC TOKEN ALONE — including
      // components/* tokens, which are MORE specific than the generic families
      // and therefore better. An earlier version required the name to start with
      // the generic family and so "corrected"
      // components/global/button/secondary-border on a button border down to
      // border/contrast — 43 paints made worse in one run. Only two things get
      // rebound: a binding that is not semantic at all, and the narrow
      // wrong-product case below.
      // A component-scoped token is preserved WHEREVER it lives. SEMANTIC_NAMES is built from
      // getLocalVariableCollectionsAsync, which does not return LIBRARY variables — so a token
      // imported from another file (e.g. components/button/primary-text) failed this guard and
      // got "corrected" down to the generic text/invert. That is the documented 43-paints-made-
      // worse failure, just reached by a different route than the one it was written for.
      // Matching on the name prefix covers local and remote alike (2026-08-27).
      const isComponentToken = cur && cur.indexOf('components/') === 0;
      if (cur && (SEMANTIC_NAMES[cur] || isComponentToken)) {
        const otherProduct = cur.indexOf('components/chat/') === 0 && fam === 'icon';
        if (!otherProduct) { out.alreadyCorrect++; continue; }
      }
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
      // "correct" = on ANY semantic token, generic family or component-scoped — including a
      // component token imported from a library, which is not in the local Semantic collection.
      if (nm && (SEMANTIC_NAMES[nm] || nm.indexOf('components/') === 0)) right++; else wrong++;
    }
  }
}
out.audit = { paintsOnCorrectFamily: right, paintsNotOnCorrectFamily: wrong };
out.mutatedNodeCount = mutated.length;
out.mutatedNodeIds = mutated.slice(0, 8);
results.push(out);
}
return results;
`);
