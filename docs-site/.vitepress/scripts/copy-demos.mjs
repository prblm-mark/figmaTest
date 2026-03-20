/**
 * copy-demos.mjs
 *
 * Copies component demo HTML files and their CSS/asset dependencies
 * into docs-site/public/demos/ so VitePress can serve them via iframe.
 *
 * Preserves the directory structure so relative paths in HTML files resolve.
 *
 * Run: node docs-site/.vitepress/scripts/copy-demos.mjs
 */

import { cpSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..', '..', '..')
const PUBLIC_DEMOS = resolve(ROOT, 'docs-site', 'public', 'demos')

// Ensure public/demos exists
mkdirSync(PUBLIC_DEMOS, { recursive: true })

// Copy src/ (components, patterns, templates, styles, utils)
const srcDest = resolve(PUBLIC_DEMOS, 'src')
if (existsSync(srcDest)) {
  cpSync(resolve(ROOT, 'src'), srcDest, { recursive: true, force: true })
} else {
  cpSync(resolve(ROOT, 'src'), srcDest, { recursive: true })
}

// Copy css/ (tokens, shadows, gradients, style.css)
const cssDest = resolve(PUBLIC_DEMOS, 'css')
cpSync(resolve(ROOT, 'css'), cssDest, { recursive: true, force: true })

// Copy img/ (logos etc.)
const imgSrc = resolve(ROOT, 'img')
if (existsSync(imgSrc)) {
  cpSync(imgSrc, resolve(PUBLIC_DEMOS, 'img'), { recursive: true, force: true })
}

console.log('Demos copied to docs-site/public/demos/')
