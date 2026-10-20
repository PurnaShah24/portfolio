/* ============================================================
   THEME TOGGLE
   Identical logic to the original inline toggleTheme(). Exposed
   on window so the existing onclick="toggleTheme()" button keeps
   working unchanged.
   ============================================================ */
export function toggleTheme() {
  const h = document.documentElement;
  const isDark = h.getAttribute('data-theme') === 'dark';
  h.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = isDark ? '🌙' : '☀️';
}

export function initTheme() {
  window.toggleTheme = toggleTheme;
}
