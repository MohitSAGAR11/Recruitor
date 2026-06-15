import React, { useEffect, useRef } from 'react';

function getColor(value) {
  if (value >= 80) return 'var(--color-emerald)';
  if (value >= 60) return 'var(--color-indigo)';
  if (value >= 40) return 'var(--accent-amber)';
  return 'var(--color-crimson)';
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
        <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-fog)' }}>
          {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 400, color, fontFamily: 'var(--font-mono)' }}>
          {Math.round(value)}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: 'var(--color-graphite)',
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
          }}
        />
      </div>
    </div>
  );
}
