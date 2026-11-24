import React, { useState, useEffect } from 'react';
import { FileNode } from '../../utils/fileTree';
import { FileExplorerPane } from './FileExplorerPane';
import { MonacoEditorPane } from './MonacoEditorPane';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface CodePaneProps {
  fileTree: FileNode[];
  activeFilePath: string | null;
  openTabs: string[];
  fileContent: string;
  isLoadingFiles: boolean;
  isLoadingContent: boolean;
  isStreaming?: boolean;
  onSelectFile: (path: string) => void;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onCloseOthers?: (path: string) => void;
  onCloseAll?: () => void;
}

export const CodePane: React.FC<CodePaneProps> = ({
  fileTree,
  activeFilePath,
  openTabs,
  fileContent,
  isLoadingFiles,
  isLoadingContent,
  isStreaming = false,
  onSelectFile,
  onSelectTab,
  onCloseTab,
  onCloseOthers,
  onCloseAll,
}) => {
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(() => {
    try {
      return localStorage.getItem('voltrix_ws_tree_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleTree = () => {
    setIsTreeCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('voltrix_ws_tree_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl/Cmd+B to toggle tree
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleTree();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--landing-surface-1)]">
      {/* ── Collapsible File Explorer Column (~240px) ──────────────────────── */}
      <div
        className={`h-full border-r border-[var(--landing-border)] transition-all duration-200 flex flex-col shrink-0 overflow-hidden ${
          isTreeCollapsed ? 'w-0 border-r-0' : 'w-[240px]'
        }`}
      >
        <FileExplorerPane
          tree={fileTree}
          activeFilePath={activeFilePath}
          isLoading={isLoadingFiles}
          onSelectFile={onSelectFile}
          isCollapsed={isTreeCollapsed}
        />
      </div>

      {/* ── Main Code Viewer Surface (flex-1) ──────────────────────────────── */}
      <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
        {/* Toggle File Tree Floating/Header Button when collapsed */}
        {isTreeCollapsed && (
          <button
            type="button"
            onClick={toggleTree}
            aria-label="Open file explorer (Ctrl+B)"
            title="Open file explorer (Ctrl+B)"
            className="absolute top-2 left-2 z-30 h-7 w-7 rounded-lg bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-text-secondary)] hover:text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <MonacoEditorPane
          openTabs={openTabs}
          activeFilePath={activeFilePath}
          fileContent={fileContent}
          isLoadingContent={isLoadingContent}
          onSelectTab={onSelectTab}
          onCloseTab={onCloseTab}
          onCloseOthers={onCloseOthers}
          onCloseAll={onCloseAll}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
};
