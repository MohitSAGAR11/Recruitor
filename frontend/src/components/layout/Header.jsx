import React from 'react';
import { Cpu } from 'lucide-react';

export default function Header({ title, subtitle }) {
  return (
    <header style={{ marginBottom: 32 }}>
      {subtitle && (
        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          <Cpu size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          {subtitle}
        </p>
      )}
      <h1 className="text-display">{title}</h1>
    </header>
  );
}
