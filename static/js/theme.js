// Theme management — single source of truth for light/dark switching.
// Used both by the inline pre-paint script in <head> (to avoid FOUC) and by
// any [data-theme-toggle] button in the navbar.
//
// Storage key: `dex-theme` (values: "light" | "dark").
// Fallback when unset: OS preference via prefers-color-scheme.
(function () {
  'use strict';

  const STORAGE_KEY = 'dex-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getTheme() {
    return getStoredTheme() || getSystemTheme();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute(
        'aria-label',
        isDark ? 'Switch to light theme' : 'Switch to dark theme'
      );
    });
  }

  function setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) { /* private mode / storage disabled — ignore */ }
    applyTheme(theme);
  }

  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'light'
      : 'dark';
    setTheme(next);
  }

  // Delegated click handler — one listener for every [data-theme-toggle].
  function bind() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      e.preventDefault();
      toggleTheme();
    });
    // Sync aria attributes on any toggle buttons present at init.
    applyTheme(getTheme());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  // Expose for the inline head script so it can share logic.
  window.__dexTheme = { getTheme: getTheme, setTheme: setTheme, toggleTheme: toggleTheme };
})();
