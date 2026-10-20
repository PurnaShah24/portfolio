/* ============================================================
   CONTACT SERVICE
   Wraps the Firestore "messages" collection write used by the
   contact form. Mirrors the original inline submitForm() try/catch
   behaviour: resolves with {persisted:true} when Firestore accepted
   the write, and {persisted:false} when Firebase isn't configured
   (caller still shows a friendly success toast either way).
   ============================================================ */
import { addDocument } from "./firestore.js";

/**
 * @param {{name:string, email:string, company:string, message:string}} data
 * @returns {Promise<{persisted:boolean}>}
 */
export async function sendMessage(data) {
  try {
    await addDocument("messages", data);
    return { persisted: true };
  } catch (err) {
    console.warn("Message not persisted to Firestore (Firebase config needed).", err);
    return { persisted: false };
  }
}
