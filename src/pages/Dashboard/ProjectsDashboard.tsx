import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Sparkles,
  Search,
  LayoutGrid,
  List,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  AlertTriangle,
  X,
  Check,
  Code2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { projectsApi, ProjectSummary, ProjectRole } from '../../api/workspace';
import { billingApi, SubscriptionData } from '../../api/billing';
import { ApiError } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

/* ─── Squiggle Component for Gen Z Heading ────────────────────────────────── */
const Squiggle: React.FC = () => (
  <svg
    viewBox="0 0 140 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute left-0 -bottom-2 w-full h-3 pointer-events-none overflow-visible landing-squiggle-anim"
    aria-hidden="true"
  >
    <path
      d="M 2 9 C 25 3, 45 15, 70 8 C 95 2, 115 16, 138 9"
      stroke="var(--landing-accent)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Deterministic Seeded Mini-Preview for Cards ─────────────────────────── */
const SeededMiniPreview: React.FC<{ name: string; id: string }> = ({ name, id }) => {
  const hash = useMemo(() => {
    let h = 0;
    const str = name + id;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }, [name, id]);

  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;

  return (
    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-[var(--landing-surface-2)] border border-[var(--landing-border)] p-3 select-none flex flex-col justify-between">
      {/* Subtle background gradient glow */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, hsl(${hue1}, 70%, 60%) 0%, transparent 60%), radial-gradient(circle at 20% 80%, hsl(${hue2}, 60%, 50%) 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {/* Mock Editor Window Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/10" />
          <span className="w-2 h-2 rounded-full bg-white/10" />
          <span className="w-2 h-2 rounded-full bg-white/10" />
          <span className="ml-1.5 text-[9px] font-mono text-[var(--landing-text-secondary)] opacity-60">
            {name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.tsx
          </span>
        </div>
        <span className="text-[9px] font-mono text-[var(--landing-accent)] opacity-80">v1.0</span>
      </div>

      {/* Mock Code Lines */}
      <div className="space-y-1.5 z-10 font-mono text-[9px]">
        <div className="flex items-center gap-2">
          <span className="w-8 h-1.5 rounded-full bg-[var(--landing-accent)]/40" />
          <span className="w-16 h-1.5 rounded-full bg-white/20" />
          <span className="w-10 h-1.5 rounded-full bg-emerald-400/30" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 h-1.5 rounded-full bg-white/15" />
          <span className="w-24 h-1.5 rounded-full bg-white/25" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 h-1.5 rounded-full bg-[var(--landing-accent)]/30" />
          <span className="w-8 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
};

/* ─── Relative Time Helper ────────────────────────────────────────────────── */
function getRelativeTime(dateString?: string): string {
  if (!dateString) return 'recently';
  const delta = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (delta < 60) return 'just now';
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  if (delta < 604800) return `${Math.floor(delta / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ─── Suggestion Prompts for New Project Modal ───────────────────────────── */
const SUGGESTIONS = [
  'SaaS Analytics Dashboard',
  'AI Content Generator',
  'Real-time Chat App',
  'Developer Portfolio Bento',
  'E-Commerce Storefront',
];

const ROTATING_SUBLINES = [
  'your autonomous dev team is ready to ship.',
  'what are we building today?',
  'prompt it, preview it, ship it in minutes.',
  'turn ideas into production-grade web applications.',
  'less boilerplate, more software that matters.',
];

export const ProjectsDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [subline] = useState(
    () => ROTATING_SUBLINES[Math.floor(Math.random() * ROTATING_SUBLINES.length)]
  );

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deployed' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'newest'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('voltrix_dashboard_view') as 'grid' | 'list') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingProject, setDeletingProject] = useState<ProjectSummary | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Global Ctrl/Cmd + K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (activeMenuId) setActiveMenuId(null);
        if (isCreateOpen) setIsCreateOpen(false);
        if (editingProject) setEditingProject(null);
        if (deletingProject) setDeletingProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenuId, isCreateOpen, editingProject, deletingProject]);

  // Click outside listener for card 3-dot dropdowns
  useEffect(() => {
    if (!activeMenuId) return;
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  // Save viewMode to localStorage
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('voltrix_dashboard_view', mode);
    } catch {}
  };

  // Fetch projects list
  const {
    data: projects = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  // Fetch current subscription
  const { data: subData, isError: isSubError } = useQuery<SubscriptionData>({
    queryKey: ['subscription'],
    queryFn: billingApi.getSubscription,
  });

  const ownedProjects = projects.filter((p) => p.role === 'OWNER');
  const maxProjects = subData?.plan?.maxProjects ?? 5;
  const isAtLimit = !isSubError && subData?.plan != null && ownedProjects.length >= maxProjects;

  // Helper to determine if project has been deployed
  const isProjectDeployed = (p: ProjectSummary) => {
    try {
      return Boolean((p as { previewUrl?: string }).previewUrl || localStorage.getItem(`voltrix_deploy_${p.id}`));
    } catch {
      return false;
    }
  };

  // Stats
  const deployedCount = projects.filter(isProjectDeployed).length;
  const lastUpdatedProject = useMemo(() => {
    if (!projects.length) return null;
    return [...projects].sort((a, b) => {
      const da = new Date(b.updatedAt || b.createdAt).getTime();
      const db = new Date(a.updatedAt || a.createdAt).getTime();
      return da - db;
    })[0];
  }, [projects]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (name: string) => projectsApi.createProject(name),
    onSuccess: (data) => {
      toast.success('Project initialized!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateOpen(false);
      setNewProjectName('');
      if (data?.id) {
        navigate(`/projects/${data.id}`);
      }
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 400) {
        toast.error(err.message || 'Project limit reached for your plan.', {
          action: { label: 'Upgrade', onClick: () => navigate('/billing') },
        });
        return;
      }
      toast.error('Could not create project. Try again.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => projectsApi.updateProject(id, name),
    onSuccess: () => {
      toast.success('Project renamed successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
    },
    onError: () => {
      toast.error('Failed to rename project.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted.');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeletingProject(null);
    },
    onError: () => {
      toast.error('Failed to delete project.');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Please specify a project name');
      return;
    }
    createMutation.mutate(newProjectName.trim());
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editName.trim()) return;
    updateMutation.mutate({ id: editingProject.id, name: editName.trim() });
  };

  const handleDeleteConfirm = () => {
    if (!deletingProject) return;
    deleteMutation.mutate(deletingProject.id);
  };

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesQuery) return false;
        if (filterType === 'deployed') return isProjectDeployed(p);
        if (filterType === 'draft') return !isProjectDeployed(p);
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // default recent
        return (
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      });
  }, [projects, searchQuery, filterType, sortBy]);

  // Spotlight mouse effect on cards
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const firstName = user?.name
    ? user.name.split(' ')[0].toLowerCase()
    : user?.username
    ? user.username.split('@')[0].toLowerCase()
    : 'builder';

  return (
    <div className="relative min-h-[calc(100dvh-56px)] bg-[var(--landing-bg-ink)] text-[var(--landing-text-primary)] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 select-none overflow-x-hidden">
      {/* ── Background: Dotted Grid with subtle Lime Glow ────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 select-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />
      <div
        className="fixed top-12 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.06] select-none z-0 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--landing-accent) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* ── Top Header Strip ────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-[var(--landing-border)]">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--landing-text-primary)] leading-[1.1]">
              ready to{' '}
              <span className="relative inline-block text-[var(--landing-accent)]">
                build
                <Squiggle />
              </span>
              , {firstName}?
            </h1>
            <p className="mt-2 text-sm text-[var(--landing-text-secondary)] font-sans">
              {subline}
            </p>
          </div>

          {/* Right Action: Primary Lime Pill New Project Button */}
          <div className="flex items-center gap-3 shrink-0">
            {isAtLimit && (
              <Link
                to="/billing"
                className="landing-sticker bg-[var(--landing-accent)] text-[#090D0F] border-[#090D0F]"
              >
                upgrade plan
              </Link>
            )}

            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={isAtLimit}
              className={`h-11 px-5 rounded-full bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] text-[#090D0F] font-bold text-xs uppercase tracking-wider font-mono shadow-sm flex items-center justify-center gap-2 interactive-motion cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isAtLimit ? 'opacity-50' : ''
              }`}
              title={isAtLimit ? 'Project plan limit reached' : 'Create new project workspace'}
            >
              <Sparkles className="w-4 h-4 text-[#090D0F]" />
              <span>new project</span>
            </button>
          </div>
        </div>

        {/* ── Stats Strip as Chunky Chips ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Projects Used Chip with segmented bar */}
          <div className="rounded-2xl bg-[var(--landing-surface-1)] border border-[var(--landing-border)] p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--landing-text-secondary)]">
              <span>PROJECTS USED</span>
              <span className="font-semibold text-[var(--landing-text-primary)]">
                {ownedProjects.length} / {maxProjects}
              </span>
            </div>
            {/* Segmented bar */}
            <div className="flex gap-1.5 h-2" aria-hidden="true">
              {Array.from({ length: Math.min(maxProjects, 10) }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-colors ${
                    idx < ownedProjects.length
                      ? 'bg-[var(--landing-accent)] shadow-xs'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Deployed Apps Chip */}
          <div className="rounded-2xl bg-[var(--landing-surface-1)] border border-[var(--landing-border)] p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase text-[var(--landing-text-secondary)]">
                DEPLOYED RUNNERS
              </p>
              <p className="text-2xl font-bold font-display text-[var(--landing-text-primary)] mt-0.5">
                {deployedCount}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/20 text-[var(--landing-accent)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
              active
            </span>
          </div>

          {/* Last Activity Chip */}
          <div className="rounded-2xl bg-[var(--landing-surface-1)] border border-[var(--landing-border)] p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase text-[var(--landing-text-secondary)]">
                LAST UPDATED
              </p>
              <p className="text-sm font-semibold font-mono text-[var(--landing-text-primary)] mt-1 truncate max-w-[180px]">
                {lastUpdatedProject?.name || 'none yet'}
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--landing-text-secondary)]">
              {lastUpdatedProject ? getRelativeTime(lastUpdatedProject.updatedAt || lastUpdatedProject.createdAt) : '—'}
            </span>
          </div>
        </div>

        {/* ── Toolbar: Search, Filters, Sort, View Toggle ─────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar with ⌘K */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--landing-text-secondary)]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects... (⌘K)"
              className="w-full h-11 bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] rounded-2xl pl-10 pr-10 text-base lg:text-xs text-[var(--landing-text-primary)] placeholder:text-[var(--landing-text-secondary)] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--landing-text-secondary)] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips + Sort + Grid/List Switch */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            {/* Filter chips */}
            <div className="flex items-center gap-1 bg-[var(--landing-surface-1)] p-1 rounded-2xl border border-[var(--landing-border)] text-xs font-mono">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  filterType === 'all'
                    ? 'bg-[var(--landing-accent)] text-[#090D0F] font-bold'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
              >
                all
              </button>
              <button
                type="button"
                onClick={() => setFilterType('deployed')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  filterType === 'deployed'
                    ? 'bg-[var(--landing-accent)] text-[#090D0F] font-bold'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
              >
                deployed
              </button>
              <button
                type="button"
                onClick={() => setFilterType('draft')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  filterType === 'draft'
                    ? 'bg-[var(--landing-accent)] text-[#090D0F] font-bold'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
              >
                draft
              </button>
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'newest')}
                className="h-10 px-3 pr-8 rounded-2xl bg-[var(--landing-surface-1)] border border-[var(--landing-border)] text-xs font-mono text-[var(--landing-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)] cursor-pointer appearance-none"
              >
                <option value="recent">Recently updated</option>
                <option value="newest">Newest created</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--landing-text-secondary)]" />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-[var(--landing-surface-1)] p-1 rounded-2xl border border-[var(--landing-border)]">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white/10 text-[var(--landing-accent)]'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white/10 text-[var(--landing-accent)]'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Loading Skeleton Cards ───────────────────────────────────────── */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-[var(--landing-surface-1)] border border-[var(--landing-border)] animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="h-24 bg-white/5 rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-5 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
                <div className="h-4 bg-white/5 rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* ── Error State ─────────────────────────────────────────────────── */}
        {isError && (
          <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/25 text-center max-w-lg mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white">failed to load projects</h3>
            <p className="text-xs text-red-300 mt-1">
              Could not reach the workspace service. Check your connection and retry.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 rounded-full bg-[var(--landing-accent)] text-[#090D0F] font-bold text-xs font-mono transition-transform active:scale-95"
            >
              retry connection
            </button>
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────────────────── */}
        {!isLoading && !isError && filteredProjects.length === 0 && (
          <div className="p-12 rounded-3xl bg-[var(--landing-surface-1)] border border-[var(--landing-border)] text-center max-w-md mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/30 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-[var(--landing-accent)]" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">
              {searchQuery ? 'no matching projects.' : 'no projects yet. let\'s fix that.'}
            </h3>
            <p className="text-xs text-[var(--landing-text-secondary)] mb-6 leading-relaxed">
              {searchQuery
                ? 'Try a different keyword or reset filters to view all your workspaces.'
                : 'Describe an application idea and let Voltrix generate the entire codebase autonomously.'}
            </p>
            <button
              onClick={() => {
                if (searchQuery) setSearchQuery('');
                else setIsCreateOpen(true);
              }}
              disabled={isAtLimit && !searchQuery}
              className="px-6 h-11 rounded-full bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] text-[#090D0F] font-bold text-xs uppercase tracking-wider font-mono shadow-sm transition-transform active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-[#090D0F]" />
              <span>{searchQuery ? 'clear search' : 'create first project'}</span>
            </button>
          </div>
        )}

        {/* ── Grid View ───────────────────────────────────────────────────── */}
        {!isLoading && !isError && filteredProjects.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => (
              <div
                key={project.id}
                onMouseMove={handleCardMouseMove}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="group relative rounded-2xl bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-[var(--landing-accent-ring)]"
              >
                <div>
                  {/* Mini Code Preview Header */}
                  <SeededMiniPreview name={project.name} id={project.id} />

                  {/* Card Title & 3-Dot Actions */}
                  <div className="flex items-start justify-between gap-2 mt-4 mb-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-display text-lg font-bold text-[var(--landing-text-primary)] group-hover:text-[var(--landing-accent)] transition-colors truncate max-w-[220px] focus:outline-none"
                    >
                      {project.name}
                    </Link>

                    {/* Actions dropdown button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === project.id ? null : project.id);
                        }}
                        aria-label={`Actions for ${project.name}`}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--landing-text-secondary)] hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)]"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === project.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-1 w-36 py-1.5 bg-[var(--landing-surface-2)] border border-[var(--landing-border-strong)] rounded-2xl shadow-2xl z-30 text-xs font-mono"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProject(project);
                              setEditName(project.name);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-[var(--landing-text-primary)] hover:bg-white/5 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[var(--landing-accent)]" />
                            Rename
                          </button>
                          {project.role === 'OWNER' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingProject(project);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chips: Role & Deployed Status */}
                  <div className="flex items-center gap-2 mb-4">
                    {/* Status Chip */}
                    {isProjectDeployed(project) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/20 text-[var(--landing-accent)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
                        deployed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-[var(--landing-text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        draft
                      </span>
                    )}

                    {/* Role Chip */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-[var(--landing-text-secondary)] uppercase">
                      {project.role.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Footer: Timestamp & "open workspace" button */}
                <div className="pt-4 border-t border-[var(--landing-border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--landing-text-secondary)]">
                    <Clock className="w-3 h-3 text-[var(--landing-text-secondary)] opacity-50" />
                    <span>{getRelativeTime(project.updatedAt || project.createdAt)}</span>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-xs text-[var(--landing-accent)] hover:underline group-hover:translate-x-1 transition-transform"
                  >
                    <span>open workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}

            {/* Dashed New Project Card at end of grid */}
            {!isAtLimit && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="h-full min-h-[260px] rounded-2xl border-2 border-dashed border-[var(--landing-border)] hover:border-[var(--landing-accent)]/60 bg-transparent hover:bg-[var(--landing-surface-1)]/40 p-6 flex flex-col items-center justify-center text-center group transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-text-secondary)] group-hover:text-[var(--landing-accent)] group-hover:border-[var(--landing-accent)]/40 transition-colors mb-3">
                  <FolderPlus className="w-6 h-6" />
                </div>
                <p className="font-display font-bold text-sm text-[var(--landing-text-primary)] group-hover:text-[var(--landing-accent)] transition-colors">
                  create new project
                </p>
                <p className="text-xs text-[var(--landing-text-secondary)] mt-1 font-sans">
                  initialize a fresh autonomous workspace
                </p>
              </button>
            )}
          </div>
        )}

        {/* ── List View ───────────────────────────────────────────────────── */}
        {!isLoading && !isError && filteredProjects.length > 0 && viewMode === 'list' && (
          <div className="rounded-2xl bg-[var(--landing-surface-1)] border border-[var(--landing-border)] divide-y divide-[var(--landing-border)] overflow-hidden">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[var(--landing-surface-2)]/60 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-text-secondary)] shrink-0">
                    <Code2 className="w-5 h-5 text-[var(--landing-accent)]" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-display font-bold text-sm text-[var(--landing-text-primary)] group-hover:text-[var(--landing-accent)] transition-colors truncate block"
                    >
                      {project.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-[var(--landing-text-secondary)] uppercase">
                        {project.role.toLowerCase()}
                      </span>
                      <span className="text-[10px] text-[var(--landing-text-secondary)] opacity-40">·</span>
                      <span className="text-[10px] font-mono text-[var(--landing-text-secondary)]">
                        updated {getRelativeTime(project.updatedAt || project.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isProjectDeployed(project) ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
                      deployed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-[var(--landing-text-secondary)]">
                      draft
                    </span>
                  )}

                  <Link
                    to={`/projects/${project.id}`}
                    className="h-8 px-3 rounded-full border border-[var(--landing-border)] hover:border-[var(--landing-accent)]/50 hover:bg-[var(--landing-surface-1)] text-xs font-mono font-medium text-[var(--landing-accent)] flex items-center gap-1 transition-colors"
                  >
                    <span>open</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── New Project Modal ────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--landing-surface-1)] border border-[var(--landing-border-strong)] shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsCreateOpen(false)}
              aria-label="Close dialog"
              className="w-9 h-9 flex items-center justify-center rounded-xl absolute top-4 right-4 text-[var(--landing-text-secondary)] hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-display text-2xl font-bold text-[var(--landing-text-primary)] mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--landing-accent)]" />
              new project.
            </h2>
            <p className="text-xs text-[var(--landing-text-secondary)] mb-5 font-sans">
              name your workspace. voltrix ai will scaffold and execute the application.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="create-project-name"
                  className="block text-xs font-mono font-medium uppercase tracking-wider text-[var(--landing-text-secondary)] mb-2"
                >
                  PROJECT NAME
                </label>
                <input
                  id="create-project-name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. SaaS Analytics Dashboard"
                  className="w-full h-12 bg-[var(--landing-surface-2)] border border-[var(--landing-border)] rounded-2xl px-4 text-base lg:text-sm text-[var(--landing-text-primary)] placeholder:text-[var(--landing-text-secondary)] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)] transition-all"
                  autoFocus
                />
              </div>

              {/* Suggestion Chips */}
              <div>
                <p className="text-[11px] font-mono text-[var(--landing-text-secondary)] mb-2 opacity-60">
                  SUGGESTIONS:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewProjectName(sug)}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[var(--landing-accent-subtle)] text-[11px] font-mono text-[var(--landing-text-secondary)] hover:text-[var(--landing-accent)] border border-white/5 hover:border-[var(--landing-accent)]/30 transition-colors cursor-pointer"
                    >
                      +{sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--landing-border)]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-10 px-4 rounded-full text-xs font-mono text-[var(--landing-text-secondary)] hover:text-white transition-colors"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-10 px-5 rounded-full bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] text-[#090D0F] font-bold text-xs uppercase tracking-wider font-mono shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'initializing...' : 'create workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Rename Project Modal ────────────────────────────────────────── */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--landing-surface-1)] border border-[var(--landing-border-strong)] shadow-2xl relative">
            <button
              onClick={() => setEditingProject(null)}
              aria-label="Close dialog"
              className="w-9 h-9 flex items-center justify-center rounded-xl absolute top-4 right-4 text-[var(--landing-text-secondary)] hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-display text-xl font-bold text-[var(--landing-text-primary)] mb-4">
              rename project.
            </h2>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="rename-project-name"
                  className="block text-xs font-mono font-medium uppercase tracking-wider text-[var(--landing-text-secondary)] mb-2"
                >
                  PROJECT NAME
                </label>
                <input
                  id="rename-project-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-12 bg-[var(--landing-surface-2)] border border-[var(--landing-border)] rounded-2xl px-4 text-base lg:text-sm text-[var(--landing-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)]"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="h-10 px-4 rounded-full text-xs font-mono text-[var(--landing-text-secondary)] hover:text-white transition-colors"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="h-10 px-5 rounded-full bg-[var(--landing-accent)] text-[#090D0F] font-bold text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'saving...' : 'save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────────── */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--landing-surface-1)] border border-red-500/30 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="font-display text-xl font-bold text-[var(--landing-text-primary)] mb-1">
              delete "{deletingProject.name}"?
            </h2>
            <p className="text-xs text-[var(--landing-text-secondary)] mb-6 leading-relaxed">
              This action cannot be undone. All project files, generation trees, and runner resources
              will be permanently removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="h-10 px-4 rounded-full text-xs font-mono text-[var(--landing-text-secondary)] hover:text-white transition-colors"
              >
                cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="h-10 px-5 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs font-mono transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteMutation.isPending ? 'deleting...' : 'confirm delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
