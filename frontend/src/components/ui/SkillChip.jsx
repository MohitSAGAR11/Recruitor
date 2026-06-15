import React from 'react';

export default function SkillChip({ label, variant = 'filled', size = 'sm', onClick }) {
  const styles = {
    filled: { color: 'var(--color-mist)', background: 'rgba(94,106,210,0.12)', borderColor: 'rgba(94,106,210,0.28)' },
    outline: { color: 'var(--color-fog)', background: 'transparent', borderColor: 'var(--color-graphite)' },
    matched: { color: 'var(--color-emerald)', background: 'rgba(39,166,68,0.1)', borderColor: 'rgba(39,166,68,0.28)' },
    missing: { color: 'var(--color-crimson)', background: 'rgba(235,87,87,0.1)', borderColor: 'rgba(235,87,87,0.28)' },
    teal: { color: 'var(--color-cyan)', background: 'rgba(2,184,204,0.1)', borderColor: 'rgba(2,184,204,0.28)' },
    amber: { color: 'var(--accent-amber)', background: 'var(--accent-amber-dim)', borderColor: 'rgba(214,166,58,0.28)' },
    muted: { color: 'var(--color-fog)', background: 'var(--color-obsidian)', borderColor: 'var(--color-graphite)' },
  };
  const style = styles[variant] || styles.filled;

  return (
    <span
      className="chip"
      onClick={onClick}
      style={{
        padding: size === 'sm' ? '3px 7px' : '5px 10px',
        fontSize: size === 'sm' ? 11 : 12,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {variant === 'matched' && <span className="status-dot" />}
      {variant === 'missing' && <span className="status-dot" />}
      {label}
    </span>
  );
}
