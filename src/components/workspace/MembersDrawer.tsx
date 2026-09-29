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
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to invite member';
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
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update member role';
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
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to remove member';
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#070709] border-l border-voltrix-border h-full flex flex-col p-6 shadow-2xl relative animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-voltrix-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-voltrix-cyan" />
            <h3 className="font-display text-lg font-bold text-white">Project Collaborators</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-voltrix-muted hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite Form (Owner & Editor only) */}
        {userRole !== 'VIEWER' && (
          <form onSubmit={handleInviteSubmit} className="py-5 border-b border-voltrix-border space-y-3">
            <h4 className="text-xs font-mono font-medium text-gray-300">INVITE TEAM MEMBER</h4>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-voltrix-muted" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@domain.com"
                  className="w-full bg-voltrix-card border border-voltrix-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-voltrix-cyan focus:outline-none"
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
                className="bg-voltrix-card border border-voltrix-border rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:border-voltrix-cyan focus:outline-none"
              >
                <option value="EDITOR">EDITOR</option>
                <option value="VIEWER">VIEWER</option>
                {isOwner && <option value="OWNER">OWNER</option>}
              </select>
            </div>

            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{addMutation.isPending ? 'Sending Invite...' : 'Invite Collaborator'}</span>
            </button>
          </form>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <h4 className="text-xs font-mono font-medium text-voltrix-muted">MEMBERS LIST ({members.length})</h4>

          {isLoading ? (
            <div className="text-xs font-mono text-voltrix-muted py-4">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-xs font-mono text-voltrix-muted py-4">No members found.</div>
          ) : (
            members.map((member) => (
              <div
                key={member.userId}
                className="p-3 rounded-xl bg-voltrix-card border border-voltrix-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-voltrix-violet to-voltrix-cyan flex items-center justify-center font-bold text-white shrink-0">
                    {(member.name || member.username)?.[0]?.toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{member.name || member.username}</p>
                    <p className="text-[11px] font-mono text-voltrix-muted truncate">{member.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOwner ? (
                    <select
                      value={member.projectRole}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          memberId: member.userId,
                          role: e.target.value as ProjectRole,
                        })
                      }
                      className="bg-[#070709] border border-voltrix-border rounded-lg px-2 py-1 text-[11px] font-mono text-voltrix-cyan"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  ) : (
                    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-voltrix-cyan">
                      {member.projectRole}
                    </span>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => removeMutation.mutate(member.userId)}
                      className="p-1 text-voltrix-muted hover:text-rose-400 transition-colors"
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
