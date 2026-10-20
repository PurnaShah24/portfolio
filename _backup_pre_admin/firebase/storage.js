/* ============================================================
   FIREBASE STORAGE HELPERS
   Used to resolve download URLs for certificate badges, project
   thumbnails and Art_Box_24 pieces when they've been uploaded to
   Firebase Storage. Every helper resolves to null on failure so
   callers can fall back to local assets / emoji badges.
   ============================================================ */
import { ref, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { storage } from "./firebase-config.js";

/**
 * Resolve a single file's download URL with a fast timeout.
 * @param {string} path e.g. "certificates/aws-cp.png"
 * @returns {Promise<string|null>}
 */
export async function getFileURL(path) {
  if (!storage) return null;
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Storage timeout")), 1500)
    );
    return await Promise.race([
      getDownloadURL(ref(storage, path)),
      timeout
    ]);
  } catch (err) {
    return null;
  }
}

/**
 * List every file's download URL inside a folder with a fast timeout.
 * @param {string} folder e.g. "art" | "projects" | "certificates"
 * @returns {Promise<Array<{name:string,url:string}>>}
 */
export async function listFolderURLs(folder) {
  if (!storage) return [];
  try {
    const folderRef = ref(storage, folder);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Storage timeout")), 1500)
    );
    const res = await Promise.race([
      listAll(folderRef),
      timeout
    ]);
    const items = await Promise.all(
      res.items.map(async itemRef => ({
        name: itemRef.name,
        url: await getDownloadURL(itemRef)
      }))
    );
    return items;
  } catch (err) {
    return [];
  }
}
