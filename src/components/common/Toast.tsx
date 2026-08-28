import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none no-print">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
};

export const Toast: React.FC<{ toasts: ToastMessage[]; onClose?: (id: string) => void; onDismiss?: (id: string) => void }> = ({
  toasts,
  onClose,
  onDismiss,
}) => {
  return <ToastContainer toasts={toasts} onDismiss={onClose || onDismiss || (() => {})} />;
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-slate-900 shadow-lg shadow-emerald-500/5',
    warning: 'border-amber-200 bg-white text-slate-900 shadow-lg shadow-amber-500/5',
    error: 'border-rose-200 bg-white text-slate-900 shadow-lg shadow-rose-500/5',
    info: 'border-blue-200 bg-white text-slate-900 shadow-lg shadow-blue-500/5',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 transform translate-y-0 ${borders[toast.type]}`}
      role="alert"
    >
      <div className="pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900 leading-snug">{toast.title}</p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
