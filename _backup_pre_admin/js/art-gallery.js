/* ============================================================
   ART_BOX_24 GALLERY RENDERER
   Tries to list images from Firebase Storage's "art" folder; if
   none are configured/uploaded, falls back to the original emoji
   art-block placeholders so the section looks identical to the
   static page until real art is uploaded.
   ============================================================ */
import { listFolderURLs } from "../firebase/storage.js";

const FALLBACK_EMOJI = ['🎨', '✏️', '🖼️', '🎭', '🌸'];

function emojiBlockHTML(emoji) {
  return `<div class="art-block">${emoji}</div>`;
}

function imageBlockHTML(item) {
  return `<div class="art-block" style="padding:0;overflow:hidden;">
    <img src="${item.url}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">
  </div>`;
}

export async function initArtGallery() {
  const preview = document.querySelector('.art-preview');
  if (!preview) return;

  const images = await listFolderURLs('art');

  if (images.length > 0) {
    preview.innerHTML = images.map(imageBlockHTML).join('\n');
  } else {
    preview.innerHTML = FALLBACK_EMOJI.map(emojiBlockHTML).join('\n');
  }
}
