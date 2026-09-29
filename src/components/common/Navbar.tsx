import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, CreditCard, LayoutDashboard, LogOut, User, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isWorkspace = location.pathname.startsWith('/projects/');

  if (isWorkspace) {
    // Hide standard navbar inside full-screen workspace page (workspace has its own custom topbar)
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-voltrix-border bg-[#070709]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-voltrix-violet to-voltrix-cyan p-0.5 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-voltrix-bg rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-voltrix-cyan group-hover:text-voltrix-violet transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-voltrix-violet-light transition-colors">
              VOLTRIX
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-voltrix-muted">
          <Link
            to="/"
            className={`transition-colors hover:text-white ${
              location.pathname === '/' ? 'text-white font-semibold' : ''
            }`}
          >
            Home
          </Link>
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <Link
            to="/billing"
            className={`transition-colors hover:text-white flex items-center gap-1.5 ${
              location.pathname === '/billing' ? 'text-white font-semibold' : ''
            }`}
          >
            <CreditCard className="w-4 h-4 text-voltrix-cyan" />
            Pricing & Billing
          </Link>
        </nav>

        {/* Action Buttons / User Menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated() ? (
            <div className="flex items-center gap-3">
              <Link
                to="/projects"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-voltrix-card hover:bg-voltrix-card-hover border border-voltrix-border text-gray-200 hover:border-voltrix-violet/40 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-voltrix-cyan" />
                Dashboard
              </Link>

              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-voltrix-card border border-voltrix-border hover:border-voltrix-violet/50 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-voltrix-violet to-voltrix-cyan flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-mono text-gray-300 max-w-[100px] truncate">
                    {user?.name || user?.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 py-2 bg-voltrix-card border border-voltrix-border rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                    <p className="text-[11px] font-mono text-voltrix-muted truncate">{user?.username}</p>
                  </div>
                  <Link
                    to="/projects"
                    className="w-full px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-voltrix-cyan" />
                    My Projects
                  </Link>
                  <Link
                    to="/billing"
                    className="w-full px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-voltrix-violet" />
                    Subscription Plan
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-white/5 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-1.5"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs sm:text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-voltrix-violet via-voltrix-cyan to-voltrix-highlight group-hover:from-voltrix-violet group-hover:to-voltrix-cyan shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
              >
                <span className="relative px-4 py-1.5 transition-all ease-in duration-75 bg-[#070709] rounded-[10px] group-hover:bg-opacity-0 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-voltrix-cyan" />
                  Get Started
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
