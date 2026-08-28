import React from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  CalendarCheck2,
  FileCheck2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { NavSection } from '../layout/Sidebar';

interface NotificationsViewProps {
  notifications?: NotificationItem[];
  onMarkAllRead?: () => void;
  onNavigate?: (section: NavSection) => void;
  onSelectPatient?: (patientId: string) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications = [],
  onMarkAllRead = () => {},
  onNavigate = (_s: NavSection) => {},
  onSelectPatient = (_id: string) => {},
  onShowToast = (_t: string, _m: string, _type?: string) => {},
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'AI Recommendation':
        return <Sparkles className="w-4 h-4 text-[#1F63E8]" />;
      case 'Appointment':
        return <CalendarCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'Lab Result':
        return <FileCheck2 className="w-4 h-4 text-blue-600" />;
      case 'Emergency Triage':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleItemClick = (n: NotificationItem) => {
    if (n.relatedPatientId) {
      onSelectPatient(n.relatedPatientId);
    } else if (n.type === 'AI Recommendation') {
      onNavigate('ai-recommendations');
    } else if (n.type === 'Appointment') {
      onNavigate('appointments');
    } else if (n.type === 'Lab Result') {
      onNavigate('reports');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EAF3FF] text-[#1459C7]">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#082B55] tracking-tight">
              Clinical Alerts & Notifications
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Real-time feed of predictive AI risk notifications, laboratory releases, appointment queues, and trauma escalations.
          </p>
        </div>

        <button
          onClick={() => {
            onMarkAllRead();
            onShowToast('Notifications Marked Read', 'All clinical alerts updated.', 'success');
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors self-start md:self-center"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleItemClick(n)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              n.isRead
                ? 'bg-white border-slate-100 hover:bg-slate-50'
                : 'bg-[#F4F8FF] border-blue-200 shadow-xs hover:bg-[#EAF3FF]/80'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex-shrink-0 mt-0.5 shadow-xs">
                {getIcon(n.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#1F63E8]" />
                  )}
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.2 rounded">
                    {n.type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0 text-slate-400">
              <span className="text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {n.timestamp}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
