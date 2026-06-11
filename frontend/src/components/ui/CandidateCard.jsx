import React from 'react';
import ScoreRing from './ScoreRing.jsx';
import SkillChip from './SkillChip.jsx';

export default function CandidateCard({ candidate, index, isSelected, biasReport, onClick }) {
  const score = candidate.scores?.overallScore ?? 0;
  const name = candidate.name || candidate.parsed?.name || 'Unknown';
  const role = candidate.parsed?.currentRole || '';
  const isShortlisted = candidate.shortlisted;
  const isDiversityFlag = biasReport?.flaggedForDiversity?.some((f) => f.name === name);
  const matchedSkills = (candidate.scores?.matchedMustHave || []).slice(0, 3);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 12px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        background: isSelected
          ? 'rgba(139,124,246,0.1)'
          : 'transparent',
        border: isSelected
          ? '1px solid rgba(139,124,246,0.22)'
          : '1px solid transparent',
        backdropFilter: isSelected ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isSelected ? 'blur(12px)' : 'none',
        boxShadow: isSelected ? '0 4px 16px rgba(139,124,246,0.08)' : 'none',
        transition: 'all var(--transition-base)',
        userSelect: 'none',
        marginBottom: 2,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.border = '1px solid transparent';
        }
      }}
    >
      {/* Rank badge */}
      <div
        style={{
          minWidth: 24,
          height: 24,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.62rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          background: isShortlisted
            ? 'linear-gradient(135deg, var(--accent-primary), #6B5BD4)'
            : 'rgba(255,255,255,0.05)',
          color: isShortlisted ? '#fff' : 'var(--text-muted)',
          border: isShortlisted
            ? '1px solid rgba(255,255,255,0.15)'
            : '1px solid rgba(255,255,255,0.07)',
          boxShadow: isShortlisted ? '0 2px 8px rgba(139,124,246,0.3)' : 'none',
          flexShrink: 0,
        }}
      >
        {candidate.rank}
      </div>

      {/* Score ring */}
      <ScoreRing score={score} size={40} strokeWidth={3} animate={false} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </span>
          {isDiversityFlag && (
            <span title="Flagged for diversity consideration" style={{ fontSize: '0.75rem', flexShrink: 0 }}>
              🌟
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: matchedSkills.length > 0 ? 5 : 0,
          }}
        >
          {role}
        </div>
        {matchedSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {matchedSkills.map((skill, i) => (
              <SkillChip key={i} label={skill} variant="matched" size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Score number */}
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color:
            score >= 80 ? 'var(--accent-teal)'
            : score >= 60 ? 'var(--accent-primary)'
            : score >= 40 ? 'var(--accent-amber)'
            : 'var(--accent-red)',
          minWidth: 32,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {Math.round(score)}
      </div>
    </div>
  );
}
