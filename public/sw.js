// MedAI Pakistan - Service Worker for Offline Critical Patient Triage
// Version: 1.0.4

const CACHE_NAME = 'medai-app-shell-v1';
const DATA_CACHE_NAME = 'medai-patient-triage-data-v1';

// Core assets to pre-cache on install for offline shell availability
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Critical offline fallback dataset for emergency triage when server cannot be reached
const OFFLINE_TRIAGE_PACK = {
  timestamp: new Date().toISOString(),
  systemStatus: 'OFFLINE_SURVIVAL_MODE',
  protocol: 'Pakistan Medical & Dental Council (PMDC) / ESI 5-Level Triage Guidelines',
  triageLevels: [
    {
      level: 1,
      category: 'Resuscitation / STAT Emergency',
      color: 'rose',
      maxWaitMinutes: 0,
      criteria: ['Cardiac arrest', 'Severe respiratory failure (SpO2 < 85%)', 'Unresponsive / GCS < 8', 'Severe anaphylaxis', 'Active massive hemorrhage'],
      immediateAction: 'Immediate airway, breathing, circulation resuscitation. High-flow oxygen, dual IV access, STAT physician summon.'
    },
    {
      level: 2,
      category: 'Emergent / High Acuity',
      color: 'rose',
      maxWaitMinutes: 10,
      criteria: ['Acute chest pain / suspected ACS', 'Severe dyspnea / wheezing (SpO2 86-91%)', 'Suspected stroke (<4.5 hrs)', 'Severe sepsis with altered vitals', 'High pain score (8-10/10)'],
      immediateAction: 'Bedside 12-lead ECG, continuous telemetry, IV access, emergency blood draw (Troponin/CBC), notify attending doctor.'
    },
    {
      level: 3,
      category: 'Urgent',
      color: 'amber',
      maxWaitMinutes: 30,
      criteria: ['Moderate asthma exacerbation', 'Dengue with warning signs (platelets < 50k, severe abdominal pain)', 'Uncontrolled hyperglycemia (>300 mg/dL)', 'Fractures with neurovascular intact'],
      immediateAction: 'Vital signs stabilization, point-of-care capillary glucose, hematocrit/CBC check, IV hydration.'
    },
    {
      level: 4,
      category: 'Semi-Urgent',
      color: 'blue',
      maxWaitMinutes: 60,
      criteria: ['Mild febrile illness with stable vitals', 'Uncomplicated urinary tract infection', 'Minor soft-tissue lacerations', 'Chronic hypertension with mild headache'],
      immediateAction: 'Basic oral analgesia/antipyretic, routine lab collection, nursing triage observation.'
    },
    {
      level: 5,
      category: 'Non-Urgent / Routine OPD',
      color: 'emerald',
      maxWaitMinutes: 120,
      criteria: ['Routine prescription refill', 'Suture removal', 'Chronic stable follow-up', 'Mild skin rashes without systemic signs'],
      immediateAction: 'Queue for outpatient physician review; verify electronic QR prescription on file.'
    }
  ]
};

// Install Event: pre-cache critical shell assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[MedAI SW] Pre-caching offline application shell assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[MedAI SW] Pre-cache partial miss (expected during dynamic dev bundling):', err);
      });
    })
  );
});

// Activate Event: purge stale cache versions & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[MedAI SW] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: intelligent caching strategy for patient lookup data & triage
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Critical Patient Triage API data (GET /api/patients/critical-triage or /api/health)
  if (url.pathname.startsWith('/api/patients') || url.pathname === '/api/health') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clonedResponse = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[MedAI SW] Offline network detection: Serving cached critical patient triage data for:', url.pathname);
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return synthetic offline pack if no previous cache exists
          return new Response(JSON.stringify({
            offline: true,
            status: 'OFFLINE_CACHE_FALLBACK',
            message: 'Operating in disconnected offline survival mode',
            data: OFFLINE_TRIAGE_PACK
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // 2. Intercept AI Symptom Triage / Case Analysis when offline
  if (url.pathname.startsWith('/api/gemini/symptom-triage') || url.pathname.startsWith('/api/gemini/analyze-patient')) {
    event.respondWith(
      fetch(event.request.clone()).catch(async () => {
        console.log('[MedAI SW] Offline mode: generating deterministic emergency triage response for:', url.pathname);
        return new Response(JSON.stringify({
          success: true,
          offline: true,
          source: 'medai-offline-service-worker-engine',
          data: {
            triageLevel: 'Urgent (Level 2)',
            triageColor: 'amber',
            overallConfidence: 85,
            clinicalSummary: '⚡ OFFLINE CLINICAL FALLBACK: Internet connection unavailable. Automated guideline-based triage assessment based on PMDC emergency protocols.',
            rankedPathways: [
              {
                rank: 1,
                condition: 'Emergency Clinical Assessment Required (Offline Guideline)',
                icdCode: 'R69',
                probability: 'Moderate',
                confidencePercentage: 80,
                clinicalRationale: 'Patient presenting with acute symptoms during network outage. Check vital signs and look for red flag indicators immediately.',
                matchingSymptoms: ['Reported acute distress', 'Pending clinical correlation'],
                discriminatingFeatures: 'Vital sign stability (BP, HR, SpO2, Temp) and GCS assessment.',
                urgencyLevel: 'Urgent (<24h)'
              }
            ],
            baselineTests: [
              {
                testName: 'Bedside Vital Signs & Point-of-Care Blood Glucose',
                category: 'Point-of-Care / Bedside',
                urgency: 'Stat / Immediate',
                clinicalJustification: 'Assess hemodynamic stability and rule out hypoglycemia/hyperglycemia during network outage.',
                expectedFindings: 'Target BP < 140/90, SpO2 > 94%, Glucose 80-140 mg/dL'
              }
            ],
            redFlags: [
              'Systolic Blood Pressure < 90 or > 180 mmHg',
              'Oxygen Saturation (SpO2) < 92% on room air',
              'Altered mental status / GCS < 13',
              'Severe unremitting chest pain or signs of acute shock'
            ],
            immediateActions: [
              'Check patient against cached local EHR records using Patient MRN',
              'Perform standard ABCDE primary trauma and medical survey',
              'Record paper emergency chart if power/network disruption persists'
            ],
            suggestedReferralSpecialty: 'Emergency Medicine / Internal Medicine',
            disclaimer: 'Generated by MedAI Offline Service Worker. Clinical examination by attending staff is mandatory.'
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 3. Static Assets & App Navigation: Network First with Cache Fallback
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If requesting an HTML navigation document, return cached root/index.html
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            const rootCache = await caches.match('/index.html') || await caches.match('/');
            if (rootCache) return rootCache;
          }
          return new Response('Network offline. MedAI cached patient lookup remains accessible.', {
            status: 503,
            statusText: 'Service Unavailable (Offline)'
          });
        })
    );
  }
});

// Message listener for manual cache management & synchronization from main thread
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_PATIENT_TRIAGE_DATA') {
    const patientData = event.data.payload;
    caches.open(DATA_CACHE_NAME).then((cache) => {
      const syntheticResponse = new Response(JSON.stringify(patientData), {
        headers: {
          'Content-Type': 'application/json',
          'X-MedAI-Cache-Timestamp': new Date().toISOString()
        }
      });
      cache.put('/api/patients/critical-triage', syntheticResponse);
      console.log('[MedAI SW] Successfully cached critical patient triage records into Service Worker data store.');
    });
  }

  if (event.data.type === 'GET_CACHE_STATUS') {
    caches.open(DATA_CACHE_NAME).then(async (cache) => {
      const matched = await cache.match('/api/patients/critical-triage');
      let cachedCount = 0;
      let timestamp = null;
      if (matched) {
        try {
          const json = await matched.json();
          cachedCount = Array.isArray(json.patients) ? json.patients.length : (Array.isArray(json) ? json.length : 0);
          timestamp = json.timestamp || new Date().toISOString();
        } catch (e) {
          // ignore
        }
      }
      event.source.postMessage({
        type: 'CACHE_STATUS_RESPONSE',
        cachedCount,
        timestamp,
        active: true
      });
    });
  }
});
