import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const CONFIG = {
  success: { Icon: CheckCircle2, color: 'var(--color-emerald)' },
  error: { Icon: XCircle, color: 'var(--color-crimson)' },
  warning: { Icon: AlertTriangle, color: 'var(--accent-amber)' },
  info: { Icon: Info, color: 'var(--color-indigo)' },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const { Icon, color } = CONFIG[toast.type] || CONFIG.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className="surface-row"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        width: 'min(360px, calc(100vw - 32px))',
        padding: 12,
        background: 'var(--color-charcoal)',
        boxShadow: 'var(--shadow-xl)',
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 180ms ease, transform 180ms ease',
      }}
    >
      <Icon size={16} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ flex: 1, color: 'var(--color-mist)', fontSize: 13, lineHeight: 1.5 }}>{toast.message}</span>
      <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26 }} onClick={() => onRemove(toast.id)} title="Dismiss">
        <X size={13} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'grid', gap: 8 }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
