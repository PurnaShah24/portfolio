/* ============================================================
   PROJECTS DATA (local fallback)
   js/projects.js tries Firestore's "projects" collection first;
   if it's empty or unreachable, it renders this array instead —
   so the grid always looks identical to the original static page.
   ============================================================ */
export const projects = [
  {
    icon: "🩺",
    thumbBg: "linear-gradient(135deg,#2563EB,#38BDF8)",
    type: "ML · Healthcare",
    status: "ongoing", // "ongoing" | "done"
    statusLabel: "● Ongoing",
    title: "Multi-Modal Pancreatic Cancer Risk Prediction",
    description:
      "Led development of a multi-modal ML pipeline combining clinical and wearable physiological data for early cancer risk stratification. Engineered preprocessing pipelines and benchmarked ensemble classifiers.",
    resultHTML:
      "→ Random Forest & XGBoost evaluated on Accuracy, Precision, Recall, F1, ROC-AUC",
    stack: ["Python", "Pandas", "NumPy", "Scikit-learn", "Matplotlib", "XGBoost"],
    links: [{ label: "GitHub →", url: "https://github.com/PurnaShah24" }]
  },
  {
    icon: "📉",
    thumbBg: "linear-gradient(135deg,#7c3aed,#38BDF8)",
    type: "Data Analysis · Telco",
    status: "done",
    statusLabel: "✓ Complete",
    title: "Customer Churn Analysis",
    description:
      "Independent analysis of 7,000+ IBM Telco dataset records to uncover churn drivers. Designed a MySQL database, applied chi-square hypothesis testing, and created retention strategy visualizations.",
    resultHTML:
      "→ p &lt; 0.001 — contract type & payment method confirmed as churn drivers",
    stack: ["MySQL", "Python", "Pandas", "SciPy", "Excel"],
    links: [{ label: "GitHub →", url: "https://github.com/PurnaShah24/customer-churn-analysis" }]
  },
  {
    icon: "🎭",
    thumbBg: "linear-gradient(135deg,#059669,#38BDF8)",
    type: "Full-Stack · Desktop App",
    status: "done",
    statusLabel: "✓ Complete",
    title: "Cultural Event Management System",
    description:
      "End-to-end desktop application for managing college cultural events. Designed a 6-table MySQL schema with DAO layer using PreparedStatements, and built a Java Swing UI with JDBC integration.",
    resultHTML:
      "→ Supports real event & participant management with secure CRUD operations",
    stack: ["Java (Swing)", "MySQL", "JDBC", "DAO Pattern"],
    links: [{ label: "GitHub →", url: "https://github.com/PurnaShah24/CultureManagementSystem" }]
  }
];
