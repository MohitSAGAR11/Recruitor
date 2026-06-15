import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore.js';

export default function AuthScreen() {
  const { login, signup, authLoading, authError, clearAuthError } = useAuthStore();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'login') await login(email.trim(), password);
    else await signup(email.trim(), password, name.trim());
  };

  const switchMode = (nextMode) => {
    clearAuthError();
    setMode(nextMode);
  };

  return (
    <main
      className="app-main"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <section
        className="animate-fade-in"
        style={{
          width: 'min(100%, 960px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 420px)',
          gap: 24,
          alignItems: 'stretch',
        }}
      >
        <div className="panel" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 480 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, background: 'var(--color-snow)', color: 'var(--color-onyx)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-berkeley-mono)', fontSize: 13, fontWeight: 500 }}>
                RA
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--color-snow)', fontSize: 15, fontWeight: 510 }}>RecruitAI</p>
                <p className="text-mono" style={{ margin: '2px 0 0', color: 'var(--color-slate)', fontSize: 11 }}>SCREENING.OS</p>
              </div>
            </div>

            <p className="eyebrow"><span className="eyebrow-dot" />AI hiring command deck</p>
            <h1 className="text-display" style={{ maxWidth: 520 }}>Run structured candidate reviews without losing signal.</h1>
            <p className="text-body" style={{ maxWidth: 560, marginTop: 16 }}>
              Parse role briefs, intake CVs, score candidates, inspect bias signals, and generate interview guides in one dense workflow.
            </p>
          </div>

          <div className="metric-grid" style={{ marginTop: 32 }}>
            <div className="metric">
              <p className="metric-label">Workflow</p>
              <p className="metric-value">5 stages</p>
            </div>
            <div className="metric">
              <p className="metric-label">Batch size</p>
              <p className="metric-value">50 CVs</p>
            </div>
            <div className="metric">
              <p className="metric-label">Output</p>
              <p className="metric-value">Ranked kit</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="panel" style={{ padding: 28, alignSelf: 'center' }}>
          <p className="eyebrow"><span className="eyebrow-dot" />{mode === 'login' ? 'Resume workspace' : 'Create workspace'}</p>
          <h2 className="text-title" style={{ fontSize: 28, marginTop: 10 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-body" style={{ marginTop: 8, marginBottom: 24 }}>
            {mode === 'login' ? 'Sign in to open saved screening runs.' : 'Save every review and interview guide.'}
          </p>

          <div style={{ display: 'grid', gap: 12 }}>
            {mode === 'signup' && (
              <label className="surface-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
                <User size={15} color="var(--color-fog)" />
                <input className="input" style={{ boxShadow: 'none', background: 'transparent', paddingLeft: 0 }} placeholder="Full name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
            )}
            <label className="surface-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
              <Mail size={15} color="var(--color-fog)" />
              <input className="input" style={{ boxShadow: 'none', background: 'transparent', paddingLeft: 0 }} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label className="surface-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
              <Lock size={15} color="var(--color-fog)" />
              <input className="input" style={{ boxShadow: 'none', background: 'transparent', paddingLeft: 0 }} type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </label>
          </div>

          {authError && (
            <div className="surface-row" style={{ marginTop: 12, padding: 12, color: 'var(--color-crimson)', background: 'rgba(235,87,87,0.08)', borderColor: 'rgba(235,87,87,0.28)', fontSize: 13 }}>
              {authError}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={authLoading} style={{ marginTop: 18 }}>
            {authLoading ? <><Loader2 size={15} className="animate-spin" /> Please wait...</> : <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={15} /></>}
          </button>

          <div style={{ marginTop: 18, color: 'var(--color-fog)', fontSize: 13, textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} style={{ color: 'var(--color-indigo)', background: 'transparent', fontWeight: 510 }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
