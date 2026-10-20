/* ============================================================
   SKILLS DATA
   Mirrors the "Technical toolkit" section exactly (percentages,
   tools, soft skills) as structured data for future/optional
   dynamic rendering. index.html renders this section statically
   so the skill-bar reveal animation timing is 100% unchanged;
   this file is the single source of truth for the numbers.
   ============================================================ */
export const skills = {
  programmingLanguages: [
    { name: "Python", pct: 90 },
    { name: "SQL", pct: 82 },
    { name: "C", pct: 70 },
    { name: "Java", pct: 65 }
  ],
  dataScienceAndML: [
    { name: "Pandas / NumPy", pct: 87 },
    { name: "Matplotlib", pct: 83 },
    { name: "Scikit-learn", pct: 75 },
    { name: "Statistics", pct: 78 }
  ],
  toolsAndPlatforms: [
    { icon: "🐙", name: "Git & GitHub" },
    { icon: "📓", name: "Jupyter" },
    { icon: "💻", name: "VS Code" },
    { icon: "🗄️", name: "MySQL" },
    { icon: "📊", name: "Excel" },
    { icon: "☁️", name: "Google Colab" },
    { icon: "🐍", name: "PyCharm" },
    { icon: "🤗", name: "Kaggle" },
    { icon: "🏗️", name: "JDBC" }
  ],
  softSkills: [
    { icon: "🗣️", name: "Presentation" },
    { icon: "👥", name: "Leadership" },
    { icon: "🤝", name: "Teamwork" },
    { icon: "🎪", name: "Event Management" }
  ]
};
