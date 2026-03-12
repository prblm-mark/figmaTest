/**
 * Skeleton — activates/deactivates the shimmer animation.
 *
 * @param {HTMLElement} el  .skeleton element
 * @returns {{ stop(): void }}
 */
export function initSkeleton(el) {
  el.classList.add('skeleton--active');
  return {
    stop() {
      el.classList.remove('skeleton--active');
    },
  };
}
