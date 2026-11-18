import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Rocket,
  Users,
  Sparkles,
} from 'lucide-react';
import { projectsApi, ProjectSummary, ProjectRole } from '../../api/workspace';
import { buildFileTree, FileNode } from '../../utils/fileTree';
import { ChatPane } from '../../components/workspace/ChatPane';
import { FileExplorerPane } from '../../components/workspace/FileExplorerPane';
import { MonacoEditorPane } from '../../components/workspace/MonacoEditorPane';
import { PreviewPane } from '../../components/workspace/PreviewPane';
import { MembersDrawer } from '../../components/workspace/MembersDrawer';
import { toast } from 'sonner';

const findDefaultFile = (files: { path: string }[]): string | null => {
  if (!files || files.length === 0) return null;
  // 1. src/App.tsx (or App.tsx)
  const appFile = files.find(
    (f) =>
      f.path === 'src/App.tsx' ||
      f.path.endsWith('/src/App.tsx') ||
      f.path === 'App.tsx' ||
      f.path.endsWith('/App.tsx')
  );
  if (appFile) return appFile.path;

  // 2. src/main.tsx (or main.tsx / src/index.tsx)
  const mainFile = files.find(
    (f) =>
      f.path === 'src/main.tsx' ||
      f.path.endsWith('/src/main.tsx') ||
      f.path === 'src/index.tsx' ||
      f.path.endsWith('/src/index.tsx')
  );
  if (mainFile) return mainFile.path;

  // 3. First file inside src/
  const srcFile = files.find((f) => f.path.startsWith('src/') || f.path.includes('/src/'));
  if (srcFile) return srcFile.path;

  // 4. First file in repository
  return files[0].path;
};

export const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  // Active view tab for mobile layout
  const [mobileTab, setMobileTab] = useState<'chat' | 'files' | 'preview'>('chat');

  // File explorer & editor state
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const hasAutoSelectedFileRef = useRef(false);

  // Deploy & preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Members drawer state
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  // Fetch Project Metadata
  const { data: project, isLoading: isLoadingProject } = useQuery<ProjectSummary>({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: Boolean(projectId),
  });

  const role: ProjectRole = project?.role || 'VIEWER';

  // Fetch Files Tree
  const { data: filesData, isLoading: isLoadingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: () => projectsApi.getFiles(projectId!),
    enabled: Boolean(projectId),
  });

  useEffect(() => {
    if (filesData?.files) {
      const tree = buildFileTree(filesData.files);
      setFileTree(tree);

      // Auto-open prioritized default file only on initial load if no file active
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
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Deployment failed';
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

  // Called when AI streams a FILE_EDIT event
  const handleFileEdited = (editedPath: string) => {
    refetchFiles();
    if (activeFilePath === editedPath) {
      // Re-fetch active file content
      projectsApi
        .getFileContent(projectId!, editedPath)
        .then((data) => setFileContent(data || ''))
        .catch(() => {});
    }
  };

  if (isLoadingProject) {
    return (
      <div className="h-screen w-screen bg-surface-base flex flex-col items-center justify-center text-[13px] font-sans text-text-secondary">
        <Sparkles className="w-6 h-6 text-accent-teal animate-spin mb-3" />
        Initializing Voltrix Workspace...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-base overflow-hidden text-text-primary selection:bg-accent-teal/30 selection:text-text-primary font-sans">
      {/* Workspace Top Bar (48px) */}
      <header className="h-14 min-h-14 max-h-14 box-border border-b border-border-subtle bg-surface-base pt-[env(safe-area-inset-top)] px-3.5 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/projects"
            className="flex items-center justify-center w-11 h-11 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-raised transition-colors focus-visible:outline-accent"
            title="Back to Dashboard"
            aria-label="Back to Projects Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Breadcrumb: Projects / <project name> */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] font-sans">
            <Link
              to="/projects"
              className="text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Projects
            </Link>
            <span className="text-text-tertiary">/</span>
            <span className="text-text-primary font-medium truncate max-w-[140px] sm:max-w-[220px]">
              {project?.name || 'Workspace'}
            </span>
          </nav>

          {/* Role badge: No OWNER badge; quiet neutral tag only for Editor / Viewer */}
          {role === 'EDITOR' && (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-sans font-medium text-text-tertiary bg-surface-raised border border-border-subtle">
              Editor
            </span>
          )}
          {role === 'VIEWER' && (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-sans font-medium text-text-tertiary bg-surface-raised border border-border-subtle">
              Viewer
            </span>
          )}

          {/* Quiet Status Chip */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-sans text-text-tertiary bg-surface-panel border border-border-subtle">
            {deployMutation.isPending ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse" />
                <span className="text-text-secondary">Building</span>
              </>
            ) : previewUrl ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                <span className="text-text-secondary">Live</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary opacity-50" />
                <span>Not deployed</span>
              </>
            )}
          </div>
        </div>

        {/* Desktop Actions & Mobile Segmented Switcher */}
        <div className="flex items-center gap-2">
          {/* Mobile view switch tabs (segmented control) */}
          <div className="flex lg:hidden bg-surface-panel p-0.5 rounded-lg border border-border-subtle">
            <button
              onClick={() => setMobileTab('chat')}
              className={`px-2.5 py-1 rounded-md text-[12px] font-sans font-medium transition-colors ${
                mobileTab === 'chat'
                  ? 'bg-surface-raised text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setMobileTab('files')}
              className={`px-2.5 py-1 rounded-md text-[12px] font-sans font-medium transition-colors ${
                mobileTab === 'files'
                  ? 'bg-surface-raised text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Files
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-2.5 py-1 rounded-md text-[12px] font-sans font-medium transition-colors ${
                mobileTab === 'preview'
                  ? 'bg-surface-raised text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={() => setIsMembersOpen(true)}
            className="h-8 px-2.5 rounded-lg bg-transparent hover:bg-surface-raised border border-border-subtle hover:border-border-hover text-[13px] font-sans font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors focus-visible:outline-accent cursor-pointer"
            title="View Collaborators"
            aria-label="View Project Collaborators"
          >
            <Users className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="hidden sm:inline">Collaborators</span>
          </button>

          {role !== 'VIEWER' && (
            <button
              onClick={() => deployMutation.mutate()}
              disabled={deployMutation.isPending}
              className="h-8 px-3 rounded-lg bg-accent-teal hover:bg-accent-teal-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0B0F] text-[13px] font-sans font-medium transition-colors flex items-center gap-1.5 focus-visible:outline-accent cursor-pointer"
              title="Deploy project preview"
              aria-label="Deploy preview"
            >
              <Rocket className="w-3.5 h-3.5 text-[#0B0B0F]" />
              <span>{deployMutation.isPending ? 'Deploying...' : 'Deploy'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main 3-Pane Resizable Grid (Desktop) vs Tabs (Mobile) */}
      <div className="flex-1 overflow-hidden relative">
        {/* Desktop Layout with Balanced Proportions & 1px Dividers */}
        <div className="hidden lg:flex h-full w-full overflow-hidden bg-surface-base">
          {/* Panel 1: Chat Pane (300px - 360px) */}
          <div className="w-[300px] xl:w-[330px] 2xl:w-[360px] shrink-0 h-full overflow-hidden border-r border-border-subtle bg-surface-base">
            <ChatPane
              projectId={projectId!}
              role={role}
              onFileEdited={handleFileEdited}
            />
          </div>

          {/* Panel 2: Files Explorer (Fixed 240px) */}
          <div className="w-[240px] min-w-[240px] max-w-[240px] shrink-0 h-full overflow-hidden border-r border-border-subtle bg-surface-base">
            <FileExplorerPane
              tree={fileTree}
              activeFilePath={activeFilePath}
              onSelectFile={handleSelectFile}
              isLoading={isLoadingFiles}
            />
          </div>

          {/* Panel 3: Monaco Editor (Primary Surface, flex-1.1) */}
          <div className="flex-[1.1] min-w-[320px] h-full overflow-hidden border-r border-border-subtle bg-surface-base">
            <MonacoEditorPane
              openTabs={openTabs}
              activeFilePath={activeFilePath}
              fileContent={fileContent}
              isLoadingContent={isLoadingContent}
              onSelectTab={setActiveFilePath}
              onCloseTab={handleCloseTab}
            />
          </div>

          {/* Panel 4: Live Preview Pane (flex-1) */}
          <div className="flex-1 min-w-[300px] h-full overflow-hidden bg-surface-base">
            <PreviewPane
              previewUrl={previewUrl}
              onDeploy={() => deployMutation.mutate()}
              isDeploying={deployMutation.isPending}
            />
          </div>
        </div>

        {/* Mobile Tabbed Layout */}
        <div className="lg:hidden h-full">
          {mobileTab === 'chat' && (
            <ChatPane
              projectId={projectId!}
              role={role}
              onFileEdited={handleFileEdited}
            />
          )}

          {mobileTab === 'files' && (
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              <FileExplorerPane
                tree={fileTree}
                activeFilePath={activeFilePath}
                onSelectFile={handleSelectFile}
                isLoading={isLoadingFiles}
              />
              <MonacoEditorPane
                openTabs={openTabs}
                activeFilePath={activeFilePath}
                fileContent={fileContent}
                isLoadingContent={isLoadingContent}
                onSelectTab={setActiveFilePath}
                onCloseTab={handleCloseTab}
              />
            </div>
          )}

          {mobileTab === 'preview' && (
            <PreviewPane
              previewUrl={previewUrl}
              onDeploy={() => deployMutation.mutate()}
              isDeploying={deployMutation.isPending}
            />
          )}
        </div>
      </div>

      {/* Members Drawer */}
      <MembersDrawer
        projectId={projectId!}
        userRole={role}
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
      />
    </div>
  );
};
