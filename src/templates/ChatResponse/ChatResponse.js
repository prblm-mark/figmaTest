/**
 * ChatResponse — master timeline orchestrator.
 *
 * Composes WorkingIntro, SourcesCarousel, and Skeleton into an 8s animated sequence.
 *
 * Requires GSAP + SplitText + ScrambleTextPlugin loaded globally.
 */

import { createWorkingIntroTimeline, scrambleTitleFinal, destroyWorkingIntro } from '../../components/WorkingIntro/WorkingIntro.js';
import { createCarouselTimeline, initCarouselScroll } from '../../patterns/SourcesCarousel/SourcesCarousel.js';
import { initSkeleton } from '../../components/Skeleton/Skeleton.js';

/**
 * Creates and plays the full ChatResponse master timeline.
 *
 * @param {HTMLElement} el  .chat-response element
 * @returns {{ master: gsap.core.Timeline, reset(): void }}
 */
export function createChatResponseTimeline(el) {
  const introEl = el.querySelector('.working-intro');
  const carouselEl = el.querySelector('.sources-carousel');
  const skeletonEls = el.querySelectorAll('.skeleton');
  const answerEl = el.querySelector('.chat-response__answer');

  // Initialize skeletons
  const skeletonCtrls = Array.from(skeletonEls).map(s => initSkeleton(s));

  // Initialize carousel scroll behavior
  initCarouselScroll(carouselEl);

  // Component timelines
  const introTl = createWorkingIntroTimeline(introEl);
  const carouselTl = createCarouselTimeline(carouselEl);

  // Master timeline
  const master = gsap.timeline();

  // 0.0s — WorkingIntro starts (logo pulse + title reveal + subtitle scrambles)
  master.add(introTl, 0);

  // 2.0s — Carousel cards slide in
  master.add(carouselTl, 2.0);

  // 7.5s — Skeleton stops + fades out, title scrambles to final, logo pulse stops
  master.call(() => {
    // Stop skeletons
    skeletonCtrls.forEach(c => c.stop());

    // Fade out skeletons
    gsap.to(el.querySelector('.chat-response__skeletons'), {
      opacity: 0,
      duration: 0.5,
      ease: 'power1.out',
    });

    // Final title scramble
    scrambleTitleFinal(introTl, 'Please find your explanation below:');
  }, null, 7.5);

  // 8.0s — Answer content fades in
  master.call(() => {
    answerEl.style.display = 'block';
    gsap.to(answerEl, {
      opacity: 1,
      duration: 0.8,
      ease: 'sine.inOut',
      delay: 0.2,
    });
  }, null, 8.0);

  function reset() {
    master.kill();

    // Reset WorkingIntro (reverts SplitText, clears inline styles)
    destroyWorkingIntro(introTl);
    introEl.querySelector('.working-intro__title').textContent = 'Working on it';
    introEl.querySelector('.working-intro__subtitle').innerHTML = '&nbsp;';

    // Reset carousel
    gsap.set(carouselEl.querySelectorAll('.sources-card'), { clearProps: 'all' });
    gsap.set(carouselEl.querySelectorAll('.sources-carousel__nav'), { clearProps: 'all' });

    // Reset skeletons
    skeletonEls.forEach(s => {
      s.classList.remove('skeleton--active');
    });
    gsap.set(el.querySelector('.chat-response__skeletons'), { clearProps: 'all' });

    // Reset answer
    answerEl.style.display = 'none';
    answerEl.style.opacity = '0';
  }

  return { master, reset };
}
