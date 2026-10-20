/* ============================================================
   DEFAULT PORTFOLIO DATA (Canonical Reference & Fallback)
   Used for:
   1. Initial fallback if Firestore collections are empty/loading.
   2. One-click Firestore data initialization from the Admin Dashboard.
   ============================================================ */
import { profile as defaultProfile } from "./profile.js";
import { skills as defaultSkills } from "./skills.js";
import { projects as defaultProjects } from "./projects.js";
import { certificates as defaultCertificates } from "./certificates.js";

export { defaultProfile, defaultSkills, defaultProjects, defaultCertificates };

export const defaultExperience = [
  {
    id: "exp-codsoft",
    dateRange: "Jun 2025 – Jul 2025",
    role: "Python Programming Intern",
    org: "CodSoft",
    points: [
      "Developed 3 Python applications — To-Do List, Calculator, and Rock-Paper-Scissors — applying OOP, file handling, and the random module.",
      "Strengthened core programming fundamentals through hands-on implementation of functions and object-oriented design principles."
    ],
    links: [
      { label: "GitHub Repo", url: "https://github.com/PurnaShah24/CodSoft" }
    ],
    order: 1,
    published: true
  },
  {
    id: "exp-oyster-kode",
    dateRange: "2023 – Present",
    role: "Non-Technical Head",
    org: "Oyster Kode Club, Rajarambapu Institute of Technology",
    points: [
      "Coordinated 5+ college-wide events and technical competitions for 80+ attendees.",
      "Ran weekly activities to build communication and teamwork skills among junior club members.",
      "Developed leadership, event planning, and cross-team collaboration skills in a live environment."
    ],
    links: [
      { label: "GitHub profile", url: "https://github.com/PurnaShah24" },
      { label: "LinkedIn post", url: "https://www.linkedin.com/posts/oyster-kode-club_oysterkode-5thgen-leadershipteam-activity-7353029591550062592-KwnM" }
    ],
    order: 2,
    published: true
  }
];

export const defaultEducation = [
  {
    id: "edu-rit",
    yearRange: "Aug 2023 – May 2027",
    deg: "B.Tech — Computer Science & Engineering",
    inst: "Rajarambapu Institute of Technology, Maharashtra",
    icon: "🎓",
    order: 1,
    published: true
  },
  {
    id: "edu-vrd",
    yearRange: "Jun 2022 – Mar 2023",
    deg: "Higher Secondary Certificate (H.S.C.)",
    inst: "V.R.D. Junior College of Science",
    icon: "📚",
    order: 2,
    published: true
  },
  {
    id: "edu-gulavani",
    yearRange: "Jun 2020 – Mar 2021",
    deg: "Secondary School Certificate (S.S.C.)",
    inst: "K.K. Gulavani Higher Secondary School",
    icon: "🏫",
    order: 3,
    published: true
  }
];

export const defaultLanguages = [
  { id: "lang-en", name: "English", level: "Professional Working", dots: 4, order: 1, published: true },
  { id: "lang-hi", name: "Hindi", level: "Native / Bilingual", dots: 5, order: 2, published: true },
  { id: "lang-mr", name: "Marathi", level: "Native / Bilingual", dots: 5, order: 3, published: true },
  { id: "lang-gu", name: "Gujarati", level: "Professional Working", dots: 4, order: 4, published: true },
  { id: "lang-es", name: "Spanish", level: "Elementary", dots: 2, order: 5, published: true }
];

export const defaultArt = [
  {
    id: "art-1",
    title: "Artistic Expression",
    url: "assets/images/art_box_24/WhatsApp Image 2026-09-18 at 9.41.56 AM.jpeg",
    caption: "Creative artwork from @art_box_24",
    order: 1,
    published: true
  }
];
