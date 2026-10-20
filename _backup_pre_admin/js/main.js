/* ============================================================
   MAIN
   Entry point loaded as a module from index.html. Boots the
   page loader + particles first (visual, no data dependency),
   then wires up theme/navigation/animations, populates the
   contact links + footer from data/profile.js, and finally
   renders the Firebase-backed sections (projects, certificates,
  art gallery).
   ============================================================ */
import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initAnimations, initRevealObserver } from './animations.js';
import { initProjects } from './projects.js';
import { initCertificates } from './certificates.js';
import { initArtGallery } from './art-gallery.js';
import { initContactForm } from './contact.js';
import { profile } from '../data/profile.js';

/* ── loader ── */
function initLoader() {
  const bar = document.getElementById('lbar');
  const pct = document.getElementById('lpct');
  const loader = document.getElementById('loader');
  if (!bar || !pct || !loader) return;
  let progress = 0;
  const iv = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(iv);
      setTimeout(() => loader.classList.add('hide'), 300);
    }
    bar.style.width = progress + '%';
    pct.textContent = Math.round(progress) + '%';
  }, 80);
}

/* ── populate contact links + footer from data/profile.js ──
   (text/href only — no structural or animation-related markup
   is touched, so this is purely a content source-of-truth swap) */
function populateProfileContent() {
  const c = profile.contact;

  const emailLink = document.querySelector('.c-link[href^="mailto:"]');
  if (emailLink) {
    emailLink.href = `mailto:${c.email}`;
    emailLink.innerHTML = `<span class="c-link-icon">✉️</span> ${c.email}`;
  }
  const phoneLink = document.querySelector('.c-link[href^="tel:"]');
  if (phoneLink) {
    phoneLink.href = `tel:${c.phoneHref}`;
    phoneLink.innerHTML = `<span class="c-link-icon">📞</span> ${c.phone}`;
  }
  const linkedinLinks = document.querySelectorAll(`a[href="${c.linkedinUrl}"]`);
  linkedinLinks.forEach(a => { if (a.classList.contains('c-link')) a.innerHTML = `<span class="c-link-icon">💼</span> ${c.linkedin}`; });

  const githubLinks = document.querySelectorAll(`a[href="${c.githubUrl}"]`);
  githubLinks.forEach(a => { if (a.classList.contains('c-link')) a.innerHTML = `<span class="c-link-icon">🐙</span> ${c.github}`; });

  const instaLink = document.querySelector(`.c-link[href="${c.instagramUrl}"]`);
  if (instaLink) instaLink.innerHTML = `<span class="c-link-icon">🎨</span> ${c.instagram} (Art)`;

  const locationLink = document.querySelector('.c-link[href="#"]');
  if (locationLink) locationLink.innerHTML = `<span class="c-link-icon">📍</span> ${c.location}`;

  const contactBlurb = document.querySelector('.contact-card p');
  if (contactBlurb) contactBlurb.innerHTML = c.blurb;

  const footerLogo = document.querySelector('.footer-logo');
  if (footerLogo) footerLogo.textContent = profile.footer.logo;
  const footerSubtitle = document.querySelector('.footer-inner p');
  if (footerSubtitle) footerSubtitle.textContent = profile.footer.subtitle;
  const footerCopy = document.querySelector('.footer-inner > p');
  if (footerCopy) footerCopy.textContent = profile.footer.copyright;
}

async function init() {
  initLoader();
  initTheme();
  initNavigation();
  initAnimations();
  initContactForm();
  populateProfileContent();

  /* 1. Observe all static .reveal elements immediately so every section
     (About, Skills, Experience, Education, Contact, GitHub) reveals right away
     as the user scrolls, with zero delay and no dependency on network requests. */
  initRevealObserver();

  /* 2. Render Firebase-backed sections (projects, certificates, art gallery).
     Wrapped in try/catch with fallback data so dynamic fetching never blocks the page. */
  try {
    await Promise.all([initProjects(), initCertificates(), initArtGallery()]);
  } catch (err) {
    console.warn("Dynamic section rendering notice:", err);
  }

  /* 3. Re-observe any dynamically rendered cards */
  initRevealObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
