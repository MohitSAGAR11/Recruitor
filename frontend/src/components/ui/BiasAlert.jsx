import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Shield } from 'lucide-react';

export default function BiasAlert({ biasReport }) {
  const [expanded, setExpanded] = useState(false);

  if (!biasReport?.biasDetected) return null;

  return (
    <div
      style={{
        background: 'rgba(245,166,35,0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(245,166,35,0.2)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'rgba(245,166,35,0.12)',
          border: '1px solid rgba(245,166,35,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AlertTriangle size={13} color="var(--accent-amber)" />
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-amber)', flex: 1 }}>
          Potential bias detected
        </span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginRight: 4 }}>
          {expanded ? 'Hide' : 'Details'}
        </span>
        {expanded ? (
          <ChevronUp size={13} color="var(--accent-amber)" />
        ) : (
          <ChevronDown size={13} color="var(--accent-amber)" />
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0 14px 14px',
            borderTop: '1px solid rgba(245,166,35,0.1)',
            paddingTop: 12,
          }}
        >
          {biasReport.biasTypes?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {biasReport.biasTypes.map((type, i) => (
                <span key={i} className="badge badge-amber">{type}</span>
              ))}
            </div>
          )}

          {biasReport.overallExplanation && (
            <p style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.65 }}>
              {biasReport.overallExplanation}
            </p>
          )}

          {biasReport.flaggedForDiversity?.length > 0 && (
            <div>
              <p className="text-caption" style={{ marginBottom: 8 }}>Recommended additions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {biasReport.flaggedForDiversity.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-teal)', fontSize: '0.85rem', marginTop: 1, flexShrink: 0 }}>🌟</span>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 6 }}>
                        — {item.diversityValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {biasReport.diversityRecommendation && (
            <p style={{
              fontSize: '0.77rem',
              color: 'var(--accent-amber)',
              marginTop: 12,
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}>
              💡 {biasReport.diversityRecommendation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
