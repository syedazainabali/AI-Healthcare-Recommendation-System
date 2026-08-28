export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'medai_theme_preference';

/**
 * Reads the stored theme or defaults to 'light' / system.
 */
export function getSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // LocalStorage might be restricted
  }
  return 'light';
}

/**
 * Checks if dark mode is currently active based on theme mode and system settings.
 */
export function isDarkActive(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

/**
 * Applies the dark class and data-theme attribute to document.documentElement.
 */
export function applyTheme(mode: ThemeMode): boolean {
  const isDark = isDarkActive(mode);
  const root = document.documentElement;

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors
  }

  // Dispatch an event for any component listening
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('themechange', { detail: { mode, isDark } }));
  }

  return isDark;
}

/**
 * Initializes the theme on app load.
 */
export function initTheme(): { mode: ThemeMode; isDark: boolean } {
  const mode = getSavedTheme();
  const isDark = applyTheme(mode);

  // Setup system listener
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentMode = getSavedTheme();
      if (currentMode === 'system') {
        applyTheme('system');
      }
    };
    try {
      mediaQuery.addEventListener('change', handleChange);
    } catch {
      mediaQuery.addListener(handleChange);
    }
  }

  return { mode, isDark };
}
