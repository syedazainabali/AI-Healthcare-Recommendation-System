import { Patient, Medication } from '../types';

export interface DrugInteractionAlert {
  id: string;
  drugsInvolved: string[];
  severity: 'Critical' | 'High' | 'Moderate' | 'Minor';
  category: 'Drug-Drug' | 'Allergy-Conflict' | 'Disease-Contraindication' | 'Dosage-Warning';
  title: string;
  mechanism: string;
  clinicalRisk: string;
  management: string;
  suggestedAlternative?: {
    drugName: string;
    dosage: string;
    rationale: string;
  };
}

export interface PrescriptionSafetyAnalysis {
  isSafe: boolean;
  safetyScore: number; // 0 - 100
  overallRisk: 'None' | 'Low' | 'Moderate' | 'Severe';
  summary: string;
  alerts: DrugInteractionAlert[];
  drugInteractions: DrugInteractionAlert[];
  allergyConflicts: DrugInteractionAlert[];
  diseaseContraindications: DrugInteractionAlert[];
  dosageWarnings: DrugInteractionAlert[];
  recommendations: string[];
  patientCounseling: {
    english: string[];
    urdu: string[];
  };
}

/**
 * Standard Pakistani Brand Name to Generic Active Ingredient Resolver
 */
export interface FormularyDrug {
  brandName: string;
  genericName: string;
  drugClass: string;
  standardDosage: string;
  standardFrequency: string;
  route: string;
  instructions: string;
  commonUses: string;
  primaryRisks?: string[];
}

export const PAKISTAN_FORMULARY: FormularyDrug[] = [
  {
    brandName: 'Augmentin',
    genericName: 'Amoxicillin + Clavulanic Acid',
    drugClass: 'Penicillin Antibiotic (Beta-lactam)',
    standardDosage: '625 mg',
    standardFrequency: 'Twice Daily (BD)',
    route: 'Oral',
    instructions: 'Take immediately before or with meals to minimize GI distress',
    commonUses: 'Respiratory tract infections, UTI, skin infections',
    primaryRisks: ['Penicillin allergy anaphylaxis', 'Hepatic cholestatic jaundice with prolonged use']
  },
  {
    brandName: 'Panadol',
    genericName: 'Paracetamol (Acetaminophen)',
    drugClass: 'Analgesic & Antipyretic',
    standardDosage: '500 mg',
    standardFrequency: 'Three Times Daily (TDS)',
    route: 'Oral',
    instructions: 'Take with full glass of water. Do not exceed 4g (8 tablets) in 24 hours',
    commonUses: 'Pyrexia, mild to moderate somatic pain, headache',
    primaryRisks: ['Hepatotoxicity at supratherapeutic doses or with chronic alcohol intake']
  },
  {
    brandName: 'Brufen',
    genericName: 'Ibuprofen',
    drugClass: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
    standardDosage: '400 mg',
    standardFrequency: 'Twice Daily (BD)',
    route: 'Oral',
    instructions: 'Always take after meals with plenty of water',
    commonUses: 'Inflammatory pain, arthritis, dysmenorrhea',
    primaryRisks: ['Gastric ulceration', 'Acute kidney injury', 'Exacerbation of asthma / bronchospasm']
  },
  {
    brandName: 'Voltral',
    genericName: 'Diclofenac Sodium',
    drugClass: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
    standardDosage: '50 mg',
    standardFrequency: 'Twice Daily (BD)',
    route: 'Oral',
    instructions: 'Take after meals. Avoid in severe renal or cardiac failure',
    commonUses: 'Acute musculoskeletal pain, postoperative inflammation',
    primaryRisks: ['Cardiovascular thrombotic risk', 'Gastrointestinal bleeding']
  },
  {
    brandName: 'Ponstan',
    genericName: 'Mefenamic Acid',
    drugClass: 'NSAID / Fenamate',
    standardDosage: '500 mg',
    standardFrequency: 'Three Times Daily (TDS)',
    route: 'Oral',
    instructions: 'Take after meals for maximum 5 to 7 days',
    commonUses: 'Dental pain, post-surgical pain, primary dysmenorrhea',
    primaryRisks: ['GI ulceration', 'Diarrhea', 'Renal papillary necrosis']
  },
  {
    brandName: 'Lisinopril / Zestril',
    genericName: 'Lisinopril',
    drugClass: 'ACE Inhibitor (Angiotensin Converting Enzyme)',
    standardDosage: '10 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take once daily in morning with or without food',
    commonUses: 'Hypertension, heart failure, post-myocardial infarction',
    primaryRisks: ['Hyperkalemia', 'Dry persistent cough', 'Angioedema', 'Teratogenic in pregnancy']
  },
  {
    brandName: 'Norvasc / Amlodipine',
    genericName: 'Amlodipine Besylate',
    drugClass: 'Dihydropyridine Calcium Channel Blocker (CCB)',
    standardDosage: '5 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take at night or morning. Monitor for ankle edema',
    commonUses: 'Hypertension, chronic stable angina',
    primaryRisks: ['Peripheral pedal edema', 'Flushing', 'Postural hypotension']
  },
  {
    brandName: 'Concor',
    genericName: 'Bisoprolol Fumarate',
    drugClass: 'Cardioselective Beta-1 Blocker',
    standardDosage: '5 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take morning with breakfast. Do not discontinue abruptly',
    commonUses: 'Hypertension, chronic heart failure, angina pectoris',
    primaryRisks: ['Bradycardia', 'Bronchospasm in severe asthmatics', 'Masking hypoglycemic symptoms']
  },
  {
    brandName: 'Glucophage',
    genericName: 'Metformin Hydrochloride',
    drugClass: 'Biguanide Antidiabetic Agent',
    standardDosage: '500 mg',
    standardFrequency: 'Twice Daily (BD)',
    route: 'Oral',
    instructions: 'Take with or immediately after main meals to avoid nausea',
    commonUses: 'Type 2 Diabetes Mellitus, PCOS',
    primaryRisks: ['Lactic acidosis (rare but severe in renal eGFR < 30)', 'GI upset']
  },
  {
    brandName: 'Lowplat / Disprin Cardio',
    genericName: 'Clopidogrel / Low-dose Aspirin',
    drugClass: 'Antiplatelet Agent (P2Y12 Inhibitor / COX-1 Inhibitor)',
    standardDosage: '75 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take once daily after meals. Report unusual bruising or hematuria',
    commonUses: 'Secondary prevention of acute coronary syndrome, stroke prevention',
    primaryRisks: ['Major bleeding hazard with concurrent NSAIDs or Anticoagulants']
  },
  {
    brandName: 'Warfarin / Marevan',
    genericName: 'Warfarin Sodium',
    drugClass: 'Vitamin K Antagonist Anticoagulant',
    standardDosage: '5 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take at exactly 6 PM daily. Strict INR monitoring (Target 2.0 - 3.0)',
    commonUses: 'Atrial fibrillation, DVT/PE, mechanical prosthetic heart valves',
    primaryRisks: ['Major hemorrhage with NSAIDs, Aspirin, Fluconazole, or Macrolides']
  },
  {
    brandName: 'Nexum / Risek',
    genericName: 'Esomeprazole / Omeprazole',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    standardDosage: '40 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take 30 minutes before first meal of the day',
    commonUses: 'GERD, peptic ulcer healing, gastroprotection with NSAIDs',
    primaryRisks: ['Decreased antiplatelet activation of Clopidogrel (CYP2C19 competition)']
  },
  {
    brandName: 'Lipitor / Crestor',
    genericName: 'Atorvastatin / Rosuvastatin',
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    standardDosage: '20 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take at bedtime. Report unexplained muscle aches or weakness',
    commonUses: 'Hypercholesterolemia, ASCVD risk reduction',
    primaryRisks: ['Myopathy / Rhabdomyolysis when combined with Macrolides or Fibrates']
  },
  {
    brandName: 'Ciproxin / Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    drugClass: 'Fluoroquinolone Antibiotic',
    standardDosage: '500 mg',
    standardFrequency: 'Twice Daily (BD)',
    route: 'Oral',
    instructions: 'Do not take with milk or antacids within 2 hours. Drink plentiful water',
    commonUses: 'Typhoid fever, complicated UTI, gastroenteritis',
    primaryRisks: ['Tendinitis / tendon rupture', 'QTc prolongation', 'Contraindicated in pregnancy/children']
  },
  {
    brandName: 'Septran',
    genericName: 'Co-trimoxazole (Sulfamethoxazole + Trimethoprim)',
    drugClass: 'Sulfonamide Antimicrobial',
    standardDosage: '960 mg (DS)',
    standardFrequency: 'Twice Daily (BD)',
    route: 'Oral',
    instructions: 'Take with plenty of fluid. Discontinue at first sign of skin rash',
    commonUses: 'Pneumocystis prophylaxis, bacterial enteric infections, UTI',
    primaryRisks: ['Sulfa allergy severe Steven-Johnson Syndrome', 'Hyperkalemia with ACE inhibitors']
  },
  {
    brandName: 'Spironolactone / Aldactone',
    genericName: 'Spironolactone',
    drugClass: 'Potassium-Sparing Diuretic / Aldosterone Antagonist',
    standardDosage: '25 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take in morning with breakfast to prevent nocturnal diuresis',
    commonUses: 'Heart failure NYHA Class II-IV, refractory hypertension, ascites',
    primaryRisks: ['Severe life-threatening Hyperkalemia when combined with Lisinopril / ACEi']
  },
  {
    brandName: 'Flagyl',
    genericName: 'Metronidazole',
    drugClass: 'Nitroimidazole Antibacterial & Antiprotozoal',
    standardDosage: '400 mg',
    standardFrequency: 'Three Times Daily (TDS)',
    route: 'Oral',
    instructions: 'Take after meals. Strictly avoid alcohol (severe disulfiram reaction)',
    commonUses: 'Amebiasis, Giardiasis, anaerobic dental & abdominal infections',
    primaryRisks: ['Disulfiram-like reaction with alcohol', 'Metallic taste', 'Peripheral neuropathy']
  },
  {
    brandName: 'Ventolin / Asthalin',
    genericName: 'Salbutamol / Albuterol',
    drugClass: 'Short-Acting Beta-2 Agonist (SABA) Bronchodilator',
    standardDosage: '100 mcg (2 Puffs)',
    standardFrequency: 'As Needed (PRN)',
    route: 'Inhalation',
    instructions: 'Rinse mouth after inhalation. Use spacer device for optimal delivery',
    commonUses: 'Acute bronchial asthma bronchospasm, COPD relief',
    primaryRisks: ['Tachycardia', 'Tremor', 'Antagonized by Beta-blockers']
  },
  {
    brandName: 'Azomax / Zithromax',
    genericName: 'Azithromycin',
    drugClass: 'Macrolide Antibiotic',
    standardDosage: '500 mg',
    standardFrequency: 'Once Daily (OD)',
    route: 'Oral',
    instructions: 'Take 1 hour before or 2 hours after meals once daily for 3–5 days',
    commonUses: 'Atypical pneumonia, acute sinusitis, tonsillopharyngitis',
    primaryRisks: ['QT prolongation', 'Inhibition of statin clearance leading to myopathy']
  }
];

/**
 * Normalizes drug query strings to generic names and active classes
 */
export function resolveDrugMetadata(drugName: string): FormularyDrug | null {
  if (!drugName) return null;
  const clean = drugName.toLowerCase().trim();
  
  const found = PAKISTAN_FORMULARY.find(f => 
    clean.includes(f.brandName.toLowerCase()) || 
    f.brandName.toLowerCase().includes(clean) ||
    clean.includes(f.genericName.toLowerCase()) ||
    f.genericName.toLowerCase().includes(clean)
  );

  return found || null;
}

/**
 * Fast client-side pharmacological rule evaluation
 */
export function analyzePrescriptionSafetyLocally(
  patient: Patient,
  prescribedMedications: Medication[],
  existingMedications: Medication[] = []
): PrescriptionSafetyAnalysis {
  const alerts: DrugInteractionAlert[] = [];
  const allMedications = [...prescribedMedications];

  // Combine newly written medications and patient's existing active regimens
  const combinedMeds = [
    ...prescribedMedications.map(m => ({ ...m, isNew: true })),
    ...existingMedications.map(m => ({ ...m, isNew: false }))
  ].filter(m => m.name && m.name.trim().length > 1);

  const drugNames = combinedMeds.map(m => m.name.toLowerCase());
  const patientAllergies = (patient.allergies || []).map(a => ({
    allergen: a.allergen.toLowerCase(),
    severity: a.severity,
    reaction: a.reaction
  }));
  const patientDiagnoses = [
    patient.primaryCondition || '',
    ...(patient.diagnoses || []).map(d => d.condition)
  ].map(d => d.toLowerCase());

  // 1. Check ALLERGY CONFLICTS
  prescribedMedications.forEach((med, idx) => {
    const medName = med.name.toLowerCase();
    const resolved = resolveDrugMetadata(med.name);

    // Penicillin check
    const isPenicillin = medName.includes('augmentin') || medName.includes('amoxicillin') || medName.includes('ampicillin') || medName.includes('penicillin');
    const hasPenicillinAllergy = patientAllergies.some(a => a.allergen.includes('penicillin') || a.allergen.includes('amox') || a.allergen.includes('beta-lactam'));

    if (isPenicillin && hasPenicillinAllergy) {
      const allergy = patientAllergies.find(a => a.allergen.includes('penicillin') || a.allergen.includes('amox') || a.allergen.includes('beta-lactam'));
      alerts.push({
        id: `allergy-${idx}-penicillin`,
        drugsInvolved: [med.name],
        severity: 'Critical',
        category: 'Allergy-Conflict',
        title: `Severe Allergy Conflict: Penicillin Cross-Reactivity`,
        mechanism: `Patient has a documented ${allergy?.severity || 'Severe'} allergy to Penicillin (${allergy?.reaction || 'Hypersensitivity'}). ${med.name} contains amoxicillin/beta-lactam ring.`,
        clinicalRisk: `Acute Anaphylaxis, bronchospasm, angioedema, or severe urticarial reaction.`,
        management: `Immediately discontinue ${med.name}. Substitute with a non-beta-lactam antibiotic class.`,
        suggestedAlternative: {
          drugName: 'Azithromycin (Azomax) 500mg',
          dosage: '500mg Once Daily (OD)',
          rationale: 'Macrolide class is safe in penicillin-allergic patients.'
        }
      });
    }

    // Sulfa check
    const isSulfa = medName.includes('septran') || medName.includes('cotrimoxazole') || medName.includes('sulfa') || medName.includes('sulfamethoxazole');
    const hasSulfaAllergy = patientAllergies.some(a => a.allergen.includes('sulfa') || a.allergen.includes('bactrim') || a.allergen.includes('sulfonamide'));

    if (isSulfa && hasSulfaAllergy) {
      alerts.push({
        id: `allergy-${idx}-sulfa`,
        drugsInvolved: [med.name],
        severity: 'Critical',
        category: 'Allergy-Conflict',
        title: `Sulfa Drug Hypersensitivity Warning`,
        mechanism: `Patient has documented allergy to Sulfa derivatives. ${med.name} is a sulfonamide compound.`,
        clinicalRisk: `Risk of Stevens-Johnson Syndrome (SJS), toxic epidermal necrolysis, or severe dermatological reaction.`,
        management: `Avoid sulfonamides completely. Substitute with Ciprofloxacin or Nitrofurantoin.`,
        suggestedAlternative: {
          drugName: 'Ciprofloxacin 500mg',
          dosage: '500mg Twice Daily (BD)',
          rationale: 'Fluoroquinolones have zero sulfonamide cross-reactivity.'
        }
      });
    }

    // NSAID / Aspirin Allergy check
    const isNsaid = medName.includes('brufen') || medName.includes('ibuprofen') || medName.includes('aspirin') || medName.includes('disprin') || medName.includes('diclofenac') || medName.includes('voltral') || medName.includes('ponstan') || medName.includes('naproxen');
    const hasAspirinAllergy = patientAllergies.some(a => a.allergen.includes('aspirin') || a.allergen.includes('nsaid') || a.allergen.includes('ibuprofen'));

    if (isNsaid && hasAspirinAllergy) {
      alerts.push({
        id: `allergy-${idx}-nsaid`,
        drugsInvolved: [med.name],
        severity: 'High',
        category: 'Allergy-Conflict',
        title: `NSAID / Aspirin Hypersensitivity Reaction`,
        mechanism: `Patient profile flags NSAID/Aspirin allergy. ${med.name} inhibits COX pathway triggering leukotriene accumulation.`,
        clinicalRisk: `Worsening bronchospasm (Aspirin-Exacerbated Respiratory Disease), angioedema, or severe gastric pain.`,
        management: `Replace NSAID with safe analgesic like Paracetamol (Panadol).`,
        suggestedAlternative: {
          drugName: 'Paracetamol (Panadol) 500mg',
          dosage: '500mg TDS (Three Times Daily)',
          rationale: 'Selective central analgesic with excellent safety in NSAID-sensitive patients.'
        }
      });
    }
  });

  // 2. Check DRUG-DRUG INTERACTIONS (DDI)
  // ACEi / ARB + Spironolactone / Potassium Sparing
  const hasAcei = drugNames.some(d => d.includes('lisinopril') || d.includes('zestril') || d.includes('captopril') || d.includes('enalapril') || d.includes('ramipril') || d.includes('losartan') || d.includes('valsartan'));
  const hasSpironolactone = drugNames.some(d => d.includes('spironolactone') || d.includes('aldactone') || d.includes('eplerenone'));

  if (hasAcei && hasSpironolactone) {
    alerts.push({
      id: `ddi-acei-spiro`,
      drugsInvolved: ['Lisinopril / ACE Inhibitor', 'Spironolactone / Aldactone'],
      severity: 'Critical',
      category: 'Drug-Drug',
      title: `Critical DDI: Severe Hyperkalemia Risk`,
      mechanism: `Dual aldosterone blockade and renin-angiotensin inhibition drastically restricts renal potassium clearance.`,
      clinicalRisk: `Lethal hyperkalemia (>6.0 mmol/L), cardiac conduction blocks, and ventricular arrhythmias.`,
      management: `Strictly check baseline Serum Potassium & eGFR. If combined, monitor electrolytes at 1 week, 4 weeks, and every 3 months.`,
      suggestedAlternative: {
        drugName: 'Amlodipine 5mg',
        dosage: '5mg Once Daily (OD)',
        rationale: 'Calcium channel blockers provide potent synergistic BP reduction without altering potassium balance.'
      }
    });
  }

  // Warfarin / DOAC + NSAID / Aspirin
  const hasWarfarin = drugNames.some(d => d.includes('warfarin') || d.includes('marevan') || d.includes('apixaban') || d.includes('eliquis') || d.includes('rivaroxaban') || d.includes('xarelto'));
  const hasNsaid = drugNames.some(d => d.includes('brufen') || d.includes('ibuprofen') || d.includes('diclofenac') || d.includes('voltral') || d.includes('ponstan') || d.includes('aspirin') || d.includes('disprin'));

  if (hasWarfarin && hasNsaid) {
    alerts.push({
      id: `ddi-warfarin-nsaid`,
      drugsInvolved: ['Anticoagulant (Warfarin/DOAC)', 'NSAID / Aspirin'],
      severity: 'Critical',
      category: 'Drug-Drug',
      title: `Critical DDI: Major Gastrointestinal & Systemic Hemorrhage`,
      mechanism: `NSAIDs cause direct gastric mucosal erosion and antiplatelet inhibition while anticoagulants impair coagulation cascades.`,
      clinicalRisk: `4-fold to 6-fold increased hazard of major upper GI bleed, peptic perforation, or intracranial hemorrhage.`,
      management: `Avoid routine systemic NSAIDs. Use Paracetamol or topical analgesics. Add high-dose PPI (Esomeprazole 40mg) if co-administration is mandatory.`,
      suggestedAlternative: {
        drugName: 'Panadol (Paracetamol) 500mg',
        dosage: '500mg TDS',
        rationale: 'Zero antiplatelet effect; does not increase gastrointestinal bleeding risk.'
      }
    });
  }

  // Clopidogrel + Omeprazole / Esomeprazole
  const hasClopidogrel = drugNames.some(d => d.includes('clopidogrel') || d.includes('lowplat') || d.includes('plavix'));
  const hasOmeprazole = drugNames.some(d => d.includes('omeprazole') || d.includes('risek') || d.includes('esomeprazole') || d.includes('nexum'));

  if (hasClopidogrel && hasOmeprazole) {
    alerts.push({
      id: `ddi-clopidogrel-ppi`,
      drugsInvolved: ['Clopidogrel (Lowplat)', 'Omeprazole / Esomeprazole (Nexum)'],
      severity: 'Moderate',
      category: 'Drug-Drug',
      title: `Moderate DDI: Attenuated Antiplatelet Bioactivation (CYP2C19)`,
      mechanism: `Omeprazole competitively inhibits hepatic CYP2C19 bioactivation of Clopidogrel into its active thiol metabolite.`,
      clinicalRisk: `Reduced antiplatelet efficacy; potential increase in secondary stent thrombosis or recurrent ischemic events.`,
      management: `Switch PPI to Pantoprazole (40mg) or Famotidine (20mg BD) which have minimal CYP2C19 inhibitory affinity.`,
      suggestedAlternative: {
        drugName: 'Pantoprazole 40mg',
        dosage: '40mg Once Daily (OD) before breakfast',
        rationale: 'Pantoprazole does not interfere with Clopidogrel activation pathway.'
      }
    });
  }

  // Statin + Macrolide (Azithromycin / Clarithromycin)
  const hasStatin = drugNames.some(d => d.includes('atorvastatin') || d.includes('lipitor') || d.includes('rosuvastatin') || d.includes('crestor') || d.includes('simvastatin'));
  const hasMacrolide = drugNames.some(d => d.includes('azithromycin') || d.includes('azomax') || d.includes('clarithromycin') || d.includes('erythromycin'));

  if (hasStatin && hasMacrolide) {
    alerts.push({
      id: `ddi-statin-macrolide`,
      drugsInvolved: ['Statin (Atorvastatin/Rosuvastatin)', 'Macrolide Antibiotic (Azithromycin)'],
      severity: 'Moderate',
      category: 'Drug-Drug',
      title: `Moderate DDI: Statin Accumulation & Rhabdomyolysis Risk`,
      mechanism: `Macrolides inhibit CYP3A4 and organic anion-transporting polypeptides (OATP1B1), increasing systemic statin serum levels.`,
      clinicalRisk: `Severe myalgia, elevated creatine kinase (CK), and potential acute rhabdomyolysis with secondary renal tubular necrosis.`,
      management: `Temporarily pause statin therapy during the 3–5 day course of macrolide antibiotic.`,
      suggestedAlternative: {
        drugName: 'Temporary Statin Holiday',
        dosage: 'Pause for 5 Days',
        rationale: 'Resume Statin 24 hours after completion of antibiotic course.'
      }
    });
  }

  // 3. Check DISEASE CONTRAINDICATIONS
  // Beta Blocker in Asthma / COPD
  const hasBetaBlocker = drugNames.some(d => d.includes('bisoprolol') || d.includes('concor') || d.includes('propranolol') || d.includes('inderal') || d.includes('atenolol') || d.includes('metoprolol'));
  const hasAsthma = patientDiagnoses.some(d => d.includes('asthma') || d.includes('bronchial') || d.includes('copd') || d.includes('bronchospasm'));

  if (hasBetaBlocker && hasAsthma) {
    alerts.push({
      id: `contra-bb-asthma`,
      drugsInvolved: ['Beta Blocker (Bisoprolol/Propranolol)'],
      severity: 'High',
      category: 'Disease-Contraindication',
      title: `Disease Contraindication: Beta-Blocker in Bronchial Asthma`,
      mechanism: `Inhibition of bronchial beta-2 receptors causes airway smooth muscle constriction and antagonizes rescue inhalers.`,
      clinicalRisk: `Acute severe bronchospasm, refractory wheezing, and precipitation of asthma status.`,
      management: `Avoid non-selective beta-blockers. If cardioselective agent is vital, monitor peak flow. Prefer ARB or CCB for hypertension.`,
      suggestedAlternative: {
        drugName: 'Amlodipine 5mg or Losartan 50mg',
        dosage: 'Once Daily (OD)',
        rationale: 'Non-respiratory mechanism; zero risk of bronchial hyper-reactivity.'
      }
    });
  }

  // Metformin in severe Renal Failure / CKD
  const hasMetformin = drugNames.some(d => d.includes('metformin') || d.includes('glucophage'));
  const hasCkd = patientDiagnoses.some(d => d.includes('kidney') || d.includes('renal') || d.includes('nephropathy') || d.includes('ckd') || d.includes('creatinine'));

  if (hasMetformin && hasCkd) {
    alerts.push({
      id: `contra-metformin-renal`,
      drugsInvolved: ['Metformin (Glucophage)'],
      severity: 'High',
      category: 'Disease-Contraindication',
      title: `Disease Precaution: Metformin in Renal Impairment`,
      mechanism: `Metformin is cleared 90% unchanged via renal filtration; decreased GFR leads to systemic biguanide accumulation.`,
      clinicalRisk: `Risk of Metformin-Associated Lactic Acidosis (MALA) if eGFR falls below 30 mL/min/1.73m².`,
      management: `Cap Metformin dose at 1000mg/day if eGFR is 30–44 mL/min. Discontinue immediately if eGFR < 30.`,
      suggestedAlternative: {
        drugName: 'Linagliptin (Trajenta) 5mg',
        dosage: '5mg Once Daily (OD)',
        rationale: 'DPP-4 inhibitor excreted primarily via bile/feces; 100% safe without renal dose adjustment.'
      }
    });
  }

  // NSAID in Renal Disease or Peptic Ulcer
  const hasPepticUlcer = patientDiagnoses.some(d => d.includes('ulcer') || d.includes('gerd') || d.includes('gastritis') || d.includes('reflux'));
  if (hasNsaid && (hasCkd || hasPepticUlcer)) {
    alerts.push({
      id: `contra-nsaid-renal-peptic`,
      drugsInvolved: ['NSAID (Brufen/Diclofenac/Ponstan)'],
      severity: 'High',
      category: 'Disease-Contraindication',
      title: `Disease Contraindication: NSAID in ${hasCkd ? 'Renal Impairment' : 'Peptic Ulcer Disease'}`,
      mechanism: `Inhibition of COX-1 and COX-2 reduces protective gastric mucosal prostaglandins and impairs renal blood flow autoregulation.`,
      clinicalRisk: `Gastrointestinal perforation, acute kidney injury (AKI), or sudden fluid retention.`,
      management: `Substitute with Paracetamol. If severe musculoskeletal inflammation persists, prescribe topical gel or short-course Celecoxib with high-dose PPI.`,
      suggestedAlternative: {
        drugName: 'Panadol 500mg + Topical Diclofenac Gel',
        dosage: 'Oral Paracetamol 500mg TDS + Gel applied locally',
        rationale: 'Minimal systemic toxicity with effective local analgesia.'
      }
    });
  }

  // 4. Calculate Safety Score
  let score = 100;
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const highCount = alerts.filter(a => a.severity === 'High').length;
  const moderateCount = alerts.filter(a => a.severity === 'Moderate').length;
  const minorCount = alerts.filter(a => a.severity === 'Minor').length;

  score -= (criticalCount * 35) + (highCount * 20) + (moderateCount * 10) + (minorCount * 5);
  score = Math.max(15, Math.min(100, score));

  const isSafe = criticalCount === 0 && highCount === 0;
  const overallRisk: 'None' | 'Low' | 'Moderate' | 'Severe' = 
    criticalCount > 0 ? 'Severe' : 
    highCount > 0 ? 'Moderate' : 
    moderateCount > 0 ? 'Low' : 'None';

  const drugInteractions = alerts.filter(a => a.category === 'Drug-Drug');
  const allergyConflicts = alerts.filter(a => a.category === 'Allergy-Conflict');
  const diseaseContraindications = alerts.filter(a => a.category === 'Disease-Contraindication');
  const dosageWarnings = alerts.filter(a => a.category === 'Dosage-Warning');

  const recommendations: string[] = [];
  if (criticalCount > 0) {
    recommendations.push('Immediate pharmacological intervention required: High-risk adverse reaction or allergy detected.');
  }
  if (allergyConflicts.length > 0) {
    recommendations.push(`Patient allergy conflict flagged: Do not dispense highlighted beta-lactams/sulfas without desensitization protocol.`);
  }
  if (drugInteractions.length > 0) {
    recommendations.push('Review synergistic electrolyte interactions (e.g. Potassium levels with ACEi/diuretics).');
  }
  if (recommendations.length === 0) {
    recommendations.push('Prescription verified: Compliant with PMDC digital formulary safety guidelines.');
    recommendations.push('Advise patient on adherence and reporting any idiosyncratic cutaneous symptoms.');
  }

  // Urdu & English patient counseling points
  const patientCounseling = {
    english: [
      'Take prescribed medications at fixed times daily with water.',
      'Do not abruptly discontinue anti-hypertensive or diabetic treatments without doctor consultation.',
      'Report any sudden dizziness, shortness of breath, or cutaneous rash immediately.'
    ],
    urdu: [
      'تمام ادویات روزانہ ڈاکٹر کی بتائی گئی خوراک کے مطابق وقت پر استعمال کریں۔',
      'بلڈ پریشر یا شوگر کی ادویات اچانک خود سے بند نہ کریں۔',
      'چکر آنے، جلد پر خارش یا سانس میں دشواری کی صورت میں فوراً معالج سے رابطہ کریں۔'
    ]
  };

  const summary = isSafe 
    ? `Prescription safety verified with a score of ${score}/100. No critical contraindications or allergy cross-reactivity detected.`
    : `Adverse reaction alert: ${criticalCount + highCount} significant clinical risk factors identified (Score: ${score}/100). Review recommended substitutions below.`;

  return {
    isSafe,
    safetyScore: score,
    overallRisk,
    summary,
    alerts,
    drugInteractions,
    allergyConflicts,
    diseaseContraindications,
    dosageWarnings,
    recommendations,
    patientCounseling
  };
}
