/* ============================================================
   NAVIGATION
   Mobile hamburger menu toggle + scroll-spy active-link
   highlighting. Identical logic to the original inline scripts.
   ============================================================ */

export function toggleMenu() {
  const h = document.getElementById('hamburger');
  const m = document.getElementById('mobile-menu');
  if (h) h.classList.toggle('open');
  if (m) m.classList.toggle('open');
}

function initActiveSectionSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector('.nav-links a[href="#' + e.target.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

export function initNavigation() {
  window.toggleMenu = toggleMenu;
  initActiveSectionSpy();
}
