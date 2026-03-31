/**
 * WorkingIntro — GSAP timeline factory.
 *
 * Creates the logo pulse, title SplitText reveal, and subtitle scramble
 * cycling through 3 stages.
 *
 * Requires GSAP + SplitText + ScrambleTextPlugin loaded globally.
 *
 * @param {HTMLElement} el  .working-intro element
 * @returns {gsap.core.Timeline}
 */

const SCRAMBLE_DEFAULTS = {
  chars: '.',
  revealDelay: 0,
  speed: 0.3,
};

const SUBTITLE_STAGES = [
  { text: 'Preparing quick answers',          offset: 0.1,    gap: null },
  { text: 'Searching 24,731 data sources',    offset: null,   gap: 0.2  },
  { text: 'Here are your quick answers',      offset: null,   gap: 1.0, weight: 'var(--ai-font-medium)' },
];

export function createWorkingIntroTimeline(el) {
  const logo     = el.querySelector('.working-intro__logo');
  const title    = el.querySelector('.working-intro__title');
  const subtitle = el.querySelector('.working-intro__subtitle');

  const tl = gsap.timeline({ defaults: { ease: 'none' } });

  // ── Title reveal (SplitText) ────────────────────────
  const titleSplit = new SplitText(title, { type: 'chars,lines' });

  tl.set(logo, { opacity: 0.4 });

  tl.from(titleSplit.lines, {
    y: 100,
    opacity: 0,
    duration: 0.6,
    ease: 'expo.out',
  }, 0);

  // Char shimmer: 0.5s duration + 0.625s stagger = 1.125s active, 1.275s rest = 2.4s cycle
  tl.from(titleSplit.chars, {
    opacity: 0.2,
    stagger: { amount: 0.625, from: 'left' },
    ease: 'power1.inOut',
    repeat: -1,
    repeatDelay: 1.275,
  }, 0.8);

  // Logo pulse: 1.2s × 2 (yoyo) = 2.4s cycle — matched to char shimmer
  const logoPulse = gsap.timeline({ repeat: -1, yoyo: true })
    .fromTo(logo,
      { opacity: 0.4 },
      { scale: 1.2, opacity: 1, duration: 1.2, ease: 'power1.inOut' }
    );

  tl.add(logoPulse, 0.8);

  // ── Subtitle scramble (3 stages) ────────────────────
  for (const stage of SUBTITLE_STAGES) {
    const position = stage.offset ?? `+=${stage.gap}`;

    tl.to(subtitle, {
      scrambleText: { ...SCRAMBLE_DEFAULTS, text: stage.text },
      duration: 0.8,
    }, position);

    if (stage.weight) {
      tl.set(subtitle, { fontWeight: stage.weight }, '<');
    }
  }

  // Expose refs for parent orchestrator + cleanup
  tl.data = { logoPulse, titleSplit, logo, title, subtitle };

  return tl;
}

/**
 * Scrambles the title to a final message (called by parent orchestrator).
 *
 * @param {gsap.core.Timeline} introTl  Timeline returned by createWorkingIntroTimeline
 * @param {string} finalText  Final title text
 * @returns {gsap.core.Tween}
 */
export function scrambleTitleFinal(introTl, finalText) {
  const { title, logo, logoPulse } = introTl.data;
  logoPulse.kill();

  // Reset logo to original size
  gsap.to(logo, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });

  return gsap.to(title, {
    scrambleText: { ...SCRAMBLE_DEFAULTS, text: finalText },
    duration: 0.8,
    ease: 'none',
  });
}

/**
 * Cleans up GSAP tweens and reverts SplitText DOM changes.
 * Call this before re-creating the timeline or when removing the component.
 *
 * @param {gsap.core.Timeline} introTl  Timeline returned by createWorkingIntroTimeline
 */
export function destroyWorkingIntro(introTl) {
  const { logoPulse, titleSplit, logo, subtitle } = introTl.data;

  logoPulse.kill();
  introTl.kill();
  titleSplit.revert();

  gsap.set([logo, subtitle], { clearProps: 'all' });
}
