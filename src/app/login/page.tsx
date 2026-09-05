'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, ArrowRight, Eye, EyeOff, Activity,
  Globe2, Zap, Lock,
} from 'lucide-react';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const router  = useRouter();
  const [tab,   setTab]   = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [name,  setName]  = useState('');
  const [org,   setOrg]   = useState('');
  const [show,  setShow]  = useState(false);
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState('');

  const demo = () => {
    setBusy(true);
    // Instant demo — no server call needed
    setTimeout(() => router.push('/dashboard'), 420);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email.includes('@')) { setErr('Enter a valid email address.'); return; }
    if (pass.length < 6)      { setErr('Password must be at least 6 characters.'); return; }
    if (tab === 'signup' && !name.trim()) { setErr('Full name is required.'); return; }
    setBusy(true);
    // Simulate auth — all access routes to dashboard in this prototype
    setTimeout(() => router.push('/dashboard'), 600);
  };

  return (
    <div className="login-shell">
      {/* ── Left panel — branding ── */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <ShieldCheck size={28} strokeWidth={1.8} />
          </div>
          <h1 className="login-product">SwasthyaGrid</h1>
          <p className="login-tagline">BRICS Healthcare Resilience Operations</p>

          <div className="login-features">
            <div className="login-feature">
              <Globe2 size={15} />
              <span>55 PHCs across 5 BRICS nations</span>
            </div>
            <div className="login-feature">
              <Activity size={15} />
              <span>Real-time bed, stock &amp; workforce signals</span>
            </div>
            <div className="login-feature">
              <Zap size={15} />
              <span>AI-powered redistribution &amp; forecasting</span>
            </div>
            <div className="login-feature">
              <Lock size={15} />
              <span>Federated learning — data stays local</span>
            </div>
          </div>

          <div className="login-disclaimer">
            SIMULATED PROTOTYPE · No real clinical data · Not connected to government systems
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="login-form-panel">
        <div className="login-form-wrap">
          {/* Tabs */}
          <div className="login-tabs">
            <button
              className={'login-tab' + (tab === 'login'  ? ' active' : '')}
              onClick={() => { setTab('login');  setErr(''); }}
            >Sign in</button>
            <button
              className={'login-tab' + (tab === 'signup' ? ' active' : '')}
              onClick={() => { setTab('signup'); setErr(''); }}
            >Create account</button>
          </div>

          <div className="login-form-head">
            <h2>{tab === 'login' ? 'Welcome back' : 'Join SwasthyaGrid'}</h2>
            <p>{tab === 'login'
              ? 'Sign in to access the BRICS healthcare command center.'
              : 'Create your operator account to get started.'
            }</p>
          </div>

          {/* Demo access — most prominent CTA */}
          <button className="login-demo-btn" onClick={demo} disabled={busy}>
            <Zap size={15} />
            {busy ? 'Launching…' : 'Instant demo access — no account needed'}
            <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
          </button>

          <div className="login-divider"><span>or sign in with your account</span></div>

          {/* Form */}
          <form onSubmit={submit} noValidate>
            {tab === 'signup' && (
              <>
                <div className="login-field">
                  <label htmlFor="lg-name">Full name</label>
                  <input
                    id="lg-name" type="text" autoComplete="name"
                    placeholder="Dr. Priya Sharma"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="lg-org">Organisation</label>
                  <input
                    id="lg-org" type="text" autoComplete="organization"
                    placeholder="District Health Office, Sonbhadra"
                    value={org} onChange={e => setOrg(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="login-field">
              <label htmlFor="lg-email">Email</label>
              <input
                id="lg-email" type="email" autoComplete="email"
                placeholder="operator@health.gov"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label htmlFor="lg-pass">Password</label>
              <div className="login-pass-wrap">
                <input
                  id="lg-pass"
                  type={show ? 'text' : 'password'}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={pass} onChange={e => setPass(e.target.value)}
                />
                <button
                  type="button"
                  className="login-pass-eye"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(s => !s)}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {err && <div className="login-error">{err}</div>}

            {tab === 'login' && (
              <div className="login-forgot">
                <button type="button" className="login-link">Forgot password?</button>
              </div>
            )}

            <button className="login-submit" type="submit" disabled={busy}>
              {busy
                ? 'Please wait…'
                : tab === 'login' ? 'Sign in to command center' : 'Create account'
              }
              <ArrowRight size={14} style={{ marginLeft: 6 }} />
            </button>
          </form>

          <div className="login-switch">
            {tab === 'login'
              ? <>No account? <button className="login-link" onClick={() => setTab('signup')}>Create one</button></>
              : <>Already registered? <button className="login-link" onClick={() => setTab('login')}>Sign in</button></>
            }
          </div>

          <div className="login-footer-note">
            This is a prototype system. All data is simulated and does not represent real patients, facilities, or government records.
          </div>
        </div>
      </div>
    </div>
  );
}
