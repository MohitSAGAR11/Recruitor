import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AlertCircle, CheckCircle2, ChevronRight, FileText, Loader2, Upload, Users, X } from 'lucide-react';
import Header from '../layout/Header.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusIcon({ status }) {
  if (status === 'success') return <CheckCircle2 size={14} color="var(--color-emerald)" />;
  if (status === 'failed') return <AlertCircle size={14} color="var(--color-crimson)" />;
  if (status === 'parsing') return <Loader2 size={14} className="animate-spin" color="var(--color-indigo)" />;
  return <FileText size={14} color="var(--color-fog)" />;
}

export default function Step2_CVUpload() {
  const { uploadedFiles, setUploadedFiles, parsedCandidates, parseCVBatch, loading, loadingMessage, loadDemoCVs, scoreCandidates } = useRecruitStore();

  const isParsing = loading && loadingMessage?.includes('CVs');
  const hasFiles = uploadedFiles.length > 0;
  const hasParsed = parsedCandidates.length > 0;
  const successCount = parsedCandidates.filter((c) => c.status === 'success').length;
  const successRate = hasParsed ? Math.round((successCount / parsedCandidates.length) * 100) : 0;

  const onDrop = useCallback((accepted) => {
    setUploadedFiles([...uploadedFiles, ...accepted.filter((file) => !uploadedFiles.some((existing) => existing.name === file.name))]);
  }, [uploadedFiles, setUploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 50,
  });

  const removeFile = (name) => setUploadedFiles(uploadedFiles.filter((file) => file.name !== name));

  return (
    <div className="stage">
      <Header
        title="Intake candidate CVs"
        subtitle="RUN-02 / CANDIDATE INTAKE"
        description="Upload a batch of CVs, parse them into candidate profiles, then start the ranked evaluation pass."
      />

      <div className="stage-grid">
        <section className="panel">
          {!hasParsed && (
            <div className="panel-section">
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
                <input {...getInputProps()} />
                <Upload size={24} />
                <div>
                  <p className="text-heading">{isDragActive ? 'Drop CV files here' : 'Upload CV files'}</p>
                  <p className="text-body" style={{ fontSize: 13, marginTop: 4 }}>PDF or DOCX. Up to 50 files per screening run.</p>
                </div>
                {hasFiles && <span className="badge badge-primary">{uploadedFiles.length} selected</span>}
              </div>
            </div>
          )}

          {hasFiles && !hasParsed && (
            <div className="panel-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p className="text-heading">Selected files</p>
                <span className="text-mono" style={{ color: 'var(--color-slate)', fontSize: 12 }}>{uploadedFiles.length}/50</span>
              </div>
              <div style={{ display: 'grid', gap: 8, maxHeight: 330, overflowY: 'auto' }}>
                {uploadedFiles.map((file) => (
                  <div key={file.name} className="surface-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10 }}>
                    <FileText size={15} color="var(--color-indigo)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: 'var(--color-mist)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                      <p className="text-mono" style={{ margin: '2px 0 0', color: 'var(--color-slate)', fontSize: 11 }}>{formatBytes(file.size)}</p>
                    </div>
                    <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={() => removeFile(file.name)} title="Remove file">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasParsed && (
            <div className="panel-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p className="text-heading">Parsed candidates</p>
                  <p className="text-body" style={{ fontSize: 12, marginTop: 2 }}>{successCount} of {parsedCandidates.length} profiles ready</p>
                </div>
                <span className="badge badge-green">{successRate}% success</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-graphite)', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ width: `${successRate}%`, height: '100%', background: 'var(--color-emerald)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
                {parsedCandidates.map((candidate, index) => (
                  <div key={`${candidate.filename}-${index}`} className="surface-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10 }}>
                    <StatusIcon status={candidate.status} />
                    <span style={{ flex: 1, minWidth: 0, color: 'var(--color-mist)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {candidate.parsed?.name || candidate.filename}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel-section">
            <div className="button-row">
              <button className="btn btn-ghost" onClick={loadDemoCVs}>
                <Users size={15} /> Load demo candidates
              </button>
              {!hasParsed && hasFiles && (
                <button className="btn btn-primary" onClick={() => parseCVBatch(uploadedFiles)} disabled={isParsing}>
                  {isParsing ? <><Loader2 size={15} className="animate-spin" /> Parsing...</> : <>Parse {uploadedFiles.length} CVs</>}
                </button>
              )}
              {hasParsed && (
                <button className="btn btn-primary" onClick={scoreCandidates} style={{ flex: 1 }}>
                  Score candidates ({successCount}) <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-section">
            <p className="eyebrow"><span className="eyebrow-dot" />Intake status</p>
            <div className="metric-grid" style={{ marginTop: 16 }}>
              <div className="metric"><p className="metric-label">Selected</p><p className="metric-value">{uploadedFiles.length}</p></div>
              <div className="metric"><p className="metric-label">Parsed</p><p className="metric-value">{parsedCandidates.length}</p></div>
              <div className="metric"><p className="metric-label">Ready</p><p className="metric-value">{successCount}</p></div>
            </div>
          </div>
          <div className="panel-section">
            <p className="text-heading">Next checkpoint</p>
            <p className="text-body" style={{ marginTop: 8 }}>
              The scoring run only uses successfully parsed CVs. Failed files stay visible here so the review trail is clear.
            </p>
          </div>
          {!hasFiles && !hasParsed && (
            <div className="empty-state" style={{ minHeight: 260 }}>
              <Upload size={28} />
              <div>
                <p className="text-heading">No candidate files yet</p>
                <p className="text-body" style={{ fontSize: 13, marginTop: 4 }}>Drop CVs on the intake panel or load the demo set.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
