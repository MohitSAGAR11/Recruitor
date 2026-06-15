import React, { useEffect } from 'react';
import { AlertTriangle, Clock, FileText, Trash2, Users, X } from 'lucide-react';
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
    savedSessions,
    sessionsLoading,
    fetchSessions,
    loadSession,
    deleteSession,
    setShowHistory,
    currentSessionId,
  } = useRecruitStore();

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return (
    <div
      onClick={() => setShowHistory(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(8,9,10,0.72)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-in-right"
        style={{
          width: 'min(460px, 100%)',
          height: '100%',
          background: 'var(--color-charcoal)',
          borderLeft: '1px solid var(--color-graphite)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header style={{ padding: 20, borderBottom: '1px solid var(--color-graphite)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" />Archive</p>
            <h2 className="text-heading" style={{ marginTop: 8 }}>Screening history</h2>
            <p className="text-body" style={{ fontSize: 12, marginTop: 2 }}>Open a previous ranked run.</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setShowHistory(false)} title="Close history">
            <X size={15} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gap: 10, alignContent: 'start' }}>
          {sessionsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="surface-row skeleton" style={{ height: 86 }} />
            ))
          ) : savedSessions.length === 0 ? (
            <div className="empty-state">
              <FileText size={28} />
              <div>
                <p className="text-heading">No saved screenings</p>
                <p className="text-body" style={{ fontSize: 13, marginTop: 4 }}>Completed runs will appear here automatically.</p>
              </div>
            </div>
          ) : (
            savedSessions.map((session) => (
              <article
                key={session.id}
                onClick={() => loadSession(session.id)}
                className="surface-row"
                style={{
                  padding: 14,
                  cursor: 'pointer',
                  background: session.id === currentSessionId ? 'rgba(94,106,210,0.12)' : 'var(--color-obsidian)',
                  borderColor: session.id === currentSessionId ? 'rgba(94,106,210,0.32)' : 'var(--color-graphite)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, color: 'var(--color-snow)', fontSize: 14, fontWeight: 510, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.title || 'Untitled role'}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 9, color: 'var(--color-fog)', fontSize: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={12} />{session.candidate_count} candidates</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} />{timeAgo(session.created_at)}</span>
                      {session.bias_detected && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--accent-amber)' }}><AlertTriangle size={12} />bias flagged</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    title="Delete screening"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
