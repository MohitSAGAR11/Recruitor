import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Loader2, ChevronRight, Sparkles, X } from 'lucide-react';
import Header from '../layout/Header.jsx';
import SkillChip from '../ui/SkillChip.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

export default function Step1_JDInput() {
  const {
    jdRawText, setJdRawText, parsedJD, loading, loadingMessage,
    parseJD, loadDemoJD, setStep,
  } = useRecruitStore();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedChars, setExtractedChars] = useState(null);

  const isParsing = loading && loadingMessage?.includes('Parsing job');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) {
        setUploadedFile(accepted[0]);
        setExtractedChars(null);
      }
    },
  });

  const handleParse = async () => {
    await parseJD(jdRawText, uploadedFile);
  };

  const PLACEHOLDER = `Paste your job description here…\n\nExample:\nSenior Full Stack Engineer at Nexus Pay\nRequirements: React, Node.js, PostgreSQL (required)\nNice to have: TypeScript, AWS\n5+ years experience…`;

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '48px 24px' }} className="animate-fade-in">
      <Header title="Define the Role" subtitle="Step 1 — Job Description" />
      <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '0.95rem', lineHeight: 1.7 }}>
        Paste a job description or upload a file — we'll extract what matters.
      </p>

      {/* Textarea */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          className="input textarea"
          placeholder={PLACEHOLDER}
          value={jdRawText}
          onChange={(e) => setJdRawText(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* File upload zone */}
      <div
        {...getRootProps()}
        style={{
          border: `1px dashed ${isDragActive ? 'rgba(139,124,246,0.7)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive
            ? 'rgba(139,124,246,0.08)'
            : 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'all var(--transition-base)',
          marginBottom: 20,
          boxShadow: isDragActive ? '0 0 0 3px rgba(139,124,246,0.15)' : 'none',
        }}
      >
        <input {...getInputProps()} />
        {uploadedFile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <FileText size={18} color="var(--accent-green)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 600 }}>
              {uploadedFile.name}
            </span>
            {extractedChars !== null && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                — {extractedChars} chars
              </span>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Upload size={20} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.6 }} />
            <span style={{ color: isDragActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
              Drop a .pdf or .docx file, or click to browse
            </span>
          </div>
        )}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn btn-ghost" onClick={loadDemoJD}>
          <Sparkles size={15} /> Load Demo JD
        </button>
        <button
          className="btn btn-primary"
          onClick={handleParse}
          disabled={isParsing || (!jdRawText.trim() && !uploadedFile)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {isParsing ? (
            <><Loader2 size={15} className="animate-spin" /> Parsing…</>
          ) : (
            <>Parse Job Description <ChevronRight size={15} /></>
          )}
        </button>
      </div>

      {/* Parsed JD preview */}
      {parsedJD && (
        <div className="card animate-fade-in" style={{ marginTop: 36 }}>
          {/* JD Header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
              {parsedJD.title}
            </h2>
            {parsedJD.company && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 10 }}>
                {parsedJD.company}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {parsedJD.experienceLevel && (
                <span className="badge badge-primary">{parsedJD.experienceLevel}</span>
              )}
              {parsedJD.minYearsExperience > 0 && (
                <span className="badge badge-muted">{parsedJD.minYearsExperience}+ years</span>
              )}
            </div>
          </div>

          {parsedJD.summary && (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              lineHeight: 1.75,
              marginBottom: 24,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {parsedJD.summary}
            </p>
          )}

          {/* Must-have & Nice-to-have */}
          {(parsedJD.mustHave?.length > 0 || parsedJD.niceToHave?.length > 0) && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              overflow: 'hidden',
            }}>
              {parsedJD.mustHave?.length > 0 && (
                <div style={{ padding: '16px 18px' }}>
                  <p className="text-caption" style={{ marginBottom: 10 }}>Must Have</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {parsedJD.mustHave.map((item, i) => (
                      <SkillChip key={i} label={item} variant="filled" />
                    ))}
                  </div>
                </div>
              )}

              {parsedJD.mustHave?.length > 0 && parsedJD.niceToHave?.length > 0 && (
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 18px' }} />
              )}

              {parsedJD.niceToHave?.length > 0 && (
                <div style={{ padding: '16px 18px' }}>
                  <p className="text-caption" style={{ marginBottom: 10 }}>Nice to Have</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {parsedJD.niceToHave.map((item, i) => (
                      <SkillChip key={i} label={item} variant="outline" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {parsedJD.hardSkills?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p className="text-caption" style={{ marginBottom: 10 }}>Hard Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {parsedJD.hardSkills.map((s, i) => (
                  <SkillChip key={i} label={s.skill} variant={s.required ? 'matched' : 'outline'} />
                ))}
              </div>
            </div>
          )}

          {parsedJD.softSkills?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="text-caption" style={{ marginBottom: 10 }}>Soft Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {parsedJD.softSkills.map((s, i) => (
                  <SkillChip key={i} label={s} variant="outline" />
                ))}
              </div>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setStep(2)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Continue to CV Upload <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
