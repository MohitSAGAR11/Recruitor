import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function BiasAlert({ biasReport }) {
  const [expanded, setExpanded] = useState(false);
  if (!biasReport?.biasDetected) return null;

  return (
    <div className="surface-row" style={{ overflow: 'hidden', background: 'rgba(214,166,58,0.08)', borderColor: 'rgba(214,166,58,0.28)' }}>
      <button
        onClick={() => setExpanded((value) => !value)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'transparent', color: 'var(--accent-amber)', textAlign: 'left' }}
      >
        <AlertTriangle size={15} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 510 }}>Potential shortlist bias</span>
        <span style={{ color: 'var(--color-fog)', fontSize: 12 }}>{expanded ? 'Hide' : 'Details'}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="animate-fade-in" style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(214,166,58,0.18)' }}>
          {biasReport.biasTypes?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {biasReport.biasTypes.map((type, i) => <span key={i} className="badge badge-amber">{type}</span>)}
            </div>
          )}
          {biasReport.overallExplanation && <p className="text-body" style={{ fontSize: 13, marginTop: 10 }}>{biasReport.overallExplanation}</p>}
          {biasReport.flaggedForDiversity?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p className="text-caption" style={{ marginBottom: 8 }}>Recommended additions</p>
              <div style={{ display: 'grid', gap: 6 }}>
                {biasReport.flaggedForDiversity.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, color: 'var(--color-mist)', fontSize: 13 }}>
                    <span className="status-dot" style={{ color: 'var(--color-cyan)', marginTop: 6 }} />
                    <span><strong>{item.name}</strong> <span style={{ color: 'var(--color-fog)' }}>{item.diversityValue}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {biasReport.diversityRecommendation && <p className="text-body" style={{ color: 'var(--accent-amber)', fontSize: 13, marginTop: 12 }}>{biasReport.diversityRecommendation}</p>}
        </div>
      )}
    </div>
  );
}
