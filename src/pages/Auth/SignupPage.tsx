import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import { AuthShell } from './AuthShell';
import { OAuthButtons } from '../../components/auth/OAuthButtons';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; username?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { name?: string; username?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length > 25) {
      newErrors.name = 'Name must be 1 to 25 characters';
    }

    if (!username.trim()) {
      newErrors.username = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(username)) {
      newErrors.username = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      toast.success(`Account created! Welcome to Voltrix, ${data.user.name}!`);
      navigate('/projects');
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Registration failed. Try a different email.';
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building with autonomous code generation"
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
      serverError={serverError}
    >
      {/* OAuth Action Buttons */}
      <OAuthButtons isLoading={isLoading} />

      {/* Decorative Divider with OR text */}
      <div className="relative my-5 flex items-center justify-center" aria-hidden="true">
        <div className="w-full border-t border-border-subtle" />
        <span className="absolute bg-surface-panel px-3 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
          OR
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Full name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              if (serverError) setServerError(null);
            }}
            placeholder="Alex Mercer"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'signup-name-error' : undefined}
            className={`w-full h-11 px-3.5 rounded-lg bg-surface-base border ${
              errors.name
                ? 'border-status-danger focus:border-status-danger'
                : 'border-border-subtle focus:border-border-strong'
            } text-base text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal transition-colors`}
          />
          {errors.name && (
            <p id="signup-name-error" role="alert" className="text-xs text-status-danger mt-1.5">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="signup-username"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Email address
          </label>
          <input
            id="signup-username"
            name="username"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
              if (serverError) setServerError(null);
            }}
            placeholder="alex@voltrix.ai"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'signup-username-error' : undefined}
            className={`w-full h-11 px-3.5 rounded-lg bg-surface-base border ${
              errors.username
                ? 'border-status-danger focus:border-status-danger'
                : 'border-border-subtle focus:border-border-strong'
            } text-base text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal transition-colors`}
          />
          {errors.username && (
            <p id="signup-username-error" role="alert" className="text-xs text-status-danger mt-1.5">
              {errors.username}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                if (serverError) setServerError(null);
              }}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'signup-password-error' : undefined}
              className={`w-full h-11 pl-3.5 pr-11 rounded-lg bg-surface-base border ${
                errors.password
                  ? 'border-status-danger focus:border-status-danger'
                  : 'border-border-subtle focus:border-border-strong'
              } text-base text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="signup-password-error" role="alert" className="text-xs text-status-danger mt-1.5">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-full bg-text-primary text-surface-base hover:bg-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-surface-base border-t-transparent rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </div>
      </form>
    </AuthShell>
  );
};
