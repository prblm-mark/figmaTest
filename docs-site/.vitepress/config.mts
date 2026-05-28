import { defineConfig } from 'vitepress'
import sidebarData from './sidebar-data.json' with { type: 'json' }

// Count totals for sidebar labels
const dsComponents = sidebarData.designSystem?.components?.length || 0
const dsPatterns = sidebarData.designSystem?.patterns?.length || 0
const dsTemplates = sidebarData.designSystem?.templates?.length || 0
const dsCount = dsComponents + dsPatterns + dsTemplates
const chatComponents = sidebarData.aiChat?.components?.length || 0
const chatPatterns = sidebarData.aiChat?.patterns?.length || 0
const chatTemplates = sidebarData.aiChat?.templates?.length || 0
const chatCount = chatComponents + chatPatterns + chatTemplates

const ccComponents = sidebarData.cc?.components?.length || 0
const ccPatterns = sidebarData.cc?.patterns?.length || 0
const ccTemplates = sidebarData.cc?.templates?.length || 0
const ccCount = ccComponents + ccPatterns + ccTemplates

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
          { text: 'Setup', link: '/getting-started' },
          { text: 'Team Setup', link: '/team-setup' },
          { text: 'Figma Workflow', link: '/guidelines/workflow' },
        ],
      },
      {
        text: 'Tokens',
        collapsed: false,
        items: [
          { text: 'Primitives', link: '/tokens/primitives' },
          { text: 'Theme Colours', link: '/tokens/theme-colours' },
          { text: 'Spacing & Sizing', link: '/tokens/spacing-sizing' },
          { text: 'Typography', link: '/tokens/typography' },
          { text: 'Elevation & Shadows', link: '/tokens/elevation-shadows' },
          { text: 'Breakpoints', link: '/tokens/breakpoints' },
          { text: 'Full Reference', link: '/tokens/' },
        ],
      },
      {
        text: `Design System (${dsCount})`,
        collapsed: false,
        items: [
          ...(dsComponents > 0 ? [{
            text: `Components (${dsComponents})`,
            collapsed: false,
            items: sidebarData.designSystem?.components || [],
          }] : []),
          ...(dsPatterns > 0 ? [{
            text: `Patterns (${dsPatterns})`,
            collapsed: false,
            items: sidebarData.designSystem?.patterns || [],
          }] : []),
          ...(dsTemplates > 0 ? [{
            text: `Templates (${dsTemplates})`,
            collapsed: false,
            items: sidebarData.designSystem?.templates || [],
          }] : []),
        ],
      },
      {
        text: `AI Chat (${chatCount})`,
        collapsed: false,
        items: [
          {
            text: `Components (${chatComponents})`,
            collapsed: false,
            items: sidebarData.aiChat?.components || [],
          },
          {
            text: `Patterns (${chatPatterns})`,
            collapsed: false,
            items: sidebarData.aiChat?.patterns || [],
          },
          {
            text: `Templates (${chatTemplates})`,
            collapsed: false,
            items: sidebarData.aiChat?.templates || [],
          },
        ],
      },
      {
        text: `Control Centre (${ccCount})`,
        collapsed: false,
        items: [
          ...(ccComponents > 0 ? [{
            text: `Components (${ccComponents})`,
            collapsed: false,
            items: sidebarData.cc?.components || [],
          }] : []),
          ...(ccPatterns > 0 ? [{
            text: `Patterns (${ccPatterns})`,
            collapsed: false,
            items: sidebarData.cc?.patterns || [],
          }] : []),
          ...(ccTemplates > 0 ? [{
            text: `Templates (${ccTemplates})`,
            collapsed: false,
            items: sidebarData.cc?.templates || [],
          }] : []),
        ],
      },
      {
        text: 'Guidelines',
        items: [
          { text: 'Icon System', link: '/guidelines/icons' },
          { text: 'Accessibility', link: '/guidelines/accessibility' },
        ],
      },
    ],

    search: { provider: 'local' },

    outline: { level: [2, 3] },

    nav: [
      { text: 'Design System', link: sidebarData.designSystem?.components?.[0]?.link || '/components/' },
      { text: 'AI Chat', link: sidebarData.aiChat?.components?.[0]?.link || '/components/' },
      { text: 'Control Centre', link: sidebarData.cc?.components?.[0]?.link || sidebarData.cc?.patterns?.[0]?.link || '/cc-components/' },
      { text: 'Tokens', link: '/tokens/primitives' },
      { text: 'Demos', link: 'https://prblm-mark.github.io/figmaTest/' },
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
