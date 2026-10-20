/* ============================================================
   PROJECTS RENDERER
   Tries Firestore's "projects" collection first; falls back to
   the local data/projects.js array when Firestore is empty or
   unreachable. Renders the exact same .proj-card markup/classes
   as the original static HTML, including the reveal animation
   and staggered data-delay attributes.
   ============================================================ */
import { fetchCollection } from "../firebase/firestore.js";
import { projects as localProjects } from "../data/projects.js";

function projectCardHTML(p, index) {
  const delayAttr = index > 0 ? ` data-delay="${Math.min(index, 3)}"` : '';
  const statusClass = p.status === 'ongoing' ? 'status-ongoing' : 'status-done';
  const stackHTML = (p.stack || []).map(s => `<span class="p-chip">${s}</span>`).join('\n            ');
  const linksHTML = (p.links || []).map(l =>
    `<a class="proj-link" href="${l.url}" target="_blank">${l.label}</a>`
  ).join('\n            ');

  return `
      <div class="proj-card reveal"${delayAttr}>
        <div class="proj-thumb" style="background:linear-gradient(135deg,#0B1120,#102A43);">
          <div class="proj-thumb-bg" style="background:${p.thumbBg};"></div>
          ${p.icon}
        </div>
        <div class="proj-body">
          <div class="proj-meta">
            <span class="proj-type">${p.type}</span>
            <span class="proj-status ${statusClass}">${p.statusLabel}</span>
          </div>
          <div class="proj-title">${p.title}</div>
          <div class="proj-desc">${p.description}</div>
          <div class="proj-result">${p.resultHTML}</div>
          <div class="proj-stack">
            ${stackHTML}
          </div>
          <div class="proj-links">
            ${linksHTML}
          </div>
        </div>
      </div>`;
}

export async function initProjects() {
  const grid = document.getElementById('proj-grid');
  if (!grid) return;

  let data = await fetchCollection('projects');
  if (!data || data.length === 0) data = localProjects;

  grid.innerHTML = data.map(projectCardHTML).join('\n');
}
