/**
 * ChatMain — View state management + ChatResponse integration.
 *
 * Views:
 *   --initial     Welcome screen with suggestions
 *   --processing  ChatResponse animation playing
 *   --response    Full AI answer with sticky input
 *
 * Requires GSAP + SplitText + ScrambleTextPlugin loaded globally (for processing view).
 */

import { createChatResponseTimeline } from '../../templates/ChatResponse/ChatResponse.js';

/**
 * Initializes ChatMain view-state management.
 *
 * @param {HTMLElement} el  The .chat-main element
 * @param {Object}      [opts]
 * @param {Function}    [opts.onViewChange]  Called with the new view name after every transition
 * @returns {{ setView(view: string): void, startProcessing(): void, destroy(): void }}
 */
export function initChatMain(el, opts = {}) {
  const initialEl = el.querySelector('.chat-main__initial');
  const scrollEl = el.querySelector('.chat-main__scroll');
  const introEl = el.querySelector('.chat-main__intro');
  const inputWrapEl = el.querySelector('.chat-main__input-wrap');
  const suggestionsEl = el.querySelector('.chat-main__suggestions');
  const processingContainer = el.querySelector('.chat-main__processing');
  const footerInputEl = el.querySelector('.chat-main__footer .msg-input__textarea');
  const bubbleTextEl = el.querySelector('.msg-bubble__text');

  let chatResponseCtrl = null;
  let responseDelayedCall = null;

  function setView(view) {
    el.classList.remove('chat-main--initial', 'chat-main--processing', 'chat-main--response');
    el.classList.add(`chat-main--${view}`);
    if (opts.onViewChange) opts.onViewChange(view);
  }

  /**
   * Reset processing elements to their initial state so the animation
   * can play cleanly from the start.
   */
  function resetProcessingState() {
    if (!processingContainer) return;

    const carouselEl = processingContainer.querySelector('.sources-carousel');
    const skeletonsWrap = processingContainer.querySelector('.chat-response__skeletons');
    const skeletonEls = processingContainer.querySelectorAll('.skeleton');
    const answerEl = processingContainer.querySelector('.chat-response__answer');
    const introTitleEl = processingContainer.querySelector('.working-intro__title');
    const introSubEl = processingContainer.querySelector('.working-intro__subtitle');

    // Reset carousel
    if (carouselEl) {
      carouselEl.style.display = 'none';
      gsap.set(carouselEl.querySelectorAll('.sources-card'), { clearProps: 'all' });
      gsap.set(carouselEl.querySelectorAll('.sources-carousel__nav'), { clearProps: 'all' });
    }

    // Reset skeletons
    skeletonEls.forEach(s => s.classList.remove('skeleton--active'));
    if (skeletonsWrap) {
      skeletonsWrap.style.display = '';
      gsap.set(skeletonsWrap, { clearProps: 'all' });
    }

    // Reset answer
    if (answerEl) {
      answerEl.style.display = 'none';
      answerEl.style.opacity = '0';
    }

    // Reset WorkingIntro text
    if (introTitleEl) introTitleEl.textContent = 'Working on it';
    if (introSubEl) introSubEl.innerHTML = '&nbsp;';
  }

  /**
   * Switch to the processing view and play the full ChatResponse animation.
   * When the animation completes, auto-transitions to the response view.
   */
  function startProcessing() {
    // Reset any inline styles from the initial→processing transition animation
    if (introEl) gsap.set(introEl, { clearProps: 'all' });
    if (suggestionsEl) gsap.set(suggestionsEl, { clearProps: 'all' });
    if (inputWrapEl) gsap.set(inputWrapEl, { clearProps: 'all' });

    // Kill any previous timeline / delayed call
    if (responseDelayedCall) {
      responseDelayedCall.kill();
      responseDelayedCall = null;
    }
    if (chatResponseCtrl) {
      chatResponseCtrl.reset();
      chatResponseCtrl = null;
    }

    // Reset processing elements before playing
    resetProcessingState();

    setView('processing');

    // Trigger ChatResponse timeline
    if (processingContainer && typeof gsap !== 'undefined') {
      chatResponseCtrl = createChatResponseTimeline(processingContainer);

      // Auto-transition to response view after the answer fade-in completes (~9s).
      // Cannot use master.onComplete because infinite-repeat tweens (logo pulse,
      // char shimmer) prevent the timeline from ever completing.
      responseDelayedCall = gsap.delayedCall(9.2, () => {
        setView('response');
      });
    }
  }

  function submitQuestion(questionText) {
    if (!questionText || !questionText.trim()) return;

    // Populate the message bubble with the user's question
    if (bubbleTextEl) {
      bubbleTextEl.textContent = questionText.trim();
    }

    // Set the footer MessageInput to active with the typed text
    if (footerInputEl) {
      footerInputEl.value = questionText.trim();
      const footerWrapper = footerInputEl.closest('.msg-input');
      if (footerWrapper) footerWrapper.classList.add('msg-input--active');
    }

    // Animate transition: fade out intro + suggestions, then switch to processing
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({
        onComplete: () => {
          startProcessing();
        },
      });

      // Fade out welcome text and suggestions
      tl.to([introEl, suggestionsEl].filter(Boolean), {
        opacity: 0,
        duration: 0.2,
        ease: 'power1.out',
      });

      // Slide the input wrapper down slightly
      if (inputWrapEl) {
        tl.to(inputWrapEl, {
          opacity: 0,
          y: 20,
          duration: 0.15,
          ease: 'power1.in',
        }, '<0.05');
      }
    } else {
      // No GSAP — instant switch
      startProcessing();
    }
  }

  // ── Event: form submission from initial view ──────────
  const initialTextarea = initialEl ? initialEl.querySelector('.msg-input__textarea') : null;
  const initialSendBtn = initialEl ? initialEl.querySelector('.msg-input__send-btn') : null;

  function handleInitialSubmit() {
    if (!initialTextarea) return;
    const text = initialTextarea.value;
    if (text.trim()) {
      submitQuestion(text);
    }
  }

  if (initialSendBtn) {
    initialSendBtn.addEventListener('click', handleInitialSubmit);
  }

  if (initialTextarea) {
    initialTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleInitialSubmit();
      }
    });
  }

  // ── Event: SuggestedQuestion click ────────────────────
  const suggestedBtns = el.querySelectorAll('.suggested-question');
  suggestedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const textEl = btn.querySelector('.suggested-question__text');
      const questionText = textEl ? textEl.textContent : btn.textContent;
      submitQuestion(questionText);
    });
  });

  function destroy() {
    if (responseDelayedCall) {
      responseDelayedCall.kill();
      responseDelayedCall = null;
    }
    if (chatResponseCtrl) {
      chatResponseCtrl.reset();
      chatResponseCtrl = null;
    }
    resetProcessingState();
  }

  return { setView, startProcessing, submitQuestion, destroy };
}
