import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  isLight?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  isLight = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg font-extrabold tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-4xl font-black tracking-tight',
  };

  const subtitleSizes = {
    sm: 'text-[9px] tracking-wider',
    md: 'text-[10px] tracking-wider',
    lg: 'text-xs tracking-wider',
    xl: 'text-sm tracking-wider',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="medai-brand-logo">
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-sm shadow-blue-500/25 flex-shrink-0 ${iconSizes[size]}`}>
        {/* Modern Medical Cross with Soft Curves */}
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3/5 h-3/5">
          <rect x="14" y="6" width="12" height="28" rx="3" fill="currentColor" />
          <rect x="6" y="14" width="28" height="12" rx="3" fill="currentColor" />
          <circle cx="20" cy="20" r="3.5" fill="#93C5FD" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <div className={`flex items-baseline gap-1.5 ${titleSizes[size]} ${isLight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          <span className="font-extrabold">MED<span className="text-blue-600 dark:text-sky-400">AI</span></span>
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-800/80 rounded font-bold uppercase tracking-wider">
            HEALTHCARE
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-semibold text-slate-500 dark:text-slate-400 mt-0.5 ${subtitleSizes[size]}`}>
            Hospital & Clinical Portal
          </span>
        )}
      </div>
    </div>
  );
};
