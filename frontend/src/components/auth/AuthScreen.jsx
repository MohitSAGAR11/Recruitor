import React, { useState } from 'react';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore.js';

export default function AuthScreen() {
  const { login, signup, authLoading, authError, clearAuthError } = useAuthStore();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'login') await login(email.trim(), password);
    else await signup(email.trim(), password, name.trim());
  };

  const switchMode = (m) => { clearAuthError(); setMode(m); };

  const inputWrap = {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-md)', padding: '12px 14px',
  };
  const inputStyle = {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'var(--font-display)',
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="animate-fade-in" style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--glass-shadow-lg)',
        padding: '36px 32px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: 'linear-gradient(135deg, #8B7CF6, #6B5BD4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', boxShadow: '0 0 20px rgba(139,124,246,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>🧑‍💼</div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em' }}>RecruitAI</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              AI-Powered Screening
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: 22, marginBottom: 4 }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
          {mode === 'login' ? 'Sign in to access your screenings.' : 'Save and revisit every screening you run.'}
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <div style={inputWrap}>
              <User size={16} color="var(--text-muted)" />
              <input style={inputStyle} placeholder="Full name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div style={inputWrap}>
            <Mail size={16} color="var(--text-muted)" />
            <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div style={inputWrap}>
            <Lock size={16} color="var(--text-muted)" />
            <input style={inputStyle} type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {authError && (
            <div style={{
              fontSize: '0.78rem', color: 'var(--accent-red)',
              background: 'var(--accent-red-dim)', border: '1px solid rgba(255,107,107,0.2)',
              borderRadius: 'var(--radius-sm)', padding: '9px 12px',
            }}>
              {authError}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={authLoading}
            style={{ justifyContent: 'center', gap: 8, marginTop: 6, padding: '12px' }}>
            {authLoading ? <><Loader2 size={16} className="animate-spin" /> Please wait…</>
              : <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
