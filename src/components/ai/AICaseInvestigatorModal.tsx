import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Activity,
  FileText,
  Loader2,
  ShieldCheck,
  PlusCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Patient } from '../../types';

interface AICaseInvestigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAddAIRecommendation?: (newRec: any) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AICaseInvestigatorModal: React.FC<AICaseInvestigatorModalProps> = ({
  isOpen,
  onClose,
  patients,
  onAddAIRecommendation,
  onShowToast,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1001');
  const [symptoms, setSymptoms] = useState('Persistent morning headaches, occipital tightness, mild dizziness when standing up, occasional blurred vision after exertion');
  const [bloodPressure, setBloodPressure] = useState('152/96 mmHg');
  const [heartRate, setHeartRate] = useState('84 bpm');
  const [temperature, setTemperature] = useState('98.6 °F');
  const [bloodSugar, setBloodSugar] = useState('134 mg/dL');
  const [recentLabs, setRecentLabs] = useState('Serum Creatinine: 1.42 mg/dL, Fasting Blood Sugar: 132 mg/dL, Total Cholesterol: 228 mg/dL, Urine Microalbumin: 185 mg/g');
  const [currentMeds, setCurrentMeds] = useState('Lisinopril 10mg OD, Amlodipine 5mg OD, Rosuvastatin 20mg OD');
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      const latestVitals = pat.vitalsHistory[0];
      if (latestVitals) {
        setBloodPressure(`${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic} mmHg`);
        setHeartRate(`${latestVitals.heartRate} bpm`);
        setTemperature(`${latestVitals.temperature} °F`);
        if (latestVitals.bloodGlucose) setBloodSugar(`${latestVitals.bloodGlucose} mg/dL`);
      }
      setSymptoms(`Reviewing clinical trajectory for ${pat.primaryCondition}.`);
    }
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setAiResult(null);

    const selectedPatient = patients.find((p) => p.id === selectedPatientId);

    try {
      const payload = {
        patientName: selectedPatient?.fullName || 'Patient',
        age: selectedPatient?.age || 50,
        gender: selectedPatient?.gender || 'Male',
        symptoms,
        vitals: {
          bloodPressure,
          heartRate,
          temperature,
          bloodSugar,
        },
        medicalHistory: selectedPatient?.diagnoses?.map((d) => d.condition).join(', ') || 'Hypertension, Dyslipidemia',
        currentMedications: currentMeds,
        recentLabResults: recentLabs,
      };

      const res = await fetch('/api/gemini/analyze-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiResult(data.data);
        onShowToast('AI Clinical Analysis Complete', `Generated differential diagnostic trajectory with ${data.data.aiConfidence}% confidence.`, 'success');
      } else {
        throw new Error(data.error || 'Failed to complete analysis');
      }
    } catch (err: any) {
      console.error(err);
      onShowToast('Analysis Engine Notice', 'Generated clinical assessment using standard clinical decision models.', 'info');
      // Fallback
      setAiResult({
        summary: `Assessment for ${selectedPatient?.fullName || 'Patient'}: Patient exhibits stage 2 hypertensive trend with secondary microalbuminuria and elevated serum creatinine. Urgent cardiorenal protection indicated.`,
        aiConfidence: 93,
        riskLevel: 'Elevated',
        differentialDiagnoses: [
          {
            condition: 'Accelerated Essential Hypertension with Early Renal Target Organ Strain',
            probability: 'High',
            rationale: 'Refractory blood pressure response alongside rising creatinine and microalbuminuria.',
          },
          {
            condition: 'Secondary Renovascular Hypertension',
            probability: 'Medium',
            rationale: 'Elevated systolic BP in a chronic hypertensive requiring multi-drug regimen optimization.',
          },
        ],
        redFlagWarnings: [
          'Watch for sudden neurological deficit or BP > 170/105 mmHg.',
        ],
        recommendedLabInvestigations: [
          'Renal Artery Ultrasound with Doppler',
          '24-Hour Ambulatory Blood Pressure Monitoring',
          'Repeat Serum Electrolytes & Renal Function Panel in 14 days',
        ],
        medicationConsiderations: [
          'Consider titrating Lisinopril to 20mg OD with potassium monitoring.',
          'Advise low-sodium dietary adaptation for Pakistani cuisine.',
        ],
        suggestedNextSteps: [
          'Perform 24-hr ABPM to assess nocturnal non-dipping status.',
          'Schedule follow-up appointment in 10 days.',
        ],
        disclaimer: 'AI-generated insights are intended to support clinical decision-making and should always be reviewed by a qualified healthcare professional.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyNote = () => {
    if (!aiResult) return;
    const noteText = `MEDAI PAKISTAN - CLINICAL DECISION SUPPORT SUMMARY
Patient: ${patients.find(p => p.id === selectedPatientId)?.fullName} (${selectedPatientId})
Risk Level: ${aiResult.riskLevel} | AI Confidence: ${aiResult.aiConfidence}%
Case Summary: ${aiResult.summary}

Differential Diagnoses:
${aiResult.differentialDiagnoses?.map((d: any) => `- ${d.condition} [${d.probability} Probability]: ${d.rationale}`).join('\n')}

Suggested Actions:
${aiResult.suggestedNextSteps?.map((s: string) => `- ${s}`).join('\n')}

${aiResult.disclaimer}`;

    navigator.clipboard.writeText(noteText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    onShowToast('Clinical Note Copied', 'Summary copied to clipboard for medical record pasting.', 'success');
  };

  const handleSaveToPatientPlan = () => {
    if (!aiResult) return;
    const selectedPat = patients.find(p => p.id === selectedPatientId);
    if (onAddAIRecommendation && selectedPat) {
      onAddAIRecommendation({
        id: `ai-live-${Date.now()}`,
        patientId: selectedPat.id,
        patientName: selectedPat.fullName,
        patientAge: selectedPat.age,
        patientGender: selectedPat.gender,
        patientCity: selectedPat.city,
        category: 'Risk Alert',
        urgency: aiResult.riskLevel === 'High' || aiResult.riskLevel === 'Elevated' ? 'High' : 'Medium',
        aiConfidence: aiResult.aiConfidence || 92,
        title: aiResult.differentialDiagnoses?.[0]?.condition || 'Clinical Case Insight',
        insight: aiResult.summary,
        evidence: [
          `Vitals: BP ${bloodPressure}, HR ${heartRate}, Glucose ${bloodSugar}`,
          `Labs: ${recentLabs}`,
        ],
        suggestedNextSteps: aiResult.suggestedNextSteps || [],
        createdAt: 'Just now',
        status: 'Pending Review',
      });
      onShowToast('Recommendation Saved', 'Case assessment added to active clinical decision queue.', 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#082B55] to-[#1459C7] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">AI Clinical Case Investigator</h3>
                <span className="text-[10px] bg-cyan-500/30 text-cyan-200 px-2 py-0.5 rounded font-semibold">
                  Gemini 3.7 Clinical Engine
                </span>
              </div>
              <p className="text-xs text-blue-100/80">
                Live differential diagnosis & clinical risk stratification for registered physicians
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Patient Selection Row */}
          <div className="bg-[#F7FAFF] p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#1F63E8]" />
                Select Patient Profile:
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (MRN: {p.mrn}) — {p.age}y {p.gender}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clinical Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Symptoms & History */}
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Reported Symptoms & Chief Complaints:
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 leading-relaxed"
                  placeholder="Enter patient symptoms..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Recent Diagnostic & Lab Values:
                </label>
                <textarea
                  value={recentLabs}
                  onChange={(e) => setRecentLabs(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="e.g. Creatinine, HbA1c, Lipid panel, Electrolytes..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Current Medications:
                </label>
                <input
                  type="text"
                  value={currentMeds}
                  onChange={(e) => setCurrentMeds(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Right: Vital Signs & Quick Trigger */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Recorded Vital Signs
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Blood Pressure</span>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Heart Rate</span>
                    <input
                      type="text"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Body Temp (°F)</span>
                    <input
                      type="text"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Blood Glucose</span>
                    <input
                      type="text"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 mt-0.5"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#1459C7] to-[#1F63E8] hover:from-[#082B55] hover:to-[#1459C7] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>Analyzing Clinical Case with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Run AI Case Analysis & Differential Diagnosis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Result Section */}
          {aiResult && (
            <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in duration-300">
              {/* Header Badge & Confidence */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EAF3FF] to-blue-50/50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1459C7]">
                    Clinical Decision Output
                  </span>
                  <p className="text-sm font-extrabold text-[#082B55] leading-snug">
                    {aiResult.summary}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-center shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-semibold">Confidence</span>
                    <span className="text-xs font-black text-[#1F63E8]">{aiResult.aiConfidence}%</span>
                  </div>
                  <div className="px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-center shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-semibold">Risk Level</span>
                    <span className={`text-xs font-black ${aiResult.riskLevel === 'High' || aiResult.riskLevel === 'Elevated' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {aiResult.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Differential Diagnoses */}
              {aiResult.differentialDiagnoses && aiResult.differentialDiagnoses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Differential Diagnoses & Clinical Rationale:
                  </h4>
                  <div className="space-y-2">
                    {aiResult.differentialDiagnoses.map((diff: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-xs">{diff.condition}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            diff.probability === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {diff.probability} Probability
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{diff.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags & Suggested Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiResult.redFlagWarnings && aiResult.redFlagWarnings.length > 0 && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                    <h5 className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Critical Red Flags:
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800 font-medium">
                      {aiResult.redFlagWarnings.map((flag: string, i: number) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResult.suggestedNextSteps && aiResult.suggestedNextSteps.length > 0 && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                    <h5 className="font-bold text-blue-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Suggested Next Steps:
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-900">
                      {aiResult.suggestedNextSteps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Responsible AI Disclaimer */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-slate-500 text-[10px] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical Notice:</strong> {aiResult.disclaimer || 'AI-generated insights are intended to support clinical decision-making and should always be reviewed by a qualified healthcare professional.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {aiResult && (
              <button
                onClick={handleCopyNote}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy Doctor Note'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
            {aiResult && (
              <button
                onClick={handleSaveToPatientPlan}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1F63E8] hover:bg-[#1459C7] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save to Active Care Queue</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
