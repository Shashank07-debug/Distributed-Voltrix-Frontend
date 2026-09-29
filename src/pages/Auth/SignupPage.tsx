import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthCanvas } from '../../components/canvas/AuthCanvas';
import { toast } from 'sonner';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; username?: string; password?: string }>({});

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
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed. Try a different email.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#070709] px-4 py-12 overflow-hidden">
      {/* 3D Background */}
      <AuthCanvas />

      {/* Glassmorphic Signup Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl glass-panel shadow-[0_0_50px_rgba(6,182,212,0.15)] border border-voltrix-border">
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-voltrix-cyan to-voltrix-violet p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070709] rounded-[14px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-voltrix-violet" />
              </div>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Create Voltrix Account</h1>
          <p className="text-xs text-voltrix-muted mt-1">Start building full-stack apps with autonomous AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">FULL NAME</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-voltrix-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className={`w-full bg-[#0D0E15]/90 border ${
                  errors.name ? 'border-rose-500' : 'border-voltrix-border'
                } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-voltrix-cyan focus:ring-1 focus:ring-voltrix-cyan transition-all`}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-voltrix-muted" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex@voltrix.ai"
                className={`w-full bg-[#0D0E15]/90 border ${
                  errors.username ? 'border-rose-500' : 'border-voltrix-border'
                } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-voltrix-cyan focus:ring-1 focus:ring-voltrix-cyan transition-all`}
              />
            </div>
            {errors.username && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-voltrix-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 4 characters"
                className={`w-full bg-[#0D0E15]/90 border ${
                  errors.password ? 'border-rose-500' : 'border-voltrix-border'
                } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-voltrix-cyan focus:ring-1 focus:ring-voltrix-cyan transition-all`}
              />
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-voltrix-cyan via-voltrix-violet to-voltrix-cyan bg-[length:200%_auto] text-white text-sm font-semibold shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group mt-2"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Workspace...
              </span>
            ) : (
              <>
                <span>Create Developer Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-voltrix-muted border-t border-white/5 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-voltrix-violet-light font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
