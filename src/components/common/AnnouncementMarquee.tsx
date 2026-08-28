import React from 'react';
import {
  AlertCircle,
  Flame,
  PhoneCall,
  Activity,
  Calendar,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Syringe,
} from 'lucide-react';

interface AnnouncementMarqueeProps {
  onOpenEmergency?: () => void;
  onOpenBooking?: () => void;
  onOpenAITriage?: () => void;
}

export const AnnouncementMarquee: React.FC<AnnouncementMarqueeProps> = ({
  onOpenEmergency,
  onOpenBooking,
  onOpenAITriage,
}) => {
  const announcements = [
    {
      id: 'ann-1',
      badge: '🚨 EMERGENCY 24/7',
      badgeClass: 'bg-rose-600 text-white font-black',
      text: 'Emergency & Trauma Care Active with 0 Wait Time for Critical Resuscitation • Ambulance Helpline 1122',
      actionText: 'Emergency Info',
      action: onOpenEmergency,
      icon: <PhoneCall className="w-3.5 h-3.5 text-rose-300" />,
    },
    {
      id: 'ann-2',
      badge: '🩸 BLOOD BANK ALERT',
      badgeClass: 'bg-red-500 text-white font-bold',
      text: 'Urgent demand for O-Negative (O-) & B-Positive (B+) blood donors at Central Transfusion Wing',
      actionText: 'Donate Now',
      action: onOpenEmergency,
      icon: <HeartPulse className="w-3.5 h-3.5 text-rose-300" />,
    },
    {
      id: 'ann-3',
      badge: '💉 VACCINATION DRIVE',
      badgeClass: 'bg-emerald-600 text-white font-bold',
      text: 'Seasonal Influenza, Pneumococcal & Hepatitis B booster doses available Mon–Sat (08:00 AM – 04:00 PM)',
      actionText: 'Schedule Dose',
      action: onOpenBooking,
      icon: <Syringe className="w-3.5 h-3.5 text-emerald-300" />,
    },
    {
      id: 'ann-4',
      badge: '🩺 FREE CARDIOLOGY CAMP',
      badgeClass: 'bg-blue-600 text-white font-bold',
      text: 'Comprehensive Hypertension & ECG Screening Camp with Dr. Ahmed Khan this Saturday at OPD Clinic',
      actionText: 'Book Token',
      action: onOpenBooking,
      icon: <Activity className="w-3.5 h-3.5 text-blue-300" />,
    },
    {
      id: 'ann-5',
      badge: '🤖 AI CLINICAL TRIAGE',
      badgeClass: 'bg-indigo-600 text-white font-bold',
      text: 'Instant AI Case Investigator & Differential Symptom Checker now integrated into patient records',
      actionText: 'Launch AI Triage',
      action: onOpenAITriage,
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-300" />,
    },
  ];

  return (
    <div
      id="live-announcement-marquee"
      className="bg-[#0A2540] text-white border-b border-blue-900/60 overflow-hidden relative select-none z-50 text-xs py-2 shadow-xs"
    >
      <div className="flex items-center">
        {/* Fixed Left Status Capsule */}
        <div className="flex-shrink-0 z-10 pl-3 pr-3 bg-gradient-to-r from-[#0A2540] via-[#0A2540] to-transparent flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-black tracking-wider text-emerald-400 uppercase hidden sm:inline-block">
            LIVE BROADCAST
          </span>
        </div>

        {/* Scrolling Track Container */}
        <div className="overflow-hidden flex-1 relative flex">
          {/* Continuous Duplicate marquee ribbons */}
          <div className="animate-marquee flex items-center gap-8 py-0.5 whitespace-nowrap">
            {announcements.concat(announcements).map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-2.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 backdrop-blur-xs transition-colors cursor-pointer group"
                onClick={item.action}
              >
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md tracking-wider ${item.badgeClass} shadow-xs`}
                >
                  {item.badge}
                </span>
                <span className="text-slate-100 text-xs font-medium tracking-wide">
                  {item.text}
                </span>
                {item.actionText && (
                  <span className="text-[11px] font-bold text-blue-300 group-hover:text-white underline underline-offset-2 flex items-center gap-1">
                    {item.actionText} →
                  </span>
                )}
                <span className="text-blue-500/50 mx-2">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Right Quick Emergency Call button */}
        <div className="flex-shrink-0 z-10 pr-4 pl-3 bg-gradient-to-l from-[#0A2540] via-[#0A2540] to-transparent hidden md:flex items-center gap-3 text-[11px]">
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Hotline 1122</span>
          </button>
        </div>
      </div>
    </div>
  );
};
