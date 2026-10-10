import figma, { html } from '@figma/code-connect/html'

// Quick links (record_markup.quick_links, code-first 2026-10-09; drawn 2026-10-10). Brand marks are
// images from img/quick-links/ — the approved exception to the Lucide-only rule. Each opens in a new tab.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4201-29708', {
  props: {
    brand: figma.enum('Brand', {
      X: html`<a class="quick-links__link" href="https://x.com/northbridge" target="_blank" rel="noopener noreferrer" aria-label="X: @northbridge (opens in a new tab)" title="X: @northbridge"><img src="../../../../img/quick-links/x.svg" alt="" width="24" height="24"></a>`,
      LinkedIn: html`<a class="quick-links__link" href="https://www.linkedin.com/company/northbridge" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn page (opens in a new tab)" title="LinkedIn page"><img src="../../../../img/quick-links/linkedin.svg" alt="" width="24" height="24"></a>`,
      Google: html`<a class="quick-links__link" href="https://www.google.com/search?q=Northbridge+Media" target="_blank" rel="noopener noreferrer" aria-label="Search Google for Northbridge Media (opens in a new tab)" title="Search Google for Northbridge Media"><img src="../../../../img/quick-links/google.svg" alt="" width="24" height="24"></a>`,
      ChatGPT: html`<a class="quick-links__link" href="https://chat.openai.com/?q=Northbridge+Media" target="_blank" rel="noopener noreferrer" aria-label="Ask ChatGPT about Northbridge Media (opens in a new tab)" title="Ask ChatGPT about Northbridge Media"><img src="../../../../img/quick-links/chatgpt.svg" alt="" width="24" height="24"></a>`,
      Perplexity: html`<a class="quick-links__link" href="https://www.perplexity.ai/search?q=Northbridge+Media" target="_blank" rel="noopener noreferrer" aria-label="Search Perplexity for Northbridge Media (opens in a new tab)" title="Search Perplexity for Northbridge Media"><img src="../../../../img/quick-links/perplexity.svg" alt="" width="24" height="24"></a>`,
      Maps: html`<a class="quick-links__link" href="https://maps.google.com/maps?q=Grosvenor+House%2C+London" target="_blank" rel="noopener noreferrer" aria-label="Show Grosvenor House, London on Google Maps (opens in a new tab)" title="Show Grosvenor House, London on Google Maps"><img src="../../../../img/quick-links/map.svg" alt="" width="24" height="24"></a>`,
    }),
  },
  example: ({ brand }) => html`<li>${brand}</li>`,
})

// The row: X and LinkedIn only when the record has them; Maps only for an address (accounts).
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4201-29709', {
  props: {
    x: figma.boolean('Show X', {
      true: html`<li><a class="quick-links__link" href="https://x.com/northbridge" target="_blank" rel="noopener noreferrer" aria-label="X: @northbridge (opens in a new tab)" title="X: @northbridge"><img src="../../../../img/quick-links/x.svg" alt="" width="24" height="24"></a></li>`,
      false: html``,
    }),
    linkedin: figma.boolean('Show LinkedIn', {
      true: html`<li><a class="quick-links__link" href="https://www.linkedin.com/company/northbridge" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn page (opens in a new tab)" title="LinkedIn page"><img src="../../../../img/quick-links/linkedin.svg" alt="" width="24" height="24"></a></li>`,
      false: html``,
    }),
    maps: figma.boolean('Show Maps', {
      true: html`<li><a class="quick-links__link" href="https://maps.google.com/maps?q=Grosvenor+House%2C+London" target="_blank" rel="noopener noreferrer" aria-label="Show Grosvenor House, London on Google Maps (opens in a new tab)" title="Show Grosvenor House, London on Google Maps"><img src="../../../../img/quick-links/map.svg" alt="" width="24" height="24"></a></li>`,
      false: html``,
    }),
  },
  example: ({ x, linkedin, maps }) => html`<ul class="quick-links" aria-label="Quick links">${x}${linkedin}
  <li><a class="quick-links__link" href="https://www.google.com/search?q=Northbridge+Media" target="_blank" rel="noopener noreferrer" aria-label="Search Google for Northbridge Media (opens in a new tab)" title="Search Google for Northbridge Media"><img src="../../../../img/quick-links/google.svg" alt="" width="24" height="24"></a></li>
  <li><a class="quick-links__link" href="https://chat.openai.com/?q=Northbridge+Media" target="_blank" rel="noopener noreferrer" aria-label="Ask ChatGPT about Northbridge Media (opens in a new tab)" title="Ask ChatGPT about Northbridge Media"><img src="../../../../img/quick-links/chatgpt.svg" alt="" width="24" height="24"></a></li>
  <li><a class="quick-links__link" href="https://www.perplexity.ai/search?q=Northbridge+Media" target="_blank" rel="noopener noreferrer" aria-label="Search Perplexity for Northbridge Media (opens in a new tab)" title="Search Perplexity for Northbridge Media"><img src="../../../../img/quick-links/perplexity.svg" alt="" width="24" height="24"></a></li>${maps}
</ul>`,
})
