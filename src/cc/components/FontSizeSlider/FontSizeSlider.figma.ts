import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4146-6685',
  {
    example: () => html`
      <div class="font-size-slider">
        <input
          class="font-size-slider__input"
          type="range"
          min="1"
          max="4"
          step="1"
          value="2"
          aria-label="Font size"
          aria-valuetext="M"
        >
      </div>
    `,
  }
)
