import figma, { html } from '@figma/code-connect/html'

/**
 * AudioPlayer — Article audio player
 * Figma: frame 3069:5884 "Article Audio Player" (Lus07xi8pPXLN87sQIyrEt)
 * Type = Default | Playing | Sticky  ·  Device (Desktop / Mobile) via CSS
 * @media (max-width: 767px).
 *
 * One unified waveform card:
 *   • Default → inline player (eyebrow label). Base, no modifier.
 *   • Playing → runtime `.is-playing` state (played bars turn brand). Not a
 *     structural variant, so it maps to the same markup.
 *   • Sticky  → `.audio-player--sticky` (article title + shadow); JS adds
 *     `.audio-player--dock` to fix it to the viewport bottom on scroll.
 */
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3069-5884',
  {
    props: {
      variant: figma.enum('Type', {
        Default: '',
        Playing: '',
        Sticky: ' audio-player--sticky',
      }),
    },
    example: ({ variant }) => html`
      <div class="audio-player${variant}" data-ap-player data-duration="225"
           role="group" aria-label="Article audio player">
        <div class="audio-player__label">
          <p class="audio-player__eyebrow">Listen to this article · 6 min</p>
          <p class="audio-player__title">The future of design systems in an AI-native workflow</p>
        </div>
        <button class="audio-player__play" data-ap-toggle type="button" aria-label="Play / pause" aria-pressed="false">
          <i class="audio-player__icon audio-player__icon--play" data-lucide="play" aria-hidden="true"></i>
          <i class="audio-player__icon audio-player__icon--pause" data-lucide="pause" aria-hidden="true"></i>
        </button>
        <div class="audio-player__waveform" data-ap-waveform data-ap-bars="56"
             role="slider" aria-label="Seek" tabindex="0"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
        <span class="audio-player__time-group">
          <span class="audio-player__time" data-ap-current>0:00</span>
          <span class="audio-player__time-sep">/</span>
          <button class="audio-player__duration" data-ap-duration type="button" aria-label="Toggle remaining time">3:45</button>
        </span>
        <button class="audio-player__download" data-ap-download type="button" aria-label="Download audio">
          <i data-lucide="download" aria-hidden="true"></i>
        </button>
      </div>
    `,
  }
)
