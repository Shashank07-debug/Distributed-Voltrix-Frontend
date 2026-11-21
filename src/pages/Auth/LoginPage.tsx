/**
 * LoginPage — /login
 *
 * Calls existing authApi.login({ username, password }) unchanged.
 * Full inline validation, keyboard accessibility, loading state, server-error banner.
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

/* ─── Component ──────────────────────────────────────────────────────────── */
export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  /* ── Validation ─────────────────────────────────────────────────────── */
  const validateField = (field: 'username' | 'password', value: string) => {
    if (field === 'username') {
      if (!value.trim()) return 'Email address is required.';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address.';
    }
    if (field === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 4 || value.length > 50) return 'Password must be 4–50 characters.';
    }
    return undefined;
  };

  const validate = (): boolean => {
    const newErrors: { username?: string; password?: string } = {
      username: validateField('username', username),
      password: validateField('password', password),
    };
    // remove undefined keys
    Object.keys(newErrors).forEach(
      (k) => newErrors[k as keyof typeof newErrors] === undefined && delete newErrors[k as keyof typeof newErrors]
    );
    setErrors(newErrors);

    // focus first invalid
    if (newErrors.username) { usernameRef.current?.focus(); return false; }
    if (newErrors.password) { passwordRef.current?.focus(); return false; }
    return true;
  };

  const handleBlur = (field: 'username' | 'password') => {
    const val = field === 'username' ? username : password;
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
      const data = await authApi.login({ username: username.trim(), password });
      setAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name || data.user.username}!`);
      navigate('/projects');
    } catch {
      // Generic message — never reveals whether the email exists
      const msg = 'Incorrect email or password. Please try again.';
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
          welcome back.
        </h1>
        <p className="mt-1.5 text-sm text-[#A0A0AB]">sign in to continue building.</p>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-medium text-[#A0A0AB] mb-1.5"
          >
            Email address
          </label>
          <input
            ref={usernameRef}
            id="login-email"
            name="username"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
              if (serverError) setServerError(null);
            }}
            onBlur={() => handleBlur('username')}
            placeholder="you@voltrix.ai"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'login-email-error' : undefined}
            className={inputCls(Boolean(errors.username))}
            style={{ fontSize: '16px' }}
          />
          {errors.username && (
            <p id="login-email-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">
              {errors.username}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-medium text-[#A0A0AB] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              ref={passwordRef}
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                if (serverError) setServerError(null);
              }}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
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
          {errors.password && (
            <p id="login-password-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">
              {errors.password}
            </p>
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
                Signing in…
              </>
            ) : (
              'Log in'
            )}
          </button>
        </div>
      </form>

      {/* Switch link */}
      <p className="mt-6 text-center text-sm text-[#A0A0AB]">
        New here?{' '}
        <Link
          to="/signup"
          className="text-[#ECECF1] font-medium hover:text-[#06B6D4] transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded px-0.5"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
};
