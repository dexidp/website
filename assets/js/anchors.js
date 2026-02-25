// Anchor link functionality
document.addEventListener('DOMContentLoaded', function() {
  const headings = document.querySelectorAll('h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    if (!heading.id) {
      heading.id = heading.textContent
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
    heading.style.cursor = 'pointer';
    heading.title = 'Click to copy link';
    heading.addEventListener('click', function(e) {
      const url = window.location.href.split('#')[0] + '#' + this.id;
      navigator.clipboard.writeText(url).then(() => {
        this.style.color = '#449FD8';
        setTimeout(() => {
          this.style.color = '';
        }, 1000);
      });
    });
  });
});
