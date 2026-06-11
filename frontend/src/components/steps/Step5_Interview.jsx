import React, { useState } from 'react';
import { X, Copy, Check, BookOpen } from 'lucide-react';
import useRecruitStore from '../../store/useRecruitStore.js';

const TABS = [
  { id: 'technical',  label: 'Technical',   key: 'technicalQuestions'  },
  { id: 'behavioral', label: 'Behavioral',  key: 'behavioralQuestions' },
  { id: 'gap',        label: 'Gap Probing', key: 'gapProbingQuestions' },
  { id: 'culture',    label: 'Culture',     key: 'cultureQuestions'    },
];

const DIFFICULTY_COLOR = {
  easy:   'var(--accent-green)',
  medium: 'var(--accent-amber)',
  hard:   'var(--accent-red)',
};

function QuestionCard({ q, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(q.question);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: 10,
        transition: 'border-color var(--transition-fast)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <span
          style={{
            fontSize: '0.66rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text-muted)',
            flexShrink: 0,
            marginTop: 3,
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          Q{index + 1}
        </span>
        <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.65, flex: 1 }}>
          {q.question}
        </p>
        <button
          onClick={handleCopy}
          style={{
            color: copied ? 'var(--accent-green)' : 'var(--text-muted)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            padding: '5px 6px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          title="Copy question"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>

      {q.rationale && (
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: 1.55,
          marginBottom: 10,
          paddingLeft: 28,
          fontStyle: 'italic',
        }}>
          ↳ {q.rationale}
        </p>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 28 }}>
        {q.difficulty && (
          <span
            className="badge"
            style={{
              background: `${DIFFICULTY_COLOR[q.difficulty]}18`,
              color: DIFFICULTY_COLOR[q.difficulty],
              border: `1px solid ${DIFFICULTY_COLOR[q.difficulty]}30`,
            }}
          >
            {q.difficulty}
          </span>
        )}
        {q.competency && <span className="badge badge-primary">{q.competency}</span>}
        {q.gap && <span className="badge badge-amber">Gap: {q.gap}</span>}
      </div>
    </div>
  );
}

export default function Step5_Interview() {
  const { activeInterviewCandidate, interviewQuestions, closeInterviewDrawer } = useRecruitStore();
  const [activeTab, setActiveTab] = useState('technical');
  const [allCopied, setAllCopied] = useState(false);

  if (!activeInterviewCandidate) return null;

  const name = activeInterviewCandidate.name || activeInterviewCandidate.parsed?.name || 'Candidate';
  const questions = interviewQuestions[name] || {};
  const activeKey = TABS.find((t) => t.id === activeTab)?.key;
  const activeQuestions = questions[activeKey] || [];

  const handleCopyAll = () => {
    const allText = TABS.flatMap((tab) =>
      (questions[tab.key] || []).map(
        (q, i) => `[${tab.label}] Q${i + 1}: ${q.question}`
      )
    ).join('\n\n');

    navigator.clipboard.writeText(
      `Interview Guide for ${name}\n${'='.repeat(40)}\n\n${allText}`
    );
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeInterviewDrawer}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6,6,15,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 200,
        }}
      />

      {/* Drawer */}
      <div
        className="animate-slide-in-right"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 500,
          height: '100vh',
          background: 'rgba(14,14,26,0.9)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 300,
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'rgba(139,124,246,0.15)',
              border: '1px solid rgba(139,124,246,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOpen size={15} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>Interview Guide</h2>
            <button
              onClick={closeInterviewDrawer}
              style={{
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '5px 6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <X size={16} />
            </button>
          </div>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--accent-primary)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}>
            {name}
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '0 12px',
            flexShrink: 0,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                background: 'none',
                borderBottom: activeTab === tab.id
                  ? '2px solid var(--accent-primary)'
                  : '2px solid transparent',
                transition: 'all var(--transition-fast)',
                letterSpacing: '-0.01em',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
          {activeQuestions.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60%',
              gap: 12,
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '2rem', opacity: 0.4 }}>📭</div>
              <p style={{ fontSize: '0.85rem' }}>No questions in this category.</p>
            </div>
          ) : (
            activeQuestions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <button
            className="btn btn-ghost w-full"
            style={{ justifyContent: 'center', gap: 8 }}
            onClick={handleCopyAll}
          >
            {allCopied ? (
              <><Check size={14} color="var(--accent-green)" /> Copied!</>
            ) : (
              <><Copy size={14} /> Copy All Questions</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
