/* ============================================================
   FIRESTORE HELPERS
   Generic read/write helpers used by projects.js, certificates.js
   and contact-service.js. Every read helper resolves to an empty
   array (never throws) when Firebase isn't configured or the
   collection is empty, so callers can cleanly fall back to the
   local data/*.js files.
   ============================================================ */
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

/**
 * Fetch all documents in a collection with a fast timeout fallback.
 * @param {string} collectionName
 * @returns {Promise<Array<Object>>} resolves [] on any failure, timeout or if empty
 */
export async function fetchCollection(collectionName) {
  if (!db) return [];
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout fetching ${collectionName}`)), 2000)
    );
    const snap = await Promise.race([
      getDocs(collection(db, collectionName)),
      timeout
    ]);
    if (!snap || snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn(`Firestore fetch failed for "${collectionName}", using local fallback.`, err);
    return [];
  }
}

/**
 * Add a document to a collection. Used by the contact form to write
 * to "messages". Throws on failure so the caller can show its own
 * fallback/success messaging (mirrors original inline behaviour).
 * @param {string} collectionName
 * @param {Object} data
 */
export async function addDocument(collectionName, data) {
  if (!db) throw new Error("Firestore not configured");
  return addDoc(collection(db, collectionName), {
    ...data,
    timestamp: serverTimestamp()
  });
}
