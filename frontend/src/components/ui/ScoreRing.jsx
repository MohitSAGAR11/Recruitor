import React, { useEffect, useRef } from 'react';

function getColor(score) {
  if (score >= 80) return 'var(--accent-teal)';
  if (score >= 60) return 'var(--accent-primary)';
  if (score >= 40) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}

/**
 * Animated SVG score ring.
 * Props: score (0-100), size (px), strokeWidth, animate (bool), showLabel (bool)
 */
export default function ScoreRing({
  score = 0,
  size = 48,
  strokeWidth = 4,
  animate = true,
  showLabel = true,
}) {
  const circleRef = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    const el = circleRef.current;
    // Start at full offset (empty), animate to target
    el.style.transition = 'none';
    el.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.strokeDashoffset = String(offset);
      });
    });
  }, [score, animate, circumference, offset]);

  const fontSize = size <= 36 ? size * 0.26 : size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
      aria-label={`Score: ${score} out of 100`}
    >
      {/* Drop shadow filter */}
      <defs>
        <filter id={`glow-${score}-${size}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--border-default)"
        strokeWidth={strokeWidth}
      />

      {/* Progress arc */}
      <circle
        ref={circleRef}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={animate ? circumference : offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{
          filter: `drop-shadow(0 0 4px ${color}80)`,
          transition: animate ? undefined : 'none',
        }}
      />

      {/* Score label */}
      {showLabel && (
        <text
          x={cx}
          y={cy + fontSize * 0.35}
          textAnchor="middle"
          fill={color}
          fontSize={fontSize}
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          {Math.round(score)}
        </text>
      )}
    </svg>
  );
}
