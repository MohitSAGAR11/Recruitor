import React from 'react';
import ScoreRing from './ScoreRing.jsx';
import SkillChip from './SkillChip.jsx';

function scoreColor(score) {
  if (score >= 80) return 'var(--color-emerald)';
  if (score >= 60) return 'var(--color-indigo)';
  if (score >= 40) return 'var(--accent-amber)';
  return 'var(--color-crimson)';
}

export default function CandidateCard({ candidate, isSelected, biasReport, onClick }) {
  const score = candidate.scores?.overallScore ?? 0;
  const name = candidate.name || candidate.parsed?.name || 'Unknown';
  const role = candidate.parsed?.currentRole || 'Role not parsed';
  const isShortlisted = candidate.shortlisted;
  const isDiversityFlag = biasReport?.flaggedForDiversity?.some((item) => item.name === name);
  const matchedSkills = (candidate.scores?.matchedMustHave || []).slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="surface-row"
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '34px 44px minmax(0, 1fr) auto',
        gap: 10,
        alignItems: 'center',
        padding: 10,
        marginBottom: 6,
        textAlign: 'left',
        background: isSelected ? 'rgba(94,106,210,0.12)' : 'var(--color-obsidian)',
        borderColor: isSelected ? 'rgba(94,106,210,0.32)' : 'var(--color-graphite)',
      }}
    >
      <span
        className="text-mono"
        style={{
          width: 28,
          height: 28,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 6,
          color: isShortlisted ? '#030404' : 'var(--color-fog)',
          background: isShortlisted ? 'var(--color-acid-lime)' : 'var(--color-charcoal)',
          border: isShortlisted ? '0' : '1px solid var(--color-graphite)',
          fontSize: 12,
        }}
      >
        {candidate.rank}
      </span>

      <ScoreRing score={score} size={38} strokeWidth={3} animate={false} />

      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ color: 'var(--color-snow)', fontSize: 13, fontWeight: 510, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          {isDiversityFlag && <span className="badge badge-teal">bias add</span>}
        </span>
        <span style={{ display: 'block', color: 'var(--color-slate)', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role}</span>
        {matchedSkills.length > 0 && (
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {matchedSkills.map((skill, i) => <SkillChip key={i} label={skill} variant="matched" size="sm" />)}
          </span>
        )}
      </span>

      <span className="text-mono" style={{ color: scoreColor(score), fontSize: 15, minWidth: 28, textAlign: 'right' }}>
        {Math.round(score)}
      </span>
    </button>
  );
}
