// ===========================
// THEME TOGGLE (Dark / Light mode)
// ===========================
// This file runs on every page.
// It checks if the user previously chose dark mode,
// and applies it immediately so there's no flash of wrong theme.

(function () {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
  }
})();

// Once the page is loaded, wire up the toggle button
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  // Set the right emoji based on current mode
  function updateIcon() {
    btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  }

  updateIcon();

  btn.addEventListener('click', function () {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateIcon();
  });
});
