import React, { useEffect, useState } from 'react';
import { BarChart2, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import ScoreRing from '../ui/ScoreRing.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

const TIPS = [
  'Semantic matching weighs context, not just keywords.',
  'Transferable experience is treated as signal when the role context matches.',
  'Career trajectory is evaluated separately from raw tenure.',
  'Education is one dimension, not a gate.',
  'Interview focus areas are generated from score gaps.',
];

export default function Step3_Scoring() {
  const { scoringProgress, scoringCurrent, scoringTotal, scoringLatestName, isScoringActive, rankedCandidates, setStep } = useRecruitStore();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTipIndex((index) => (index + 1) % TIPS.length), 4200);
    return () => clearInterval(interval);
  }, []);

  if (!isScoringActive && rankedCandidates.length > 0) {
    return (
      <div className="stage stage-narrow" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <section className="panel animate-fade-in" style={{ width: 'min(560px, 100%)', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 12, background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.28)', color: 'var(--color-emerald)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
            <CheckCircle2 size={24} />
          </div>
          <p className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" />Scoring complete</p>
          <h1 className="text-title" style={{ marginTop: 10 }}>{rankedCandidates.length} candidates ranked</h1>
          <p className="text-body" style={{ marginTop: 8 }}>The shortlist, category scores, bias review, and interview handoff are ready.</p>
          <button className="btn btn-primary" onClick={() => setStep(4)} style={{ marginTop: 22 }}>
            <BarChart2 size={16} /> Open review board <ChevronRight size={15} />
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="stage stage-narrow" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <section className="panel animate-fade-in" style={{ width: 'min(720px, 100%)', overflow: 'hidden' }}>
        <div className="panel-section" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
          <ScoreRing score={scoringProgress} size={136} strokeWidth={7} animate={false} />
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" />RUN-03 / SCORING</p>
            <h1 className="text-title" style={{ marginTop: 10 }}>Evaluating candidates</h1>
            <p className="text-body" style={{ marginTop: 8 }}>
              {scoringTotal > 0 ? (
                <>Candidate <span className="text-mono" style={{ color: 'var(--color-indigo)' }}>{scoringCurrent}</span> of <span className="text-mono">{scoringTotal}</span> is being scored.</>
              ) : (
                <>Initialising the scoring pipeline.</>
              )}
            </p>
          </div>
        </div>

        <div className="panel-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="text-mono" style={{ color: 'var(--color-fog)', fontSize: 12 }}>PROGRESS</span>
            <span className="text-mono" style={{ color: 'var(--color-mist)', fontSize: 12 }}>{scoringProgress}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--color-graphite)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${scoringProgress}%`, background: 'var(--color-indigo)', transition: 'width 400ms ease' }} />
          </div>
        </div>

        <div className="panel-section">
          <div className="surface-row" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Loader2 className="animate-spin" size={16} color="var(--color-indigo)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-caption">Current candidate</p>
              <p className="text-mono" style={{ margin: '4px 0 0', color: scoringLatestName ? 'var(--color-mist)' : 'var(--color-slate)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scoringLatestName || 'Waiting for model event...'}
              </p>
            </div>
          </div>
        </div>

        <div className="panel-section">
          <p className="text-caption">Evaluation note</p>
          <p className="text-body" style={{ marginTop: 6 }}>{TIPS[tipIndex]}</p>
        </div>
      </section>
    </div>
  );
}
