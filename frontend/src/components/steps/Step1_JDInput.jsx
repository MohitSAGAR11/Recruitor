import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ChevronRight, FileText, Loader2, Sparkles, Upload } from 'lucide-react';
import Header from '../layout/Header.jsx';
import SkillChip from '../ui/SkillChip.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

const PLACEHOLDER = `Paste the role brief here...

Senior Full Stack Engineer at Nexus Pay
Requirements: React, Node.js, PostgreSQL
Nice to have: TypeScript, AWS
Experience: 5+ years
Context: fintech, payments, distributed systems`;

function RequirementBlock({ title, children }) {
  if (!children) return null;
  return (
    <div className="panel-section">
      <p className="text-caption" style={{ marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  );
}

export default function Step1_JDInput() {
  const { jdRawText, setJdRawText, parsedJD, loading, loadingMessage, parseJD, loadDemoJD, setStep } = useRecruitStore();
  const [uploadedFile, setUploadedFile] = useState(null);
  const isParsing = loading && loadingMessage?.includes('Parsing job');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) setUploadedFile(accepted[0]);
    },
  });

  const handleParse = async () => {
    await parseJD(jdRawText, uploadedFile);
  };

  return (
    <div className="stage">
      <Header
        title="Define the role"
        subtitle="RUN-01 / ROLE BRIEF"
        description="Start with a pasted role brief or a JD file. The parser turns it into structured requirements before candidate intake."
      />

      <div className="stage-grid">
        <section className="panel">
          <div className="panel-section">
            <p className="text-caption" style={{ marginBottom: 10 }}>Job description input</p>
            <textarea className="textarea" placeholder={PLACEHOLDER} value={jdRawText} onChange={(e) => setJdRawText(e.target.value)} />
          </div>

          <div className="panel-section">
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`} style={{ minHeight: 132 }}>
              <input {...getInputProps()} />
              <Upload size={20} />
              {uploadedFile ? (
                <div>
                  <p className="text-heading">{uploadedFile.name}</p>
                  <p className="text-body" style={{ fontSize: 12, marginTop: 3 }}>Ready to parse with the pasted context.</p>
                </div>
              ) : (
                <div>
                  <p className="text-heading">{isDragActive ? 'Drop the JD file' : 'Attach JD file'}</p>
                  <p className="text-body" style={{ fontSize: 12, marginTop: 3 }}>PDF or DOCX, one file maximum.</p>
                </div>
              )}
            </div>
          </div>

          <div className="panel-section">
            <div className="button-row">
              <button className="btn btn-ghost" onClick={loadDemoJD}>
                <Sparkles size={15} /> Load demo
              </button>
              <button className="btn btn-primary" onClick={handleParse} disabled={isParsing || (!jdRawText.trim() && !uploadedFile)} style={{ flex: 1 }}>
                {isParsing ? <><Loader2 size={15} className="animate-spin" /> Parsing...</> : <>Parse role <ChevronRight size={15} /></>}
              </button>
            </div>
          </div>
        </section>

        <aside className="panel">
          {parsedJD ? (
            <>
              <div className="panel-section">
                <p className="eyebrow"><span className="eyebrow-dot" />Parsed brief</p>
                <h2 className="text-title" style={{ fontSize: 24, marginTop: 10 }}>{parsedJD.title || 'Untitled role'}</h2>
                {parsedJD.company && <p className="text-body" style={{ marginTop: 6 }}>{parsedJD.company}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {parsedJD.experienceLevel && <span className="badge badge-primary">{parsedJD.experienceLevel}</span>}
                  {parsedJD.minYearsExperience > 0 && <span className="badge badge-muted">{parsedJD.minYearsExperience}+ years</span>}
                  <span className="badge badge-muted">{parsedJD.hardSkills?.length || 0} skills</span>
                </div>
              </div>

              {parsedJD.summary && (
                <RequirementBlock title="Summary">
                  <p className="text-body">{parsedJD.summary}</p>
                </RequirementBlock>
              )}

              {parsedJD.mustHave?.length > 0 && (
                <RequirementBlock title="Must have">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {parsedJD.mustHave.map((item, i) => <SkillChip key={i} label={item} variant="matched" />)}
                  </div>
                </RequirementBlock>
              )}

              {parsedJD.niceToHave?.length > 0 && (
                <RequirementBlock title="Nice to have">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {parsedJD.niceToHave.map((item, i) => <SkillChip key={i} label={item} variant="outline" />)}
                  </div>
                </RequirementBlock>
              )}

              {parsedJD.hardSkills?.length > 0 && (
                <RequirementBlock title="Hard skills">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {parsedJD.hardSkills.map((skill, i) => <SkillChip key={i} label={skill.skill} variant={skill.required ? 'matched' : 'outline'} />)}
                  </div>
                </RequirementBlock>
              )}

              <div className="panel-section">
                <button className="btn btn-primary w-full" onClick={() => setStep(2)}>
                  Continue to CV intake <ChevronRight size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ minHeight: 520, padding: 24 }}>
              <FileText size={32} />
              <div>
                <p className="text-heading">Parsed role preview</p>
                <p className="text-body" style={{ fontSize: 13, marginTop: 6 }}>Requirements, skills, and seniority appear here after parsing.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
