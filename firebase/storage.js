/* ============================================================
   FIREBASE STORAGE HELPERS
   Used for certificate badges, project thumbnails, resume PDF
   and Art_Box_24 pieces. Includes uploads, deletions and URL
   resolution with timeouts and validations.
   ============================================================ */
import {
  ref,
  getDownloadURL,
  listAll,
  uploadBytes,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { storage } from "./firebase-config.js";

/**
 * Convert a File object to an optimized Data URL.
 * Works 100% free on the Firebase Spark (no-billing) plan.
 * @param {File} file
 * @param {number} [maxWidth=800]
 * @param {number} [quality=0.8]
 * @returns {Promise<string>}
 */
export function compressFileToDataUrl(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.type === "application/pdf") {
        if (file.size > 800 * 1024) {
          reject(new Error("PDF exceeds 800KB. For larger PDFs on the free plan, please paste a GitHub or Drive URL."));
          return;
        }
        resolve(e.target.result);
        return;
      }
      if (!file.type.startsWith("image/")) {
        resolve(e.target.result);
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/webp", quality));
        } catch (canvasErr) {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a file. If Firebase Storage is enabled (Blaze plan), uploads to cloud bucket.
 * If on the Free Spark plan without billing, automatically optimizes and returns an inline Data URL!
 * @param {File} file
 * @param {string} destinationPath
 * @returns {Promise<{ url: string, path: string|null }>}
 */
export async function uploadFile(file, destinationPath) {
  if (!file) throw new Error("No file provided.");

  // If storage is configured and reachable, attempt Cloud Storage upload
  if (storage && storage.app) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const finalPath = destinationPath.endsWith("/")
        ? `${destinationPath}${Date.now()}_${cleanName}`
        : destinationPath;

      const storageRef = ref(storage, finalPath);
      const metadata = { contentType: file.type || "application/octet-stream" };
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      return { url: downloadURL, path: finalPath };
    } catch (err) {
      console.warn("Cloud Storage bucket not active or requires billing. Using free inline storage:", err.message);
    }
  }

  // 100% Free Spark plan fallback: convert to optimized inline web URL
  const dataUrl = await compressFileToDataUrl(file);
  return {
    url: dataUrl,
    path: null
  };
}

/**
 * Delete a file from Firebase Storage.
 * @param {string} pathOrUrl
 */
export async function deleteStorageFile(pathOrUrl) {
  if (!storage || !pathOrUrl) return;
  try {
    let fileRef;
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      fileRef = ref(storage, pathOrUrl);
    } else {
      fileRef = ref(storage, pathOrUrl);
    }
    await deleteObject(fileRef);
  } catch (err) {
    console.warn("Storage deletion error (ignored):", err.message || err);
  }
}

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
