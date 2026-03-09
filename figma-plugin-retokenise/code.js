// Re-tokenise — Figma Plugin v4
// Walks selected frames and rebinds raw values to Figma variables.
// Prioritises "Tokens" and "Typography" collections over "Primitives".
// Replaces existing primitive bindings with preferred-collection bindings.

(async function main() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("Select a frame to re-tokenise.", { error: true });
    figma.closePlugin();
    return;
  }

  // ── 1. Categorise variable collections ─────────────────────────────────

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const preferredCollectionIds = new Set();
  const PREFERRED_NAMES = ["tokens", "typography", "components", "semantic"];

  for (const col of collections) {
    const nameLower = col.name.toLowerCase().trim();
    if (PREFERRED_NAMES.some(pref => nameLower.includes(pref))) {
      preferredCollectionIds.add(col.id);
    }
  }

  console.log(`[re-tokenise] ${collections.length} collections, ${preferredCollectionIds.size} preferred`);
  for (const col of collections) {
    console.log(`  - "${col.name}" ${preferredCollectionIds.has(col.id) ? "★ PREFERRED" : "(other)"}`);
  }

  // ── 2. Build lookup tables ─────────────────────────────────────────────

  const colorVars = await figma.variables.getLocalVariablesAsync("COLOR");
  const floatVars = await figma.variables.getLocalVariablesAsync("FLOAT");

  const hexToColorVars = new Map();
  for (const v of colorVars) {
    const tier = preferredCollectionIds.has(v.variableCollectionId) ? "preferred" : "other";
    const resolvedHex = await resolveColorHex(v);
    if (!resolvedHex) continue;
    const key = resolvedHex.toLowerCase();
    if (!hexToColorVars.has(key)) hexToColorVars.set(key, { preferred: [], other: [] });
    hexToColorVars.get(key)[tier].push(v);
  }

  const floatToVars = new Map();
  for (const v of floatVars) {
    const tier = preferredCollectionIds.has(v.variableCollectionId) ? "preferred" : "other";
    const resolvedVal = await resolveFloatValue(v);
    if (resolvedVal === null) continue;
    const key = round2(resolvedVal);
    if (!floatToVars.has(key)) floatToVars.set(key, { preferred: [], other: [] });
    floatToVars.get(key)[tier].push(v);
  }

  console.log(`[re-tokenise] ${hexToColorVars.size} unique colors, ${floatToVars.size} unique floats indexed`);

  // ── 3. Traverse and rebind ─────────────────────────────────────────────

  const stats = { nodes: 0, colorBindings: 0, scalarBindings: 0, typoBindings: 0, skipped: 0 };

  for (const root of selection) {
    const nodes = "findAll" in root ? [root, ...root.findAll(() => true)] : [root];
    for (const node of nodes) {
      stats.nodes++;
      await processNode(node, hexToColorVars, floatToVars, preferredCollectionIds, stats);
    }
  }

  const total = stats.colorBindings + stats.scalarBindings + stats.typoBindings;
  figma.notify(
    `Done — ${total} binding${total !== 1 ? "s" : ""} (${stats.colorBindings} color, ${stats.scalarBindings} layout, ${stats.typoBindings} typography) across ${stats.nodes} node${stats.nodes !== 1 ? "s" : ""}.` +
    (stats.skipped > 0 ? ` ${stats.skipped} ambiguous.` : "")
  );
  console.log(`[re-tokenise] Complete:`, stats);
  figma.closePlugin();
})();


// ── Process a single node ────────────────────────────────────────────────

async function processNode(node, hexToColorVars, floatToVars, preferredCollectionIds, stats) {
  if ("fills" in node && Array.isArray(node.fills)) {
    await rebindPaints(node, "fills", hexToColorVars, preferredCollectionIds, stats);
  }
  if ("strokes" in node && Array.isArray(node.strokes)) {
    await rebindPaints(node, "strokes", hexToColorVars, preferredCollectionIds, stats);
  }
  await rebindScalars(node, floatToVars, preferredCollectionIds, stats);
  if (node.type === "TEXT") {
    await rebindTypography(node, floatToVars, preferredCollectionIds, stats);
  }
}


// ── Layout scalar rebinding ──────────────────────────────────────────────

const SCALAR_FIELDS = [
  "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
  "itemSpacing", "counterAxisSpacing",
  "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"
];

async function rebindScalars(node, floatToVars, preferredCollectionIds, stats) {
  for (const field of SCALAR_FIELDS) {
    await tryBindFloat(node, field, floatToVars, preferredCollectionIds, stats, "scalarBindings");
  }
}


// ── Typography rebinding ─────────────────────────────────────────────────

async function rebindTypography(node, floatToVars, preferredCollectionIds, stats) {
  await tryBindFloat(node, "fontSize", floatToVars, preferredCollectionIds, stats, "typoBindings");
  await tryBindFloat(node, "lineHeight", floatToVars, preferredCollectionIds, stats, "typoBindings");
  await tryBindFloat(node, "letterSpacing", floatToVars, preferredCollectionIds, stats, "typoBindings");
  await tryBindFloat(node, "fontWeight", floatToVars, preferredCollectionIds, stats, "typoBindings");
  await tryBindFloat(node, "paragraphSpacing", floatToVars, preferredCollectionIds, stats, "typoBindings");
}


// ── Shared float-binding logic ───────────────────────────────────────────

async function tryBindFloat(node, field, floatToVars, preferredCollectionIds, stats, statKey) {
  // Skip if already bound to a preferred variable
  if (node.boundVariables && node.boundVariables[field]) {
    const existing = node.boundVariables[field];
    const existingVar = await figma.variables.getVariableByIdAsync(existing.id);
    if (existingVar && preferredCollectionIds.has(existingVar.variableCollectionId)) {
      return; // Already bound to preferred — keep it
    }
    // Bound to non-preferred — will replace below
  }

  // Read raw value
  let value;
  try {
    value = node[field];
  } catch (_) {
    return;
  }

  // Handle object values (lineHeight can be { value: 24, unit: "PIXELS" })
  if (value && typeof value === "object" && "value" in value) {
    value = value.value;
  }
  if (typeof value !== "number" || value === 0) return;

  const key = round2(value);
  const bucket = floatToVars.get(key);
  if (!bucket) return;

  // Always prefer the preferred collection
  const candidates = bucket.preferred.length > 0 ? bucket.preferred : bucket.other;
  if (candidates.length === 0) return;

  if (candidates.length === 1) {
    try {
      node.setBoundVariable(field, candidates[0]);
      stats[statKey]++;
      console.log(`  [${statKey}] ${node.name}.${field} = ${value} → ${candidates[0].name}`);
    } catch (_) { /* not bindable */ }
  } else {
    const picked = pickBestFloat(field, candidates);
    if (picked) {
      try {
        node.setBoundVariable(field, picked);
        stats[statKey]++;
        console.log(`  [${statKey}] ${node.name}.${field} = ${value} → ${picked.name} (heuristic)`);
      } catch (_) { /* not bindable */ }
    } else {
      stats.skipped++;
      console.log(`  [SKIP] ${node.name}.${field} = ${value} — ${candidates.length}: ${candidates.map(c => c.name).join(", ")}`);
    }
  }
}


// ── Float heuristics ─────────────────────────────────────────────────────
// Variable names from the log:
//   spacing/5, spacing/7, font/size-fixed/xs, font/size-fluid/xs,
//   line height/1, line height/3, border/radius-lg, icon-size/sm

function pickBestFloat(field, candidates) {
  const fieldLower = field.toLowerCase();

  // fontSize → prefer "size-fixed" (not fluid, not spacing, not line height)
  if (fieldLower === "fontsize") {
    const matches = candidates.filter(v => v.name.toLowerCase().includes("size-fixed"));
    if (matches.length === 1) return matches[0];
    return null;
  }

  // lineHeight → prefer "line height" variables
  if (fieldLower === "lineheight") {
    const matches = candidates.filter(v => v.name.toLowerCase().includes("line height") || v.name.toLowerCase().includes("leading"));
    if (matches.length === 1) return matches[0];
    return null;
  }

  // fontWeight → prefer "weight" variables
  if (fieldLower === "fontweight") {
    const matches = candidates.filter(v => v.name.toLowerCase().includes("weight"));
    if (matches.length === 1) return matches[0];
    return null;
  }

  // letterSpacing → prefer "letter" or "tracking" variables
  if (fieldLower === "letterspacing") {
    const matches = candidates.filter(v => {
      const n = v.name.toLowerCase();
      return n.includes("letter") || n.includes("tracking");
    });
    if (matches.length === 1) return matches[0];
    return null;
  }

  // padding → prefer "spacing" variables (not font, not radius, not icon)
  if (fieldLower.includes("padding") || fieldLower.includes("spacing") || fieldLower.includes("gap")) {
    const matches = candidates.filter(v => v.name.toLowerCase().includes("spacing"));
    if (matches.length === 1) return matches[0];
    return null;
  }

  // radius → prefer "radius" variables
  if (fieldLower.includes("radius")) {
    const matches = candidates.filter(v => v.name.toLowerCase().includes("radius"));
    if (matches.length === 1) return matches[0];
    return null;
  }

  return null;
}


// ── Paint (fill/stroke) rebinding ────────────────────────────────────────
// Now REPLACES existing non-preferred bindings instead of skipping.

async function rebindPaints(node, prop, hexToColorVars, preferredCollectionIds, stats) {
  const paints = node[prop];
  if (!Array.isArray(paints) || paints.length === 0) return;

  let changed = false;
  const paintsCopy = [...paints];

  for (let i = 0; i < paintsCopy.length; i++) {
    const paint = paintsCopy[i];
    if (paint.type !== "SOLID") continue;

    // Check if already bound to a preferred variable — if so, skip
    if (paint.boundVariables && paint.boundVariables.color) {
      const existingVar = await figma.variables.getVariableByIdAsync(paint.boundVariables.color.id);
      if (existingVar && preferredCollectionIds.has(existingVar.variableCollectionId)) {
        continue; // Already preferred — keep it
      }
      // Bound to non-preferred (primitive) — will replace
      console.log(`  [color] ${node.name}.${prop}[${i}] replacing ${existingVar ? existingVar.name : "unknown"} (non-preferred)`);
    }

    // Look up the resolved hex
    const hex = rgbaToHex(paint.color).toLowerCase();
    const bucket = hexToColorVars.get(hex);
    if (!bucket) continue;

    const candidates = bucket.preferred.length > 0 ? bucket.preferred : bucket.other;
    if (candidates.length === 0) continue;

    if (candidates.length === 1) {
      try {
        paintsCopy[i] = figma.variables.setBoundVariableForPaint(paint, "color", candidates[0]);
        stats.colorBindings++;
        changed = true;
        console.log(`  [color] ${node.name}.${prop}[${i}] ${hex} → ${candidates[0].name}`);
      } catch (e) {
        console.log(`  [color] ERROR ${node.name}.${prop}[${i}]: ${e.message}`);
      }
    } else {
      const picked = pickBestColor(node, prop, candidates);
      if (picked) {
        try {
          paintsCopy[i] = figma.variables.setBoundVariableForPaint(paint, "color", picked);
          stats.colorBindings++;
          changed = true;
          console.log(`  [color] ${node.name}.${prop}[${i}] ${hex} → ${picked.name} (heuristic)`);
        } catch (e) {
          console.log(`  [color] ERROR ${node.name}.${prop}[${i}]: ${e.message}`);
        }
      } else {
        stats.skipped++;
        console.log(`  [SKIP] ${node.name}.${prop}[${i}] ${hex} — ${candidates.length}: ${candidates.map(c => c.name).join(", ")}`);
      }
    }
  }

  if (changed) {
    try {
      node[prop] = paintsCopy;
    } catch (_) { /* read-only */ }
  }
}

function pickBestColor(node, prop, candidates) {
  // Step 1: Filter out component-specific tokens (compnonents/*, components/*, chat/*)
  // These are overrides — we want the base semantic tokens.
  const base = candidates.filter(v => {
    const n = v.name.toLowerCase();
    return !n.startsWith("compnonents/") && !n.startsWith("components/") && !n.startsWith("chat/");
  });

  // If filtering leaves candidates, use them; otherwise fall back to full list
  const pool = base.length > 0 ? base : candidates;

  // Step 2: Pick by context
  if (prop === "strokes") {
    const matches = pool.filter(v => v.name.toLowerCase().includes("border"));
    if (matches.length >= 1) return matches[0]; // Pick first border token
  }

  if (prop === "fills" && node.type === "TEXT") {
    const matches = pool.filter(v => v.name.toLowerCase().startsWith("text/"));
    if (matches.length >= 1) return matches[0]; // Pick first text/ token
  }

  if (prop === "fills" && node.type !== "TEXT") {
    const matches = pool.filter(v => v.name.toLowerCase().startsWith("surface/"));
    if (matches.length >= 1) return matches[0]; // Pick first surface/ token
  }

  // Step 3: If only 1 base token left after filtering, use it
  if (pool.length === 1) return pool[0];

  return null;
}


// ── Variable value resolution (chase alias chains) ───────────────────────

async function resolveColorHex(variable) {
  const modeIds = Object.keys(variable.valuesByMode);
  if (modeIds.length === 0) return null;

  let val = variable.valuesByMode[modeIds[0]];
  let depth = 0;

  while (val && typeof val === "object" && "type" in val && val.type === "VARIABLE_ALIAS" && depth < 10) {
    const aliasedVar = await figma.variables.getVariableByIdAsync(val.id);
    if (!aliasedVar) return null;
    const aliasModes = Object.keys(aliasedVar.valuesByMode);
    if (aliasModes.length === 0) return null;
    val = aliasedVar.valuesByMode[aliasModes[0]];
    depth++;
  }

  if (val && typeof val === "object" && "r" in val) {
    return rgbaToHex(val).toLowerCase();
  }
  return null;
}

async function resolveFloatValue(variable) {
  const modeIds = Object.keys(variable.valuesByMode);
  if (modeIds.length === 0) return null;

  let val = variable.valuesByMode[modeIds[0]];
  let depth = 0;

  while (val && typeof val === "object" && "type" in val && val.type === "VARIABLE_ALIAS" && depth < 10) {
    const aliasedVar = await figma.variables.getVariableByIdAsync(val.id);
    if (!aliasedVar) return null;
    const aliasModes = Object.keys(aliasedVar.valuesByMode);
    if (aliasModes.length === 0) return null;
    val = aliasedVar.valuesByMode[aliasModes[0]];
    depth++;
  }

  if (typeof val === "number") return val;
  return null;
}


// ── Utilities ────────────────────────────────────────────────────────────

function rgbaToHex(color) {
  const r = Math.round((color.r || 0) * 255);
  const g = Math.round((color.g || 0) * 255);
  const b = Math.round((color.b || 0) * 255);
  return "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
