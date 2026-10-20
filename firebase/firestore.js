/* ============================================================
   FIRESTORE HELPERS
   Generic read/write helpers used by public portfolio renderers
   and the Admin Dashboard.
   ============================================================ */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

/**
 * Fetch all documents in a collection with optional sorting, filtering and timeout.
 * @param {string} collectionName
 * @param {Object} [options]
 * @returns {Promise<Array<Object>>}
 */
export async function fetchCollection(collectionName, options = {}) {
  if (!db) return [];
  try {
    const colRef = collection(db, collectionName);
    let q = colRef;

    // Apply sorting or filtering if requested
    const constraints = [];
    if (options.whereField && options.whereOp && options.whereVal !== undefined) {
      constraints.push(where(options.whereField, options.whereOp, options.whereVal));
    }
    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || "asc"));
    }
    if (constraints.length > 0) {
      q = query(colRef, ...constraints);
    }

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout fetching ${collectionName}`)), options.timeoutMs || 2500)
    );
    const snap = await Promise.race([getDocs(q), timeout]);
    if (!snap || snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn(`Firestore fetch failed for "${collectionName}":`, err.message || err);
    return [];
  }
}

/**
 * Fetch a single document by ID.
 * @param {string} collectionName
 * @param {string} docId
 * @returns {Promise<Object|null>}
 */
export async function fetchDocument(collectionName, docId) {
  if (!db) return null;
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.warn(`Firestore fetch document failed for "${collectionName}/${docId}":`, err.message || err);
    return null;
  }
}

/**
 * Add a new document with an auto-generated ID.
 * @param {string} collectionName
 * @param {Object} data
 * @returns {Promise<DocumentReference>}
 */
export async function addDocument(collectionName, data) {
  if (!db) throw new Error("Firestore not configured");
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Set a document with a specific ID (or overwrite/merge).
 * @param {string} collectionName
 * @param {string} docId
 * @param {Object} data
 * @param {boolean} [merge=true]
 */
export async function setDocument(collectionName, docId, data, merge = true) {
  if (!db) throw new Error("Firestore not configured");
  const docRef = doc(db, collectionName, docId);
  return setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge });
}

/**
 * Update specific fields of an existing document.
 * @param {string} collectionName
 * @param {string} docId
 * @param {Object} data
 */
export async function updateDocument(collectionName, docId, data) {
  if (!db) throw new Error("Firestore not configured");
  const docRef = doc(db, collectionName, docId);
  return updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/**
 * Delete a document by ID.
 * @param {string} collectionName
 * @param {string} docId
 */
export async function deleteDocument(collectionName, docId) {
  if (!db) throw new Error("Firestore not configured");
  const docRef = doc(db, collectionName, docId);
  return deleteDoc(docRef);
}
