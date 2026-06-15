import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ message = 'Processing...' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(8,9,10,0.78)',
      }}
    >
      <div className="panel animate-fade-in" style={{ width: 'min(360px, calc(100vw - 32px))', padding: 28, textAlign: 'center' }}>
        <div style={{ width: 58, height: 58, margin: '0 auto 18px', borderRadius: 12, background: 'var(--color-obsidian)', border: '1px solid var(--color-graphite)', display: 'grid', placeItems: 'center' }}>
          <Loader2 className="animate-spin" size={24} color="var(--color-indigo)" />
        </div>
        <p className="text-heading">Working</p>
        <p className="text-body" style={{ marginTop: 6 }}>{message}</p>
      </div>
    </div>
  );
}
