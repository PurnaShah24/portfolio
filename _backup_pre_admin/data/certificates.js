/* ============================================================
   CERTIFICATES DATA (local fallback)
   js/certificates.js tries Firestore's "certificates" collection
   first; if it's empty or unreachable, it renders this array.
   ============================================================ */
export const certificates = [
  {
    badge: "🗄️",
    name: "Database Management System",
    org: "NPTEL — IIT Certification",
    url: "assets/certificates/Data Base Management System (1).pdf"
  },
  {
    badge: "🐍",
    name: "Python (Basics)",
    org: "GeeksforGeeks",
    url: "assets/certificates/gfg basic python certificate.pdf"
  }
];
