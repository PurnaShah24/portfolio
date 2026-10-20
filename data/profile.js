/* ============================================================
   PROFILE DATA
   Personal info, hero, about and contact/footer content.
   Used by js/main.js to populate contact links + footer text
   without touching any of the reveal/scroll/typing animation
   markup in index.html.
   ============================================================ */
export const profile = {
  name: "Purna Shah",
  tagline: "Actively Seeking Data Science Internship · 2025",
  roles: [
    "Data Science Enthusiast",
    "Computer Science Student",
    "Machine Learning Explorer",
    "Python Developer"
  ],
  heroDescriptionHTML:
    'Computer Science student at <strong>Rajarambapu Institute of Technology</strong> ' +
    'with a strong foundation in <strong>Python, SQL, and statistics</strong>. ' +
    'I enjoy hunting for the "why" hidden behind every data point.',
  heroStats: [
    { n: "3+", l: "Projects" },
    { n: "2+", l: "Certifications" },
    { n: "80+", l: "Events Managed" },
    { n: "5+", l: "Languages Spoken" }
  ],
  about: {
    paragraphsHTML: [
      "I'm <strong>Purna Shah</strong>, a Computer Science & Engineering student at Rajarambapu Institute of Technology, Maharashtra. My fascination with data science began when I realized that data isn't just numbers — it's stories waiting to be told.",
      "With hands-on experience in <strong>data preprocessing, statistical analysis, database management, and machine learning</strong>, I've built end-to-end pipelines, designed multi-modal ML frameworks, and uncovered real business insights from raw datasets.",
      "Beyond the technical side, I lead and coordinate college events as <strong>Non-Technical Head of the Oyster Kode Club</strong>, where I've built strong communication, teamwork, and leadership skills."
    ],
    goalHTML:
      "🎯 My goal is to join a data-driven team where I can apply and grow my machine learning and analytics skills on real-world problems — contributing to solutions that genuinely matter.",
    chips: [
      { label: "Machine Learning", hi: true },
      { label: "Data Analysis", hi: true },
      { label: "Python", hi: true },
      { label: "SQL" },
      { label: "Pandas" },
      { label: "Statistics" },
      { label: "Event Management" },
      { label: "Leadership" },
      { label: "Git & GitHub" }
    ],
    stats: [
      { target: 3, desc: "Projects Built" },
      { target: 2, desc: "Certifications" },
      { target: 5, desc: "Events Coordinated" },
    ]
  },
  contact: {
    email: "purnashah24@gmail.com",
    phone: "+91 8766099556",
    phoneHref: "+918766099556",
    linkedin: "linkedin.com/in/purna-shah-6553282b1",
    linkedinUrl: "https://linkedin.com/in/purna-shah-6553282b1",
    github: "github.com/PurnaShah24",
    githubUrl: "https://github.com/PurnaShah24",
    instagram: "@art_box_24",
    instagramUrl: "https://www.instagram.com/art_box_24",
    location: "Maharashtra, India",
    blurb:
      "I'm actively looking for a <strong>Data Science or Machine Learning internship</strong> starting 2025. If you're working on interesting data problems, I'd love to contribute to your team."
  },
  github: {
    username: "PurnaShah24",
    bio: "CS student · Python · Data Science · ML",
    stats: [
      { n: "3+", l: "Repositories" },
      { n: "Active", l: "Status" },
      { n: "Python", l: "Top Language" }
    ]
  },
  footer: {
    logo: "Purna Shah",
    subtitle: "Data Science Student · Maharashtra, India",
    copyright: "© 2025 Purna Shah · Crafted with 💙 & Python"
  }
};
