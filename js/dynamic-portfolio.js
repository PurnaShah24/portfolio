/* ============================================================
   DYNAMIC PORTFOLIO RENDERER
   Loads public portfolio content dynamically from Firestore
   collections with instant fallback to static data.
   Respects published/draft status and section visibility.
   ============================================================ */
import { fetchCollection, fetchDocument } from "../firebase/firestore.js";
import {
  defaultProfile,
  defaultSkills,
  defaultProjects,
  defaultCertificates,
  defaultExperience,
  defaultEducation,
  defaultLanguages,
  defaultArt
} from "../data/default-portfolio-data.js";
import { getFileURL, listFolderURLs } from "../firebase/storage.js";

/* ── Section Visibility Helper ── */
export function applySectionVisibility(visibility = {}) {
  const sectionMap = {
    showAbout: "about",
    showSkills: "skills",
    showProjects: "projects",
    showExperience: "experience",
    showEducation: "education",
    showCertificates: "certs",
    showLanguages: "languages",
    showArt: "creative",
    showGithub: "github",
    showContact: "contact"
  };

  Object.entries(sectionMap).forEach(([key, sectionId]) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (visibility[key] === false) {
      el.style.display = "none";
      // Also hide corresponding navbar and mobile links
      document.querySelectorAll(`a[href="#${sectionId}"]`).forEach(a => a.style.display = "none");
    } else {
      el.style.display = "";
      document.querySelectorAll(`a[href="#${sectionId}"]`).forEach(a => a.style.display = "");
    }
  });
}

/* ── 1. Profile & About ── */
export async function initDynamicProfile() {
  const remote = await fetchDocument("profile", "default");
  const p = remote ? { ...defaultProfile, ...remote } : defaultProfile;

  // Apply Section Visibility
  if (p.visibility) {
    applySectionVisibility(p.visibility);
  }

  // Hero Name & Tagline
  const heroNameGrad = document.querySelector(".hero-name .grad");
  if (heroNameGrad && p.name) heroNameGrad.textContent = p.name;

  const kicker = document.querySelector(".hero-kicker");
  if (kicker && p.tagline) {
    kicker.innerHTML = `<span class="kicker-dot"></span> ${p.tagline}`;
  }

  // Hero Roles rotator
  if (Array.isArray(p.roles) && p.roles.length > 0) {
    const rolesInner = document.querySelector(".hero-roles-inner");
    if (rolesInner) {
      rolesInner.innerHTML = p.roles.map(r => `<div>${r}</div>`).join("\n") +
        `\n<div>${p.roles[0]}</div>`;
    }
  }

  // Hero Description
  const heroDesc = document.querySelector(".hero-desc");
  if (heroDesc && p.heroDescriptionHTML) {
    heroDesc.innerHTML = p.heroDescriptionHTML;
  }

  // Hero Stats
  if (Array.isArray(p.heroStats) && p.heroStats.length > 0) {
    const heroStatsEl = document.querySelector(".hero-stats");
    if (heroStatsEl) {
      heroStatsEl.innerHTML = p.heroStats.map(s => `
        <div class="h-stat"><div class="h-stat-n">${s.n}</div><div class="h-stat-l">${s.l}</div></div>
      `).join("\n");
    }
  }

  // Profile Image
  if (p.profilePhotoURL) {
    const photo = document.querySelector(".photo-img");
    if (photo) photo.src = p.profilePhotoURL;
  }

  // Resume Link
  if (p.resumeURL) {
    const resumeBtn = document.getElementById("resume-link");
    if (resumeBtn) resumeBtn.href = p.resumeURL;
  }

  // About Section
  const about = p.about || defaultProfile.about;
  if (about) {
    const aboutTextEl = document.querySelector(".about-text");
    if (aboutTextEl) {
      const parasHTML = (about.paragraphsHTML || []).map(text => `<p>${text}</p>`).join("\n");
      const goalHTML = about.goalHTML ? `<div class="goal-box"><p>${about.goalHTML}</p></div>` : "";
      const chipsHTML = (about.chips || []).map(c => {
        const hiClass = c.hi ? "hi" : "";
        return `<span class="chip ${hiClass}">${c.label}</span>`;
      }).join("\n");

      aboutTextEl.innerHTML = `
        ${parasHTML}
        ${goalHTML}
        <div class="skills-chips">
          ${chipsHTML}
        </div>
      `;
    }

    // About Stats
    if (Array.isArray(about.stats)) {
      const statCards = document.querySelectorAll(".stat-grid .stat-card");
      about.stats.forEach((s, idx) => {
        if (statCards[idx]) {
          const num = statCards[idx].querySelector(".stat-number");
          const desc = statCards[idx].querySelector(".stat-desc");
          if (num) num.setAttribute("data-target", s.target);
          if (desc) desc.textContent = s.desc;
        }
      });
    }
  }

  // Contact Info
  const c = p.contact || defaultProfile.contact;
  if (c) {
    const emailLink = document.querySelector('.c-link[href^="mailto:"]');
    if (emailLink) {
      emailLink.href = `mailto:${c.email}`;
      emailLink.innerHTML = `<span class="c-link-icon">✉️</span> ${c.email}`;
    }
    const phoneLink = document.querySelector('.c-link[href^="tel:"]');
    if (phoneLink) {
      phoneLink.href = `tel:${c.phoneHref || c.phone}`;
      phoneLink.innerHTML = `<span class="c-link-icon">📞</span> ${c.phone}`;
    }
    const linkedinLinks = document.querySelectorAll(`a[href*="linkedin.com"]`);
    linkedinLinks.forEach(a => {
      if (a.classList.contains("c-link")) {
        a.href = c.linkedinUrl;
        a.innerHTML = `<span class="c-link-icon">💼</span> ${c.linkedin}`;
      }
    });
    const githubLinks = document.querySelectorAll(`a[href*="github.com"]`);
    githubLinks.forEach(a => {
      if (a.classList.contains("c-link")) {
        a.href = c.githubUrl;
        a.innerHTML = `<span class="c-link-icon">🐙</span> ${c.github}`;
      }
    });
    const instaLink = document.querySelector(`.c-link[href*="instagram.com"]`);
    if (instaLink) {
      instaLink.href = c.instagramUrl;
      instaLink.innerHTML = `<span class="c-link-icon">🎨</span> ${c.instagram} (Art)`;
    }
    const locationLink = document.querySelector('.c-link[href="#"]');
    if (locationLink) locationLink.innerHTML = `<span class="c-link-icon">📍</span> ${c.location}`;

    const contactBlurb = document.querySelector(".contact-card p");
    if (contactBlurb && c.blurb) contactBlurb.innerHTML = c.blurb;
  }

  // Footer Info
  const f = p.footer || defaultProfile.footer;
  if (f) {
    const footerLogo = document.querySelector(".footer-logo");
    if (footerLogo && f.logo) footerLogo.textContent = f.logo;
    const footerSub = document.querySelector(".footer-inner p");
    if (footerSub && f.subtitle) footerSub.textContent = f.subtitle;
    const footerCopy = document.querySelector(".footer-inner > p");
    if (footerCopy && f.copyright) footerCopy.textContent = f.copyright;
  }
}

/* ── 2. Skills ── */
export async function initDynamicSkills() {
  const remote = await fetchDocument("skills", "catalog");
  const s = remote ? { ...defaultSkills, ...remote } : defaultSkills;

  const layout = document.querySelector(".skills-layout");
  if (!layout) return;

  const progRows = (s.programmingLanguages || []).map(item => `
    <div class="skill-row">
      <div class="skill-name">${item.name}</div>
      <div class="skill-track"><div class="skill-fill" data-w="${item.pct}"></div></div>
      <div class="skill-pct">${item.pct}%</div>
    </div>
  `).join("\n");

  const mlRows = (s.dataScienceAndML || []).map(item => `
    <div class="skill-row">
      <div class="skill-name">${item.name}</div>
      <div class="skill-track"><div class="skill-fill" data-w="${item.pct}"></div></div>
      <div class="skill-pct">${item.pct}%</div>
    </div>
  `).join("\n");

  const toolPills = (s.toolsAndPlatforms || []).map(item => `
    <div class="tool-pill"><span class="tool-icon">${item.icon || "⚙️"}</span>${item.name}</div>
  `).join("\n");

  const softPills = (s.softSkills || []).map(item => {
    if (item.url) {
      return `<a class="soft-card" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.icon || "💡"} ${item.name}</a>`;
    }
    return `<div class="soft-card">${item.icon || "💡"} ${item.name}</div>`;
  }).join("\n");

  layout.innerHTML = `
    <div class="reveal">
      <div class="skill-cat-title">Programming Languages</div>
      ${progRows}
      <div class="skill-cat-title" style="margin-top:2rem;">Data Science & ML</div>
      ${mlRows}
    </div>
    <div class="reveal" data-delay="2">
      <div class="skill-cat-title">Tools & Platforms</div>
      <div class="tools-grid">
        ${toolPills}
      </div>
      <div class="skill-cat-title" style="margin-top:2rem;">Soft Skills</div>
      <div class="soft-grid">
        ${softPills}
      </div>
    </div>
  `;
}

/* ── 3. Projects ── */
function projectCardHTML(p, index) {
  const delayAttr = index > 0 ? ` data-delay="${Math.min(index, 3)}"` : "";
  const statusClass = p.status === "ongoing" ? "status-ongoing" : "status-done";
  const stackHTML = (p.stack || []).map(s => `<span class="p-chip">${s}</span>`).join("\n            ");
  const linksHTML = (p.links || []).map(l =>
    `<a class="proj-link" href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`
  ).join("\n            ");

  const thumbInner = p.imageURL
    ? `<img src="${p.imageURL}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
    : `
        <div class="proj-thumb-bg" style="background:${p.thumbBg || 'linear-gradient(135deg,#2563EB,#38BDF8)'};"></div>
        ${p.icon || "💻"}
      `;

  const featuredBadge = p.featured
    ? `<span style="display:inline-block;background:rgba(56,189,248,.15);color:var(--cyan);border:1px solid rgba(56,189,248,.3);font-size:.68rem;padding:.15rem .5rem;border-radius:99px;font-weight:600;margin-left:.5rem;">★ Featured</span>`
    : "";

  return `
      <div class="proj-card reveal"${delayAttr}>
        <div class="proj-thumb" style="background:linear-gradient(135deg,#0B1120,#102A43);">
          ${thumbInner}
        </div>
        <div class="proj-body">
          <div class="proj-meta">
            <span class="proj-type">${p.type || "Project"}</span>
            <span class="proj-status ${statusClass}">${p.statusLabel || (p.status === "ongoing" ? "● Ongoing" : "✓ Complete")}</span>
            ${featuredBadge}
          </div>
          <div class="proj-title">${p.title}</div>
          <div class="proj-desc">${p.description}</div>
          <div class="proj-result">${p.resultHTML || ""}</div>
          <div class="proj-stack">
            ${stackHTML}
          </div>
          <div class="proj-links">
            ${linksHTML}
          </div>
        </div>
      </div>`;
}

export async function initDynamicProjects() {
  const grid = document.getElementById("proj-grid");
  if (!grid) return;

  let data = await fetchCollection("projects");
  if (!data || data.length === 0) {
    data = defaultProjects;
  } else {
    // Filter out unpublished drafts, sort by order
    data = data.filter(p => p.published !== false);
    data.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
  }

  grid.innerHTML = data.map(projectCardHTML).join("\n");
}

/* ── 4. Experience & Leadership ── */
export async function initDynamicExperience() {
  const timeline = document.querySelector("#experience .timeline");
  if (!timeline) return;

  let data = await fetchCollection("experience");
  if (!data || data.length === 0) {
    data = defaultExperience;
  } else {
    data = data.filter(e => e.published !== false);
    data.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
  }

  timeline.innerHTML = data.map(exp => `
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-date">${exp.dateRange}</div>
      <div class="tl-role">${exp.role}</div>
      <div class="tl-org">${exp.org}</div>
      <ul class="tl-points">
        ${(exp.points || []).map(pt => `<li>${pt}</li>`).join("\n")}
      </ul>
      <div class="tl-links">
        ${(exp.links || []).map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`).join("\n")}
      </div>
    </div>
  `).join("\n");
}

/* ── 5. Education ── */
export async function initDynamicEducation() {
  const container = document.querySelector("#education .edu-cards");
  if (!container) return;

  let data = await fetchCollection("education");
  if (!data || data.length === 0) {
    data = defaultEducation;
  } else {
    data = data.filter(e => e.published !== false);
    data.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
  }

  container.innerHTML = data.map((edu, idx) => `
    <div class="edu-card reveal" data-delay="${Math.min(idx, 3)}">
      <div class="edu-icon">${edu.icon || "🎓"}</div>
      <div class="edu-year">${edu.yearRange}</div>
      <div class="edu-deg">${edu.deg}</div>
      <div class="edu-inst">${edu.inst}</div>
    </div>
  `).join("\n");
}

/* ── 6. Certificates ── */
function certCardHTML(c, index, badgeImgURL) {
  const delayAttr = index > 0 ? ` data-delay="${Math.min(index, 3)}"` : "";
  const finalBadgeURL = c.badgeImageURL || badgeImgURL;
  const badgeInner = finalBadgeURL
    ? `<img src="${finalBadgeURL}" alt="${c.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
    : (c.badge || "📜");
  const cardStart = c.url ? `<a class="cert-card reveal"${delayAttr} href="${c.url}" target="_blank" rel="noopener noreferrer">` : `<div class="cert-card reveal"${delayAttr}>`;
  const cardEnd = c.url ? "</a>" : "</div>";

  return `
      ${cardStart}
        <div class="cert-badge">${badgeInner}</div>
        <div>
          <div class="cert-name">${c.name}</div>
          <div class="cert-org">${c.org || ""}</div>
          ${c.issueDate ? `<div style="font-size:.75rem;color:var(--sub);margin-top:.2rem;">${c.issueDate}</div>` : ""}
        </div>
      ${cardEnd}`;
}

export async function initDynamicCertificates() {
  const grid = document.getElementById("cert-grid");
  if (!grid) return;

  let data = await fetchCollection("certificates");
  if (!data || data.length === 0) {
    data = defaultCertificates;
  } else {
    data = data.filter(c => c.published !== false);
    data.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
  }

  const cards = await Promise.all(
    data.map(async (c, i) => {
      const storagePath = c.id ? `certificates/${c.id}` : null;
      const badgeImgURL = storagePath ? await getFileURL(storagePath) : null;
      return certCardHTML(c, i, badgeImgURL);
    })
  );

  grid.innerHTML = cards.join("\n");
}

/* ── 7. Languages ── */
export async function initDynamicLanguages() {
  const grid = document.querySelector("#languages .lang-grid");
  if (!grid) return;

  let data = await fetchCollection("languages");
  if (!data || data.length === 0) {
    data = defaultLanguages;
  } else {
    data = data.filter(l => l.published !== false);
    data.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
  }

  grid.innerHTML = data.map((lang, idx) => {
    const dotsCount = Math.max(1, Math.min(5, Number(lang.dots) || 4));
    let dotsHTML = "";
    for (let i = 1; i <= 5; i++) {
      dotsHTML += `<div class="lang-dot ${i <= dotsCount ? 'on' : ''}"></div>`;
    }
    return `
      <div class="lang-card reveal" data-delay="${Math.min(idx, 3)}">
        <div class="lang-name">${lang.name}</div>
        <div class="lang-level">${lang.level}</div>
        <div class="lang-dots">
          ${dotsHTML}
        </div>
      </div>
    `;
  }).join("\n");
}

/* ── 8. Art Gallery ── */
export async function initDynamicArtGallery() {
  const preview = document.querySelector(".art-preview");
  if (!preview) return;

  let items = await fetchCollection("art");
  if (!items || items.length === 0) {
    // Try storage or default
    items = await listFolderURLs("art");
    if (!items || items.length === 0) {
      items = defaultArt;
    }
  } else {
    items = items.filter(a => a.published !== false);
    items.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
  }

  if (items.length > 0) {
    preview.innerHTML = items.map(item => `
      <div class="art-block" style="padding:0;overflow:hidden;" title="${item.title || item.name || 'Artwork'}">
        <img src="${item.url}" alt="${item.title || item.name || 'Art'}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">
      </div>
    `).join("\n");
  }
}
