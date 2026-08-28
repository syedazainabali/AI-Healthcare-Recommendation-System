import React, { useState } from 'react';
import {
  CalendarClock,
  Search,
  Filter,
  CalendarPlus,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Video,
  Building,
  User,
  Stethoscope,
  ChevronRight,
  Phone,
  Play,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  FileSpreadsheet,
  Users,
  Sparkles,
} from 'lucide-react';
import { Appointment, Doctor, AppointmentStatus, AppointmentType } from '../../types';

interface AppointmentsViewProps {
  appointments?: Appointment[];
  doctors?: Doctor[];
  onSelectPatient: (patientId: string) => void;
  onOpenBookAppointment: () => void;
  onUpdateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments = [],
  doctors = [],
  onSelectPatient,
  onOpenBookAppointment,
  onUpdateAppointmentStatus,
  onShowToast = (_t: string, _m: string, _type?: string) => {},
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTelehealthApt, setActiveTelehealthApt] = useState<Appointment | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const filteredAppointments = (appointments || []).filter((apt) => {
    const matchStatus = selectedStatus === 'All' || apt.status === selectedStatus;
    const matchDoctor = selectedDoctor === 'All' || apt.doctorId === selectedDoctor;
    const matchType = selectedType === 'All' || apt.appointmentType === selectedType;
    const matchSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchDoctor && matchType && matchSearch;
  });

  const statusColors: Record<AppointmentStatus, { badge: string; border: string }> = {
    Confirmed: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-emerald-100' },
    Pending: { badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-amber-100' },
    Completed: { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-blue-100' },
    Cancelled: { badge: 'bg-slate-100 text-slate-600 border-slate-200', border: 'border-slate-100' },
    'In Progress': { badge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-purple-100' },
  };

  const handleStatusChange = (apt: Appointment, newStatus: AppointmentStatus) => {
    onUpdateAppointmentStatus(apt.id, newStatus);
    onShowToast('Appointment Updated', `Consultation for ${apt.patientName} marked as ${newStatus}.`, 'success');
  };

  const confirmedCount = appointments.filter((a) => a.status === 'Confirmed').length;
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const telehealthCount = appointments.filter((a) => a.appointmentType === 'Telemedicine').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Clinical Appointments & OPD Queue Workflow
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Real-time outpatient clinic scheduling, telemedicine encrypted video rooms, follow-up queues, and multidisciplinary referral management.
          </p>
        </div>

        <button
          onClick={onOpenBookAppointment}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start md:self-center"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book Consultation Token</span>
        </button>
      </div>

      {/* 2. Queue Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Today's Clinic Queue</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{appointments.length}</p>
          <span className="text-[11px] text-blue-600 font-bold">Scheduled Tokens</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Confirmed & Checked-In</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{confirmedCount}</p>
          <span className="text-[11px] text-emerald-600 font-bold">Ready for Doctor Room</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Pending Confirmation</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-amber-600 font-bold">Awaiting Reception Triage</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Telehealth Video Calls</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{telehealthCount}</p>
          <span className="text-[11px] text-indigo-600 font-bold">WebRTC High-Res Encrypted</span>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient, doctor, reason, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['All', 'Confirmed', 'Pending', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Filter Dropdown */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
            Consultant:
          </span>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="All">All Attending Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName} ({d.specialty})
              </option>
            ))}
          </select>

          {selectedDoctor !== 'All' && (
            <button
              onClick={() => setSelectedDoctor('All')}
              className="text-blue-600 hover:text-blue-700 font-bold ml-2 cursor-pointer"
            >
              Clear Doctor Filter
            </button>
          )}
        </div>
      </div>

      {/* 4. Appointments Grid */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Appointments Match Criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No appointments found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAppointments.map((apt) => {
              const statusCfg = statusColors[apt.status] || {
                badge: 'bg-slate-100 text-slate-600 border-slate-200',
                border: 'border-slate-200',
              };

              const isTelehealth = apt.appointmentType === 'Telemedicine';

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Time slot & status header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center font-black text-xs shadow-xs flex-shrink-0">
                          <span>{apt.timeSlot.split(' ')[0]}</span>
                          <span className="text-[9px] text-slate-400 font-normal">{apt.timeSlot.split(' ')[1] || 'AM'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400">{apt.date}</span>
                            {isTelehealth && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <Video className="w-2.5 h-2.5" /> Telehealth
                              </span>
                            )}
                          </div>
                          <h4
                            onClick={() => onSelectPatient(apt.patientId)}
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                          >
                            {apt.patientName} ({apt.patientAge} yrs • {apt.patientGender})
                          </h4>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusCfg.badge}`}>
                        {apt.status}
                      </span>
                    </div>

                    {/* Department & Doctor */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">CONSULTANT</span>
                        <span className="font-bold text-slate-900">{apt.doctorName}</span>
                        <span className="text-[10px] text-slate-500 block">{apt.department}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">CONTACT PHONE</span>
                        <span className="font-medium text-slate-700">{apt.patientPhone}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Consultation Reason:</span>
                      <p className="text-xs text-slate-700 font-medium italic mt-0.5">"{apt.reason}"</p>
                    </div>
                  </div>

                  {/* Action workflow buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Status dropdown transition */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">Status:</span>
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt, e.target.value as AppointmentStatus)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Room</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {isTelehealth && (
                        <button
                          onClick={() => setActiveTelehealthApt(apt)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectPatient(apt.patientId)}
                        className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Open EHR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simulated Telemedicine Video Consultation Room Modal */}
      {activeTelehealthApt && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-4xl w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-black text-white text-base">
                  Encrypted Telemedicine Session • {activeTelehealthApt.patientName}
                </h3>
              </div>
              <button
                onClick={() => setActiveTelehealthApt(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Exit Room
              </button>
            </div>

            {/* Video Call Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor View */}
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 h-64 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600"
                  alt="Doctor Stream"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-xs font-bold px-2.5 py-1 rounded-lg">
                  You (Dr. Ahmed Khan)
                </span>
              </div>

              {/* Patient View */}
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 h-64 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600"
                  alt="Patient Stream"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-xs font-bold px-2.5 py-1 rounded-lg">
                  {activeTelehealthApt.patientName} (Online)
                </span>
                <span className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  HD 1080p • 60 FPS
                </span>
              </div>
            </div>

            {/* Call Controls Bar */}
            <div className="flex items-center justify-center gap-4 bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                title="Mute Audio"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full transition-colors ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                title="Toggle Camera"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  onSelectPatient(activeTelehealthApt.patientId);
                  setActiveTelehealthApt(null);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Open EHR in Side Panel
              </button>

              <button
                onClick={() => {
                  handleStatusChange(activeTelehealthApt, 'Completed');
                  setActiveTelehealthApt(null);
                }}
                className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow-md"
                title="End Consultation"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
