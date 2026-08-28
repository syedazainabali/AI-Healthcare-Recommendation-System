import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  AlertTriangle,
  HeartPulse,
  Ambulance,
  Building,
  ShieldAlert,
  MapPin,
  Clock,
  Radio,
} from 'lucide-react';
import { HospitalInfo } from '../../types';

interface EmergencyTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals?: HospitalInfo[];
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const EmergencyTriageModal: React.FC<EmergencyTriageModalProps> = ({
  isOpen,
  onClose,
  hospitals = [],
  onShowToast,
}) => {
  const [selectedCity, setSelectedCity] = useState('All');
  const [isDispatching, setIsDispatching] = useState(false);

  if (!isOpen) return null;

  const handleSimulateDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      onShowToast(
        'Rescue 1122 Triage Dispatched',
        'Telemetry priority alert transmitted to regional emergency coordination center.',
        'success'
      );
    }, 1500);
  };

  const emergencyHospitals = (hospitals || []).filter(
    (h) => selectedCity === 'All' || h.city === selectedCity
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Top Emergency Red Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 via-rose-600 to-[#082B55] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/20 text-white animate-pulse">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold">National Emergency & Trauma Triage (1122)</h3>
                <span className="text-[10px] bg-white text-rose-700 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                  Active 24/7
                </span>
              </div>
              <p className="text-xs text-rose-100">
                Rescue 1122, Edhi Foundation, and Tertiary ICU Trauma Network across Pakistan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Rescue 1122 Fast Dial Strip */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 border-2 border-rose-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                Direct Emergency Rescue Line
              </span>
              <p className="text-3xl font-black text-rose-900 tracking-tight">
                DIAL 1122
              </p>
              <p className="text-xs text-slate-600">
                Instant dispatch for cardiac arrest, severe trauma, stroke, and road traffic emergencies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:1122"
                className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Call 1122 Now</span>
              </a>
            </div>
          </div>

          {/* Manchester Triage System Protocol Reference */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              Emergency Triage Priority Levels (MTS)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] font-extrabold text-rose-700 uppercase block">Red: Immediate</span>
                <p className="font-bold text-rose-950 text-xs">Resuscitation (0 min)</p>
                <p className="text-[10px] text-rose-800 mt-0.5">Cardiac arrest, airway compromise</p>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <span className="text-[10px] font-extrabold text-orange-700 uppercase block">Orange: Very Urgent</span>
                <p className="font-bold text-orange-950 text-xs">Emergent (10 min)</p>
                <p className="text-[10px] text-orange-800 mt-0.5">Severe chest pain, stroke symptoms</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[10px] font-extrabold text-amber-700 uppercase block">Yellow: Urgent</span>
                <p className="font-bold text-amber-950 text-xs">Urgent (60 min)</p>
                <p className="text-[10px] text-amber-800 mt-0.5">Moderate fractures, high fever</p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Green: Standard</span>
                <p className="font-bold text-emerald-950 text-xs">Non-Urgent (120 min)</p>
                <p className="text-[10px] text-emerald-800 mt-0.5">Minor lacerations, mild pain</p>
              </div>
            </div>
          </div>

          {/* Regional Hospital Trauma Emergency Hotlines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#1F63E8]" />
                Tertiary Hospital Trauma Wings & ICU Hotlines
              </h4>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="All">All Cities</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Peshawar">Peshawar</option>
              </select>
            </div>

            <div className="space-y-2">
              {emergencyHospitals.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{h.name}</p>
                    <p className="text-[11px] text-slate-500">{h.city}, Pakistan • {h.address}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      Trauma Bay & ICU Beds: Available
                    </p>
                  </div>

                  <a
                    href={`tel:${h.emergencyContact}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{h.emergencyContact}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-400">
            Pakistan Emergency Medical Service Protocol Integration
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
