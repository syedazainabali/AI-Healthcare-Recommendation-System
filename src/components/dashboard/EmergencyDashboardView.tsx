import React, { useState, useEffect, useRef } from 'react';
import {
  AlertOctagon,
  Flame,
  HeartPulse,
  PhoneCall,
  Activity,
  Timer,
  Zap,
  ShieldAlert,
  Users,
  BedDouble,
  Droplets,
  Syringe,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Search,
  Sparkles,
  ArrowRight,
  Maximize2,
  X,
  Stethoscope,
} from 'lucide-react';
import { Patient, Doctor, HospitalInfo } from '../../types';

interface EmergencyDashboardViewProps {
  patients: Patient[];
  doctors?: Doctor[];
  hospitals?: HospitalInfo[];
  onSelectPatient: (patientId: string) => void;
  onOpenAICaseInvestigator: () => void;
  onOpenEmergencyModal?: () => void;
  onToggleEmergencyView: () => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const EmergencyDashboardView: React.FC<EmergencyDashboardViewProps> = ({
  patients = [],
  doctors = [],
  hospitals = [],
  onSelectPatient,
  onOpenAICaseInvestigator,
  onOpenEmergencyModal,
  onToggleEmergencyView,
  onShowToast,
}) => {
  // Filter for critical and high-urgency patients only
  const criticalPatients = patients.filter(
    (p) =>
      p.riskLevel === 'High' ||
      p.riskLevel === 'Elevated' ||
      p.status === 'Critical' ||
      p.status === 'Under Observation'
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    criticalPatients[0]?.id || patients[0]?.id || ''
  );
  const [patientSearch, setPatientSearch] = useState('');
  const [triageFilter, setTriageFilter] = useState<'ALL' | 'ESI-1' | 'ESI-2' | 'ESI-3'>('ALL');

  // --- Code Blue & Resuscitation Timer State ---
  const [isCprRunning, setIsCprRunning] = useState(false);
  const [cprSeconds, setCprSeconds] = useState(0);
  const [cprCycleSeconds, setCprCycleSeconds] = useState(120); // 2 minute countdown
  const [shockCount, setShockCount] = useState(0);
  const [epiCount, setEpiCount] = useState(0);
  const [isAudioMetronomeEnabled, setIsAudioMetronomeEnabled] = useState(false);
  const [eventLog, setEventLog] = useState<{ time: string; event: string }[]>([
    { time: '00:00', event: 'Code Blue Resuscitation System Armed' },
  ]);

  // Audio Context for CPR metronome (110 bpm)
  const audioContextRef = useRef<AudioContext | null>(null);
  const metronomeIntervalRef = useRef<number | null>(null);

  // --- Crash Cart Weight-based Drug Calculator ---
  const [patientWeightKg, setPatientWeightKg] = useState<number>(70);

  // --- Live Simulated ECG Canvas ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedRhythm, setSelectedRhythm] = useState<'NSR' | 'AFIB' | 'VTACH' | 'ASYSTOLE'>('AFIB');

  // Selected Patient Details
  const focusedPatient = patients.find((p) => p.id === selectedPatientId) || criticalPatients[0] || patients[0];

  // CPR Main Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCprRunning) {
      interval = setInterval(() => {
        setCprSeconds((prev) => prev + 1);
        setCprCycleSeconds((prev) => {
          if (prev <= 1) {
            if (onShowToast) {
              onShowToast('2-Minute CPR Rhythm Check Due', 'Pause compressions, assess rhythm and pulse.', 'warning');
            }
            return 120; // reset 2 min cycle
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCprRunning, onShowToast]);

  // CPR Audio Metronome (110 BPM = ~545ms)
  useEffect(() => {
    if (isCprRunning && isAudioMetronomeEnabled) {
      const playBeep = () => {
        try {
          if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioContextRef.current = new AudioCtx();
          }
          const ctx = audioContextRef.current;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch click
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } catch {
          // Fallback if browser audio policy blocks
        }
      };

      metronomeIntervalRef.current = window.setInterval(playBeep, 545);
    } else {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    }
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, [isCprRunning, isAudioMetronomeEnabled]);

  // Live ECG Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const height = canvas.height;
    const width = canvas.width;
    const midY = height / 2;

    // Reset background
    ctx.fillStyle = '#050B14';
    ctx.fillRect(0, 0, width, height);

    // Draw ECG grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 20) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 20) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    const renderECG = () => {
      ctx.fillStyle = 'rgba(5, 11, 20, 0.08)';
      ctx.fillRect(x, 0, 8, height);

      ctx.beginPath();
      ctx.strokeStyle = selectedRhythm === 'ASYSTOLE' ? '#EF4444' : selectedRhythm === 'VTACH' ? '#F59E0B' : '#00FF9D';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = ctx.strokeStyle;

      const prevX = x;
      x = (x + 2) % width;

      // Generate waveform amplitude based on rhythm
      let yOffset = 0;
      const cycle = x % 120;

      if (selectedRhythm === 'NSR') {
        if (cycle > 20 && cycle < 30) yOffset = -8 * Math.sin(((cycle - 20) / 10) * Math.PI); // P wave
        else if (cycle === 40) yOffset = 5; // Q
        else if (cycle === 44) yOffset = -42; // R spike
        else if (cycle === 48) yOffset = 12; // S
        else if (cycle > 60 && cycle < 85) yOffset = -14 * Math.sin(((cycle - 60) / 25) * Math.PI); // T wave
      } else if (selectedRhythm === 'AFIB') {
        // Irregular baseline with narrow QRS
        const fibrillatoryNoise = (Math.random() - 0.5) * 6;
        if (cycle === 38) yOffset = -38;
        else if (cycle === 42) yOffset = 10;
        else yOffset = fibrillatoryNoise;
      } else if (selectedRhythm === 'VTACH') {
        // Wide complex sinusoidal tachycardia
        yOffset = 32 * Math.sin((cycle / 20) * Math.PI);
      } else if (selectedRhythm === 'ASYSTOLE') {
        // Flatline with slight artifact
        yOffset = (Math.random() - 0.5) * 1.5;
      }

      ctx.moveTo(prevX, midY);
      ctx.lineTo(x, midY + yOffset);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(renderECG);
    };

    renderECG();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedRhythm]);

  const handleDeliverShock = () => {
    setShockCount((prev) => prev + 1);
    const newCount = shockCount + 1;
    const timeFormatted = formatTime(cprSeconds);
    setEventLog((prev) => [
      { time: timeFormatted, event: `⚡ Shock #${newCount} Delivered (200J Biphasic)` },
      ...prev,
    ]);
    if (onShowToast) {
      onShowToast('Defibrillator Discharge', `Shock #${newCount} (200J Biphasic) confirmed. Resume compressions immediately.`, 'warning');
    }
  };

  const handleAdministerEpi = () => {
    setEpiCount((prev) => prev + 1);
    const newCount = epiCount + 1;
    const timeFormatted = formatTime(cprSeconds);
    setEventLog((prev) => [
      { time: timeFormatted, event: `💉 Epinephrine 1mg IV/IO Push #${newCount} (+20ml Flush)` },
      ...prev,
    ]);
    if (onShowToast) {
      onShowToast('Medication Administered', `Epinephrine 1mg IV/IO (#${newCount}) recorded.`, 'info');
    }
  };

  const handleMassTransfusion = () => {
    if (onShowToast) {
      onShowToast(
        '🚨 Mass Transfusion Protocol (MTP) Activated',
        `Blood Bank alerted for ${focusedPatient?.fullName || 'Patient'}. 4 U O-Neg PRBC + 4 U FFP + 1 U Platelets dispatched.`,
        'error'
      );
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter patients in list
  const filteredCriticalPatients = criticalPatients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.mrn.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.primaryCondition.toLowerCase().includes(patientSearch.toLowerCase());

    if (triageFilter === 'ESI-1') return matchesSearch && (p.status === 'Critical' || p.riskLevel === 'High');
    if (triageFilter === 'ESI-2') return matchesSearch && p.riskLevel === 'Elevated';
    if (triageFilter === 'ESI-3') return matchesSearch && p.riskLevel === 'Moderate';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050811] text-white p-4 sm:p-6 space-y-6 font-sans antialiased selection:bg-rose-500 selection:text-white rounded-3xl border-2 border-rose-600/60 shadow-2xl">
      {/* 1. TOP HIGH-CONTRAST EMERGENCY HEADER BAR */}
      <div className="bg-[#0D1527] border-2 border-rose-500/80 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/50 animate-pulse flex-shrink-0">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-rose-600 text-white font-black text-[11px] rounded-md tracking-wider uppercase">
                EMERGENCY VIEW ACTIVE
              </span>
              <span className="px-2.5 py-0.5 bg-amber-400 text-black font-black text-[11px] rounded-md tracking-wider uppercase">
                CRITICAL TRIAGE & RESUSCITATION
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                TELEMETRY LIVE • 1122 DISPATCH READY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              Trauma & Emergency Acute Command Center
            </h1>
          </div>
        </div>

        {/* Action Controls & Return to Standard Dashboard Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onOpenAICaseInvestigator()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>AI Rapid Triage</span>
          </button>

          {onOpenEmergencyModal && (
            <button
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer animate-bounce"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Rescue 1122 Net</span>
            </button>
          )}

          <button
            onClick={onToggleEmergencyView}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm rounded-xl border-2 border-yellow-300 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer hover:scale-105"
            title="Exit emergency view and return to full standard dashboard"
          >
            <X className="w-4 h-4 text-black font-black" />
            <span>EXIT EMERGENCY VIEW</span>
          </button>
        </div>
      </div>

      {/* 2. CRITICAL METRICS SUMMARY HUD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Resuscitation Queue */}
        <div className="bg-[#0C1322] border-2 border-rose-500/80 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
              Red Acuity (ESI-1)
            </span>
            <p className="text-3xl font-black text-white mt-0.5">
              {patients.filter((p) => p.status === 'Critical' || p.riskLevel === 'High').length}
            </p>
            <p className="text-[10px] text-rose-300 font-bold mt-0.5">Immediate Resuscitation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Metric 2: Emergent Patients */}
        <div className="bg-[#0C1322] border-2 border-amber-500/80 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              Orange Acuity (ESI-2)
            </span>
            <p className="text-3xl font-black text-white mt-0.5">
              {patients.filter((p) => p.riskLevel === 'Elevated').length}
            </p>
            <p className="text-[10px] text-amber-300 font-bold mt-0.5">&lt; 10 min Assessment</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: ICU / Trauma Bays */}
        <div className="bg-[#0C1322] border-2 border-cyan-500/80 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
              Trauma Beds Free
            </span>
            <p className="text-3xl font-black text-white mt-0.5">4 / 12</p>
            <p className="text-[10px] text-cyan-300 font-bold mt-0.5">Resus Bay 1 & 3 Ready</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500 text-cyan-400 flex items-center justify-center">
            <BedDouble className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: O-Negative Blood Units */}
        <div className="bg-[#0C1322] border-2 border-emerald-500/80 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
              Blood Bank O-Neg
            </span>
            <p className="text-3xl font-black text-white mt-0.5">18 Units</p>
            <p className="text-[10px] text-emerald-300 font-bold mt-0.5">Mass Transfusion Ready</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center">
            <Droplets className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKBENCH: CRITICAL PATIENT QUEUE (LEFT) + ACTIVE RESUSCITATION SUITE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Critical Triage Patient Queue */}
        <div className="lg:col-span-5 bg-[#0C1322] border-2 border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-500" />
                Critical Patient Triage Queue
              </h2>
              <p className="text-xs text-slate-400 font-medium">Filtered to High Risk & Acute Cases</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 text-[10px] font-bold">
              {(['ALL', 'ESI-1', 'ESI-2'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTriageFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    triageFilter === tab
                      ? 'bg-rose-600 text-white font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search critical patient, MRN, condition..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Patient Cards List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1 flex-1">
            {filteredCriticalPatients.map((p) => {
              const latestVitals = p.vitalsHistory?.[0] || {
                bloodPressureSystolic: 140,
                bloodPressureDiastolic: 90,
                heartRate: 85,
                oxygenSaturation: 96,
                respiratoryRate: 18,
                temperature: 98.6,
              };

              const isSelected = p.id === focusedPatient?.id;
              const isHighEmergency = p.status === 'Critical' || p.riskLevel === 'High';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-rose-500 shadow-lg shadow-rose-950/60'
                      : 'bg-[#090E1A] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* High urgency beacon stripe */}
                  {isHighEmergency && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-bl-lg animate-ping" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                            isHighEmergency
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-black'
                          }`}
                        >
                          {isHighEmergency ? 'ESI-1 IMMEDIATE' : 'ESI-2 EMERGENT'}
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-400">{p.mrn}</span>
                        <span className="text-[10px] font-bold text-slate-300">
                          {p.age}y / {p.gender}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-white mt-1 truncate">{p.fullName}</h3>
                      <p className="text-xs text-rose-300 font-semibold line-clamp-1 mt-0.5">
                        {p.primaryCondition}
                      </p>
                    </div>

                    <span className="text-xs font-black text-rose-400 bg-rose-950/80 px-2 py-1 rounded-lg border border-rose-800">
                      {p.bloodGroup}
                    </span>
                  </div>

                  {/* Vitals Ribbon */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-slate-800 text-center font-mono">
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">BP (mmHg)</span>
                      <span
                        className={`text-xs font-black ${
                          latestVitals.bloodPressureSystolic >= 160 || latestVitals.bloodPressureSystolic <= 90
                            ? 'text-rose-400 animate-pulse'
                            : 'text-amber-300'
                        }`}
                      >
                        {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">HR (bpm)</span>
                      <span
                        className={`text-xs font-black ${
                          latestVitals.heartRate >= 100 || latestVitals.heartRate <= 50
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {latestVitals.heartRate}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">SpO2 (%)</span>
                      <span
                        className={`text-xs font-black ${
                          latestVitals.oxygenSaturation < 95 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
                        }`}
                      >
                        {latestVitals.oxygenSaturation}%
                      </span>
                    </div>

                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">RR (/min)</span>
                      <span className="text-xs font-black text-slate-200">
                        {latestVitals.respiratoryRate}
                      </span>
                    </div>
                  </div>

                  {/* Severe Allergy Warning if present */}
                  {p.allergies && p.allergies.length > 0 && (
                    <div className="mt-2 text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800 px-2 py-1 rounded-md flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                      <span className="font-bold">ALLERGIC:</span>
                      <span className="truncate">{p.allergies.map((a) => a.allergen).join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 Cols): Live Telemetry, Resuscitation & Crash Cart Tools */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Patient Focused Emergency Card */}
          {focusedPatient && (
            <div className="bg-[#0C1322] border-2 border-rose-500/90 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded uppercase">
                      ACTIVE RESUSCITATION FOCUS
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      MRN: {focusedPatient.mrn}
                    </span>
                    <span className="text-xs font-extrabold text-amber-400">
                      CODE STATUS: FULL CODE
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    {focusedPatient.fullName}
                  </h3>
                  <p className="text-xs text-rose-300 font-semibold">
                    {focusedPatient.primaryCondition} • Assigned to {focusedPatient.assignedDoctorName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPatient(focusedPatient.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    <span>Full Medical Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleMassTransfusion}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span>MTP Blood Pack</span>
                  </button>
                </div>
              </div>

              {/* Real-time ECG Telemetry Simulator */}
              <div className="bg-[#050B14] rounded-2xl p-3.5 border border-cyan-500/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      BED 01 TELEMETRY • LEAD II
                    </span>
                  </div>

                  {/* Rhythm selector tabs */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                    {(['NSR', 'AFIB', 'VTACH', 'ASYSTOLE'] as const).map((rhythm) => (
                      <button
                        key={rhythm}
                        onClick={() => setSelectedRhythm(rhythm)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          selectedRhythm === rhythm
                            ? rhythm === 'ASYSTOLE'
                              ? 'bg-rose-600 text-white font-black'
                              : rhythm === 'VTACH'
                              ? 'bg-amber-500 text-black font-black'
                              : 'bg-emerald-600 text-white font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rhythm}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas Waveform */}
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={130}
                  className="w-full h-32 bg-black rounded-xl border border-slate-800"
                />

                {/* Live Real-time Vitals Bar below ECG */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center font-mono">
                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">NIBP</span>
                    <span className="text-base font-black text-rose-400">
                      {focusedPatient.vitalsHistory?.[0]?.bloodPressureSystolic || 172}/
                      {focusedPatient.vitalsHistory?.[0]?.bloodPressureDiastolic || 104}
                    </span>
                    <span className="text-[9px] text-slate-500 block">MAP: 126 mmHg</span>
                  </div>

                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">PULSE RATE</span>
                    <span className="text-base font-black text-emerald-400">
                      {focusedPatient.vitalsHistory?.[0]?.heartRate || 112} <span className="text-xs">BPM</span>
                    </span>
                    <span className="text-[9px] text-emerald-500 block">R-R Irregular</span>
                  </div>

                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">SpO2 PLETH</span>
                    <span className="text-base font-black text-cyan-300">
                      {focusedPatient.vitalsHistory?.[0]?.oxygenSaturation || 94}%
                    </span>
                    <span className="text-[9px] text-cyan-500 block">FiO2: 40% (Mask)</span>
                  </div>

                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">GCS COMA</span>
                    <span className="text-base font-black text-amber-400">14 / 15</span>
                    <span className="text-[9px] text-amber-500 block">E4 V4 M6</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Code Blue Resuscitation Suite */}
          <div className="bg-[#0C1322] border-2 border-amber-500/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Cardiac Arrest & CPR Resuscitation Protocol
                  </h3>
                  <p className="text-xs text-slate-400">2-Minute Metronome Cycle & Defibrillation Tracker</p>
                </div>
              </div>

              {/* Metronome Sound Toggle */}
              <button
                onClick={() => setIsAudioMetronomeEnabled(!isAudioMetronomeEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isAudioMetronomeEnabled
                    ? 'bg-amber-400 text-black border-amber-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isAudioMetronomeEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Metronome (110 bpm)</span>
              </button>
            </div>

            {/* Timer Display & Main Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
              <div className="bg-slate-900 p-4 rounded-2xl border-2 border-slate-700">
                <span className="text-xs font-sans text-slate-400 block">TOTAL CPR TIME</span>
                <p className="text-3xl font-black text-white mt-1">{formatTime(cprSeconds)}</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border-2 border-rose-500/80">
                <span className="text-xs font-sans text-rose-300 font-bold block">RHYTHM CHECK IN</span>
                <p className="text-3xl font-black text-rose-400 mt-1">{formatTime(cprCycleSeconds)}</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border-2 border-amber-500/80">
                <span className="text-xs font-sans text-amber-300 font-bold block">SHOCKS / EPI</span>
                <p className="text-3xl font-black text-amber-400 mt-1">
                  ⚡ {shockCount} | 💉 {epiCount}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCprRunning(!isCprRunning)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm transition-all cursor-pointer shadow-lg ${
                  isCprRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isCprRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isCprRunning ? 'PAUSE RESUSCITATION' : 'START CODE BLUE'}</span>
              </button>

              <button
                onClick={handleDeliverShock}
                className="flex items-center gap-2 py-3 px-5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>DELIVER SHOCK (200J)</span>
              </button>

              <button
                onClick={handleAdministerEpi}
                className="flex items-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                <Syringe className="w-4 h-4" />
                <span>EPI 1mg IV</span>
              </button>

              <button
                onClick={() => {
                  setIsCprRunning(false);
                  setCprSeconds(0);
                  setCprCycleSeconds(120);
                  setShockCount(0);
                  setEpiCount(0);
                  setEventLog([{ time: '00:00', event: 'Code Blue Reset' }]);
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Reset Code Blue Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* CPR Event Log */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-28 overflow-y-auto font-mono text-[11px] space-y-1">
              <span className="text-[10px] font-sans text-slate-400 font-bold block mb-1">
                RESUSCITATION EVENT AUDIT TRAIL:
              </span>
              {eventLog.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <span className="text-cyan-400 font-bold">[{log.time}]</span>
                  <span>{log.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Crash Cart Rapid Weight-Based Drug Dosing Calculator */}
          <div className="bg-[#0C1322] border-2 border-indigo-500/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Syringe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Emergency Crash Cart Drug Dosing
                  </h3>
                  <p className="text-xs text-slate-400">Weight-Calibrated Adult & Pediatric Resuscitation Doses</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">Patient Weight:</span>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={patientWeightKg}
                  onChange={(e) => setPatientWeightKg(Number(e.target.value) || 70)}
                  className="w-20 px-2.5 py-1 bg-slate-900 border border-indigo-400 rounded-lg text-sm font-black text-white text-center"
                />
                <span className="text-xs font-bold text-indigo-400">kg</span>
              </div>
            </div>

            {/* Drug Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-rose-400">Epinephrine</span>
                  <span className="text-[9px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded font-mono">1:10,000</span>
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {patientWeightKg < 30 ? `${(patientWeightKg * 0.01).toFixed(2)} mg (0.1 ml/kg)` : '1.0 mg IV/IO'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Every 3-5 mins in Cardiac Arrest</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-cyan-400">Amiodarone</span>
                  <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono">VF / pVT</span>
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {patientWeightKg < 30 ? `${(patientWeightKg * 5).toFixed(0)} mg (5 mg/kg)` : '300 mg IV Push'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">2nd dose: 150 mg IV (or 5 mg/kg)</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-amber-400">Atropine Sulfate</span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-mono">Bradycardia</span>
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {patientWeightKg < 30 ? `${Math.max(0.1, (patientWeightKg * 0.02)).toFixed(2)} mg` : '1.0 mg IV Push'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Repeat q3-5min, max 3mg</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-purple-400">Adenosine</span>
                  <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-mono">SVT</span>
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {patientWeightKg < 30 ? `${(patientWeightKg * 0.1).toFixed(1)} mg` : '6 mg Rapid IV Push'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Follow immediately with 20ml NS flush</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-emerald-400">Normal Saline Bolus</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Shock</span>
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {(patientWeightKg * 20).toLocaleString()} ml (20 ml/kg)
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Rapid pressure bag infusion</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-blue-400">Naloxone (Narcan)</span>
                  <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-mono">Opioid</span>
                </div>
                <p className="text-sm font-black text-white mt-1">
                  {patientWeightKg < 30 ? `${(patientWeightKg * 0.1).toFixed(2)} mg` : '0.4 – 2.0 mg IV/IM'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Titrate for spontaneous respiratory drive</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
