import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserPlus, Shield, Code2, Trash2, Mail, Users } from 'lucide-react';
import { projectsApi, Member, ProjectRole } from '../../api/workspace';
import { toast } from 'sonner';

interface MembersDrawerProps {
  projectId: string;
  userRole: ProjectRole;
  isOpen: boolean;
  onClose: () => void;
}

export const MembersDrawer: React.FC<MembersDrawerProps> = ({
  projectId,
  userRole,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectRole>('EDITOR');

  const isOwner = userRole === 'OWNER';

  // Fetch project members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectsApi.getMembers(projectId),
    enabled: isOpen,
  });

  // Invite member mutation
  const addMutation = useMutation({
    mutationFn: ({ username, role }: { username: string; role: ProjectRole }) =>
      projectsApi.addMember(projectId, username, role),
    onSuccess: () => {
      toast.success('Member invited successfully!');
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      setInviteEmail('');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to invite member';
      toast.error(msg);
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: ProjectRole }) =>
      projectsApi.updateMemberRole(projectId, memberId, role),
    onSuccess: () => {
      toast.success('Member role updated');
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to update member role';
      toast.error(msg);
    },
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: (memberId: string) => projectsApi.removeMember(projectId, memberId),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to remove member';
      toast.error(msg);
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Enter an email address to invite');
      return;
    }
    addMutation.mutate({ username: inviteEmail.trim(), role: inviteRole });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--landing-surface-1)] border-l border-[var(--landing-border-strong)] h-full flex flex-col p-6 shadow-2xl relative animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--landing-border)]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--landing-accent)]" />
            <h3 className="font-display text-lg font-bold text-[var(--landing-text-primary)]">
              collaborators.
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[var(--landing-border)] hover:bg-white/10 text-[var(--landing-text-secondary)] hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close collaborators drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Form (Owner only) */}
        {isOwner && (
          <form onSubmit={handleInviteSubmit} className="py-4 border-b border-[var(--landing-border)] space-y-3">
            <p className="text-xs font-mono font-medium text-[var(--landing-text-secondary)] uppercase">
              INVITE TEAM MEMBER
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@voltrix.ai"
                className="flex-1 h-10 bg-[var(--landing-surface-2)] border border-[var(--landing-border)] rounded-xl px-3 text-xs text-[var(--landing-text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)] font-mono"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
                className="h-10 px-2.5 rounded-xl bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-xs font-mono text-[var(--landing-text-secondary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)] cursor-pointer"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full h-9 rounded-full bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] text-[#090D0F] font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{addMutation.isPending ? 'sending...' : 'send invitation'}</span>
            </button>
          </form>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3" data-lenis-prevent>
          <p className="text-xs font-mono text-[var(--landing-text-secondary)] uppercase">
            MEMBERS ({members.length})
          </p>

          {isLoading ? (
            <div className="text-xs font-mono text-[var(--landing-text-secondary)] p-4 text-center">
              loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-xs font-mono text-[var(--landing-text-secondary)] p-4 text-center">
              no other members invited yet.
            </div>
          ) : (
            members.map((m: Member) => (
              <div
                key={m.userId}
                className="p-3 rounded-2xl bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--landing-text-primary)] truncate font-sans">
                    {m.name || m.username}
                  </p>
                  <p className="text-[11px] font-mono text-[var(--landing-text-secondary)] truncate">
                    {m.username}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOwner && m.projectRole !== 'OWNER' ? (
                    <select
                      value={m.projectRole}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          memberId: m.userId,
                          role: e.target.value as ProjectRole,
                        })
                      }
                      className="h-7 px-2 rounded-lg bg-[var(--landing-surface-1)] border border-[var(--landing-border)] text-[10px] font-mono text-[var(--landing-text-secondary)]"
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-[var(--landing-text-secondary)] uppercase">
                      {m.projectRole.toLowerCase()}
                    </span>
                  )}

                  {isOwner && m.projectRole !== 'OWNER' && (
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(m.userId)}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
