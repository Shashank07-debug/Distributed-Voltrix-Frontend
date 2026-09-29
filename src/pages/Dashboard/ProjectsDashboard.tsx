import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FolderPlus,
  Zap,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Shield,
  Clock,
  Code2,
  Search,
  Sparkles,
  AlertTriangle,
  X,
} from 'lucide-react';
import { projectsApi, ProjectSummary, ProjectRole } from '../../api/workspace';
import { ParticleBackground } from '../../components/canvas/ParticleBackground';
import { toast } from 'sonner';

export const ProjectsDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null);
  const [editName, setEditName] = useState('');

  const [deletingProject, setDeletingProject] = useState<ProjectSummary | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (name: string) => projectsApi.createProject(name),
    onSuccess: () => {
      toast.success('Project created successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateOpen(false);
      setNewProjectName('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create project';
      toast.error(msg);
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => projectsApi.updateProject(id, name),
    onSuccess: () => {
      toast.success('Project renamed successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to rename project';
      toast.error(msg);
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeletingProject(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete project';
      toast.error(msg);
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

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: ProjectRole) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-voltrix-violet/20 text-voltrix-violet-light border border-voltrix-violet/30">
            <Shield className="w-3 h-3" /> OWNER
          </span>
        );
      case 'EDITOR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-voltrix-cyan/20 text-voltrix-cyan-light border border-voltrix-cyan/30">
            <Code2 className="w-3 h-3" /> EDITOR
          </span>
        );
      case 'VIEWER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-gray-800 text-gray-400 border border-gray-700">
            VIEWER
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#070709] px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
      {/* 3D Particle Ambient Background */}
      <ParticleBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Projects Workspace
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-full bg-voltrix-card border border-voltrix-border text-voltrix-cyan">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </h1>
            <p className="text-xs text-voltrix-muted mt-1">
              Select a project to enter the AI code editor or launch a new application.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Filter Search Bar */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-voltrix-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name..."
            className="w-full bg-voltrix-card/80 border border-voltrix-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-voltrix-cyan focus:outline-none transition-all"
          />
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-voltrix-card/60 border border-white/5 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-white/10 rounded w-2/3" />
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                </div>
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">Failed to load projects</h3>
            <p className="text-xs text-rose-300 mt-1">Check your API gateway connection or retry.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-mono transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredProjects.length === 0 && (
          <div className="p-12 rounded-3xl glass-panel text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-voltrix-violet/10 border border-voltrix-violet/30 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-voltrix-cyan" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">No projects found</h3>
            <p className="text-xs text-voltrix-muted mb-6">
              {searchQuery
                ? 'No project matches your search prompt.'
                : 'You have not built any apps yet. Create your first project to experience Voltrix AI generation.'}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white text-xs font-semibold shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Create First Project
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && !isError && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-2xl glass-panel-interactive p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-display text-lg font-bold text-white group-hover:text-voltrix-cyan transition-colors truncate max-w-[220px]"
                    >
                      {project.name}
                    </Link>

                    {/* Actions dropdown button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveMenuId(activeMenuId === project.id ? null : project.id);
                        }}
                        className="p-1.5 rounded-lg text-voltrix-muted hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === project.id && (
                        <div className="absolute right-0 mt-1 w-36 py-1 bg-voltrix-card border border-voltrix-border rounded-xl shadow-2xl z-20 text-xs">
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setEditName(project.name);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-voltrix-cyan" />
                            Rename
                          </button>
                          {project.role === 'OWNER' && (
                            <button
                              onClick={() => {
                                setDeletingProject(project);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {getRoleBadge(project.role)}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-voltrix-muted">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-voltrix-violet-light" />
                    <span>Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-voltrix-cyan hover:text-white transition-colors"
                  >
                    Open Workspace <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-voltrix-border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-voltrix-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-voltrix-cyan" /> Create New Project
            </h2>
            <p className="text-xs text-voltrix-muted mb-5">
              Name your project workspace. Voltrix AI will initialize your file system structure.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">PROJECT NAME</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Voltrix SaaS Dashboard"
                  className="w-full bg-[#0D0E15] border border-voltrix-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-voltrix-cyan focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  {createMutation.isPending ? 'Creating...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-voltrix-border shadow-2xl relative">
            <button
              onClick={() => setEditingProject(null)}
              className="absolute top-4 right-4 text-voltrix-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-xl font-bold text-white mb-4">Rename Project</h2>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">PROJECT NAME</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0D0E15] border border-voltrix-border rounded-xl px-4 py-2 text-sm text-white focus:border-voltrix-cyan focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-voltrix-cyan text-black text-xs font-semibold hover:bg-voltrix-cyan-light"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (OWNER Only) */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-rose-500/30 shadow-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="font-display text-lg font-bold text-white mb-1">Delete "{deletingProject.name}"?</h2>
            <p className="text-xs text-voltrix-muted mb-6">
              This action cannot be undone. All project files, chat history, and member access will be permanently purged.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-lg shadow-rose-900/30"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
