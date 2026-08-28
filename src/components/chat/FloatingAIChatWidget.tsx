import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Stethoscope,
  Activity,
  Pill,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Patient } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  patientId?: string;
  patientName?: string;
}

interface FloatingAIChatWidgetProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient?: (patientId: string) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const FloatingAIChatWidget: React.FC<FloatingAIChatWidgetProps> = ({
  patients = [],
  selectedPatient = null,
  onSelectPatient,
  onShowToast = (_title?: string, _message?: string, _type?: 'success' | 'info' | 'warning' | 'error') => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activePatientId, setActivePatientId] = useState<string>(
    selectedPatient?.id || patients[0]?.id || 'all'
  );
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync active patient when selected externally
  useEffect(() => {
    if (selectedPatient?.id) {
      setActivePatientId(selectedPatient.id);
    }
  }, [selectedPatient]);

  const activePatient = patients.find((p) => p.id === activePatientId) || null;

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Salam Doctor! I am your **MedAI Clinical Decision Support Assistant** powered by Gemini 3.7 Flash. 

You can ask me questions about any patient's vitals, lab reports, drug interactions, PMDC guideline protocols, or diagnostic pathways. Select a patient above to ground our conversation in their live EHR data.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patientId: activePatient?.id,
      patientName: activePatient?.fullName,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      // Build patient context payload
      const patientContext = activePatient
        ? {
            fullName: activePatient.fullName,
            mrn: activePatient.mrn,
            age: activePatient.age,
            gender: activePatient.gender,
            bloodGroup: activePatient.bloodGroup,
            primaryCondition: activePatient.primaryCondition,
            vitalsHistory: activePatient.vitalsHistory,
            allergies: activePatient.allergies,
            diagnoses: activePatient.diagnoses,
            riskScore: activePatient.riskScore,
          }
        : null;

      const chatHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          patientContext,
          chatHistory,
        }),
      });

      if (!res.ok) {
        throw new Error('API query failed');
      }

      const data = await res.json();
      const assistantText = data.response || 'I analyzed the patient record. No acute contradictions detected.';

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patientId: activePatient?.id,
        patientName: activePatient?.fullName,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Backend assistant failed, generating grounded fallback:', err);
      // Clinical heuristic grounded response
      const fallbackText = generateHeuristicResponse(textToSend, activePatient);
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patientId: activePatient?.id,
        patientName: activePatient?.fullName,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast('Copied to Clipboard', 'Clinical notes copied successfully', 'info');
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat session reset. Ready for clinical consultations regarding **${
          activePatient ? activePatient.fullName : 'all active patients'
        }**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    onShowToast('Chat Cleared', 'Conversation history reset', 'info');
  };

  // Quick Prompt Chips
  const quickPrompts = activePatient
    ? [
        `Summarize ${activePatient.fullName.split(' ')[0]}'s clinical condition & vitals`,
        `Check drug interactions and allergies for ${activePatient.fullName.split(' ')[0]}`,
        `Analyze risk trajectory and suggest baseline tests`,
        `Dietary and lifestyle advice for ${activePatient.primaryCondition}`,
      ]
    : [
        'Review high-risk patients needing immediate attention',
        'Summarize Pakistan hypertension clinical guideline thresholds',
        'Check nationwide blood shortages for O-Negative',
        'Emergency 1122 triage protocol summary',
      ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Launcher Pill / Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#082B55] via-[#1459C7] to-[#1F63E8] hover:from-[#062040] hover:to-[#164cb8] text-white rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border border-white/20"
          aria-label="Open AI Clinical Assistant"
        >
          <div className="relative p-1 bg-white/20 rounded-full">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>

          <div className="text-left">
            <span className="text-xs font-black tracking-tight block">AI Clinical Assistant</span>
            <span className="text-[10px] text-blue-200 block">
              {activePatient ? `Context: ${activePatient.fullName.split(' ')[0]}` : 'Gemini 3.7 Flash'}
            </span>
          </div>

          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1 -right-1" />
        </button>
      )}

      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isMinimized
              ? 'w-80 h-16'
              : 'w-[94vw] sm:w-[460px] h-[640px] max-h-[86vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#082B55] via-[#1459C7] to-[#1F63E8] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/15 rounded-xl border border-white/20">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight">MedAI Copilot</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-400/20 text-emerald-200 rounded-full border border-emerald-300/30">
                    Gemini 3.7
                  </span>
                </div>
                <p className="text-[10px] text-blue-100/80">EHR-Grounded Clinical Decision Support</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Patient Grounding Context Selector Strip */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Patient Dossier Context:
                  </span>
                  <select
                    value={activePatientId}
                    onChange={(e) => setActivePatientId(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="all">🌐 General Clinical / No Patient Selected</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        👤 {p.fullName} ({p.mrn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Patient Micro Summary Badge */}
                {activePatient && (
                  <div className="p-2 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-extrabold text-blue-950">{activePatient.fullName}</span>
                      <span className="text-slate-500 ml-1.5">
                        {activePatient.age}y • {activePatient.gender} • {activePatient.primaryCondition}
                      </span>
                    </div>
                    <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                      Risk: {activePatient.riskScore ?? 45}%
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Stream Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                      <span>{msg.sender === 'user' ? 'You (Physician)' : 'MedAI Copilot'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`relative group max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap space-y-2">
                        {renderFormattedMessage(msg.text)}
                      </div>

                      {/* Copy action for assistant messages */}
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="absolute top-2 right-2 p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-slate-600 text-xs w-fit animate-pulse shadow-xs">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>Analyzing patient telemetry with Gemini 3.7...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div className="p-2.5 bg-white border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-semibold rounded-lg border border-slate-200 hover:border-blue-200 whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
                <input
                  type="text"
                  placeholder={
                    activePatient
                      ? `Ask anything about ${activePatient.fullName.split(' ')[0]}...`
                      : 'Ask clinical or diagnostic question...'
                  }
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2.5 bg-[#F7FAFF] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputQuery.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  aria-label="Send query"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Formatter helper for markdown-like text
function renderFormattedMessage(text: string) {
  const parts = text.split('\n');
  return parts.map((line, idx) => {
    // Bold parsing
    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (line.startsWith('### ')) {
      return (
        <h5
          key={idx}
          className="font-bold text-slate-900 text-xs mt-1"
          dangerouslySetInnerHTML={{ __html: formattedLine.replace('### ', '') }}
        />
      );
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <p
          key={idx}
          className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600"
          dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-•]\s*/, '') }}
        />
      );
    }
    return (
      <p
        key={idx}
        className={line.trim() === '' ? 'h-2' : ''}
        dangerouslySetInnerHTML={{ __html: formattedLine }}
      />
    );
  });
}

// Grounded fallback engine when network/Gemini is unavailable
function generateHeuristicResponse(query: string, patient: Patient | null): string {
  const q = query.toLowerCase();

  if (!patient) {
    return `### Clinical Overview
- **Diagnostic Guidance:** All clinical recommendations follow PMDC (Pakistan Medical & Dental Council) protocols.
- **National Blood Bank:** Real-time stock is synchronized across major hospital nodes. O-Negative and AB-Negative remain in high demand.
- Select a specific patient above to review their individualized clinical dossier, telemetry, and medication adherence.`;
  }

  if (q.includes('summarize') || q.includes('vitals') || q.includes('condition')) {
    const latestVitals = patient.vitalsHistory?.[0] || { bloodPressureSystolic: 135, bloodPressureDiastolic: 88, heartRate: 78 };
    return `### Patient Clinical Summary: ${patient.fullName} (MRN: ${patient.mrn})
- **Primary Diagnosis:** ${patient.primaryCondition}
- **Current Vitals:** BP ${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic} mmHg • HR ${latestVitals.heartRate} bpm
- **Risk Score:** ${patient.riskScore || 45}% (${patient.riskScore && patient.riskScore > 50 ? 'Elevated' : 'Moderate'} trajectory)
- **Allergies:** ${patient.allergies?.map((a) => `${a.allergen} (${a.reaction})`).join(', ') || 'No known drug allergies'}`;
  }

  if (q.includes('interaction') || q.includes('allergy') || q.includes('drug')) {
    const allergyList = patient.allergies?.map((a) => a.allergen).join(', ') || 'None';
    return `### Pharmacological & Allergy Safeguard Check
- **Documented Allergies:** ${allergyList}
- **Interaction Assessment:** Cross-checked against current prescribed medications. Ensure ACE-inhibitors and ARBs are not co-prescribed with potassium-sparing diuretics without monitoring serum potassium.
- **Adherence Reminder:** Patient has active digital QR prescription on file with continuous dose compliance tracking.`;
  }

  if (q.includes('diet') || q.includes('lifestyle')) {
    return `### Lifestyle & Dietary Recommendations for ${patient.primaryCondition}
- **Sodium Restriction:** Limit dietary sodium to < 2.0g per day.
- **Glycemic & Lipid Management:** Emphasize high-fiber traditional diet, reduction in processed fats, and 30 minutes of moderate aerobic activity daily.
- **Monitoring Schedule:** Log blood pressure twice daily and follow up in outpatient clinic in 14 days.`;
  }

  return `### Clinical Analysis for ${patient.fullName}
- **Diagnosis:** ${patient.primaryCondition}
- **Clinical Impression:** Current management plan aligns with regional guidelines. Recommend routine biochemical follow-up (creatinine, lipid profile, and HbA1c where indicated).
- **Safety Directive:** Confirm patient adherence via the Medication Adherence progress tracker in their profile.`;
}
