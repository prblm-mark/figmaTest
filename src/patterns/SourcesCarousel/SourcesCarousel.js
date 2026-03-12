/**
 * SourcesCarousel — GSAP entrance animation + scroll behavior.
 *
 * Requires GSAP loaded globally.
 */

/**
 * Creates the GSAP entrance timeline for carousel cards.
 * Cards start at translateY(40px), opacity: 0, then stagger in.
 *
 * @param {HTMLElement} el  .sources-carousel element
 * @returns {gsap.core.Timeline}
 */
export function createCarouselTimeline(el) {
  const cards = el.querySelectorAll('.sources-card');
  const navBtns = el.querySelectorAll('.sources-carousel__nav');

  const tl = gsap.timeline();

  // Set initial state
  gsap.set(cards, { y: 40, opacity: 0 });
  gsap.set(navBtns, { opacity: 0 });

  // Cards entrance
  tl.to(cards, {
    y: 0,
    opacity: 1,
    duration: 0.3,
    stagger: 0.05,
    ease: 'back.out(1.4)',
  });

  // Nav buttons fade in after cards (desktop only)
  tl.to(navBtns, {
    opacity: 1,
    duration: 0.3,
    ease: 'power1.out',
  }, '-=0.1');

  return tl;
}

/**
 * Initializes carousel scroll behavior — arrow click handlers + scroll state.
 *
 * @param {HTMLElement} el  .sources-carousel element
 */
export function initCarouselScroll(el) {
  const track = el.querySelector('.sources-carousel__track');
  const prevBtn = el.querySelector('.sources-carousel__nav--prev');
  const nextBtn = el.querySelector('.sources-carousel__nav--next');

  if (!track || !prevBtn || !nextBtn) return;

  function getScrollAmount() {
    const card = track.querySelector('.sources-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.offsetWidth + gap;
  }

  function updateButtons() {
    const scrollLeft = Math.round(track.scrollLeft);
    const maxScroll = track.scrollWidth - track.clientWidth;

    prevBtn.disabled = scrollLeft <= 0;
    nextBtn.disabled = scrollLeft >= maxScroll - 2;
  }

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateButtons, { passive: true });

  // Initial state
  updateButtons();
}
