export type Role = 'Doctor' | 'Healthcare Professional' | 'Hospital/Clinic Admin' | 'Patient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  specialty?: string;
  pmdcNumber?: string;
  hospital: string;
  city: string;
  avatarUrl: string;
  phone: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';
export type PatientStatus = 'Stable' | 'Critical' | 'Under Observation' | 'Discharged' | 'Follow-up Needed';
export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High';

export interface VitalSign {
  timestamp: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number; // in °F
  respiratoryRate: number;
  oxygenSaturation: number; // in %
  bloodGlucose?: number; // in mg/dL
  weightKg?: number;
}

export interface Allergy {
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string; // e.g. "Once Daily (OD)", "Twice Daily (BD)", "Thrice Daily (TDS)"
  duration: string; // e.g. "14 Days", "Ongoing"
  route: string; // "Oral", "IV", "Topical", "Subcutaneous"
  instructions: string; // e.g. "Take after breakfast with water"
  prescribedBy: string;
  prescribedDate: string;
  status: 'Active' | 'Completed' | 'Discontinued';
  fulfilledDoses?: number;
  totalDoses?: number;
  adherenceScore?: number; // 0 - 100%
  adherenceStatus?: 'Optimal' | 'Satisfactory' | 'Sub-optimal' | 'Non-compliant';
  lastDoseFulfilled?: string;
  refillDueInDays?: number;
}

export interface Diagnosis {
  id: string;
  icdCode?: string;
  condition: string;
  diagnosedDate: string;
  diagnosedBy: string;
  status: 'Active' | 'Chronic' | 'Resolved';
  notes: string;
}

export interface MedicalHistoryEvent {
  id: string;
  patientId: string;
  date: string;
  visitType: 'Outpatient' | 'Inpatient Admission' | 'Emergency Care' | 'Telehealth' | 'Surgical Procedure' | 'Routine Checkup';
  doctorName: string;
  doctorSpecialty: string;
  hospital: string;
  chiefComplaint: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  clinicalNotes: string;
  vitals?: VitalSign;
}

export interface LabResultItem {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Needs Review' | 'Critical';
  flag?: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  reportName: string;
  category: 'Hematology' | 'Biochemistry' | 'Radiology' | 'Microbiology' | 'Cardiology' | 'Pathology';
  sampleCollectionDate: string;
  reportDate: string;
  orderingDoctor: string;
  pathologist: string;
  hospitalLab: string;
  overallStatus: 'Normal' | 'Needs Review' | 'Critical';
  summaryNotes: string;
  results: LabResultItem[];
  imageUrl?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  patientPhone: string;
  patientBloodGroup?: BloodGroup;
  doctorName: string;
  doctorSpecialty: string;
  doctorPmdc: string;
  hospital: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  specialAdvice: string[];
  followUpDate?: string;
  qrCodeVerificationId: string;
  status: 'Active' | 'Dispensed' | 'Expired';
}

export type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'In Progress';
export type AppointmentType = 'In-Person Consultation' | 'Follow-up' | 'Emergency Triage' | 'Telemedicine' | 'Pre-Op Evaluation' | 'Lab Review';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: Gender;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  department: string;
  hospital: string;
  date: string;
  timeSlot: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
}

export type AIRecommendationCategory = 'Risk Alert' | 'Possible Condition' | 'Medication Review' | 'Follow-up Required' | 'Lab Trend' | 'Preventive Care';

export interface DiagnosticPathway {
  rank: number;
  condition: string;
  icdCode?: string;
  probability: 'High' | 'Moderate' | 'Low';
  confidencePercentage: number;
  clinicalRationale: string;
  matchingSymptoms: string[];
  discriminatingFeatures: string;
  urgencyLevel: 'Immediate (Emergency)' | 'Urgent (<24h)' | 'Routine Outpatient';
}

export interface BaselineTestRecommendation {
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Radiology / Imaging' | 'Point-of-Care / Bedside' | 'Microbiology' | 'Cardiology';
  urgency: 'Stat / Immediate' | 'Urgent (<4h)' | 'Routine OPD';
  clinicalJustification: string;
  expectedFindings: string;
}

export interface SymptomTriageResult {
  triageLevel: 'Emergency (Level 1)' | 'Urgent (Level 2)' | 'Semi-Urgent (Level 3)' | 'Non-Urgent / Routine (Level 4)';
  triageColor: 'rose' | 'amber' | 'blue' | 'emerald';
  overallConfidence: number;
  clinicalSummary: string;
  rankedPathways: DiagnosticPathway[];
  baselineTests: BaselineTestRecommendation[];
  redFlags: string[];
  immediateActions: string[];
  suggestedReferralSpecialty: string;
  disclaimer: string;
}

export interface AIRecommendation {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  patientCity: string;
  category: AIRecommendationCategory;
  urgency: 'High' | 'Medium' | 'Low';
  aiConfidence: number; // e.g. 94
  title: string;
  insight: string;
  evidence: string[];
  differentialDiagnoses?: Array<{
    condition: string;
    probability: 'High' | 'Medium' | 'Low';
    rationale: string;
  }>;
  suggestedNextSteps: string[];
  medicationConsiderations?: string[];
  recommendedLabInvestigations?: string[];
  createdAt: string;
  status: 'Pending Review' | 'Reviewed & Accepted' | 'Dismissed';
  doctorReviewedBy?: string;
  doctorNotes?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. "PK-MED-84920"
  fullName: string;
  age: number;
  gender: Gender;
  bloodGroup: BloodGroup;
  cnic: string; // Pakistani CNIC format "35201-xxxxxxx-x"
  phone: string;
  email?: string;
  city: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  assignedDoctorId: string;
  assignedDoctorName: string;
  department: string;
  lastVisitDate: string;
  status: PatientStatus;
  riskLevel: RiskLevel;
  riskScore?: number;
  primaryCondition: string;
  allergies: Allergy[];
  vitalsHistory: VitalSign[];
  diagnoses: Diagnosis[];
  avatarUrl?: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  title?: string;
  specialty: string;
  department: string;
  qualifications: string | string[]; // e.g. "MBBS, FCPS (Cardiology), FACC" or ["MBBS", "FCPS"]
  pmdcNumber?: string;
  pmdcRegNumber?: string; // e.g. "PMC-48291-P"
  experienceYears?: number;
  hospital: string;
  city: string;
  rating?: number;
  reviewCount?: number;
  availableDays?: string[];
  consultationHours?: string;
  opdTimings?: string;
  consultationFee?: string;
  consultationFeePkr?: number;
  avatarUrl: string;
  bio?: string;
  isAvailableToday?: boolean;
}

export type HospitalInfo = PakistanHospitalNode;
export type MedicationItem = Medication;

export interface NotificationItem {
  id: string;
  category: 'Appointments' | 'AI Recommendations' | 'Lab Results' | 'Prescriptions' | 'Patient Updates' | 'System';
  type?: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  targetId?: string;
  relatedPatientId?: string;
  priority: 'High' | 'Normal' | 'Low';
}

export interface PakistanHospitalNode {
  id: string;
  name: string;
  city: string;
  province: 'Punjab' | 'Sindh' | 'Khyber Pakhtunkhwa' | 'Balochistan' | 'Islamabad Capital Territory';
  category: 'Tertiary Care Hospital' | 'Cardiology Institute' | 'Specialized Diagnostic Center' | 'Children Hospital' | 'Emergency Trauma Center';
  address: string;
  bedsCount: number;
  activeDoctors: number;
  emergencyHelpline: string;
  status: 'Online & Connected' | 'High Capacity' | 'Normal Operations';
  specialties: string[];
  imageUrl?: string;
}

export type BloodStockStatus = 'Adequate' | 'Moderate' | 'Low Stock' | 'Critical Shortage';

export interface BloodStockItem {
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  status: BloodStockStatus;
  testedSafe: boolean;
  freshnessDaysAvg: number;
  plasmaBags: number;
  plateletsUnits: number;
  lastUpdated: string;
}

export interface HospitalBloodBank {
  id: string;
  hospitalId: string;
  hospitalName: string;
  city: string;
  province: string;
  address: string;
  contactHelpline: string;
  focalPerson: string;
  operatingHours: string;
  isEmergencyDispatchActive: boolean;
  lastInventorySync: string;
  stocks: Record<BloodGroup, BloodStockItem>;
  totalUnits: number;
  criticalGroups: BloodGroup[];
}

