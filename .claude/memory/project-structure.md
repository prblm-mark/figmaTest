# figmaTest — Detailed Project Structure

## Root Files
- `index.html` — HTML5 template, loads css/style.css and js/app.js
- `404.html` — 404 error page
- `robots.txt`, `site.webmanifest`, `favicon.ico`, `icon.png`, `icon.svg`
- `webpack.common.js` — shared webpack config; entry: ./js/app.js, output: dist/js/app.js
- `webpack.config.dev.js` — dev server, HMR, inline-source-map
- `webpack.config.prod.js` — production, HtmlWebpackPlugin, CopyPlugin
- `package.json` — name: " ", version: 0.0.1, private: true

## FigmaTokens/
- `Primitive.tokens.json` — color palette (Teal, Orange, Aqua, Pink, Blue, Neutral, Red) with 50–900 shades
- `Light.tokens.json` — semantic light theme: surface, text, border, border-radius, icon, component (buttons), spacing tokens
- `Typography/Desktop.tokens.json` — font family, weights, fixed+fluid sizes, line heights (Desktop mode)
- `Typography/Mobile.tokens.json` — same structure, mobile-adjusted values

## js/
- `app.js` — main entry point (currently empty/minimal)
- `vendor/.gitkeep` — vendor placeholder

## css/
- `style.css` — HTML5 Boilerplate v9.0.1 base styles + reset

## img/
- Image assets directory

## dist/
- Build output (generated, not committed)

## node_modules/
- Dev dependencies only
