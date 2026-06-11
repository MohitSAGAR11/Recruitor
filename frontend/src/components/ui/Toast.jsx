import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 size={16} color="var(--accent-green)" />,
  error:   <XCircle size={16} color="var(--accent-red)" />,
  warning: <AlertTriangle size={16} color="var(--accent-amber)" />,
  info:    <Info size={16} color="var(--accent-primary)" />,
};

const ACCENTS = {
  success: { border: 'rgba(74,222,128,0.25)',  bar: 'var(--accent-green)' },
  error:   { border: 'rgba(255,107,107,0.25)', bar: 'var(--accent-red)'   },
  warning: { border: 'rgba(245,166,35,0.25)',  bar: 'var(--accent-amber)' },
  info:    { border: 'rgba(139,124,246,0.25)', bar: 'var(--accent-primary)'},
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const { border, bar } = ACCENTS[toast.type] || ACCENTS.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(14,14,26,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${border}`,
        borderLeft: `3px solid ${bar}`,
        maxWidth: 360,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        {ICONS[toast.type] || ICONS.info}
      </div>
      <span style={{
        flex: 1,
        fontSize: '0.82rem',
        fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1.45,
      }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 5,
          color: 'var(--text-muted)',
          padding: '3px 4px',
          display: 'flex',
          alignItems: 'center',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
