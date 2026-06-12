import React, { useEffect } from 'react';
import { X, Clock, Users, AlertTriangle, Trash2, FileText } from 'lucide-react';
import useRecruitStore from '../store/useRecruitStore.js';

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HistoryPanel() {
  const {
    savedSessions, sessionsLoading, fetchSessions,
    loadSession, deleteSession, setShowHistory, currentSessionId,
  } = useRecruitStore();

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return (
    <div
      onClick={() => setShowHistory(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(4,4,14,0.6)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          width: 'min(460px, 100%)', height: '100%',
          background: 'rgba(13,13,32,0.92)',
          backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
          borderLeft: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Screenings</h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Past runs — click to reopen
            </p>
          </div>
          <button onClick={() => setShowHistory(false)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessionsLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: 40 }}>Loading…</p>
          ) : savedSessions.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: '0.88rem' }}>No screenings yet.</p>
              <p style={{ fontSize: '0.76rem', marginTop: 4 }}>Run one and it'll appear here automatically.</p>
            </div>
          ) : (
            savedSessions.map((s) => (
              <div key={s.id}
                onClick={() => loadSession(s.id)}
                style={{
                  background: s.id === currentSessionId ? 'rgba(139,124,246,0.12)' : 'rgba(255,255,255,0.03)',
                  border: s.id === currentSessionId ? '1px solid rgba(139,124,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-md)', padding: '14px 16px', cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => { if (s.id !== currentSessionId) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { if (s.id !== currentSessionId) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '-0.01em', flex: 1 }}>
                    {s.title || 'Untitled role'}
                  </h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {s.candidate_count} candidates</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {timeAgo(s.created_at)}</span>
                  {s.bias_detected && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-amber)' }}>
                      <AlertTriangle size={11} /> bias flagged
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
