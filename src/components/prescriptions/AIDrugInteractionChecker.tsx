import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  Globe,
  HelpCircle,
  Stethoscope,
  FileText,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  HeartCrack,
  Check,
  Lock,
  Unlock
} from 'lucide-react';
import { Patient, Medication } from '../../types';
import {
  DrugInteractionAlert,
  PrescriptionSafetyAnalysis,
  FormularyDrug,
  PAKISTAN_FORMULARY
} from '../../utils/drugInteractionEngine';

interface AIDrugInteractionCheckerProps {
  patient: Patient;
  currentMedications: Medication[];
  existingMedications?: Medication[];
  analysis: PrescriptionSafetyAnalysis | null;
  isLoading: boolean;
  onRunDeepCheck: () => void;
  onApplyAlternative: (originalDrugName: string, newDrug: { name: string; dosage: string; frequency?: string; instructions?: string }) => void;
  onOverrideJustificationChange?: (justification: string, isOverridden: boolean) => void;
  overrideState?: { isOverridden: boolean; justification: string };
  onLoadPresetScenario?: (scenarioName: string, drugs: Partial<Medication>[]) => void;
}

export const AIDrugInteractionChecker: React.FC<AIDrugInteractionCheckerProps> = ({
  patient,
  currentMedications,
  existingMedications = [],
  analysis,
  isLoading,
  onRunDeepCheck,
  onApplyAlternative,
  onOverrideJustificationChange,
  overrideState = { isOverridden: false, justification: '' },
  onLoadPresetScenario
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ddi' | 'allergy' | 'disease' | 'counseling'>('all');
  const [showUrduCounseling, setShowUrduCounseling] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideText, setOverrideText] = useState(overrideState.justification);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  if (!analysis) return null;

  const {
    isSafe,
    safetyScore,
    overallRisk,
    summary,
    alerts,
    drugInteractions,
    allergyConflicts,
    diseaseContraindications,
    dosageWarnings,
    recommendations,
    patientCounseling
  } = analysis;

  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const highCount = alerts.filter(a => a.severity === 'High').length;
  const moderateCount = alerts.filter(a => a.severity === 'Moderate').length;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            Critical Hazard
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            High Risk
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Info className="w-3 h-3 text-amber-600" />
            Moderate Precaution
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            Minor Precaution
          </span>
        );
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ddi') return alert.category === 'Drug-Drug';
    if (activeTab === 'allergy') return alert.category === 'Allergy-Conflict';
    if (activeTab === 'disease') return alert.category === 'Disease-Contraindication';
    return true;
  });

  const handleSaveOverride = () => {
    if (onOverrideJustificationChange) {
      onOverrideJustificationChange(overrideText, true);
    }
    setShowOverrideModal(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-0">
      {/* Header Bar */}
      <div className={`p-4 ${isSafe ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white' : 'bg-gradient-to-r from-[#082B55] via-[#1459C7] to-slate-900 text-white'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isSafe ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'} ring-1 ring-white/10`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  AI Pharmacological Adverse Reaction & Drug Interaction Engine
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-blue-100 font-medium">
                  PMDC e-Prescribing Standard
                </span>
              </div>
              <p className="text-xs text-blue-100/80">
                Audited against patient EHR: Allergies ({patient.allergies?.length || 0}), Chronic Conditions ({patient.diagnoses?.length || 1}), and Active Meds ({existingMedications.length}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Safety Score Meter */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 bg-white/10 backdrop-blur-xs text-white`}>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-blue-200">Safety Index</span>
                <span className="text-sm font-extrabold">{safetyScore}/100</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${safetyScore >= 80 ? 'bg-emerald-400 animate-pulse' : safetyScore >= 60 ? 'bg-amber-400' : 'bg-rose-400 animate-ping'}`} />
            </div>

            {/* Deep Re-analyze Button */}
            <button
              type="button"
              onClick={onRunDeepCheck}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20 disabled:opacity-50"
              title="Run Deep LLM Analysis with Gemini 3.7 Flash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Auditing...' : 'Deep AI Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Alert Banner */}
      <div className={`px-4 py-3 border-b flex items-start justify-between gap-3 text-xs ${
        overallRisk === 'Severe'
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : overallRisk === 'Moderate'
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-start gap-2.5">
          {overallRisk === 'Severe' ? (
            <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          ) : overallRisk === 'Moderate' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">
              {overallRisk === 'Severe'
                ? `CRITICAL ADVERSE REACTION DETECTED (${criticalCount} Critical, ${highCount} High Risk)`
                : overallRisk === 'Moderate'
                ? `POTENTIAL DRUG INTERACTIONS & PRECAUTIONS (${highCount + moderateCount} Alerts)`
                : 'PRESCRIPTION SAFE & COMPLIANT'}
            </p>
            <p className="mt-0.5 text-slate-700 leading-relaxed">{summary}</p>
          </div>
        </div>

        {/* Doctor Override Badge if active */}
        {overrideState.isOverridden && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-[10px] font-bold flex-shrink-0">
            <Unlock className="w-3.5 h-3.5 text-amber-600" />
            <span>Doctor Overridden</span>
          </div>
        )}
      </div>

      {/* Interactive Tabs */}
      <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-[#1F63E8] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            All Findings ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ddi')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'ddi'
                ? 'bg-[#1F63E8] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            Drug-Drug ({drugInteractions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('allergy')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'allergy'
                ? 'bg-[#1F63E8] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            Allergy Cross-Reactivity ({allergyConflicts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disease')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'disease'
                ? 'bg-[#1F63E8] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            Disease Contraindications ({diseaseContraindications.length})
          </button>
        </div>

        {/* Urdu Counseling Toggle */}
        <button
          type="button"
          onClick={() => setShowUrduCounseling(!showUrduCounseling)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            showUrduCounseling
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
          }`}
          title="Toggle Urdu Patient Instructions"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>اردو رہنمائی (Urdu)</span>
        </button>
      </div>

      {/* Main Alerts List */}
      <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800 text-xs">No Flagged Interactions in this Category</p>
            <p className="text-[11px] text-slate-500">
              The prescribed regimen exhibits no known biochemical antagonism, allergy cross-reactivity, or disease contraindications.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;
            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  alert.severity === 'Critical'
                    ? 'bg-rose-50/70 border-rose-200'
                    : alert.severity === 'High'
                    ? 'bg-orange-50/70 border-orange-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      <span className="font-bold text-slate-900 text-xs">{alert.title}</span>
                      <span className="text-[10px] text-slate-500 bg-white/80 px-1.5 py-0.5 rounded-md border border-slate-200 font-mono">
                        {alert.drugsInvolved.join(' ↔ ')}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-medium">
                      <span className="font-semibold text-slate-900">Clinical Hazard: </span>
                      {alert.clinicalRisk}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/60"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details: Mechanism & Management */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 bg-white/70 p-3 rounded-lg">
                    <div>
                      <span className="font-bold text-[#082B55] text-[11px] block">Biochemical Mechanism:</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{alert.mechanism}</p>
                    </div>

                    <div>
                      <span className="font-bold text-emerald-800 text-[11px] block">Physician Action & Mitigation:</span>
                      <p className="text-[11px] text-slate-700 leading-relaxed">{alert.management}</p>
                    </div>
                  </div>
                )}

                {/* 1-Click Smart Alternative Recommendation */}
                {alert.suggestedAlternative && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/90 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                          Recommended Safe Alternative:
                        </span>
                        <p className="font-bold text-slate-900 text-xs">
                          {alert.suggestedAlternative.drugName} • <span className="font-normal text-slate-600">{alert.suggestedAlternative.dosage}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 italic">
                          Rationale: {alert.suggestedAlternative.rationale}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (alert.suggestedAlternative) {
                          onApplyAlternative(alert.drugsInvolved[0], {
                            name: alert.suggestedAlternative.drugName,
                            dosage: alert.suggestedAlternative.dosage.split(' ')[0] || 'Standard',
                            frequency: alert.suggestedAlternative.dosage.includes('TDS') ? 'Three Times Daily (TDS)' : 'Once Daily (OD)',
                            instructions: 'Administer with water as per pharmacological alternative protocol'
                          });
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors self-start sm:self-center flex-shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>1-Click Apply Alternative</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Urdu Patient Guidance Box (Collapsible) */}
      {showUrduCounseling && (
        <div className="p-4 bg-emerald-50/70 border-t border-emerald-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-700" />
              مریض کے لیے ادویات کے منفی اثرات سے حفاظت کی رہنمائی (Urdu Patient Safety Guidance)
            </span>
          </div>
          <ul className="space-y-1.5 text-right font-medium text-emerald-950 pr-2" dir="rtl">
            {patientCounseling.urdu.map((point, i) => (
              <li key={i} className="flex items-start gap-1.5 justify-start text-xs">
                <span className="text-emerald-700 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Actions: Clinical Override & Quick Scenarios */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-semibold">Test Real-world Scenarios:</span>
          {onLoadPresetScenario && (
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => onLoadPresetScenario('Penicillin Allergy Conflict', [
                  { name: 'Augmentin 625mg', dosage: '625mg', frequency: 'Twice Daily (BD)', duration: '7 Days', instructions: 'Take with food' }
                ])}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold whitespace-nowrap"
                title="Test Augmentin on Penicillin-Allergic Patient"
              >
                Trigger Penicillin Allergy
              </button>

              <button
                type="button"
                onClick={() => onLoadPresetScenario('Warfarin + NSAID Hemorrhage Risk', [
                  { name: 'Warfarin 5mg', dosage: '5mg', frequency: 'Once Daily (OD)', duration: '30 Days', instructions: 'Take at 6 PM' },
                  { name: 'Brufen 400mg', dosage: '400mg', frequency: 'Twice Daily (BD)', duration: '5 Days', instructions: 'Take after meals' }
                ])}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold whitespace-nowrap"
                title="Test Warfarin + Brufen Bleeding Risk"
              >
                Trigger Warfarin DDI
              </button>

              <button
                type="button"
                onClick={() => onLoadPresetScenario('Safe Anti-hypertensive Pairing', [
                  { name: 'Lisinopril 10mg', dosage: '10mg', frequency: 'Once Daily (OD)', duration: '30 Days', instructions: 'Take in morning' },
                  { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once Daily (OD)', duration: '30 Days', instructions: 'Take at night' }
                ])}
                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold whitespace-nowrap"
                title="Test Safe Lisinopril + Amlodipine Synergy"
              >
                Safe Synergy Pair
              </button>
            </div>
          )}
        </div>

        {/* Doctor Clinical Override Button (If high or critical alerts exist) */}
        {(criticalCount > 0 || highCount > 0) && (
          <button
            type="button"
            onClick={() => setShowOverrideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{overrideState.isOverridden ? 'Edit Override Justification' : 'Clinical Override & Justify'}</span>
          </button>
        )}
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 text-xs animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-slate-900">Physician Clinical Override Protocol</h4>
            </div>

            <p className="text-slate-600 leading-relaxed">
              You are overriding <span className="font-bold text-rose-700">{criticalCount + highCount} identified pharmacological alerts</span>. Under PMDC clinical governance, please document your clinical rationale (e.g. inpatient cardiac telemetry, desensitization protocol, or specialized therapeutic benefit) for the permanent audit trail.
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Clinical Justification Note *</label>
              <textarea
                rows={3}
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                placeholder="e.g. Therapeutic benefit outweighs bleeding risk; patient is admitted to CCU with daily INR monitoring."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverride}
                disabled={!overrideText.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm & Apply Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
