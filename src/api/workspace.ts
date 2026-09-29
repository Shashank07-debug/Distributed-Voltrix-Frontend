import { workspaceApi } from './client';

export type ProjectRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  role: ProjectRole;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeployResponse {
  previewUrl: string;
}

export interface Member {
  userId: string;
  username: string;
  name: string;
  projectRole: ProjectRole;
  invitedAt: string;
}

export interface FileItem {
  path: string;
}

export interface ProjectFilesResponse {
  files: FileItem[];
}

export const projectsApi = {
  getProjects: async (): Promise<ProjectSummary[]> => {
    const response = await workspaceApi.get<ProjectSummary[]>('/projects');
    return response.data;
  },

  createProject: async (name: string): Promise<Project> => {
    const response = await workspaceApi.post<Project>('/projects', { name });
    return response.data;
  },

  getProject: async (id: string): Promise<ProjectSummary> => {
    const response = await workspaceApi.get<ProjectSummary>(`/projects/${id}`);
    return response.data;
  },

  updateProject: async (id: string, name: string): Promise<Project> => {
    const response = await workspaceApi.patch<Project>(`/projects/${id}`, { name });
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await workspaceApi.delete(`/projects/${id}`);
  },

  deployProject: async (id: string): Promise<DeployResponse> => {
    const response = await workspaceApi.post<DeployResponse>(`/projects/${id}/deploy`);
    return response.data;
  },

  // Members API
  getMembers: async (projectId: string): Promise<Member[]> => {
    const response = await workspaceApi.get<Member[]>(`/projects/${projectId}/members`);
    return response.data;
  },

  addMember: async (projectId: string, username: string, role: ProjectRole): Promise<Member> => {
    const response = await workspaceApi.post<Member>(`/projects/${projectId}/members`, {
      username,
      role,
    });
    return response.data;
  },

  updateMemberRole: async (projectId: string, memberId: string, role: ProjectRole): Promise<Member> => {
    const response = await workspaceApi.patch<Member>(`/projects/${projectId}/members/${memberId}`, {
      role,
    });
    return response.data;
  },

  removeMember: async (projectId: string, memberId: string): Promise<void> => {
    await workspaceApi.delete(`/projects/${projectId}/members/${memberId}`);
  },

  // Files API
  getFiles: async (projectId: string): Promise<ProjectFilesResponse> => {
    const response = await workspaceApi.get<ProjectFilesResponse>(`/projects/${projectId}/files`);
    return response.data;
  },

  getFileContent: async (projectId: string, filePath: string): Promise<string> => {
    const encodedPath = encodeURIComponent(filePath);
    const response = await workspaceApi.get<string>(
      `/projects/${projectId}/files/content?path=${encodedPath}`,
      { responseType: 'text' }
    );
    return response.data;
  },
};
