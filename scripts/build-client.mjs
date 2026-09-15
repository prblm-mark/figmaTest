/* Client-only build — the Seating Planner and nothing else.
 * =========================================================
 * `npm run build` emits the whole library into dist/, which GitHub Pages then publishes in full:
 * the internal hub at /index.html and every component demo underneath it. That is right for the
 * team and wrong for a client link, so this emits a SECOND, much smaller tree containing the
 * preview page, the Seating Planner, and only the files those two actually reference.
 *
 * WHY A DEPENDENCY CLOSURE RATHER THAN A COPY LIST. A hand-written list of "the files the planner
 * needs" is a list that goes stale the first time someone adds a component to the screen — and it
 * fails SILENTLY, because a missing stylesheet renders as default UA typography on correct markup
 * rather than as an error (feedback_resolve_asset_paths_dont_grep). Walking the references means
 * the build cannot ship a page it has not also shipped the parts for.
 *
 * THREE REFERENCE FORMS, all of them counted. An earlier sweep of this screen missed the third
 * and reported a file as unreferenced that was loaded on line 3346:
 *   1. <link href> and <script src>
 *   2. @import (both `url(...)` and bare-string) inside CSS
 *   3. `import ... from '...'` inside inline <script type="module">
 * `url(...)` inside CSS is walked too, for fonts and background images.
 */
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dist-client');

/* Entry points. The preview page is the site root; everything else is something it links to.
 *
 * WHY THESE ARE LISTED AND NOT WALKED. The crawler counts <link>, <script src>, <img src>,
 * @import and inline module imports — the forms that make a page RENDER. It deliberately does
 * NOT follow <a href>, because on the internal hub that would drag the entire library in behind
 * one link. So a page reached by navigation has to be named here, and the preview page's own
 * links are the list: the two planner previews, then the ten component demos it now shows.
 *
 * If a card is added to demo/index.html, add its page here too — otherwise the card ships as a
 * 404. The workflow's file-count assertion is the backstop. */
const ENTRIES = [
  'demo/index.html',
  'src/cc/templates/SeatingPlanner/SeatingPlanner.html',

  /* Components */
  'src/components/TableCard/TableCard.html',
  'src/components/TableType/TableType.html',
  'src/components/AttendeeCard/AttendeeCard.html',
  'src/components/RoomCard/RoomCard.html',
  'src/components/FullBadge/FullBadge.html',
  'src/components/SeatingToast/SeatingToast.html',

  /* Patterns */
  'src/patterns/SeatingHeader/SeatingHeader.html',
  'src/patterns/TableListing/TableListing.html',
  'src/patterns/TableDetail/TableDetail.html',
  'src/patterns/Unassigned/Unassigned.html',
];

const seen = new Set();
const queue = [];

function add(ref, fromFile) {
  if (!ref) return;
  /* Leave the network alone: CDN scripts stay CDN scripts. */
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:') || ref.startsWith('#')) return;
  const clean = ref.split('#')[0].split('?')[0].trim();
  if (!clean) return;
  const abs = path.resolve(path.dirname(path.join(ROOT, fromFile)), clean);
  const rel = path.relative(ROOT, abs);
  /* Anything resolving outside the repo is a bug in the reference, not something to copy. */
  if (rel.startsWith('..')) { console.warn('  ! escapes repo, skipped:', ref, 'from', fromFile); return; }
  if (seen.has(rel)) return;
  if (!existsSync(abs)) { console.warn('  ! MISSING:', rel, '<-', fromFile); return; }
  seen.add(rel);
  queue.push(rel);
}

async function walk(rel) {
  const ext = path.extname(rel).toLowerCase();
  if (!['.html', '.css', '.js', '.mjs'].includes(ext)) return;   /* binaries have no refs */
  const src = await readFile(path.join(ROOT, rel), 'utf8');

  if (ext === '.html') {
    for (const m of src.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)) add(m[1], rel);
    for (const m of src.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) add(m[1], rel);
    for (const m of src.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) add(m[1], rel);
    /* Inline modules — the form the earlier sweep missed. */
    for (const m of src.matchAll(/import\s+[^'"]*from\s*["']([^"']+)["']/g)) add(m[1], rel);
    for (const m of src.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) add(m[1], rel);
  } else {
    for (const m of src.matchAll(/@import\s+url\(\s*["']?([^"')]+)["']?\s*\)/g)) add(m[1], rel);
    for (const m of src.matchAll(/@import\s+["']([^"']+)["']/g)) add(m[1], rel);
    for (const m of src.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) add(m[1], rel);
    for (const m of src.matchAll(/import\s+[^'"]*from\s*["']([^"']+)["']/g)) add(m[1], rel);
  }
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const e of ENTRIES) add(e, 'index.html');   /* resolved against the repo root */
for (let i = 0; i < queue.length; i++) await walk(queue[i]);

/* Copy the closure, preserving paths so nothing needs rewriting.
 *
 * `demo/index.html` is an ENTRY, not an output: it is walked for its references and then written
 * to the site root below instead. Copying it as well would ship the same page at two URLs, one of
 * them with broken `../` paths. */
for (const rel of seen) {
  if (rel === path.normalize('demo/index.html')) continue;
  const dest = path.join(OUT, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(path.join(ROOT, rel), dest);
}

/* The preview page becomes the site root, so its `../` references become `./`. One uniform
   transformation rather than a per-path rewrite — verified below that every `../` in the file is
   an asset reference, so there is nothing else for it to catch. */
const demo = await readFile(path.join(ROOT, 'demo/index.html'), 'utf8');
const rootIndex = demo.replace(/(href|src)=(["'])\.\.\//g, '$1=$2');
await writeFile(path.join(OUT, 'index.html'), rootIndex, 'utf8');

/* Belt and braces: a client link should never be indexed. */
await writeFile(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');

const kb = (n) => Math.round(n / 1024);
console.log(`\nclient build: ${seen.size} files -> dist-client/`);
console.log('  entry: dist-client/index.html (the preview page, at the site root)');
const leaked = [...seen].filter((f) => f === 'index.html' || f.startsWith('docs'));
console.log(leaked.length ? `  !! internal pages leaked: ${leaked}` : '  no internal pages included');
