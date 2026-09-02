import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  History,
  CalendarClock,
  FileCheck2,
  Pill,
  Stethoscope,
  Building2,
  Bell,
  User,
  Settings,
  Globe,
  LogOut,
  X,
  ChevronLeft,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile } from '../../types';
import { ThemeToggle } from './ThemeToggle';

export type NavSection =
  | 'dashboard'
  | 'ai-recommendations'
  | 'patients'
  | 'medical-history'
  | 'appointments'
  | 'reports'
  | 'prescriptions'
  | 'doctors'
  | 'network'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'public-landing';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  currentUser?: UserProfile;
  pendingAICount: number;
  unreadNotifsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onToggleSidebar: () => void;
  isSidebarDesktopOpen: boolean;
  onOpenLanding: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  currentUser = {
    id: 'doc-101',
    name: 'Dr. Ahmed Khan',
    email: 'dr.ahmed.khan@medai.pk',
    role: 'Doctor',
    title: 'Consultant Interventional Cardiologist',
    specialty: 'Cardiology & Internal Medicine',
    pmdcNumber: 'PMC-34982-P',
    hospital: 'Islamabad Federal Medical Complex',
    city: 'Islamabad',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    phone: '+92 300 8492011',
  },
  pendingAICount,
  unreadNotifsCount,
  isOpenMobile,
  onCloseMobile,
  onToggleSidebar,
  isSidebarDesktopOpen,
  onOpenLanding,
  onSignOut,
}) => {
  const mainNavItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }> = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: <Users className="w-4 h-4" />,
      },
      {
        id: 'medical-history',
        label: 'Medical History',
        icon: <History className="w-4 h-4" />,
      },
      {
        id: 'ai-recommendations',
        label: 'AI Recommendations',
        icon: <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        badge: pendingAICount,
        badgeColor: 'bg-indigo-600 text-white font-bold',
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <FileCheck2 className="w-4 h-4" />,
      },
      {
        id: 'prescriptions',
        label: 'Prescriptions',
        icon: <Pill className="w-4 h-4" />,
      },
      {
        id: 'appointments',
        label: 'Appointments',
        icon: <CalendarClock className="w-4 h-4" />,
      },
      {
        id: 'doctors',
        label: 'Doctors Directory',
        icon: <Stethoscope className="w-4 h-4" />,
      },
      {
        id: 'network',
        label: 'Hospital Network',
        icon: <Building2 className="w-4 h-4" />,
      },
    ];

  const secondaryNavItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ReactNode;
  }> = [
      {
        id: 'notifications',
        label: 'Notifications & Alerts',
        icon: (
          <div className="relative">
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </div>
        ),
      },
      {
        id: 'profile',
        label: 'Doctor Profile',
        icon: <User className="w-4 h-4" />,
      },
      {
        id: 'settings',
        label: 'System Settings',
        icon: <Settings className="w-4 h-4" />,
      },
    ];

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out no-print ${isOpenMobile
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full'
          } ${isSidebarDesktopOpen
            ? 'lg:translate-x-0'
            : 'lg:-translate-x-full'
          }`}
      >
        {/* Sidebar Header with Logo */}
        {/* Sidebar Header with Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 flex-shrink-0 bg-white dark:bg-[#0F172A]">
          <Logo />

          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items scroll area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Clinical & Patient Navigation */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                Clinical Workflow
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${isActive
                      ? 'bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 font-extrabold shadow-xs border border-blue-100 dark:border-sky-800/80'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-blue-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-blue-100 text-blue-700'}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Account & Administration */}
          <div>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                Settings & Portal
              </span>
            </div>

            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${isActive
                      ? 'bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 font-extrabold shadow-xs border border-blue-100 dark:border-sky-800/80'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/60'
                      }`}
                  >
                    <span className={isActive ? 'text-blue-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* View Public Portal / Landing */}
              <button
                onClick={onOpenLanding}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-all duration-150 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Hospital Web Portal</span>
              </button>
            </nav>
          </div>

          {/* Theme Quick Selector in Sidebar */}
          <div className="px-3 pt-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 block mb-2">
              Appearance
            </span>
            <ThemeToggle variant="segmented" className="w-full justify-between" />
          </div>
        </div>

        {/* Bottom User Mini-Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0B0F19] flex-shrink-0">
          <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                alt={currentUser?.name || 'User'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-blue-100 dark:border-sky-500/50"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Dr. Ahmed Khan'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.specialty || currentUser?.role || 'Physician'}
                </p>
              </div>
            </div>

            <button
              onClick={onSignOut}
              title="Sign Out / Switch Profile"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

