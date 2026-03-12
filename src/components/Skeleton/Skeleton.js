/**
 * Skeleton — GSAP-driven shimmer + container breathe animation.
 *
 * Requires GSAP loaded globally.
 *
 * @param {HTMLElement} el  .skeleton element
 * @returns {{ stop(): void }}
 */
export function initSkeleton(el) {
  el.classList.add('skeleton--active');

  const lines = el.querySelectorAll('.skeleton__line');

  // Horizontal shimmer sweep — linear ease + wide bg for seamless loop
  const shimmer = gsap.fromTo(lines,
    { backgroundPosition: '150% 0' },
    {
      backgroundPosition: '-150% 0',
      duration: 1.8,
      ease: 'none',
      repeat: -1,
      repeatDelay: 0.4,
      stagger: { each: 0.1 },
    }
  );

  // Container breathe — slow opacity pulse
  const breathe = gsap.fromTo(el,
    { opacity: 0.5 },
    {
      opacity: 1,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    }
  );

  return {
    stop() {
      shimmer.kill();
      breathe.kill();
      el.classList.remove('skeleton--active');
      gsap.set(lines, { clearProps: 'backgroundPosition' });
      gsap.set(el, { clearProps: 'opacity' });
    },
  };
}
