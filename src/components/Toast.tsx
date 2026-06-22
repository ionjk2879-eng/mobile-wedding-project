import React from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import useToastStore, { ToastType } from '../stores/useToastStore';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`} role="alert">
          <span className="toast-icon">{ICONS[t.type]}</span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="닫기">
            <X size={14} />
          </button>
        </div>
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
          max-width: 400px;
        }
        @media (max-width: 640px) {
          .toast-container {
            top: 12px;
            right: 12px;
            left: 12px;
            max-width: none;
          }
        }
        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: 'Pretendard', sans-serif;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          animation: toast-slide-in 0.3s ease;
          backdrop-filter: blur(10px);
        }
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .toast-success {
          background: #F0FDF4;
          color: #166534;
          border: 1px solid #BBF7D0;
        }
        .toast-error {
          background: #FEF2F2;
          color: #991B1B;
          border: 1px solid #FECACA;
        }
        .toast-info {
          background: #EFF6FF;
          color: #1E40AF;
          border: 1px solid #BFDBFE;
        }
        .toast-warning {
          background: #FFFBEB;
          color: #92400E;
          border: 1px solid #FDE68A;
        }
        .toast-icon { display: flex; align-items: center; flex-shrink: 0; }
        .toast-msg { flex: 1; line-height: 1.4; }
        .toast-close {
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.5;
          padding: 2px;
          display: flex;
          align-items: center;
          color: inherit;
          transition: opacity 0.2s;
        }
        .toast-close:hover { opacity: 1; }
      `}</style>
    </div>
  );
};

export default ToastContainer;
