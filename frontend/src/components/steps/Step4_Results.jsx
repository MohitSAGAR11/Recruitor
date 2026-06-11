import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SlidersHorizontal, ChevronDown, X, Star, TrendingUp, Users, Trophy } from 'lucide-react';
import BiasAlert from '../ui/BiasAlert.jsx';
import CandidateCard from '../ui/CandidateCard.jsx';
import CandidateDetail from '../ui/CandidateDetail.jsx';
import Step5_Interview from './Step5_Interview.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

const FILTERS = [
  { id: 'all',         label: 'All Candidates',  Icon: Users,     desc: 'Show everyone' },
  { id: 'shortlisted', label: 'Shortlisted Only', Icon: Star,      desc: 'AI-recommended picks' },
  { id: 'top25',       label: 'Top 25%',          Icon: Trophy,    desc: 'Score ≥ 75' },
  { id: 'top50',       label: 'Top 50%',          Icon: TrendingUp,desc: 'Score ≥ 50' },
];

function applyFilter(candidates, filterId) {
  switch (filterId) {
    case 'shortlisted': return candidates.filter((c) => c.shortlisted);
    case 'top25':       return candidates.filter((c) => (c.scores?.overallScore ?? 0) >= 75);
    case 'top50':       return candidates.filter((c) => (c.scores?.overallScore ?? 0) >= 50);
    default:            return candidates;
  }
}

export default function Step4_Results() {
  const {
    rankedCandidates, selectedCandidateIndex, selectCandidate,
    biasReport, showInterviewDrawer,
  } = useRecruitStore();

  // Resize state
  const [leftWidth, setLeftWidth]   = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterOpen, setFilterOpen]     = useState(false);
  const filterRef  = useRef(null);
  const btnRef     = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        filterRef.current && !filterRef.current.contains(e.target) &&
        btnRef.current   && !btnRef.current.contains(e.target)
      ) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Compute fixed position from button rect each time it opens
  const openDropdown = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 6, left: r.right - 220 });
    }
    setFilterOpen((o) => !o);
  };

  // Resize drag logic
  const startResize = useCallback((e) => {
    e.preventDefault();
    if (leftWidth === null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setLeftWidth(rect.width / 2);
    }
    setIsResizing(true);
  }, [leftWidth]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const minL = 260;
      const maxL = Math.max(minL, rect.width - 300); // Leave at least 300px for detail view
      setLeftWidth(Math.max(minL, Math.min(maxL, newWidth)));
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Derive filtered list
  const filteredCandidates = applyFilter(rankedCandidates, activeFilter);
  const selected           = rankedCandidates[selectedCandidateIndex];
  const shortlistedCount   = rankedCandidates.filter((c) => c.shortlisted).length;
  const activeFilterLabel  = FILTERS.find((f) => f.id === activeFilter)?.label ?? 'Filter';
  const isFiltered         = activeFilter !== 'all';
  const resolvedWidth      = leftWidth !== null ? leftWidth : '50%';

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        style={{
          width: resolvedWidth,
          minWidth: 260,
          borderRight: '1px solid rgba(255,255,255,0.10)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(10, 8, 28, 0.50)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        }}
      >
        {/* Panel header */}
        <div style={{
          padding: '18px 14px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {isFiltered ? `${filteredCandidates.length} of ${rankedCandidates.length}` : rankedCandidates.length} Candidates
            </h2>

            {/* ── Filter button + dropdown ── */}
            <div ref={filterRef} style={{ position: 'relative' }}>
              <button
                ref={btnRef}
                onClick={openDropdown}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: isFiltered
                    ? 'rgba(139,124,246,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  border: isFiltered
                    ? '1px solid rgba(139,124,246,0.35)'
                    : '1px solid rgba(255,255,255,0.10)',
                  color: isFiltered ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <SlidersHorizontal size={11} />
                {isFiltered ? activeFilterLabel : 'Filter'}
                {isFiltered ? (
                  <span
                    onClick={(e) => { e.stopPropagation(); setActiveFilter('all'); setFilterOpen(false); }}
                    style={{ marginLeft: 2, display: 'flex', alignItems: 'center', opacity: 0.7 }}
                    title="Clear filter"
                  >
                    <X size={10} />
                  </span>
                ) : (
                  <ChevronDown size={10} style={{ opacity: 0.6, transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }} />
                )}
              </button>

              {/* ── Dropdown panel — fixed so overflow:hidden never clips it ── */}
              {filterOpen && (
                <div
                  ref={filterRef}
                  className="animate-fade-in"
                  style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    left: Math.max(8, dropdownPos.left),
                    width: 220,
                    background: '#1A1130',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.10) inset',
                    zIndex: 9999,
                    overflow: 'hidden',
                    padding: '6px',
                  }}
                >
                  <p style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '6px 10px 8px',
                  }}>
                    Filter by
                  </p>

                  {FILTERS.map((f) => {
                    const isActive = activeFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => { setActiveFilter(f.id); setFilterOpen(false); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: isActive ? 'rgba(139,124,246,0.15)' : 'transparent',
                          border: isActive ? '1px solid rgba(139,124,246,0.25)' : '1px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all var(--transition-fast)',
                          marginBottom: 2,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: isActive ? 'rgba(139,124,246,0.2)' : 'rgba(255,255,255,0.05)',
                          border: isActive ? '1px solid rgba(139,124,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <f.Icon size={13} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                        </div>
                        <div>
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            lineHeight: 1.2,
                          }}>
                            {f.label}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {f.desc}
                          </div>
                        </div>
                        {isActive && (
                          <div style={{
                            marginLeft: 'auto',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--accent-primary)',
                            flexShrink: 0,
                          }} />
                        )}
                      </button>
                    );
                  })}

                  {/* Count summary */}
                  <div style={{
                    margin: '6px 0 2px',
                    padding: '8px 10px',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      Shortlisted
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                      {shortlistedCount} / {rankedCandidates.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sub-line */}
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{shortlistedCount}</span>
            {' '}shortlisted
            {isFiltered && (
              <span style={{ color: 'var(--accent-primary)', marginLeft: 6 }}>
                · {activeFilterLabel}
              </span>
            )}
            {' '}· Click to view
          </p>
        </div>

        {/* Bias alert */}
        {biasReport?.biasDetected && (
          <div style={{ padding: '10px 12px 0', flexShrink: 0 }}>
            <BiasAlert biasReport={biasReport} />
          </div>
        )}

        {/* Candidate list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {filteredCandidates.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 180,
              gap: 10,
              color: 'var(--text-muted)',
            }}>
              <SlidersHorizontal size={22} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                No candidates match<br />this filter
              </p>
              <button
                onClick={() => setActiveFilter('all')}
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--accent-primary)',
                  background: 'rgba(139,124,246,0.1)',
                  border: '1px solid rgba(139,124,246,0.2)',
                  borderRadius: 6,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredCandidates.map((candidate, index) => {
              // Find the true index in the full list so selection works correctly
              const trueIndex = rankedCandidates.indexOf(candidate);
              return (
                <CandidateCard
                  key={candidate.filename || index}
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
      </div>

      {/* ── RESIZABLE SPLITTER ── */}
      <div
        onMouseDown={startResize}
        style={{
          width: '5px',
          cursor: 'col-resize',
          background: isResizing ? 'rgba(139,124,246,0.4)' : 'transparent',
          flexShrink: 0,
          zIndex: 10,
          transition: 'background var(--transition-fast)',
          position: 'relative',
        }}
        onMouseEnter={(e) => { if (!isResizing) e.currentTarget.style.background = 'rgba(139,124,246,0.2)'; }}
        onMouseLeave={(e) => { if (!isResizing) e.currentTarget.style.background = 'transparent'; }}
      />

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', minWidth: 0 }}>
        {selected ? (
          <CandidateDetail candidate={selected} />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 16,
            color: 'var(--text-muted)',
          }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              👤
            </div>
            <p style={{ fontSize: '0.88rem' }}>Select a candidate from the left panel</p>
          </div>
        )}
      </div>

      {/* ── INTERVIEW DRAWER ── */}
      {showInterviewDrawer && <Step5_Interview />}
    </div>
  );
}
