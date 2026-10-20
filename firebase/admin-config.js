/* ============================================================
   ADMIN CONFIGURATION
   Centralized authorization settings.
   Only users authenticated with an authorized email can access
   and modify content in the Admin Dashboard.
   ============================================================ */

export const AUTHORIZED_ADMIN_EMAILS = [
  "purnashah24@gmail.com"
];

/**
 * Checks if a given email is recognized as an authorized administrator.
 * @param {string|null} email
 * @returns {boolean}
 */
export function isAuthorizedAdmin(email) {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(email.toLowerCase().trim());
}
