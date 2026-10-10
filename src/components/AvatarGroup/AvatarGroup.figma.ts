import figma, { html } from '@figma/code-connect/html'

// Avatar Group became a set 2026-10-10 (State = Static / Collapsed / Expanded); the old component
// 4057:2759 is now its Static variant, so every mapping points at the SET and restricts by State.

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4207-7328', {
  variant: { State: 'Static' },
  example: () => html`<div class="avatar-group" role="group" aria-label="6 people">
  <div class="avatar avatar--size-2"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <span class="avatar avatar--size-2 avatar--initials avatar-group__more" aria-label="2 more">+2</span>
</div>`,
})

// The toggle: a <button> counter; held-back members carry data-avatar-group-extra hidden.
// AvatarGroup.js flips aria-expanded, and CSS swaps "+N" for the chevron-left "show less".
figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4207-7328', {
  variant: { State: 'Collapsed' },
  example: () => html`<div class="avatar-group" role="list" aria-label="6 people">
  <div class="avatar avatar--size-2" role="listitem"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem" data-avatar-group-extra hidden><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem" data-avatar-group-extra hidden><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <button type="button" class="avatar avatar--size-2 avatar--initials avatar-group__more" aria-expanded="false" aria-label="Show 2 more: Name, Name" data-avatar-group-more data-names="Name, Name" data-label-more="Show 2 more: Name, Name" data-label-less="Show fewer"><span class="avatar-group__more-count">+2</span><i data-lucide="chevron-left" class="avatar-group__more-less" aria-hidden="true"></i></button>
</div>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4207-7328', {
  variant: { State: 'Expanded' },
  example: () => html`<div class="avatar-group" role="list" aria-label="6 people">
  <div class="avatar avatar--size-2" role="listitem"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem"><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem" data-avatar-group-extra><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <div class="avatar avatar--size-2" role="listitem" data-avatar-group-extra><img class="portrait" src="portrait.jpg" alt="Name"></div>
  <button type="button" class="avatar avatar--size-2 avatar--initials avatar-group__more" aria-expanded="true" aria-label="Show fewer" data-avatar-group-more data-names="Name, Name" data-label-more="Show 2 more: Name, Name" data-label-less="Show fewer"><span class="avatar-group__more-count">+2</span><i data-lucide="chevron-left" class="avatar-group__more-less" aria-hidden="true"></i></button>
</div>`,
})
