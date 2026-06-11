import React, { useEffect, useState } from 'react';
import { BarChart2, ChevronRight } from 'lucide-react';
import ScoreRing from '../ui/ScoreRing.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

const TIPS = [
  'Semantic matching looks beyond keywords to understand context and intent.',
  'Transferable skills are evaluated — fintech ops experience counts for domain knowledge.',
  'Career trajectory signals growth potential, not just tenure.',
  'Education is scored proportionally — a portfolio can outweigh a degree.',
  'Soft skills are inferred from role descriptions and achievements.',
  'Non-traditional backgrounds are treated as assets, not liabilities.',
  'Score categories are weighted independently to find dimensional fit.',
];

export default function Step3_Scoring() {
  const {
    scoringProgress, scoringCurrent, scoringTotal, scoringLatestName,
    isScoringActive, rankedCandidates, setStep,
  } = useRecruitStore();

  const [tipIndex, setTipIndex] = useState(0);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!scoringLatestName) return;
    setDisplayName('');
    const chars = scoringLatestName.split('');
    chars.forEach((char, i) => {
      setTimeout(() => setDisplayName((d) => d + char), i * 30);
    });
  }, [scoringLatestName]);

  // ── Idle state: scoring already done ────────────────────────
  if (!isScoringActive && rankedCandidates.length > 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: 24,
          padding: '40px 24px',
          textAlign: 'center',
        }}
        className="animate-fade-in"
      >
        {/* Success icon */}
        <div
          className="animate-float"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(74,222,128,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(74,222,128,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            boxShadow: '0 0 30px rgba(74,222,128,0.2)',
          }}
        >
          ✓
        </div>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Scoring Complete
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {rankedCandidates.length} candidates have been evaluated and ranked.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setStep(4)}
          style={{ gap: 8 }}
        >
          <BarChart2 size={16} />
          View Results <ChevronRight size={15} />
        </button>
      </div>
    );
  }

  // ── Active state: scoring in progress ───────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        gap: 36,
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      {/* Score ring with radial glow */}
      <div
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        className="animate-pulse-ring"
      >
        <div
          style={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,124,246,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 195,
            height: 195,
            borderRadius: '50%',
            border: '1px solid rgba(139,124,246,0.1)',
            pointerEvents: 'none',
          }}
        />
        <ScoreRing
          score={scoringProgress}
          size={160}
          strokeWidth={8}
          animate={false}
          showLabel={true}
        />
      </div>

      {/* Status */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Evaluating Candidates
        </h2>
        {scoringTotal > 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Scoring candidate{' '}
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {scoringCurrent}
            </span>
            {' '}of{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{scoringTotal}</span>
          </p>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Initialising scoring pipeline…</p>
        )}
      </div>

      {/* Typewriter candidate name */}
      {displayName && (
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(52,217,195,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 24px',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-teal)',
            fontWeight: 500,
            letterSpacing: '0.02em',
            boxShadow: '0 0 20px rgba(52,217,195,0.08)',
          }}
        >
          ▶ {displayName}
          <span style={{ opacity: 0.5, marginLeft: 2 }}>_</span>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{
          height: 6,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 100,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
        }}>
          <div
            style={{
              height: '100%',
              width: `${scoringProgress}%`,
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-teal))',
              borderRadius: 100,
              transition: 'width 0.5s ease',
              boxShadow: '0 0 14px rgba(139,124,246,0.5)',
            }}
          />
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
          {scoringProgress}% complete
        </p>
      </div>

      {/* Rotating tip */}
      <div
        key={tipIndex}
        className="animate-fade-in"
        style={{
          maxWidth: 460,
          padding: '16px 22px',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
          fontStyle: 'italic',
        }}
      >
        💡 {TIPS[tipIndex]}
      </div>
    </div>
  );
}
