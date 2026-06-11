import React, { useState } from 'react';
import { MapPin, Briefcase, MessageSquare, Loader2, Mail, Phone, User, Award } from 'lucide-react';
import ScoreRing from './ScoreRing.jsx';
import ProgressBar from './ProgressBar.jsx';
import SkillChip from './SkillChip.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

export default function CandidateDetail({ candidate }) {
  const { generateInterviewQuestions, interviewQuestions, loading, loadingMessage } = useRecruitStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (!candidate) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 14,
        color: 'var(--text-muted)',
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
        }}>👤</div>
        <p style={{ fontSize: '0.88rem' }}>Select a candidate to view details</p>
      </div>
    );
  }

  const name = candidate.name || candidate.parsed?.name || 'Unknown';
  const parsed = candidate.parsed || {};
  const scores = candidate.scores || {};
  const overallScore = scores.overallScore ?? 0;
  const isGenerating = loading && loadingMessage?.includes(name);
  const hasQuestions = !!interviewQuestions[name];

  const categoryScores = scores.categoryScores || {};
  const categories = [
    { label: 'Hard Skills',      key: 'hardSkills'      },
    { label: 'Soft Skills',      key: 'softSkills'      },
    { label: 'Experience',       key: 'experience'      },
    { label: 'Domain Knowledge', key: 'domainKnowledge' },
    { label: 'Education',        key: 'education'       },
  ];

  return (
    <div style={{ padding: '28px 28px 40px', overflowY: 'auto', height: '100%' }} className="animate-fade-in">

      {/* ── Hero Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 20,
        marginBottom: 24,
        padding: '20px 22px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <ScoreRing score={overallScore} size={80} strokeWidth={6} animate />
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 4,
          }}>
            {name}
          </h2>
          {parsed.currentRole && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              marginBottom: 6,
            }}>
              <Briefcase size={12} />
              {parsed.currentRole}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, rowGap: 4 }}>
            {parsed.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <MapPin size={11} /> {parsed.location}
              </span>
            )}
            {parsed.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <Mail size={11} /> {parsed.email}
              </span>
            )}
            {parsed.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <Phone size={11} /> {parsed.phone}
              </span>
            )}
          </div>
          {parsed.totalYearsExperience > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span className="badge badge-muted">{parsed.totalYearsExperience} yrs exp</span>
              {parsed.careerTrajectory && (
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                  {parsed.careerTrajectory}
                </span>
              )}
              {parsed.nonTraditionalBackground && (
                <span className="badge badge-teal">Non-traditional</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: 24,
        gap: 4,
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <User size={13} /> Profile & Overview
        </button>
        <button
          onClick={() => setActiveTab('evaluation')}
          className={`tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}
        >
          <Award size={13} /> Fit & Evaluation
        </button>
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Summary card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
          }}>
            <p className="text-caption" style={{ marginBottom: 14 }}>Candidate Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 14 }}>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 4 }}>Experience</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{parsed.totalYearsExperience || 0} yrs</div>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 4 }}>Career Path</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {parsed.careerTrajectory || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 4 }}>Background</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {parsed.nonTraditionalBackground ? 'Non-Traditional' : 'Traditional'}
                </div>
              </div>
            </div>
            {parsed.nonTraditionalBackground && parsed.nonTraditionalReason && (
              <div style={{
                marginTop: 14,
                padding: '10px 12px',
                background: 'rgba(139,124,246,0.08)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '2px solid var(--accent-primary)',
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <strong>Note: </strong>{parsed.nonTraditionalReason}
                </p>
              </div>
            )}
          </div>

          {/* Work History timeline */}
          <div>
            <p className="text-caption" style={{ marginBottom: 18 }}>Work History</p>
            {parsed.workHistory && parsed.workHistory.length > 0 ? (
              <div style={{ paddingLeft: 16, borderLeft: '2px solid rgba(255,255,255,0.07)', marginLeft: 6 }}>
                {parsed.workHistory.map((job, idx) => (
                  <div key={idx} style={{ position: 'relative', marginBottom: 22 }}>
                    <div style={{
                      position: 'absolute',
                      left: -23,
                      top: 5,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--accent-primary)',
                      border: '2px solid var(--bg-base)',
                      boxShadow: '0 0 8px rgba(139,124,246,0.5)',
                    }} />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 2,
                      gap: 8,
                    }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{job.role}</h4>
                      {job.years && (
                        <span style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          flexShrink: 0,
                        }}>
                          {job.years}y
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600, marginBottom: 6 }}>
                      {job.company}
                    </p>
                    {job.highlights?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 14, fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                        {job.highlights.map((h, i) => (
                          <li key={i} style={{ marginBottom: 2 }}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No work history available.</p>
            )}
          </div>

          {/* Education */}
          <div>
            <p className="text-caption" style={{ marginBottom: 14 }}>Education</p>
            {parsed.education && parsed.education.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {parsed.education.map((edu, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>{edu.degree}</h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{edu.institution}</p>
                    </div>
                    {edu.year && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {edu.year}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No education history available.</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <p className="text-caption" style={{ marginBottom: 12 }}>Extracted Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {parsed.skills && parsed.skills.length > 0 ? (
                parsed.skills.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.72rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-secondary)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills parsed.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Evaluation ── */}
      {activeTab === 'evaluation' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Category scores */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
          }}>
            <p className="text-caption" style={{ marginBottom: 16 }}>Category Match Breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categories.map(({ label, key }) => (
                <ProgressBar key={key} label={label} value={categoryScores[key] ?? 0} animate />
              ))}
            </div>
          </div>

          {/* Strength & Gap cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {scores.strengthSummary && (
              <div style={{
                background: 'rgba(74,222,128,0.05)',
                border: '1px solid rgba(74,222,128,0.15)',
                borderLeft: '3px solid var(--accent-green)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                <p style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--accent-green)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 8,
                }}>
                  ✦ Why they fit
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {scores.strengthSummary}
                </p>
              </div>
            )}
            {scores.gapSummary && (
              <div style={{
                background: 'rgba(245,166,35,0.05)',
                border: '1px solid rgba(245,166,35,0.15)',
                borderLeft: '3px solid var(--accent-amber)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                <p style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--accent-amber)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 8,
                }}>
                  ⚠ Gaps to explore
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {scores.gapSummary}
                </p>
              </div>
            )}
          </div>

          {/* Requirements checklist */}
          {(scores.matchedMustHave?.length > 0 || scores.missingMustHave?.length > 0) && (
            <div>
              <p className="text-caption" style={{ marginBottom: 12 }}>Must-Have Requirements</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {scores.matchedMustHave?.map((s, i) => <SkillChip key={i} label={s} variant="matched" />)}
                {scores.missingMustHave?.map((s, i) => <SkillChip key={i} label={s} variant="missing" />)}
              </div>
              {scores.matchedNiceToHave?.length > 0 && (
                <>
                  <p className="text-caption" style={{ marginBottom: 8 }}>Nice-to-Have (matched)</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {scores.matchedNiceToHave.map((s, i) => <SkillChip key={i} label={s} variant="teal" />)}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Interview focus */}
          {scores.interviewFocus?.length > 0 && (
            <div>
              <p className="text-caption" style={{ marginBottom: 10 }}>Interview Focus Areas</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {scores.interviewFocus.map((topic, i) => (
                  <span key={i} className="badge badge-primary">Probe: {topic}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', gap: 8, marginTop: 4 }}
            onClick={() => generateInterviewQuestions(candidate)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <><Loader2 size={16} className="animate-spin" /> Generating…</>
            ) : hasQuestions ? (
              <><MessageSquare size={16} /> View Interview Guide</>
            ) : (
              <><MessageSquare size={16} /> Generate Interview Questions →</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
