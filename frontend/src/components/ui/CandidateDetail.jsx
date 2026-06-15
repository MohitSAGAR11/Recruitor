import React, { useState } from 'react';
import { Award, Briefcase, Mail, MapPin, MessageSquare, Phone, User, Loader2 } from 'lucide-react';
import ScoreRing from './ScoreRing.jsx';
import ProgressBar from './ProgressBar.jsx';
import SkillChip from './SkillChip.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

const categories = [
  { label: 'Hard skills', key: 'hardSkills' },
  { label: 'Soft skills', key: 'softSkills' },
  { label: 'Experience', key: 'experience' },
  { label: 'Domain knowledge', key: 'domainKnowledge' },
  { label: 'Education', key: 'education' },
];

function EmptyDetail() {
  return (
    <div className="empty-state" style={{ height: '100%' }}>
      <User size={30} />
      <div>
        <p className="text-heading">Select a candidate</p>
        <p className="text-body" style={{ fontSize: 13, marginTop: 4 }}>Score evidence and profile details will appear here.</p>
      </div>
    </div>
  );
}

export default function CandidateDetail({ candidate }) {
  const { generateInterviewQuestions, interviewQuestions, loading, loadingMessage } = useRecruitStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (!candidate) return <EmptyDetail />;

  const name = candidate.name || candidate.parsed?.name || 'Unknown';
  const parsed = candidate.parsed || {};
  const scores = candidate.scores || {};
  const overallScore = scores.overallScore ?? 0;
  const isGenerating = loading && loadingMessage?.includes(name);
  const hasQuestions = Boolean(interviewQuestions[name]);
  const categoryScores = scores.categoryScores || {};

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24 }}>
      <section className="panel animate-fade-in" style={{ marginBottom: 18 }}>
        <div className="panel-section" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center' }}>
          <ScoreRing score={overallScore} size={82} strokeWidth={6} animate />
          <div style={{ minWidth: 0 }}>
            <p className="eyebrow"><span className="eyebrow-dot" />Rank {candidate.rank || '--'}</p>
            <h2 className="text-title" style={{ fontSize: 26, marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</h2>
            {parsed.currentRole && (
              <p className="text-body" style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={13} /> {parsed.currentRole}
              </p>
            )}
          </div>
          {candidate.shortlisted && <span className="badge" style={{ background: 'var(--color-acid-lime)', color: '#030404' }}>shortlisted</span>}
        </div>

        <div className="panel-section">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: 'var(--color-fog)', fontSize: 12 }}>
            {parsed.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={12} />{parsed.location}</span>}
            {parsed.email && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Mail size={12} />{parsed.email}</span>}
            {parsed.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Phone size={12} />{parsed.phone}</span>}
          </div>
        </div>
      </section>

      <div className="tab-row" style={{ marginBottom: 18 }}>
        <button onClick={() => setActiveTab('overview')} className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}><User size={13} /> Profile</button>
        <button onClick={() => setActiveTab('evaluation')} className={`tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}><Award size={13} /> Evaluation</button>
      </div>

      {activeTab === 'overview' ? (
        <div className="animate-fade-in" style={{ display: 'grid', gap: 18 }}>
          <section className="panel">
            <div className="panel-section">
              <p className="text-heading">Candidate summary</p>
              <div className="metric-grid" style={{ marginTop: 14 }}>
                <div className="metric"><p className="metric-label">Experience</p><p className="metric-value">{parsed.totalYearsExperience || 0} yrs</p></div>
                <div className="metric"><p className="metric-label">Career path</p><p className="metric-value" style={{ textTransform: 'capitalize' }}>{parsed.careerTrajectory || 'N/A'}</p></div>
                <div className="metric"><p className="metric-label">Background</p><p className="metric-value">{parsed.nonTraditionalBackground ? 'Non-traditional' : 'Traditional'}</p></div>
              </div>
              {parsed.nonTraditionalBackground && parsed.nonTraditionalReason && (
                <p className="text-body" style={{ marginTop: 14, padding: 12, borderLeft: '2px solid var(--color-indigo)', background: 'rgba(94,106,210,0.08)' }}>
                  {parsed.nonTraditionalReason}
                </p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-section">
              <p className="text-heading">Work history</p>
              {parsed.workHistory?.length > 0 ? (
                <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                  {parsed.workHistory.map((job, index) => (
                    <article key={index} className="surface-row" style={{ padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <p style={{ margin: 0, color: 'var(--color-snow)', fontSize: 14, fontWeight: 510 }}>{job.role}</p>
                          <p style={{ margin: '3px 0 0', color: 'var(--color-cyan)', fontSize: 12 }}>{job.company}</p>
                        </div>
                        {job.years && <span className="text-mono" style={{ color: 'var(--color-slate)', fontSize: 12 }}>{job.years}y</span>}
                      </div>
                      {job.highlights?.length > 0 && (
                        <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--color-fog)', fontSize: 13, lineHeight: 1.6 }}>
                          {job.highlights.map((highlight, i) => <li key={i}>{highlight}</li>)}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              ) : <p className="text-body" style={{ marginTop: 10 }}>No work history available.</p>}
            </div>
          </section>

          <section className="panel">
            <div className="panel-section">
              <p className="text-heading">Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {parsed.skills?.length > 0 ? parsed.skills.map((skill, i) => <SkillChip key={i} label={skill} variant="outline" />) : <p className="text-body">No skills parsed.</p>}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'grid', gap: 18 }}>
          <section className="panel">
            <div className="panel-section">
              <p className="text-heading">Category match breakdown</p>
              <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                {categories.map(({ label, key }) => <ProgressBar key={key} label={label} value={categoryScores[key] ?? 0} animate />)}
              </div>
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {scores.strengthSummary && (
              <div className="surface-row" style={{ padding: 14, borderColor: 'rgba(39,166,68,0.28)' }}>
                <p className="text-caption" style={{ color: 'var(--color-emerald)' }}>Why they fit</p>
                <p className="text-body" style={{ fontSize: 13, marginTop: 8 }}>{scores.strengthSummary}</p>
              </div>
            )}
            {scores.gapSummary && (
              <div className="surface-row" style={{ padding: 14, borderColor: 'rgba(214,166,58,0.28)' }}>
                <p className="text-caption" style={{ color: 'var(--accent-amber)' }}>Gaps to explore</p>
                <p className="text-body" style={{ fontSize: 13, marginTop: 8 }}>{scores.gapSummary}</p>
              </div>
            )}
          </section>

          {(scores.matchedMustHave?.length > 0 || scores.missingMustHave?.length > 0) && (
            <section className="panel">
              <div className="panel-section">
                <p className="text-heading">Requirement evidence</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {scores.matchedMustHave?.map((skill, i) => <SkillChip key={`m-${i}`} label={skill} variant="matched" />)}
                  {scores.missingMustHave?.map((skill, i) => <SkillChip key={`x-${i}`} label={skill} variant="missing" />)}
                  {scores.matchedNiceToHave?.map((skill, i) => <SkillChip key={`n-${i}`} label={skill} variant="teal" />)}
                </div>
              </div>
            </section>
          )}

          <button className="btn btn-primary w-full" onClick={() => generateInterviewQuestions(candidate)} disabled={isGenerating}>
            {isGenerating ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : hasQuestions ? <><MessageSquare size={15} /> View interview guide</> : <><MessageSquare size={15} /> Generate interview guide</>}
          </button>
        </div>
      )}
    </div>
  );
}
