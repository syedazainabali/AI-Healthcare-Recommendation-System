import React, { useState, useEffect } from 'react';
import { Sidebar, NavSection } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast, ToastMessage } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientRecordsView } from './components/patients/PatientRecordsView';
import { PatientProfileModal } from './components/patients/PatientProfileModal';
import { AddPatientModal } from './components/patients/AddPatientModal';
import { AIRecommendationsView } from './components/ai/AIRecommendationsView';
import { AICaseInvestigatorModal } from './components/ai/AICaseInvestigatorModal';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { BookAppointmentModal } from './components/appointments/BookAppointmentModal';
import { PrescriptionsView } from './components/prescriptions/PrescriptionsView';
import { WritePrescriptionModal } from './components/prescriptions/WritePrescriptionModal';
import { MedicalHistoryView } from './components/history/MedicalHistoryView';
import { LabReportsView } from './components/reports/LabReportsView';
import { DoctorsDirectoryView } from './components/doctors/DoctorsDirectoryView';
import { PakistanNetworkView } from './components/network/PakistanNetworkView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { DoctorProfileView } from './components/profile/DoctorProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { PublicHospitalLanding } from './components/public/PublicHospitalLanding';
import { EmergencyTriageModal } from './components/emergency/EmergencyTriageModal';
import { BiometricAuthModal } from './components/security/BiometricAuthModal';
import { FloatingAIChatWidget } from './components/chat/FloatingAIChatWidget';
import { OfflineTriageBar } from './components/common/OfflineTriageBar';
import { registerServiceWorker, syncPatientTriageCache } from './registerServiceWorker';
import { getBiometricConfig, isBiometricSessionValid } from './utils/biometricAuth';
import { initTheme } from './utils/theme';

import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_AI_RECOMMENDATIONS,
  INITIAL_LAB_REPORTS,
  INITIAL_HOSPITALS,
  INITIAL_NOTIFICATIONS,
  CURRENT_USER,
} from './data/mockData';

import {
  Patient,
  Doctor,
  Appointment,
  Prescription,
  AIRecommendation,
  LabReport,
  HospitalInfo,
  NotificationItem,
  UserProfile,
  AppointmentStatus,
} from './types';

export default function App() {
  // Navigation state - defaults to Webtixa Public Landing page clone
  const [currentSection, setCurrentSection] = useState<NavSection>('public-landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Clinical State
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);
  const [labReports, setLabReports] = useState<LabReport[]>(INITIAL_LAB_REPORTS);
  const [hospitals, setHospitals] = useState<HospitalInfo[]>(INITIAL_HOSPITALS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);

  // Initialize theme and service worker on app mount
  useEffect(() => {
    initTheme();
    registerServiceWorker({
      onSuccess: () => {
        console.log('[MedAI] Service worker registered and active.');
      },
      onOffline: () => {
        showToast('Offline Mode Active', 'Switched to local cached patient triage data.', 'warning');
      },
      onOnline: () => {
        showToast('Online Connected', 'Network restored. Synchronized with live EHR backend.', 'success');
      },
    });
  }, []);

  // Sync patient triage data to offline cache whenever patients list updates
  useEffect(() => {
    if (patients.length > 0) {
      syncPatientTriageCache(patients);
    }
  }, [patients]);

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isCaseInvestigatorOpen, setIsCaseInvestigatorOpen] = useState(false);
  const [isBookAppointmentOpen, setIsBookAppointmentOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<string | undefined>(undefined);
  const [isWritePrescriptionOpen, setIsWritePrescriptionOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Biometric Security Gate
  const [isBiometricAuthOpen, setIsBiometricAuthOpen] = useState(false);
  const [pendingPatientForAuth, setPendingPatientForAuth] = useState<Patient | null>(null);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Secure biometric interceptor when opening any sensitive patient record (PHI)
  const handleSelectPatientWithBiometrics = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    const config = getBiometricConfig();
    if (config.enabled && !isBiometricSessionValid()) {
      setPendingPatientForAuth(patient);
      setIsBiometricAuthOpen(true);
    } else {
      setSelectedPatientId(patientId);
    }
  };

  const handleBiometricSuccess = (patientId: string) => {
    setIsBiometricAuthOpen(false);
    setPendingPatientForAuth(null);
    setSelectedPatientId(patientId);
  };

  // Handlers for state updates
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    // Create an automatic notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      category: 'Patient Updates',
      title: 'New Patient Registered',
      description: `${newPatient.fullName} (MRN: ${newPatient.mrn}) registered under ${newPatient.department}.`,
      timestamp: 'Just now',
      type: 'System Alert',
      isRead: false,
      priority: 'Normal',
      relatedPatientId: newPatient.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdatePatient = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleBookAppointment = (newAppointment: Appointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      category: 'Appointments',
      title: 'Consultation Scheduled',
      description: `Appointment confirmed for ${newAppointment.patientName} with ${newAppointment.doctorName} on ${newAppointment.date}.`,
      timestamp: 'Just now',
      type: 'Appointment',
      isRead: false,
      priority: 'High',
      relatedPatientId: newAppointment.patientId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt))
    );
  };

  const handleSavePrescription = (newPrescription: Prescription) => {
    setPrescriptions((prev) => [newPrescription, ...prev]);
  };

  const handleDispensePrescription = (prescriptionId: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === prescriptionId ? { ...rx, status: 'Dispensed' } : rx))
    );
  };

  const handleApplyAIRecommendation = (recId: string) => {
    setAiRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: 'Reviewed & Accepted' } : r))
    );
  };

  const handleDismissAIRecommendation = (recId: string) => {
    setAiRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: 'Dismissed' } : r))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleOpenBookAppointmentWithDoctor = (doctorId?: string) => {
    setSelectedDoctorForBooking(doctorId);
    setIsBookAppointmentOpen(true);
  };

  const currentSelectedPatient = patients.find((p) => p.id === selectedPatientId);

  // If in public landing page mode, render public hospital website view
  if (currentSection === 'public-landing') {
    return (
      <>
        <Toast toasts={toasts} onClose={removeToast} />
        <PublicHospitalLanding
          doctors={doctors}
          hospitals={hospitals}
          onOpenPortal={() => setCurrentSection('dashboard')}
          onOpenBookAppointment={(docId) => handleOpenBookAppointmentWithDoctor(docId)}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          onOpenAICaseInvestigator={() => setIsCaseInvestigatorOpen(true)}
        />
        {/* Modals available from public portal */}
        <BookAppointmentModal
          isOpen={isBookAppointmentOpen}
          onClose={() => setIsBookAppointmentOpen(false)}
          patients={patients}
          doctors={doctors}
          onBookAppointment={handleBookAppointment}
          onShowToast={showToast}
        />
        <AICaseInvestigatorModal
          isOpen={isCaseInvestigatorOpen}
          onClose={() => setIsCaseInvestigatorOpen(false)}
          patients={patients}
          onShowToast={showToast}
        />
        <EmergencyTriageModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
          hospitals={hospitals}
          onShowToast={showToast}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 font-sans antialiased overflow-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 relative transition-colors duration-150">
      {/* Subtle Background Matrix Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60 bg-dot-matrix"></div>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        currentUser={currentUser}
        pendingAICount={aiRecommendations.filter((r) => r.status === 'Pending Review').length}
        unreadNotifsCount={notifications.filter((n) => !n.isRead).length}
        isOpenMobile={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenLanding={() => setCurrentSection('public-landing')}
        onSignOut={() => showToast('Session Ended', 'You have been safely signed out.', 'info')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Offline Triage Bar & Connectivity Alert */}
        <OfflineTriageBar
          patients={patients}
          onSelectPatient={handleSelectPatientWithBiometrics}
          onShowToast={(msg, type) => showToast('Offline Triage', msg, type)}
        />

        {/* Top Header */}
        <Header
          currentSection={currentSection}
          currentUser={currentUser}
          notifications={notifications}
          patients={patients}
          doctors={doctors}
          onOpenMobileMenu={() => setIsSidebarOpen(true)}
          onSelectSection={setCurrentSection}
          onSelectPatient={handleSelectPatientWithBiometrics}
          onSelectDoctor={() => {}}
          onOpenAddPatient={() => setIsAddPatientOpen(true)}
          onOpenBookAppointment={() => setIsBookAppointmentOpen(true)}
          onOpenAICaseInvestigator={() => setIsCaseInvestigatorOpen(true)}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {currentSection === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              patients={patients}
              doctors={doctors}
              appointments={appointments}
              aiRecommendations={aiRecommendations}
              onNavigate={setCurrentSection}
              onSelectSection={setCurrentSection}
              onSelectPatient={handleSelectPatientWithBiometrics}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
              onOpenBookAppointment={() => setIsBookAppointmentOpen(true)}
              onOpenAICaseInvestigator={() => setIsCaseInvestigatorOpen(true)}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'patients' && (
            <PatientRecordsView
              patients={patients}
              onSelectPatient={handleSelectPatientWithBiometrics}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'ai-recommendations' && (
            <AIRecommendationsView
              recommendations={aiRecommendations}
              patients={patients}
              onSelectPatient={handleSelectPatientWithBiometrics}
              onApplyRecommendation={handleApplyAIRecommendation}
              onDismissRecommendation={handleDismissAIRecommendation}
              onAddAIRecommendation={(newRec) => setAiRecommendations((prev) => [newRec, ...prev])}
              onOpenCaseInvestigator={() => setIsCaseInvestigatorOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              doctors={doctors}
              onSelectPatient={handleSelectPatientWithBiometrics}
              onOpenBookAppointment={() => setIsBookAppointmentOpen(true)}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'prescriptions' && (
            <PrescriptionsView
              prescriptions={prescriptions}
              doctors={doctors}
              patients={patients}
              onSelectPatient={handleSelectPatientWithBiometrics}
              onOpenWritePrescription={() => setIsWritePrescriptionOpen(true)}
              onDispensePrescription={handleDispensePrescription}
              onShowToast={showToast}
            />
          )}

          {(currentSection === 'medical-history' || currentSection === 'history') && (
            <MedicalHistoryView
              patients={patients}
              doctors={doctors}
              onSelectPatient={handleSelectPatientWithBiometrics}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'reports' && (
            <LabReportsView
              labReports={labReports}
              patients={patients}
              onSelectPatient={handleSelectPatientWithBiometrics}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'doctors' && (
            <DoctorsDirectoryView
              doctors={doctors}
              onOpenBookAppointment={(docId) => handleOpenBookAppointmentWithDoctor(docId)}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'network' && (
            <PakistanNetworkView
              hospitals={hospitals}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onNavigate={setCurrentSection}
              onSelectPatient={handleSelectPatientWithBiometrics}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'profile' && (
            <DoctorProfileView
              currentUser={currentUser}
              onUpdateProfile={setCurrentUser}
              onShowToast={showToast}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsView onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Modals */}
      {/* Biometric PHI Verification Interceptor Modal */}
      <BiometricAuthModal
        isOpen={isBiometricAuthOpen}
        onClose={() => {
          setIsBiometricAuthOpen(false);
          setPendingPatientForAuth(null);
        }}
        onSuccess={handleBiometricSuccess}
        patient={pendingPatientForAuth}
        currentUser={currentUser}
        onShowToast={showToast}
      />

      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        doctors={doctors}
        onAddPatient={handleAddPatient}
        onShowToast={showToast}
      />

      <PatientProfileModal
        patient={currentSelectedPatient || null}
        isOpen={!!selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
        doctors={doctors}
        labReports={labReports}
        prescriptions={prescriptions}
        appointments={appointments}
        aiRecommendations={aiRecommendations}
        onOpenBookAppointment={(pId) => handleOpenBookAppointmentWithDoctor(undefined)}
        onOpenWritePrescription={() => setIsWritePrescriptionOpen(true)}
        onOpenAICaseInvestigator={() => setIsCaseInvestigatorOpen(true)}
        onUpdatePatient={handleUpdatePatient}
        onShowToast={showToast}
      />

      <AICaseInvestigatorModal
        isOpen={isCaseInvestigatorOpen}
        onClose={() => setIsCaseInvestigatorOpen(false)}
        patients={patients}
        onShowToast={showToast}
      />

      <BookAppointmentModal
        isOpen={isBookAppointmentOpen}
        onClose={() => setIsBookAppointmentOpen(false)}
        patients={patients}
        doctors={doctors}
        initialPatientId={selectedPatientId || undefined}
        onBookAppointment={handleBookAppointment}
        onShowToast={showToast}
      />

      <WritePrescriptionModal
        isOpen={isWritePrescriptionOpen}
        onClose={() => setIsWritePrescriptionOpen(false)}
        patients={patients}
        doctors={doctors}
        prescriptions={prescriptions}
        initialPatientId={selectedPatientId || undefined}
        onSavePrescription={handleSavePrescription}
        onShowToast={showToast}
      />

      <EmergencyTriageModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        hospitals={hospitals}
        onShowToast={showToast}
      />

      {/* Floating AI Clinical Copilot Chat Assistant */}
      <FloatingAIChatWidget
        patients={patients}
        selectedPatient={currentSelectedPatient || null}
        onSelectPatient={handleSelectPatientWithBiometrics}
        onShowToast={showToast}
      />
    </div>
  );
}
