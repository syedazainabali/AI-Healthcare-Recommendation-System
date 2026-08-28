import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  Stethoscope,
  Microscope,
  HeartPulse,
  Baby,
  Ambulance,
  CheckCircle2,
  Calendar,
  Clock,
  Star,
  Play,
  X,
  Sparkles,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Send,
  Building2,
  Users,
  Award,
  Activity,
  Heart,
  Search,
  Check,
  Flame,
  Globe,
  Radio,
  FileCheck2,
  CreditCard,
  Droplets,
  ExternalLink,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Doctor, HospitalInfo } from '../../types';
import { AnnouncementMarquee } from '../common/AnnouncementMarquee';
import { ThemeToggle } from '../layout/ThemeToggle';

interface PublicHospitalLandingProps {
  doctors?: Doctor[];
  hospitals?: HospitalInfo[];
  onOpenPortal: () => void;
  onOpenBookAppointment?: (doctorId?: string) => void;
  onOpenEmergencyModal?: () => void;
  onOpenAICaseInvestigator?: () => void;
}

export const PublicHospitalLanding: React.FC<PublicHospitalLandingProps> = ({
  doctors = [],
  hospitals = [],
  onOpenPortal,
  onOpenBookAppointment = (_docId?: string) => {},
  onOpenEmergencyModal = () => {},
  onOpenAICaseInvestigator = () => {},
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [activeHospitalTab, setActiveHospitalTab] = useState('akuh');
  
  // Sehat Sahulat Card Simulator State
  const [cnicInput, setCnicInput] = useState('35201-8492019-3');
  const [isVerifyingCnic, setIsVerifyingCnic] = useState(false);
  const [cnicResult, setCnicResult] = useState<{
    verified: boolean;
    cardholderName: string;
    familyMembers: number;
    annualLimit: string;
    remainingBalance: string;
    programName: string;
    panelHospitalCount: number;
  } | null>({
    verified: true,
    cardholderName: 'Muhammad Usman (CNIC: 35201-8492019-3)',
    familyMembers: 5,
    annualLimit: '₨ 1,000,000 / Year',
    remainingBalance: '₨ 885,000 Available',
    programName: 'Qaumi Sehat Sahulat Program (Federal & Punjab)',
    panelHospitalCount: 148,
  });

  // Pakistani Hospital Network Directory
  const premierHospitals = [
    {
      id: 'akuh',
      name: 'Aga Khan University Hospital (AKUH)',
      urduName: 'آغا خان یونیورسٹی ہسپتال، کراچی',
      city: 'Karachi, Sindh',
      location: 'Stadium Road, Karachi 74800',
      tag: 'JCI Accredited • Apex University Hospital',
      rating: '4.95',
      reviews: '2,840',
      beds: '720+ Beds',
      activeICU: '48 ICU Beds Open',
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=1000',
      specialties: ['Bone Marrow Transplant', 'Cardiology & Angioplasty', 'Pediatric Surgery', 'Neurology & Stroke Unit', 'Oncology'],
      emergencyHelpline: '+92 21 111-911-911',
      sehatCardAccepted: true,
      description: 'Pakistan’s premier internationally accredited teaching hospital renowned for robotic surgery, advanced oncology, and specialized organ transplantation.',
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'skmch',
      name: 'Shaukat Khanum Memorial Cancer Hospital (SKMCH)',
      urduName: 'شوکت خانم میموریل کینسر ہسپتال، لاہور و پشاور',
      city: 'Lahore & Peshawar',
      location: '7A Block R-3, Johar Town, Lahore',
      tag: 'Comprehensive Cancer Care • JCI Accredited',
      rating: '4.98',
      reviews: '4,150',
      beds: '400+ Specialized Beds',
      activeICU: '28 ICU Beds Open',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
      specialties: ['Medical & Surgical Oncology', 'PET-CT Nuclear Medicine', 'Radiation Oncology', 'Hematology', 'Palliative Care'],
      emergencyHelpline: '+92 42 35905000',
      sehatCardAccepted: true,
      description: 'Pioneering cancer research and philanthropic tertiary care hospital providing state-of-the-art diagnostic imaging and free cancer treatments.',
      badgeColor: 'bg-teal-600',
    },
    {
      id: 'shifa',
      name: 'Shifa International Hospitals Islamabad',
      urduName: 'شفا انٹرنیشنل ہسپتال، اسلام آباد',
      city: 'Islamabad Capital Territory',
      location: 'Sector H-8/4, Pitras Bukhari Road, Islamabad',
      tag: 'JCI Accredited • Liver & Kidney Transplant',
      rating: '4.90',
      reviews: '1,920',
      beds: '550+ Beds',
      activeICU: '35 ICU Beds Open',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1000',
      specialties: ['Living-Donor Liver Transplant', 'Kidney Transplant', 'Interventional Cardiology', 'Critical Care', 'Robotic Surgery'],
      emergencyHelpline: '+92 51 8464646',
      sehatCardAccepted: true,
      description: 'Capital apex multi-organ transplant center equipped with advanced cardiac catheterization laboratories and 24/7 Level-1 trauma response.',
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'nicvd',
      name: 'National Institute of Cardiovascular Diseases (NICVD)',
      urduName: 'قومی ادارہ برائے امراض قلب (این آئی سی وی ڈی)، کراچی',
      city: 'Karachi, Sindh (10+ Chest Pain Units)',
      location: 'Rafiqui Shaheed Road, Karachi Cantt',
      tag: 'South Asia’s Largest Heart Care Network',
      rating: '4.88',
      reviews: '5,300',
      beds: '1,200+ Cardiac Beds',
      activeICU: '64 CCU Beds Open',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000',
      specialties: ['Primary Angioplasty (24/7 Free)', 'Pediatric Cardiac Surgery', 'Electrophysiology & Pacemakers', 'TAVI Procedures'],
      emergencyHelpline: '+92 21 99201271',
      sehatCardAccepted: true,
      description: 'Government apex cardiovascular institute performing over 15,000 emergency angiographies and bypass surgeries annually with modern satellite centers across Sindh.',
      badgeColor: 'bg-rose-600',
    },
    {
      id: 'pims',
      name: 'Pakistan Institute of Medical Sciences (PIMS)',
      urduName: 'پاکستان انسٹیٹیوٹ آف میڈیکل سائنسز (پمز)، اسلام آباد',
      city: 'Islamabad Capital Territory',
      location: 'Sector G-8/3, Medical Enclave, Islamabad',
      tag: 'National Apex Public Medical Complex',
      rating: '4.82',
      reviews: '3,450',
      beds: '1,100+ Beds',
      activeICU: '52 ICU Beds Open',
      image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1000',
      specialties: ['Emergency Trauma Center', 'Maternal & Neonatal Hospital', 'Children’s Hospital', 'Burn & Reconstructive Center'],
      emergencyHelpline: '+92 51 9261170',
      sehatCardAccepted: true,
      description: 'National federal medical hub housing dedicated specialized institutes for Children, Burn & Reconstructive Surgery, and Cardiac Intensive Care.',
      badgeColor: 'bg-emerald-700',
    },
  ];

  const selectedHospital = premierHospitals.find((h) => h.id === activeHospitalTab) || premierHospitals[0];

  // Consultation Estimator in Pakistani Rupees (PKR)
  const [estimatorForm, setEstimatorForm] = useState({
    fullName: '',
    phone: '',
    city: 'Islamabad',
    department: 'Cardiology',
    hospital: 'Shifa International Islamabad',
    date: new Date().toISOString().split('T')[0],
  });
  const [isEstimated, setIsEstimated] = useState(false);
  const [estimatedCostPkr, setEstimatedCostPkr] = useState('₨ 2,500 – ₨ 3,500');

  const handleCalculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const departmentFees: Record<string, string> = {
      Cardiology: '₨ 2,500 – ₨ 4,000',
      Neurology: '₨ 3,000 – ₨ 4,500',
      Pediatrics: '₨ 2,000 – ₨ 3,000',
      'Advanced Diagnostics': '₨ 4,500 – ₨ 15,000',
      'General Medicine': '₨ 1,500 – ₨ 2,500',
      'Gynecology & Obstetrics': '₨ 2,500 – ₨ 3,500',
      'Orthopedic Surgery': '₨ 2,800 – ₨ 4,000',
    };
    setEstimatedCostPkr(departmentFees[estimatorForm.department] || '₨ 2,500 – ₨ 3,500');
    setIsEstimated(true);
  };

  const handleVerifyCnic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicInput.trim()) return;
    setIsVerifyingCnic(true);
    setTimeout(() => {
      setIsVerifyingCnic(false);
      setCnicResult({
        verified: true,
        cardholderName: `Verified Citizen (${cnicInput.trim()})`,
        familyMembers: 5,
        annualLimit: '₨ 1,000,000 / Year',
        remainingBalance: '₨ 885,000 Available',
        programName: 'Qaumi Sehat Sahulat Program (Federal & Provincial)',
        panelHospitalCount: 148,
      });
    }, 600);
  };

  // Pakistani Senior Medical Specialists (PMDC Registered)
  const pakistaniSpecialists = [
    {
      id: 'doc-101',
      name: 'Dr. Ahmed Khan',
      urduName: 'ڈاکٹر احمد خان',
      title: 'Consultant Interventional Cardiologist',
      department: 'Cardiovascular Sciences & Angioplasty',
      qualifications: 'MBBS, FCPS (Cardiology), FESC (Europe)',
      pmdcNumber: 'PMC-34982-P',
      hospital: 'Islamabad Federal Medical Complex & Shifa',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      rating: '4.95',
      reviews: 214,
      feePkr: '₨ 3,000',
      badge: 'Gold Medalist • 15+ Yrs Exp',
    },
    {
      id: 'doc-102',
      name: 'Dr. Ayesha Malik',
      urduName: 'ڈاکٹر عائشہ ملک',
      title: 'Professor & Head of Pediatrics',
      department: 'Pediatrics, Neonatology & Child ICU',
      qualifications: 'MBBS, FCPS (Pediatrics), MRCPCH (UK)',
      pmdcNumber: 'PMC-41902-P',
      hospital: 'Lahore Central Healthcare & Children’s Hospital',
      image: 'https://images.unsplash.com/photo-1594824813511-2d7fd28e2025?auto=format&fit=crop&q=80&w=600',
      rating: '4.98',
      reviews: 260,
      feePkr: '₨ 2,500',
      badge: 'Pediatric Fellow • 12+ Yrs Exp',
    },
    {
      id: 'doc-103',
      name: 'Prof. Dr. Tariq Mahmood',
      urduName: 'پروفیسر ڈاکٹر طارق محمود',
      title: 'Head of Neurology & Stroke Intervention',
      department: 'Neurological Sciences & Stroke Unit',
      qualifications: 'MBBS, MD, FCPS (Neurology), Diplomate American Board',
      pmdcNumber: 'PMC-19283-P',
      hospital: 'Karachi Jinnah Care Center & AKUH Network',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
      rating: '4.92',
      reviews: 320,
      feePkr: '₨ 4,000',
      badge: 'American Board Diplomate • 22+ Yrs Exp',
    },
    {
      id: 'doc-104',
      name: 'Dr. Sana Javed',
      urduName: 'ڈاکٹر ثناء جاوید',
      title: 'Consultant Obstetrician & Gynecologist',
      department: "Maternal & Women's Health",
      qualifications: 'MBBS, FCPS (Obs & Gynae), MRCOG (London)',
      pmdcNumber: 'PMC-55201-P',
      hospital: 'Islamabad Federal Complex & PIMS Enclave',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      rating: '4.94',
      reviews: 185,
      feePkr: '₨ 2,800',
      badge: 'MRCOG London • 10+ Yrs Exp',
    },
  ];

  // Verified Patient Testimonials from Pakistan
  const pakistaniTestimonials = [
    {
      quote:
        'My mother required emergency coronary stenting at 2 AM. Through MedAI Pakistan, her ECG was reviewed in minutes and admission at NICVD Karachi was pre-arranged with full Sehat Sahulat Card cashless coverage.',
      name: 'Kamran Tariq',
      role: 'Family Caregiver • Clifton, Karachi',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      hospital: 'NICVD Karachi',
    },
    {
      quote:
        'Dr. Ahmed Khan’s prescription safety checker instantly flagged a severe beta-blocker conflict with my asthma medication. This digital EHR platform is saving lives every single day across Pakistan.',
      name: 'Fatima Zahra',
      role: 'Chronic Care Patient • Sector F-7, Islamabad',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      hospital: 'Shifa International Islamabad',
    },
    {
      quote:
        'From online appointment booking to getting digital lab reports on mobile with bilingual Urdu instructions, this is truly a world-class healthcare revolution for our country.',
      name: 'Chaudhry Rizwan',
      role: 'Pediatric Care Parent • Gulberg, Lahore',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      hospital: 'SKMCH & Children’s Hospital',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. TOP NATIONAL HEALTHCARE BAR (Deep Pakistani Emerald & Navy) */}
      <div className="bg-[#062016] text-emerald-100 text-xs py-2 px-4 sm:px-8 border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Left: Official Accreditations & Badges */}
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/80 text-emerald-300 text-[10px] font-bold border border-emerald-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PMDC Verified Healthcare Network
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-200/90 font-medium">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Connected Hospitals: Islamabad • Lahore • Karachi • Peshawar • Quetta
            </span>
          </div>

          {/* Right: National Helplines & Sehat Card */}
          <div className="flex items-center gap-4 flex-wrap justify-center text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/40">
              <Ambulance className="w-3.5 h-3.5 text-rose-400" />
              <span>National Emergency: <strong className="text-white">1122</strong> | Edhi: <strong className="text-white">115</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-200">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Helpline: <strong>0800-09009</strong></span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-emerald-200">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>contact@medai.gov.pk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Marquee */}
      <AnnouncementMarquee
        onOpenEmergency={onOpenEmergencyModal}
        onOpenBooking={() => onOpenBookAppointment()}
        onOpenAITriage={onOpenAICaseInvestigator}
      />

      {/* 2. MAIN NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo with Crescent-Health Cross Emblem */}
          <div
            className="flex items-center gap-3 select-none cursor-pointer group"
            onClick={() => setActiveNav('home')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#004D25] via-[#082B55] to-[#004D25] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 ring-2 ring-emerald-600/20 group-hover:scale-105 transition-transform">
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                  {/* Medical Cross */}
                  <rect x="15" y="6" width="10" height="28" rx="2.5" fill="#FFFFFF" />
                  <rect x="6" y="15" width="28" height="10" rx="2.5" fill="#FFFFFF" />
                  {/* Center Emerald Star & Moon Accent */}
                  <circle cx="20" cy="20" r="3.5" fill="#10B981" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                  MedAI<span className="text-emerald-600">.</span>pk
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PAKISTAN
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                قومی ڈیجیٹل ہسپتال نیٹ ورک • EHR
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {[
              { id: 'home', label: 'Home', href: '#home' },
              { id: 'hospitals', label: 'Apex Hospitals', href: '#hospitals' },
              { id: 'sehat-card', label: 'Sehat Sahulat Card', href: '#sehat-card' },
              { id: 'specialists', label: 'PMDC Doctors', href: '#doctors' },
              { id: 'services', label: 'Clinical Services', href: '#services' },
              { id: 'pricing', label: 'OPD Calculator', href: '#pricing' },
            ].map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveNav(item.id)}
                className={`relative py-1 transition-colors ${
                  activeNav === item.id
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-emerald-600 font-medium'
                }`}
              >
                <span>{item.label}</span>
                {activeNav === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </a>
            ))}
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle variant="icon" />

            <button
              onClick={() => onOpenBookAppointment()}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={onOpenPortal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 bg-[#082B55] hover:bg-[#0c376b] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              title="Access Doctor & Clinical EHR Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Doctor / EHR Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (Premium Pakistani Tertiary Healthcare Hub & Live Cards) */}
      <section id="home" className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24 bg-gradient-to-b from-emerald-50/60 via-slate-50/40 to-white">
        {/* Subtle Pakistani Geometric Texture Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#004D25_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Hero Column: Headline, Pakistani Healthcare Vision, Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/90 text-emerald-900 text-[11px] font-black uppercase tracking-wider rounded-full border border-emerald-300/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>پاکستان کا جدید ترین ڈیجیٹل ہسپتال نیٹ ورک • PMDC COMPLIANT</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
                Advancing Healthcare
                <br />
                <span className="bg-gradient-to-r from-emerald-800 via-teal-800 to-[#082B55] bg-clip-text text-transparent">
                  Across Pakistan's Premier Hospitals
                </span>
              </h1>

              {/* Subheading text */}
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Connecting <strong>Aga Khan University Hospital, Shaukat Khanum, Shifa International, NICVD, PIMS</strong> and Pakistan's top tertiary institutions with AI-driven clinical safety, instant Sehat Sahulat Card verification, and 24/7 Rescue 1122 triage.
              </p>

              {/* Action Buttons & Key Trust Tags */}
              <div className="flex items-center gap-4 pt-2 flex-wrap">
                <button
                  onClick={() => {
                    const el = document.getElementById('hospitals');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-800/25 transition-all cursor-pointer group hover:scale-105"
                >
                  <Building2 className="w-4 h-4 text-emerald-200" />
                  <span>Explore Pakistani Hospitals</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onOpenAICaseInvestigator}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base rounded-2xl border border-slate-300 shadow-sm transition-all cursor-pointer hover:border-emerald-500"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Symptom Triage (اردو / ENG)</span>
                </button>
              </div>

              {/* Quick National Statistics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/80">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">Apex Hospitals</p>
                  <p className="text-xl font-black text-emerald-800">45+ Nodes</p>
                  <span className="text-[10px] text-slate-400 font-medium">Sindh, Punjab, KP, Bln</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">PMDC Doctors</p>
                  <p className="text-xl font-black text-slate-900">1,200+</p>
                  <span className="text-[10px] text-slate-400 font-medium">FCPS, MRCP, FRCS</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">Sehat Card Limit</p>
                  <p className="text-xl font-black text-emerald-700">₨ 10 Lakh</p>
                  <span className="text-[10px] text-slate-400 font-medium">100% Cashless Inpatient</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-bold">Emergency Rescue</p>
                  <p className="text-xl font-black text-rose-600">1122 Sync</p>
                  <span className="text-[10px] text-slate-400 font-medium">Live Bed & ICU Tracker</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Premium Interactive Showcase Card */}
            <div className="lg:col-span-5 relative">
              {/* Glow backdrop */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-emerald-200/50 via-teal-100/40 to-blue-200/50 rounded-3xl -z-10 blur-xl opacity-70" />

              {/* Main Pakistan Hospital Card */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-100 relative group">
                {/* Hospital Photo with Overlay */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                  <img
                    src={selectedHospital.image}
                    alt={selectedHospital.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Top Badge: JCI Accredited & Active Status */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider ${selectedHospital.badgeColor} shadow-md`}>
                      {selectedHospital.tag}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {selectedHospital.rating} ({selectedHospital.reviews})
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                    <span className="text-[11px] font-bold text-emerald-300 block">{selectedHospital.city}</span>
                    <h3 className="text-lg font-black leading-snug">{selectedHospital.name}</h3>
                    <p className="text-[10px] text-slate-200 font-medium">{selectedHospital.urduName}</p>
                  </div>
                </div>

                {/* Hospital Meta Details & Capabilities */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Bed and ICU Capacity Indicator */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Bed Capacity</span>
                        <span className="text-xs font-black text-slate-900">{selectedHospital.beds}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-800 uppercase block">ICU / CCU Live Status</span>
                        <span className="text-xs font-black text-slate-900">{selectedHospital.activeICU}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialties Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">Key Specialized Centers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedHospital.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[10px] rounded-md border border-slate-200"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hospital Quick Switcher Buttons */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Switch Premier Hospital Showcase:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                      {premierHospitals.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setActiveHospitalTab(h.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            activeHospitalTab === h.id
                              ? 'bg-[#004D25] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {h.id.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onOpenBookAppointment()}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book OPD Slot</span>
                    </button>
                    <a
                      href={`tel:${selectedHospital.emergencyHelpline}`}
                      className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                      title="Direct Emergency Hotline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedHospital.emergencyHelpline.split(' ')[2] || 'Emergency'}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE HERO CORE CAPABILITY CARDS (Emergency 1122, Sehat Card, PMDC Safety) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 24/7 National Emergency & Rescue 1122 */}
          <div
            onClick={onOpenEmergencyModal}
            className="bg-white rounded-2xl p-5 border-2 border-rose-100 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:border-rose-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Ambulance className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    24/7 National Dispatch
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors">
                  Rescue 1122 & Cardiac Code Blue
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time GPS ambulance coordination, emergency ICU bed reservations, and instant Edhi / Chhipa blood requests.
                </p>
                <div className="pt-2 flex items-center text-xs font-bold text-rose-700 gap-1">
                  <span>Open Emergency Dispatcher</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Sehat Sahulat Card Instant Panel Verification */}
          <div
            onClick={() => {
              const el = document.getElementById('sehat-card');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:border-emerald-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    قومی صحت کارڈ
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Sehat Sahulat Card Panel
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verify 13-digit CNIC eligibility, check remaining ₨ 1,000,000 family treatment limit, and locate empanelled hospitals.
                </p>
                <div className="pt-2 flex items-center text-xs font-bold text-emerald-700 gap-1">
                  <span>Verify CNIC Coverage</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: PMDC e-Prescribing & AI Adverse Drug Checker */}
          <div
            onClick={onOpenPortal}
            className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:border-blue-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#082B55] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    PMDC Clinical EHR
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                  AI Adverse Reaction Checker
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time allergy cross-reactivity audits, national formulary generic substitutions, and bilingual Urdu patient instructions.
                </p>
                <div className="pt-2 flex items-center text-xs font-bold text-blue-700 gap-1">
                  <span>Access Clinical EHR Portal</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. APEX PAKISTANI HOSPITALS FULL DIRECTORY & IMAGE GALLERY */}
      <section id="hospitals" className="py-16 sm:py-24 bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              TERTIARY CARE NETWORK • پاکستان کے سرکردہ ہسپتال
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Pakistan's Premier Connected Hospitals & Institutes
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Equipped with state-of-the-art diagnostic imaging, cath labs, modular operation theatres, and dedicated intensive care units.
            </p>
          </div>

          {/* Hospital Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {premierHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-emerald-400"
              >
                {/* Image Box */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={hosp.image}
                    alt={hosp.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase bg-black/60 backdrop-blur-xs border border-white/20">
                      {hosp.city.split(',')[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                      Sehat Card Panel
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-extrabold text-base leading-tight text-white">{hosp.name}</h3>
                    <p className="text-[11px] text-emerald-300 font-medium">{hosp.urduName}</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{hosp.location}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {hosp.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1">
                      {hosp.specialties.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                      {hosp.specialties.length > 3 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          +{hosp.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Stats & CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Capacity</span>
                      <span className="text-xs font-black text-slate-900">{hosp.beds}</span>
                    </div>

                    <button
                      onClick={() => onOpenBookAppointment()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>Book OPD</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SEHAT SAHULAT CARD (قومی صحت کارڈ) INTERACTIVE CHECKER SECTION */}
      <section id="sehat-card" className="py-16 sm:py-24 bg-gradient-to-br from-[#062016] via-[#0B3B24] to-[#082B55] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider rounded-full border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>GOVERNMENT OF PAKISTAN • QAUMI SEHAT PROGRAM</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight">
                Sehat Sahulat Card (قومی صحت کارڈ)
                <br />
                <span className="text-emerald-400">100% Cashless Inpatient Care</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                All citizen families registered with NADRA are eligible for up to <strong>₨ 1,000,000 (10 Lakh Rupees)</strong> per family per year for major inpatient surgical and medical treatments across all empanelled public and private apex hospitals.
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { title: 'Heart Surgery & Stents', desc: 'Angioplasty, CABG & Valve Replacements' },
                  { title: 'Cancer & Chemotherapy', desc: 'Surgical oncology, radiation & PET scans' },
                  { title: 'Dialysis & Renal Care', desc: 'End-stage kidney failure hemodialysis' },
                  { title: 'Emergency Trauma & ICU', desc: 'Ventilator support & neurosurgery' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <h4 className="font-bold text-xs text-white">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 pl-6">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Interactive NADRA CNIC Verification Card */}
            <div className="lg:col-span-6">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-600/30 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      NADRA & Sehat Program Database Sync
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Check Sehat Card Eligibility & Limit
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>

                <form onSubmit={handleVerifyCnic} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter 13-Digit Citizen CNIC Number (قومی شناختی کارڈ نمبر)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cnicInput}
                        onChange={(e) => setCnicInput(e.target.value)}
                        placeholder="35201-8492019-3"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingCnic}
                        className="absolute right-2 top-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                      >
                        {isVerifyingCnic ? 'Verifying...' : 'Verify Now'}
                      </button>
                    </div>
                  </div>
                </form>

                {cnicResult && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="font-extrabold text-xs text-emerald-950">
                            ELIGIBLE & FULLY COVERED
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium">
                            {cnicResult.cardholderName}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                        Active 2026
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Annual Family Quota</span>
                        <span className="font-black text-slate-900">{cnicResult.annualLimit}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Available Balance</span>
                        <span className="font-black text-emerald-700">{cnicResult.remainingBalance}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-900 bg-white p-2.5 rounded-xl border border-emerald-200">
                      <span>Empanelled Hospitals in Region: <strong>{cnicResult.panelHospitalCount} Hospitals</strong></span>
                      <span className="font-bold text-emerald-700 cursor-pointer hover:underline">View Panel List →</span>
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Helpline: <strong>0800-09009</strong> (Toll Free)</span>
                  <span>SMS CNIC to <strong>8500</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SENIOR PMDC MEDICAL SPECIALISTS SECTION */}
      <section id="doctors" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              PMDC CERTIFIED SPECIALISTS • مستند طبی ماہرین
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Consult With Pakistan’s Leading Medical Specialists
            </h2>
            <p className="text-slate-600 text-sm">
              Board-certified consultants with FCPS, MRCP, FRCS, and American Board credentials.
            </p>
          </div>

          {/* 4 Doctor Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pakistaniSpecialists.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:border-emerald-400"
              >
                {/* Doctor Avatar Photo */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow-xs">
                    {doc.badge}
                  </div>
                  <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 rounded-md shadow-xs text-[10px] font-bold text-slate-800 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-[11px] font-bold text-emerald-800">{doc.urduName}</p>
                    <p className="text-xs font-semibold text-slate-700">{doc.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{doc.qualifications}</p>
                    <p className="text-[10px] text-slate-400">{doc.hospital}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                      <span className="text-xs font-black text-slate-900">{doc.feePkr}</span>
                    </div>

                    <button
                      onClick={() => onOpenBookAppointment(doc.id)}
                      className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Book OPD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 8. TRANSPARENT OPD CONSULTATION FEE ESTIMATOR (PKR ₨) */}
          <div id="pricing" className="mt-12 bg-gradient-to-br from-[#062016] via-[#0B2519] to-[#082B55] text-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-900 p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Doctor Consultation Photo on Left */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg border border-emerald-800">
                <img
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800"
                  alt="Doctor consulting patient"
                  className="w-full h-72 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold block">
                      TRANSPARENT PAKISTANI HOSPITAL OPD FEES
                    </span>
                    <p className="text-white text-sm font-extrabold mt-1">
                      Calculate clear consultation & diagnostic projections in Pakistani Rupees.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation Estimator Form on Right */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
                    INSTANT OPD PRICING ESTIMATOR (PKR ₨)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Get Your Hospital OPD Fee Estimate
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1">
                    Select your hospital and clinical specialty to calculate accurate consultation fees and verify Sehat Card coverage.
                  </p>
                </div>

                <form onSubmit={handleCalculateEstimate} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Patient Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Muhammad Usman"
                        value={estimatorForm.fullName}
                        onChange={(e) => setEstimatorForm({ ...estimatorForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-900 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Mobile Contact (+92)</label>
                      <input
                        type="tel"
                        required
                        placeholder="+92 300 1234567"
                        value={estimatorForm.phone}
                        onChange={(e) => setEstimatorForm({ ...estimatorForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-900 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Hospital & City</label>
                      <select
                        value={estimatorForm.hospital}
                        onChange={(e) => setEstimatorForm({ ...estimatorForm, hospital: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-900 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Shifa International Islamabad">Shifa International (Islamabad)</option>
                        <option value="Aga Khan University Hospital">Aga Khan Hospital (Karachi)</option>
                        <option value="Shaukat Khanum Memorial">Shaukat Khanum (Lahore/Peshawar)</option>
                        <option value="NICVD Karachi">NICVD Cardiac Care (Karachi)</option>
                        <option value="PIMS Islamabad">PIMS Medical Complex (Islamabad)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Clinical Department</label>
                      <select
                        value={estimatorForm.department}
                        onChange={(e) => setEstimatorForm({ ...estimatorForm, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-900 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Cardiology">Cardiology & Heart Health</option>
                        <option value="Neurology">Neurology & Stroke Unit</option>
                        <option value="Pediatrics">Pediatrics & Child Care</option>
                        <option value="Advanced Diagnostics">Advanced Diagnostics & MRI</option>
                        <option value="General Medicine">General Family Medicine</option>
                        <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                      </select>
                    </div>
                  </div>

                  {isEstimated && (
                    <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                      <div>
                        <span className="text-emerald-300 block font-bold">Estimated Consultation Fee:</span>
                        <span className="text-xl font-black text-white">{estimatedCostPkr}</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-bold bg-emerald-900/80 border border-emerald-500/40 px-2.5 py-1 rounded-md">
                        SEHAT CARD ELIGIBLE (INPATIENT)
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      {isEstimated ? 'Recalculate Estimate' : 'Calculate Fee Estimate (PKR)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenBookAppointment()}
                      className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      Reserve Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS SECTION */}
      <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              PATIENT REVIEWS • تاثرات مریض
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trusted by Over 4.8 Million Pakistani Families
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pakistaniTestimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {t.hospital}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">"{t.quote}"</p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{t.name}</h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. MODERN FOOTER (Pakistan National Digital Health Edition) */}
      <footer id="contact" className="bg-[#062016] text-slate-400 pt-16 pb-12 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
                    <rect x="15" y="6" width="10" height="28" rx="2" fill="currentColor" />
                    <rect x="6" y="15" width="28" height="10" rx="2" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  MedAI<span className="text-emerald-400">.pk</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100/70 leading-relaxed max-w-sm">
                Pakistan’s premier integrated clinical network and digital EHR connecting Aga Khan University Hospital, Shaukat Khanum, Shifa, NICVD, and national tertiary centers under PMDC compliance.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#fb"
                  className="w-8 h-8 rounded-lg bg-emerald-950 hover:bg-emerald-600 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#tw"
                  className="w-8 h-8 rounded-lg bg-emerald-950 hover:bg-sky-500 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#ig"
                  className="w-8 h-8 rounded-lg bg-emerald-950 hover:bg-pink-600 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#li"
                  className="w-8 h-8 rounded-lg bg-emerald-950 hover:bg-blue-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">National Network</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#home" className="hover:text-white transition-colors">Home Hub</a></li>
                <li><a href="#hospitals" className="hover:text-white transition-colors">Apex Hospitals Directory</a></li>
                <li><a href="#sehat-card" className="hover:text-white transition-colors">Sehat Sahulat Card Portal</a></li>
                <li><a href="#doctors" className="hover:text-white transition-colors">PMDC Registered Doctors</a></li>
                <li><button onClick={onOpenPortal} className="hover:text-white transition-colors cursor-pointer text-left">Clinical EHR Login</button></li>
              </ul>
            </div>

            {/* Clinical Services */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Specialized Centers</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><span>Cardiology & Stents (NICVD)</span></li>
                <li><span>Comprehensive Oncology (SKMCH)</span></li>
                <li><span>Organ Transplants (Shifa)</span></li>
                <li><span>Academic Medicine (AKUH)</span></li>
                <li><span>24/7 Acute Rescue 1122</span></li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">National Desks</h4>
              <p className="text-xs text-slate-400">Federal Medical Complex, G-8/3, Islamabad</p>
              <p className="text-xs text-slate-400">Karachi Hub: Stadium Road / Cantt</p>
              <p className="text-xs text-slate-400">Lahore Hub: Johar Town / Jail Road</p>
              <p className="text-xs text-slate-400">Emergency Rescue: 1122 / 115</p>
              <button
                onClick={() => onOpenBookAppointment()}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer block"
              >
                Schedule Consultation
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-950 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} MedAI Pakistan • National Health Data & EHR System. All Rights Reserved.</p>
            <p className="text-emerald-400/80 font-medium">PMDC & DRAP Standards Compliant • JCI Partner Hospitals</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
