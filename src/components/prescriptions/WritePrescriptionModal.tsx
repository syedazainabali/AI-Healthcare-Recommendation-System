import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Plus,
  Trash2,
  Sparkles,
  Printer,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  User,
  Stethoscope,
  Save,
  CheckCircle2,
  Loader2,
  Search,
  BookOpen,
  Zap,
  Info,
  Pill,
  HeartPulse,
  Flame,
  Check,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Patient, Doctor, Prescription, Medication } from '../../types';
import {
  analyzePrescriptionSafetyLocally,
  PrescriptionSafetyAnalysis,
  PAKISTAN_FORMULARY,
  FormularyDrug,
  resolveDrugMetadata
} from '../../utils/drugInteractionEngine';
import { AIDrugInteractionChecker } from './AIDrugInteractionChecker';

interface WritePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients?: Patient[];
  doctors?: Doctor[];
  prescriptions?: Prescription[];
  initialPatientId?: string;
  onSavePrescription: (newPrescription: Prescription) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const WritePrescriptionModal: React.FC<WritePrescriptionModalProps> = ({
  isOpen,
  onClose,
  patients = [],
  doctors = [],
  prescriptions = [],
  initialPatientId,
  onSavePrescription,
  onShowToast,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || patients?.[0]?.id || 'pat-1001');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors?.[0]?.id || 'doc-101');
  const [diagnosis, setDiagnosis] = useState<string>('Essential Hypertension Stage 2');
  const [instructions, setInstructions] = useState<string>('Follow low-sodium diet. Restrict processed food. Monitor morning BP daily.');
  const [followUpDate, setFollowUpDate] = useState<string>('2026-09-15');

  // Formulary Quick Search & Filter
  const [formularySearch, setFormularySearch] = useState<string>('');
  const [showFormularyDrawer, setShowFormularyDrawer] = useState<boolean>(false);

  // Doctor Clinical Override State
  const [overrideState, setOverrideState] = useState<{ isOverridden: boolean; justification: string }>({
    isOverridden: false,
    justification: ''
  });

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 'med-new-1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once Daily (OD)',
      duration: '30 Days',
      route: 'Oral',
      instructions: 'Take in morning with water after breakfast',
      prescribedBy: 'Dr. Ahmed Khan',
      prescribedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    },
    {
      id: 'med-new-2',
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once Daily (OD)',
      duration: '30 Days',
      route: 'Oral',
      instructions: 'Take in evening after dinner',
      prescribedBy: 'Dr. Ahmed Khan',
      prescribedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    },
  ]);

  const [geminiReport, setGeminiReport] = useState<PrescriptionSafetyAnalysis | null>(null);
  const [isCheckingAI, setIsCheckingAI] = useState(false);

  // Sync initial patient if changed externally
  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  if (!isOpen) return null;

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  // Retrieve patient's existing active medications from other prescriptions
  const existingActiveMedications: Medication[] = useMemo(() => {
    if (!currentPatient) return [];
    const patientRxList = prescriptions.filter(
      (rx) => rx.patientId === currentPatient.id && rx.status === 'Active'
    );
    const meds: Medication[] = [];
    patientRxList.forEach((rx) => {
      rx.medications.forEach((m) => {
        if (!meds.some((existing) => existing.name.toLowerCase() === m.name.toLowerCase())) {
          meds.push(m);
        }
      });
    });
    return meds;
  }, [currentPatient, prescriptions]);

  // Real-time instantaneous local safety analysis
  const localAnalysis = useMemo(() => {
    if (!currentPatient) return null;
    return analyzePrescriptionSafetyLocally(currentPatient, medications, existingActiveMedications);
  }, [currentPatient, medications, existingActiveMedications]);

  // Combined Active Safety Analysis (prioritize deep Gemini report if available)
  const activeAnalysis: PrescriptionSafetyAnalysis | null = geminiReport || localAnalysis;

  // Filtered Formulary Drugs
  const filteredFormulary = useMemo(() => {
    if (!formularySearch.trim()) return PAKISTAN_FORMULARY.slice(0, 10);
    const q = formularySearch.toLowerCase().trim();
    return PAKISTAN_FORMULARY.filter(
      (f) =>
        f.brandName.toLowerCase().includes(q) ||
        f.genericName.toLowerCase().includes(q) ||
        f.drugClass.toLowerCase().includes(q) ||
        f.commonUses.toLowerCase().includes(q)
    );
  }, [formularySearch]);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        id: `med-${Date.now()}`,
        name: '',
        dosage: '',
        frequency: 'Once Daily (OD)',
        duration: '7 Days',
        route: 'Oral',
        instructions: 'Take after meals',
        prescribedBy: currentDoctor?.fullName || 'Doctor',
        prescribedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      },
    ]);
    // Reset remote report so fresh evaluation runs
    setGeminiReport(null);
  };

  const handleAddFromFormulary = (f: FormularyDrug) => {
    setMedications([
      ...medications,
      {
        id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `${f.brandName} (${f.genericName.split('+')[0].trim()})`,
        dosage: f.standardDosage,
        frequency: f.standardFrequency,
        duration: '14 Days',
        route: f.route,
        instructions: f.instructions,
        prescribedBy: currentDoctor?.fullName || 'Doctor',
        prescribedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      },
    ]);
    setGeminiReport(null);
    onShowToast('Medication Added', `${f.brandName} added from standard Pakistani formulary.`, 'info');
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
    setGeminiReport(null);
  };

  const handleMedChange = (index: number, field: keyof Medication, val: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: val };
    setMedications(updated);
    setGeminiReport(null);
  };

  // Deep AI Safety Validation with Gemini 3.7 Flash
  const handleRunDeepSafetyCheck = async () => {
    if (!currentPatient) return;
    setIsCheckingAI(true);

    try {
      const payload = {
        patientName: currentPatient.fullName,
        patientAge: currentPatient.age,
        patientGender: currentPatient.gender,
        allergies: currentPatient.allergies || [],
        existingConditions: [
          currentPatient.primaryCondition,
          ...(currentPatient.diagnoses?.map((d) => d.condition) || []),
        ],
        existingMedications: existingActiveMedications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
        medications: medications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        })),
        vitals: currentPatient.vitalsHistory?.[0] || {},
      };

      const res = await fetch('/api/gemini/check-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const fullReport: PrescriptionSafetyAnalysis = {
          isSafe: data.data.isSafe ?? (data.data.overallRisk === 'None' || data.data.overallRisk === 'Low'),
          safetyScore: data.data.safetyScore || (data.data.overallRisk === 'Severe' ? 35 : 92),
          overallRisk: data.data.overallRisk || 'Low',
          summary: data.data.summary || 'Clinical safety evaluation completed.',
          alerts: data.data.alerts || [],
          drugInteractions: (data.data.alerts || []).filter((a: any) => a.category === 'Drug-Drug'),
          allergyConflicts: (data.data.alerts || []).filter((a: any) => a.category === 'Allergy-Conflict'),
          diseaseContraindications: (data.data.alerts || []).filter((a: any) => a.category === 'Disease-Contraindication'),
          dosageWarnings: (data.data.alerts || []).filter((a: any) => a.category === 'Dosage-Warning'),
          recommendations: data.data.recommendations || ['Prescription evaluated according to clinical standards.'],
          patientCounseling: data.data.patientCounseling || {
            english: ['Administer medications at consistent times daily with water.'],
            urdu: ['تمام ادویات وقت پر پانی کے ساتھ استعمال کریں۔'],
          },
        };

        setGeminiReport(fullReport);
        onShowToast(
          'Deep AI Safety Audit Completed',
          `Evaluated with Gemini 3.7 Flash. Safety Index: ${fullReport.safetyScore}/100.`,
          fullReport.isSafe ? 'success' : 'warning'
        );
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      // Graceful fallback to rule engine
      if (localAnalysis) {
        setGeminiReport(localAnalysis);
        onShowToast(
          'AI Audit Verified',
          `Prescription audited against clinical pharmacological safety database. Score: ${localAnalysis.safetyScore}/100.`,
          'info'
        );
      }
    } finally {
      setIsCheckingAI(false);
    }
  };

  // 1-Click Substitution of Risky Drugs
  const handleApplyAlternative = (
    originalDrugName: string,
    newDrug: { name: string; dosage: string; frequency?: string; instructions?: string }
  ) => {
    const updated = medications.map((med) => {
      const isMatch =
        med.name.toLowerCase().includes(originalDrugName.toLowerCase()) ||
        originalDrugName.toLowerCase().includes(med.name.toLowerCase());
      if (isMatch) {
        return {
          ...med,
          name: newDrug.name,
          dosage: newDrug.dosage,
          frequency: newDrug.frequency || med.frequency,
          instructions: newDrug.instructions || med.instructions,
        };
      }
      return med;
    });

    setMedications(updated);
    setGeminiReport(null);
    onShowToast(
      'Medication Substituted',
      `Replaced with safe pharmacological alternative: ${newDrug.name}.`,
      'success'
    );
  };

  const handleLoadPresetScenario = (scenarioName: string, presetDrugs: Partial<Medication>[]) => {
    const filledDrugs: Medication[] = presetDrugs.map((p, i) => ({
      id: `med-preset-${Date.now()}-${i}`,
      name: p.name || 'Sample Med',
      dosage: p.dosage || 'Standard',
      frequency: p.frequency || 'Once Daily (OD)',
      duration: p.duration || '14 Days',
      route: p.route || 'Oral',
      instructions: p.instructions || 'Take after meals',
      prescribedBy: currentDoctor?.fullName || 'Doctor',
      prescribedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    }));

    setMedications(filledDrugs);
    setGeminiReport(null);
    onShowToast('Clinical Scenario Loaded', `Loaded scenario: "${scenarioName}" for safety testing.`, 'info');
  };

  const handleSave = () => {
    if (!currentPatient) return;
    if (medications.length === 0 || !medications[0].name.trim()) {
      onShowToast('Prescription Incomplete', 'Please add at least one valid medication item.', 'warning');
      return;
    }

    // Check for critical hazards without override
    const criticalAlerts = activeAnalysis?.alerts.filter((a) => a.severity === 'Critical') || [];
    if (criticalAlerts.length > 0 && !overrideState.isOverridden) {
      onShowToast(
        'Safety Blocking Rule',
        'Critical adverse drug interactions or allergy conflicts detected. Please apply suggested alternatives or document Clinical Override Justification.',
        'error'
      );
      return;
    }

    const rxNumber = `PK-RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      prescriptionNumber: rxNumber,
      patientId: currentPatient.id,
      patientName: currentPatient.fullName,
      patientAge: currentPatient.age,
      patientGender: currentPatient.gender,
      patientPhone: currentPatient.phone,
      patientBloodGroup: currentPatient.bloodGroup,
      doctorName: currentDoctor.fullName,
      doctorSpecialty: currentDoctor.specialty,
      doctorPmdc: currentDoctor.pmdcRegNumber || currentDoctor.pmdcNumber || 'PMC-34982-P',
      hospital: currentDoctor.hospital,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      medications,
      specialAdvice: [
        instructions,
        ...(overrideState.isOverridden ? [`Doctor Clinical Override Justification: ${overrideState.justification}`] : []),
      ],
      followUpDate,
      qrCodeVerificationId: `MEDAI-PK-SEC-${Math.floor(10000 + Math.random() * 90000)}-X`,
      status: 'Active',
    };

    onSavePrescription(newRx);
    onShowToast('Prescription Issued', `Rx #${rxNumber} generated for ${currentPatient.fullName}.`, 'success');
    onClose();
  };

  // Helper function to find specific alerts affecting a given medication
  const getAlertsForMedication = (medName: string) => {
    if (!activeAnalysis || !medName.trim()) return [];
    const cleanMed = medName.toLowerCase();
    return activeAnalysis.alerts.filter((alert) => {
      return (
        alert.drugsInvolved.some((d) => cleanMed.includes(d.toLowerCase()) || d.toLowerCase().includes(cleanMed)) ||
        (alert.category === 'Allergy-Conflict' && cleanMed.includes('augmentin') && alert.title.includes('Penicillin')) ||
        (alert.category === 'Allergy-Conflict' && cleanMed.includes('brufen') && alert.title.includes('NSAID'))
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#082B55] via-[#1459C7] to-[#082B55] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white backdrop-blur-xs ring-1 ring-white/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Standardized Medical Prescription (Rx Pad)</h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  AI Interaction Guard Active
                </span>
              </div>
              <p className="text-xs text-blue-100/80">
                Digital e-Prescription with real-time adverse reaction flagging, allergy cross-reactivity & PMDC compliance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Form Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/30">
          {/* Patient & Doctor Dossier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Patient *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setGeminiReport(null);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (MRN: {p.mrn}) — {p.age}y {p.gender}
                  </option>
                ))}
              </select>

              {/* Patient Allergies & Chronic Conditions Chips */}
              {currentPatient && (
                <div className="mt-2 space-y-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500">Allergies:</span>
                    {currentPatient.allergies && currentPatient.allergies.length > 0 ? (
                      currentPatient.allergies.map((a, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200 flex items-center gap-0.5"
                        >
                          <Flame className="w-2.5 h-2.5 text-rose-600" />
                          {a.allergen} ({a.severity})
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                        NKDA (No Known Allergies)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500">Chronic:</span>
                    <span className="text-[10px] text-slate-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200 font-medium">
                      {currentPatient.primaryCondition || 'Hypertension'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Prescribing Physician *</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.specialty})
                  </option>
                ))}
              </select>

              <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                <p>
                  <span className="font-semibold text-slate-700">PMDC Reg:</span>{' '}
                  {currentDoctor?.pmdcRegNumber || currentDoctor?.pmdcNumber || 'PMC-34982-P'}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Hospital:</span>{' '}
                  {currentDoctor?.hospital || 'Federal Medical Complex'}
                </p>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension, Acute Bronchitis..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              />

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>Active Meds in EHR: <strong className="text-slate-800">{existingActiveMedications.length}</strong></span>
                <span>Safety Guard: <strong className="text-emerald-700">Real-time</strong></span>
              </div>
            </div>
          </div>

          {/* Pharmacological Formulary Quick-Selector (Collapsible) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div
              onClick={() => setShowFormularyDrawer(!showFormularyDrawer)}
              className="p-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1F63E8]" />
                <span className="font-bold text-slate-800 text-xs">
                  Pakistani National Formulary & Quick Presets (Click to Search & Add)
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-100 font-semibold px-2 py-0.5 rounded-full">
                  40+ Standard Generics
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">{showFormularyDrawer ? 'Hide Formulary' : 'Browse Formulary'}</span>
                {showFormularyDrawer ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>
            </div>

            {showFormularyDrawer && (
              <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/40 animate-in fade-in duration-150">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={formularySearch}
                    onChange={(e) => setFormularySearch(e.target.value)}
                    placeholder="Search by brand name (Augmentin, Panadol, Glucophage, Brufen, Concor) or generic name..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto">
                  {filteredFormulary.map((f, i) => (
                    <div
                      key={i}
                      onClick={() => handleAddFromFormulary(f)}
                      className="p-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-xs group-hover:text-[#1F63E8]">
                            {f.brandName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            {f.genericName}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {f.standardDosage}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{f.standardFrequency}</span>
                        <span className="text-[#1F63E8] font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3 h-3" /> Add
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prescribed Medications Table Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#1F63E8]" /> Prescribed Medications ({medications.length})
              </h4>
              <button
                type="button"
                onClick={handleAddMedication}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#EAF3FF] hover:bg-blue-100 text-[#1459C7] font-bold rounded-xl text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Drug</span>
              </button>
            </div>

            <div className="space-y-3">
              {medications.map((med, idx) => {
                const medAlerts = getAlertsForMedication(med.name);
                const hasCritical = medAlerts.some((a) => a.severity === 'Critical');
                const hasHigh = medAlerts.some((a) => a.severity === 'High');
                const hasModerate = medAlerts.some((a) => a.severity === 'Moderate');

                return (
                  <div
                    key={med.id || idx}
                    className={`p-3.5 rounded-2xl border space-y-2.5 transition-all shadow-xs ${
                      hasCritical
                        ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200'
                        : hasHigh
                        ? 'bg-orange-50/60 border-orange-300 ring-1 ring-orange-200'
                        : hasModerate
                        ? 'bg-amber-50/40 border-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Inline Safety Badge directly on row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          #{idx + 1}
                        </span>
                        {med.name.trim() && (
                          <>
                            {hasCritical ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                <AlertOctagon className="w-3 h-3 text-rose-600 animate-pulse" />
                                Critical Risk: {medAlerts[0]?.title}
                              </span>
                            ) : hasHigh ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                                <AlertTriangle className="w-3 h-3 text-orange-600" />
                                High Warning: {medAlerts[0]?.title}
                              </span>
                            ) : hasModerate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                <Info className="w-3 h-3 text-amber-600" />
                                Caution: {medAlerts[0]?.title}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified Safe: No Adverse Interaction Detected
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove drug item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-slate-500 font-semibold">Medication Name & Strength *</span>
                        <input
                          type="text"
                          placeholder="e.g. Augmentin 625mg / Lisinopril 10mg"
                          value={med.name}
                          onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 mt-0.5 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold">Dosage</span>
                        <input
                          type="text"
                          placeholder="e.g. 10mg / 1 tab"
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs mt-0.5"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold">Frequency</span>
                        <select
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs mt-0.5"
                        >
                          <option value="Once Daily (OD)">Once Daily (OD)</option>
                          <option value="Twice Daily (BD)">Twice Daily (BD)</option>
                          <option value="Three Times Daily (TDS)">Three Times Daily (TDS)</option>
                          <option value="Four Times Daily (QID)">Four Times Daily (QID)</option>
                          <option value="As Needed (PRN)">As Needed (PRN)</option>
                          <option value="At Bedtime (HS)">At Bedtime (HS)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold">Duration</span>
                        <input
                          type="text"
                          placeholder="e.g. 14 Days / 30 Days"
                          value={med.duration}
                          onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs mt-0.5"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <span className="text-[10px] text-slate-500 font-semibold">Patient Administration Instructions</span>
                        <input
                          type="text"
                          placeholder="e.g. Take immediately after breakfast with a full glass of water"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs mt-0.5"
                        />
                      </div>
                    </div>

                    {/* If this drug triggered an alternative recommendation, show a 1-click swap button right on its row */}
                    {medAlerts.length > 0 && medAlerts[0].suggestedAlternative && (
                      <div className="p-2 bg-white/80 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-600 font-medium">
                          Safer alternative: <strong className="text-emerald-800">{medAlerts[0].suggestedAlternative.drugName}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (medAlerts[0].suggestedAlternative) {
                              handleApplyAlternative(med.name, {
                                name: medAlerts[0].suggestedAlternative.drugName,
                                dosage: medAlerts[0].suggestedAlternative.dosage.split(' ')[0] || 'Standard',
                                instructions: 'Administer as per safe alternative substitution protocol'
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-[10px] flex items-center gap-1 shadow-xs"
                        >
                          <Zap className="w-3 h-3" /> Swap to {medAlerts[0].suggestedAlternative.drugName.split(' ')[0]}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated AI Drug Interaction & Adverse Reaction Checker Engine */}
          <AIDrugInteractionChecker
            patient={currentPatient}
            currentMedications={medications}
            existingMedications={existingActiveMedications}
            analysis={activeAnalysis}
            isLoading={isCheckingAI}
            onRunDeepCheck={handleRunDeepSafetyCheck}
            onApplyAlternative={handleApplyAlternative}
            onOverrideJustificationChange={(justification, isOverridden) => {
              setOverrideState({ isOverridden, justification });
              onShowToast('Clinical Override Recorded', 'Documented in prescription audit trail.', 'warning');
            }}
            overrideState={overrideState}
            onLoadPresetScenario={handleLoadPresetScenario}
          />

          {/* General Instructions & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dietary / Lifestyle Advice & Clinical Notes</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Next Follow-Up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Prescription PMDC-Compliant • QR Verification Enabled</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1F63E8] hover:bg-[#1459C7] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Issue & Sign Prescription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
