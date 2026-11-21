/**
 * SignupPage — /signup — V5.1 Gen Z theme
 *
 * Calls existing authApi.signup({ name, username, password }) unchanged.
 * Social buttons trigger toast only (no auth calls). Wire real OAuth in socialAuth.ts.
 * Password strength bar: Weak sauce → Getting there → Solid → Bulletproof.
 */
import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sparkles, Check } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthShell } from './AuthShell';
import { triggerSocialAuth } from './socialAuth';
import '../../landing/tokens.css';

/* ─── Input style ─────────────────────────────────────────────────────────── */
const inputCls = (hasError: boolean) =>
  [
    'w-full h-[52px] px-4 rounded-2xl border text-base font-sans',
    'bg-[var(--landing-surface-1)] text-[var(--landing-text-primary)]',
    'placeholder:text-[var(--landing-text-secondary)] placeholder:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)]',
    'transition-colors',
    hasError
      ? 'border-red-500/60 focus:border-red-500'
      : 'border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] focus:border-[var(--landing-accent)]/50',
  ].join(' ');

/* ─── Password strength ───────────────────────────────────────────────────── */
type Strength = 0 | 1 | 2 | 3;

const getStrength = (pw: string): Strength => {
  if (!pw) return 0;
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const s = checks.filter(Boolean).length;
  if (s === 1) return 1;
  if (s === 2) return 2;
  if (s === 3) return 3;
  return 3;
};

const STRENGTH_META: Record<Strength, { label: string; color: string; bars: number }> = {
  0: { label: '', color: 'transparent', bars: 0 },
  1: { label: 'weak sauce 😬', color: '#EF4444', bars: 1 },
  2: { label: 'getting there 🤔', color: '#F59E0B', bars: 2 },
  3: { label: 'bulletproof 🔒', color: '#D4FF32', bars: 3 },
};

const StrengthBar: React.FC<{ strength: Strength }> = ({ strength }) => {
  if (strength === 0) return null;
  const meta = STRENGTH_META[strength];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: n <= meta.bars ? meta.color : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <p className="text-xs font-mono" style={{ color: meta.color }} aria-live="polite">
        {meta.label}
      </p>
    </div>
  );
};

/* ─── Social button ───────────────────────────────────────────────────────── */
const SocialBtn: React.FC<{
  provider: 'github' | 'google';
  icon: React.ReactNode;
  label: string;
}> = ({ provider, icon, label }) => (
  <button
    type="button"
    onClick={() => triggerSocialAuth(provider)}
    aria-label={`Continue with ${label} (coming soon)`}
    className="relative flex-1 h-[52px] min-w-0 rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface-1)] hover:border-[var(--landing-border-hover)] hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] text-sm font-medium font-sans flex items-center justify-center gap-2.5 transition-colors interactive-motion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)]"
  >
    <span className="shrink-0 w-5 h-5">{icon}</span>
    <span className="truncate">{label}</span>
    <span className="absolute -top-2 -right-1 landing-sticker bg-[var(--landing-accent)] text-[#090D0F] border-[#090D0F]" style={{ fontSize: '9px', padding: '2px 6px' }}>
      soon
    </span>
  </button>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

/* ─── Component ───────────────────────────────────────────────────────────── */
export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; username?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [validFields, setValidFields] = useState<{ name?: boolean; username?: boolean }>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const strength = getStrength(password);

  /* Validation */
  const validateField = (field: 'name' | 'username' | 'password', val: string) => {
    if (field === 'name') {
      if (!val.trim()) return 'name is required.';
      if (val.trim().length > 25) return 'name must be 25 chars or fewer.';
    }
    if (field === 'username') {
      if (!val.trim()) return 'email is required.';
      if (!/\S+@\S+\.\S+/.test(val)) return "that email doesn't look right.";
    }
    if (field === 'password') {
      if (!val) return 'password is required.';
      if (val.length < 4) return 'password must be at least 4 characters.';
    }
    return undefined;
  };

  const validate = () => {
    const e = {
      name: validateField('name', name),
      username: validateField('username', username),
      password: validateField('password', password),
    };
    const cleaned = Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined));
    setErrors(cleaned);
    if (e.name)     { nameRef.current?.focus();     return false; }
    if (e.username) { usernameRef.current?.focus(); return false; }
    if (e.password) { passwordRef.current?.focus(); return false; }
    return true;
  };

  const handleBlur = (field: 'name' | 'username' | 'password') => {
    const val = field === 'name' ? name : field === 'username' ? username : password;
    const msg = validateField(field, val);
    setErrors((p) => ({ ...p, [field]: msg }));
    if (!msg && val && field !== 'password') setValidFields((p) => ({ ...p, [field]: true }));
  };

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      const data = await authApi.signup({ name: name.trim(), username: username.trim(), password });
      setAuth(data.token, data.user);
      navigate('/projects');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'something went wrong. try a different email.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell serverError={serverError}>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-[32px] tracking-tight text-[var(--landing-text-primary)] leading-tight">
          let's get you started.
        </h1>
        <p className="mt-1 text-sm text-[var(--landing-text-secondary)]">
          build your first app in minutes.
        </p>
      </div>

      {/* Social buttons */}
      <div className="flex gap-3">
        <SocialBtn provider="github" icon={<GitHubIcon />} label="GitHub" />
        <SocialBtn provider="google" icon={<GoogleIcon />} label="Google" />
      </div>

      {/* Divider */}
      <div className="relative flex items-center gap-3" aria-hidden="true">
        <div className="flex-1 h-px bg-[var(--landing-border)]" />
        <span className="font-mono text-[11px] text-[var(--landing-text-secondary)] opacity-60 shrink-0">or use email</span>
        <div className="flex-1 h-px bg-[var(--landing-border)]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full name */}
        <div>
          <label htmlFor="signup-name" className="block text-xs font-semibold font-mono text-[var(--landing-text-secondary)] mb-2 uppercase tracking-wider">
            Full name
          </label>
          <div className="relative">
            <input
              ref={nameRef}
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                if (serverError) setServerError(null);
                setValidFields((p) => ({ ...p, name: false }));
              }}
              onBlur={() => handleBlur('name')}
              placeholder="Alex Mercer"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'signup-name-error' : undefined}
              className={inputCls(Boolean(errors.name))}
              style={{ fontSize: '16px' }}
            />
            {validFields.name && !errors.name && (
              <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--landing-accent)]" aria-hidden="true" />
            )}
          </div>
          {errors.name && (
            <p id="signup-name-error" role="alert" className="mt-1.5 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-xs font-semibold font-mono text-[var(--landing-text-secondary)] mb-2 uppercase tracking-wider">
            Email
          </label>
          <div className="relative">
            <input
              ref={usernameRef}
              id="signup-email"
              name="username"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                if (serverError) setServerError(null);
                setValidFields((p) => ({ ...p, username: false }));
              }}
              onBlur={() => handleBlur('username')}
              placeholder="you@voltrix.ai"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? 'signup-email-error' : undefined}
              className={inputCls(Boolean(errors.username))}
              style={{ fontSize: '16px' }}
            />
            {validFields.username && !errors.username && (
              <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--landing-accent)]" aria-hidden="true" />
            )}
          </div>
          {errors.username && (
            <p id="signup-email-error" role="alert" className="mt-1.5 text-xs text-red-400">{errors.username}</p>
          )}
        </div>

        {/* Password + strength */}
        <div>
          <label htmlFor="signup-password" className="block text-xs font-semibold font-mono text-[var(--landing-text-secondary)] mb-2 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              ref={passwordRef}
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                if (serverError) setServerError(null);
              }}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'signup-password-error' : strength > 0 ? 'signup-strength' : undefined
              }
              className={`${inputCls(Boolean(errors.password))} pr-12`}
              style={{ fontSize: '16px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.password ? (
            <p id="signup-password-error" role="alert" className="mt-1.5 text-xs text-red-400">{errors.password}</p>
          ) : (
            <div id="signup-strength"><StrengthBar strength={strength} /></div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] rounded-[var(--landing-radius-pill)] bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] text-[#090D0F] text-sm font-bold font-sans border border-[#090D0F]/20 shadow-sm interactive-motion disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                setting things up…
              </>
            ) : (
              <>
                create my account
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch link */}
      <p className="mt-5 text-center text-sm text-[var(--landing-text-secondary)]">
        already in?{' '}
        <Link
          to="/login"
          className="text-[var(--landing-text-primary)] font-semibold hover:text-[var(--landing-accent)] transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)] rounded px-0.5"
        >
          log in
        </Link>
      </p>

      {/* Form-side sticker */}
      <div className="hidden min-[400px]:flex justify-end mt-4" aria-hidden="true">
        <span
          className="landing-sticker bg-[var(--landing-accent)] text-[#090D0F] border-[#090D0F]"
          style={{ transform: 'rotate(-2deg)' }}
        >
          no spam, promise 🤝
        </span>
      </div>
    </AuthShell>
  );
};
