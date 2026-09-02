import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  PhoneCall,
  Plus,
  ChevronDown,
  User,
  Shield,
  Clock,
  Menu,
  Activity,
  FileText,
  Calendar,
  Building,
  Globe,
  LayoutDashboard,
  Users,
  History,
  FileCheck2,
  Pill,
  CalendarClock,
  Radio,
} from 'lucide-react';
import { UserProfile, NotificationItem, Patient, Doctor } from '../../types';
import { NavSection } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentSection: NavSection;
  currentUser?: UserProfile;
  notifications: NotificationItem[];
  patients: Patient[];
  doctors: Doctor[];
  onOpenMobileMenu: () => void;
  onSelectSection: (section: NavSection) => void;
  onSelectPatient: (patientId: string) => void;
  onSelectDoctor: (doctorId: string) => void;
  onOpenAddPatient: () => void;
  onOpenBookAppointment: () => void;
  onOpenAICaseInvestigator: () => void;
  onOpenEmergencyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
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
  notifications,
  patients,
  doctors,
  onOpenMobileMenu,
  onSelectSection,
  onSelectPatient,
  onSelectDoctor,
  onOpenAddPatient,
  onOpenBookAppointment,
  onOpenAICaseInvestigator,
  onOpenEmergencyModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const sectionTitles: Record<NavSection, { title: string; subtitle: string; code: string }> = {
    dashboard: { title: 'Clinical Dashboard', subtitle: 'Live Patient Vitals Telemetry & Risk Surveillance', code: 'DASH' },
    patients: { title: 'Patient Records (EHR)', subtitle: 'Electronic Health Records & Longitudinal Profiles', code: 'EHR' },
    'medical-history': { title: 'Medical History', subtitle: 'Chronological Clinical Encounters & Interventions', code: 'HIST' },
    'ai-recommendations': { title: 'AI Recommendations & CDSS', subtitle: 'Clinical Decision Support System & Risk Scoring', code: 'AI-CDSS' },
    reports: { title: 'Diagnostic Lab Reports', subtitle: 'LIS / RIS Pathology, Radiology & Imaging Diagnostics', code: 'LABS' },
    prescriptions: { title: 'E-Prescriptions', subtitle: 'Electronic Prescribing & Adverse Drug Interaction Engine', code: 'RX' },
    appointments: { title: 'Outpatient Appointments', subtitle: 'OPD Queue Management & Clinic Schedule', code: 'APPT' },
    doctors: { title: 'Doctors Directory', subtitle: 'Physician Registry & Medical Specialists', code: 'DOCS' },
    network: { title: 'Hospital Network', subtitle: 'Bed Availability & Emergency Response Coordination', code: 'NET' },
    notifications: { title: 'Clinical Notifications', subtitle: 'Urgent Alerts & Real-time System Updates', code: 'ALRT' },
    profile: { title: 'Doctor Profile', subtitle: 'Credentials, PMDC Registration & Affiliations', code: 'PROF' },
    settings: { title: 'System Settings', subtitle: 'Access Controls & Clinical Configuration', code: 'SETT' },
    'public-landing': { title: 'Hospital Public Portal', subtitle: 'Public Patient Portal & Medical Services', code: 'PORTAL' },
  };

  const currentInfo = sectionTitles[currentSection] || {
    title: 'MedAI Clinical OS',
    subtitle: 'Integrated AI Hospital & Clinical Workstation',
    code: 'SYS',
  };

  const topNavTabs: Array<{ id: NavSection; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'patients', label: 'Patients', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'medical-history', label: 'Medical History', icon: <History className="w-3.5 h-3.5" /> },
    {
      id: 'ai-recommendations',
      label: 'AI Recommendations',
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
      badge: 'AI',
      badgeColor: 'bg-indigo-600 text-white',
    },
    { id: 'reports', label: 'Reports', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <Pill className="w-3.5 h-3.5" /> },
    { id: 'appointments', label: 'Appointments', icon: <CalendarClock className="w-3.5 h-3.5" /> },
  ];

  // Filter search results
  const filteredPatients = searchQuery.trim()
    ? (patients || []).filter(
        (p) =>
          (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.mrn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.phone || '').includes(searchQuery) ||
          (p.city || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredDoctors = searchQuery.trim()
    ? (doctors || []).filter(
        (d) =>
          (d.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.city || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 lg:px-6 py-2.5 flex flex-col gap-2 no-print text-slate-800 dark:text-slate-200 shadow-xs transition-colors">
      {/* Top Row: Page Title + Nav Tabs + Actions */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        {/* Left side: Hamburger & Page Identifier */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/80 border border-blue-200 dark:border-sky-800/80 px-1.5 py-0.5 rounded">
                {currentInfo.code}
              </span>
              <h1 className="text-sm lg:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                {currentInfo.title}
              </h1>
            </div>
            <p className="hidden md:block text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Top Navigation Bar (Visible on lg and xl screens) */}
        <nav className="hidden 2xl:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
          {topNavTabs.map((tab) => {
            const isActive = currentSection === tab.id;
            return (
              <button
                key={tab.id}
                id={`top-nav-tab-${tab.id}`}
                onClick={() => onSelectSection(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-sky-400 font-extrabold shadow-xs border border-blue-200/60 dark:border-sky-500/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-white/60 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className={isActive ? 'text-blue-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Omni-Search & Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live Telemetry Broadcast Quick Indicator */}
          <button
            onClick={() => onSelectSection('dashboard')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800/80 transition-all cursor-pointer"
            title="Live Vitals Broadcast Telemetry Active"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider">Live Broadcast</span>
          </button>

          {/* Global Search Bar */}
          <div ref={searchRef} className="relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search patient, MRN, doctor..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-40 lg:w-56 pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-blue-100 dark:focus:ring-sky-950 transition-all"
              />
            </div>

            {/* Search Dropdown Results */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-2 w-80 lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 space-y-3 z-50 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div>
                  <div className="flex justify-between items-center px-2 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Registered Patients ({filteredPatients.length})
                    </span>
                  </div>
                  {filteredPatients.length > 0 ? (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectPatient(p.id);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{p.fullName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.mrn} • {p.city}</p>
                          </div>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-blue-100 dark:bg-sky-950 text-blue-700 dark:text-sky-300 rounded-full">
                            {p.gender}, {p.age}y
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 p-2 italic">No patients found matching query.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center px-2 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Specialist Doctors ({filteredDoctors.length})
                    </span>
                  </div>
                  {filteredDoctors.length > 0 ? (
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {filteredDoctors.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            onSelectDoctor(d.id);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{d.fullName}</p>
                            <p className="text-[10px] text-blue-600 dark:text-sky-400 font-medium">{d.specialty} • {d.city}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 p-2 italic">No specialists found.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Case Triage Quick Button */}
          <button
            onClick={onOpenAICaseInvestigator}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200/80 dark:border-indigo-800 transition-all cursor-pointer"
            title="AI Clinical Decision Support Case Investigator"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">AI CDSS</span>
          </button>

          {/* Emergency Triage Quick Button */}
          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
            title="Emergency Triage & ER 24/7"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">ER 24/7</span>
          </button>

          {/* Public Portal Switcher */}
          <button
            onClick={() => onSelectSection('public-landing')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Open Hospital Public Portal"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span className="hidden lg:inline">Public Portal</span>
          </button>

          {/* Dedicated Theme Toggle Control */}
          <ThemeToggle variant="icon" />

          {/* Quick Action Add Dropdown */}
          <div ref={quickActionRef} className="relative">
            <button
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Record</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isQuickActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 z-50 shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    onOpenAddPatient();
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <span>New Patient Registration</span>
                </button>

                <button
                  onClick={() => {
                    onOpenBookAppointment();
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <span>Book OPD Appointment</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAICaseInvestigator();
                    setIsQuickActionsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>AI Case Investigator</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Icon Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 z-50 shadow-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Clinical Notifications ({unreadCount} New)
                  </span>
                  <button
                    onClick={() => {
                      onSelectSection('notifications');
                      setIsNotifDropdownOpen(false);
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                        n.isRead
                          ? 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                          : 'bg-blue-50/60 dark:bg-sky-950/40 border-blue-100 dark:border-sky-800/60 text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-blue-700 dark:text-sky-400">{n.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{n.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Mini Profile Badge */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <div className="hidden 2xl:block text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[120px]">
                  {currentUser?.name || 'Dr. Ahmed Khan'}
                </p>
                <p className="text-[9px] text-blue-600 dark:text-sky-400 font-semibold leading-none mt-1">
                  {currentUser?.role || 'Doctor'}
                </p>
              </div>
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                alt={currentUser?.name || 'User'}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-blue-200 dark:border-sky-500"
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 z-50 shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                </div>
                <button
                  onClick={() => {
                    onSelectSection('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <span>Doctor Credentials & STR</span>
                </button>
                <button
                  onClick={() => {
                    onSelectSection('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <span>System Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Horizontal Navigation Bar for md and lg screens (so it never looks empty) */}
      <div className="flex 2xl:hidden items-center gap-1 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800">
        {topNavTabs.map((tab) => {
          const isActive = currentSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectSection(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs dark:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded ${isActive ? 'bg-white text-blue-700 dark:bg-slate-900 dark:text-sky-400' : tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};


