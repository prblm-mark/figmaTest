/**
 * Style Dictionary v4 config — generates css/tokens.css from Figma DTCG token exports.
 *
 * Handles Figma's non-standard color format (objects with `hex` field) and uses
 * each token's Figma codeSyntax.WEB value as the CSS custom property name.
 *
 * Run: node style-dictionary.config.mjs
 */

import StyleDictionary from 'style-dictionary';

// Strip root-level $extensions (Figma mode name metadata) to avoid SD collision warnings.
// Each token file has { "$extensions": { "com.figma.modeName": "..." } } at the root —
// this is not a design token and causes harmless but noisy collisions when files are merged.
StyleDictionary.registerParser({
  name: 'figma-token-parser',
  pattern: /\.tokens\.json$/,
  parser: ({ contents }) => {
    const json = JSON.parse(contents);
    delete json['$extensions'];
    return json;
  },
});

const fontWeightMap = {
  Regular: 400,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
  ExtraBold: 800,
};

// ─── Custom transforms ────────────────────────────────────────────────────────

/**
 * Extract hex color from Figma's non-standard color object format.
 * Figma exports colors as { colorSpace, components, alpha, hex } objects.
 * After alias resolution, referenced colors are also in this format.
 */
StyleDictionary.registerTransform({
  name: 'color/figma-hex',
  type: 'value',
  filter: (token) => token.$type === 'color',
  transform: (token) => {
    const v = token.$value;
    if (v && typeof v === 'object' && v.hex) {
      if (v.alpha != null && v.alpha < 1) {
        const [r, g, b] = v.components;
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${v.alpha})`;
      }
      return v.hex.toLowerCase();
    }
    if (typeof v === 'string') return v; // already a hex string
    return v;
  },
});

/**
 * Convert tracking (letter-spacing) tokens from Figma px to em.
 * Figma stores letter-spacing as absolute px values (e.g. -0.8, 0.4, 1.6).
 * CSS letter-spacing should use `em` so it scales with the element's font size.
 * Conversion: divide by 16 (base font size) to get em.
 * Must be registered BEFORE dimension/figma-rem so tracking tokens are handled here, not there.
 */
StyleDictionary.registerTransform({
  name: 'tracking/figma-em',
  type: 'value',
  filter: (token) => {
    const path = token.path || [];
    return path.includes('tracking') && token.$type === 'number' && typeof token.$value === 'number';
  },
  transform: (token) => {
    const em = token.$value / 16;
    // Clean up floating-point noise: round to 4 decimal places
    const rounded = Math.round(em * 10000) / 10000;
    return `${rounded}em`;
  },
});

/**
 * Convert number tokens to rem units (16px = 1rem baseline).
 * Applies to: spacing, border radius, font sizes, line heights.
 * Does NOT apply to font weight tokens (those have $type: "string").
 * Does NOT apply to tracking tokens (handled by tracking/figma-em above).
 * Border widths (1px, 2px) and box-shadow offsets are NOT tokens — keep them as px in component CSS.
 */
StyleDictionary.registerTransform({
  name: 'dimension/figma-rem',
  type: 'value',
  filter: (token) => {
    const path = token.path || [];
    return token.$type === 'number' && typeof token.$value === 'number' && !path.includes('tracking');
  },
  transform: (token) => `${token.$value / 16}rem`,
});

/**
 * Map Figma font weight names ("Regular", "SemiBold", etc.) to CSS numeric values.
 * Figma stores weight as a named string; CSS font-weight requires a number.
 */
StyleDictionary.registerTransform({
  name: 'fontWeight/figma-numeric',
  type: 'value',
  filter: (token) => {
    const path = token.path || [];
    return path.includes('weight') && token.$type === 'string';
  },
  transform: (token) => fontWeightMap[token.$value] ?? token.$value,
});

/**
 * Add a sans-serif fallback to font family tokens.
 * Figma stores the family name as a bare string ("Inter").
 */
StyleDictionary.registerTransform({
  name: 'font/figma-family',
  type: 'value',
  filter: (token) => {
    const path = token.path || [];
    return path.includes('family') && token.$type === 'string';
  },
  transform: (token) => `'${token.$value}', sans-serif`,
});

/**
 * Use Figma's codeSyntax.WEB value as the CSS variable name.
 * This ensures exact parity between what Figma calls a variable and its CSS name.
 * Example: "--ai-surface-primary" → strips "--" → "ai-surface-primary"
 *          CSS format adds "--" back → "--ai-surface-primary"
 *
 * Sanitise dots: a "." is not a valid CSS custom-property name character (it
 * terminates the ident), so a WEB codeSyntax like "--ai-spacing-0.5" produces
 * an unusable `var(--ai-spacing-0.5)`. Replace "." with "-" → "--ai-spacing-0-5"
 * (matches the token's own "0-5" path key). Designers can also correct the WEB
 * codeSyntax in Figma; this keeps the output valid regardless.
 */
StyleDictionary.registerTransform({
  name: 'name/figma-web',
  type: 'name',
  transform: (token) => {
    const web = token.$extensions?.['com.figma.codeSyntax']?.WEB;
    if (web) return web.replace(/^--/, '').replace(/\./g, '-');
    // Fallback: derive from path (for tokens without codeSyntax — filtered out anyway)
    return ['ai', ...token.path]
      .join('-')
      .toLowerCase()
      .replace(/\s+/g, '-');
  },
});

/**
 * Seating Planner variable names.
 *
 * The Seating Planner collection is prototype-scoped and its Figma variables carry no
 * codeSyntax.WEB, so names are derived from the token path. Prefixed `--sp-` (not `--ai-`)
 * to keep prototype role colours out of the core design-system namespace — the same
 * carve-out the CC component tokens use with `--cc-`.
 *
 * Example: "Gold Table" → "sp-gold-table" → CSS format adds "--" → "--sp-gold-table"
 */
StyleDictionary.registerTransform({
  name: 'name/seating-planner',
  type: 'name',
  transform: (token) =>
    ['sp', ...token.path]
      .join('-')
      .toLowerCase()
      .replace(/\s+/g, '-'),
});

// ─── Mobile media-query formatter ─────────────────────────────────────────────

StyleDictionary.registerFormat({
  name: 'css/variables-media-query',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `    --${t.name}: ${t.$value};`)
      .join('\n');
    return `@media (max-width: 639px) {\n  :root {\n${vars}\n  }\n}\n`;
  },
});

// ─── Selector-scoped variable formatter ───────────────────────────────────────
// Used for dark mode: outputs variables under an arbitrary CSS selector
// (e.g. `[data-theme="dark"]`) instead of `:root`.

StyleDictionary.registerFormat({
  name: 'css/variables-selector',
  format: ({ dictionary, options }) => {
    const selector = options?.selector ?? ':root';
    const vars = dictionary.allTokens
      .map(t => `  --${t.name}: ${t.$value};`)
      .join('\n');
    return `${selector} {\n${vars}\n}\n`;
  },
});

// ─── Build config ─────────────────────────────────────────────────────────────

const sd = new StyleDictionary({
  usesDtcg: true,
  parsers: ['figma-token-parser'],
  // Source order: Primitives first (for reference resolution), then semantic + scale + typography
  source: [
    'FigmaTokens/Primitives/Primitive.tokens.json',
    'FigmaTokens/Semantic/Light.tokens.json',
    'FigmaTokens/Scale/Scale.tokens.json',
    'FigmaTokens/Typography/Desktop.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',        // Normalize Figma color objects → hex strings
        'tracking/figma-em',      // Convert tracking (letter-spacing) → em
        'dimension/figma-rem',    // Convert number tokens → rem (÷16)
        'fontWeight/figma-numeric', // "SemiBold" → 600
        'font/figma-family',      // "Inter" → "'Inter', sans-serif"
        'name/figma-web',         // Use Figma codeSyntax.WEB as variable name
      ],
      buildPath: 'css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          // Only output tokens that have a Figma web code syntax defined.
          // This excludes raw Primitive palette tokens (intentionally not exposed as CSS).
          // Also exclude $type: "string" tokens (computed tokens — handled by JS, not CSS).
          filter: (token) =>
            !!token.$extensions?.['com.figma.codeSyntax']?.WEB &&
            !(token.$type === 'string' && !token.path?.includes('family') && !token.path?.includes('weight')),
          options: {
            selector: ':root',
            outputReferences: false, // Resolve all aliases to their final values
          },
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();

// ─── Mobile token build (wraps fluid tokens in @media max-width: 767px) ───────

const sdMobile = new StyleDictionary({
  usesDtcg: true,
  parsers: ['figma-token-parser'],
  source: [
    'FigmaTokens/Primitives/Primitive.tokens.json',
    'FigmaTokens/Semantic/Light.tokens.json',
    'FigmaTokens/Scale/Scale.tokens.json',
    'FigmaTokens/Typography/Mobile.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
        'tracking/figma-em',
        'dimension/figma-rem',
        'fontWeight/figma-numeric',
        'font/figma-family',
        'name/figma-web',
      ],
      buildPath: 'css/',
      files: [
        {
          destination: 'tokens-mobile.css',
          format: 'css/variables-media-query',
          filter: (token) =>
            !!token.$extensions?.['com.figma.codeSyntax']?.WEB &&
            token.$type !== 'string' &&
            token.filePath.includes('Mobile.tokens.json'),
          options: { outputReferences: false },
        },
      ],
    },
  },
});

await sdMobile.buildAllPlatforms();

// ─── Dark theme token build ────────────────────────────────────────────────────
// Outputs [data-theme="dark"] { ... } overrides for surface/text/icon/button tokens.
// Typography tokens are theme-invariant and are not included.

const sdDark = new StyleDictionary({
  usesDtcg: true,
  parsers: ['figma-token-parser'],
  source: [
    'FigmaTokens/Primitives/Primitive.tokens.json',
    'FigmaTokens/Semantic/Dark.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
        'tracking/figma-em',
        'dimension/figma-rem',
        'fontWeight/figma-numeric',
        'font/figma-family',
        'name/figma-web',
      ],
      buildPath: 'css/',
      files: [{
        destination: 'tokens-dark.css',
        format: 'css/variables-selector',
        filter: (token) =>
          !!token.$extensions?.['com.figma.codeSyntax']?.WEB &&
          !(token.$type === 'string' && !token.path?.includes('family') && !token.path?.includes('weight')),
        options: {
          selector: '[data-theme="dark"]',
          outputReferences: false,
        },
      }],
    },
  },
});

await sdDark.buildAllPlatforms();

// ─── Minimised layout token build ─────────────────────────────────────────────
// Outputs [data-layout="minimised"] { ... } overrides for typography tokens.
// Activation: add data-layout="minimised" to any container element.
// Applies compact fluid font sizes (same values as mobile) via a CSS selector,
// NOT a media query — this is a deliberate layout density choice, not a device breakpoint.

const sdMinimised = new StyleDictionary({
  usesDtcg: true,
  parsers: ['figma-token-parser'],
  source: [
    'FigmaTokens/Primitives/Primitive.tokens.json',
    'FigmaTokens/Semantic/Light.tokens.json',
    'FigmaTokens/Scale/Scale.tokens.json',
    'FigmaTokens/Typography/Minimised.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
        'tracking/figma-em',
        'dimension/figma-rem',
        'fontWeight/figma-numeric',
        'font/figma-family',
        'name/figma-web',
      ],
      buildPath: 'css/',
      files: [{
        destination: 'tokens-minimised.css',
        format: 'css/variables-selector',
        filter: (token) =>
          !!token.$extensions?.['com.figma.codeSyntax']?.WEB &&
          token.$type !== 'string' &&
          token.filePath.includes('Minimised.tokens.json'),
        options: {
          selector: '[data-layout="minimised"]',
          outputReferences: false,
        },
      }],
    },
  },
});

await sdMinimised.buildAllPlatforms();

// ─── Chat Light token build ──────────────────────────────────────────────────
// Outputs [data-surface="chat"] { ... } overrides for chat-context colours.
// Activation: add data-surface="chat" to a container element.
// Chat uses a pure neutral palette distinct from the core semantic colours.

const sdChatLight = new StyleDictionary({
  usesDtcg: true,
  parsers: ['figma-token-parser'],
  source: [
    'FigmaTokens/Primitives/Primitive.tokens.json',
    'FigmaTokens/Semantic/ChatLight.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
        'tracking/figma-em',
        'dimension/figma-rem',
        'fontWeight/figma-numeric',
        'font/figma-family',
        'name/figma-web',
      ],
      buildPath: 'css/',
      files: [{
        destination: 'tokens-chat.css',
        format: 'css/variables-selector',
        filter: (token) =>
          !!token.$extensions?.['com.figma.codeSyntax']?.WEB &&
          !(token.$type === 'string' && !token.path?.includes('family') && !token.path?.includes('weight')),
        options: {
          selector: '[data-surface="chat"]',
          outputReferences: false,
        },
      }],
    },
  },
});

await sdChatLight.buildAllPlatforms();

// ─── Chat Dark token build ───────────────────────────────────────────────────
// Outputs [data-theme="dark"] [data-surface="chat"] { ... } overrides.
// Descendant selector: data-theme on <html>, data-surface on a child element.
// Specificity 0,2,0 — wins over both [data-theme="dark"] and [data-surface="chat"].

const sdChatDark = new StyleDictionary({
  usesDtcg: true,
  parsers: ['figma-token-parser'],
  source: [
    'FigmaTokens/Primitives/Primitive.tokens.json',
    'FigmaTokens/Semantic/ChatDark.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
        'tracking/figma-em',
        'dimension/figma-rem',
        'fontWeight/figma-numeric',
        'font/figma-family',
        'name/figma-web',
      ],
      buildPath: 'css/',
      files: [{
        destination: 'tokens-chat-dark.css',
        format: 'css/variables-selector',
        filter: (token) =>
          !!token.$extensions?.['com.figma.codeSyntax']?.WEB &&
          !(token.$type === 'string' && !token.path?.includes('family') && !token.path?.includes('weight')),
        options: {
          selector: '[data-theme="dark"] [data-surface="chat"]',
          outputReferences: false,
        },
      }],
    },
  },
});

await sdChatDark.buildAllPlatforms();

// ─── CC Light token build ───────────────────────────────────────────────────
// Outputs [data-brand="cc"] { ... } overrides for the Conference & Co brand.
// CC uses Muted Teal as its primary brand colour (vs AI's blue) plus its own
// component-specific tokens (--cc-header-*, --cc-mainmenu-*).
// Activation: add data-brand="cc" to a top-level element (typically <html>).
//
// CC tokens differ from Light in ~41 of 102 semantic colour roles. We emit ALL
// CC tokens (not just the differences) so the cascade is unambiguous when both
// data-brand="cc" and data-theme="dark" are set — the compound CC-dark
// selector then wins on (0,2,0) specificity.

const sdCCLight = new StyleDictionary({
  usesDtcg: true,
  parsers: ['figma-token-parser'],
  source: [
    'FigmaTokens/Primitives/Primitive.tokens.json',
    'FigmaTokens/Semantic/CCLight.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
        'tracking/figma-em',
        'dimension/figma-rem',
        'fontWeight/figma-numeric',
        'font/figma-family',
        'name/figma-web',
      ],
      buildPath: 'css/',
      files: [{
        destination: 'tokens-cc.css',
        format: 'css/variables-selector',
        filter: (token) =>
          !!token.$extensions?.['com.figma.codeSyntax']?.WEB &&
          !(token.$type === 'string' && !token.path?.includes('family') && !token.path?.includes('weight')),
        options: {
          selector: '[data-brand="cc"]',
          outputReferences: false,
        },
      }],
    },
  },
});

await sdCCLight.buildAllPlatforms();

// ─── CC Dark token build ────────────────────────────────────────────────────
// Outputs [data-brand="cc"][data-theme="dark"] { ... } — compound selector with
// (0,2,0) specificity so it wins over both [data-brand="cc"] and
// [data-theme="dark"] regardless of cascade order. Compound (not descendant)
// because data-brand and data-theme are typically siblings on <html>.

const sdCCDark = new StyleDictionary({
  usesDtcg: true,
  parsers: ['figma-token-parser'],
  source: [
    'FigmaTokens/Primitives/Primitive.tokens.json',
    'FigmaTokens/Semantic/CCDark.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
        'tracking/figma-em',
        'dimension/figma-rem',
        'fontWeight/figma-numeric',
        'font/figma-family',
        'name/figma-web',
      ],
      buildPath: 'css/',
      files: [{
        destination: 'tokens-cc-dark.css',
        format: 'css/variables-selector',
        filter: (token) =>
          !!token.$extensions?.['com.figma.codeSyntax']?.WEB &&
          !(token.$type === 'string' && !token.path?.includes('family') && !token.path?.includes('weight')),
        options: {
          selector: '[data-brand="cc"][data-theme="dark"]',
          outputReferences: false,
        },
      }],
    },
  },
});

await sdCCDark.buildAllPlatforms();

// ─── Seating Planner token builds ─────────────────────────────────────────────
// Prototype-scoped role colours for the Seating Planner (attendee/VIP/speaker/table
// tiers). Three interchangeable palettes, one per Figma mode.
//
// Namespaced `--sp-*`, NOT `--ai-*`: these are prototype role colours, not core
// design-system semantics, and must not be reachable from component CSS by accident.
// The Figma variables carry no codeSyntax.WEB, so names come from the path via the
// name/seating-planner transform.
//
// Activation: add data-seating="muted" | "radix-soft" | "radix-vivid" to a container.
// No :root default is emitted — a palette must be chosen explicitly, so an unset
// container renders with no --sp-* values rather than silently inheriting one mode.

const seatingModes = [
  { mode: 'Muted',        slug: 'muted' },
  { mode: 'Radix Soft',   slug: 'radix-soft' },
  { mode: 'Radix Vivid',  slug: 'radix-vivid' },
];

for (const { mode, slug } of seatingModes) {
  const sdSeating = new StyleDictionary({
    usesDtcg: true,
    parsers: ['figma-token-parser'],
    source: [`FigmaTokens/Seating Planner/${mode}.tokens.json`],
    platforms: {
      css: {
        transforms: [
          'color/figma-hex',
          'name/seating-planner',
        ],
        buildPath: 'css/',
        files: [{
          destination: `tokens-seating-${slug}.css`,
          format: 'css/variables-selector',
          options: {
            selector: `[data-seating="${slug}"]`,
            outputReferences: false,
          },
        }],
      },
    },
  });

  await sdSeating.buildAllPlatforms();
}

// ─── Output collision guard ───────────────────────────────────────────────────
// Style Dictionary warns about token collisions but still emits every duplicate
// declaration, so the LAST one silently wins in the cascade. That is how a Figma
// codeSyntax copy-paste (five font sizes all named --ai-font-fixed-4xl) turned
// `h1` from 32px into 72px with nothing but a soft build warning.
//
// This guard re-reads what was actually written and fails the build on any custom
// property declared more than once with DIFFERENT values. Identical-value duplicates
// are reported as benign and do not fail (e.g. --ai-spacing-0 from both spacing.0
// and size.0, which are both 0).
//
// Files are written before this runs, so a failure never leaves you without CSS —
// it just refuses to let the ambiguity pass unnoticed. Escape hatch for a
// deliberate override: TOKENS_ALLOW_COLLISIONS=1 npm run tokens

import { readFileSync, existsSync } from 'node:fs';

const generatedFiles = [
  'css/tokens.css',
  'css/tokens-mobile.css',
  'css/tokens-dark.css',
  'css/tokens-minimised.css',
  'css/tokens-chat.css',
  'css/tokens-chat-dark.css',
  'css/tokens-cc.css',
  'css/tokens-cc-dark.css',
  ...seatingModes.map(({ slug }) => `css/tokens-seating-${slug}.css`),
];

const hardCollisions = [];
const benignCollisions = [];

for (const file of generatedFiles) {
  if (!existsSync(file)) continue;

  // Each generated file emits exactly one variable block, so grouping by file
  // (rather than by selector) is enough to catch every shadowed declaration.
  const declarations = new Map();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?);\s*$/);
    if (!match) continue;
    const [, prop, value] = match;
    if (!declarations.has(prop)) declarations.set(prop, []);
    declarations.get(prop).push(value.trim());
  }

  for (const [prop, values] of declarations) {
    if (values.length < 2) continue;
    const bucket = new Set(values).size > 1 ? hardCollisions : benignCollisions;
    bucket.push({ file, prop, values });
  }
}

if (benignCollisions.length) {
  console.log('\nℹ️  Duplicate declarations with identical values (harmless):');
  for (const { file, prop, values } of benignCollisions) {
    console.log(`   ${file}  ${prop}  ×${values.length} = ${values[0]}`);
  }
}

if (hardCollisions.length) {
  console.error('\n✗ Token name collisions — later declarations silently override earlier ones:\n');
  for (const { file, prop, values } of hardCollisions) {
    console.error(`   ${file}`);
    console.error(`     ${prop}`);
    values.forEach((v, i) => {
      const marker = i === values.length - 1 ? '← WINS' : '  shadowed';
      console.error(`       ${v.padEnd(12)} ${marker}`);
    });
    console.error('');
  }
  console.error('Fix the duplicated codeSyntax.WEB values in Figma, re-export, and rebuild.');
  console.error('To emit anyway: TOKENS_ALLOW_COLLISIONS=1 npm run tokens\n');

  if (process.env.TOKENS_ALLOW_COLLISIONS !== '1') process.exit(1);
  console.error('TOKENS_ALLOW_COLLISIONS=1 set — continuing despite collisions.\n');
}
