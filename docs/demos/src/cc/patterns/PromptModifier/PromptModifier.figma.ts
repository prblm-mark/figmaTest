import figma, { html } from '@figma/code-connect/html'

// Built by record_markup.prompt_modifier(); PromptModifier.js owns Edit prompt / Generate / Copy / Undo.
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3938-22948', {
  example: () => html`<div class="prompt-modifier" data-prompt-modifier>
  <div class="prompt-modifier__head">
    <span class="prompt-modifier__icon"><i data-lucide="sparkles" aria-hidden="true"></i></span>
    <div class="prompt-modifier__text">
      <p class="prompt-modifier__title">Shareline prompt<span class="prompt-modifier__fills">Fills Shareline 1–3</span></p>
      <p class="prompt-modifier__preview" data-prompt-preview>Generate 3 promotional sharelines for the article below.</p>
    </div>
    <div class="prompt-modifier__actions">
      <button type="button" class="btn btn--tertiary btn--sm" aria-expanded="false" data-prompt-toggle><i data-lucide="chevron-down" aria-hidden="true"></i><span>Edit prompt</span></button>
      <button type="button" class="btn btn--secondary btn--sm" data-prompt-generate><i data-lucide="sparkles" aria-hidden="true"></i><span>Generate</span></button>
    </div>
  </div>
</div>`,
})
