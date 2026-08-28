import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck2,
  FileCheck2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Clock,
  ChevronRight,
  AlertCircle,
  Stethoscope,
  Activity,
  PhoneCall,
  UserPlus,
  CalendarPlus,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Radio,
  HeartPulse,
  Syringe,
  Pill,
  ExternalLink,
  Zap,
  Play,
  Volume2,
} from 'lucide-react';
import {
  Patient,
  Doctor,
  Appointment,
  AIRecommendation,
  UserProfile,
} from '../../types';
import { NavSection } from '../layout/Sidebar';

interface DashboardViewProps {
  currentUser?: UserProfile;
  patients: Patient[];
  doctors?: Doctor[];
  appointments: Appointment[];
  aiRecommendations: AIRecommendation[];
  onNavigate?: (section: NavSection) => void;
  onSelectSection?: (section: NavSection) => void;
  onSelectPatient: (patientId: string) => void;
  onSelectAIRecommendation?: (recId: string) => void;
  onOpenAddPatient: () => void;
  onOpenBookAppointment?: () => void;
  onOpenAICaseInvestigator: () => void;
  onOpenEmergencyModal?: () => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  patients = [],
  doctors = [],
  appointments = [],
  aiRecommendations = [],
  onNavigate,
  onSelectSection,
  onSelectPatient,
  onSelectAIRecommendation,
  onOpenAddPatient,
  onOpenBookAppointment,
  onOpenAICaseInvestigator,
  onOpenEmergencyModal = () => {},
  onShowToast = () => {},
}) => {
  const [appointmentFilter, setAppointmentFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Completed'>('All');
  
  // Real-time telemetry simulation
  const [telemetryPatient, setTelemetryPatient] = useState({
    name: 'Muhammad Usman (ICU Bed 04)',
    hr: 78,
    spo2: 98,
    bp: '142/92',
    rr: 16,
    rhythm: 'Sinus Rhythm',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryPatient((prev) => ({
        ...prev,
        hr: 76 + Math.floor(Math.random() * 6),
        spo2: 97 + Math.floor(Math.random() * 3),
        rr: 15 + Math.floor(Math.random() * 3),
      }));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const nav = onNavigate || onSelectSection || (() => {});
  const user: UserProfile = currentUser || {
    id: 'doc-101',
    name: 'Dr. Ahmed Khan',
    email: 'dr.ahmed.khan@medai.pk',
    role: 'Doctor',
    title: 'Chief Interventional Cardiologist',
    specialty: 'Cardiology & Internal Medicine',
    pmdcNumber: 'PMC-34982-P',
    hospital: 'Webtixa Healthcare & Medical Complex',
    city: 'Islamabad',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    phone: '+92 300 8492011',
  };

  const pendingRecommendations = aiRecommendations.filter((r) => r.status === 'Action Required' || r.status === 'Pending Review');
  const highRiskRecs = pendingRecommendations.filter((r) => r.urgency === 'High');

  const filteredAppointments = appointmentFilter === 'All'
    ? appointments
    : appointments.filter((a) => a.status === appointmentFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-800">
      {/* 1. Doctor Command Header with Status Badges */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400 shadow-md flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[11px] font-bold text-emerald-300">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <span>ON CLINICAL DUTY • OPD & CATH LAB</span>
                </span>
                <span className="px-2.5 py-0.5 bg-blue-900/60 border border-blue-700/60 text-blue-200 text-[10px] font-mono rounded-md">
                  PMDC: {user.pmdcNumber || 'PMC-34982-P'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {user.title} • {user.hospital}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAICaseInvestigator}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>AI Case Investigator</span>
            </button>

            <button
              onClick={() => nav('ai-recommendations')}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              <span>Review AI Alerts ({pendingRecommendations.length})</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE BROADCAST & ICU/ER TELEMETRY STREAM PANEL */}
      <div className="bg-gradient-to-r from-[#071328] via-[#0A1E3F] to-[#071328] text-white rounded-3xl p-5 sm:p-6 border border-blue-900/80 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                  LIVE HOSPITAL TELEMETRY & BROADCAST
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Connected Beds: ICU-4, ER Trauma-1, CCU-2 • Code Blue Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Broadcast Emergency (IGD/1122)</span>
            </button>
          </div>
        </div>

        {/* Live Vitals Waveform Strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 items-center">
          {/* Patient Details & Waveform */}
          <div className="md:col-span-8 bg-slate-900/80 rounded-2xl p-4 border border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                LEAD II • ECG NORMAL SINUS
              </span>
              <h4 className="text-sm font-bold text-white">{telemetryPatient.name}</h4>
              <p className="text-xs text-slate-400">Post-Percutaneous Coronary Intervention (PCI)</p>
            </div>

            {/* Dynamic ECG Waveform SVG */}
            <div className="flex items-center gap-2 text-emerald-400">
              <svg className="w-48 h-10 overflow-visible" viewBox="0 0 150 40">
                <path
                  d="M0 20 H30 L35 8 L42 34 L48 12 L54 24 L60 20 H90 L95 8 L102 34 L108 12 L114 24 L120 20 H150"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* Telemetry Numbers */}
          <div className="md:col-span-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-blue-900/50">
              <span className="text-[10px] font-bold text-slate-400 block">HEART RATE</span>
              <span className="text-lg font-black text-emerald-400">{telemetryPatient.hr}</span>
              <span className="text-[9px] text-slate-500 block">BPM</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-blue-900/50">
              <span className="text-[10px] font-bold text-slate-400 block">SpO2</span>
              <span className="text-lg font-black text-cyan-400">{telemetryPatient.spo2}%</span>
              <span className="text-[9px] text-slate-500 block">Room Air</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-blue-900/50">
              <span className="text-[10px] font-bold text-slate-400 block">BP NIBP</span>
              <span className="text-base font-black text-amber-400">{telemetryPatient.bp}</span>
              <span className="text-[9px] text-slate-500 block">mmHg</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Four Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Patients */}
        <div
          onClick={() => nav('patients')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +14% This Month
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{patients.length}</p>
          <p className="text-xs font-bold text-slate-600 mt-1">Active Patient Records</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Centralized Electronic Health Records</p>
        </div>

        {/* Card 2: Today's Appointments */}
        <div
          onClick={() => nav('appointments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {appointments.filter((a) => a.status === 'Confirmed').length} Confirmed
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{appointments.length}</p>
          <p className="text-xs font-bold text-slate-600 mt-1">OPD Clinic Schedule</p>
          <p className="text-[11px] text-slate-400 mt-0.5">In-Person & Telehealth Visits</p>
        </div>

        {/* Card 3: Lab & Diagnostic Reports */}
        <div
          onClick={() => nav('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              3 Require Doctor Sign-off
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">16</p>
          <p className="text-xs font-bold text-slate-600 mt-1">Diagnostic & Lab Reports</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Biochemistry, CBC, MRI & CT Scans</p>
        </div>

        {/* Card 4: AI Recommendations */}
        <div
          onClick={() => nav('ai-recommendations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {highRiskRecs.length} High Urgency
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{aiRecommendations.length}</p>
          <p className="text-xs font-bold text-slate-600 mt-1">AI Clinical Recommendations</p>
          <p className="text-[11px] text-slate-400 mt-0.5">96.2% Clinical Confidence Score</p>
        </div>
      </div>

      {/* 4. Priority AI Clinical Decision Support Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-white border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-indigo-700 uppercase tracking-wide">
                  AI CLINICAL DECISION SUPPORT (CDSS)
                </span>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Critical Evaluation Required
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Muhammad Usman • Stage 2 Hypertension Alert & Potential Drug Interaction
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                Recent vital history indicates persistent elevated BP (148/94 mmHg) and concurrent prescription of Clopidogrel + Omeprazole. The AI CDSS suggests switching to Pantoprazole and titrating ACE-Inhibitor dosage according to ACC/AHA guidelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => nav('ai-recommendations')}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer hover:scale-105"
            >
              <span>Review Clinical Rationale</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main 2-Column Section: Today's Appointments & Rapid Doctor Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Appointments */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Today's Consultation Schedule
                </h3>
              </div>
              <p className="text-xs text-slate-500">Live OPD Queue & Patient Triage</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs self-start">
              {(['All', 'Confirmed', 'Pending'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAppointmentFilter(tab)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    appointmentFilter === tab
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'All' ? 'All Queue' : tab === 'Confirmed' ? 'Confirmed' : 'Pending'}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {filteredAppointments.slice(0, 4).map((apt) => {
              const statusBadges: Record<string, string> = {
                Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                Completed: 'bg-blue-50 text-blue-700 border-blue-200',
                Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
                'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
              };

              return (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 text-blue-700 flex flex-col items-center justify-center font-black text-xs shadow-xs flex-shrink-0">
                      <span>{apt.timeSlot.split(' ')[0]}</span>
                      <span className="text-[9px] text-slate-400 font-normal">{apt.timeSlot.split(' ')[1] || 'AM'}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onSelectPatient(apt.patientId)}
                          className="font-black text-sm text-slate-900 hover:text-blue-600 text-left truncate cursor-pointer"
                        >
                          {apt.patientName}
                        </button>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            statusBadges[apt.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {apt.appointmentType} • {apt.doctorName}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-1 italic mt-0.5">
                        "{apt.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onSelectPatient(apt.patientId)}
                      className="px-3.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Open EHR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <span className="text-xs text-slate-400">Showing {Math.min(4, filteredAppointments.length)} of {filteredAppointments.length} scheduled</span>
            <button
              onClick={() => nav('appointments')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Clinical Calendar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Rapid Doctor Actions & Emergency */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Doctor Workstation Actions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-3 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              Doctor Rapid Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onOpenAddPatient}
                className="flex flex-col items-start p-3.5 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
              >
                <UserPlus className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-900">New Patient</span>
                <span className="text-[10px] text-slate-400">Register EMR Record</span>
              </button>

              <button
                onClick={onOpenBookAppointment}
                className="flex flex-col items-start p-3.5 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
              >
                <CalendarPlus className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-900">Book OPD Visit</span>
                <span className="text-[10px] text-slate-400">Schedule Consultation</span>
              </button>

              <button
                onClick={() => nav('prescriptions')}
                className="flex flex-col items-start p-3.5 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
              >
                <FileSpreadsheet className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-900">E-Prescription</span>
                <span className="text-[10px] text-slate-400">Write Digital Rx</span>
              </button>

              <button
                onClick={onOpenAICaseInvestigator}
                className="flex flex-col items-start p-3.5 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-200 hover:border-indigo-300 text-left transition-all cursor-pointer group"
              >
                <Sparkles className="w-5 h-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-900">AI Investigator</span>
                <span className="text-[10px] text-slate-400">Differential Diagnosis</span>
              </button>
            </div>
          </div>

          {/* 24/7 Trauma & Emergency Triage Box */}
          <div className="bg-rose-50/80 border border-rose-200 rounded-3xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-rose-700">
                <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
                24/7 Trauma & Emergency Resuscitation
              </span>
              <span className="text-[10px] font-bold bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                CODE RED ACTIVE
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">Helpline: 1122 / (051) 920-1122</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct wireless telemetry with ambulances, blood transfusion inventory, and emergency catheterization laboratory.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Active Patients Census Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Recent Patient Admissions & Consultations
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Active records across Cardiology, Neurology, Pediatrics, and Internal Medicine
            </p>
          </div>

          <button
            onClick={() => nav('patients')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Patients ({patients.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
              <tr>
                <th className="py-3 px-3">PATIENT</th>
                <th className="py-3 px-3">MRN #</th>
                <th className="py-3 px-3">AGE / GENDER</th>
                <th className="py-3 px-3">BLOOD GROUP</th>
                <th className="py-3 px-3">PRIMARY CONDITION</th>
                <th className="py-3 px-3">PREDICTIVE RISK</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.slice(0, 5).map((p) => {
                const riskBadges: Record<string, string> = {
                  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  Moderate: 'bg-blue-50 text-blue-700 border-blue-200',
                  Elevated: 'bg-amber-50 text-amber-700 border-amber-200',
                  High: 'bg-rose-50 text-rose-700 border-rose-200',
                };

                return (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                          alt={p.fullName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{p.fullName}</p>
                          <p className="text-[10px] text-slate-400">{p.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-bold text-blue-700">{p.mrn}</td>
                    <td className="py-3 px-3 text-slate-600">{p.age} yrs • {p.gender}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{p.bloodGroup}</td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-700 font-medium">
                      {p.primaryCondition}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${riskBadges[p.riskLevel] || 'bg-slate-100 text-slate-600'}`}>
                        {p.riskLevel} Risk
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.status}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectPatient(p.id)}
                        className="px-3.5 py-1.5 bg-white hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-600 transition-all cursor-pointer shadow-xs"
                      >
                        View EHR
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
