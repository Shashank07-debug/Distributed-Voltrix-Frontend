/**
 * SignupPage — /signup
 *
 * Calls existing authApi.signup({ name, username, password }) unchanged.
 * Full inline validation, password strength bar, keyboard accessibility,
 * loading state, server-error banner. No confirm-password (not in API schema).
 * No typing animation. 16px min inputs (prevents iOS zoom). 44px min touch targets.
 */
import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import { AuthShell } from './AuthShell';

/* ─── Shared input class builder ─────────────────────────────────────────── */
const inputCls = (hasError: boolean) =>
  [
    'w-full h-11 px-3.5 rounded-xl border text-base text-[#ECECF1]',
    'placeholder:text-[#6B6B76] bg-[#111116]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]',
    'transition-colors',
    hasError
      ? 'border-[#EF4444] focus:border-[#EF4444]'
      : 'border-white/[0.08] focus:border-white/20',
  ].join(' ');

/* ─── Password strength ───────────────────────────────────────────────────── */
type Strength = 'weak' | 'fair' | 'strong';

const getStrength = (pw: string): Strength | null => {
  if (!pw) return null;
  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[0-9]/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
  ];
  const score = checks.filter(Boolean).length;
  if (score <= 1) return 'weak';
  if (score <= 2) return 'fair';
  return 'strong';
};

const STRENGTH_META: Record<Strength, { label: string; color: string; bars: number }> = {
  weak:   { label: 'Weak',   color: '#EF4444', bars: 1 },
  fair:   { label: 'Fair',   color: '#F59E0B', bars: 2 },
  strong: { label: 'Strong', color: '#10B981', bars: 3 },
};

const StrengthIndicator: React.FC<{ strength: Strength | null }> = ({ strength }) => {
  if (!strength) return null;
  const meta = STRENGTH_META[strength];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: n <= meta.bars ? meta.color : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: meta.color }}>
        {meta.label} password
      </p>
    </div>
  );
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; username?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const strength = getStrength(password);

  /* ── Validation ─────────────────────────────────────────────────────── */
  const validateField = (field: 'name' | 'username' | 'password', value: string) => {
    if (field === 'name') {
      if (!value.trim()) return 'Full name is required.';
      if (value.trim().length > 25) return 'Name must be 25 characters or fewer.';
    }
    if (field === 'username') {
      if (!value.trim()) return 'Email address is required.';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address.';
    }
    if (field === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 4) return 'Password must be at least 4 characters.';
    }
    return undefined;
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; username?: string; password?: string } = {
      name: validateField('name', name),
      username: validateField('username', username),
      password: validateField('password', password),
    };
    Object.keys(newErrors).forEach(
      (k) => newErrors[k as keyof typeof newErrors] === undefined && delete newErrors[k as keyof typeof newErrors]
    );
    setErrors(newErrors);

    if (newErrors.name)     { nameRef.current?.focus();     return false; }
    if (newErrors.username) { usernameRef.current?.focus(); return false; }
    if (newErrors.password) { passwordRef.current?.focus(); return false; }
    return true;
  };

  const handleBlur = (field: 'name' | 'username' | 'password') => {
    const val = field === 'name' ? name : field === 'username' ? username : password;
    const msg = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await authApi.signup({
        name: name.trim(),
        username: username.trim(),
        password,
      });
      setAuth(data.token, data.user);
      toast.success(`Welcome to Voltrix, ${data.user.name}!`);
      navigate('/projects');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Registration failed. Please try a different email.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell serverError={serverError}>
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <h1 className="font-display font-semibold text-3xl tracking-tight text-[#ECECF1] leading-tight">
          let's get you started.
        </h1>
        <p className="mt-1.5 text-sm text-[#A0A0AB]">create your free account.</p>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full name */}
        <div>
          <label htmlFor="signup-name" className="block text-xs font-medium text-[#A0A0AB] mb-1.5">
            Full name
          </label>
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
            }}
            onBlur={() => handleBlur('name')}
            placeholder="Alex Mercer"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'signup-name-error' : undefined}
            className={inputCls(Boolean(errors.name))}
            style={{ fontSize: '16px' }}
          />
          {errors.name && (
            <p id="signup-name-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-xs font-medium text-[#A0A0AB] mb-1.5">
            Email address
          </label>
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
            }}
            onBlur={() => handleBlur('username')}
            placeholder="alex@voltrix.ai"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'signup-email-error' : undefined}
            className={inputCls(Boolean(errors.username))}
            style={{ fontSize: '16px' }}
          />
          {errors.username && (
            <p id="signup-email-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">
              {errors.username}
            </p>
          )}
        </div>

        {/* Password + strength */}
        <div>
          <label htmlFor="signup-password" className="block text-xs font-medium text-[#A0A0AB] mb-1.5">
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
                errors.password
                  ? 'signup-password-error'
                  : strength
                  ? 'signup-password-strength'
                  : undefined
              }
              className={`${inputCls(Boolean(errors.password))} pr-11`}
              style={{ fontSize: '16px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              tabIndex={0}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded text-[#6B6B76] hover:text-[#ECECF1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p id="signup-password-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">
              {errors.password}
            </p>
          ) : (
            <div id="signup-password-strength" aria-live="polite">
              <StrengthIndicator strength={strength} />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0B0F] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0F]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </div>
      </form>

      {/* Switch link */}
      <p className="mt-6 text-center text-sm text-[#A0A0AB]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[#ECECF1] font-medium hover:text-[#06B6D4] transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded px-0.5"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
};
