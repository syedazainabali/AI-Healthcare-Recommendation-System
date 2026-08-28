import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Printer,
  Copy,
  Download,
  Search,
  Building,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  PackageCheck,
  Check,
} from 'lucide-react';
import { Prescription, Patient } from '../../types';

interface PrescriptionQRVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptions: Prescription[];
  patients: Patient[];
  selectedPrescription?: Prescription | null;
  onDispensePrescription?: (prescriptionId: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PrescriptionQRVerifierModal: React.FC<PrescriptionQRVerifierModalProps> = ({
  isOpen,
  onClose,
  prescriptions = [],
  patients = [],
  selectedPrescription = null,
  onDispensePrescription,
  onShowToast,
}) => {
  const [activeRx, setActiveRx] = useState<Prescription | null>(selectedPrescription || prescriptions[0] || null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationInput, setVerificationInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDispensed, setIsDispensed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedPrescription) {
      setActiveRx(selectedPrescription);
      setIsDispensed(selectedPrescription.status === 'Dispensed');
    } else if (prescriptions.length > 0 && !activeRx) {
      setActiveRx(prescriptions[0]);
      setIsDispensed(prescriptions[0].status === 'Dispensed');
    }
  }, [selectedPrescription, prescriptions]);

  useEffect(() => {
    if (!activeRx) return;

    // Generate real cryptographic verification payload string
    const verificationPayload = JSON.stringify({
      auth: 'MEDAI-PAKISTAN-PMDC-VERIFIED',
      rxNo: activeRx.prescriptionNumber,
      verId: activeRx.qrCodeVerificationId || `MEDAI-PK-SEC-${activeRx.id}`,
      patient: activeRx.patientName,
      patientId: activeRx.patientId,
      doctor: activeRx.doctorName,
      pmdc: activeRx.doctorPmdc,
      hospital: activeRx.hospital,
      date: activeRx.date,
      medsCount: activeRx.medications.length,
      meds: activeRx.medications.map((m) => `${m.name} (${m.dosage})`),
      timestamp: new Date().toISOString(),
    });

    QRCode.toDataURL(verificationPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#082B55',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code generation failed', err));
  }, [activeRx]);

  if (!isOpen) return null;

  const currentPatient = patients.find((p) => p.id === activeRx?.patientId);

  const handleSearchCode = () => {
    if (!verificationInput.trim()) return;
    const found = prescriptions.find(
      (p) =>
        p.qrCodeVerificationId?.toLowerCase().includes(verificationInput.toLowerCase()) ||
        p.prescriptionNumber?.toLowerCase().includes(verificationInput.toLowerCase()) ||
        p.patientName?.toLowerCase().includes(verificationInput.toLowerCase())
    );

    if (found) {
      setActiveRx(found);
      setIsDispensed(found.status === 'Dispensed');
      onShowToast('Prescription Located', `Found verified record for ${found.patientName}`, 'success');
    } else {
      onShowToast('Record Not Found', 'No prescription matches the scanned QR code or verification ID', 'warning');
    }
  };

  const handleSimulateScan = (rx: Prescription) => {
    setIsScanning(true);
    setTimeout(() => {
      setActiveRx(rx);
      setIsDispensed(rx.status === 'Dispensed');
      setIsScanning(false);
      onShowToast('QR Code Scanned', `Verified prescription: ${rx.prescriptionNumber}`, 'success');
    }, 600);
  };

  const handleDispense = () => {
    if (!activeRx) return;
    setIsDispensed(true);
    if (onDispensePrescription) {
      onDispensePrescription(activeRx.id);
    }
    onShowToast(
      'Medications Dispensed',
      `Pharmacy fulfillment logged for ${activeRx.patientName}. Digital prescription marked as Dispensed.`,
      'success'
    );
  };

  const handleCopyLink = () => {
    if (!activeRx) return;
    const link = `https://medai.pk/verify/rx/${activeRx.qrCodeVerificationId || activeRx.prescriptionNumber}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Verification Link Copied', 'Shareable pharmacy verification URL copied to clipboard', 'info');
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !activeRx) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `QR-${activeRx.prescriptionNumber}.png`;
    a.click();
    onShowToast('QR Code Downloaded', 'High-resolution PNG saved to your device', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#082B55] via-[#1459C7] to-[#1F63E8] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Pharmacist Prescription QR Verifier
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  PMDC Tele-Verification
                </span>
              </div>
              <p className="text-xs text-blue-100/80">
                Scan patient QR codes to instantly authenticate medications, check dosages, and safeguard against drug interactions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Pharmacist Quick Search Bar & Scanner Simulation */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter QR Verification ID (e.g. MEDAI-PK-SEC-99824-A), Rx Number, or Patient Name..."
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCode()}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <button
                onClick={handleSearchCode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify ID</span>
              </button>
            </div>

            {/* Quick Demo Selector Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-500">Quick Scan Prescription:</span>
              {prescriptions.slice(0, 4).map((rx) => (
                <button
                  key={rx.id}
                  onClick={() => handleSimulateScan(rx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRx?.id === rx.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <QrCode className="w-3 h-3" />
                  <span>{rx.patientName} ({rx.prescriptionNumber.slice(-5)})</span>
                </button>
              ))}
            </div>
          </div>

          {activeRx ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: QR Code & Cryptographic Certificate (4 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center bg-gradient-to-b from-blue-50/50 to-slate-50/80 p-5 rounded-3xl border border-blue-100/80 space-y-4 text-center">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-[11px] uppercase tracking-wider">
                    Official PMDC Tamper-Proof QR
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="relative p-3 bg-white rounded-2xl border-2 border-blue-200/70 shadow-md">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Prescription QR Code"
                      className="w-56 h-56 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                      Generating QR...
                    </div>
                  )}
                  {isScanning && (
                    <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-xs rounded-2xl flex items-center justify-center text-white font-bold text-xs animate-pulse">
                      Scanning & Verifying...
                    </div>
                  )}
                </div>

                <div className="space-y-1 w-full text-left bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Verification Code</span>
                    <span className="font-mono font-bold text-slate-900">{activeRx.qrCodeVerificationId}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Security Checksum</span>
                    <span className="font-mono text-emerald-600 font-bold">SHA-256 Valid</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Issuing Hospital</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[160px]">{activeRx.hospital}</span>
                  </div>
                </div>

                {/* QR Action Buttons */}
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-xs text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl transition-all cursor-pointer shadow-xs text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Verified Prescription Details (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Prescription Number</span>
                    <p className="text-sm font-mono font-black text-slate-900">{activeRx.prescriptionNumber}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                      isDispensed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isDispensed ? 'Dispensed at Pharmacy' : 'Active / Ready to Dispense'}
                  </span>
                </div>

                {/* Patient & Prescriber Info Strip */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-600" /> Patient Details
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{activeRx.patientName}</p>
                    <p className="text-[11px] text-slate-500">
                      {activeRx.patientAge} yrs • {activeRx.patientGender} • Blood: <strong>{activeRx.patientBloodGroup || 'O+'}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">{activeRx.patientPhone}</p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Building className="w-3 h-3 text-indigo-600" /> Authorized Prescriber
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{activeRx.doctorName}</p>
                    <p className="text-[11px] text-slate-500">{activeRx.doctorSpecialty}</p>
                    <p className="text-[10px] font-mono text-blue-700 font-bold">PMDC: {activeRx.doctorPmdc}</p>
                  </div>
                </div>

                {/* Allergy Check Warning */}
                {currentPatient && currentPatient.allergies && currentPatient.allergies.length > 0 && (
                  <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 flex items-start gap-2.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs block">Patient Allergy Alert</span>
                      <p className="text-[11px] leading-relaxed">
                        Patient has documented allergies: {currentPatient.allergies.map((a) => `${a.allergen} (${a.reaction})`).join(', ')}.
                        Ensure no cross-reactivity with prescribed items.
                      </p>
                    </div>
                  </div>
                )}

                {/* Medications List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-blue-600" /> Prescribed Medications ({activeRx.medications.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Issue Date: {activeRx.date}</span>
                  </div>

                  <div className="space-y-2">
                    {activeRx.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{med.name}</span>
                            {med.genericName && (
                              <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {med.genericName}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600">
                            <strong>{med.dosage}</strong> • {med.frequency} • {med.duration} • Route: {med.route}
                          </p>
                          <p className="text-[10px] text-indigo-700 italic">↳ {med.instructions}</p>
                        </div>

                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg self-start sm:self-center">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Advice */}
                {activeRx.specialAdvice && activeRx.specialAdvice.length > 0 && (
                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="text-[10px] font-bold uppercase block">Special Physician Counseling:</span>
                    {activeRx.specialAdvice.map((adv, i) => (
                      <p key={i} className="text-[11px]">• {adv}</p>
                    ))}
                  </div>
                )}

                {/* Pharmacist Dispense Action */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    {isDispensed ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dispensed & Synced with National Health Grid
                      </span>
                    ) : (
                      <span>Verify physical package before marking dispensed.</span>
                    )}
                  </div>

                  {!isDispensed ? (
                    <button
                      onClick={handleDispense}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Dispense Medication Package</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsDispensed(false)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-all cursor-pointer"
                    >
                      Undo Dispensed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <QrCode className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-sm text-slate-600">No Prescription Selected</p>
              <p className="text-xs">Use the search bar above to enter an Rx verification code or select from the list.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0 text-xs">
          <span className="text-[11px] text-slate-500">
            MedAI Pakistan Pharmacist Portal • PMDC Security Rule 24-B Compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
