import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  PhoneCall,
  BedDouble,
  Activity,
  ShieldCheck,
  Search,
  ExternalLink,
  Users,
  Ambulance,
  HeartPulse,
  Droplet,
  AlertTriangle,
  Send,
  RefreshCw,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { HospitalInfo, HospitalBloodBank, BloodGroup, BloodStockStatus } from '../../types';
import { INITIAL_BLOOD_BANKS } from '../../data/mockData';
import { BloodTransferRequestModal } from './BloodTransferRequestModal';

interface PakistanNetworkViewProps {
  hospitals?: HospitalInfo[];
  bloodBanks?: HospitalBloodBank[];
  onOpenEmergencyModal?: () => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PakistanNetworkView: React.FC<PakistanNetworkViewProps> = ({
  hospitals = [],
  bloodBanks = INITIAL_BLOOD_BANKS,
  onOpenEmergencyModal = () => {},
  onShowToast = (_title?: string, _message?: string, _type?: 'success' | 'info' | 'warning' | 'error') => {},
}) => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'blood-banks'>('blood-banks');
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroupFilter, setSelectedBloodGroupFilter] = useState<string>('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('All');

  // Modal for requesting blood transfers
  const [selectedBankForTransfer, setSelectedBankForTransfer] = useState<HospitalBloodBank | null>(null);
  const [transferModalGroup, setTransferModalGroup] = useState<BloodGroup>('O-');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Filter Hospitals
  const filteredHospitals = (hospitals || []).filter((h) => {
    const matchCity = selectedCity === 'All' || h.city === selectedCity;
    const matchSearch =
      (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.specialties || []).some((s) => (s || '').toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCity && matchSearch;
  });

  const totalBeds = (hospitals || []).reduce((acc, h) => acc + (h.totalBeds || 0), 0);

  // Filter Blood Banks
  const filteredBloodBanks = (bloodBanks || []).filter((bb) => {
    const matchCity = selectedCity === 'All' || bb.city === selectedCity;
    const matchSearch =
      (bb.hospitalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bb.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bb.province || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bb.focalPerson || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Blood Group stock filter
    let matchGroup = true;
    if (selectedBloodGroupFilter !== 'All') {
      const stock = bb.stocks[selectedBloodGroupFilter as BloodGroup];
      if (!stock || stock.unitsAvailable <= 0) matchGroup = false;
      if (selectedStockStatus !== 'All' && stock?.status !== selectedStockStatus) matchGroup = false;
    } else if (selectedStockStatus !== 'All') {
      const hasStatus = Object.values(bb.stocks).some((s) => s.status === selectedStockStatus);
      if (!hasStatus) matchGroup = false;
    }

    return matchCity && matchSearch && matchGroup;
  });

  // Calculate National Blood Telemetry
  const totalNationalBloodUnits = bloodBanks.reduce((acc, b) => acc + (b.totalUnits || 0), 0);
  const totalPlasmaBags = bloodBanks.reduce(
    (acc, b) => acc + Object.values(b.stocks).reduce((sub, s) => sub + (s.plasmaBags || 0), 0),
    0
  );
  const totalPlatelets = bloodBanks.reduce(
    (acc, b) => acc + Object.values(b.stocks).reduce((sub, s) => sub + (s.plateletsUnits || 0), 0),
    0
  );

  const handleOpenTransfer = (bank: HospitalBloodBank, group: BloodGroup = 'O-') => {
    setSelectedBankForTransfer(bank);
    setTransferModalGroup(group);
    setIsTransferModalOpen(true);
  };

  const handleRegisterCamp = () => {
    onShowToast(
      'Blood Donation Drive Scheduled',
      'Community donation drive recorded for Islamabad Capital Territory. Mobile bus dispatch confirmed.',
      'success'
    );
  };

  const getStatusBadge = (status: BloodStockStatus) => {
    switch (status) {
      case 'Adequate':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low Stock':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Critical Shortage':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-extrabold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EAF3FF] text-[#1459C7]">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#082B55] tracking-tight">
              Pakistan National Healthcare & Blood Grid
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Connected hospital nodes, trauma centers, and live National Blood Bank inventory sharing synchronized data under Pakistan Safe Blood Transfusion protocols.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRegisterCamp}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all cursor-pointer shadow-xs"
          >
            <Droplet className="w-4 h-4 text-rose-600" />
            <span>Host Blood Drive</span>
          </button>

          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer self-start md:self-center"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>Emergency 1122 Dispatch</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('blood-banks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'blood-banks'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>National Blood Bank Directory (Live Inventory)</span>
          <span
            className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'blood-banks' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {totalNationalBloodUnits} Units
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hospitals')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'hospitals'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Connected Hospital Nodes</span>
          <span
            className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'hospitals' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {hospitals.length}
          </span>
        </button>
      </div>

      {/* ================= SECTION: NATIONAL BLOOD BANK DIRECTORY ================= */}
      {activeTab === 'blood-banks' && (
        <div className="space-y-6">
          {/* Urgent Blood Callout Notice */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 p-4 sm:p-5 rounded-3xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-white/15 rounded-2xl border border-white/20 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-300 animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full border border-white/20">
                    Active National Shortage Alert
                  </span>
                  <span className="text-xs text-rose-100 font-semibold">
                    Critical O-Negative & AB-Negative Deficits
                  </span>
                </div>
                <p className="text-xs text-rose-100/90 leading-relaxed">
                  Rawalpindi, Islamabad & Quetta trauma centers report under 10 units of O-Negative and AB-Negative blood bags. Prioritized cold-chain transfers and voluntary donor registrations active.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenTransfer(bloodBanks[0], 'O-')}
              className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start md:self-center cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5 text-rose-600" />
              <span>Request Urgent O- Transfer</span>
            </button>
          </div>

          {/* National Blood Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Whole Blood</span>
                <Droplet className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{totalNationalBloodUnits.toLocaleString()} Units</p>
              <p className="text-[11px] text-emerald-600 font-semibold">100% Tested & Nucleic Acid Safe</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Fresh Frozen Plasma</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{totalPlasmaBags} Bags</p>
              <p className="text-[11px] text-slate-500">Stored at -30°C Cryo Units</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Platelet Concentrates</span>
                <HeartPulse className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{totalPlatelets} Units</p>
              <p className="text-[11px] text-slate-500">On Active Agitator Shelves</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Provincial Desks</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">6 Centers</p>
              <p className="text-[11px] text-slate-500">24/7 Regional Transit Grid</p>
            </div>
          </div>

          {/* Blood Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hospital blood bank, city, or focal officer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-400">City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3 py-1.5 bg-[#F7FAFF] border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Pakistan</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-400">Stock Status:</span>
                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="px-3 py-1.5 bg-[#F7FAFF] border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Critical Shortage">Critical Shortage (&lt;10)</option>
                    <option value="Low Stock">Low Stock (10-20)</option>
                    <option value="Moderate">Moderate (20-50)</option>
                    <option value="Adequate">Adequate (&gt;50)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Blood Group Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Filter by Blood Group:</span>
              {['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedBloodGroupFilter(grp)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedBloodGroupFilter === grp
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-[#F7FAFF] text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Banks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBloodBanks.map((bb) => (
              <div
                key={bb.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Bank Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-[#082B55]">
                          {bb.hospitalName}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {bb.address}, {bb.city} ({bb.province})
                      </p>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 whitespace-nowrap">
                      {bb.operatingHours}
                    </span>
                  </div>

                  {/* Focal Person & Telemetry Strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Focal In-Charge</span>
                      <span className="font-semibold text-slate-800 text-[11px] truncate block">{bb.focalPerson}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Ready Units</span>
                      <span className="font-mono font-black text-rose-600 text-sm">{bb.totalUnits} Units</span>
                    </div>
                  </div>

                  {/* 8-Group Live Stock Matrix */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Live Blood Group Availability (Whole Blood Bags)
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => {
                        const stock = bb.stocks[bg];
                        const count = stock?.unitsAvailable ?? 0;
                        const status = stock?.status ?? 'Moderate';

                        return (
                          <div
                            key={bg}
                            onClick={() => handleOpenTransfer(bb, bg)}
                            className="p-2 rounded-xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer text-center space-y-0.5"
                            title={`Click to request ${bg} from ${bb.hospitalName}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-900">{bg}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border ${getStatusBadge(status)}`}>
                                {count}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                              <span>Pl: {stock?.plasmaBags ?? 0}</span>
                              <span>Pt: {stock?.plateletsUnits ?? 0}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Critical Warning if any groups are critical */}
                  {bb.criticalGroups && bb.criticalGroups.length > 0 && (
                    <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200/80 flex items-center justify-between text-xs text-rose-900">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-[11px] font-bold">
                          Critical Shortage: {bb.criticalGroups.join(', ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-rose-700 font-semibold">Priority Restock</span>
                    </div>
                  )}

                  {/* 24/7 Helpline Strip */}
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="text-[10px] text-blue-600 font-bold block uppercase">Blood Bank 24/7 Helpline</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">{bb.contactHelpline}</span>
                      </div>
                    </div>
                    <a
                      href={`tel:${bb.contactHelpline}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      Call Direct
                    </a>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    Sync: <strong className="text-slate-600">{bb.lastInventorySync}</strong>
                  </span>

                  <button
                    onClick={() => handleOpenTransfer(bb, 'O-')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Blood Transfer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION: CONNECTED HOSPITAL NODES ================= */}
      {activeTab === 'hospitals' && (
        <div className="space-y-6">
          {/* Network Live Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Hospital Nodes</span>
                <Building2 className="w-4 h-4 text-[#1F63E8]" />
              </div>
              <p className="text-2xl font-extrabold text-[#082B55]">{hospitals.length} Centers</p>
              <p className="text-[11px] text-slate-500">Tier-1 & Tertiary Care Facilities</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Bed Capacity</span>
                <BedDouble className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#082B55]">{totalBeds.toLocaleString()} Beds</p>
              <p className="text-[11px] text-emerald-700 font-semibold">2,140 Available OPD/IPD</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Trauma & ICU Bays</span>
                <HeartPulse className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#082B55]">480 Critical ICU</p>
              <p className="text-[11px] text-slate-500">76% Average Regional Occupancy</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">EHR Synchronization</span>
                <ShieldCheck className="w-4 h-4 text-[#1459C7]" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">99.9% Uptime</p>
              <p className="text-[11px] text-slate-500">Fast FHIR & PMDC sync enabled</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospital node, city, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F7FAFF] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-400">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 bg-[#F7FAFF] border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
              >
                <option value="All">All Pakistan</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Peshawar">Peshawar</option>
              </select>
            </div>
          </div>

          {/* Hospitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHospitals.map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#082B55]">{h.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {h.city}, Pakistan
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      Node Online
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-[#F7FAFF] p-3 rounded-xl border border-slate-100">
                    {h.address}
                  </p>

                  {/* Specialties */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Specialized Wings
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {h.specialties.map((s, idx) => (
                        <span key={idx} className="text-[10px] font-semibold bg-blue-50 text-[#1459C7] px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Hotline */}
                  <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-rose-600" />
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold block">EMERGENCY DIRECT DIAL</span>
                        <span className="font-bold text-xs text-rose-950 font-mono">{h.emergencyContact}</span>
                      </div>
                    </div>
                    <a
                      href={`tel:${h.emergencyContact}`}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
                    >
                      Call Desk
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Capacity: <strong>{h.totalBeds} Beds</strong></span>
                  <span className="text-emerald-700 font-semibold">ICU: Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requisition & Transfer Dispatch Modal */}
      <BloodTransferRequestModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        selectedBloodBank={selectedBankForTransfer}
        initialBloodGroup={transferModalGroup}
        onShowToast={onShowToast}
      />
    </div>
  );
};
