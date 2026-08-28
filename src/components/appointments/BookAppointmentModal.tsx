import React, { useState } from 'react';
import {
  X,
  CalendarPlus,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building,
  Video,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Patient, Doctor, Appointment, AppointmentType } from '../../types';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients?: Patient[];
  doctors?: Doctor[];
  initialPatientId?: string;
  onBookAppointment: (newAppointment: Appointment) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  patients = [],
  doctors = [],
  initialPatientId,
  onBookAppointment,
  onShowToast,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || patients?.[0]?.id || 'pat-1001');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors?.[0]?.id || 'doc-101');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState<string>('10:30 AM - 11:00 AM');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('OPD Consultation');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
    '04:00 PM - 04:30 PM',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    const doctor = doctors.find((d) => d.id === selectedDoctorId);

    if (!patient || !doctor) {
      onShowToast('Error', 'Please select a valid patient and doctor.', 'error');
      return;
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      doctorSpecialty: doctor.specialty,
      date,
      timeSlot,
      status: 'Confirmed',
      appointmentType,
      department: doctor.department,
      hospital: doctor.hospital,
      reason: reason.trim() || 'Scheduled clinical follow-up and evaluation',
      notes: notes.trim() || 'Booked via MedAI Pakistan clinical desk',
    };

    onBookAppointment(newApt);
    onShowToast('Appointment Scheduled', `Consultation confirmed for ${patient.fullName} with ${doctor.fullName} on ${date} at ${timeSlot}.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#082B55] to-[#1459C7] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Schedule Patient Consultation</h3>
              <p className="text-xs text-blue-100/80">OPD & Telehealth Appointment Scheduling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Select Patient */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#1F63E8]" /> Select Patient *
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (MRN: {p.mrn}) — {p.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Doctor */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" /> Attending Doctor *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.specialty}) — {d.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Date */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#1F63E8]" /> Appointment Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1F63E8]" /> Time Slot *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Type */}
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Consultation Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['OPD Consultation', 'Telehealth', 'Follow-up', 'Emergency Triage'] as const).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setAppointmentType(type)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      appointmentType === type
                        ? 'bg-[#EAF3FF] text-[#1459C7] border-blue-400 font-bold shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason / Chief Complaints */}
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Reason for Visit & Chief Complaints *
              </label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Follow-up for hypertension, persistent cough, routine pediatric growth check..."
                className="w-full p-3 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Additional Notes */}
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Special Instructions or Clinical Pre-requisites
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bring previous fasting blood glucose logs, 12-hour fasting required for lipid panel..."
                className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-[#082B55]">
            <p className="font-semibold">SMS & WhatsApp Notification Active</p>
            <p className="text-slate-600">The patient will receive automated appointment confirmation on their registered Pakistani phone number.</p>
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
              <CalendarPlus className="w-4 h-4" />
              <span>Confirm Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
