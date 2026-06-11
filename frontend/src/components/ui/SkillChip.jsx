import React from 'react';

/**
 * Skill tag chip.
 * Props: label, variant ('filled'|'outline'|'matched'|'missing'), size ('sm'|'md')
 */
export default function SkillChip({ label, variant = 'filled', size = 'sm', onClick }) {
  const styles = {
    filled: {
      background: 'var(--accent-primary-dim)',
      color: 'var(--accent-primary)',
      border: '1px solid rgba(123,111,232,0.25)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-strong)',
    },
    matched: {
      background: 'var(--accent-green-dim)',
      color: 'var(--accent-green)',
      border: '1px solid rgba(74,201,126,0.25)',
    },
    missing: {
      background: 'var(--accent-red-dim)',
      color: 'var(--accent-red)',
      border: '1px solid rgba(232,85,85,0.25)',
    },
    teal: {
      background: 'var(--accent-teal-dim)',
      color: 'var(--accent-teal)',
      border: '1px solid rgba(61,217,195,0.25)',
    },
    amber: {
      background: 'var(--accent-amber-dim)',
      color: 'var(--accent-amber)',
      border: '1px solid rgba(245,166,35,0.25)',
    },
    muted: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border-subtle)',
    },
  };

  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '0.7rem' : '0.8rem';

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding,
        borderRadius: 100,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'opacity 150ms ease',
        ...styles[variant] || styles.filled,
      }}
    >
      {variant === 'matched' && '✓ '}
      {variant === 'missing' && '✗ '}
      {label}
    </span>
  );
}
