import React, { useState } from 'react';
import { BookOpen, Check, Copy, X } from 'lucide-react';
import useRecruitStore from '../../store/useRecruitStore.js';

const TABS = [
  { id: 'technical', label: 'Technical', key: 'technicalQuestions' },
  { id: 'behavioral', label: 'Behavioral', key: 'behavioralQuestions' },
  { id: 'gap', label: 'Gap probing', key: 'gapProbingQuestions' },
  { id: 'culture', label: 'Culture', key: 'cultureQuestions' },
];

const DIFFICULTY_CLASS = {
  easy: 'badge-green',
  medium: 'badge-amber',
  hard: 'badge-red',
};

function QuestionCard({ question, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(question.question);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="surface-row animate-fade-in" style={{ padding: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'start' }}>
        <span className="text-mono" style={{ color: 'var(--color-slate)', fontSize: 12 }}>Q{index + 1}</span>
        <p style={{ margin: 0, color: 'var(--color-snow)', fontSize: 14, lineHeight: 1.6 }}>{question.question}</p>
        <button className="btn btn-ghost btn-icon" onClick={handleCopy} title="Copy question">
          {copied ? <Check size={14} color="var(--color-emerald)" /> : <Copy size={14} />}
        </button>
      </div>
      {question.rationale && (
        <p className="text-body" style={{ fontSize: 13, margin: '10px 0 0 46px' }}>{question.rationale}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0 0 46px' }}>
        {question.difficulty && <span className={`badge ${DIFFICULTY_CLASS[question.difficulty] || 'badge-muted'}`}>{question.difficulty}</span>}
        {question.competency && <span className="badge badge-primary">{question.competency}</span>}
        {question.gap && <span className="badge badge-amber">Gap: {question.gap}</span>}
      </div>
    </article>
  );
}

export default function Step5_Interview() {
  const { activeInterviewCandidate, interviewQuestions, closeInterviewDrawer } = useRecruitStore();
  const [activeTab, setActiveTab] = useState('technical');
  const [allCopied, setAllCopied] = useState(false);

  if (!activeInterviewCandidate) return null;

  const name = activeInterviewCandidate.name || activeInterviewCandidate.parsed?.name || 'Candidate';
  const questions = interviewQuestions[name] || {};
  const activeKey = TABS.find((tab) => tab.id === activeTab)?.key;
  const activeQuestions = questions[activeKey] || [];

  const handleCopyAll = () => {
    const allText = TABS.flatMap((tab) => (questions[tab.key] || []).map((question, i) => `[${tab.label}] Q${i + 1}: ${question.question}`)).join('\n\n');
    navigator.clipboard.writeText(`Interview Guide for ${name}\n${'='.repeat(40)}\n\n${allText}`);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2200);
  };

  return (
    <>
      <div onClick={closeInterviewDrawer} style={{ position: 'fixed', inset: 0, background: 'rgba(8,9,10,0.74)', zIndex: 200 }} />
      <aside
        className="animate-slide-in-right"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(540px, 100vw)',
          height: '100vh',
          background: 'var(--color-charcoal)',
          borderLeft: '1px solid var(--color-graphite)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header style={{ padding: 18, borderBottom: '1px solid var(--color-graphite)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 6, background: 'rgba(94,106,210,0.12)', border: '1px solid rgba(94,106,210,0.28)', color: 'var(--color-indigo)', display: 'grid', placeItems: 'center' }}>
              <BookOpen size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-heading">Interview guide</p>
              <p style={{ margin: '2px 0 0', color: 'var(--color-fog)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={closeInterviewDrawer} title="Close interview guide">
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="tab-row" style={{ padding: '0 12px', flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map((tab) => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'grid', gap: 10, alignContent: 'start' }}>
          {activeQuestions.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={28} />
              <div>
                <p className="text-heading">No questions here</p>
                <p className="text-body" style={{ fontSize: 13, marginTop: 4 }}>Try another interview category.</p>
              </div>
            </div>
          ) : (
            activeQuestions.map((question, index) => <QuestionCard key={index} question={question} index={index} />)
          )}
        </div>

        <footer style={{ padding: 14, borderTop: '1px solid var(--color-graphite)' }}>
          <button className="btn btn-ghost w-full" onClick={handleCopyAll}>
            {allCopied ? <><Check size={14} color="var(--color-emerald)" /> Copied</> : <><Copy size={14} /> Copy all questions</>}
          </button>
        </footer>
      </aside>
    </>
  );
}
