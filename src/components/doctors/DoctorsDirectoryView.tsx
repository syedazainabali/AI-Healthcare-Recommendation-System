import React, { useEffect, useState } from 'react';
import {
  Stethoscope,
  Search,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  Award,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Doctor } from '../../types';

interface DoctorsDirectoryViewProps {
  doctors?: Doctor[];
  onOpenBookAppointment: (doctorId?: string) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const DoctorsDirectoryView: React.FC<DoctorsDirectoryViewProps> = ({
  doctors = [],
  onOpenBookAppointment,
  onShowToast = () => { },
}) => {
  const [dbDoctors, setDbDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        const data = await response.json();

        if (data.success) {
          const mappedDoctors: Doctor[] = data.doctors.map((doc: any) => ({
            id: doc._id,
            fullName: doc.name,
            specialty: doc.specialization,
            department: doc.department || 'General Medicine',
            qualifications: doc.qualification || [],
            pmdcNumber: doc.registrationNumber,
            hospital: doc.hospital,
            city: doc.city,
            consultationFeePkr: doc.consultationFee,
            avatarUrl: doc.avatarUrl || '',
            isAvailableToday: doc.isAvailableToday ?? true,
          }));

          setDbDoctors(mappedDoctors);
        }
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        onShowToast();
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [onShowToast]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const specialties = ['All', 'Cardiology', 'Pulmonology', 'Pediatrics', 'Neurology', 'Internal Medicine', 'Endocrinology'];
  const cities = ['All', 'Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Peshawar'];

  const doctorsToDisplay = dbDoctors.length > 0 ? dbDoctors : doctors;

  const filteredDoctors = (doctorsToDisplay || []).filter((doc) => {
    const matchCity = selectedCity === 'All' || doc.city === selectedCity;
    const matchSpec = selectedSpecialty === 'All' || (doc.specialty || '').toLowerCase().includes(selectedSpecialty.toLowerCase());

    const qualString = Array.isArray(doc.qualifications)
      ? doc.qualifications.join(' ')
      : (doc.qualifications || '');

    const matchSearch =
      (doc.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.hospital || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      qualString.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCity && matchSpec && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EAF3FF] text-[#1459C7]">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#082B55] tracking-tight">
              Physicians & Specialist Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Verified medical faculty, PMDC-registered consultants, and department leads across affiliated Pakistani medical centers.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctor by name, specialty, qualification (FRCP, FCPS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F7FAFF] border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">Specialty:</span>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F7FAFF] border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3.5">
                <img
                  src={doc.avatarUrl}
                  alt={doc.fullName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-100 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-extrabold text-sm text-[#082B55] truncate">{doc.fullName}</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1F63E8] flex-shrink-0" title="PMDC Verified" />
                  </div>
                  <p className="text-xs font-bold text-[#1459C7]">{doc.specialty}</p>
                  <p className="text-[10px] text-slate-400 font-mono">PMDC: {doc.pmdcNumber || doc.pmdcRegNumber || 'PMC-34982-P'}</p>
                </div>
              </div>

              {/* Qualifications */}
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(doc.qualifications)
                  ? doc.qualifications
                  : (doc.qualifications || '').split(',').map((s) => s.trim()).filter(Boolean)
                ).map((q, idx) => (
                  <span key={idx} className="text-[10px] font-semibold bg-[#EAF3FF] text-[#1459C7] px-2 py-0.5 rounded">
                    {q}
                  </span>
                ))}
              </div>

              {/* Hospital & Details */}
              <div className="p-3 bg-[#F7FAFF] rounded-xl border border-slate-100 space-y-1 text-xs">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  {doc.hospital}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {doc.city}, Pakistan • {doc.department}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">OPD Consultation Fee:</span>
                  <strong className="text-emerald-700">
                    {doc.consultationFee || `PKR ${doc.consultationFeePkr?.toLocaleString() || '2,500'}`}
                  </strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">OPD Schedule:</span> {(doc.availableDays || ['Mon', 'Wed', 'Fri']).join(', ')} ({doc.opdTimings || doc.consultationHours || '09:00 AM – 03:00 PM'})
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Available Today
              </span>
              <button
                onClick={() => onOpenBookAppointment(doc.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#1F63E8] hover:bg-[#1459C7] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book OPD</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
