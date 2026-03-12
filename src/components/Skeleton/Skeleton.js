/**
 * Skeleton — GSAP-driven shimmer animation.
 *
 * Requires GSAP loaded globally.
 *
 * @param {HTMLElement} el  .skeleton element
 * @returns {{ stop(): void }}
 */
export function initSkeleton(el) {
  el.classList.add('skeleton--active');

  const lines = el.querySelectorAll('.skeleton__line');

  const tween = gsap.fromTo(lines,
    { backgroundPosition: '200% 0' },
    {
      backgroundPosition: '-200% 0',
      duration: 1.4,
      ease: 'sine.inOut',
      repeat: -1,
      stagger: { each: 0.1 },
    }
  );

  return {
    stop() {
      tween.kill();
      el.classList.remove('skeleton--active');
      gsap.set(lines, { clearProps: 'backgroundPosition' });
    },
  };
}
