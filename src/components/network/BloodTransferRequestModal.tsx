import React, { useState } from 'react';
import {
  X,
  Droplet,
  Ambulance,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { HospitalBloodBank, BloodGroup } from '../../types';

interface BloodTransferRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBloodBank: HospitalBloodBank | null;
  initialBloodGroup?: BloodGroup;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BloodTransferRequestModal: React.FC<BloodTransferRequestModalProps> = ({
  isOpen,
  onClose,
  selectedBloodBank,
  initialBloodGroup = 'O-',
  onShowToast,
}) => {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(initialBloodGroup);
  const [unitsRequested, setUnitsRequested] = useState<number>(2);
  const [urgencyLevel, setUrgencyLevel] = useState<'Emergency STAT (15 min)' | 'Urgent Surgery (1-2 hrs)' | 'Routine OPD Restock'>(
    'Emergency STAT (15 min)'
  );
  const [receivingHospital, setReceivingHospital] = useState('Webtixa Healthcare & Medical Complex, Islamabad');
  const [clinicalReason, setClinicalReason] = useState('Acute trauma resuscitation / Major hemorrhage');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !selectedBloodBank) return null;

  const currentStock = selectedBloodBank.stocks[bloodGroup];
  const availableUnits = currentStock?.unitsAvailable ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unitsRequested <= 0) {
      onShowToast('Invalid Quantity', 'Please request at least 1 blood unit', 'warning');
      return;
    }

    if (unitsRequested > availableUnits) {
      onShowToast(
        'Quantity Exceeds Available Stock',
        `Only ${availableUnits} units of ${bloodGroup} currently in stock at ${selectedBloodBank.hospitalName}`,
        'warning'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onShowToast(
        'Blood Transfer Dispatched',
        `Requisition for ${unitsRequested} units of ${bloodGroup} sent to ${selectedBloodBank.hospitalName}. Emergency refrigerated ambulance 1122 assigned.`,
        'success'
      );
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl border border-white/25">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                National Blood Unit Requisition
              </h2>
              <p className="text-xs text-rose-100/90">
                Inter-hospital emergency cold-chain blood transfer dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Target Bank Card */}
          <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">Supplying Blood Center:</span>
            <p className="font-extrabold text-sm text-slate-900">{selectedBloodBank.hospitalName}</p>
            <p className="text-[11px] text-slate-500">{selectedBloodBank.city}, {selectedBloodBank.province} • Helpline: <strong className="text-slate-800">{selectedBloodBank.contactHelpline}</strong></p>
          </div>

          {/* Blood Group Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Required Blood Group & Current Availability
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => {
                const stock = selectedBloodBank.stocks[bg];
                const count = stock?.unitsAvailable ?? 0;
                const isSelected = bloodGroup === bg;
                return (
                  <button
                    type="button"
                    key={bg}
                    onClick={() => setBloodGroup(bg)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    <span className="font-extrabold text-sm block">{bg}</span>
                    <span className={`text-[10px] font-semibold block ${isSelected ? 'text-rose-100' : 'text-slate-500'}`}>
                      {count} Units Avail.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Units Quantity & Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Units Requested (Bags)
              </label>
              <input
                type="number"
                min={1}
                max={availableUnits || 10}
                value={unitsRequested}
                onChange={(e) => setUnitsRequested(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
              <span className="text-[10px] text-slate-400">Max available: {availableUnits} units</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Priority & Transit Urgency
              </label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="Emergency STAT (15 min)">Emergency STAT (15 min)</option>
                <option value="Urgent Surgery (1-2 hrs)">Urgent Surgery (1-2 hrs)</option>
                <option value="Routine OPD Restock">Routine OPD Restock</option>
              </select>
            </div>
          </div>

          {/* Receiving Center */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Receiving Hospital Node
            </label>
            <input
              type="text"
              value={receivingHospital}
              onChange={(e) => setReceivingHospital(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* Clinical Justification */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Clinical Indication / Surgical Note
            </label>
            <textarea
              rows={2}
              value={clinicalReason}
              onChange={(e) => setClinicalReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              placeholder="State patient condition, surgical procedure, or acute loss indication..."
            />
          </div>

          {/* Cold Chain Guarantee Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-slate-600 text-[11px]">
            <Ambulance className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              All transfers comply with Pakistan Safe Blood Transfusion Authority (SBTA) +4°C cold-chain standards with active GPS tracker.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableUnits === 0}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Emergency Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
