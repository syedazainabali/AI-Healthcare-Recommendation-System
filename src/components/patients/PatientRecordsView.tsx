import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Download,
  LayoutGrid,
  List,
  ChevronRight,
  Stethoscope,
  MapPin,
  Phone,
  Sparkles,
  HeartPulse,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  CalendarPlus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Patient, RiskLevel, PatientStatus } from '../../types';

interface PatientRecordsViewProps {
  patients?: Patient[];
  onSelectPatient: (patientId: string) => void;
  onOpenAddPatient: () => void;
  onOpenAICaseInvestigator?: () => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PatientRecordsView: React.FC<PatientRecordsViewProps> = ({
  patients = [],
  onSelectPatient,
  onOpenAddPatient,
  onOpenAICaseInvestigator = () => {},
  onShowToast = (_t: string, _m: string, _type?: string) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredPatients = patients.filter((p) => {
    const matchSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.cnic && p.cnic.includes(searchQuery)) ||
      p.primaryCondition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCity = selectedCity === 'All' || p.city === selectedCity;
    const matchRisk = selectedRisk === 'All' || p.riskLevel === selectedRisk;
    const matchStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchSearch && matchCity && matchRisk && matchStatus;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['MRN,Full Name,Age,Gender,Blood Group,City,Phone,Status,Risk Level,Primary Condition']
        .concat(
          filteredPatients.map(
            (p) =>
              `"${p.mrn}","${p.fullName}",${p.age},"${p.gender}","${p.bloodGroup}","${p.city}","${p.phone}","${p.status}","${p.riskLevel}","${p.primaryCondition}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `webtixa_patient_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Records Exported', `Downloaded CSV list of ${filteredPatients.length} patient records.`, 'success');
  };

  const riskBadges: Record<string, string> = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Moderate: 'bg-blue-50 text-blue-700 border-blue-200',
    Elevated: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusBadges: Record<string, string> = {
    Stable: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200',
    'Under Observation': 'bg-amber-50 text-amber-700 border-amber-200',
    Discharged: 'bg-slate-100 text-slate-700 border-slate-200',
    'Follow-up Needed': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const cities = ['All', ...Array.from(new Set(patients.map((p) => p.city)))];

  const highRiskCount = patients.filter((p) => p.riskLevel === 'High' || p.riskLevel === 'Elevated').length;
  const criticalCount = patients.filter((p) => p.status === 'Critical' || p.status === 'Under Observation').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Electronic Health Records (EHR / EMR)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Standardized longitudinal patient profiles, predictive risk stratification, clinical vitals history, and multidisciplinary records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddPatient}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* 2. Patient Census Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Total Enrolled</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{patients.length}</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Digital Profiles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Elevated / High Risk</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{highRiskCount}</p>
          <span className="text-[11px] text-rose-500 font-bold">AI Flagged for Monitoring</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Critical / In-Observation</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{criticalCount}</p>
          <span className="text-[11px] text-amber-600 font-bold">Bedside Vitals Active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Allergy Protocols</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {patients.filter((p) => p.allergies && p.allergies.length > 0).length}
          </p>
          <span className="text-[11px] text-blue-600 font-bold">Cross-Check Safeguard</span>
        </div>
      </div>

      {/* 3. Search & Multi-Filter Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by MRN (e.g. PK-MED-...), Name, CNIC, Phone, or Diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By:</span>
          </div>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                City: {c}
              </option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="All">Risk: All Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="Elevated">Elevated Risk</option>
            <option value="High">High Risk</option>
          </select>

          {/* Clinical Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="All">Status: All Statuses</option>
            <option value="Stable">Stable</option>
            <option value="Critical">Critical</option>
            <option value="Under Observation">Under Observation</option>
            <option value="Follow-up Needed">Follow-up Needed</option>
            <option value="Discharged">Discharged</option>
          </select>

          {(searchQuery || selectedCity !== 'All' || selectedRisk !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('All');
                setSelectedRisk('All');
                setSelectedStatus('All');
              }}
              className="text-blue-600 hover:text-blue-700 font-bold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Display: Table vs Grid Mode */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Patient Records Match Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or removing filter parameters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">PATIENT NAME & LOCATION</th>
                  <th className="py-3.5 px-4">MRN</th>
                  <th className="py-3.5 px-4">AGE / GENDER</th>
                  <th className="py-3.5 px-4">BLOOD</th>
                  <th className="py-3.5 px-4">PRIMARY DIAGNOSIS</th>
                  <th className="py-3.5 px-4">LATEST VITALS</th>
                  <th className="py-3.5 px-4">PREDICTIVE RISK</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => {
                  const latestVital = p.vitalsHistory && p.vitalsHistory.length > 0 ? p.vitalsHistory[0] : null;

                  return (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                            alt={p.fullName}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <button
                              onClick={() => onSelectPatient(p.id)}
                              className="font-bold text-slate-900 text-xs hover:text-blue-600 text-left cursor-pointer"
                            >
                              {p.fullName}
                            </button>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" /> {p.city} • {p.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-xs">{p.mrn}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.age} yrs • {p.gender}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.bloodGroup}</td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">{p.primaryCondition}</p>
                        {p.allergies && p.allergies.length > 0 && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200">
                            ⚠️ Allergy: {p.allergies[0].allergen}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {latestVital ? (
                          <div className="text-[11px] font-mono text-slate-700">
                            <span className="font-bold">{latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic}</span> mmHg
                            <span className="text-slate-400 block text-[10px]">{latestVital.heartRate} bpm • {latestVital.oxygenSaturation}% SpO2</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No recent vitals</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${riskBadges[p.riskLevel] || 'bg-slate-100 text-slate-700'}`}>
                          {p.riskLevel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${statusBadges[p.status] || 'bg-slate-100 text-slate-700'}`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectPatient(p.id)}
                          className="px-3 py-1.5 bg-white hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-600 transition-all cursor-pointer shadow-xs"
                        >
                          View 360° EHR
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((p) => {
            const latestVital = p.vitalsHistory && p.vitalsHistory.length > 0 ? p.vitalsHistory[0] : null;

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                        alt={p.fullName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <h3
                          onClick={() => onSelectPatient(p.id)}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                        >
                          {p.fullName}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono font-bold text-blue-700">{p.mrn}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${riskBadges[p.riskLevel] || 'bg-slate-100 text-slate-700'}`}>
                      {p.riskLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">AGE & GENDER</span>
                      <span className="font-semibold text-slate-800">{p.age} yrs • {p.gender}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">BLOOD GROUP</span>
                      <span className="font-bold text-slate-900">{p.bloodGroup}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Primary Condition</span>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.primaryCondition}</p>
                  </div>

                  {latestVital && (
                    <div className="text-xs bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">BLOOD PRESSURE</span>
                        <span className="font-bold text-blue-900">{latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic} mmHg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">HEART RATE</span>
                        <span className="font-bold text-emerald-700">{latestVital.heartRate} bpm</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">{p.city}</span>
                  <button
                    onClick={() => onSelectPatient(p.id)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Open 360° EHR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
