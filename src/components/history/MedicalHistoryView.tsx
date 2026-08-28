import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  Stethoscope,
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  FileCheck2,
  Building,
  User,
  ChevronRight,
  Sparkles,
  HeartPulse,
  Syringe,
  Pill,
  Image as ImageIcon,
  Clock,
  Eye,
} from 'lucide-react';
import { Patient, Doctor } from '../../types';

interface MedicalHistoryViewProps {
  patients?: Patient[];
  doctors?: Doctor[];
  onSelectPatient: (patientId: string) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const MedicalHistoryView: React.FC<MedicalHistoryViewProps> = ({
  patients = [],
  doctors = [],
  onSelectPatient,
  onShowToast = () => {},
}) => {
  const [selectedPatientFilter, setSelectedPatientFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [selectedScanImage, setSelectedScanImage] = useState<string | null>(null);

  // Flatten longitudinal events with rich clinical metadata
  const allEvents = (patients || []).flatMap((patient) => {
    const events = [];

    // 1. Diagnoses events
    if (patient.diagnoses) {
      patient.diagnoses.forEach((d) => {
        events.push({
          id: `ev-diag-${patient.id}-${d.id}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientMrn: patient.mrn,
          patientAge: patient.age,
          patientGender: patient.gender,
          patientCity: patient.city,
          date: d.diagnosedDate || '2026-02-10',
          type: 'Clinical Diagnosis',
          title: d.condition,
          subtitle: `Diagnosed by ${d.diagnosedBy}`,
          details: d.notes || 'Outpatient clinical examination and differential diagnostic confirmation.',
          department: patient.department || 'Cardiovascular Sciences',
          icdCode: d.icdCode || 'I10 (Essential Hypertension)',
          icon: <Stethoscope className="w-4 h-4 text-blue-600" />,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          symptoms: ['Chest tightness on exertion', 'Palpitations', 'Occasional dizziness'],
          treatment: 'Initiated ACE-Inhibitor & Statin therapy. Dietary sodium restriction advised.',
        });
      });
    }

    // 2. Inpatient / Surgical / Procedure history events
    events.push({
      id: `ev-proc-${patient.id}-1`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientMrn: patient.mrn,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientCity: patient.city,
      date: '2026-01-18',
      type: 'Diagnostic Imaging & ECG',
      title: '12-Lead Electrocardiogram & Transthoracic Echocardiogram',
      subtitle: `Ordered by Dr. Ahmed Khan • Webtixa Cardiology Imaging Wing`,
      details: 'Ejection fraction estimated at 55%. Normal LV wall motion without acute ischemic changes.',
      department: 'Cardiology',
      icdCode: 'Z01.810',
      icon: <Activity className="w-4 h-4 text-indigo-600" />,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      symptoms: ['Routine pre-op cardiac clearance'],
      treatment: 'Cleared for elective outpatient procedures.',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
    });

    // 3. Vitals recordings
    if (patient.vitalsHistory) {
      patient.vitalsHistory.forEach((v, idx) => {
        events.push({
          id: `ev-vit-${patient.id}-${idx}`,
          patientId: patient.id,
          patientName: patient.fullName,
          patientMrn: patient.mrn,
          patientAge: patient.age,
          patientGender: patient.gender,
          patientCity: patient.city,
          date: v.timestamp.includes('Today') ? '2026-03-01' : '2026-02-15',
          type: 'Vitals Telemetry',
          title: `Blood Pressure: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg • HR: ${v.heartRate} bpm`,
          subtitle: `Recorded during OPD triage (${v.timestamp})`,
          details: `Patient presented with body temperature ${v.temperature} °F and SpO2 ${v.oxygenSaturation}%. Blood glucose: ${v.bloodGlucose || 110} mg/dL.`,
          department: patient.department || 'Outpatient Clinic',
          icon: <HeartPulse className="w-4 h-4 text-emerald-600" />,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          vitals: v,
        });
      });
    }

    return events;
  });

  // Sort chronologically
  allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEvents = allEvents.filter((ev) => {
    const matchPatient = selectedPatientFilter === 'All' || ev.patientId === selectedPatientFilter;
    const matchType = selectedEventType === 'All' || ev.type === selectedEventType;
    const matchSearch =
      ev.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.patientMrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.details || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchPatient && matchType && matchSearch;
  });

  const eventTypes = ['All', 'Clinical Diagnosis', 'Diagnostic Imaging & ECG', 'Vitals Telemetry'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <History className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Longitudinal Medical History & Timeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Chronological audit of clinical diagnoses, admissions, surgical procedures, vital sign telemetry, and imaging investigations.
          </p>
        </div>
      </div>

      {/* 2. Filters & Patient Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search history by patient name, MRN, clinical finding..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedEventType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedEventType === type
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Patient selector */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Filter Patient:
          </span>
          <select
            value={selectedPatientFilter}
            onChange={(e) => setSelectedPatientFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="All">All Patients ({patients.length})</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.mrn}) - {p.city}
              </option>
            ))}
          </select>

          {selectedPatientFilter !== 'All' && (
            <button
              onClick={() => setSelectedPatientFilter('All')}
              className="text-blue-600 hover:text-blue-700 font-bold ml-2 cursor-pointer"
            >
              Clear Patient Filter
            </button>
          )}
        </div>
      </div>

      {/* 3. Longitudinal Timeline Container */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <History className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No History Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No medical events match your current filter parameters.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-blue-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
            {filteredEvents.map((ev, index) => (
              <div key={ev.id || index} className="relative group">
                {/* Timeline node icon dot */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  {ev.icon}
                </div>

                {/* Event Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${ev.badgeColor}`}>
                        {ev.type}
                      </span>
                      {ev.icdCode && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded-md">
                          ICD-10: {ev.icdCode}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {ev.date}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectPatient(ev.patientId)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-center cursor-pointer"
                    >
                      <span>Patient: {ev.patientName} ({ev.patientMrn})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">{ev.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{ev.subtitle}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {ev.details}
                  </p>

                  {/* Symptoms & Treatment Tags if present */}
                  {ev.symptoms && ev.symptoms.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Presenting Symptoms:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ev.symptoms.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-medium border border-blue-200">
                            • {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ev.treatment && (
                    <div className="text-xs bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-emerald-900 font-medium flex items-start gap-2">
                      <Pill className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Clinical Action / Treatment:</span>
                        <span>{ev.treatment}</span>
                      </div>
                    </div>
                  )}

                  {/* Attached Diagnostic Scan Preview */}
                  {ev.imageUrl && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Attached Radiology Scan:</span>
                      <div
                        onClick={() => setSelectedScanImage(ev.imageUrl)}
                        className="relative w-48 h-28 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group/img"
                      >
                        <img
                          src={ev.imageUrl}
                          alt="Medical scan"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Eye className="w-4 h-4" />
                          <span>View Scan</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal Preview */}
      {selectedScanImage && (
        <div
          onClick={() => setSelectedScanImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 text-white rounded-3xl p-5 max-w-2xl w-full border border-slate-700 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">High-Resolution Diagnostic Imaging Viewer</span>
              <button
                onClick={() => setSelectedScanImage(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl font-bold"
              >
                Close
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800">
              <img
                src={selectedScanImage}
                alt="Enlarged medical scan"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
