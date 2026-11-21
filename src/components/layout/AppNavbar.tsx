import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Rocket,
  Users,
  CreditCard,
  Settings,
  User as UserIcon,
  LogOut,
  X,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Logo } from '../Logo';
import { ProjectRole } from '../../api/workspace';
import { toast } from 'sonner';

export type WorkspaceStatus = 'idle' | 'generating' | 'deployed' | 'error';

export interface AppNavbarProps {
  mode?: 'dashboard' | 'workspace';
  projectName?: string;
  projectRole?: ProjectRole;
  status?: WorkspaceStatus;
  onDeploy?: () => void;
  isDeploying?: boolean;
  onOpenCollaborators?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  mode,
  projectName,
  projectRole,
  status = 'idle',
  onDeploy,
  isDeploying = false,
  onOpenCollaborators,
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isWorkspaceMode = mode === 'workspace' || (location.pathname.startsWith('/projects/') && location.pathname !== '/projects');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Click outside listener for avatar dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(target) &&
        dropdownTriggerRef.current &&
        !dropdownTriggerRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Escape key handler for dropdown and drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
          dropdownTriggerRef.current?.focus();
        }
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, isDrawerOpen]);

  // Body scroll lock when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isDrawerOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const userInitial = (user?.name?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-14 min-h-14 max-h-14 w-full bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)] pt-[env(safe-area-inset-top)] px-4 sm:px-6 flex items-center justify-between select-none box-border shrink-0">
      {/* Left: Logo & Breadcrumbs or Dashboard Tabs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Link
          to="/projects"
          className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] rounded-lg p-0.5"
          aria-label="Voltrix Dashboard"
        >
          <Logo variant="full" size={22} />
        </Link>

        {isWorkspaceMode ? (
          /* Workspace Breadcrumbs: projects / project-name */
          <div className="flex items-center gap-1.5 text-xs font-mono min-w-0">
            <span className="text-[var(--landing-text-secondary)] opacity-40">/</span>
            <Link
              to="/projects"
              className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors hidden sm:inline"
            >
              projects
            </Link>
            <span className="text-[var(--landing-text-secondary)] opacity-40 hidden sm:inline">/</span>
            <span
              title={projectName || 'Workspace'}
              className="text-[var(--landing-text-primary)] font-semibold truncate max-w-[120px] sm:max-w-[200px] md:max-w-[260px]"
            >
              {projectName || 'workspace'}
            </span>

            {projectRole && projectRole !== 'OWNER' && (
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-[var(--landing-text-secondary)]">
                {projectRole.toLowerCase()}
              </span>
            )}
          </div>
        ) : (
          /* Dashboard Navigation Tabs */
          <nav className="hidden sm:flex items-center gap-1 h-14 ml-2" aria-label="Dashboard views">
            <Link
              to="/projects"
              className={`h-14 flex items-center px-3.5 text-xs font-mono font-medium transition-colors border-b-2 box-border ${
                location.pathname === '/projects'
                  ? 'border-[var(--landing-accent)] text-[var(--landing-accent)] font-semibold'
                  : 'border-transparent text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]'
              }`}
            >
              Projects
            </Link>
            <Link
              to="/billing"
              className={`h-14 flex items-center px-3.5 text-xs font-mono font-medium transition-colors border-b-2 box-border ${
                location.pathname === '/billing'
                  ? 'border-[var(--landing-accent)] text-[var(--landing-accent)] font-semibold'
                  : 'border-transparent text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]'
              }`}
            >
              Billing
            </Link>
          </nav>
        )}
      </div>

      {/* Center (Desktop ≥900px): Status Chip (Workspace mode only) */}
      {isWorkspaceMode && (
        <div className="hidden min-[900px]:flex items-center justify-center">
          {status === 'generating' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/30 text-[var(--landing-accent)] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)] animate-ping" />
              <span>generating code</span>
            </span>
          )}
          {status === 'deployed' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/30 text-[var(--landing-accent)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
              <span>deployed &amp; live</span>
            </span>
          )}
          {status === 'error' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-red-500/10 border border-red-500/30 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>build error</span>
            </span>
          )}
          {status === 'idle' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-[var(--landing-text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span>ready</span>
            </span>
          )}
        </div>
      )}

      {/* Right Actions & Avatar Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {isWorkspaceMode && onOpenCollaborators && (
          <button
            type="button"
            onClick={onOpenCollaborators}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] hover:bg-[var(--landing-surface-2)] text-xs font-mono text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            title="View Collaborators"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Collaborators</span>
          </button>
        )}

        {isWorkspaceMode && onDeploy && projectRole !== 'VIEWER' && (
          <button
            type="button"
            onClick={onDeploy}
            disabled={isDeploying}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] active:scale-95 text-[#090D0F] font-bold text-xs font-sans shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            title="Deploy live preview container"
          >
            <Rocket className="w-3.5 h-3.5 text-[#090D0F]" />
            <span>{isDeploying ? 'Deploying...' : 'Deploy'}</span>
          </button>
        )}

        {/* User Avatar & Dropdown Trigger */}
        <div className="relative">
          <button
            ref={dropdownTriggerRef}
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            aria-label="User account menu"
            className="w-9 h-9 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] hover:border-[var(--landing-accent)]/50 text-[var(--landing-text-primary)] font-bold text-xs flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
          >
            <span>{userInitial}</span>
          </button>

          {/* Desktop Dropdown Menu (WAI-ARIA compliant) */}
          {isDropdownOpen && (
            <div
              ref={dropdownMenuRef}
              role="menu"
              aria-label="Account options"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--landing-surface-1)] border border-[var(--landing-border-strong)] shadow-2xl p-1.5 z-50 text-xs font-sans text-[var(--landing-text-primary)] animate-in fade-in zoom-in-95 duration-150"
            >
              {/* User Identity Header */}
              <div className="px-3 py-2.5 border-b border-[var(--landing-border)] mb-1">
                <p className="font-semibold text-sm text-[var(--landing-text-primary)] truncate">
                  {user?.name || user?.username || 'Voltrix Developer'}
                </p>
                <p className="text-[11px] font-mono text-[var(--landing-text-secondary)] truncate mt-0.5">
                  {user?.username || 'user@voltrix.ai'}
                </p>
              </div>

              {/* Menu Actions */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  toast.info('Profile view: ' + (user?.name || user?.username));
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-[var(--landing-text-secondary)]" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  toast.info('Preferences coming soon.');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-[var(--landing-text-secondary)]" />
                <span>Settings</span>
              </button>

              <Link
                to="/billing"
                role="menuitem"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-[var(--landing-accent)]" />
                <span>Pricing &amp; Billing</span>
              </Link>

              <div className="my-1 border-t border-[var(--landing-border)]" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer Toggle (< 900px) */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex min-[900px]:hidden p-1.5 rounded-xl border border-[var(--landing-border)] hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Slide-in Drawer (< 900px) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 min-[900px]:hidden flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={drawerRef}
            className="w-4/5 max-w-sm h-full bg-[var(--landing-surface-1)] border-l border-[var(--landing-border-strong)] p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
          >
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[var(--landing-border)]">
                <Logo variant="full" size={20} />
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-9 h-9 rounded-xl border border-[var(--landing-border)] hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] flex items-center justify-center transition-colors"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Identity */}
              <div className="py-4 border-b border-[var(--landing-border)] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-sm font-bold text-[var(--landing-accent)]">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--landing-text-primary)] truncate">
                      {user?.name || user?.username || 'Voltrix Developer'}
                    </p>
                    <p className="text-xs font-mono text-[var(--landing-text-secondary)] truncate">
                      {user?.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drawer Navigation Links */}
              <div className="space-y-1.5 font-mono text-sm">
                <Link
                  to="/projects"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    location.pathname === '/projects'
                      ? 'bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]'
                      : 'hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)]'
                  }`}
                >
                  Projects Dashboard
                </Link>

                <Link
                  to="/billing"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    location.pathname === '/billing'
                      ? 'bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]'
                      : 'hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)]'
                  }`}
                >
                  Pricing &amp; Billing
                </Link>

                {isWorkspaceMode && onOpenCollaborators && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenCollaborators();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] font-medium transition-colors flex items-center justify-between"
                  >
                    <span>Collaborators</span>
                    <Users className="w-4 h-4 text-[var(--landing-text-secondary)]" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Actions: Deploy & Logout */}
            <div className="space-y-3 pt-6 border-t border-[var(--landing-border)]">
              {isWorkspaceMode && onDeploy && projectRole !== 'VIEWER' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onDeploy();
                  }}
                  disabled={isDeploying}
                  className="w-full h-11 rounded-full bg-[var(--landing-accent)] text-[#090D0F] font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{isDeploying ? 'Deploying...' : 'Deploy Project'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
