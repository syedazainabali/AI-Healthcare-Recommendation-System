import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Search,
  AlertTriangle,
  HeartPulse,
  Phone,
  Droplet,
  ShieldAlert,
  Activity,
  RefreshCw,
  X,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Stethoscope,
  Info,
  Clock,
  User,
  Zap,
} from 'lucide-react';
import { Patient } from '../../types';
import {
  searchCachedPatients,
  getCachedPatientTriageData,
  CriticalPatientTriageRecord,
  performOfflineTriageAssessment,
  OfflineTriageAssessment,
  setSimulatedOfflineMode,
  isSimulatedOfflineMode,
  cachePatientTriageData,
} from '../../utils/offlineTriageCache';

interface OfflineTriageBarProps {
  patients: Patient[];
  onSelectPatient?: (patientId: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const OfflineTriageBar: React.FC<OfflineTriageBarProps> = ({
  patients,
  onSelectPatient,
  onShowToast,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(isSimulatedOfflineMode());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<CriticalPatientTriageRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'lookup' | 'calculator' | 'guidelines' | 'status'>('lookup');
  const [cacheMeta, setCacheMeta] = useState(getCachedPatientTriageData().meta);

  // Rapid Triage Calculator State
  const [calcComplaint, setCalcComplaint] = useState<string>('Chest tightness and shortness of breath');
  const [calcSBP, setCalcSBP] = useState<number>(145);
  const [calcDBP, setCalcDBP] = useState<number>(92);
  const [calcHR, setCalcHR] = useState<number>(104);
  const [calcSpO2, setCalcSpO2] = useState<number>(93);
  const [calcRR, setCalcRR] = useState<number>(22);
  const [calcTemp, setCalcTemp] = useState<number>(99.2);
  const [triageAssessment, setTriageAssessment] = useState<OfflineTriageAssessment | null>(null);

  // Sync cache whenever patients prop changes
  useEffect(() => {
    if (patients && patients.length > 0) {
      cachePatientTriageData(patients);
      setCacheMeta(getCachedPatientTriageData().meta);
    }
  }, [patients]);

  // Network status listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (onShowToast) onShowToast('Network connection restored. MedAI connected.', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (onShowToast) onShowToast('⚡ Disconnected: Switched to offline patient triage cache mode.', 'warning');
    };

    const handleSimChange = (e: any) => {
      setIsSimulatedOffline(e.detail?.isSimulatedOffline ?? isSimulatedOfflineMode());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('medai-network-mode-change', handleSimChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('medai-network-mode-change', handleSimChange);
    };
  }, [onShowToast]);

  const effectiveOffline = !isOnline || isSimulatedOffline;

  // Run initial calculator triage assessment
  useEffect(() => {
    const assessment = performOfflineTriageAssessment(
      {
        bloodPressureSystolic: calcSBP,
        bloodPressureDiastolic: calcDBP,
        heartRate: calcHR,
        oxygenSaturation: calcSpO2,
        respiratoryRate: calcRR,
        temperature: calcTemp,
      },
      calcComplaint
    );
    setTriageAssessment(assessment);
  }, [calcComplaint, calcSBP, calcDBP, calcHR, calcSpO2, calcRR, calcTemp]);

  const handleToggleSimulation = () => {
    const nextState = !isSimulatedOffline;
    setSimulatedOfflineMode(nextState);
    setIsSimulatedOffline(nextState);
    if (onShowToast) {
      onShowToast(
        nextState
          ? '⚡ Simulated Offline Mode Enabled. Testing triage cache with zero internet.'
          : '🌐 Simulated Offline Mode Disabled. Reconnected to live services.',
        nextState ? 'warning' : 'info'
      );
    }
  };

  const handleManualSync = () => {
    if (patients && patients.length > 0) {
      cachePatientTriageData(patients);
      setCacheMeta(getCachedPatientTriageData().meta);
      if (onShowToast) onShowToast(`Successfully cached ${patients.length} patient triage dossiers offline.`, 'success');
    }
  };

  const cachedResults = searchCachedPatients(searchQuery);

  return (
    <>
      {/* 1. Persistent Banner when Offline or when Simulated Offline */}
      {effectiveOffline && (
        <div
          id="offline-triage-status-banner"
          className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md z-40 border-b border-amber-500/40 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1 bg-black/20 rounded-md backdrop-blur-xs flex-shrink-0">
              <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
            </span>
            <div className="min-w-0">
              <span className="font-extrabold tracking-wide uppercase text-[11px] bg-white/20 px-2 py-0.5 rounded-full mr-2">
                {isSimulatedOffline ? 'SIMULATED OFFLINE' : 'ZERO CONNECTIVITY'}
              </span>
              <span className="font-semibold text-amber-50">
                Offline Survival Mode Active — <strong>{cacheMeta.patientCount} Patient Triage Dossiers</strong> Cached in Service Worker Storage
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 bg-white text-slate-900 font-extrabold text-xs rounded-lg hover:bg-amber-50 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-rose-600" />
              <span>Offline Triage Lookup</span>
            </button>
            {isSimulatedOffline && (
              <button
                onClick={handleToggleSimulation}
                className="px-2.5 py-1 bg-black/30 hover:bg-black/40 text-amber-100 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Disable Simulation
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Floating Quick Trigger when online (Discrete bottom left pill) */}
      {!effectiveOffline && (
        <button
          onClick={() => setIsModalOpen(true)}
          id="offline-cache-trigger-pill"
          className="fixed bottom-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-slate-700/80 shadow-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer group"
          title="Open Offline Patient Triage & Service Worker Cache Manager"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px]">Offline Triage ({cacheMeta.patientCount} Ready)</span>
          <Zap className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* 3. Comprehensive Offline Triage & Patient Lookup Modal */}
      {isModalOpen && (
        <div
          id="offline-triage-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Offline Patient Triage & Local Cache Station
                    </h2>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        effectiveOffline
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {effectiveOffline ? 'OFFLINE CACHE ACTIVE' : 'ONLINE (CACHE SYNCED)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PMDC 5-Tier Triage, rapid MRN record lookup, and critical alerts with zero internet reliance.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSync}
                  className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Force re-sync offline cache"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={() => setActiveTab('lookup')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'lookup'
                    ? 'border-blue-600 text-blue-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cached Patient Lookup ({cachedResults.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'calculator'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>STAT Bedside Triage Calculator</span>
              </button>

              <button
                onClick={() => setActiveTab('guidelines')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'guidelines'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>PMDC Emergency Protocols</span>
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'status'
                    ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Network & Simulation</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 max-h-[calc(90vh-140px)]">
              {/* TAB 1: PATIENT LOOKUP */}
              {activeTab === 'lookup' && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type Patient Name, MRN (e.g., PK-MRN-1029), Blood Group, or CNIC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-sky-950 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Patient List (Left Column) */}
                    <div className="md:col-span-5 space-y-2 max-h-96 overflow-y-auto pr-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                        Cached Records ({cachedResults.length})
                      </div>
                      {cachedResults.length > 0 ? (
                        cachedResults.map((p) => {
                          const isSelected = selectedPatient?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => setSelectedPatient(p)}
                              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/90 dark:bg-sky-950/70 border-blue-300 dark:border-sky-700 shadow-xs'
                                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                    {p.fullName}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {p.mrn} • {p.age}y, {p.gender}
                                  </p>
                                </div>
                                <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold rounded-md flex-shrink-0">
                                  {p.bloodGroup}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[10px]">
                                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
                                  {p.primaryCondition}
                                </span>
                                <span
                                  className={`font-extrabold px-1.5 py-0.2 rounded text-[9px] ${
                                    p.riskLevel === 'High' || p.riskLevel === 'Critical'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : p.riskLevel === 'Moderate'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  }`}
                                >
                                  {p.riskLevel} Risk
                                </span>
                              </div>

                              {p.triageAlerts.length > 0 && (
                                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-rose-600 dark:text-rose-400 truncate">
                                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{p.triageAlerts[0]}</span>
                                </div>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                          No cached patients matching "{searchQuery}".
                        </div>
                      )}
                    </div>

                    {/* Selected Patient Details Dossier (Right Column) */}
                    <div className="md:col-span-7">
                      {selectedPatient ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                          {/* Top Identity Row */}
                          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                  {selectedPatient.fullName}
                                </h3>
                                <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                  {selectedPatient.mrn}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {selectedPatient.gender} • {selectedPatient.age} Years • {selectedPatient.city} • CNIC: {selectedPatient.cnic || 'Verified'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white text-xs font-black rounded-xl">
                                <Droplet className="w-3.5 h-3.5 fill-current" />
                                <span>{selectedPatient.bloodGroup}</span>
                              </span>
                            </div>
                          </div>

                          {/* Critical Triage Red Flags */}
                          {selectedPatient.triageAlerts.length > 0 && (
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-xl space-y-1">
                              <div className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Critical Triage Alarms & Alerts</span>
                              </div>
                              <ul className="text-xs text-rose-900 dark:text-rose-200 list-disc list-inside space-y-0.5">
                                {selectedPatient.triageAlerts.map((alert, idx) => (
                                  <li key={idx} className="font-semibold">{alert}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Latest Vitals Matrix */}
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                              <span>Cached Baseline Vitals</span>
                              <span className="text-[9px] text-slate-400">
                                Recorded: {selectedPatient.latestVitals.recordedAt ? new Date(selectedPatient.latestVitals.recordedAt).toLocaleTimeString() : 'Recent'}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                                <span className="text-[9px] font-bold text-slate-400 block">BP</span>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                  {selectedPatient.latestVitals.bloodPressureSystolic}/{selectedPatient.latestVitals.bloodPressureDiastolic}
                                </span>
                              </div>
                              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                                <span className="text-[9px] font-bold text-slate-400 block">Pulse</span>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                  {selectedPatient.latestVitals.heartRate} <span className="text-[9px]">bpm</span>
                                </span>
                              </div>
                              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                                <span className="text-[9px] font-bold text-slate-400 block">SpO₂</span>
                                <span className="text-xs font-extrabold text-blue-600 dark:text-sky-400">
                                  {selectedPatient.latestVitals.oxygenSaturation}%
                                </span>
                              </div>
                              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                                <span className="text-[9px] font-bold text-slate-400 block">Temp</span>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                  {selectedPatient.latestVitals.temperature}°F
                                </span>
                              </div>
                              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center col-span-2 sm:col-span-1">
                                <span className="text-[9px] font-bold text-slate-400 block">Resp Rate</span>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                  {selectedPatient.latestVitals.respiratoryRate} /min
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Active Medications & Allergies Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Active Medications ({selectedPatient.activeMedications.length})
                              </span>
                              <div className="space-y-1 max-h-24 overflow-y-auto">
                                {selectedPatient.activeMedications.map((m, idx) => (
                                  <div key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                                    • {typeof m === 'string' ? m : `${m.name} (${m.dosage})`}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Emergency Kin Contact
                              </span>
                              <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                                {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relation})
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-sky-400 font-bold mt-1">
                                <Phone className="w-3 h-3" />
                                <span>{selectedPatient.emergencyContact.phone}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button: Open Full Record in App */}
                          {onSelectPatient && (
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => {
                                  onSelectPatient(selectedPatient.id);
                                  setIsModalOpen(false);
                                }}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <span>Open Full Clinical Dossier</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                          <User className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Select a cached patient from the list
                          </h4>
                          <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                            Instantly preview blood group, allergy warnings, vital signs telemetry, and emergency contacts offline.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RAPID BEDSIDE TRIAGE CALCULATOR */}
              {activeTab === 'calculator' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Calculator Inputs (Left) */}
                    <div className="lg:col-span-6 space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-rose-600" />
                          <span>Bedside Triage Parameters</span>
                        </h3>
                        <span className="text-[10px] text-slate-400">Offline Algorithmic ESI/PMDC</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Chief Clinical Complaint / Symptom Presentation
                        </label>
                        <input
                          type="text"
                          value={calcComplaint}
                          onChange={(e) => setCalcComplaint(e.target.value)}
                          placeholder="e.g. Severe chest pain radiating to left arm..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Systolic BP (mmHg)
                          </label>
                          <input
                            type="number"
                            value={calcSBP}
                            onChange={(e) => setCalcSBP(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Diastolic BP (mmHg)
                          </label>
                          <input
                            type="number"
                            value={calcDBP}
                            onChange={(e) => setCalcDBP(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Heart Rate (bpm)
                          </label>
                          <input
                            type="number"
                            value={calcHR}
                            onChange={(e) => setCalcHR(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            SpO₂ Saturation (%)
                          </label>
                          <input
                            type="number"
                            value={calcSpO2}
                            onChange={(e) => setCalcSpO2(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Resp Rate (/min)
                          </label>
                          <input
                            type="number"
                            value={calcRR}
                            onChange={(e) => setCalcRR(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Temperature (°F)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={calcTemp}
                            onChange={(e) => setCalcTemp(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Quick Clinical Presets
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCalcComplaint('Cardiac Arrest / Unresponsive');
                              setCalcSBP(60);
                              setCalcDBP(30);
                              setCalcHR(35);
                              setCalcSpO2(80);
                            }}
                            className="px-2 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-lg hover:bg-rose-200 transition-colors"
                          >
                            Level 1: STAT Resus
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCalcComplaint('Severe retrosternal chest pain with diaphoresis');
                              setCalcSBP(175);
                              setCalcDBP(105);
                              setCalcHR(118);
                              setCalcSpO2(91);
                            }}
                            className="px-2 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-lg hover:bg-rose-200 transition-colors"
                          >
                            Level 2: ACS / Chest Pain
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCalcComplaint('High grade dengue fever, retro-orbital headache, platelet drop');
                              setCalcSBP(110);
                              setCalcDBP(75);
                              setCalcHR(108);
                              setCalcSpO2(97);
                              setCalcTemp(103.2);
                            }}
                            className="px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-lg hover:bg-amber-200 transition-colors"
                          >
                            Level 3: Dengue / Febrile
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCalcComplaint('Routine follow-up blood pressure check and refill');
                              setCalcSBP(128);
                              setCalcDBP(82);
                              setCalcHR(74);
                              setCalcSpO2(98);
                              setCalcTemp(98.4);
                            }}
                            className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-lg hover:bg-emerald-200 transition-colors"
                          >
                            Level 5: Routine OPD
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Output (Right) */}
                    <div className="lg:col-span-6 space-y-3">
                      {triageAssessment && (
                        <div
                          className={`p-4 rounded-2xl border ${
                            triageAssessment.numericLevel <= 2
                              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                              : triageAssessment.numericLevel === 3
                              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                          } space-y-3`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                Assigned Triage Classification
                              </span>
                              <h3
                                className={`text-base font-black ${
                                  triageAssessment.numericLevel <= 2
                                    ? 'text-rose-700 dark:text-rose-300'
                                    : triageAssessment.numericLevel === 3
                                    ? 'text-amber-700 dark:text-amber-300'
                                    : 'text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {triageAssessment.triageLevel}
                              </h3>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-500 block">Target Door-to-Doctor</span>
                              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3 text-rose-500" />
                                {triageAssessment.targetResponseTime}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {triageAssessment.clinicalSummary}
                          </p>

                          {/* Immediate Actions Checklist */}
                          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Immediate Bedside Interventions</span>
                            </span>
                            <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                              {triageAssessment.immediateInterventions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Bedside Labs */}
                          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Recommended Stat Diagnostics</span>
                            </span>
                            <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                              {triageAssessment.recommendedBedsideTests.map((test, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-indigo-600 font-bold">•</span>
                                  <span>{test}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PMDC EMERGENCY PROTOCOLS */}
              {activeTab === 'guidelines' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-sky-950/40 border border-blue-200 dark:border-sky-800 rounded-xl text-xs text-blue-900 dark:text-sky-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      These 5 emergency triage tiers follow the Pakistan Medical & Dental Council (PMDC) and Emergency Severity Index (ESI) standards, pre-cached locally for uninterrupted hospital operations.
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        level: 'Level 1: Resuscitation (STAT)',
                        time: '0 min (Immediate)',
                        color: 'bg-rose-500 text-white',
                        desc: 'Cardiac/respiratory arrest, severe respiratory failure (SpO2 <85%), GCS <8, massive hemorrhage.',
                        action: 'Continuous CPR/Intubation, 15L O2, dual 16G IV access, stat consultant summon.',
                      },
                      {
                        level: 'Level 2: Emergent / High Acuity',
                        time: '< 10 minutes',
                        color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300',
                        desc: 'Chest pain (suspected ACS), acute stroke (<4.5h), severe asthma with wheezing, severe sepsis.',
                        action: '12-lead ECG in 10 mins, Troponin-I, IV access, O2 titration to 94%.',
                      },
                      {
                        level: 'Level 3: Urgent',
                        time: '< 30 minutes',
                        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300',
                        desc: 'Dengue fever with warning signs, uncontrolled hyperglycemia (>300 mg/dL), closed fractures.',
                        action: 'Capillary blood glucose, CBC / Platelets, IV fluid rehydration, vital observation.',
                      },
                      {
                        level: 'Level 4: Semi-Urgent',
                        time: '< 60 minutes',
                        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300',
                        desc: 'Mild febrile illness with stable vitals, simple lacerations, uncomplicated UTI.',
                        action: 'Oral antipyretic/analgesia, routine laboratory sampling, clinic queue.',
                      },
                      {
                        level: 'Level 5: Non-Urgent',
                        time: '< 120 minutes',
                        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300',
                        desc: 'Medication refills, routine dressing change, stable chronic medical review.',
                        action: 'Verify digital QR prescription on file, assign to routine OPD physician.',
                      },
                    ].map((tier, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${tier.color}`}>
                              {tier.level}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {tier.time}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">{tier.desc}</p>
                          <p className="text-[11px] text-blue-600 dark:text-sky-400 font-bold">
                            Action: {tier.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SYSTEM STATUS & OFFLINE SIMULATION */}
              {activeTab === 'status' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Service Worker & Cache Health Telemetry
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block">Service Worker Status</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">Active & Controlled</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block">Cached Patient Dossiers</span>
                        <span className="text-xs font-extrabold text-blue-600 dark:text-sky-400 mt-1 block">
                          {cacheMeta.patientCount} Records Ready
                        </span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block">Last Cache Sync</span>
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mt-1 block truncate">
                          {new Date(cacheMeta.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Offline Mode Simulator Switch */}
                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                        Simulate Disconnected Network (Field Test Mode)
                      </h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        Simulate zero-internet field conditions to evaluate offline search, PMDC triage algorithms, and cached records without disconnecting your actual Wi-Fi.
                      </p>
                    </div>

                    <button
                      onClick={handleToggleSimulation}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isSimulatedOffline
                          ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                          : 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'
                      }`}
                    >
                      {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                      <span>{isSimulatedOffline ? 'Disable Simulation' : 'Enable Offline Simulation'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>MedAI Service Worker v1.0.4 • Cache-First Triage</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Station
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
