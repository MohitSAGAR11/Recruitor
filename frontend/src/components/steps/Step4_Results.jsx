import React, { useMemo, useState } from 'react';
import { BarChart2, SlidersHorizontal, Star, TrendingUp, Trophy, Users } from 'lucide-react';
import BiasAlert from '../ui/BiasAlert.jsx';
import CandidateCard from '../ui/CandidateCard.jsx';
import CandidateDetail from '../ui/CandidateDetail.jsx';
import Step5_Interview from './Step5_Interview.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

const FILTERS = [
  { id: 'all', label: 'All', Icon: Users },
  { id: 'shortlisted', label: 'Shortlist', Icon: Star },
  { id: 'top25', label: 'Top 25%', Icon: Trophy },
  { id: 'top50', label: 'Top 50%', Icon: TrendingUp },
];

function applyFilter(candidates, filterId) {
  if (filterId === 'shortlisted') return candidates.filter((candidate) => candidate.shortlisted);
  if (filterId === 'top25') return candidates.filter((candidate) => (candidate.scores?.overallScore ?? 0) >= 75);
  if (filterId === 'top50') return candidates.filter((candidate) => (candidate.scores?.overallScore ?? 0) >= 50);
  return candidates;
}

export default function Step4_Results() {
  const { rankedCandidates, selectedCandidateIndex, selectCandidate, biasReport, showInterviewDrawer } = useRecruitStore();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredCandidates = useMemo(() => applyFilter(rankedCandidates, activeFilter), [rankedCandidates, activeFilter]);
  const selected = rankedCandidates[selectedCandidateIndex];
  const shortlistedCount = rankedCandidates.filter((candidate) => candidate.shortlisted).length;
  const averageScore = rankedCandidates.length
    ? Math.round(rankedCandidates.reduce((sum, candidate) => sum + (candidate.scores?.overallScore ?? 0), 0) / rankedCandidates.length)
    : 0;

  if (rankedCandidates.length === 0) {
    return (
      <div className="stage stage-narrow" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="empty-state panel" style={{ width: 'min(520px, 100%)', padding: 32 }}>
          <BarChart2 size={30} />
          <div>
            <p className="text-heading">No ranked candidates yet</p>
            <p className="text-body" style={{ fontSize: 13, marginTop: 4 }}>Parse CVs and run scoring to populate the review board.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 42%) minmax(0, 1fr)', gridTemplateRows: '100%', height: '100%', overflow: 'hidden' }}>
      <aside style={{ minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-charcoal)', borderRight: '1px solid var(--color-graphite)' }}>
        <header style={{ padding: 16, borderBottom: '1px solid var(--color-graphite)' }}>
          <p className="eyebrow"><span className="eyebrow-dot" />RUN-04 / REVIEW BOARD</p>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginTop: 12 }}>
            <div>
              <h1 className="text-title" style={{ fontSize: 24 }}>Candidate ranking</h1>
              <p className="text-body" style={{ fontSize: 12, marginTop: 4 }}>{filteredCandidates.length} visible / {rankedCandidates.length} total</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-muted">{shortlistedCount} shortlisted</span>
              <span className="badge badge-primary">avg {averageScore}</span>
            </div>
          </div>
        </header>

        <div style={{ padding: 12, borderBottom: '1px solid var(--color-graphite)' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {FILTERS.map((filter) => {
              const Icon = filter.Icon;
              const active = activeFilter === filter.id;
              return (
                <button key={filter.id} className={`btn btn-sm ${active ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setActiveFilter(filter.id)}>
                  <Icon size={13} /> {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {biasReport?.biasDetected && (
          <div style={{ padding: '12px 12px 0' }}>
            <BiasAlert biasReport={biasReport} />
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {filteredCandidates.length === 0 ? (
            <div className="empty-state">
              <SlidersHorizontal size={26} />
              <div>
                <p className="text-heading">No candidates match</p>
                <p className="text-body" style={{ fontSize: 13, marginTop: 4 }}>Clear the filter to restore the full ranking.</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveFilter('all')}>Clear filter</button>
            </div>
          ) : (
            filteredCandidates.map((candidate, index) => {
              const trueIndex = rankedCandidates.indexOf(candidate);
              return (
                <CandidateCard
                  key={candidate.filename || candidate.name || index}
                  candidate={candidate}
                  index={index}
                  isSelected={selectedCandidateIndex === trueIndex}
                  biasReport={biasReport}
                  onClick={() => selectCandidate(trueIndex)}
                />
              );
            })
          )}
        </div>
      </aside>

      <main style={{ minWidth: 0, height: '100%', overflow: 'hidden', background: 'var(--color-onyx)' }}>
        <CandidateDetail candidate={selected} />
      </main>

      {showInterviewDrawer && <Step5_Interview />}
    </div>
  );
}
