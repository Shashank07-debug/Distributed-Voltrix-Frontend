import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Rocket,
  Users,
  Shield,
  Code2,
  Eye,
  MessageSquare,
  Files,
  Globe,
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

      // Auto-open first file if none open
      if (filesData.files.length > 0 && openTabs.length === 0) {
        const firstFile = filesData.files[0].path;
        setOpenTabs([firstFile]);
        setActiveFilePath(firstFile);
      }
    }
  }, [filesData]);

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
      <div className="h-screen w-screen bg-[#070709] flex flex-col items-center justify-center text-xs font-mono text-voltrix-muted">
        <Sparkles className="w-8 h-8 text-voltrix-cyan animate-spin mb-3" />
        Initializing Voltrix Workspace...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070709] overflow-hidden text-gray-100 selection:bg-voltrix-violet selection:text-white">
      {/* Workspace Top Bar */}
      <header className="h-14 border-b border-voltrix-border bg-[#0D0E15] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="p-1.5 rounded-lg text-voltrix-muted hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-white">{project?.name || 'Workspace'}</span>
            {role === 'OWNER' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-voltrix-violet/20 text-voltrix-violet-light border border-voltrix-violet/30">
                <Shield className="w-3 h-3" /> OWNER
              </span>
            )}
            {role === 'EDITOR' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-voltrix-cyan/20 text-voltrix-cyan-light border border-voltrix-cyan/30">
                <Code2 className="w-3 h-3" /> EDITOR
              </span>
            )}
            {role === 'VIEWER' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-gray-800 text-gray-400 border border-gray-700">
                <Eye className="w-3 h-3" /> VIEWER
              </span>
            )}
          </div>
        </div>

        {/* Desktop / Mobile Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile view switch tabs */}
          <div className="flex lg:hidden bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setMobileTab('chat')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                mobileTab === 'chat' ? 'bg-voltrix-violet text-white' : 'text-gray-400'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setMobileTab('files')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                mobileTab === 'files' ? 'bg-voltrix-violet text-white' : 'text-gray-400'
              }`}
            >
              Files
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                mobileTab === 'preview' ? 'bg-voltrix-violet text-white' : 'text-gray-400'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={() => setIsMembersOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-voltrix-card hover:bg-voltrix-card-hover border border-voltrix-border text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-voltrix-cyan" />
            <span className="hidden sm:inline">Collaborators</span>
          </button>

          {role !== 'VIEWER' && (
            <button
              onClick={() => deployMutation.mutate()}
              disabled={deployMutation.isPending}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{deployMutation.isPending ? 'Deploying...' : 'Deploy Preview'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main 3-Pane Resizable Grid (Desktop) vs Tabs (Mobile) */}
      <div className="flex-1 overflow-hidden relative">
        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-12 h-full">
          {/* Left Pane: Chat (3.5 cols) */}
          <div className="col-span-3 h-full overflow-hidden">
            <ChatPane
              projectId={projectId!}
              role={role}
              onFileEdited={handleFileEdited}
            />
          </div>

          {/* Middle Pane: Files Explorer (2.5 cols) + Monaco Editor (3.5 cols) */}
          <div className="col-span-5 h-full grid grid-cols-5 border-r border-voltrix-border overflow-hidden">
            <div className="col-span-2 h-full overflow-hidden">
              <FileExplorerPane
                tree={fileTree}
                activeFilePath={activeFilePath}
                onSelectFile={handleSelectFile}
                isLoading={isLoadingFiles}
              />
            </div>
            <div className="col-span-3 h-full overflow-hidden">
              <MonacoEditorPane
                openTabs={openTabs}
                activeFilePath={activeFilePath}
                fileContent={fileContent}
                isLoadingContent={isLoadingContent}
                onSelectTab={setActiveFilePath}
                onCloseTab={handleCloseTab}
              />
            </div>
          </div>

          {/* Right Pane: Live Preview Iframe (4 cols) */}
          <div className="col-span-4 h-full overflow-hidden">
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
