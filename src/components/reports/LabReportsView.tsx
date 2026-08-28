import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  Filter,
  Stethoscope,
  ChevronRight,
  Clock,
  Eye,
  Sliders,
  Maximize2,
  Layers,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { LabReport, Patient } from '../../types';

interface LabReportsViewProps {
  labReports?: LabReport[];
  patients?: Patient[];
  onSelectPatient: (patientId: string) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const LabReportsView: React.FC<LabReportsViewProps> = ({
  labReports = [],
  patients = [],
  onSelectPatient,
  onShowToast = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeReportForDetail, setActiveReportForDetail] = useState<LabReport | null>(null);
  const [activeScanViewer, setActiveScanViewer] = useState<LabReport | null>(null);
  const [scanContrast, setScanContrast] = useState(100);
  const [showAIBoundingBox, setShowAIBoundingBox] = useState(true);

  const categories = ['All', 'Biochemistry', 'Hematology', 'Radiology', 'Pathology', 'Cardiology'];

  // Ensure rich default lab reports if empty
  const defaultReports: LabReport[] = [
    {
      id: 'rep-101',
      patientId: 'pat-001',
      patientName: 'Muhammad Usman',
      patientAge: 54,
      patientGender: 'Male',
      reportName: 'Comprehensive Metabolic Panel (CMP) & Lipid Profile',
      category: 'Biochemistry',
      sampleCollectionDate: '2026-02-28 (08:30 AM)',
      reportDate: '2026-02-28 (11:45 AM)',
      orderingDoctor: 'Dr. Ahmed Khan (Cardiology)',
      pathologist: 'Dr. Zulfiqar Mirza (Senior Pathologist)',
      hospitalLab: 'Webtixa Central Diagnostic Laboratory',
      overallStatus: 'Needs Review',
      summaryNotes: 'Elevated fasting blood glucose and borderline serum creatinine. Lipid panel shows elevated LDL-C (142 mg/dL). Clinical correlation advised.',
      results: [
        { name: 'Fasting Blood Glucose', value: '138', unit: 'mg/dL', referenceRange: '70 - 99', status: 'Needs Review', flag: 'High' },
        { name: 'HbA1c', value: '7.1', unit: '%', referenceRange: '4.0 - 5.6', status: 'Needs Review', flag: 'High' },
        { name: 'Serum Creatinine', value: '1.42', unit: 'mg/dL', referenceRange: '0.7 - 1.3', status: 'Needs Review', flag: 'High' },
        { name: 'eGFR', value: '62', unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'Needs Review', flag: 'Low' },
        { name: 'Total Cholesterol', value: '215', unit: 'mg/dL', referenceRange: '< 200', status: 'Needs Review', flag: 'High' },
        { name: 'LDL Cholesterol', value: '142', unit: 'mg/dL', referenceRange: '< 100', status: 'Needs Review', flag: 'High' },
        { name: 'HDL Cholesterol', value: '42', unit: 'mg/dL', referenceRange: '> 40', status: 'Normal' },
        { name: 'Triglycerides', value: '178', unit: 'mg/dL', referenceRange: '< 150', status: 'Needs Review', flag: 'High' },
      ],
    },
    {
      id: 'rep-102',
      patientId: 'pat-002',
      patientName: 'Fatima Zahra',
      patientAge: 28,
      patientGender: 'Female',
      reportName: 'High-Resolution Chest Radiograph (CXR PA View)',
      category: 'Radiology',
      sampleCollectionDate: '2026-03-01 (10:15 AM)',
      reportDate: '2026-03-01 (11:00 AM)',
      orderingDoctor: 'Dr. Sana Javed (Internal Medicine)',
      pathologist: 'Dr. Imran Qureshi (Consultant Radiologist)',
      hospitalLab: 'Webtixa Advanced Medical Imaging Suite',
      overallStatus: 'Normal',
      summaryNotes: 'Lungs are clear with no focal consolidation, pleural effusion, or pneumothorax. Cardiothoracic ratio is within normal limits (CTR < 0.50). Normal mediastinal contour.',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
      results: [
        { name: 'Lung Parenchyma', value: 'Clear', unit: '-', referenceRange: 'Clear', status: 'Normal' },
        { name: 'Pleural Spaces', value: 'Costophrenic Angles Sharp', unit: '-', referenceRange: 'Clear', status: 'Normal' },
        { name: 'Cardiothoracic Ratio', value: '0.44', unit: '-', referenceRange: '< 0.50', status: 'Normal' },
        { name: 'Thoracic Skeletal Frame', value: 'Intact', unit: '-', referenceRange: 'Intact', status: 'Normal' },
      ],
    },
    {
      id: 'rep-103',
      patientId: 'pat-003',
      patientName: 'Bilal Hussain',
      patientAge: 62,
      patientGender: 'Male',
      reportName: 'Brain Magnetic Resonance Imaging (MRI T1/T2/FLAIR)',
      category: 'Radiology',
      sampleCollectionDate: '2026-02-25 (02:00 PM)',
      reportDate: '2026-02-25 (04:30 PM)',
      orderingDoctor: 'Prof. Dr. Tariq Mahmood (Neurology)',
      pathologist: 'Dr. Imran Qureshi (Senior Neuroradiologist)',
      hospitalLab: 'Webtixa Advanced Medical Imaging Suite',
      overallStatus: 'Needs Review',
      summaryNotes: 'Mild microvascular ischemic white matter changes in periventricular regions consistent with chronic hypertension. No acute intracranial hemorrhage or territorial infarction identified.',
      imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
      results: [
        { name: 'Acute Infarction (DWI)', value: 'Negative', unit: '-', referenceRange: 'Negative', status: 'Normal' },
        { name: 'White Matter Hyperintensity', value: 'Fazekas Grade 1', unit: '-', referenceRange: 'Grade 0-1', status: 'Needs Review', flag: 'Mild' },
        { name: 'Mass Effect / Midline Shift', value: 'None', unit: '-', referenceRange: 'None', status: 'Normal' },
        { name: 'Ventricular Size', value: 'Age-Appropriate', unit: '-', referenceRange: 'Normal', status: 'Normal' },
      ],
    },
    {
      id: 'rep-104',
      patientId: 'pat-004',
      patientName: 'Ayesha Siddiqui',
      patientAge: 8,
      patientGender: 'Female',
      reportName: 'Complete Blood Count (CBC) with Peripheral Smear',
      category: 'Hematology',
      sampleCollectionDate: '2026-03-01 (09:00 AM)',
      reportDate: '2026-03-01 (10:30 AM)',
      orderingDoctor: 'Dr. Ayesha Malik (Pediatrics)',
      pathologist: 'Dr. Zulfiqar Mirza (Senior Pathologist)',
      hospitalLab: 'Webtixa Central Diagnostic Laboratory',
      overallStatus: 'Normal',
      summaryNotes: 'All hematological parameters within healthy pediatric reference intervals. Adequate platelet count and normal leukocyte differential.',
      results: [
        { name: 'Hemoglobin (Hb)', value: '12.8', unit: 'g/dL', referenceRange: '11.5 - 14.5', status: 'Normal' },
        { name: 'Total Leukocyte Count (WBC)', value: '6,800', unit: '/mcL', referenceRange: '5,000 - 13,000', status: 'Normal' },
        { name: 'Platelet Count', value: '290,000', unit: '/mcL', referenceRange: '150,000 - 450,000', status: 'Normal' },
        { name: 'Absolute Neutrophil Count', value: '58', unit: '%', referenceRange: '40 - 70', status: 'Normal' },
        { name: 'Lymphocytes', value: '34', unit: '%', referenceRange: '20 - 45', status: 'Normal' },
        { name: 'Erythrocyte Sedimentation Rate (ESR)', value: '8', unit: 'mm/1st hr', referenceRange: '0 - 15', status: 'Normal' },
      ],
    },
  ];

  const sourceReports = (labReports && labReports.length > 0) ? labReports : defaultReports;

  const filteredReports = sourceReports.filter((report) => {
    const matchCat = selectedCategory === 'All' || report.category === selectedCategory;
    const matchStatus = selectedStatus === 'All' || (report.overallStatus || (report as any).status) === selectedStatus;
    const matchSearch =
      (report.reportName || (report as any).testName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.hospitalLab.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchStatus && matchSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Diagnostic Reports & Laboratory Information (LIS/RIS)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Standardized biochemistry panels, hematology counts, microbiological cultures, and DICOM-integrated radiology imaging.
          </p>
        </div>
      </div>

      {/* 2. Filter & Category Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by test name, patient, laboratory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReports.map((report) => {
          const status = report.overallStatus || (report as any).status || 'Normal';
          const statusBadges: Record<string, string> = {
            Normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'Needs Review': 'bg-amber-50 text-amber-700 border-amber-200',
            Critical: 'bg-rose-50 text-rose-700 border-rose-200',
          };

          return (
            <div
              key={report.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {report.category}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusBadges[status] || 'bg-slate-100 text-slate-700'}`}>
                        {status}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 text-base">
                      {report.reportName || (report as any).testName}
                    </h3>
                  </div>

                  {report.imageUrl && (
                    <button
                      onClick={() => setActiveScanViewer(report)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Scan</span>
                    </button>
                  )}
                </div>

                {/* Patient & Ordering Doctor Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">PATIENT</span>
                    <button
                      onClick={() => onSelectPatient(report.patientId)}
                      className="font-bold text-slate-900 hover:text-blue-600 text-left truncate cursor-pointer block"
                    >
                      {report.patientName} ({report.patientAge} yrs • {report.patientGender})
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">COLLECTED / REPORTED</span>
                    <span className="text-slate-700 font-medium text-[11px]">{report.reportDate}</span>
                  </div>
                </div>

                {/* Lab Result Item Highlights */}
                {report.results && report.results.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Biomarker Highlights:</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {report.results.slice(0, 4).map((res, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <span className="font-medium text-slate-700 truncate mr-2">{res.name}</span>
                          <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                            <span className={`font-bold ${res.flag ? 'text-rose-600' : 'text-slate-900'}`}>
                              {res.value} {res.unit}
                            </span>
                            <span className="text-[10px] text-slate-400">({res.referenceRange})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary notes */}
                <p className="text-xs text-slate-600 bg-blue-50/40 p-3 rounded-xl border border-blue-100 leading-relaxed italic">
                  "{report.summaryNotes}"
                </p>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <span className="text-[10px] text-slate-400 font-medium truncate">{report.pathologist}</span>
                <button
                  onClick={() => setActiveReportForDetail(report)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Full Report Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostic Scan / DICOM Viewer Modal */}
      {activeScanViewer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-4xl w-full border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 block font-bold">DICOM RADIOLOGY WORKSTATION</span>
                <h3 className="text-base font-black text-white">{activeScanViewer.reportName}</h3>
                <p className="text-xs text-slate-400">Patient: {activeScanViewer.patientName} • {activeScanViewer.hospitalLab}</p>
              </div>
              <button
                onClick={() => setActiveScanViewer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>

            {/* Scan Image & Controls */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center min-h-[350px]">
              {activeScanViewer.imageUrl ? (
                <img
                  src={activeScanViewer.imageUrl}
                  alt={activeScanViewer.reportName}
                  referrerPolicy="no-referrer"
                  style={{ filter: `contrast(${scanContrast}%)` }}
                  className="max-h-[500px] w-auto object-contain mx-auto transition-all"
                />
              ) : (
                <div className="text-slate-500 text-xs">No scan image attached</div>
              )}

              {/* AI Detection Overlay Simulation */}
              {showAIBoundingBox && (
                <div className="absolute top-1/4 left-1/3 w-32 h-32 border-2 border-emerald-400 rounded-lg pointer-events-none animate-pulse flex flex-col justify-between p-1.5 bg-emerald-500/10">
                  <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 px-1 py-0.5 rounded self-start">
                    AI: Normal Lung Parenchyma (98.4%)
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 self-end">No Infiltration</span>
                </div>
              )}
            </div>

            {/* Viewer Control Sliders */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-300">Image Contrast:</span>
                <input
                  type="range"
                  min="70"
                  max="180"
                  value={scanContrast}
                  onChange={(e) => setScanContrast(Number(e.target.value))}
                  className="w-32 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-cyan-400">{scanContrast}%</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAIBoundingBox(!showAIBoundingBox)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    showAIBoundingBox ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  AI Detection Overlay
                </button>

                <button
                  onClick={() => setScanContrast(100)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Report Details Modal */}
      {activeReportForDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-lg text-slate-900">{activeReportForDetail.reportName}</h3>
              </div>
              <button
                onClick={() => setActiveReportForDetail(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">PATIENT</span>
                <span className="font-bold text-slate-900">{activeReportForDetail.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">ORDERING PHYSICIAN</span>
                <span className="font-semibold text-slate-800">{activeReportForDetail.orderingDoctor}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">LABORATORY / HOSPITAL</span>
                <span className="font-semibold text-slate-800">{activeReportForDetail.hospitalLab}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">VERIFYING PATHOLOGIST</span>
                <span className="font-semibold text-slate-800">{activeReportForDetail.pathologist}</span>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">INVESTIGATION</th>
                    <th className="py-2.5 px-3">RESULT VALUE</th>
                    <th className="py-2.5 px-3">REF. INTERVAL</th>
                    <th className="py-2.5 px-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReportForDetail.results.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-800">{r.name}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.value} {r.unit}</td>
                      <td className="py-2 px-3 text-slate-500">{r.referenceRange}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          r.flag ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {r.flag || 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
