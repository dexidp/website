// Heading anchors — the `<a class="heading-anchor">` element is injected
// at build time by the render-heading.html render hook. This script only
// handles two runtime behaviours:
//
//   1. Click on `.heading-anchor` → copy permalink to clipboard + scroll
//      to the section, with a brief "copied" feedback.
//   2. `hashchange` (or initial page load with a hash) → scroll to the
//      target, honouring `scroll-margin-top` via `scrollIntoView`.
//
// Scroll behaviour adapts to `prefers-reduced-motion` so users with motion
// sensitivity get an instant jump instead of a smooth animation.
(function () {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function scrollBehavior() {
    return reducedMotionQuery.matches ? 'auto' : 'smooth';
  }

  function copyPermalink(anchor) {
    const hash = anchor.getAttribute('href');
    if (!hash || hash[0] !== '#') return;
    const url = window.location.href.split('#')[0] + hash;
    history.pushState(null, '', hash);

    const target = document.getElementById(hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        anchor.classList.add('copied');
        setTimeout(function () { anchor.classList.remove('copied'); }, 1200);
      }).catch(function () { /* clipboard failed — silent */ });
    }
  }

  function scrollToHash() {
    if (!window.location.hash) return;
    let target;
    try {
      target = document.querySelector(window.location.hash);
    } catch (_) {
      return;
    }
    if (!target) return;
    requestAnimationFrame(function () {
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    });
  }

  function init() {
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('.heading-anchor');
      if (!anchor) return;
      e.preventDefault();
      copyPermalink(anchor);
    });
    scrollToHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('hashchange', scrollToHash);
})();
