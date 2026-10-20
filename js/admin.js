/* ============================================================
   ADMIN DASHBOARD ENGINE
   Full-featured CMS for Purna Shah Portfolio.
   ============================================================ */
import { auth } from "../firebase/firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  fetchCollection,
  fetchDocument,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument
} from "../firebase/firestore.js";
import { uploadFile, deleteStorageFile } from "../firebase/storage.js";
import { isAuthorizedAdmin, AUTHORIZED_ADMIN_EMAILS } from "../firebase/admin-config.js";
import {
  defaultProfile,
  defaultSkills,
  defaultProjects,
  defaultCertificates,
  defaultExperience,
  defaultEducation,
  defaultLanguages,
  defaultArt
} from "../data/default-portfolio-data.js";

// Global state
const state = {
  currentUser: null,
  activeTab: "overview",
  projects: [],
  certificates: [],
  skills: null,
  experience: [],
  education: [],
  languages: [],
  art: [],
  messages: [],
  profile: null,
  modalCallback: null,
  confirmCallback: null
};

/* ── Toast Helper ── */
function showToast(message, type = "info") {
  const container = document.getElementById("admin-toast-container");
  if (!container) return;
  const t = document.createElement("div");
  t.className = `admin-toast ${type}`;
  const icon = type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ";
  t.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

/* ═══════════════════════════════════════════════════════════
   1. AUTHENTICATION & ACCESS CONTROL
════════════════════════════════════════════════════════════ */
function initAuth() {
  const authOverlay = document.getElementById("auth-overlay");
  const authAlert = document.getElementById("auth-alert");
  const loginForm = document.getElementById("login-form");
  const loginBtn = document.getElementById("login-btn");
  const forgotLink = document.getElementById("forgot-password-link");

  // Auth State Listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Verify authorization
      if (!isAuthorizedAdmin(user.email)) {
        await signOut(auth);
        authAlert.className = "auth-alert error";
        authAlert.textContent = `Access Denied: ${user.email} is not authorized to manage this portfolio.`;
        authOverlay.classList.remove("hidden");
        state.currentUser = null;
        return;
      }

      state.currentUser = user;
      authOverlay.classList.add("hidden");
      authAlert.textContent = "";
      authAlert.className = "auth-alert";

      // Update UI with user info
      const emailEl = document.getElementById("sidebar-email");
      const avatarEl = document.getElementById("sidebar-avatar");
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) avatarEl.textContent = (user.email[0] || "A").toUpperCase();

      // Load initial dashboard data
      loadAllDashboardData();
    } else {
      state.currentUser = null;
      authOverlay.classList.remove("hidden");
    }
  });

  // Login Form Submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    loginBtn.disabled = true;
    loginBtn.innerHTML = `<span>Signing In...</span>`;
    authAlert.textContent = "";
    authAlert.className = "auth-alert";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Signed in successfully!", "success");
    } catch (err) {
      authAlert.className = "auth-alert error";
      let msg = "Invalid email or password.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Incorrect email or password. Please verify your admin credentials.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later or reset password.";
      } else if (err.message) {
        msg = err.message;
      }
      authAlert.textContent = msg;
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = `<span>Sign In to Dashboard →</span>`;
    }
  });

  // Forgot Password
  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    if (!email) {
      authAlert.className = "auth-alert error";
      authAlert.textContent = "Please enter your email above and click 'Forgot password?' again.";
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      authAlert.className = "auth-alert info";
      authAlert.textContent = `Password reset email sent to ${email}. Check your inbox.`;
      showToast("Password reset email sent!", "info");
    } catch (err) {
      authAlert.className = "auth-alert error";
      authAlert.textContent = err.message || "Failed to send reset email.";
    }
  });

  // Logout Buttons
  const logoutBtns = [
    document.getElementById("logout-btn-sidebar"),
    document.getElementById("logout-btn-header")
  ];
  logoutBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", async () => {
        try {
          await signOut(auth);
          showToast("Signed out", "info");
        } catch (err) {
          console.error("Signout error:", err);
        }
      });
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   2. NAVIGATION & TABS
════════════════════════════════════════════════════════════ */
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item[data-tab]");
  const mobileToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");

  function switchTab(tabId) {
    state.activeTab = tabId;
    navItems.forEach(item => {
      item.classList.toggle("active", item.dataset.tab === tabId);
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.remove("active");
    });
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add("active");

    const pageTitle = document.getElementById("page-title");
    const titleMap = {
      overview: "Dashboard Overview",
      profile: "Profile, Hero & Section Visibility",
      projects: "Projects Management",
      certs: "Certificates Management",
      skills: "Technical Skills",
      experience: "Experience & Leadership",
      education: "Education History",
      languages: "Spoken Languages",
      art: "Art Gallery Management",
      messages: "Contact Inquiries / Messages",
      settings: "Settings & Data Sync"
    };
    if (pageTitle) pageTitle.textContent = titleMap[tabId] || "Dashboard";

    window.location.hash = tabId;
    if (sidebar) sidebar.classList.remove("open");
  }

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(item.dataset.tab);
    });
  });

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Restore active tab from hash
  const currentHash = window.location.hash.replace("#", "");
  if (currentHash && document.getElementById(`tab-${currentHash}`)) {
    switchTab(currentHash);
  }

  window.adminApp = window.adminApp || {};
  window.adminApp.switchTab = switchTab;
}

/* ═══════════════════════════════════════════════════════════
   3. DATA FETCHING & STATE SYNC
════════════════════════════════════════════════════════════ */
async function loadAllDashboardData() {
  await Promise.allSettled([
    loadProjects(),
    loadCertificates(),
    loadSkills(),
    loadExperience(),
    loadEducation(),
    loadLanguages(),
    loadArt(),
    loadMessages(),
    loadProfile()
  ]);
  updateOverviewStats();
}

function updateOverviewStats() {
  const pCount = document.getElementById("stat-projects-count");
  const cCount = document.getElementById("stat-certs-count");
  const aCount = document.getElementById("stat-art-count");
  const mCount = document.getElementById("stat-messages-count");
  const qUnread = document.getElementById("quick-unread-count");
  const badge = document.getElementById("unread-count-badge");

  if (pCount) pCount.textContent = state.projects.length;
  if (cCount) cCount.textContent = state.certificates.length;
  if (aCount) aCount.textContent = state.art.length;
  if (mCount) mCount.textContent = state.messages.length;

  const unread = state.messages.filter(m => !m.read).length;
  if (qUnread) qUnread.textContent = unread;
  if (badge) {
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  // Render recent 3 messages in Overview
  const recentBox = document.getElementById("overview-recent-messages");
  if (recentBox) {
    if (state.messages.length === 0) {
      recentBox.innerHTML = `<div style="padding:1rem 0;color:var(--text-dim);">No contact inquiries received yet.</div>`;
    } else {
      const recent = state.messages.slice(0, 3);
      recentBox.innerHTML = recent.map(m => `
        <div style="padding:0.75rem 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:1rem;">
          <div>
            <span style="font-weight:600;color:var(--text-main);">${m.name || "Anonymous"}</span>
            <span style="font-size:0.8rem;color:var(--text-sub);"> (${m.email || ""})</span>
            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:0.2rem;">${(m.message || "").substring(0, 80)}...</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.adminApp.viewMessage('${m.id}')">View</button>
        </div>
      `).join("");
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   4. PROJECTS CRUD
════════════════════════════════════════════════════════════ */
async function loadProjects() {
  const tbody = document.getElementById("projects-table-body");
  state.projects = await fetchCollection("projects");
  if (!state.projects || state.projects.length === 0) {
    state.projects = defaultProjects.map((p, i) => ({ id: `local-p-${i}`, ...p, published: true }));
  }
  renderProjectsTable();
}

function renderProjectsTable(filtered = null) {
  const tbody = document.getElementById("projects-table-body");
  if (!tbody) return;
  const list = filtered || state.projects;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:2rem;">No projects found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => {
    const isPub = p.published !== false;
    const isOngoing = p.status === "ongoing";
    const thumb = p.imageURL
      ? `<img src="${p.imageURL}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;"/>`
      : `<span style="font-size:1.3rem;">${p.icon || "💻"}</span>`;

    return `
      <tr>
        <td>${thumb}</td>
        <td>
          <div style="font-weight:600;">${p.title}</div>
          <div style="font-size:0.75rem;color:var(--cyan);">${p.type || "ML"}</div>
        </td>
        <td style="font-size:0.8rem;color:var(--text-sub);max-width:200px;">
          ${(p.stack || []).join(", ")}
        </td>
        <td>
          <span class="status-pill ${isOngoing ? 'ongoing' : 'published'}">
            ${isOngoing ? '● Ongoing' : '✓ Done'}
          </span>
        </td>
        <td>${p.order || 99}</td>
        <td>
          <button class="status-pill ${isPub ? 'published' : 'draft'}" style="cursor:pointer;border:none;" onclick="window.adminApp.toggleProjectPublish('${p.id}')">
            ${isPub ? 'Published' : 'Draft'}
          </button>
        </td>
        <td style="text-align:right;">
          <button class="btn btn-secondary btn-sm" onclick="window.adminApp.openEditModal('project', '${p.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="window.adminApp.confirmDelete('project', '${p.id}', '${p.title}')">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

// Project Search & Filter
const pSearch = document.getElementById("project-search");
const pFilter = document.getElementById("project-status-filter");
function applyProjectFilters() {
  const query = (pSearch?.value || "").toLowerCase().trim();
  const filter = pFilter?.value || "all";

  const res = state.projects.filter(p => {
    const matchQ = (p.title || "").toLowerCase().includes(query) ||
                   (p.description || "").toLowerCase().includes(query) ||
                   (p.stack || []).some(s => s.toLowerCase().includes(query));
    if (!matchQ) return false;
    if (filter === "published") return p.published !== false;
    if (filter === "draft") return p.published === false;
    if (filter === "ongoing") return p.status === "ongoing";
    if (filter === "done") return p.status === "done";
    return true;
  });
  renderProjectsTable(res);
}
pSearch?.addEventListener("input", applyProjectFilters);
pFilter?.addEventListener("change", applyProjectFilters);

/* ═══════════════════════════════════════════════════════════
   5. CERTIFICATES CRUD
════════════════════════════════════════════════════════════ */
async function loadCertificates() {
  state.certificates = await fetchCollection("certificates");
  if (!state.certificates || state.certificates.length === 0) {
    state.certificates = defaultCertificates.map((c, i) => ({ id: `local-c-${i}`, ...c, published: true }));
  }
  renderCertificatesTable();
}

function renderCertificatesTable(filtered = null) {
  const tbody = document.getElementById("certs-table-body");
  if (!tbody) return;
  const list = filtered || state.certificates;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-dim);padding:2rem;">No certificates found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => {
    const isPub = c.published !== false;
    const badge = c.badgeImageURL
      ? `<img src="${c.badgeImageURL}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;"/>`
      : `<span style="font-size:1.3rem;">${c.badge || "📜"}</span>`;

    return `
      <tr>
        <td>${badge}</td>
        <td style="font-weight:600;">${c.name}</td>
        <td style="color:var(--text-sub);">${c.org || ""}</td>
        <td style="font-size:0.85rem;">${c.issueDate || "—"}</td>
        <td>
          ${c.url ? `<a href="${c.url}" target="_blank" style="color:var(--cyan);text-decoration:none;font-size:0.8rem;">View Link ↗</a>` : "—"}
        </td>
        <td>${c.order || 99}</td>
        <td>
          <button class="status-pill ${isPub ? 'published' : 'draft'}" style="cursor:pointer;border:none;" onclick="window.adminApp.toggleCertPublish('${c.id}')">
            ${isPub ? 'Published' : 'Draft'}
          </button>
        </td>
        <td style="text-align:right;">
          <button class="btn btn-secondary btn-sm" onclick="window.adminApp.openEditModal('certificate', '${c.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="window.adminApp.confirmDelete('certificate', '${c.id}', '${c.name}')">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

const cSearch = document.getElementById("cert-search");
cSearch?.addEventListener("input", () => {
  const q = (cSearch.value || "").toLowerCase().trim();
  const res = state.certificates.filter(c =>
    (c.name || "").toLowerCase().includes(q) ||
    (c.org || "").toLowerCase().includes(q)
  );
  renderCertificatesTable(res);
});

/* ═══════════════════════════════════════════════════════════
   6. SKILLS MANAGEMENT
════════════════════════════════════════════════════════════ */
async function loadSkills() {
  const remote = await fetchDocument("skills", "catalog");
  state.skills = remote || JSON.parse(JSON.stringify(defaultSkills));
  renderSkillsEditor();
}

function renderSkillsEditor() {
  const s = state.skills;
  const progBox = document.getElementById("skills-prog-container");
  const mlBox = document.getElementById("skills-ml-container");
  const toolBox = document.getElementById("skills-tools-container");
  const softBox = document.getElementById("skills-soft-container");

  if (progBox) {
    progBox.innerHTML = (s.programmingLanguages || []).map((item, idx) => `
      <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem;">
        <input type="text" class="form-input" style="flex:2;" value="${item.name}" placeholder="Language" onchange="window.adminApp.updateSkill('prog', ${idx}, 'name', this.value)"/>
        <input type="number" min="0" max="100" class="form-input" style="width:80px;" value="${item.pct}" onchange="window.adminApp.updateSkill('prog', ${idx}, 'pct', this.value)"/>
        <button type="button" class="btn btn-danger btn-sm" onclick="window.adminApp.removeSkill('prog', ${idx})">✕</button>
      </div>
    `).join("");
  }

  if (mlBox) {
    mlBox.innerHTML = (s.dataScienceAndML || []).map((item, idx) => `
      <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem;">
        <input type="text" class="form-input" style="flex:2;" value="${item.name}" placeholder="Framework / Topic" onchange="window.adminApp.updateSkill('ml', ${idx}, 'name', this.value)"/>
        <input type="number" min="0" max="100" class="form-input" style="width:80px;" value="${item.pct}" onchange="window.adminApp.updateSkill('ml', ${idx}, 'pct', this.value)"/>
        <button type="button" class="btn btn-danger btn-sm" onclick="window.adminApp.removeSkill('ml', ${idx})">✕</button>
      </div>
    `).join("");
  }

  if (toolBox) {
    toolBox.innerHTML = (s.toolsAndPlatforms || []).map((item, idx) => `
      <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem;">
        <input type="text" class="form-input" style="width:60px;text-align:center;" value="${item.icon || '⚙️'}" onchange="window.adminApp.updateSkill('tool', ${idx}, 'icon', this.value)"/>
        <input type="text" class="form-input" style="flex:1;" value="${item.name}" placeholder="Tool / Platform" onchange="window.adminApp.updateSkill('tool', ${idx}, 'name', this.value)"/>
        <button type="button" class="btn btn-danger btn-sm" onclick="window.adminApp.removeSkill('tool', ${idx})">✕</button>
      </div>
    `).join("");
  }

  if (softBox) {
    softBox.innerHTML = (s.softSkills || []).map((item, idx) => `
      <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem;">
        <input type="text" class="form-input" style="width:60px;text-align:center;" value="${item.icon || '💡'}" onchange="window.adminApp.updateSkill('soft', ${idx}, 'icon', this.value)"/>
        <input type="text" class="form-input" style="flex:1;" value="${item.name}" placeholder="Soft Skill" onchange="window.adminApp.updateSkill('soft', ${idx}, 'name', this.value)"/>
        <input type="text" class="form-input" style="flex:1;" value="${item.url || ''}" placeholder="Optional Link" onchange="window.adminApp.updateSkill('soft', ${idx}, 'url', this.value)"/>
        <button type="button" class="btn btn-danger btn-sm" onclick="window.adminApp.removeSkill('soft', ${idx})">✕</button>
      </div>
    `).join("");
  }
}

async function saveSkills() {
  try {
    await setDocument("skills", "catalog", state.skills);
    showToast("Skills updated successfully!", "success");
  } catch (err) {
    showToast("Failed to save skills: " + err.message, "error");
  }
}

/* ═══════════════════════════════════════════════════════════
   7. EXPERIENCE, EDUCATION, LANGUAGES, ART
════════════════════════════════════════════════════════════ */
async function loadExperience() {
  state.experience = await fetchCollection("experience");
  if (!state.experience || state.experience.length === 0) {
    state.experience = defaultExperience.map(e => ({ ...e }));
  }
  renderExperienceTable();
}

function renderExperienceTable() {
  const tbody = document.getElementById("experience-table-body");
  if (!tbody) return;
  tbody.innerHTML = state.experience.map(e => `
    <tr>
      <td style="font-weight:600;font-size:0.85rem;">${e.dateRange}</td>
      <td>${e.role}</td>
      <td style="color:var(--cyan);">${e.org}</td>
      <td style="font-size:0.8rem;color:var(--text-sub);max-width:260px;">${(e.points || []).slice(0, 1).join(" ")}...</td>
      <td>${e.order || 99}</td>
      <td><span class="status-pill ${e.published !== false ? 'published' : 'draft'}">${e.published !== false ? 'Published' : 'Draft'}</span></td>
      <td style="text-align:right;">
        <button class="btn btn-secondary btn-sm" onclick="window.adminApp.openEditModal('experience', '${e.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="window.adminApp.confirmDelete('experience', '${e.id}', '${e.role}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

async function loadEducation() {
  state.education = await fetchCollection("education");
  if (!state.education || state.education.length === 0) {
    state.education = defaultEducation.map(e => ({ ...e }));
  }
  renderEducationTable();
}

function renderEducationTable() {
  const tbody = document.getElementById("education-table-body");
  if (!tbody) return;
  tbody.innerHTML = state.education.map(e => `
    <tr>
      <td style="font-size:1.3rem;">${e.icon || '🎓'}</td>
      <td style="font-size:0.85rem;">${e.yearRange}</td>
      <td style="font-weight:600;">${e.deg}</td>
      <td style="color:var(--text-sub);">${e.inst}</td>
      <td>${e.order || 99}</td>
      <td><span class="status-pill ${e.published !== false ? 'published' : 'draft'}">${e.published !== false ? 'Published' : 'Draft'}</span></td>
      <td style="text-align:right;">
        <button class="btn btn-secondary btn-sm" onclick="window.adminApp.openEditModal('education', '${e.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="window.adminApp.confirmDelete('education', '${e.id}', '${e.deg}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

async function loadLanguages() {
  state.languages = await fetchCollection("languages");
  if (!state.languages || state.languages.length === 0) {
    state.languages = defaultLanguages.map(l => ({ ...l }));
  }
  renderLanguagesTable();
}

function renderLanguagesTable() {
  const tbody = document.getElementById("languages-table-body");
  if (!tbody) return;
  tbody.innerHTML = state.languages.map(l => `
    <tr>
      <td style="font-weight:600;">${l.name}</td>
      <td style="color:var(--text-sub);">${l.level}</td>
      <td>${l.dots || 4} / 5</td>
      <td>${l.order || 99}</td>
      <td><span class="status-pill ${l.published !== false ? 'published' : 'draft'}">${l.published !== false ? 'Published' : 'Draft'}</span></td>
      <td style="text-align:right;">
        <button class="btn btn-secondary btn-sm" onclick="window.adminApp.openEditModal('language', '${l.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="window.adminApp.confirmDelete('language', '${l.id}', '${l.name}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

async function loadArt() {
  state.art = await fetchCollection("art");
  if (!state.art || state.art.length === 0) {
    state.art = defaultArt.map(a => ({ ...a }));
  }
  renderArtTable();
}

function renderArtTable() {
  const tbody = document.getElementById("art-table-body");
  if (!tbody) return;
  tbody.innerHTML = state.art.map(a => `
    <tr>
      <td>
        <img src="${a.url}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;background:#000;"/>
      </td>
      <td style="font-weight:600;">${a.title || "Artwork"}</td>
      <td style="font-size:0.75rem;color:var(--cyan);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        <a href="${a.url}" target="_blank" style="color:inherit;">${a.url}</a>
      </td>
      <td style="font-size:0.85rem;color:var(--text-sub);">${a.caption || "—"}</td>
      <td>${a.order || 99}</td>
      <td><span class="status-pill ${a.published !== false ? 'published' : 'draft'}">${a.published !== false ? 'Published' : 'Draft'}</span></td>
      <td style="text-align:right;">
        <button class="btn btn-secondary btn-sm" onclick="window.adminApp.openEditModal('art', '${a.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="window.adminApp.confirmDelete('art', '${a.id}', '${a.title || 'Artwork'}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

/* ═══════════════════════════════════════════════════════════
   8. PROFILE & HERO SECTION
════════════════════════════════════════════════════════════ */
async function loadProfile() {
  const remote = await fetchDocument("profile", "default");
  state.profile = remote || JSON.parse(JSON.stringify(defaultProfile));
  const p = state.profile;

  // Visibility Checkboxes
  const v = p.visibility || {};
  const setCheck = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = val !== false;
  };
  setCheck("vis-about", v.showAbout);
  setCheck("vis-skills", v.showSkills);
  setCheck("vis-projects", v.showProjects);
  setCheck("vis-experience", v.showExperience);
  setCheck("vis-education", v.showEducation);
  setCheck("vis-certs", v.showCertificates);
  setCheck("vis-languages", v.showLanguages);
  setCheck("vis-art", v.showArt);
  setCheck("vis-contact", v.showContact);

  // Form Fields
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal("prof-name", p.name || "");
  setVal("prof-tagline", p.tagline || "");
  setVal("prof-roles", (p.roles || []).join("\n"));
  setVal("prof-hero-desc", p.heroDescriptionHTML || "");
  setVal("prof-photo-url", p.profilePhotoURL || "");
  setVal("prof-resume-url", p.resumeURL || "");

  const about = p.about || {};
  setVal("prof-about-paras", (about.paragraphsHTML || []).join("\n\n"));
  setVal("prof-about-goal", about.goalHTML || "");
  setVal("prof-about-chips", (about.chips || []).map(c => c.label).join(", "));

  const contact = p.contact || {};
  setVal("prof-email", contact.email || "");
  setVal("prof-phone", contact.phone || "");
  setVal("prof-linkedin", contact.linkedinUrl || "");
  setVal("prof-github", contact.githubUrl || "");
  setVal("prof-instagram", contact.instagramUrl || "");
  setVal("prof-location", contact.location || "");
  setVal("prof-contact-blurb", contact.blurb || "");
}

// Profile Form Save
const profileForm = document.getElementById("profile-form");
profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const getCheck = (id) => document.getElementById(id)?.checked ?? true;
  const visibility = {
    showAbout: getCheck("vis-about"),
    showSkills: getCheck("vis-skills"),
    showProjects: getCheck("vis-projects"),
    showExperience: getCheck("vis-experience"),
    showEducation: getCheck("vis-education"),
    showCertificates: getCheck("vis-certs"),
    showLanguages: getCheck("vis-languages"),
    showArt: getCheck("vis-art"),
    showContact: getCheck("vis-contact")
  };

  const rolesText = document.getElementById("prof-roles").value.trim();
  const roles = rolesText ? rolesText.split("\n").map(r => r.trim()).filter(Boolean) : defaultProfile.roles;

  const aboutParasText = document.getElementById("prof-about-paras").value.trim();
  const paragraphsHTML = aboutParasText
    ? aboutParasText.split("\n\n").map(p => p.trim()).filter(Boolean)
    : defaultProfile.about.paragraphsHTML;

  const chipsText = document.getElementById("prof-about-chips").value.trim();
  const chips = chipsText
    ? chipsText.split(",").map(c => ({ label: c.trim(), hi: true }))
    : defaultProfile.about.chips;

  const updatedProfile = {
    ...state.profile,
    name: document.getElementById("prof-name").value.trim(),
    tagline: document.getElementById("prof-tagline").value.trim(),
    roles,
    heroDescriptionHTML: document.getElementById("prof-hero-desc").value.trim(),
    profilePhotoURL: document.getElementById("prof-photo-url").value.trim(),
    resumeURL: document.getElementById("prof-resume-url").value.trim(),
    visibility,
    about: {
      paragraphsHTML,
      goalHTML: document.getElementById("prof-about-goal").value.trim(),
      chips,
      stats: state.profile?.about?.stats || defaultProfile.about.stats
    },
    contact: {
      ...state.profile?.contact,
      email: document.getElementById("prof-email").value.trim(),
      phone: document.getElementById("prof-phone").value.trim(),
      phoneHref: document.getElementById("prof-phone").value.trim().replace(/\s+/g, ""),
      linkedin: document.getElementById("prof-linkedin").value.trim().replace(/https?:\/\/(www\.)?/, ""),
      linkedinUrl: document.getElementById("prof-linkedin").value.trim(),
      github: document.getElementById("prof-github").value.trim().replace(/https?:\/\/(www\.)?/, ""),
      githubUrl: document.getElementById("prof-github").value.trim(),
      instagram: "@art_box_24",
      instagramUrl: document.getElementById("prof-instagram").value.trim(),
      location: document.getElementById("prof-location").value.trim(),
      blurb: document.getElementById("prof-contact-blurb").value.trim()
    }
  };

  try {
    await setDocument("profile", "default", updatedProfile);
    state.profile = updatedProfile;
    showToast("Profile and visibility saved successfully!", "success");
  } catch (err) {
    showToast("Error saving profile: " + err.message, "error");
  }
});

// Profile image file upload
const photoFile = document.getElementById("prof-photo-file");
photoFile?.addEventListener("change", async () => {
  const file = photoFile.files[0];
  if (!file) return;
  const status = document.getElementById("prof-photo-status");
  status.textContent = "Uploading...";
  try {
    const { url } = await uploadFile(file, "uploads/profile/");
    document.getElementById("prof-photo-url").value = url;
    status.textContent = "✓ Uploaded!";
    showToast("Profile image uploaded", "success");
  } catch (err) {
    status.textContent = "Upload notice: " + err.message;
    showToast(err.message, "error");
  }
});

// Resume PDF upload
const resumeFile = document.getElementById("prof-resume-file");
resumeFile?.addEventListener("change", async () => {
  const file = resumeFile.files[0];
  if (!file) return;
  const status = document.getElementById("prof-resume-status");
  status.textContent = "Uploading...";
  try {
    const { url } = await uploadFile(file, "uploads/resume/");
    document.getElementById("prof-resume-url").value = url;
    status.textContent = "✓ Uploaded!";
    showToast("Resume PDF uploaded", "success");
  } catch (err) {
    status.textContent = "Upload notice: " + err.message;
    showToast(err.message, "error");
  }
});

/* ═══════════════════════════════════════════════════════════
   9. MESSAGES / INQUIRIES
════════════════════════════════════════════════════════════ */
async function loadMessages() {
  state.messages = await fetchCollection("messages", {
    orderByField: "timestamp",
    orderDirection: "desc"
  });
  renderMessagesTable();
}

function renderMessagesTable(filtered = null) {
  const tbody = document.getElementById("messages-table-body");
  if (!tbody) return;
  const list = filtered || state.messages;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:2rem;">No messages received.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(m => {
    const isUnread = !m.read;
    const dateStr = m.timestamp?.toDate
      ? m.timestamp.toDate().toLocaleDateString()
      : m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString() : "Recent";

    return `
      <tr style="${isUnread ? 'background:rgba(56,189,248,0.04);font-weight:600;' : ''}">
        <td>${isUnread ? '<span style="color:var(--cyan);font-size:1.2rem;">●</span>' : ''}</td>
        <td>${m.name || "Anonymous"}</td>
        <td style="color:var(--cyan);">${m.email || ""}</td>
        <td style="color:var(--text-sub);">${m.company || "—"}</td>
        <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-sub);">
          ${m.message || ""}
        </td>
        <td style="font-size:0.8rem;color:var(--text-dim);">${dateStr}</td>
        <td style="text-align:right;">
          <button class="btn btn-secondary btn-sm" onclick="window.adminApp.viewMessage('${m.id}')">View</button>
          <button class="btn btn-danger btn-sm" onclick="window.adminApp.confirmDelete('message', '${m.id}', 'message from ${m.name}')">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

const mSearch = document.getElementById("message-search");
const mFilter = document.getElementById("message-filter");
function applyMessageFilters() {
  const query = (mSearch?.value || "").toLowerCase().trim();
  const filter = mFilter?.value || "all";

  const res = state.messages.filter(m => {
    const matchQ = (m.name || "").toLowerCase().includes(query) ||
                   (m.email || "").toLowerCase().includes(query) ||
                   (m.company || "").toLowerCase().includes(query) ||
                   (m.message || "").toLowerCase().includes(query);
    if (!matchQ) return false;
    if (filter === "unread") return !m.read;
    if (filter === "read") return !!m.read;
    return true;
  });
  renderMessagesTable(res);
}
mSearch?.addEventListener("input", applyMessageFilters);
mFilter?.addEventListener("change", applyMessageFilters);

function viewMessage(id) {
  const m = state.messages.find(x => x.id === id);
  if (!m) return;

  const modal = document.getElementById("message-detail-modal");
  const body = document.getElementById("message-detail-body");
  const replyBtn = document.getElementById("message-detail-reply-btn");

  const dateStr = m.timestamp?.toDate
    ? m.timestamp.toDate().toLocaleString()
    : "Recently received";

  body.innerHTML = `
    <div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border);">
      <div style="font-size:1.2rem;font-weight:700;color:var(--text-main);">${m.name || "Anonymous"}</div>
      <div style="color:var(--cyan);font-size:0.9rem;margin-top:0.2rem;">${m.email || ""}</div>
      ${m.company ? `<div style="color:var(--text-sub);font-size:0.85rem;margin-top:0.2rem;">Company / Org: ${m.company}</div>` : ""}
      <div style="color:var(--text-dim);font-size:0.8rem;margin-top:0.4rem;">Received: ${dateStr}</div>
    </div>
    <div style="background:rgba(0,0,0,0.3);padding:1.25rem;border-radius:8px;border:1px solid var(--border);color:var(--text-main);font-size:0.95rem;line-height:1.7;white-space:pre-wrap;">
      ${m.message || "(No text content)"}
    </div>
  `;

  replyBtn.onclick = () => {
    window.location.href = `mailto:${m.email}?subject=Re:%20Portfolio%20Inquiry&body=Hi%20${encodeURIComponent(m.name || '')},%0A%0A`;
  };

  // Mark as read in Firestore
  if (!m.read && !m.id.startsWith("local-")) {
    updateDocument("messages", m.id, { read: true }).catch(() => null);
    m.read = true;
    renderMessagesTable();
    updateOverviewStats();
  }

  modal.classList.add("show");
}

/* ═══════════════════════════════════════════════════════════
   10. UNIVERSAL CRUD MODAL (ADD & EDIT)
════════════════════════════════════════════════════════════ */
function openAddModal(type) {
  openEditModal(type, null);
}

function openEditModal(type, id) {
  const modal = document.getElementById("crud-modal");
  const title = document.getElementById("crud-modal-title");
  const body = document.getElementById("crud-modal-body");
  const saveBtn = document.getElementById("crud-modal-save-btn");

  const isEdit = !!id;

  if (type === "project") {
    const item = isEdit ? state.projects.find(p => p.id === id) : {
      title: "", type: "ML · Healthcare", status: "ongoing", statusLabel: "● Ongoing",
      icon: "🩺", thumbBg: "linear-gradient(135deg,#2563EB,#38BDF8)",
      description: "", resultHTML: "", stack: ["Python"], links: [{ label: "GitHub →", url: "" }],
      imageURL: "", featured: false, order: state.projects.length + 1, published: true
    };

    title.textContent = isEdit ? "Edit Project" : "Add New Project";
    body.innerHTML = `
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Project Title</label>
          <input type="text" id="m-proj-title" class="form-input" value="${item.title || ''}" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Category / Type</label>
          <input type="text" id="m-proj-type" class="form-input" value="${item.type || 'Data Science'}" placeholder="e.g. ML · Healthcare"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea id="m-proj-desc" class="form-textarea" rows="3">${item.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Key Result / Benchmark (HTML supported)</label>
        <input type="text" id="m-proj-result" class="form-input" value="${item.resultHTML || ''}" placeholder="e.g. → 94% ROC-AUC achieved"/>
      </div>
      <div class="form-group">
        <label class="form-label">Tech Stack (comma separated)</label>
        <input type="text" id="m-proj-stack" class="form-input" value="${(item.stack || []).join(', ')}" placeholder="Python, Scikit-learn, SQL"/>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="m-proj-status" class="form-select">
            <option value="ongoing" ${item.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
            <option value="done" ${item.status === 'done' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Display Order (1, 2, 3...)</label>
          <input type="number" id="m-proj-order" class="form-input" value="${item.order || 1}"/>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">GitHub URL</label>
          <input type="url" id="m-proj-gh" class="form-input" value="${(item.links?.[0]?.url) || ''}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Live Demo URL (optional)</label>
          <input type="url" id="m-proj-demo" class="form-input" value="${(item.links?.[1]?.url) || ''}"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Thumbnail Image URL</label>
        <input type="text" id="m-proj-img" class="form-input" value="${item.imageURL || ''}"/>
        <div style="margin-top:0.4rem;display:flex;align-items:center;gap:0.5rem;">
          <input type="file" id="m-proj-file" accept="image/*" style="display:none;"/>
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('m-proj-file').click()">Upload Image</button>
          <span id="m-proj-file-status" class="form-hint"></span>
        </div>
      </div>
      <div style="display:flex;gap:2rem;margin-top:1rem;">
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
          <input type="checkbox" id="m-proj-featured" ${item.featured ? 'checked' : ''}/>
          <span>Featured Project (Star Badge)</span>
        </label>
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
          <input type="checkbox" id="m-proj-published" ${item.published !== false ? 'checked' : ''}/>
          <span>Published (Visible publicly)</span>
        </label>
      </div>
    `;

    // Hook upload
    const fileEl = document.getElementById("m-proj-file");
    fileEl?.addEventListener("change", async () => {
      const f = fileEl.files[0];
      if (!f) return;
      const st = document.getElementById("m-proj-file-status");
      st.textContent = "Uploading...";
      try {
        const { url } = await uploadFile(f, "uploads/projects/");
        document.getElementById("m-proj-img").value = url;
        st.textContent = "✓ Uploaded!";
      } catch (err) {
        st.textContent = "Notice: " + err.message;
      }
    });

    state.modalCallback = async () => {
      const titleVal = document.getElementById("m-proj-title").value.trim();
      if (!titleVal) throw new Error("Title is required");

      const stackVal = document.getElementById("m-proj-stack").value
        .split(",").map(s => s.trim()).filter(Boolean);

      const links = [];
      const gh = document.getElementById("m-proj-gh").value.trim();
      const demo = document.getElementById("m-proj-demo").value.trim();
      if (gh) links.push({ label: "GitHub →", url: gh });
      if (demo) links.push({ label: "Live Demo →", url: demo });

      const st = document.getElementById("m-proj-status").value;
      const data = {
        title: titleVal,
        type: document.getElementById("m-proj-type").value.trim() || "Project",
        status: st,
        statusLabel: st === "ongoing" ? "● Ongoing" : "✓ Complete",
        description: document.getElementById("m-proj-desc").value.trim(),
        resultHTML: document.getElementById("m-proj-result").value.trim(),
        stack: stackVal,
        links,
        imageURL: document.getElementById("m-proj-img").value.trim(),
        icon: item.icon || "💻",
        thumbBg: item.thumbBg || "linear-gradient(135deg,#2563EB,#38BDF8)",
        featured: document.getElementById("m-proj-featured").checked,
        order: Number(document.getElementById("m-proj-order").value) || 1,
        published: document.getElementById("m-proj-published").checked
      };

      if (isEdit && !id.startsWith("local-")) {
        await updateDocument("projects", id, data);
      } else {
        await addDocument("projects", data);
      }
      await loadProjects();
      updateOverviewStats();
      showToast(isEdit ? "Project updated!" : "Project created!", "success");
    };
  }

  else if (type === "certificate") {
    const item = isEdit ? state.certificates.find(c => c.id === id) : {
      name: "", org: "", issueDate: "", credentialId: "", url: "",
      badge: "📜", badgeImageURL: "", order: state.certificates.length + 1, published: true
    };

    title.textContent = isEdit ? "Edit Certificate" : "Add Certificate";
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Certificate Name</label>
        <input type="text" id="m-cert-name" class="form-input" value="${item.name || ''}" required/>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Issuing Organization</label>
          <input type="text" id="m-cert-org" class="form-input" value="${item.org || ''}" placeholder="e.g. NPTEL, GeeksforGeeks"/>
        </div>
        <div class="form-group">
          <label class="form-label">Issue Date / Year</label>
          <input type="text" id="m-cert-date" class="form-input" value="${item.issueDate || ''}" placeholder="e.g. 2024"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Credential Verification Link / PDF URL</label>
        <input type="text" id="m-cert-url" class="form-input" value="${item.url || ''}"/>
        <div style="margin-top:0.4rem;display:flex;align-items:center;gap:0.5rem;">
          <input type="file" id="m-cert-pdf-file" accept="application/pdf,image/*" style="display:none;"/>
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('m-cert-pdf-file').click()">Upload Certificate PDF/Image</button>
          <span id="m-cert-pdf-status" class="form-hint"></span>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Badge Emoji (or 🗄️, 🐍, 📜)</label>
          <input type="text" id="m-cert-badge" class="form-input" value="${item.badge || '📜'}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="m-cert-order" class="form-input" value="${item.order || 1}"/>
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;margin-top:0.5rem;">
        <input type="checkbox" id="m-cert-published" ${item.published !== false ? 'checked' : ''}/>
        <span>Published (Visible publicly)</span>
      </label>
    `;

    const certFile = document.getElementById("m-cert-pdf-file");
    certFile?.addEventListener("change", async () => {
      const f = certFile.files[0];
      if (!f) return;
      const st = document.getElementById("m-cert-pdf-status");
      st.textContent = "Uploading...";
      try {
        const { url } = await uploadFile(f, "uploads/certificates/");
        document.getElementById("m-cert-url").value = url;
        st.textContent = "✓ Uploaded!";
      } catch (err) {
        st.textContent = "Notice: " + err.message;
      }
    });

    state.modalCallback = async () => {
      const nameVal = document.getElementById("m-cert-name").value.trim();
      if (!nameVal) throw new Error("Name is required");

      const data = {
        name: nameVal,
        org: document.getElementById("m-cert-org").value.trim(),
        issueDate: document.getElementById("m-cert-date").value.trim(),
        url: document.getElementById("m-cert-url").value.trim(),
        badge: document.getElementById("m-cert-badge").value.trim() || "📜",
        order: Number(document.getElementById("m-cert-order").value) || 1,
        published: document.getElementById("m-cert-published").checked
      };

      if (isEdit && !id.startsWith("local-")) {
        await updateDocument("certificates", id, data);
      } else {
        await addDocument("certificates", data);
      }
      await loadCertificates();
      updateOverviewStats();
      showToast(isEdit ? "Certificate updated!" : "Certificate added!", "success");
    };
  }

  else if (type === "experience") {
    const item = isEdit ? state.experience.find(e => e.id === id) : {
      dateRange: "", role: "", org: "", points: [""], links: [], order: state.experience.length + 1, published: true
    };

    title.textContent = isEdit ? "Edit Experience" : "Add Experience";
    body.innerHTML = `
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Period / Dates</label>
          <input type="text" id="m-exp-date" class="form-input" value="${item.dateRange || ''}" placeholder="e.g. Jun 2025 – Jul 2025" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Role / Title</label>
          <input type="text" id="m-exp-role" class="form-input" value="${item.role || ''}" placeholder="e.g. Python Programming Intern" required/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Organization / Club</label>
        <input type="text" id="m-exp-org" class="form-input" value="${item.org || ''}" placeholder="e.g. CodSoft" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Key Highlights (one bullet point per line)</label>
        <textarea id="m-exp-points" class="form-textarea" rows="4">${(item.points || []).join('\n')}</textarea>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Project / Post Link (optional URL)</label>
          <input type="url" id="m-exp-url" class="form-input" value="${item.links?.[0]?.url || ''}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Link Label</label>
          <input type="text" id="m-exp-label" class="form-input" value="${item.links?.[0]?.label || 'GitHub Repo'}"/>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="m-exp-order" class="form-input" value="${item.order || 1}"/>
        </div>
        <div class="form-group" style="display:flex;align-items:center;padding-top:1.5rem;">
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
            <input type="checkbox" id="m-exp-published" ${item.published !== false ? 'checked' : ''}/>
            <span>Published</span>
          </label>
        </div>
      </div>
    `;

    state.modalCallback = async () => {
      const pts = document.getElementById("m-exp-points").value.split("\n").map(p => p.trim()).filter(Boolean);
      const url = document.getElementById("m-exp-url").value.trim();
      const label = document.getElementById("m-exp-label").value.trim() || "Link";
      const links = url ? [{ label, url }] : [];

      const data = {
        dateRange: document.getElementById("m-exp-date").value.trim(),
        role: document.getElementById("m-exp-role").value.trim(),
        org: document.getElementById("m-exp-org").value.trim(),
        points: pts,
        links,
        order: Number(document.getElementById("m-exp-order").value) || 1,
        published: document.getElementById("m-exp-published").checked
      };

      if (isEdit && !id.startsWith("exp-")) {
        await updateDocument("experience", id, data);
      } else {
        await addDocument("experience", data);
      }
      await loadExperience();
      showToast("Experience saved!", "success");
    };
  }

  else if (type === "education") {
    const item = isEdit ? state.education.find(e => e.id === id) : {
      yearRange: "", deg: "", inst: "", icon: "🎓", order: state.education.length + 1, published: true
    };

    title.textContent = isEdit ? "Edit Education" : "Add Education";
    body.innerHTML = `
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Year Range</label>
          <input type="text" id="m-edu-year" class="form-input" value="${item.yearRange || ''}" placeholder="Aug 2023 – May 2027" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Icon Emoji</label>
          <input type="text" id="m-edu-icon" class="form-input" value="${item.icon || '🎓'}"/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Degree / Certificate</label>
        <input type="text" id="m-edu-deg" class="form-input" value="${item.deg || ''}" placeholder="B.Tech — CSE" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Institution</label>
        <input type="text" id="m-edu-inst" class="form-input" value="${item.inst || ''}" placeholder="RIT, Maharashtra" required/>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="m-edu-order" class="form-input" value="${item.order || 1}"/>
        </div>
        <div class="form-group" style="display:flex;align-items:center;padding-top:1.5rem;">
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
            <input type="checkbox" id="m-edu-published" ${item.published !== false ? 'checked' : ''}/>
            <span>Published</span>
          </label>
        </div>
      </div>
    `;

    state.modalCallback = async () => {
      const data = {
        yearRange: document.getElementById("m-edu-year").value.trim(),
        icon: document.getElementById("m-edu-icon").value.trim() || "🎓",
        deg: document.getElementById("m-edu-deg").value.trim(),
        inst: document.getElementById("m-edu-inst").value.trim(),
        order: Number(document.getElementById("m-edu-order").value) || 1,
        published: document.getElementById("m-edu-published").checked
      };

      if (isEdit && !id.startsWith("edu-")) {
        await updateDocument("education", id, data);
      } else {
        await addDocument("education", data);
      }
      await loadEducation();
      showToast("Education saved!", "success");
    };
  }

  else if (type === "language") {
    const item = isEdit ? state.languages.find(l => l.id === id) : {
      name: "", level: "Professional Working", dots: 4, order: state.languages.length + 1, published: true
    };

    title.textContent = isEdit ? "Edit Language" : "Add Spoken Language";
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Language Name</label>
        <input type="text" id="m-lang-name" class="form-input" value="${item.name || ''}" placeholder="e.g. English" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Proficiency Level</label>
        <input type="text" id="m-lang-level" class="form-input" value="${item.level || ''}" placeholder="e.g. Native / Bilingual"/>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Rating Dots (1 to 5)</label>
          <input type="number" min="1" max="5" id="m-lang-dots" class="form-input" value="${item.dots || 4}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="m-lang-order" class="form-input" value="${item.order || 1}"/>
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
        <input type="checkbox" id="m-lang-published" ${item.published !== false ? 'checked' : ''}/>
        <span>Published</span>
      </label>
    `;

    state.modalCallback = async () => {
      const data = {
        name: document.getElementById("m-lang-name").value.trim(),
        level: document.getElementById("m-lang-level").value.trim(),
        dots: Number(document.getElementById("m-lang-dots").value) || 4,
        order: Number(document.getElementById("m-lang-order").value) || 1,
        published: document.getElementById("m-lang-published").checked
      };

      if (isEdit && !id.startsWith("lang-")) {
        await updateDocument("languages", id, data);
      } else {
        await addDocument("languages", data);
      }
      await loadLanguages();
      showToast("Language saved!", "success");
    };
  }

  else if (type === "art") {
    const item = isEdit ? state.art.find(a => a.id === id) : {
      title: "", url: "", caption: "", order: state.art.length + 1, published: true
    };

    title.textContent = isEdit ? "Edit Artwork" : "Add Artwork";
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Artwork Title</label>
        <input type="text" id="m-art-title" class="form-input" value="${item.title || ''}" placeholder="e.g. Mandala Art" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Image URL</label>
        <input type="text" id="m-art-url" class="form-input" value="${item.url || ''}" required/>
        <div style="margin-top:0.4rem;display:flex;align-items:center;gap:0.5rem;">
          <input type="file" id="m-art-file" accept="image/*" style="display:none;"/>
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('m-art-file').click()">Upload Image</button>
          <span id="m-art-file-status" class="form-hint"></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Caption / Description</label>
        <input type="text" id="m-art-caption" class="form-input" value="${item.caption || ''}"/>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="m-art-order" class="form-input" value="${item.order || 1}"/>
        </div>
        <div class="form-group" style="display:flex;align-items:center;padding-top:1.5rem;">
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
            <input type="checkbox" id="m-art-published" ${item.published !== false ? 'checked' : ''}/>
            <span>Published</span>
          </label>
        </div>
      </div>
    `;

    const artFile = document.getElementById("m-art-file");
    artFile?.addEventListener("change", async () => {
      const f = artFile.files[0];
      if (!f) return;
      const st = document.getElementById("m-art-file-status");
      st.textContent = "Uploading...";
      try {
        const { url } = await uploadFile(f, "uploads/art/");
        document.getElementById("m-art-url").value = url;
        st.textContent = "✓ Uploaded!";
      } catch (err) {
        st.textContent = "Notice: " + err.message;
      }
    });

    state.modalCallback = async () => {
      const data = {
        title: document.getElementById("m-art-title").value.trim(),
        url: document.getElementById("m-art-url").value.trim(),
        caption: document.getElementById("m-art-caption").value.trim(),
        order: Number(document.getElementById("m-art-order").value) || 1,
        published: document.getElementById("m-art-published").checked
      };

      if (isEdit && !id.startsWith("art-")) {
        await updateDocument("art", id, data);
      } else {
        await addDocument("art", data);
      }
      await loadArt();
      updateOverviewStats();
      showToast("Artwork saved!", "success");
    };
  }

  modal.classList.add("show");

  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    try {
      if (state.modalCallback) await state.modalCallback();
      closeModal("crud-modal");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  };
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("show");
}

/* ── Delete Confirmation ── */
function confirmDelete(collectionName, id, label) {
  const modal = document.getElementById("confirm-modal");
  const text = document.getElementById("confirm-modal-text");
  const btn = document.getElementById("confirm-modal-btn");

  text.innerHTML = `Are you sure you want to delete <strong>${label}</strong>? This action cannot be undone.`;
  modal.classList.add("show");

  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "Deleting...";
    try {
      if (id.startsWith("local-") || id.startsWith("exp-") || id.startsWith("edu-") || id.startsWith("lang-") || id.startsWith("art-")) {
        // Local fallback item being removed from view
        if (collectionName === "project") state.projects = state.projects.filter(p => p.id !== id);
        if (collectionName === "certificate") state.certificates = state.certificates.filter(c => c.id !== id);
        if (collectionName === "experience") state.experience = state.experience.filter(e => e.id !== id);
        if (collectionName === "education") state.education = state.education.filter(e => e.id !== id);
        if (collectionName === "language") state.languages = state.languages.filter(l => l.id !== id);
        if (collectionName === "art") state.art = state.art.filter(a => a.id !== id);
      } else {
        const colMap = {
          project: "projects",
          certificate: "certificates",
          experience: "experience",
          education: "education",
          language: "languages",
          art: "art",
          message: "messages"
        };
        const actualCol = colMap[collectionName] || collectionName;
        await deleteDocument(actualCol, id);
      }

      showToast(`Deleted ${label}`, "info");
      closeModal("confirm-modal");

      // Reload
      if (collectionName === "project") loadProjects();
      if (collectionName === "certificate") loadCertificates();
      if (collectionName === "experience") loadExperience();
      if (collectionName === "education") loadEducation();
      if (collectionName === "language") loadLanguages();
      if (collectionName === "art") loadArt();
      if (collectionName === "message") loadMessages();
      updateOverviewStats();
    } catch (err) {
      showToast("Delete failed: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Delete Permanently";
    }
  };
}

/* ── Toggle Quick Statuses ── */
async function toggleProjectPublish(id) {
  const p = state.projects.find(x => x.id === id);
  if (!p) return;
  const newPub = p.published === false;
  p.published = newPub;
  renderProjectsTable();
  if (!id.startsWith("local-")) {
    await updateDocument("projects", id, { published: newPub });
  }
}

async function toggleCertPublish(id) {
  const c = state.certificates.find(x => x.id === id);
  if (!c) return;
  const newPub = c.published === false;
  c.published = newPub;
  renderCertificatesTable();
  if (!id.startsWith("local-")) {
    await updateDocument("certificates", id, { published: newPub });
  }
}

/* ── Skills Mutators ── */
function updateSkill(group, idx, field, val) {
  if (!state.skills) return;
  const map = {
    prog: "programmingLanguages",
    ml: "dataScienceAndML",
    tool: "toolsAndPlatforms",
    soft: "softSkills"
  };
  const list = state.skills[map[group]];
  if (list && list[idx]) {
    list[idx][field] = field === "pct" ? Number(val) : val;
  }
}

function removeSkill(group, idx) {
  if (!state.skills) return;
  const map = {
    prog: "programmingLanguages",
    ml: "dataScienceAndML",
    tool: "toolsAndPlatforms",
    soft: "softSkills"
  };
  const list = state.skills[map[group]];
  if (list) {
    list.splice(idx, 1);
    renderSkillsEditor();
  }
}

function addSkillRow(group) {
  if (!state.skills) return;
  if (group === "prog") state.skills.programmingLanguages.push({ name: "New Language", pct: 75 });
  if (group === "ml") state.skills.dataScienceAndML.push({ name: "New Topic", pct: 75 });
  if (group === "tool") state.skills.toolsAndPlatforms.push({ icon: "⚙️", name: "New Tool" });
  if (group === "soft") state.skills.softSkills.push({ icon: "💡", name: "New Skill", url: "" });
  renderSkillsEditor();
}

/* ═══════════════════════════════════════════════════════════
   11. DATA SYNC / SEEDING UTILITY
════════════════════════════════════════════════════════════ */
async function syncDefaultData() {
  const btn = document.getElementById("sync-data-btn");
  const logBox = document.getElementById("sync-log-box");
  if (!btn || !logBox) return;

  btn.disabled = true;
  logBox.style.display = "block";
  logBox.textContent = "Starting Initial Firestore Sync...\n";

  function log(msg) {
    logBox.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    logBox.scrollTop = logBox.scrollHeight;
  }

  try {
    // 1. Profile
    log("Seeding profile/default...");
    await setDocument("profile", "default", defaultProfile);
    log("✓ Profile successfully written.");

    // 2. Skills
    log("Seeding skills/catalog...");
    await setDocument("skills", "catalog", defaultSkills);
    log("✓ Skills catalog written.");

    // 3. Projects
    log("Seeding projects collection...");
    const existingP = await fetchCollection("projects");
    if (existingP.length === 0) {
      for (const p of defaultProjects) {
        await addDocument("projects", { ...p, published: true, order: 1 });
      }
      log(`✓ ${defaultProjects.length} projects seeded.`);
    } else {
      log(`Projects already exist (${existingP.length} found). Skipped.`);
    }

    // 4. Certificates
    log("Seeding certificates collection...");
    const existingC = await fetchCollection("certificates");
    if (existingC.length === 0) {
      for (const c of defaultCertificates) {
        await addDocument("certificates", { ...c, published: true, order: 1 });
      }
      log(`✓ ${defaultCertificates.length} certificates seeded.`);
    } else {
      log(`Certificates already exist (${existingC.length} found). Skipped.`);
    }

    // 5. Experience
    log("Seeding experience collection...");
    const existingE = await fetchCollection("experience");
    if (existingE.length === 0) {
      for (const e of defaultExperience) {
        await addDocument("experience", e);
      }
      log(`✓ ${defaultExperience.length} experience items seeded.`);
    } else {
      log(`Experience items already exist (${existingE.length} found). Skipped.`);
    }

    // 6. Education
    log("Seeding education collection...");
    const existingEdu = await fetchCollection("education");
    if (existingEdu.length === 0) {
      for (const ed of defaultEducation) {
        await addDocument("education", ed);
      }
      log(`✓ ${defaultEducation.length} education items seeded.`);
    } else {
      log(`Education items already exist (${existingEdu.length} found). Skipped.`);
    }

    // 7. Languages
    log("Seeding languages collection...");
    const existingL = await fetchCollection("languages");
    if (existingL.length === 0) {
      for (const l of defaultLanguages) {
        await addDocument("languages", l);
      }
      log(`✓ ${defaultLanguages.length} languages seeded.`);
    } else {
      log(`Languages already exist (${existingL.length} found). Skipped.`);
    }

    // 8. Art
    log("Seeding art collection...");
    const existingA = await fetchCollection("art");
    if (existingA.length === 0) {
      for (const a of defaultArt) {
        await addDocument("art", a);
      }
      log(`✓ ${defaultArt.length} art items seeded.`);
    } else {
      log(`Art items already exist (${existingA.length} found). Skipped.`);
    }

    log("\n🎉 ALL SECTIONS SUCCESSFULLY SYNCED TO FIRESTORE!");
    showToast("Firestore database initialized with default content!", "success");
    await loadAllDashboardData();
  } catch (err) {
    log(`\n❌ Error during sync: ${err.message}`);
    showToast("Sync error: " + err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

/* ── Expose globals to window.adminApp ── */
window.adminApp = {
  ...window.adminApp,
  openAddModal,
  openEditModal,
  closeModal,
  confirmDelete,
  toggleProjectPublish,
  toggleCertPublish,
  updateSkill,
  removeSkill,
  addSkillRow,
  saveSkills,
  viewMessage,
  syncDefaultData
};

/* ── Initialization ── */
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  initNavigation();
});
