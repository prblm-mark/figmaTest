#!/usr/bin/env node
/**
 * gen-figma-rebind.mjs — emit a `use_figma` payload that audits a captured Figma
 * frame's colour bindings by COLLECTION and rebinds anything not on Semantic.
 *
 *   node scripts/gen-figma-rebind.mjs <nodeId> [--page 2025:803] [--apply]
 *   node scripts/gen-figma-rebind.mjs 3281:2 --apply > /tmp/payload.js
 *
 * Default is a DRY RUN: the payload reports what it would change and changes
 * nothing. Pass --apply to emit the mutating version.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 * The browser resolves `var(--ai-surface-error)` to `rgb(220,38,38)` before the
 * page is serialised, so a Figma capture never sees the token NAME — and neither
 * does the Re-tokenise plugin. Both bind by resolved VALUE, and value is lossy
 * here for two compounding reasons:
 *
 *   1. Every Semantic variable ALIASES a Primitive, so a semantic and the
 *      primitive it points at resolve to the same hex. Nothing in a value
 *      comparison can prefer the semantic layer.
 *   2. Many semantics share one hex — #2E2E32 matches fifteen of them.
 *
 * Observed on 3281:2 (2026-08-05): 79 of 576 colour bindings landed on
 * Primitives/Colours instead of Semantic. A primitive binding does not follow
 * theme modes, so those frames break in dark.
 *
 * The authoritative hex → token mapping exists only in the CSS. This script
 * reads it and hands it to Figma, which is the one thing neither the capture nor
 * the plugin can do.
 *
 * ─── ON AMBIGUITY ───────────────────────────────────────────────────────────
 * Several `--ai-*` tokens share a hex (#67676C is text-contrast AND
 * icon-secondary AND btn-text-disabled). Where that happens this script REFUSES
 * to guess: the hex must appear in OVERRIDES below, sourced from the prototype's
 * own CSS. Anything ambiguous and un-overridden is reported, never bound.
 * Guessing is the one outcome worse than leaving a primitive in place, because a
 * wrong semantic looks correct forever.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ─── CURATED OVERRIDES ──────────────────────────────────────────────────────
 * hex → the Figma Semantic variable name to use, for hexes that more than one
 * `--ai-*` token shares. Each entry must cite the source line that settles it,
 * so the next person can re-check rather than trust it.
 *
 * SeatingPlanner: the role dots and status pills, from
 * src/prototypes/SeatingPlanner/SeatingPlanner.css:560-564 / 742-746.
 */
const OVERRIDES = {
  // .sp-dot--vip / .sp-role--vip { background: var(--ai-surface-neutral) }
  // Value matching offers 15 candidates for this hex; the CSS settles it.
  '#2E2E32': { name: 'surface/neutral', because: 'SeatingPlanner.css:564 .sp-dot--vip' },
  // The search-input placeholder — a TEXT fill, so text/contrast rather than
  // icon/secondary or the button disabled tokens that share this hex.
  '#67676C': { name: 'text/contrast', because: 'placeholder text; TEXT fill, not icon or button' },
};

/* Tokens whose Figma name does NOT follow the `--ai-a-b` → `a/b` convention.
 * Discovered the hard way: `--ai-btn-text-disabled` is
 * `components/global/button/text-disabled` in Figma, not `btn/text-disabled`.
 * Anything not listed here is derived by convention AND verified to exist in the
 * Semantic collection before use — an unverified name is reported, not applied. */
const NAME_FIXUPS = {
  // add entries as they surface; the payload reports any name it cannot find
};

function parseTokens() {
  // Base tokens.css only — it holds the LIGHT values, and captures are taken in
  // the light theme. tokens-dark.css etc. would introduce hexes that do not
  // appear in the capture and could only create false matches.
  const css = readFileSync(join(ROOT, 'css/tokens.css'), 'utf8');
  const byHex = new Map();
  const re = /--ai-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g;
  let m;
  while ((m = re.exec(css))) {
    const hex = m[2].toUpperCase();
    if (!byHex.has(hex)) byHex.set(hex, []);
    byHex.get(hex).push(m[1]);
  }
  return byHex;
}

function figmaName(token) {
  if (NAME_FIXUPS[token]) return NAME_FIXUPS[token];
  const i = token.indexOf('-');
  return i === -1 ? token : token.slice(0, i) + '/' + token.slice(i + 1);
}

const args = process.argv.slice(2);
const nodeId = args.find((a) => !a.startsWith('--'));
const apply = args.includes('--apply');
const pageIdx = args.indexOf('--page');
const pageId = pageIdx > -1 ? args[pageIdx + 1] : '2025:803';

if (!nodeId) {
  console.error('usage: node scripts/gen-figma-rebind.mjs <nodeId> [--page 2025:803] [--apply]');
  process.exit(1);
}

const byHex = parseTokens();
const map = {};
const ambiguous = [];
for (const [hex, tokens] of byHex) {
  if (OVERRIDES[hex]) {
    map[hex] = { name: OVERRIDES[hex].name, source: 'override: ' + OVERRIDES[hex].because };
  } else if (tokens.length === 1) {
    map[hex] = { name: figmaName(tokens[0]), source: '--ai-' + tokens[0] };
  } else {
    ambiguous.push({ hex, tokens });
  }
}

console.error(`[gen] ${byHex.size} distinct hexes in tokens.css`);
console.error(`[gen] ${Object.keys(map).length} resolvable  ·  ${ambiguous.length} ambiguous (not mapped)`);
if (ambiguous.length) {
  console.error('[gen] ambiguous hexes — add to OVERRIDES if the payload reports them:');
  for (const a of ambiguous.slice(0, 12)) {
    console.error(`        ${a.hex}  ${a.tokens.map((t) => '--ai-' + t).join(', ')}`);
  }
}
console.error(`[gen] emitting ${apply ? 'APPLY' : 'DRY RUN'} payload for ${nodeId} on page ${pageId}`);

/* The emitted code runs inside use_figma. It re-derives everything it needs from
 * the file itself, so the only thing coming from here is the CSS-derived map. */
process.stdout.write(`// GENERATED by scripts/gen-figma-rebind.mjs — do not edit by hand
// Target: ${nodeId} on page ${pageId} · mode: ${apply ? 'APPLY' : 'DRY RUN'}
// The map below is derived from css/tokens.css; ambiguous hexes come from the
// curated OVERRIDES in that script, each citing the CSS line that settles it.
const APPLY = ${apply};
const MAP = ${JSON.stringify(map, null, 2)};

const page = await figma.getNodeByIdAsync('${pageId}');
if (!page) throw new Error('page ${pageId} not found');
await figma.setCurrentPageAsync(page);
const frame = await figma.getNodeByIdAsync('${nodeId}');
if (!frame) throw new Error('node ${nodeId} not found');

function hex(c) {
  function h(x) { return ('0' + Math.round(x * 255).toString(16)).slice(-2); }
  return '#' + (h(c.r) + h(c.g) + h(c.b)).toUpperCase();
}

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const semantic = cols.filter(function (c) { return c.name === 'Semantic'; })[0];
if (!semantic) throw new Error('no collection named Semantic');

// Semantic variables by name, so a mapped name can be VERIFIED to exist before
// anything is bound to it. An unverified name is reported, never applied.
const byName = {};
for (const vid of semantic.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(vid);
  if (v) byName[v.name] = v;
}

const colOf = {};
async function collectionOf(id) {
  if (colOf[id]) return colOf[id];
  const v = await figma.variables.getVariableByIdAsync(id);
  const c = v ? await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId) : null;
  return (colOf[id] = { collection: c ? c.name : '?', name: v ? v.name : '?' });
}

const out = {
  mode: APPLY ? 'APPLY' : 'DRY RUN',
  totalSolidPaints: 0,
  alreadySemantic: 0,
  unbound: 0,
  wouldRebind: {},
  UNRESOLVED: [],
  mutatedNodeIds: []
};

for (const n of frame.findAll(function () { return true; })) {
  if (!Array.isArray(n.fills) || !n.fills.length) continue;
  const copy = n.fills.slice();
  let changed = false;
  for (let i = 0; i < copy.length; i++) {
    const p = copy[i];
    if (!p || p.type !== 'SOLID') continue;
    out.totalSolidPaints++;
    const bvc = p.boundVariables && p.boundVariables.color;
    if (!bvc || !bvc.id) { out.unbound++; continue; }
    const cur = await collectionOf(bvc.id);
    if (cur.collection === 'Semantic') { out.alreadySemantic++; continue; }

    const k = hex(p.color);
    const entry = MAP[k];
    if (!entry) {
      out.UNRESOLVED.push({ why: 'hex not in map (ambiguous or absent from tokens.css)',
                            hex: k, boundTo: cur.collection + '/' + cur.name, node: n.name.slice(0, 24) });
      continue;
    }
    const target = byName[entry.name];
    if (!target) {
      out.UNRESOLVED.push({ why: 'mapped Semantic variable not found — add a NAME_FIXUPS entry',
                            hex: k, wanted: entry.name, node: n.name.slice(0, 24) });
      continue;
    }
    const key = entry.name + '  (' + k + ' from ' + cur.collection + ')';
    out.wouldRebind[key] = (out.wouldRebind[key] || 0) + 1;
    if (APPLY) {
      copy[i] = figma.variables.setBoundVariableForPaint(p, 'color', target);
      changed = true;
    }
  }
  if (changed) { n.fills = copy; out.mutatedNodeIds.push(n.id); }
}

// Re-audit so the result is measured, not assumed.
let remaining = 0;
for (const n of frame.findAll(function () { return true; })) {
  if (!Array.isArray(n.fills)) continue;
  for (const p of n.fills) {
    if (!p || p.type !== 'SOLID') continue;
    const bvc = p.boundVariables && p.boundVariables.color;
    if (bvc && bvc.id && (await collectionOf(bvc.id)).collection !== 'Semantic') remaining++;
  }
}
out.nonSemanticRemaining = remaining;
out.mutatedNodeCount = out.mutatedNodeIds.length;
out.mutatedNodeIds = out.mutatedNodeIds.slice(0, 10);
return out;
`);
