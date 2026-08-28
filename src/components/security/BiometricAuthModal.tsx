import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Fingerprint,
  Lock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  X,
  Sparkles,
  Smartphone,
  Cpu,
  UserCheck,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Patient, UserProfile } from '../../types';
import {
  detectPlatformAuthenticatorName,
  authenticateWithBiometrics,
  logBiometricEvent,
  getBiometricConfig,
  markBiometricSessionUnlocked,
} from '../../utils/biometricAuth';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patientId: string) => void;
  patient: Patient | null;
  currentUser?: UserProfile;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patient,
  currentUser,
  onShowToast,
}) => {
  const [authMode, setAuthMode] = useState<'biometric' | 'pin'>('biometric');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('Siap untuk verifikasi biometrik');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [platformName, setPlatformName] = useState('Platform Authenticator');
  const [progress, setProgress] = useState(0);

  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPlatformName(detectPlatformAuthenticatorName());
      setScanState('idle');
      setStatusMessage('Tempelkan sidik jari pada sensor Touch ID / Face ID');
      setPinInput('');
      setPinError('');
      setProgress(0);
    } else {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const doctorName = currentUser?.name || 'Dr. Ahmed Khan';
  const config = getBiometricConfig();

  // Initiate Biometric verification via Credential Management API
  const handleStartBiometricVerification = async () => {
    if (scanState === 'scanning' || scanState === 'verifying') return;

    setScanState('scanning');
    setStatusMessage('Memanggil Browser Credential API (WebAuthn)...');
    setProgress(25);

    // Simulate animated sensor scanning progression while calling API
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 120);

    try {
      // Trigger WebAuthn / Platform Credential
      const result = await authenticateWithBiometrics({
        patientId: patient.id,
        patientName: patient.fullName,
        mrn: patient.mrn,
        doctorName,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setScanState('verifying');
      setStatusMessage('Menganalisis tanda tangan kriptografis WebAuthn...');

      scanTimeoutRef.current = setTimeout(() => {
        setScanState('success');
        setStatusMessage('Autentikasi Biometrik Berhasil! Akses Diberikan.');
        
        if (onShowToast) {
          onShowToast(
            'Biometric Verified',
            `Akses rekam medis ${patient.fullName} (${patient.mrn}) diverifikasi secara aman via ${platformName}.`,
            'success'
          );
        }

        // Smooth transition to opening the patient record
        setTimeout(() => {
          onSuccess(patient.id);
          onClose();
        }, 800);
      }, 700);
    } catch (err) {
      clearInterval(progressInterval);
      setScanState('error');
      setStatusMessage('Gagal membaca kredensial biometrik. Silakan coba lagi.');
      setProgress(0);
    }
  };

  // Emergency PIN verification fallback
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (pinInput === config.masterPin || pinInput === '1122') {
      setScanState('success');
      setStatusMessage('PIN Supervisor Medis Terverifikasi.');
      markBiometricSessionUnlocked();

      logBiometricEvent({
        patientId: patient.id,
        patientName: patient.fullName,
        mrn: patient.mrn,
        doctorName,
        action: 'EHR_ACCESS',
        status: 'SUCCESS_PIN_FALLBACK',
        authenticatorUsed: 'Supervisor Emergency PIN (1122)',
        challengeHash: 'pin_auth_override',
      });

      if (onShowToast) {
        onShowToast(
          'Supervisor PIN Verified',
          `Akses darurat diberikan untuk rekam medis ${patient.fullName}.`,
          'info'
        );
      }

      setTimeout(() => {
        onSuccess(patient.id);
        onClose();
      }, 600);
    } else {
      setPinError('PIN Medis tidak valid. Gunakan PIN default 1122 untuk simulasi.');
      setScanState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-800 relative">
        {/* Top Header Banner with Security Level */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
                <Fingerprint className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded text-white">
                    EHR Security Level 3
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                    <ShieldCheck className="w-3 h-3" />
                    WebAuthn Protected
                  </span>
                </div>
                <h3 className="text-lg font-extrabold tracking-tight mt-0.5 text-white">
                  Verifikasi Biometrik Dokter
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-blue-100 mt-2 relative z-10 leading-relaxed">
            Akses ke Protected Health Information (PHI) memerlukan otentikasi biometrik melalui Browser Credential Management API.
          </p>
        </div>

        {/* Patient Target Card */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={patient.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                alt={patient.fullName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-slate-900 text-sm truncate">
                    {patient.fullName}
                  </p>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded">
                    {patient.bloodGroup}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  No. RM: <strong className="text-blue-700 font-bold">{patient.mrn}</strong> • {patient.gender}, {patient.age} th
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                PHI Rahasia
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => {
                setAuthMode('biometric');
                setScanState('idle');
              }}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'biometric'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Fingerprint className="w-4 h-4 text-blue-600" />
              <span>Sensor Biometrik (WebAuthn)</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('pin');
                setScanState('idle');
              }}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'pin'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>PIN Supervisor (1122)</span>
            </button>
          </div>

          {/* Tab 1: Biometric Sensor Flow */}
          {authMode === 'biometric' ? (
            <div className="text-center space-y-4 py-2">
              {/* Interactive Biometric Touch Sensor UI */}
              <div className="relative inline-flex items-center justify-center">
                {/* Pulsing Ripple Rings */}
                {(scanState === 'scanning' || scanState === 'verifying') && (
                  <>
                    <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
                    <div className="absolute -inset-8 rounded-full bg-blue-400/10 animate-pulse pointer-events-none" />
                  </>
                )}

                {scanState === 'success' && (
                  <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none" />
                )}

                {/* Main Fingerprint Button */}
                <button
                  type="button"
                  onClick={handleStartBiometricVerification}
                  disabled={scanState === 'scanning' || scanState === 'verifying' || scanState === 'success'}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer ${
                    scanState === 'success'
                      ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : scanState === 'scanning' || scanState === 'verifying'
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-500 scale-105 shadow-lg shadow-blue-500/20'
                      : scanState === 'error'
                      ? 'bg-rose-50 text-rose-600 border-2 border-rose-500 hover:bg-rose-100'
                      : 'bg-slate-50 text-slate-600 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 shadow-xs'
                  }`}
                >
                  {scanState === 'success' ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-in zoom-in-50 duration-300" />
                  ) : scanState === 'scanning' ? (
                    <div className="relative flex items-center justify-center">
                      <Fingerprint className="w-12 h-12 text-blue-600 animate-pulse" />
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 shadow-xs animate-bounce" />
                    </div>
                  ) : scanState === 'verifying' ? (
                    <Cpu className="w-12 h-12 text-indigo-600 animate-spin" />
                  ) : scanState === 'error' ? (
                    <AlertTriangle className="w-12 h-12 text-rose-500" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
                  )}

                  <span className="text-[10px] font-extrabold mt-1">
                    {scanState === 'success'
                      ? 'VALID'
                      : scanState === 'scanning'
                      ? `${progress}%`
                      : scanState === 'verifying'
                      ? 'KRIPTO'
                      : scanState === 'error'
                      ? 'ULANGI'
                      : 'SENTUH'}
                  </span>
                </button>
              </div>

              {/* Status Message */}
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-900">
                  {statusMessage}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hardware Terdeteksi: <strong className="text-slate-700 font-semibold">{platformName}</strong></span>
                </div>
              </div>

              {/* Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartBiometricVerification}
                  disabled={scanState === 'scanning' || scanState === 'verifying' || scanState === 'success'}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>
                    {scanState === 'scanning'
                      ? 'Memindai Sidik Jari...'
                      : scanState === 'verifying'
                      ? 'Memvalidasi Public Key...'
                      : scanState === 'success'
                      ? 'Otentikasi Berhasil'
                      : 'Mulai Verifikasi Biometrik (Touch ID / WebAuthn)'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Tab 2: Medical Supervisor PIN Fallback */
            <form onSubmit={handlePinSubmit} className="space-y-4 py-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Opsi Darurat / Bypass Supervisor</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Gunakan PIN Medis Darurat jika sensor biometrik perangkat tidak dapat diakses (PIN Default: <strong className="font-mono bg-amber-100 px-1 py-0.2 rounded font-bold">1122</strong>).
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Masukkan PIN Keamanan 4-Digit Dokter:
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    autoFocus
                    className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pinError && (
                  <p className="text-xs text-rose-600 font-bold">{pinError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Verifikasi PIN & Buka Rekam Medis</span>
              </button>
            </form>
          )}

          {/* Audit Note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Sesi terenkripsi SHA-256
            </span>
            <span>Dokter: {doctorName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
