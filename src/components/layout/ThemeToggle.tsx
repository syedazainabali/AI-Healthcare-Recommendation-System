import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { ThemeMode, getSavedTheme, applyTheme, isDarkActive } from '../../utils/theme';

interface ThemeToggleProps {
  variant?: 'icon' | 'compact' | 'segmented' | 'menu';
  className?: string;
  onThemeChanged?: (mode: ThemeMode, isDark: boolean) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  onThemeChanged,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = getSavedTheme();
    setThemeMode(current);
    setIsDark(isDarkActive(current));

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode: ThemeMode; isDark: boolean }>;
      if (customEvent.detail) {
        setThemeMode(customEvent.detail.mode);
        setIsDark(customEvent.detail.isDark);
      }
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectTheme = (mode: ThemeMode) => {
    const darkActive = applyTheme(mode);
    setThemeMode(mode);
    setIsDark(darkActive);
    setIsMenuOpen(false);
    if (onThemeChanged) {
      onThemeChanged(mode, darkActive);
    }
  };

  const toggleDirect = () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    selectTheme(nextMode);
  };

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 ${className}`}>
        <button
          type="button"
          onClick={() => selectTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            themeMode === 'light'
              ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => selectTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            themeMode === 'dark'
              ? 'bg-slate-900 text-sky-400 shadow-xs dark:bg-slate-950 dark:border dark:border-sky-500/30'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-sky-400" />
          <span>Dark Mode</span>
        </button>

        <button
          type="button"
          onClick={() => selectTheme('system')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            themeMode === 'system'
              ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
          <span>System</span>
        </button>
      </div>
    );
  }

  if (variant === 'menu') {
    return (
      <div ref={menuRef} className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-sky-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="capitalize">{themeMode}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-1.5 shadow-xl z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => selectTheme('light')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </div>
              {themeMode === 'light' && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={() => selectTheme('dark')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span>Dark Mode</span>
              </div>
              {themeMode === 'dark' && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={() => selectTheme('system')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                themeMode === 'system'
                  ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>System Sync</span>
              </div>
              {themeMode === 'system' && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default 'icon' or 'compact' variant
  return (
    <button
      type="button"
      id="global-theme-toggle-btn"
      onClick={toggleDirect}
      className={`relative p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-sky-400 transition-all duration-200 cursor-pointer shadow-xs group ${className}`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to High-Contrast Dark Theme'}
      aria-label="Toggle theme mode"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-sky-400 transform transition-transform duration-300 rotate-0 scale-100 group-hover:scale-110" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transform transition-transform duration-300 rotate-0 scale-100 group-hover:rotate-45" />
        )}
      </div>
    </button>
  );
};
