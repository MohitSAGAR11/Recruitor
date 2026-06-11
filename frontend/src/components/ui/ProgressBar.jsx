import React, { useEffect, useRef } from 'react';

function getColor(value) {
  if (value >= 80) return 'var(--accent-teal)';
  if (value >= 60) return 'var(--accent-primary)';
  if (value >= 40) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}

/**
 * Animated horizontal progress bar with label and percentage.
 * Props: label, value (0-100), animate (bool)
 */
export default function ProgressBar({ label, value = 0, animate = true }) {
  const barRef = useRef(null);
  const color = getColor(value);

  useEffect(() => {
    if (!animate || !barRef.current) return;
    const el = barRef.current;
    el.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.width = `${value}%`;
      });
    });
  }, [value, animate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
          {Math.round(value)}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: 'var(--border-default)',
          borderRadius: 100,
          overflow: 'hidden',
        }}
      >
        <div
          ref={barRef}
          style={{
            height: '100%',
            width: animate ? '0%' : `${value}%`,
            background: color,
            borderRadius: 100,
            transition: animate ? 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}
