import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { projectsApi, ProjectSummary, ProjectRole } from '../../api/workspace';
import { buildFileTree, FileNode } from '../../utils/fileTree';
import { ChatPane } from '../../components/workspace/ChatPane';
import { CodePane } from '../../components/workspace/CodePane';
import { PreviewPane } from '../../components/workspace/PreviewPane';
import { WorkspaceLayout } from '../../components/workspace/WorkspaceLayout';
import { MembersDrawer } from '../../components/workspace/MembersDrawer';
import { AppNavbar, WorkspaceStatus } from '../../components/layout/AppNavbar';
import { normalizePreviewUrl } from '../../utils/previewUrl';
import { pollFileTreeWithBackoff } from '../../utils/fileTreePoll';
import { toast } from 'sonner';

const findDefaultFile = (files: { path: string }[]): string | null => {
  if (!files || files.length === 0) return null;
  const appFile = files.find(
    (f) =>
      f.path === 'src/App.tsx' ||
      f.path.endsWith('/src/App.tsx') ||
      f.path === 'App.tsx' ||
      f.path.endsWith('/App.tsx')
  );
  if (appFile) return appFile.path;

  const mainFile = files.find(
    (f) =>
      f.path === 'src/main.tsx' ||
      f.path === 'src/index.tsx' ||
      f.path === 'src/App.jsx' ||
      f.path === 'index.html'
  );
  if (mainFile) return mainFile.path;

  const nonJson = files.find(
    (f) => !f.path.endsWith('.json') && !f.path.endsWith('.md') && !f.path.startsWith('.')
  );
  return nonJson ? nonJson.path : files[0].path;
};

export const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  // Tabs and editor file state
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isApplyingChanges, setIsApplyingChanges] = useState<boolean>(false);
  const hasAutoSelectedFileRef = useRef(false);

  // Deploy & preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(`voltrix_deploy_${projectId}`);
      return stored ? normalizePreviewUrl(stored) : null;
    } catch {
      return null;
    }
  });

  // Members drawer state
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  // Fetch Project Metadata
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isProjectError,
    refetch: refetchProject,
  } = useQuery<ProjectSummary>({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: Boolean(projectId),
  });

  // Fetch Files Tree
  const {
    data: filesData,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: () => projectsApi.getFiles(projectId!),
    enabled: Boolean(projectId),
  });

  const fileTree: FileNode[] = React.useMemo(() => {
    return buildFileTree(filesData?.files || []);
  }, [filesData]);

  // Auto-select initial file when project files load
  useEffect(() => {
    if (filesData?.files && filesData.files.length > 0 && !hasAutoSelectedFileRef.current) {
      const defaultPath = findDefaultFile(filesData.files);
      if (defaultPath) {
        hasAutoSelectedFileRef.current = true;
        setActiveFilePath(defaultPath);
        if (openTabs.length === 0) {
          setOpenTabs([defaultPath]);
        }
      }
    }
  }, [filesData, openTabs.length]);

  // Load File Content when active tab changes
  useEffect(() => {
    if (projectId && activeFilePath) {
      setIsLoadingContent(true);
      projectsApi
        .getFileContent(projectId, activeFilePath)
        .then((data) => {
          setFileContent(data || '');
        })
        .catch(() => {
          setFileContent('// Error loading file content or file is empty');
        })
        .finally(() => {
          setIsLoadingContent(false);
        });
    }
  }, [projectId, activeFilePath]);

  // Deploy Mutation
  const deployMutation = useMutation({
    mutationFn: () => projectsApi.deployProject(projectId!),
    onSuccess: (data) => {
      toast.success('Project deployed successfully!');
      const cleanUrl = normalizePreviewUrl(data.previewUrl);
      setPreviewUrl(cleanUrl);
      try {
        localStorage.setItem(`voltrix_deploy_${projectId}`, cleanUrl);
      } catch {}
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Deployment failed';
      toast.error(msg);
    },
  });

  const handleSelectFile = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
    setActiveFilePath(path);
  };

  const handleCloseTab = (path: string) => {
    const remaining = openTabs.filter((t) => t !== path);
    setOpenTabs(remaining);
    if (activeFilePath === path) {
      setActiveFilePath(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  const handleCloseOthers = (keepPath: string) => {
    setOpenTabs([keepPath]);
    setActiveFilePath(keepPath);
  };

  const handleCloseAll = () => {
    setOpenTabs([]);
    setActiveFilePath(null);
  };

  const handleFileEdited = (editedPath: string) => {
    refetchFiles();
    if (activeFilePath === editedPath) {
      projectsApi
        .getFileContent(projectId!, editedPath)
        .then((data) => setFileContent(data || ''))
        .catch(() => {});
    }
  };

  // Called when stream closes after receiving complete response
  const handleGenerationCompleted = () => {
    // 1. Refetch currently open file
    if (activeFilePath) {
      projectsApi
        .getFileContent(projectId!, activeFilePath)
        .then((data) => setFileContent(data || ''))
        .catch(() => {});
    }

    // 2. Poll file tree with backoff (1s, 2s, 3s, 5s) stopping as soon as tree updates
    if (projectId) {
      pollFileTreeWithBackoff({
        projectId,
        currentFiles: filesData?.files || [],
        onUpdate: () => {
          refetchFiles();
        },
        onApplyingChange: (isApplying) => {
          setIsApplyingChanges(isApplying);
        },
      });
    }
  };

  const role: ProjectRole = project?.role || 'VIEWER';

  // Compute status for AppNavbar
  const status: WorkspaceStatus = isApplyingChanges
    ? 'generating'
    : isStreaming
    ? 'generating'
    : isProjectError
    ? 'error'
    : previewUrl
    ? 'deployed'
    : 'idle';

  // Loading state
  if (isLoadingProject) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--landing-bg-ink)] text-[var(--landing-text-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--landing-accent)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--landing-text-secondary)]">
          loading workspace sandbox...
        </p>
      </div>
    );
  }

  // Error state
  if (isProjectError || !project) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--landing-bg-ink)] text-[var(--landing-text-primary)] p-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl font-bold mb-1">workspace not found.</h2>
        <p className="text-xs text-[var(--landing-text-secondary)] mb-6 text-center max-w-sm font-sans">
          This project could not be loaded or your session does not have access permissions.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetchProject()}
            aria-label="Retry loading project"
            className="h-10 px-4 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-xs font-mono text-white hover:border-white/20 flex items-center gap-2 cursor-pointer"
          >
            retry
          </button>
          <Link
            to="/projects"
            className="h-10 px-5 rounded-full bg-[var(--landing-accent)] text-[#090D0F] font-bold text-xs font-mono flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col bg-[var(--landing-bg-ink)] overflow-hidden text-[var(--landing-text-primary)] select-none font-sans">
      {/* ── AppNavbar (56px) ──────────────────────────────────────────────── */}
      <AppNavbar
        mode="workspace"
        projectName={project.name}
        projectRole={role}
        status={status}
        onDeploy={() => deployMutation.mutate()}
        isDeploying={deployMutation.isPending}
        onOpenCollaborators={() => setIsMembersOpen(true)}
      />

      {/* ── Redesigned Clean Two-Pane Resizable Workspace ─────────────────── */}
      <WorkspaceLayout
        isStreaming={isStreaming || isApplyingChanges}
        chatPanel={
          <ChatPane
            projectId={projectId!}
            role={role}
            onFileEdited={handleFileEdited}
            onStreamStateChange={setIsStreaming}
            onGenerationCompleted={handleGenerationCompleted}
          />
        }
        codePanel={
          <CodePane
            fileTree={fileTree}
            activeFilePath={activeFilePath}
            openTabs={openTabs}
            fileContent={fileContent}
            isLoadingFiles={isLoadingFiles}
            isLoadingContent={isLoadingContent}
            isStreaming={isStreaming || isApplyingChanges}
            onSelectFile={handleSelectFile}
            onSelectTab={setActiveFilePath}
            onCloseTab={handleCloseTab}
            onCloseOthers={handleCloseOthers}
            onCloseAll={handleCloseAll}
          />
        }
        previewPanel={
          <PreviewPane
            previewUrl={previewUrl}
            onDeploy={() => deployMutation.mutate()}
            isDeploying={deployMutation.isPending}
          />
        }
      />

      {/* ── Members Drawer ────────────────────────────────────────────────── */}
      <MembersDrawer
        projectId={projectId!}
        userRole={role}
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
      />
    </div>
  );
};
