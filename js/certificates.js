/* ============================================================
   CERTIFICATES RENDERER
   Tries Firestore's "certificates" collection first; falls back
   to data/certificates.js. Optionally resolves a badge image from
   Firebase Storage ("certificates/<id>") — if that fails it keeps
   the emoji badge, exactly like the original static markup.
   ============================================================ */
import { fetchCollection } from "../firebase/firestore.js";
import { getFileURL } from "../firebase/storage.js";
import { certificates as localCertificates } from "../data/certificates.js";

function certCardHTML(c, index, badgeImgURL) {
  const delayAttr = index > 0 ? ` data-delay="${Math.min(index, 3)}"` : '';
  const badgeInner = badgeImgURL
    ? `<img src="${badgeImgURL}" alt="${c.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
    : c.badge;
  const cardStart = c.url ? `<a class="cert-card reveal"${delayAttr} href="${c.url}" target="_blank" rel="noopener noreferrer">` : `<div class="cert-card reveal"${delayAttr}>`;
  const cardEnd = c.url ? '</a>' : '</div>';

  return `
      ${cardStart}
        <div class="cert-badge">${badgeInner}</div>
        <div>
          <div class="cert-name">${c.name}</div>
          <div class="cert-org">${c.org}</div>
        </div>
      ${cardEnd}`;
}

export async function initCertificates() {
  const grid = document.getElementById('cert-grid');
  if (!grid) return;

  let data = await fetchCollection('certificates');
  if (!data || data.length === 0) data = localCertificates;

  const cards = await Promise.all(
    data.map(async (c, i) => {
      const storagePath = c.id ? `certificates/${c.id}` : null;
      const badgeImgURL = storagePath ? await getFileURL(storagePath) : null;
      return certCardHTML(c, i, badgeImgURL);
    })
  );

  grid.innerHTML = cards.join('\n');
}
