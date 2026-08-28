import React, { useState } from 'react';
import {
  X,
  UserPlus,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Save,
} from 'lucide-react';
import { Patient, BloodGroup, Gender, PatientStatus, RiskLevel, Doctor } from '../../types';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors?: Doctor[];
  onAddPatient: (newPatient: Patient) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  doctors = [],
  onAddPatient,
  onShowToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<Gender>('Male');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [cnic, setCnic] = useState('35201-');
  const [phone, setPhone] = useState('+92 300 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Islamabad');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+92 300 ');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [assignedDoctorId, setAssignedDoctorId] = useState(doctors?.[0]?.id || 'doc-101');
  const [department, setDepartment] = useState('Cardiovascular Sciences');
  const [primaryCondition, setPrimaryCondition] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [systolicBP, setSystolicBP] = useState(120);
  const [diastolicBP, setDiastolicBP] = useState(80);
  const [heartRate, setHeartRate] = useState(76);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Moderate');
  const [status, setStatus] = useState<PatientStatus>('Stable');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      onShowToast('Missing Required Field', 'Please provide the patient full name.', 'warning');
      return;
    }

    const assignedDoc = doctors.find((d) => d.id === assignedDoctorId) || doctors[0];
    const generatedMrn = `PK-MED-${Math.floor(10000 + Math.random() * 90000)}`;

    const parsedAllergies = allergiesText.trim()
      ? allergiesText.split(',').map((a) => ({
          allergen: a.trim(),
          severity: 'Moderate' as const,
          reaction: 'Reported by patient during clinical intake',
        }))
      : [];

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      mrn: generatedMrn,
      fullName: fullName.trim(),
      age: Number(age) || 30,
      gender,
      bloodGroup,
      cnic: cnic.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      city,
      address: address.trim() || `${city}, Pakistan`,
      emergencyContact: {
        name: emergencyName.trim() || 'Next of Kin',
        relationship: emergencyRelation,
        phone: emergencyPhone.trim(),
      },
      assignedDoctorId: assignedDoc.id,
      assignedDoctorName: assignedDoc.fullName,
      department,
      lastVisitDate: new Date().toISOString().split('T')[0],
      status,
      riskLevel,
      primaryCondition: primaryCondition.trim() || 'General Medical Evaluation',
      allergies: parsedAllergies,
      vitalsHistory: [
        {
          timestamp: 'Today (Intake)',
          bloodPressureSystolic: Number(systolicBP) || 120,
          bloodPressureDiastolic: Number(diastolicBP) || 80,
          heartRate: Number(heartRate) || 75,
          temperature: 98.6,
          respiratoryRate: 16,
          oxygenSaturation: 98,
        },
      ],
      diagnoses: [
        {
          id: `diag-${Date.now()}`,
          condition: primaryCondition.trim() || 'General Medical Evaluation',
          diagnosedDate: new Date().toISOString().split('T')[0],
          diagnosedBy: assignedDoc.fullName,
          status: 'Active',
          notes: 'Initial clinical registration on MedAI Pakistan platform.',
        },
      ],
      avatarUrl: `https://images.unsplash.com/photo-${gender === 'Female' ? '1544005313-94ddf0286df2' : '1507003211169-0a1dd7228f2d'}?auto=format&fit=crop&q=80&w=200`,
    };

    onAddPatient(newPatient);
    onShowToast('Patient Registered', `Electronic Health Record created for ${newPatient.fullName} (MRN: ${newPatient.mrn}).`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#082B55] to-[#1459C7] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Register New Patient Record</h3>
              <p className="text-xs text-blue-100/80">Digital EHR Intake & Clinical Profile Setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: Demographics */}
          <div>
            <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#1F63E8]" /> Patient Demographics & Identification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Aslam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Age (Years) *</label>
                <input
                  type="number"
                  min="1"
                  max="115"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-bold text-[#082B55]"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pakistani CNIC / B-Form</label>
                <input
                  type="text"
                  placeholder="35201-xxxxxxx-x"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Regional Location */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1F63E8]" /> Contact & Pakistan Location
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+92 300 xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Quetta">Quetta</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street / Sector / Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  placeholder="Relative / Guardian Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                <select
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Son/Daughter">Son / Daughter</option>
                  <option value="Father/Mother">Father / Mother</option>
                  <option value="Brother/Sister">Brother / Sister</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Phone</label>
                <input
                  type="text"
                  placeholder="+92 300 xxxxxxx"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Assignment & Initial Vitals */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-[#082B55] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#1F63E8]" /> Clinical Assignment & Primary Condition
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Doctor</label>
                <select
                  value={assignedDoctorId}
                  onChange={(e) => {
                    setAssignedDoctorId(e.target.value);
                    const doc = doctors.find((d) => d.id === e.target.value);
                    if (doc) setDepartment(doc.department);
                  }}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-semibold text-[#082B55]"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Risk Stratification</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-bold"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Moderate">Moderate Risk</option>
                  <option value="Elevated">Elevated Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Primary Condition / Chief Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. Essential Hypertension, Seasonal Asthma, Type 2 Diabetes"
                  value={primaryCondition}
                  onChange={(e) => setPrimaryCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Known Allergies (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Peanuts"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Initial Baseline Vitals */}
          <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-blue-200/80 space-y-2">
            <p className="font-bold text-[#082B55] flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              Baseline Vitals Intake (Triage)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-600">Systolic BP (mmHg)</span>
                <input
                  type="number"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mt-0.5"
                />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-600">Diastolic BP (mmHg)</span>
                <input
                  type="number"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mt-0.5"
                />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-600">Heart Rate (bpm)</span>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1F63E8] hover:bg-[#1459C7] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Create Electronic Health Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
