// Anchor link functionality - fixed to not interfere with internal links
(function() {
  function initAnchors() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    // console.log('Anchor links initialized for', headings.length, 'headings');
    headings.forEach(heading => {
      // Skip headings inside cards
      if (heading.closest('.use-case-card') || heading.closest('.provider-card')) {
        return;
      }
      // Create ID if not exists
      if (!heading.id) {
        heading.id = heading.textContent
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
      // Make clickable
      heading.style.cursor = 'pointer';
      heading.title = 'Click to copy link';
      heading.addEventListener('click', function(e) {
        // ONLY handle direct clicks on heading, not clicks on links TO heading
        if (e.target !== this && e.target.tagName === 'A') {
          // This is a click on a link, let it work normally
          return;
        }
        e.preventDefault();
        const url = window.location.href.split('#')[0] + '#' + this.id;
        // Add to URL
        history.pushState(null, null, '#' + this.id);
        // Smooth scroll to top of viewport
        this.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        console.log('Clicked heading:', this.textContent, 'URL:', url);
        // Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            console.log('Copied to clipboard:', url);
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
        }
      });
    });
    // Handle direct links with hash on page load or when clicking internal links
    function handleHashChange() {
      if (window.location.hash) {
        setTimeout(() => {
          const target = document.querySelector(window.location.hash);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      }
    }
    // On page load
    handleHashChange();
    // When hash changes (e.g., clicking internal links)
    window.addEventListener('hashchange', handleHashChange);
  }
  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnchors);
  } else {
    initAnchors();
  }
})();
