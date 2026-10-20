/* ============================================================
   MAIN
   Entry point loaded as a module from index.html. Boots the
   page loader + particles first (visual, no data dependency),
   then wires up theme/navigation/animations, and renders all
   portfolio sections dynamically from Firebase Firestore
   (with immediate fallbacks to local data).
   ============================================================ */
import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initAnimations, initRevealObserver } from './animations.js';
import { initContactForm } from './contact.js';
import {
  initDynamicProfile,
  initDynamicSkills,
  initDynamicProjects,
  initDynamicCertificates,
  initDynamicExperience,
  initDynamicEducation,
  initDynamicLanguages,
  initDynamicArtGallery
} from './dynamic-portfolio.js';

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

async function init() {
  initLoader();
  initTheme();
  initNavigation();
  initAnimations();
  initContactForm();

  /* 1. Observe all initial static elements immediately so every section
     displays and animates smoothly right away with zero delay. */
  initRevealObserver();

  /* 2. Render all Firebase-backed sections concurrently.
     Each section falls back to local data if Firestore is offline or empty. */
  try {
    await Promise.allSettled([
      initDynamicProfile(),
      initDynamicSkills(),
      initDynamicProjects(),
      initDynamicCertificates(),
      initDynamicExperience(),
      initDynamicEducation(),
      initDynamicLanguages(),
      initDynamicArtGallery()
    ]);
  } catch (err) {
    console.warn("Dynamic section rendering notice:", err);
  }

  /* 3. Re-observe dynamically updated cards */
  initRevealObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
