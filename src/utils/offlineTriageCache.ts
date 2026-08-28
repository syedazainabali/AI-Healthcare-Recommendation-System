import { Patient } from '../types';

export interface CriticalPatientTriageRecord {
  id: string;
  mrn: string;
  fullName: string;
  cnic?: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  city: string;
  primaryCondition: string;
  status: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  allergies: Array<{ allergen: string; severity: string; reaction: string } | string>;
  chronicConditions: string[];
  activeMedications: Array<{ name: string; dosage: string; frequency: string; status?: string } | string>;
  latestVitals: {
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    oxygenSaturation: number;
    recordedAt?: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  assignedDoctorName: string;
  department: string;
  triageAlerts: string[];
  lastSyncTime: string;
}

export interface OfflineTriageCacheMeta {
  lastUpdated: string;
  patientCount: number;
  isServiceWorkerActive: boolean;
  isSimulatedOffline: boolean;
}

export interface OfflineTriageAssessment {
  triageLevel: 'Level 1 - Resuscitation' | 'Level 2 - Emergent' | 'Level 3 - Urgent' | 'Level 4 - Semi-Urgent' | 'Level 5 - Non-Urgent';
  numericLevel: 1 | 2 | 3 | 4 | 5;
  color: 'rose' | 'amber' | 'blue' | 'emerald';
  targetResponseTime: string;
  clinicalSummary: string;
  immediateInterventions: string[];
  redFlagWarnings: string[];
  recommendedBedsideTests: string[];
}

const STORAGE_KEY = 'medai_offline_critical_triage_pack_v1';
const SIMULATE_OFFLINE_KEY = 'medai_simulate_offline_mode';

/**
 * Transforms full Patient EHR objects into compact, high-efficiency triage records
 */
export function extractCriticalTriageRecord(patient: Patient): CriticalPatientTriageRecord {
  const latestVitals = (patient.vitalsHistory && patient.vitalsHistory[0]) || {
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRate: 72,
    respiratoryRate: 16,
    temperature: 98.6,
    oxygenSaturation: 98,
    timestamp: new Date().toISOString()
  };

  const triageAlerts: string[] = [];

  // Vital sign red flag detection
  if (latestVitals.oxygenSaturation < 92) {
    triageAlerts.push(`CRITICAL HYPOXIA: SpO2 ${latestVitals.oxygenSaturation}% (Stat O2 required)`);
  }
  if (latestVitals.bloodPressureSystolic > 170 || latestVitals.bloodPressureDiastolic > 110) {
    triageAlerts.push(`HYPERTENSIVE CRISIS RISK: BP ${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic} mmHg`);
  } else if (latestVitals.bloodPressureSystolic < 90) {
    triageAlerts.push(`HYPOTENSIVE SHOCK RISK: SBP ${latestVitals.bloodPressureSystolic} mmHg`);
  }
  if (latestVitals.heartRate > 120) {
    triageAlerts.push(`SEVERE TACHYCARDIA: HR ${latestVitals.heartRate} bpm`);
  } else if (latestVitals.heartRate < 50) {
    triageAlerts.push(`BRADYCARDIA: HR ${latestVitals.heartRate} bpm`);
  }

  // Allergy alerts
  const allergies = patient.allergies || [];
  allergies.forEach((a) => {
    if (typeof a === 'string') {
      triageAlerts.push(`ALLERGY: ${a}`);
    } else if (a.severity === 'Severe') {
      triageAlerts.push(`⚠️ SEVERE ALLERGY: ${a.allergen} (${a.reaction})`);
    }
  });

  const chronicConditions = (patient.diagnoses || []).map((d) => d.condition);
  const rawMedications = (patient as any).medications || [];

  return {
    id: patient.id,
    mrn: patient.mrn || `PK-MRN-${patient.id}`,
    fullName: patient.fullName || (patient as any).name || 'Unknown Patient',
    cnic: patient.cnic,
    age: patient.age || 40,
    gender: patient.gender || 'Unspecified',
    bloodGroup: patient.bloodGroup || 'O+',
    phone: patient.phone || patient.emergencyContact?.phone || 'N/A',
    city: patient.city || 'Pakistan',
    primaryCondition: patient.primaryCondition || 'General Consultation',
    status: patient.status || 'Stable',
    riskLevel: (patient.riskLevel as any) || 'Low',
    allergies: patient.allergies || [],
    chronicConditions: chronicConditions.length > 0 ? chronicConditions : [patient.primaryCondition || 'Hypertension'],
    activeMedications: Array.isArray(rawMedications) ? rawMedications.map((m: any) => typeof m === 'string' ? m : {
      name: m.name || 'Prescription Drug',
      dosage: m.dosage || 'Standard',
      frequency: m.frequency || 'Daily',
      status: m.status || 'Active'
    }) : [],
    latestVitals: {
      bloodPressureSystolic: latestVitals.bloodPressureSystolic || 120,
      bloodPressureDiastolic: latestVitals.bloodPressureDiastolic || 80,
      heartRate: latestVitals.heartRate || 72,
      respiratoryRate: latestVitals.respiratoryRate || 16,
      temperature: latestVitals.temperature || 98.6,
      oxygenSaturation: latestVitals.oxygenSaturation || 98,
      recordedAt: (latestVitals as any).recordedAt || latestVitals.timestamp || new Date().toISOString(),
    },
    emergencyContact: {
      name: patient.emergencyContact?.name || 'Primary Kin',
      relation: (patient.emergencyContact as any)?.relationship || (patient.emergencyContact as any)?.relation || 'Family',
      phone: patient.emergencyContact?.phone || patient.phone || '+92-300-0000000'
    },
    assignedDoctorName: patient.assignedDoctorName || 'Duty Medical Officer',
    department: patient.department || 'Emergency / Outpatient',
    triageAlerts,
    lastSyncTime: new Date().toISOString()
  };
}

/**
 * Cache patients into local storage and dispatch to Service Worker
 */
export function cachePatientTriageData(patients: Patient[]): void {
  if (!patients || !Array.isArray(patients) || patients.length === 0) return;

  try {
    const compactRecords = patients.map(extractCriticalTriageRecord);
    const payload = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      patientCount: compactRecords.length,
      patients: compactRecords,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // Also communicate with active service worker if supported
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_PATIENT_TRIAGE_DATA',
        payload
      });
    }
  } catch (error) {
    console.error('[MedAI Offline Cache] Failed to persist critical patient triage cache:', error);
  }
}

/**
 * Read cached patient triage records
 */
export function getCachedPatientTriageData(): { patients: CriticalPatientTriageRecord[]; meta: OfflineTriageCacheMeta } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const isSimulatedOffline = localStorage.getItem(SIMULATE_OFFLINE_KEY) === 'true';

    if (!raw) {
      return {
        patients: [],
        meta: {
          lastUpdated: 'Never synced',
          patientCount: 0,
          isServiceWorkerActive: Boolean(navigator.serviceWorker?.controller),
          isSimulatedOffline,
        }
      };
    }

    const parsed = JSON.parse(raw);
    return {
      patients: parsed.patients || [],
      meta: {
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        patientCount: (parsed.patients || []).length,
        isServiceWorkerActive: Boolean(navigator.serviceWorker?.controller),
        isSimulatedOffline,
      }
    };
  } catch (error) {
    console.warn('[MedAI Offline Cache] Error reading triage cache:', error);
    return {
      patients: [],
      meta: {
        lastUpdated: 'Error reading local storage',
        patientCount: 0,
        isServiceWorkerActive: false,
        isSimulatedOffline: false,
      }
    };
  }
}

/**
 * Offline Search across MRN, Full Name, CNIC, Blood Group, or Phone
 */
export function searchCachedPatients(query: string): CriticalPatientTriageRecord[] {
  const { patients } = getCachedPatientTriageData();
  const q = (query || '').trim().toLowerCase();
  if (!q) return patients;

  return patients.filter((p) => {
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      (p.cnic && p.cnic.toLowerCase().includes(q)) ||
      p.bloodGroup.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.primaryCondition.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  });
}

/**
 * Single patient lookup by exact MRN or ID
 */
export function getCachedPatientByMrnOrId(identifier: string): CriticalPatientTriageRecord | null {
  const { patients } = getCachedPatientTriageData();
  const target = (identifier || '').trim().toLowerCase();
  if (!target) return null;

  return (
    patients.find(
      (p) => p.mrn.toLowerCase() === target || p.id.toLowerCase() === target
    ) || null
  );
}

/**
 * Toggle simulated offline state for validation and clinical stress tests
 */
export function setSimulatedOfflineMode(enable: boolean): void {
  localStorage.setItem(SIMULATE_OFFLINE_KEY, enable ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('medai-network-mode-change', { detail: { isSimulatedOffline: enable } }));
}

export function isSimulatedOfflineMode(): boolean {
  return localStorage.getItem(SIMULATE_OFFLINE_KEY) === 'true';
}

/**
 * Determines current effective network connectivity (combines navigator.onLine & simulation)
 */
export function getEffectiveNetworkStatus(): { isOnline: boolean; isSimulated: boolean } {
  const isSim = isSimulatedOfflineMode();
  const isBrowserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  return {
    isOnline: !isSim && isBrowserOnline,
    isSimulated: isSim,
  };
}

/**
 * Rule-based Offline Triage Categorizer (PMDC / ESI 5-Tier Algorithm)
 */
export function performOfflineTriageAssessment(
  vitals: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    temperature?: number;
  },
  chiefComplaint: string,
  patientAllergies: string[] = []
): OfflineTriageAssessment {
  const sbp = vitals.bloodPressureSystolic || 120;
  const dbp = vitals.bloodPressureDiastolic || 80;
  const hr = vitals.heartRate || 75;
  const spo2 = vitals.oxygenSaturation || 98;
  const rr = vitals.respiratoryRate || 16;
  const temp = vitals.temperature || 98.6;
  const complaint = (chiefComplaint || '').toLowerCase();

  // Tier 1: Resuscitation / Immediate Life Threat (Level 1)
  if (
    spo2 < 86 ||
    sbp < 80 ||
    hr > 150 ||
    hr < 40 ||
    complaint.includes('unresponsive') ||
    complaint.includes('cardiac arrest') ||
    complaint.includes('severe anaphylaxis') ||
    complaint.includes('massive bleed')
  ) {
    return {
      triageLevel: 'Level 1 - Resuscitation',
      numericLevel: 1,
      color: 'rose',
      targetResponseTime: 'Immediate (0 minutes)',
      clinicalSummary: 'Critical physiological collapse or impending airway/cardiovascular arrest.',
      immediateInterventions: [
        'Immediate airway patency verification; apply high-flow non-rebreather oxygen (15L/min)',
        'Establish dual large-bore (16G/18G) peripheral IV access',
        'Initiate continuous cardiac monitoring, automated BP cycling every 3 minutes',
        'STAT call for Attending Emergency Consultant and Anesthesia Team'
      ],
      redFlagWarnings: [
        `Severe physiological instability: SpO2 ${spo2}%, SBP ${sbp} mmHg, HR ${hr} bpm`,
        'High risk of rapid decompensation within 5 minutes without invasive airway/circulatory support'
      ],
      recommendedBedsideTests: [
        'Immediate 12-Lead Electrocardiogram (ECG)',
        'Bedside Capillary Blood Glucose (rule out hypoglycemia coma)',
        'Arterial Blood Gas (ABG) & Lactate',
        'Emergency Blood Bank Type & Cross-match (STAT Pack)'
      ]
    };
  }

  // Tier 2: Emergent / High Acuity (Level 2)
  if (
    spo2 <= 91 ||
    sbp >= 180 ||
    dbp >= 115 ||
    (hr >= 120 && hr <= 150) ||
    rr > 26 ||
    complaint.includes('chest pain') ||
    complaint.includes('angina') ||
    complaint.includes('severe dyspnea') ||
    complaint.includes('stroke') ||
    complaint.includes('facial droop') ||
    complaint.includes('dengue') && (complaint.includes('bleed') || complaint.includes('pain'))
  ) {
    return {
      triageLevel: 'Level 2 - Emergent',
      numericLevel: 2,
      color: 'rose',
      targetResponseTime: '< 10 minutes',
      clinicalSummary: 'High-risk clinical presentation with potential for rapid deterioration; immediate physician evaluation required.',
      immediateInterventions: [
        'Place patient in High-Dependency or Resuscitation Bed in semi-fowler position',
        'Administer supplemental humidified oxygen to titrate SpO2 ≥ 94%',
        'Obtain 12-lead ECG within 10 minutes of arrival for chest discomfort',
        'Establish IV cannula and draw STAT baseline cardiac biomarkers / CBC'
      ],
      redFlagWarnings: [
        `Vitals at high risk thresholds: BP ${sbp}/${dbp} mmHg, SpO2 ${spo2}%, HR ${hr} bpm`,
        'Watch for worsening diaphoresis, neurological asymmetry, or respiratory fatigue'
      ],
      recommendedBedsideTests: [
        '12-Lead ECG & High-Sensitivity Cardiac Troponin-I',
        'Point-of-Care Blood Glucose & Electrolyte panel',
        'Complete Blood Count with Hematocrit & Platelets (Dengue/Sepsis protocol)',
        'Portable Bedside Chest X-Ray'
      ]
    };
  }

  // Tier 3: Urgent (Level 3)
  if (
    (sbp >= 150 && sbp < 180) ||
    (hr >= 100 && hr < 120) ||
    temp >= 102 ||
    complaint.includes('fever') ||
    complaint.includes('asthma') ||
    complaint.includes('fracture') ||
    complaint.includes('vomit') ||
    complaint.includes('abdominal')
  ) {
    return {
      triageLevel: 'Level 3 - Urgent',
      numericLevel: 3,
      color: 'amber',
      targetResponseTime: '< 30 minutes',
      clinicalSummary: 'Moderate complexity acute condition requiring multi-parameter laboratory evaluation or medical stabilization.',
      immediateInterventions: [
        'Assign to Acute Care Treatment Bay',
        'Administer antipyretic or oral/IV hydration as per standard protocol',
        'Perform targeted systemic physical examination and repeat vitals in 30 minutes'
      ],
      redFlagWarnings: [
        `Febrile/Tachycardic state: Temp ${temp}°F, HR ${hr} bpm`,
        'Re-evaluate triage level immediately if patient reports dizziness or breathing difficulty'
      ],
      recommendedBedsideTests: [
        'Complete Blood Count (CBC) with Differential',
        'Urine Dipstick & Microscopic Analysis',
        'Serum Urea, Creatinine, and Electrolytes',
        'Dengue NS1 Antigen / Typhidot IgM (if endemic febrile illness suspected)'
      ]
    };
  }

  // Tier 4: Semi-Urgent (Level 4)
  if (
    temp >= 99.5 ||
    complaint.includes('pain') ||
    complaint.includes('rash') ||
    complaint.includes('cough') ||
    complaint.includes('wound')
  ) {
    return {
      triageLevel: 'Level 4 - Semi-Urgent',
      numericLevel: 4,
      color: 'blue',
      targetResponseTime: '< 60 minutes',
      clinicalSummary: 'Stable clinical presentation requiring simple diagnostic confirmation or single procedural intervention.',
      immediateInterventions: [
        'Provide comfort measures, wound cleansing/dressing, or oral symptomatic therapy',
        'Queue for outpatient specialist clinic or sub-acute treatment room'
      ],
      redFlagWarnings: [
        'Advise patient to report to nursing desk if pain escalates or new symptoms appear'
      ],
      recommendedBedsideTests: [
        'Targeted outpatient lab investigations as requested by examining physician'
      ]
    };
  }

  // Tier 5: Non-Urgent (Level 5)
  return {
    triageLevel: 'Level 5 - Non-Urgent',
    numericLevel: 5,
    color: 'emerald',
    targetResponseTime: '< 120 minutes',
    clinicalSummary: 'Routine outpatient consultation, chronic medication renewal, or minor dressing change with completely stable hemodynamics.',
    immediateInterventions: [
      'Confirm patient identity and register for routine OPD physician queue',
      'Verify digital QR prescription on file for medication refills'
    ],
    redFlagWarnings: [
      'None. Hemodynamically stable on baseline screening.'
    ],
    recommendedBedsideTests: [
      'Routine annual metabolic or preventive health panel if due'
    ]
  };
}
