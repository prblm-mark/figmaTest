import { defineConfig } from 'vitepress'
import sidebarData from './sidebar-data.json' with { type: 'json' }

export default defineConfig({
  title: 'Affino AI Design System',
  description: 'Component library built from Figma design tokens',
  base: process.env.DOCS_BASE || '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    logo: '/img/affinoLogo.svg',

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Setup', link: '/getting-started' },
        ],
      },
      {
        text: `Components (${sidebarData.components?.length || 0})`,
        collapsed: false,
        items: sidebarData.components || [],
      },
      {
        text: `Patterns (${sidebarData.patterns?.length || 0})`,
        collapsed: false,
        items: sidebarData.patterns || [],
      },
      {
        text: `Templates (${sidebarData.templates?.length || 0})`,
        collapsed: false,
        items: sidebarData.templates || [],
      },
      {
        text: 'Tokens',
        items: [
          { text: 'Token Reference', link: '/tokens/' },
        ],
      },
      {
        text: 'Guidelines',
        items: [
          { text: 'Icon System', link: '/guidelines/icons' },
          { text: 'Accessibility', link: '/guidelines/accessibility' },
          { text: 'Figma Workflow', link: '/guidelines/workflow' },
        ],
      },
    ],

    search: { provider: 'local' },

    outline: { level: [2, 3] },

    nav: [
      { text: 'Components', link: sidebarData.components?.[0]?.link || '/components/' },
      { text: 'Tokens', link: '/tokens/' },
      { text: 'Guidelines', link: '/guidelines/icons' },
    ],
  },

  vite: {
    // Allow serving files from the parent project root for demo iframes
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
})
