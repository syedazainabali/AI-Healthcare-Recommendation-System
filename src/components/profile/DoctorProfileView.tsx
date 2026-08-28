import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Calendar,
  Award,
  Stethoscope,
  Save,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface DoctorProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const DoctorProfileView: React.FC<DoctorProfileViewProps> = ({
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
  onUpdateProfile,
  onShowToast,
}) => {
  const [name, setName] = useState(currentUser?.name || 'Dr. Ahmed Khan');
  const [specialty, setSpecialty] = useState(currentUser?.specialty || 'Consultant Cardiologist');
  const [pmdcNumber, setPmdcNumber] = useState(currentUser?.pmdcNumber || 'PMDC-58210-P');
  const [hospital, setHospital] = useState(currentUser?.hospital || 'Islamabad Medical Complex');
  const [department, setDepartment] = useState('Cardiovascular Sciences');
  const [email, setEmail] = useState(currentUser?.email || 'dr.ahmed.khan@medai.pk');
  const [phone, setPhone] = useState(currentUser?.phone || '+92 300 5551234');
  const [city, setCity] = useState(currentUser?.city || 'Islamabad');
  const [bio, setBio] = useState(
    'Fellow of Royal College of Physicians (FRCP UK), Fellow of College of Physicians and Surgeons Pakistan (FCPS). Specializing in interventional cardiology and AI-assisted preventive clinical cardiology.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      name,
      specialty,
      pmdcNumber,
      hospital,
      department,
      email,
      phone,
      city,
    });
    onShowToast('Profile Updated', 'Physician profile and PMDC credentials saved.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-xs">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
          alt={currentUser?.name || 'Doctor Profile'}
          referrerPolicy="no-referrer"
          className="w-24 h-24 rounded-3xl object-cover border-4 border-blue-100 shadow-md flex-shrink-0"
        />

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-extrabold text-[#082B55]">{currentUser?.name || 'Dr. Ahmed Khan'}</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              PMDC Verified
            </span>
          </div>
          <p className="text-xs font-bold text-[#1459C7]">{currentUser?.specialty || 'Cardiology'}</p>
          <p className="text-slate-500 text-[11px]">{currentUser?.hospital || 'Hospital'} • {currentUser?.city || 'Islamabad'}, Pakistan</p>
          <p className="font-mono text-[10px] text-slate-400">PMDC Registration: {currentUser?.pmdcNumber || 'PMDC-58210-P'}</p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-[#082B55] flex items-center gap-2 pb-2 border-b border-slate-100">
          <Stethoscope className="w-4 h-4 text-[#1F63E8]" />
          Professional Credentials & Clinical Affiliation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Medical Specialty *</label>
            <input
              type="text"
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">PMDC Registration Number *</label>
            <input
              type="text"
              required
              value={pmdcNumber}
              onChange={(e) => setPmdcNumber(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Affiliated Hospital *</label>
            <input
              type="text"
              required
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
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
            <label className="font-semibold text-slate-700 block mb-1">City, Pakistan</label>
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
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Clinical Biography & Credentials</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1F63E8] hover:bg-[#1459C7] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
