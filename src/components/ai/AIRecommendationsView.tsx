import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Check,
  X,
  Stethoscope,
  ChevronRight,
  PlusCircle,
  FileCheck,
  Clock,
  Info,
  Pill,
  Activity,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Zap,
  ListOrdered,
  Layers,
} from 'lucide-react';
import { AIRecommendation, AIRecommendationCategory, Patient } from '../../types';
import { AISymptomTriage } from './AISymptomTriage';

interface AIRecommendationsViewProps {
  recommendations: AIRecommendation[];
  patients?: Patient[];
  onSelectPatient: (patientId: string) => void;
  onOpenAICaseInvestigator?: () => void;
  onOpenCaseInvestigator?: () => void;
  onUpdateRecommendationStatus?: (recId: string, status: 'Reviewed & Accepted' | 'Dismissed', notes?: string) => void;
  onApplyRecommendation?: (recId: string) => void;
  onDismissRecommendation?: (recId: string) => void;
  onAddRecommendation?: (newRec: any) => void;
  onAddAIRecommendation?: (newRec: any) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AIRecommendationsView: React.FC<AIRecommendationsViewProps> = ({
  recommendations,
  patients = [],
  onSelectPatient,
  onOpenAICaseInvestigator,
  onOpenCaseInvestigator,
  onUpdateRecommendationStatus,
  onApplyRecommendation,
  onDismissRecommendation,
  onAddRecommendation,
  onAddAIRecommendation,
  onShowToast,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'triage' | 'alerts'>('triage');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecForModal, setSelectedRecForModal] = useState<AIRecommendation | null>(null);
  const [doctorNoteInput, setDoctorNoteInput] = useState<string>('');

  const openInvestigator = onOpenAICaseInvestigator || onOpenCaseInvestigator || (() => {});
  const handleAddRec = onAddRecommendation || onAddAIRecommendation;

  const categories: Array<AIRecommendationCategory | 'All'> = [
    'All',
    'Risk Alert',
    'Possible Condition',
    'Medication Review',
    'Follow-up Required',
    'Lab Trend',
    'Preventive Care',
  ];

  const filteredRecs = recommendations.filter((r) => {
    const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchUrg = selectedUrgency === 'All' || r.urgency === selectedUrgency;
    const matchSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.insight.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchUrg && matchSearch;
  });

  const handleAccept = (rec: AIRecommendation) => {
    if (onUpdateRecommendationStatus) {
      onUpdateRecommendationStatus(rec.id, 'Reviewed & Accepted', doctorNoteInput || 'Approved by consultant physician.');
    } else if (onApplyRecommendation) {
      onApplyRecommendation(rec.id);
    }
    onShowToast('Recommendation Accepted', `Action plan updated for ${rec.patientName}.`, 'success');
    setSelectedRecForModal(null);
    setDoctorNoteInput('');
  };

  const handleDismiss = (rec: AIRecommendation) => {
    if (onUpdateRecommendationStatus) {
      onUpdateRecommendationStatus(rec.id, 'Dismissed', doctorNoteInput || 'Clinically deemed non-urgent at this time.');
    } else if (onDismissRecommendation) {
      onDismissRecommendation(rec.id);
    }
    onShowToast('Recommendation Dismissed', `Insight archived for ${rec.patientName}.`, 'info');
    setSelectedRecForModal(null);
    setDoctorNoteInput('');
  };

  const highUrgencyCount = recommendations.filter((r) => r.urgency === 'High').length;
  const pendingCount = recommendations.filter((r) => r.status === 'Pending Review' || !r.status).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Clinical Decision Support System (CDSS)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Machine intelligence models analyzing longitudinal patient vitals, symptom trajectories, ICD-10 diagnostic differential pathways, and baseline laboratory workups.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openInvestigator}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>AI Case Investigator</span>
          </button>
        </div>
      </div>

      {/* 2. Top View Switcher Ribbon */}
      <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setActiveViewMode('triage')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeViewMode === 'triage'
              ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-900/50'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/50'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>AI Symptom Triage & Pathways</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
            Interactive Tool
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode('alerts')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeViewMode === 'alerts'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <span>Active Patient Alerts & Insights</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-sky-950/80 text-blue-800 dark:text-sky-300 text-[10px] font-bold">
            {recommendations.length}
          </span>
          {pendingCount > 0 && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
              {pendingCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* 3. Conditional Content Based on Active View Mode */}
      {activeViewMode === 'triage' ? (
        /* AI Symptom Triage Tool */
        <AISymptomTriage
          patients={patients}
          onShowToast={onShowToast}
          onSaveAsRecommendation={handleAddRec}
          onSelectPatient={onSelectPatient}
        />
      ) : (
        /* Active Clinical Recommendations Feed */
        <div className="space-y-6">
          {/* AI Intelligence Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active AI Insights</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{recommendations.length}</p>
              <span className="text-[11px] text-blue-600 dark:text-sky-400 font-bold">Continuous Background ML</span>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">High Urgency Alerts</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{highUrgencyCount}</p>
              <span className="text-[11px] text-rose-500 dark:text-rose-400 font-bold">Action Suggested ASAP</span>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Awaiting Doctor Sign-off</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Physician In-The-Loop</span>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Model Confidence</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">96.4%</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Trained on Peer-Reviewed Guidelines</span>
            </div>
          </div>

          {/* Filters & Category Pills */}
          <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search recommendations by patient, condition, drug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Urgency Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Urgency:</span>
                {['All', 'High', 'Medium', 'Low'].map((urg) => (
                  <button
                    key={urg}
                    onClick={() => setSelectedUrgency(urg)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedUrgency === urg
                        ? urg === 'High'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-5">
            {filteredRecs.length === 0 ? (
              <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No AI Clinical Alerts Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  All flagged patient clinical indicators have been resolved or do not match current filters.
                </p>
              </div>
            ) : (
              filteredRecs.map((rec) => {
                const urgencyBadges: Record<string, string> = {
                  High: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                  Medium: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                  Low: 'bg-blue-50 dark:bg-sky-950/80 text-blue-700 dark:text-sky-300 border-blue-200 dark:border-sky-800',
                };

                const isAccepted = rec.status === 'Reviewed & Accepted';
                const isDismissed = rec.status === 'Dismissed';

                return (
                  <div
                    key={rec.id}
                    className={`bg-white dark:bg-[#0F172A] rounded-3xl border p-6 shadow-xs transition-all space-y-4 ${
                      rec.urgency === 'High'
                        ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-700'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    {/* Top header strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${urgencyBadges[rec.urgency] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                          {rec.urgency} Urgency
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {rec.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{rec.aiConfidence || 95}% AI Confidence</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectPatient(rec.patientId)}
                        className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Patient: {rec.patientName} ({rec.patientAge} yrs • {rec.patientGender})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Main Title & Insight */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{rec.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                        {rec.insight}
                      </p>
                    </div>

                    {/* Differential Diagnoses Section if available */}
                    {rec.differentialDiagnoses && rec.differentialDiagnoses.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          Differential Diagnoses Probabilities:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {rec.differentialDiagnoses.map((diff, i) => (
                            <div key={i} className="bg-white dark:bg-[#0B0F19] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white">{diff.condition}</span>
                                <span className={`px-2 py-0.2 text-[10px] font-bold rounded ${
                                  diff.probability === 'High'
                                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                                    : 'bg-blue-100 dark:bg-sky-950/80 text-blue-700 dark:text-sky-300'
                                }`}>
                                  {diff.probability} Probability
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{diff.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinical Evidence & Guideline Citations */}
                    {rec.evidence && rec.evidence.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Clinical Evidence & Guideline Reference:</span>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                          {rec.evidence.map((ev, idx) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 bg-blue-50/40 dark:bg-sky-950/30 p-2 rounded-xl border border-blue-100 dark:border-sky-900/60">
                              <span className="text-blue-600 dark:text-sky-400 font-bold">•</span>
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Next Steps Checklist */}
                    {rec.suggestedNextSteps && rec.suggestedNextSteps.length > 0 && (
                      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
                        <span className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Suggested Action Plan (Guideline-Directed Medical Therapy):
                        </span>
                        <div className="space-y-1">
                          {rec.suggestedNextSteps.map((step, idx) => (
                            <div key={idx} className="text-xs text-emerald-900 dark:text-emerald-200 font-medium flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Accepted by Physician</span>
                          </span>
                        ) : isDismissed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                            <X className="w-4 h-4" />
                            <span>Dismissed</span>
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAccept(rec)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve & Apply to EHR</span>
                            </button>

                            <button
                              onClick={() => handleDismiss(rec)}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                              <X className="w-4 h-4" />
                              <span>Dismiss Alert</span>
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={openInvestigator}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Run In-Depth Differential Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
