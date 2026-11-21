import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  AlertTriangle,
  FolderTree,
  MessageSquare,
  Code2,
  Globe,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { projectsApi, ProjectSummary, ProjectRole } from '../../api/workspace';
import { buildFileTree, FileNode } from '../../utils/fileTree';
import { ChatPane } from '../../components/workspace/ChatPane';
import { FileExplorerPane } from '../../components/workspace/FileExplorerPane';
import { MonacoEditorPane } from '../../components/workspace/MonacoEditorPane';
import { PreviewPane } from '../../components/workspace/PreviewPane';
import { MembersDrawer } from '../../components/workspace/MembersDrawer';
import { AppNavbar, WorkspaceStatus } from '../../components/layout/AppNavbar';
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
      f.path.endsWith('/src/main.tsx') ||
      f.path === 'src/index.tsx' ||
      f.path.endsWith('/src/index.tsx')
  );
  if (mainFile) return mainFile.path;

  const srcFile = files.find((f) => f.path.startsWith('src/') || f.path.includes('/src/'));
  if (srcFile) return srcFile.path;

  return files[0].path;
};

export const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  // Mobile / Tablet navigation tab: 'chat' | 'files' | 'editor' | 'preview'
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'editor' | 'preview'>('editor');

  // File explorer & editor state
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const hasAutoSelectedFileRef = useRef(false);

  // Deploy & preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`voltrix_deploy_${projectId}`) || null;
    } catch {
      return null;
    }
  });

  // Members drawer state
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  // Desktop panel widths (stored in localStorage)
  const [chatWidth, setChatWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('voltrix_ws_chat_w');
      return saved ? parseInt(saved, 10) : 340;
    } catch {
      return 340;
    }
  });

  const [treeWidth, setTreeWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('voltrix_ws_tree_w');
      return saved ? parseInt(saved, 10) : 240;
    } catch {
      return 240;
    }
  });

  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  const [previewPercent, setPreviewPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('voltrix_ws_prev_pct');
      return saved ? parseFloat(saved) : 40;
    } catch {
      return 40;
    }
  });

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

  const role: ProjectRole = project?.role || 'VIEWER';

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

  useEffect(() => {
    if (filesData?.files) {
      const tree = buildFileTree(filesData.files);
      setFileTree(tree);

      if (!hasAutoSelectedFileRef.current && filesData.files.length > 0) {
        hasAutoSelectedFileRef.current = true;
        if (activeFilePath === null && openTabs.length === 0) {
          const defaultFile = findDefaultFile(filesData.files);
          if (defaultFile) {
            setOpenTabs([defaultFile]);
            setActiveFilePath(defaultFile);
          }
        }
      }
    }
  }, [filesData, activeFilePath, openTabs.length]);

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
      setPreviewUrl(data.previewUrl);
      try {
        localStorage.setItem(`voltrix_deploy_${projectId}`, data.previewUrl);
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
    setActiveTab('editor');
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

  // Resizing logic for Chat Pane
  const handleChatResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = chatWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(260, Math.min(500, startWidth + delta));
      setChatWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      try {
        localStorage.setItem('voltrix_ws_chat_w', String(chatWidth));
      } catch {}
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Resizing logic for File Tree Pane
  const handleTreeResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = treeWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(180, Math.min(380, startWidth + delta));
      setTreeWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      try {
        localStorage.setItem('voltrix_ws_tree_w', String(treeWidth));
      } catch {}
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Resizing logic for Preview Pane
  const handlePreviewResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPct = previewPercent;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const totalWidth = window.innerWidth;
      const delta = startX - moveEvent.clientX;
      const deltaPct = (delta / totalWidth) * 100;
      const newPct = Math.max(25, Math.min(60, startPct + deltaPct));
      setPreviewPercent(newPct);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      try {
        localStorage.setItem('voltrix_ws_prev_pct', String(previewPercent));
      } catch {}
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Keyboard Shortcuts (Ctrl/Cmd+B, Ctrl/Cmd+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsTreeCollapsed((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsChatCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute status for AppNavbar
  const status: WorkspaceStatus = deployMutation.isPending
    ? 'generating'
    : previewUrl
    ? 'deployed'
    : 'idle';

  // Loading Skeleton State
  if (isLoadingProject) {
    return (
      <div className="h-[100dvh] w-full bg-[var(--landing-bg-ink)] flex flex-col items-center justify-center text-xs font-mono text-[var(--landing-text-secondary)] select-none">
        <Sparkles className="w-6 h-6 text-[var(--landing-accent)] animate-spin mb-3" />
        initializing voltrix workspace...
      </div>
    );
  }

  // Error State
  if (isProjectError || !project) {
    return (
      <div className="h-[100dvh] w-full bg-[var(--landing-bg-ink)] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">
          project workspace not found.
        </h2>
        <p className="text-xs text-[var(--landing-text-secondary)] max-w-sm mb-6 font-sans">
          You may not have permissions to access this project, or it might have been removed.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => refetchProject()}
            className="h-10 px-4 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-xs font-mono text-white hover:border-white/20 flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>retry</span>
          </button>
          <Link
            to="/projects"
            className="h-10 px-5 rounded-full bg-[var(--landing-accent)] text-[#090D0F] font-bold text-xs font-mono flex items-center justify-center"
          >
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

      {/* ── Desktop Resizable Workspace Layout (≥ 1100px) ────────────────── */}
      <div className="hidden min-[1100px]:flex flex-1 overflow-hidden relative">
        {/* Zone 1: Chat Pane */}
        {!isChatCollapsed && (
          <div
            style={{ width: `${chatWidth}px` }}
            className="shrink-0 h-full overflow-hidden transition-[width] duration-75"
          >
            <ChatPane
              projectId={projectId!}
              role={role}
              onFileEdited={handleFileEdited}
            />
          </div>
        )}

        {/* Chat Resizer Handle */}
        {!isChatCollapsed && (
          <div
            role="separator"
            tabIndex={0}
            onMouseDown={handleChatResizeStart}
            onDoubleClick={() => setChatWidth(340)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setChatWidth((w) => Math.max(260, w - 10));
              if (e.key === 'ArrowRight') setChatWidth((w) => Math.min(500, w + 10));
            }}
            className="w-1.5 hover:w-2 -ml-1 h-full cursor-col-resize hover:bg-[var(--landing-accent)] transition-all z-20 shrink-0"
            title="Drag to resize chat (Double click to reset)"
          />
        )}

        {/* Zone 2: File Tree Explorer */}
        <div
          style={{ width: isTreeCollapsed ? '56px' : `${treeWidth}px` }}
          className="shrink-0 h-full overflow-hidden transition-[width] duration-150"
        >
          <FileExplorerPane
            tree={fileTree}
            activeFilePath={activeFilePath}
            onSelectFile={handleSelectFile}
            isLoading={isLoadingFiles}
            isCollapsed={isTreeCollapsed}
            totalFilesCount={filesData?.files?.length}
          />
        </div>

        {/* Tree Resizer Handle */}
        {!isTreeCollapsed && (
          <div
            role="separator"
            tabIndex={0}
            onMouseDown={handleTreeResizeStart}
            onDoubleClick={() => setTreeWidth(240)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setTreeWidth((w) => Math.max(180, w - 10));
              if (e.key === 'ArrowRight') setTreeWidth((w) => Math.min(380, w + 10));
            }}
            className="w-1.5 hover:w-2 -ml-1 h-full cursor-col-resize hover:bg-[var(--landing-accent)] transition-all z-20 shrink-0"
            title="Drag to resize file tree (Double click to reset)"
          />
        )}

        {/* Zone 3: Monaco Editor (flex-1) */}
        <div className="flex-1 min-w-[340px] h-full overflow-hidden">
          <MonacoEditorPane
            openTabs={openTabs}
            activeFilePath={activeFilePath}
            fileContent={fileContent}
            isLoadingContent={isLoadingContent}
            onSelectTab={setActiveFilePath}
            onCloseTab={handleCloseTab}
            onCloseOthers={handleCloseOthers}
            onCloseAll={handleCloseAll}
            isStreaming={deployMutation.isPending}
          />
        </div>

        {/* Preview Resizer Handle */}
        <div
          role="separator"
          tabIndex={0}
          onMouseDown={handlePreviewResizeStart}
          onDoubleClick={() => setPreviewPercent(40)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPreviewPercent((p) => Math.min(60, p + 2));
            if (e.key === 'ArrowRight') setPreviewPercent((p) => Math.max(25, p - 2));
          }}
          className="w-1.5 hover:w-2 -ml-1 h-full cursor-col-resize hover:bg-[var(--landing-accent)] transition-all z-20 shrink-0"
          title="Drag to resize preview (Double click to reset)"
        />

        {/* Zone 4: Live Preview Pane */}
        <div
          style={{ width: `${previewPercent}%` }}
          className="shrink-0 h-full overflow-hidden border-l border-[var(--landing-border)]"
        >
          <PreviewPane
            previewUrl={previewUrl}
            onDeploy={() => deployMutation.mutate()}
            isDeploying={deployMutation.isPending}
          />
        </div>
      </div>

      {/* ── Tablet Layout (700px to 1099px) ───────────────────────────────── */}
      <div className="hidden min-[700px]:max-[1099px]:flex flex-col flex-1 overflow-hidden">
        {/* Tablet Top Tab Selector */}
        <div className="h-10 px-4 bg-[var(--landing-bg-ink)] border-b border-[var(--landing-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'editor'
                  ? 'bg-[var(--landing-surface-2)] text-[var(--landing-accent)] font-semibold'
                  : 'text-[var(--landing-text-secondary)] hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-[var(--landing-surface-2)] text-[var(--landing-accent)] font-semibold'
                  : 'text-[var(--landing-text-secondary)] hover:text-white'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'preview'
                  ? 'bg-[var(--landing-surface-2)] text-[var(--landing-accent)] font-semibold'
                  : 'text-[var(--landing-text-secondary)] hover:text-white'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsTreeCollapsed((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--landing-border)] hover:bg-white/5 text-xs font-mono text-[var(--landing-text-secondary)]"
          >
            <FolderTree className="w-3.5 h-3.5 text-[var(--landing-accent)]" />
            <span>{isTreeCollapsed ? 'Show Files' : 'Hide Files'}</span>
          </button>
        </div>

        {/* Tablet Body (Keep mounted for zero state loss) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Collapsible File Drawer */}
          {!isTreeCollapsed && (
            <div className="w-60 h-full shrink-0 border-r border-[var(--landing-border)]">
              <FileExplorerPane
                tree={fileTree}
                activeFilePath={activeFilePath}
                onSelectFile={handleSelectFile}
                isLoading={isLoadingFiles}
              />
            </div>
          )}

          {/* Editor view */}
          <div className={`flex-1 h-full ${activeTab === 'editor' ? 'flex flex-col' : 'hidden'}`}>
            <MonacoEditorPane
              openTabs={openTabs}
              activeFilePath={activeFilePath}
              fileContent={fileContent}
              isLoadingContent={isLoadingContent}
              onSelectTab={setActiveFilePath}
              onCloseTab={handleCloseTab}
              onCloseOthers={handleCloseOthers}
              onCloseAll={handleCloseAll}
              isStreaming={deployMutation.isPending}
            />
          </div>

          {/* Chat view */}
          <div className={`flex-1 h-full ${activeTab === 'chat' ? 'flex flex-col' : 'hidden'}`}>
            <ChatPane
              projectId={projectId!}
              role={role}
              onFileEdited={handleFileEdited}
            />
          </div>

          {/* Preview view */}
          <div className={`flex-1 h-full ${activeTab === 'preview' ? 'flex flex-col' : 'hidden'}`}>
            <PreviewPane
              previewUrl={previewUrl}
              onDeploy={() => deployMutation.mutate()}
              isDeploying={deployMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile Layout (< 700px) with Bottom Tab Bar ──────────────────── */}
      <div className="min-[700px]:hidden flex flex-col flex-1 overflow-hidden">
        {/* Panels kept mounted via display none/flex */}
        <div className="flex-1 overflow-hidden relative">
          <div className={`h-full ${activeTab === 'chat' ? 'flex flex-col' : 'hidden'}`}>
            <ChatPane
              projectId={projectId!}
              role={role}
              onFileEdited={handleFileEdited}
            />
          </div>

          <div className={`h-full ${activeTab === 'files' ? 'flex flex-col' : 'hidden'}`}>
            <FileExplorerPane
              tree={fileTree}
              activeFilePath={activeFilePath}
              onSelectFile={handleSelectFile}
              isLoading={isLoadingFiles}
            />
          </div>

          <div className={`h-full ${activeTab === 'editor' ? 'flex flex-col' : 'hidden'}`}>
            <MonacoEditorPane
              openTabs={openTabs}
              activeFilePath={activeFilePath}
              fileContent={fileContent}
              isLoadingContent={isLoadingContent}
              onSelectTab={setActiveFilePath}
              onCloseTab={handleCloseTab}
              onCloseOthers={handleCloseOthers}
              onCloseAll={handleCloseAll}
              isStreaming={deployMutation.isPending}
            />
          </div>

          <div className={`h-full ${activeTab === 'preview' ? 'flex flex-col' : 'hidden'}`}>
            <PreviewPane
              previewUrl={previewUrl}
              onDeploy={() => deployMutation.mutate()}
              isDeploying={deployMutation.isPending}
            />
          </div>
        </div>

        {/* Mobile Bottom Tab Bar (56px) */}
        <nav
          className="h-14 min-h-14 max-h-14 bg-[var(--landing-surface-1)] border-t border-[var(--landing-border)] grid grid-cols-4 items-center shrink-0 pb-[env(safe-area-inset-bottom)] z-30"
          aria-label="Mobile workspace views"
        >
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`h-full flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
              activeTab === 'files'
                ? 'text-[var(--landing-accent)] font-bold'
                : 'text-[var(--landing-text-secondary)] hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Files</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`h-full flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
              activeTab === 'editor'
                ? 'text-[var(--landing-accent)] font-bold'
                : 'text-[var(--landing-text-secondary)] hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`h-full flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
              activeTab === 'chat'
                ? 'text-[var(--landing-accent)] font-bold'
                : 'text-[var(--landing-text-secondary)] hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`h-full flex flex-col items-center justify-center gap-1 text-[10px] font-mono transition-colors ${
              activeTab === 'preview'
                ? 'text-[var(--landing-accent)] font-bold'
                : 'text-[var(--landing-text-secondary)] hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </nav>
      </div>

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
