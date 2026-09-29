import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthCanvas } from '../../components/canvas/AuthCanvas';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      newErrors.username = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(username)) {
      newErrors.username = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4 || password.length > 50) {
      newErrors.password = 'Password must be between 4 and 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await authApi.login({ username, password });
      setAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name || data.user.username}!`);
      navigate('/projects');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to authenticate. Check credentials.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#070709] px-4 py-12 overflow-hidden">
      {/* 3D Background */}
      <AuthCanvas />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl glass-panel shadow-[0_0_50px_rgba(139,92,246,0.15)] border border-voltrix-border">
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-voltrix-violet to-voltrix-cyan p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070709] rounded-[14px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-voltrix-cyan" />
              </div>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Access Voltrix Engine</h1>
          <p className="text-xs text-voltrix-muted mt-1">Sign in to your autonomous AI workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-voltrix-muted" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="developer@voltrix.ai"
                className={`w-full bg-[#0D0E15]/90 border ${
                  errors.username ? 'border-rose-500' : 'border-voltrix-border'
                } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-voltrix-violet focus:ring-1 focus:ring-voltrix-violet transition-all`}
              />
            </div>
            {errors.username && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.username}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-voltrix-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[#0D0E15]/90 border ${
                  errors.password ? 'border-rose-500' : 'border-voltrix-border'
                } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-voltrix-violet focus:ring-1 focus:ring-voltrix-violet transition-all`}
              />
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-voltrix-violet via-voltrix-cyan to-voltrix-violet bg-[length:200%_auto] text-white text-sm font-semibold shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-voltrix-muted border-t border-white/5 pt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-voltrix-cyan font-semibold hover:underline inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
