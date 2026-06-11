import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, X, CheckCircle2, AlertCircle, Loader2, Upload, ChevronRight, Users } from 'lucide-react';
import Header from '../layout/Header.jsx';
import useRecruitStore from '../../store/useRecruitStore.js';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_ICON = {
  pending:  null,
  parsing:  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} color="var(--accent-primary)" />,
  success:  <CheckCircle2 size={13} color="var(--accent-green)" />,
  failed:   <AlertCircle size={13} color="var(--accent-red)" />,
};

export default function Step2_CVUpload() {
  const {
    uploadedFiles, setUploadedFiles,
    parsedCandidates, parseCVBatch,
    loading, loadingMessage,
    loadDemoCVs, scoreCandidates,
  } = useRecruitStore();

  const isParsing   = loading && loadingMessage?.includes('CVs');
  const hasFiles    = uploadedFiles.length > 0;
  const hasParsed   = parsedCandidates.length > 0;
  const successCount = parsedCandidates.filter((c) => c.status === 'success').length;
  const successRate  = hasParsed ? Math.round((successCount / parsedCandidates.length) * 100) : 0;

  const onDrop = useCallback((accepted) => {
    setUploadedFiles([...uploadedFiles, ...accepted.filter(
      (f) => !uploadedFiles.some((e) => e.name === f.name)
    )]);
  }, [uploadedFiles, setUploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 50,
  });

  const removeFile = (name) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.name !== name));
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }} className="animate-fade-in">
      <Header title="Upload Candidate CVs" subtitle="Step 2 — CV Upload" />
      <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '0.95rem', lineHeight: 1.7 }}>
        Drop up to 50 CV files, or use the demo shortcut to skip uploads entirely.
      </p>

      {/* Dropzone */}
      {!hasParsed && (
        <div
          {...getRootProps()}
          style={{
            border: `1px dashed ${isDragActive ? 'rgba(139,124,246,0.7)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 'var(--radius-lg)',
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            cursor: 'pointer',
            background: isDragActive
              ? 'rgba(139,124,246,0.08)'
              : 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'all var(--transition-base)',
            marginBottom: 24,
            boxShadow: isDragActive
              ? '0 0 0 3px rgba(139,124,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
              : 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <input {...getInputProps()} />
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: isDragActive
              ? 'rgba(139,124,246,0.15)'
              : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-base)',
          }}>
            <Upload
              size={22}
              color={isDragActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: isDragActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: 4,
            }}>
              {isDragActive ? 'Drop files here!' : 'Drop CV files here'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {isDragActive ? '' : '.pdf or .docx — up to 50 files'}
            </p>
          </div>
          {hasFiles && (
            <span className="badge badge-primary">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      )}

      {/* File grid */}
      {hasFiles && !hasParsed && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 8,
          marginBottom: 24,
        }}>
          {uploadedFiles.map((file) => (
            <div
              key={file.name}
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'border-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <FileText size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 1 }}>{formatBytes(file.size)}</div>
              </div>
              <button
                onClick={() => removeFile(file.name)}
                style={{
                  color: 'var(--text-muted)',
                  background: 'none',
                  flexShrink: 0,
                  padding: 4,
                  borderRadius: 4,
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Parsed candidates grid */}
      {hasParsed && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {successCount} of {parsedCandidates.length} candidates parsed
            </p>
            <span className="badge badge-green">{successRate}% success</span>
          </div>

          {/* Progress bar */}
          <div style={{
            height: 4,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 100,
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            <div
              style={{
                height: '100%',
                width: `${successRate}%`,
                background: 'linear-gradient(90deg, var(--accent-green), var(--accent-teal))',
                borderRadius: 100,
                transition: 'width 0.6s ease',
                boxShadow: '0 0 10px rgba(74,222,128,0.4)',
              }}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 8,
          }}>
            {parsedCandidates.map((c, i) => (
              <div
                key={i}
                style={{
                  background: c.status === 'success'
                    ? 'rgba(74,222,128,0.05)'
                    : c.status === 'failed'
                    ? 'rgba(255,107,107,0.05)'
                    : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: `1px solid ${
                    c.status === 'success'
                      ? 'rgba(74,222,128,0.15)'
                      : c.status === 'failed'
                      ? 'rgba(255,107,107,0.15)'
                      : 'rgba(255,255,255,0.07)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FileText
                  size={14}
                  color={c.status === 'success' ? 'var(--accent-green)' : 'var(--text-muted)'}
                  style={{ flexShrink: 0 }}
                />
                <span style={{
                  fontSize: '0.75rem',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'var(--text-secondary)',
                }}>
                  {c.parsed?.name || c.filename}
                </span>
                {STATUS_ICON[c.status]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={loadDemoCVs}>
          <Users size={15} /> Load 15 Demo CVs
        </button>

        {!hasParsed && hasFiles && (
          <button
            className="btn btn-ghost"
            onClick={() => parseCVBatch(uploadedFiles)}
            disabled={isParsing || !hasFiles}
          >
            {isParsing ? (
              <><Loader2 size={14} className="animate-spin" /> Parsing…</>
            ) : (
              <>Parse All CVs ({uploadedFiles.length})</>
            )}
          </button>
        )}

        {hasParsed && (
          <button
            className="btn btn-primary"
            onClick={scoreCandidates}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Score Candidates ({successCount}) <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
