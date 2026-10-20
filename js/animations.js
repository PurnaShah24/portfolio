/* ============================================================
   ANIMATIONS
  Scroll progress bar, reveal-on-scroll (with skill-bar fill +
  stat counters), toast notifications, and the
   particle canvas background. Logic is unchanged from the
   original inline <script> — only reorganized into a module.
   ============================================================ */

/* ── scroll progress ── */
function initScrollProgress() {
  window.addEventListener('scroll', () => {
    const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const bar = document.getElementById('scroll-bar');
    const top = document.getElementById('scroll-top');
    if (bar) bar.style.width = (p * 100) + '%';
    if (top) top.classList.toggle('show', window.scrollY > 400);
  });
}

/* ── reveal on scroll (skill bars + counters) ── */
let revObs = null;

function revealElement(el) {
  if (!el || el.classList.contains('in')) return;
  el.classList.add('in');
  /* skill bars */
  el.querySelectorAll('.skill-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });
  /* counters */
  el.querySelectorAll('.stat-number[data-target]').forEach(counterEl => {
    const target = +counterEl.dataset.target;
    let cur = 0; const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      counterEl.textContent = cur;
      if (cur >= target) clearInterval(t);
    }, 40);
  });
}

export function initRevealObserver() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(revealElement);
    return null;
  }

  if (!revObs) {
    revObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        revealElement(e.target);
        revObs.unobserve(e.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 80px 0px' });
  }

  const unrevealed = document.querySelectorAll('.reveal:not(.in)');
  unrevealed.forEach(el => {
    // If the element is already visible in viewport (e.g. loaded via #anchor), reveal it immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealElement(el);
    } else {
      revObs.observe(el);
    }
  });

  return revObs;
}

/* ── toast ── */
export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 3500);
}

/* ── particles canvas ── */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.r = Math.random() * 1.8 + .4;
      this.vx = (Math.random() - .5) * .25; this.vy = (Math.random() - .5) * .25;
      this.alpha = Math.random() * .4 + .1;
      this.color = Math.random() > .5 ? '37,99,235' : '56,189,248';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`; ctx.fill();
    }
  }
  for (let i = 0; i < 90; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    /* draw connecting lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(37,99,235,${.08 * (1 - dist / 120)})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ── GitHub contribution graph ── */
function initContributionGraph() {
  const grid = document.getElementById('gh-contrib-grid');
  if (!grid) return;
  const levels = ['#1e293b', '#1e3a5f', '#1d4ed8', '#2563eb', '#38bdf8'];
  let html = '';
  for (let i = 0; i < 52 * 7; i++) {
    const lvl = Math.floor(Math.pow(Math.random(), 2) * 5);
    html += `<span class="gh-day" style="background:${levels[lvl]}" title="contributions"></span>`;
  }
  grid.innerHTML = html;
}

export function initAnimations() {
  initScrollProgress();
  initParticles();
  initContributionGraph();
  window.toast = toast;
}
