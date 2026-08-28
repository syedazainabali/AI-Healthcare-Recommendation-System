import React, { useState } from 'react';
import {
  X,
  Printer,
  CalendarPlus,
  FileSpreadsheet,
  Sparkles,
  Phone,
  MapPin,
  Heart,
  Activity,
  History,
  AlertTriangle,
  Pill,
  FileCheck2,
  CalendarClock,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  User,
  Plus,
} from 'lucide-react';
import {
  Patient,
  LabReport,
  Prescription,
  Appointment,
  AIRecommendation,
  Doctor,
} from '../../types';
import { PredictiveRiskScoreChart } from './PredictiveRiskScoreChart';
import { MedicationAdherenceView } from './MedicationAdherenceView';

interface PatientProfileModalProps {
  patient: Patient | null;
  isOpen?: boolean;
  onClose: () => void;
  doctors?: Doctor[];
  labReports?: LabReport[];
  prescriptions?: Prescription[];
  appointments?: Appointment[];
  aiRecommendations?: AIRecommendation[];
  onOpenBookAppointment?: (patientId?: string) => void;
  onOpenWritePrescription?: (patientId?: string) => void;
  onOpenPrescriptionModal?: (patientId?: string) => void;
  onOpenAICaseInvestigator?: () => void;
  onUpdatePatient?: (updated: Patient) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

type TabType =
  | 'overview'
  | 'predictive-risk'
  | 'history'
  | 'medications'
  | 'allergies'
  | 'labs'
  | 'prescriptions'
  | 'appointments'
  | 'ai-insights';

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  patient,
  isOpen = true,
  onClose,
  doctors = [],
  labReports = [],
  prescriptions = [],
  appointments = [],
  aiRecommendations = [],
  onOpenBookAppointment = (_pId?: string) => {},
  onOpenWritePrescription,
  onOpenPrescriptionModal,
  onOpenAICaseInvestigator = () => {},
  onUpdatePatient,
  onShowToast = (_t: string, _m: string, _type?: string) => {},
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleOpenRx = onOpenWritePrescription || onOpenPrescriptionModal || (() => {});

  if (!isOpen || !patient) return null;

  const patientLabs = (labReports || []).filter((l) => l.patientId === patient.id);
  const patientPrescriptions = (prescriptions || []).filter((p) => p.patientId === patient.id);
  const patientAppointments = (appointments || []).filter((a) => a.patientId === patient.id);
  const patientAIRecommendations = (aiRecommendations || []).filter((r) => r.patientId === patient.id);
  const patientAllergies = patient.allergies || [];

  const riskBadges: Record<string, string> = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Moderate: 'bg-blue-50 text-blue-700 border-blue-200',
    Elevated: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Printable Header / App Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#082B55] via-[#1459C7] to-[#1F63E8] text-white flex items-center justify-between flex-shrink-0 no-print">
          <div className="flex items-center gap-3">
            <img
              src={patient.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={patient.fullName}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-2xl object-cover border-2 border-white/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold">{patient.fullName}</h2>
                <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded text-blue-100">
                  MRN: {patient.mrn}
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                {patient.age} yrs • {patient.gender} • Blood Group: <strong className="text-white">{patient.bloodGroup}</strong> • {patient.city}, Pakistan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              title="Print Medical Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2.5 bg-[#F7FAFF] border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 no-print">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              { id: 'overview', label: 'EHR Overview', icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'predictive-risk', label: 'Predictive Risk (D3)', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> },
              { id: 'history', label: 'Medical History', icon: <History className="w-3.5 h-3.5" /> },
              { id: 'allergies', label: `Allergies (${patientAllergies.length})`, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
              { id: 'medications', label: `Medications`, icon: <Pill className="w-3.5 h-3.5" /> },
              { id: 'labs', label: `Lab Results (${patientLabs.length})`, icon: <FileCheck2 className="w-3.5 h-3.5" /> },
              { id: 'prescriptions', label: `Prescriptions (${patientPrescriptions.length})`, icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
              { id: 'appointments', label: `Appointments (${patientAppointments.length})`, icon: <CalendarClock className="w-3.5 h-3.5" /> },
              { id: 'ai-insights', label: `AI Insights (${patientAIRecommendations.length})`, icon: <Sparkles className="w-3.5 h-3.5 text-[#1F63E8]" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#1F63E8] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenBookAppointment(patient.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Book OPD</span>
            </button>
            <button
              onClick={() => handleOpenRx(patient.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Write Rx</span>
            </button>
            <button
              onClick={onOpenAICaseInvestigator}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#EAF3FF] hover:bg-blue-100 text-[#1459C7] font-bold rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1F63E8]" />
              <span>AI Analyze</span>
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Quick Status & Pakistani Identity */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Clinical Status</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{patient.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskBadges[patient.riskLevel]}`}>
                      {patient.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Dept: {patient.department}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Attending Physician</span>
                  <p className="font-bold text-slate-900 text-sm">{patient.assignedDoctorName}</p>
                  <p className="text-[11px] text-slate-500">Last Visited: {patient.lastVisitDate}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">CNIC / Identification</span>
                  <p className="font-mono font-bold text-slate-900 text-xs">{patient.cnic || '35201-1234567-1'}</p>
                  <p className="text-[11px] text-slate-500">Phone: {patient.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Emergency Contact</span>
                  <p className="font-bold text-slate-900 text-xs">{patient.emergencyContact?.name || 'Guardian'}</p>
                  <p className="text-[11px] text-slate-500">
                    {patient.emergencyContact?.relationship} • {patient.emergencyContact?.phone}
                  </p>
                </div>
              </div>

              {/* Interactive D3.js Predictive Readmission Risk Visualization */}
              <PredictiveRiskScoreChart
                patient={patient}
                labReports={patientLabs}
                prescriptions={patientPrescriptions}
                appointments={patientAppointments}
              />

              {/* Primary Condition & AI Summary Card */}
              <div className="bg-gradient-to-r from-[#EAF3FF] to-blue-50/50 border border-blue-200 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1459C7] flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Primary Clinical Diagnosis:
                  </span>
                  <span className="text-[10px] font-bold bg-white text-[#1459C7] px-2.5 py-0.5 rounded-full border border-blue-200">
                    Active Care Plan
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#082B55]">
                  {patient.primaryCondition}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Patient under ongoing management. Regular monitoring of blood pressure, metabolic parameters, and medication adherence recommended under Pakistan clinical practice guidelines.
                </p>
              </div>

              {/* Recent Vitals Stream */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#1F63E8]" /> Longitudinal Vitals Telemetry
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(patient.vitalsHistory || []).slice(0, 4).map((v, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 block">{v.timestamp}</span>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">BP</span>
                          <span className="font-bold text-slate-900">{v.bloodPressureSystolic}/{v.bloodPressureDiastolic} mmHg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Heart Rate</span>
                          <span className="font-bold text-slate-900">{v.heartRate} bpm</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Temp</span>
                          <span className="font-bold text-slate-900">{v.temperature} °F</span>
                        </div>
                        {v.bloodGlucose && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[11px]">Glucose</span>
                            <span className="font-bold text-[#1459C7]">{v.bloodGlucose} mg/dL</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PREDICTIVE RISK DEDICATED VIEW */}
          {activeTab === 'predictive-risk' && (
            <div className="space-y-6">
              <PredictiveRiskScoreChart
                patient={patient}
                labReports={patientLabs}
                prescriptions={patientPrescriptions}
                appointments={patientAppointments}
              />
            </div>
          )}

          {/* TAB 2: MEDICAL HISTORY & CLINICAL TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#1F63E8]" /> Chronological Clinical Events
                </h4>
                <span className="text-xs text-slate-400">Electronic Clinical Audit</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                {patient.diagnoses && patient.diagnoses.map((diag, idx) => (
                  <div key={diag.id || idx} className="relative space-y-1">
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#1F63E8] ring-4 ring-blue-50" />
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-sm">{diag.condition}</p>
                      <span className="text-[10px] font-semibold text-slate-400">{diag.diagnosedDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Diagnosing Physician: {diag.diagnosedBy}</p>
                    {diag.notes && (
                      <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 leading-relaxed text-xs">
                        {diag.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ALLERGIES */}
          {activeTab === 'allergies' && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Documented Allergies & Drug Contraindications
              </h4>
              {patientAllergies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {patientAllergies.map((alg, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 text-sm">{alg.allergen}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/60 text-amber-900">
                          {alg.severity} Severity
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        Clinical Reaction: {alg.reaction}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs p-6 bg-slate-50 rounded-2xl text-center">
                  No known active drug or food allergies recorded.
                </p>
              )}
            </div>
          )}

          {/* TAB 4: MEDICATIONS & ADHERENCE CHART */}
          {activeTab === 'medications' && (
            <MedicationAdherenceView
              patient={patient}
              prescriptions={patientPrescriptions}
              onShowToast={onShowToast}
            />
          )}

          {/* TAB 5: LAB RESULTS */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" /> Diagnostic & Laboratory Reports
              </h4>
              <div className="space-y-3">
                {patientLabs.map((lab) => (
                  <div key={lab.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{lab.testName}</p>
                        <p className="text-[11px] text-slate-400">{lab.category} • {lab.hospital}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {lab.status}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {lab.parameters.map((param, pIdx) => (
                        <div key={pIdx} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800">{param.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">Ref: {param.referenceRange} {param.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{param.value} {param.unit}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              param.flag === 'Normal' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {param.flag}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {lab.conclusion && (
                      <p className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 border border-slate-100">
                        <strong>Clinical Conclusion:</strong> {lab.conclusion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Prescriptions History
              </h4>
              <div className="space-y-3">
                {patientPrescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-700">{rx.prescriptionNumber}</span>
                      <span className="text-[11px] text-slate-400">{rx.date}</span>
                    </div>
                    <p className="font-bold text-slate-900">Diagnosis: {rx.diagnosis}</p>
                    <div className="space-y-1">
                      {rx.medications.map((m, idx) => (
                        <p key={idx} className="text-xs text-slate-700">
                          • <strong>{m.name}</strong> {m.dosage} — {m.frequency} ({m.duration})
                        </p>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400">Prescribed by {rx.doctorName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-emerald-600" /> Scheduled Consultations
              </h4>
              {patientAppointments.map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{apt.appointmentType} with {apt.doctorName}</p>
                    <p className="text-[11px] text-slate-500">{apt.date} at {apt.timeSlot}</p>
                    <p className="text-[11px] text-slate-600 italic">"{apt.reason}"</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 8: AI INSIGHTS */}
          {activeTab === 'ai-insights' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#1F63E8]" /> AI Decision Support & Trajectory
              </h4>
              {patientAIRecommendations.map((rec) => (
                <div key={rec.id} className="p-4 rounded-2xl bg-[#F7FAFF] border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#082B55] text-xs">{rec.title}</span>
                    <span className="text-[10px] font-bold text-[#1459C7] bg-white px-2 py-0.5 rounded border border-blue-200">
                      Confidence: {rec.aiConfidence}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.insight}</p>
                  <p className="text-[11px] font-semibold text-[#1459C7]">
                    Suggested Action: {rec.suggestedNextSteps[0]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0 no-print">
          <span className="text-[11px] text-slate-400">
            MedAI Pakistan Electronic Health Record • Confidential
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors text-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
