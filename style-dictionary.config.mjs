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
    if (v && typeof v === 'object' && v.hex) return v.hex.toLowerCase();
    if (typeof v === 'string') return v; // already a hex string
    return v;
  },
});

/**
 * Convert number tokens to rem units (16px = 1rem baseline).
 * Applies to: spacing, border radius, font sizes, line heights.
 * Does NOT apply to font weight tokens (those have $type: "string").
 * Border widths (1px, 2px) and box-shadow offsets are NOT tokens — keep them as px in component CSS.
 */
StyleDictionary.registerTransform({
  name: 'dimension/figma-rem',
  type: 'value',
  filter: (token) => token.$type === 'number' && typeof token.$value === 'number',
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
 */
StyleDictionary.registerTransform({
  name: 'name/figma-web',
  type: 'name',
  transform: (token) => {
    const web = token.$extensions?.['com.figma.codeSyntax']?.WEB;
    if (web) return web.replace(/^--/, '');
    // Fallback: derive from path (for tokens without codeSyntax — filtered out anyway)
    return ['ai', ...token.path]
      .join('-')
      .toLowerCase()
      .replace(/\s+/g, '-');
  },
});

// ─── Mobile media-query formatter ─────────────────────────────────────────────

StyleDictionary.registerFormat({
  name: 'css/variables-media-query',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `    --${t.name}: ${t.$value};`)
      .join('\n');
    return `@media (max-width: 767px) {\n  :root {\n${vars}\n  }\n}\n`;
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
  // Source order: Primitives first (for reference resolution), then semantic + typography
  source: [
    'FigmaTokens/Primitive.tokens[old].json',
    'FigmaTokens/Light.tokens.json',
    'FigmaTokens/Typography/Desktop.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',        // Normalize Figma color objects → hex strings
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
          filter: (token) => !!token.$extensions?.['com.figma.codeSyntax']?.WEB,
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
    'FigmaTokens/Primitive.tokens[old].json',
    'FigmaTokens/Light.tokens.json',
    'FigmaTokens/Typography/Mobile.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
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
          filter: (token) => !!token.$extensions?.['com.figma.codeSyntax']?.WEB,
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
    'FigmaTokens/Primitive.tokens.json',
    'FigmaTokens/Dark.tokens.json',
  ],
  platforms: {
    css: {
      transforms: [
        'color/figma-hex',
        'dimension/figma-rem',
        'fontWeight/figma-numeric',
        'font/figma-family',
        'name/figma-web',
      ],
      buildPath: 'css/',
      files: [{
        destination: 'tokens-dark.css',
        format: 'css/variables-selector',
        filter: (token) => !!token.$extensions?.['com.figma.codeSyntax']?.WEB,
        options: {
          selector: '[data-theme="dark"]',
          outputReferences: false,
        },
      }],
    },
  },
});

await sdDark.buildAllPlatforms();
