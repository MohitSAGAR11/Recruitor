import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ message = 'Processing…' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6,6,15,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        gap: 20,
      }}
    >
      {/* Spinner card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Animated spinner rings */}
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--accent-primary)',
            animation: 'spin 0.9s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--accent-teal)',
            animation: 'spin 1.3s linear infinite reverse',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,124,246,0.08) 0%, transparent 70%)',
          }} />
        </div>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>
          {message}
        </p>
      </div>
    </div>
  );
}
