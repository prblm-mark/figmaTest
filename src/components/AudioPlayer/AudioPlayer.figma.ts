import figma, { html } from '@figma/code-connect/html'

/**
 * AudioPlayer — Article audio player
 * Figma: frame 3055:5458 "Article Audio Player" (Lus07xi8pPXLN87sQIyrEt)
 * Type = Compact Inline Bar | Card with waveform | Sticky Mini Player
 * Device (Desktop / Mobile) is handled in CSS via @media (max-width: 767px).
 *
 * The three Types differ structurally; the example below shows the Compact
 * Inline Bar (the simplest). The `type` enum maps the Figma variant to the
 * corresponding `.audio-player--*` modifier.
 */
figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3055-5458',
  {
    props: {
      type: figma.enum('Type', {
        'Compact Inline Bar': 'compact',
        'Card with waveform': 'card',
        'Sticky Mini Player': 'mini',
      }),
    },
    example: ({ type }) => html`
      <div class="audio-player audio-player--${type}" data-ap-player data-duration="225"
           role="group" aria-label="Article audio player">
        <button class="audio-player__play" data-ap-toggle type="button" aria-label="Play / pause" aria-pressed="false">
          <i class="audio-player__icon audio-player__icon--play" data-lucide="play" aria-hidden="true"></i>
          <i class="audio-player__icon audio-player__icon--pause" data-lucide="pause" aria-hidden="true"></i>
        </button>
        <span class="audio-player__time" data-ap-current>0:00</span>
        <div class="audio-player__scrubber" data-ap-scrubber role="slider" aria-label="Seek" tabindex="0">
          <div class="audio-player__scrubber-fill" data-ap-fill></div>
        </div>
        <button class="audio-player__duration" data-ap-duration type="button" aria-label="Toggle remaining time">3:45</button>
        <button class="audio-player__download" data-ap-download type="button" aria-label="Download audio">
          <i data-lucide="download" aria-hidden="true"></i>
        </button>
      </div>
    `,
  }
)
