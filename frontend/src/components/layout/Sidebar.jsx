import React from 'react';
import {
  BarChart2,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  MessageSquare,
  Plus,
  Upload,
  Zap,
} from 'lucide-react';
import useRecruitStore from '../../store/useRecruitStore.js';
import useAuthStore from '../../store/useAuthStore.js';

const STEPS = [
  { id: 1, label: 'Role brief', sub: 'Parse requirements', Icon: FileText },
  { id: 2, label: 'Candidate intake', sub: 'Upload and parse CVs', Icon: Upload },
  { id: 3, label: 'Scoring run', sub: 'Model evaluation', Icon: Zap },
  { id: 4, label: 'Review board', sub: 'Ranked shortlist', Icon: BarChart2 },
  { id: 5, label: 'Interview kit', sub: 'Question guide', Icon: MessageSquare },
];

export default function Sidebar() {
  const {
    currentStep,
    parsedJD,
    parsedCandidates,
    rankedCandidates,
    isScoringActive,
    setStep,
    showInterviewDrawer,
    generateInterviewQuestions,
    selectedCandidateIndex,
    startNewScreening,
    setShowHistory,
  } = useRecruitStore();
  const { user, logout } = useAuthStore();

  const handleStepClick = (stepId) => {
    if (stepId === 5) {
      setStep(4);
      const candidate = rankedCandidates[selectedCandidateIndex];
      if (candidate) generateInterviewQuestions(candidate);
      return;
    }
    if (stepId === 3 && rankedCandidates.length > 0 && !isScoringActive) {
      setStep(4);
      return;
    }
    setStep(stepId);
  };

  const isComplete = (stepId) => {
    if (stepId === 1) return Boolean(parsedJD);
    if (stepId === 2) return parsedCandidates.length > 0;
    if (stepId === 3) return rankedCandidates.length > 0;
    if (stepId === 4) return rankedCandidates.length > 0 && currentStep >= 4;
    if (stepId === 5) return rankedCandidates.length > 0;
    return false;
  };

  return (
    <aside
      style={{
        width: 280,
        height: '100vh',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-charcoal)',
        borderRight: '1px solid var(--color-graphite)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--color-graphite)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            aria-hidden="true"
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: 'var(--color-snow)',
              color: 'var(--color-onyx)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-berkeley-mono)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            RA
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--color-snow)', fontSize: 15, fontWeight: 510 }}>RecruitAI</div>
            <div className="text-mono" style={{ color: 'var(--color-slate)', fontSize: 11, marginTop: 1 }}>
              SCREENING.OS
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={startNewScreening} title="Start a fresh screening">
          <Plus size={14} /> New run
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(true)} title="View past screenings">
          <Clock size={14} /> History
        </button>
      </div>

      <nav style={{ flex: 1, padding: '8px 10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STEPS.map((step) => {
          const isActive = step.id === 5 ? showInterviewDrawer && currentStep === 4 : currentStep === step.id;
          const done = isComplete(step.id);
          const canNavigate = step.id === 5 ? rankedCandidates.length > 0 : step.id <= currentStep || done;
          const Icon = step.Icon;

          return (
            <button
              key={step.id}
              onClick={() => canNavigate && handleStepClick(step.id)}
              disabled={!canNavigate}
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '30px 1fr auto',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px',
                borderRadius: 6,
                color: isActive ? 'var(--color-snow)' : done ? 'var(--color-mist)' : 'var(--color-fog)',
                background: isActive ? 'rgba(94, 106, 210, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(94, 106, 210, 0.3)' : '1px solid transparent',
                textAlign: 'left',
                opacity: canNavigate ? 1 : 0.42,
                transition: 'background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isActive && canNavigate) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.borderColor = 'var(--color-graphite)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 6,
                  background: done && !isActive ? 'rgba(39,166,68,0.1)' : 'var(--color-obsidian)',
                  border: done && !isActive ? '1px solid rgba(39,166,68,0.26)' : '1px solid var(--color-graphite)',
                  color: done && !isActive ? 'var(--color-emerald)' : isActive ? 'var(--color-indigo)' : 'var(--color-fog)',
                }}
              >
                {done && !isActive ? <CheckCircle2 size={14} /> : <Icon size={14} />}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: isActive ? 510 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {step.label}
                </span>
                <span style={{ display: 'block', marginTop: 1, color: 'var(--color-slate)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {step.sub}
                </span>
              </span>
              <span className="text-mono" style={{ color: isActive ? 'var(--color-indigo)' : 'var(--color-slate)', fontSize: 11 }}>
                {String(step.id).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 14, borderTop: '1px solid var(--color-graphite)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              border: '1px solid var(--color-graphite)',
              background: 'var(--color-obsidian)',
              color: 'var(--color-mist)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 510,
            }}
          >
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'var(--color-mist)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Recruiter'}
            </div>
            <div style={{ color: 'var(--color-slate)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={logout} title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
