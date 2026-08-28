import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Bell,
  Sparkles,
  Lock,
  Database,
  Globe2,
  Save,
  Server,
  Key,
  CheckCircle2,
  Fingerprint,
  Smartphone,
  Cpu,
  RefreshCw,
  Clock,
  History,
  ShieldAlert,
  SunMoon,
  Monitor,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  HardDrive,
  Activity,
} from 'lucide-react';
import {
  getBiometricConfig,
  saveBiometricConfig,
  getBiometricAuditLogs,
  detectPlatformAuthenticatorName,
  registerBiometricPasskey,
  BiometricSecurityConfig,
  BiometricAuditLog,
} from '../../utils/biometricAuth';
import {
  getCachedPatientTriageData,
  setSimulatedOfflineMode,
  isSimulatedOfflineMode,
} from '../../utils/offlineTriageCache';
import { ThemeToggle } from '../layout/ThemeToggle';
import { getSavedTheme } from '../../utils/theme';

interface SettingsViewProps {
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(85);
  const [enableDrugAlerts, setEnableDrugAlerts] = useState(true);
  const [enableVitalsMonitoring, setEnableVitalsMonitoring] = useState(true);
  const [enableSmsNotifications, setEnableSmsNotifications] = useState(true);
  const [regionalNode, setRegionalNode] = useState('PK-ISB-01 (Islamabad Core)');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  // Biometric Security States
  const [biometricConfig, setBiometricConfig] = useState<BiometricSecurityConfig>(getBiometricConfig());
  const [auditLogs, setAuditLogs] = useState<BiometricAuditLog[]>([]);
  const [platformName, setPlatformName] = useState('Platform Authenticator');
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  useEffect(() => {
    setPlatformName(detectPlatformAuthenticatorName());
    setAuditLogs(getBiometricAuditLogs());
  }, []);

  const handleToggleBiometric = (enabled: boolean) => {
    const updated = saveBiometricConfig({ enabled });
    setBiometricConfig(updated);
    onShowToast(
      'Biometric Security Updated',
      enabled
        ? 'Autentikasi biometrik WebAuthn diwajibkan untuk setiap akses rekam medis pasien.'
        : 'Autentikasi biometrik dinonaktifkan sementara untuk akses rekam medis.',
      enabled ? 'success' : 'info'
    );
  };

  const handleFrequencyChange = (frequency: 'ALWAYS' | 'GRACE_15_MIN') => {
    const updated = saveBiometricConfig({ frequency });
    setBiometricConfig(updated);
    onShowToast(
      'Frekuensi Verifikasi Diperbarui',
      frequency === 'ALWAYS'
        ? 'Verifikasi biometrik diwajibkan pada setiap kali membuka profil pasien.'
        : 'Sesi biometrik tetap terbuka selama 15 menit setelah verifikasi awal.',
      'info'
    );
  };

  const handleTestRegisterPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      const res = await registerBiometricPasskey({
        id: 'doc-101',
        name: 'Dr. Ahmed Khan',
        email: 'dr.ahmed.khan@medai.pk',
      });

      if (res.success) {
        setAuditLogs(getBiometricAuditLogs());
        onShowToast(
          'Biometric Passkey Registered',
          `Kredensial biometrik baru berhasil didaftarkan via ${res.method === 'webauthn' ? 'WebAuthn Native API' : 'Platform Biometric Simulator'}.`,
          'success'
        );
      }
    } catch {
      onShowToast('Pendaftaran Gagal', 'Tidak dapat mendaftarkan sensor biometrik saat ini.', 'error');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBiometricConfig(biometricConfig);
    onShowToast('Settings Saved', 'Konfigurasi keamanan sistem dan rekam medis klinis berhasil diperbarui.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-xs text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pengaturan Sistem & Tampilan Visual
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Konfigurasi tema tampilan (Light/Dark High Contrast), perlindungan rekam medis Protected Health Information (PHI), WebAuthn Credential Management API, dan tata kelola AI.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* NEW Section: Theme & Visual Display Mode */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 rounded-xl">
                <SunMoon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tampilan Visual & Mode Tema (High Contrast Dark Mode)
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Pilihan tema antarmuka klinis dengan palet kontras tinggi dan preservasi pola dot-matrix
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-sky-800 self-start sm:self-center">
              <Sparkles className="w-3.5 h-3.5" />
              Real-time Switch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                Pilih Mode Tampilan Aktif
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Mode gelap menggunakan token warna kontras tinggi (Deep Slate `#0B0F19` & `#0F172A`) dengan teks putih tajam untuk kenyamanan mata dokter saat jaga malam di ruang ICU/ER.
              </p>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Theme Toggle Switcher
              </span>
              <ThemeToggle variant="segmented" className="w-full justify-between" />
            </div>
          </div>
        </div>

        {/* Biometric Credential Management API (WebAuthn / PHI Access Control) */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 rounded-xl">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Keamanan Biometrik Rekam Medis (WebAuthn / Credential API)
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Verifikasi Touch ID, Face ID, atau sensor sidik jari sebelum membuka data pasien (PHI)
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Hardware Shield Aktif
            </span>
          </div>

          <div className="space-y-4">
            {/* Primary Toggle */}
            <div className="flex items-start sm:items-center justify-between gap-4 p-4 bg-blue-50/50 dark:bg-sky-950/30 rounded-2xl border border-blue-100 dark:border-sky-900/60">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white text-xs">
                  Wajibkan Autentikasi Biometrik Saat Mengakses Rekam Medis Pasien
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Mencegah akses rekam medis tanpa izin di stasiun kerja klinik atau perangkat dokter bersama.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={biometricConfig.enabled}
                  onChange={(e) => handleToggleBiometric(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Hardware Authenticator Detection & Registration Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F8FAFC] dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Hardware Authenticator
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-full">
                    Detected
                  </span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  {platformName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Mendukung Web Authentication (WebAuthn Level 3) dengan public-key cryptography (ES256).
                </p>
              </div>

              <div className="p-4 bg-[#F8FAFC] dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Daftarkan Kredensial Baru
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Uji coba pendaftaran passkey biometrik baru untuk profil dokter ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestRegisterPasskey}
                  disabled={isRegisteringPasskey}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-sky-500 text-blue-700 dark:text-sky-300 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  <span>{isRegisteringPasskey ? 'Mendaftarkan...' : 'Uji Pendaftaran Biometrik'}</span>
                </button>
              </div>
            </div>

            {/* Verification Frequency & PIN Fallback */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Frekuensi Verifikasi Biometrik:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      checked={biometricConfig.frequency === 'ALWAYS'}
                      onChange={() => handleFrequencyChange('ALWAYS')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Setiap Akses Rekam Medis (Rekomendasi)</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Meminta sidik jari setiap kali membuka modal pasien</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      checked={biometricConfig.frequency === 'GRACE_15_MIN'}
                      onChange={() => handleFrequencyChange('GRACE_15_MIN')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Grace Period 15 Menit</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Verifikasi berlaku selama 15 menit sesi klinis aktif</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  PIN Supervisor Medis Darurat:
                </label>
                <div className="p-3 bg-[#F8FAFC] dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">PIN Bypass Default:</span>
                    <span className="font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-blue-700 dark:text-sky-300">
                      1122
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Digunakan saat sensor biometrik perangkat gagal atau dokter sedang mengenakan sarung tangan bedah.
                  </p>
                </div>
              </div>
            </div>

            {/* Biometric Security Audit Trail Log Table */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <span className="font-bold text-slate-900 dark:text-white">Log Audit Verifikasi Biometrik Terakhir</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditLogs(getBiometricAuditLogs())}
                  className="text-blue-600 dark:text-sky-400 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Segarkan
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">WAKTU</th>
                      <th className="py-2.5 px-3">PASIEN / MRN</th>
                      <th className="py-2.5 px-3">METODE AUTH</th>
                      <th className="py-2.5 px-3">STATUS</th>
                      <th className="py-2.5 px-3">CHALLENGE HASH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditLogs.slice(0, 4).map((log) => (
                      <tr key={log.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                        <td className="py-2 px-3">
                          <p className="font-bold text-slate-900 dark:text-white text-[11px]">{log.patientName}</p>
                          <p className="text-[10px] text-blue-600 dark:text-sky-400 font-mono">{log.mrn}</p>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-300">{log.authenticatorUsed}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                          {log.challengeHash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: AI Clinical Engine Governance */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            AI Decision Support Parameters (Gemini 3.7 Flash)
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  Minimum AI Confidence Threshold for Clinical Alerts:
                </label>
                <span className="font-bold text-blue-700 dark:text-sky-300 text-sm bg-blue-50 dark:bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-sky-800">
                  {aiConfidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                value={aiConfidenceThreshold}
                onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Recommendations with confidence lower than this threshold will be flagged as exploratory research.
              </p>
            </div>

            <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Automatic Pharmacological Interaction Checking</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Run live AI checks on every prescription before signing</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableDrugAlerts}
                  onChange={(e) => setEnableDrugAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Automated Patient Vitals Deterioration Alerts</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Notify physician when BP or glucose deviates from baseline</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableVitalsMonitoring}
                  onChange={(e) => setEnableVitalsMonitoring(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Regional Health Gateway Connectivity */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Globe2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Konektivitas Gateway Rumah Sakit & EHR Nasional
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Active Regional Node</label>
              <select
                value={regionalNode}
                onChange={(e) => setRegionalNode(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              >
                <option value="PK-ISB-01 (Islamabad Core)">PK-ISB-01 (Islamabad Core Node)</option>
                <option value="PK-LHR-02 (Punjab Central)">PK-LHR-02 (Punjab Central Node)</option>
                <option value="PK-KHI-03 (Sindh Coastal)">PK-KHI-03 (Sindh Coastal Node)</option>
                <option value="PK-PEW-04 (KPK Frontier)">PK-PEW-04 (KPK Frontier Node)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">HL7 / FHIR Standard Compliance</label>
              <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold">FHIR R4 / PMDC Interoperable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Service Worker & Offline Patient Triage Resilience */}
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Service Worker Offline Cache & Emergency Triage Mode</span>
            </h3>
            <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              PWA Service Worker Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cache Architecture</span>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs">Cache-First & Stale-While-Revalidate</p>
              <p className="text-[10px] text-slate-500">Pre-caches app shell + /api/patients/critical-triage</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cached Patient Dossiers</span>
              <p className="font-extrabold text-blue-600 dark:text-sky-400 text-xs">
                {getCachedPatientTriageData().meta.patientCount} Records Cached
              </p>
              <p className="text-[10px] text-slate-500">Instant offline search by MRN or Name</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Triage Engine Fallback</span>
              <p className="font-extrabold text-rose-600 dark:text-rose-400 text-xs">PMDC 5-Tier Algorithm</p>
              <p className="text-[10px] text-slate-500">Autonomous bedside level 1-5 triage calculation</p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                Simulate Disconnected Network (Field Test)
              </span>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Test how the triage workflow performs in disconnected field clinic conditions without disabling your Wi-Fi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const cur = isSimulatedOfflineMode();
                setSimulatedOfflineMode(!cur);
                onShowToast(
                  !cur ? 'Offline Simulation Enabled' : 'Offline Simulation Disabled',
                  !cur ? 'Switched to local offline triage cache mode.' : 'Reconnected to live network.',
                  !cur ? 'warning' : 'info'
                );
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
            >
              {isSimulatedOfflineMode() ? 'Disable Offline Test' : 'Test Offline Mode'}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all text-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Konfigurasi Sistem</span>
          </button>
        </div>
      </form>
    </div>
  );
};

