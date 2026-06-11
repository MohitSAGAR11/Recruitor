import React from 'react';
import {
  FileText, Upload, Zap, BarChart2, MessageSquare, CheckCircle2
} from 'lucide-react';
import useRecruitStore from '../../store/useRecruitStore.js';

const STEPS = [
  { id: 1, label: 'Define Role',     sub: 'Job description',    Icon: FileText     },
  { id: 2, label: 'Upload CVs',      sub: 'Candidate files',    Icon: Upload       },
  { id: 3, label: 'Score & Rank',    sub: 'AI evaluation',      Icon: Zap          },
  { id: 4, label: 'Review Results',  sub: 'Ranked candidates',  Icon: BarChart2    },
  { id: 5, label: 'Interview Guide', sub: 'Tailored questions', Icon: MessageSquare },
];

export default function Sidebar() {
  const { currentStep, parsedJD, parsedCandidates, rankedCandidates, isScoringActive, setStep, showInterviewDrawer, generateInterviewQuestions, selectedCandidateIndex } = useRecruitStore();

  const handleStepClick = (stepId) => {
    if (stepId === 5) {
      // Step 5 = go to Results and open interview drawer for current candidate
      setStep(4);
      const candidate = rankedCandidates[selectedCandidateIndex];
      if (candidate) {
        generateInterviewQuestions(candidate);
      }
      return;
    }
    if (stepId === 3 && rankedCandidates.length > 0 && !isScoringActive) {
      setStep(4);
    } else {
      setStep(stepId);
    }
  };

  const isComplete = (stepId) => {
    if (stepId === 1) return !!parsedJD;
    if (stepId === 2) return parsedCandidates.length > 0;
    if (stepId === 3) return rankedCandidates.length > 0;
    if (stepId === 4) return rankedCandidates.length > 0 && currentStep >= 4;
    // Step 5 is available whenever results exist (same as step 4)
    if (stepId === 5) return rankedCandidates.length > 0;
    return false;
  };

  return (
    <aside
      style={{
        width: 260,
        height: '100vh',
        background: 'rgba(12, 10, 30, 0.55)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo / Branding */}
      <div style={{
        padding: '28px 20px 22px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #8B7CF6, #6B5BD4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139,124,246,0.4), 0 4px 12px rgba(0,0,0,0.3)',
              fontSize: '1.1rem',
              flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            🧑‍💼
          </div>
          <div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}>
              RecruitAI
            </div>
            <div style={{
              fontSize: '0.62rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              AI-Powered Screening
            </div>
          </div>
        </div>
      </div>

      {/* Step navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {STEPS.map((step, idx) => {
          const isActive = step.id === 5
            ? showInterviewDrawer && currentStep === 4  // step 5 = active when interview drawer is open
            : currentStep === step.id;
          const done = isComplete(step.id);
          // Step 5 is navigatable whenever ranked candidates exist
          const canNavigate = step.id === 5
            ? rankedCandidates.length > 0
            : step.id <= currentStep || done;

          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => canNavigate && handleStepClick(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: canNavigate ? 'pointer' : 'default',
                  position: 'relative',
                  background: isActive
                    ? 'rgba(139,124,246,0.12)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(139,124,246,0.25)'
                    : '1px solid transparent',
                  backdropFilter: isActive ? 'blur(12px)' : 'none',
                  WebkitBackdropFilter: isActive ? 'blur(12px)' : 'none',
                  boxShadow: isActive
                    ? '0 4px 16px rgba(139,124,246,0.1)'
                    : 'none',
                  transition: 'all var(--transition-base)',
                  opacity: canNavigate ? 1 : 0.3,
                }}
                onMouseEnter={(e) => {
                  if (canNavigate && !isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.border = '1px solid transparent';
                  }
                }}
              >
                {/* Icon bubble */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isActive
                      ? 'linear-gradient(135deg, var(--accent-primary), #6B5BD4)'
                      : done
                      ? 'rgba(74,222,128,0.1)'
                      : 'rgba(255,255,255,0.05)',
                    border: isActive
                      ? '1px solid rgba(255,255,255,0.2)'
                      : done
                      ? '1px solid rgba(74,222,128,0.2)'
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isActive
                      ? '0 4px 16px rgba(139,124,246,0.35), 0 1px 0 rgba(255,255,255,0.15) inset'
                      : 'none',
                    transition: 'all var(--transition-base)',
                  }}
                >
                  {done && !isActive ? (
                    <CheckCircle2 size={15} color="var(--accent-green)" />
                  ) : (
                    <step.Icon
                      size={14}
                      color={isActive ? '#fff' : done ? 'var(--accent-green)' : 'var(--text-muted)'}
                    />
                  )}
                </div>

                {/* Labels */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? 'var(--text-primary)'
                        : done
                        ? 'var(--text-secondary)'
                        : 'var(--text-muted)',
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {step.label}
                  </div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    marginTop: 1,
                  }}>
                    {step.sub}
                  </div>
                </div>

                {/* Step counter */}
                <div
                  style={{
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono)',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-disabled)',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {String(step.id).padStart(2, '0')}
                </div>
              </div>

              {/* Connector dot */}
              {idx < STEPS.length - 1 && (
                <div style={{
                  width: 2,
                  height: 10,
                  borderRadius: 1,
                  background: done
                    ? 'rgba(74,222,128,0.4)'
                    : 'rgba(255,255,255,0.06)',
                  marginLeft: 28,
                  transition: 'background var(--transition-slow)',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent-green)',
            boxShadow: '0 0 8px var(--accent-green)',
            flexShrink: 0,
          }} />
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>OpenRouter</span>
            <span style={{ display: 'block', opacity: 0.6 }}>AI-Powered Analysis</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
