import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  FileImage,
  File,
  Settings,
  ChevronRight,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { FileNode } from '../../utils/fileTree';

interface FileExplorerPaneProps {
  tree: FileNode[];
  activeFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  isLoading?: boolean;
  isCollapsed?: boolean;
  totalFilesCount?: number;
}

export const getFileIcon = (fileName: string) => {
  const lower = fileName.toLowerCase();
  if (
    lower.startsWith('.git') ||
    lower.startsWith('.env') ||
    lower.includes('config') ||
    lower.includes('tsconfig') ||
    lower.includes('package') ||
    lower.startsWith('.oxlint')
  ) {
    return <Settings className="w-3.5 h-3.5 text-[var(--landing-text-secondary)] opacity-60 shrink-0" />;
  }

  const ext = lower.split('.').pop();
  switch (ext) {
    case 'tsx':
    case 'jsx':
      return <FileCode className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0" />;
    case 'ts':
    case 'js':
    case 'mjs':
      return <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case 'css':
    case 'scss':
      return <FileCode className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    case 'html':
      return <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
    case 'md':
    case 'txt':
      return <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'ico':
    case 'webp':
      return <FileImage className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    default:
      return <File className="w-3.5 h-3.5 text-[var(--landing-text-secondary)] shrink-0" />;
  }
};

const FileTreeNodeItem: React.FC<{
  node: FileNode;
  activeFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  depth?: number;
}> = ({ node, activeFilePath, onSelectFile, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = activeFilePath === node.path;

  const handleClick = () => {
    if (node.isDirectory) {
      setIsOpen((prev) => !prev);
    } else {
      onSelectFile(node.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (node.isDirectory && !isOpen) {
        setIsOpen(true);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (node.isDirectory && isOpen) {
        setIsOpen(false);
      }
    }
  };

  return (
    <div role="none" className="relative">
      {/* Subtle guide line for nested children */}
      {depth > 0 && (
        <span
          className="absolute left-0 top-0 bottom-0 border-l border-white/[0.06]"
          style={{ left: `${depth * 14}px` }}
        />
      )}

      <button
        type="button"
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={node.isDirectory ? isOpen : undefined}
        tabIndex={isSelected ? 0 : -1}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`w-full h-7 min-h-7 px-2 flex items-center gap-1.5 text-xs font-mono transition-colors rounded-lg select-none group text-left cursor-pointer box-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)] ${
          isSelected
            ? 'border-l-2 border-[var(--landing-accent)] bg-white/5 text-[var(--landing-accent)] font-semibold'
            : 'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-white/[0.03]'
        }`}
      >
        {node.isDirectory ? (
          <>
            <ChevronRight
              className={`w-3.5 h-3.5 text-[var(--landing-text-secondary)] opacity-60 shrink-0 transition-transform duration-150 ease-out ${
                isOpen ? 'rotate-90' : ''
              }`}
            />
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-[var(--landing-accent)] opacity-80 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-[var(--landing-text-secondary)] opacity-70 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 h-3.5 shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate flex-1 font-mono text-[11px]" title={node.path}>
          {node.name}
        </span>
      </button>

      {node.isDirectory && isOpen && node.children && (
        <div role="group">
          {node.children.map((child) => (
            <FileTreeNodeItem
              key={child.path}
              node={child}
              activeFilePath={activeFilePath}
              onSelectFile={onSelectFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorerPane: React.FC<FileExplorerPaneProps> = ({
  tree,
  activeFilePath,
  onSelectFile,
  isLoading,
  isCollapsed = false,
  totalFilesCount,
}) => {
  // Compute total file count if not provided
  const countFiles = (nodes: FileNode[]): number => {
    let count = 0;
    for (const node of nodes) {
      if (!node.isDirectory) count++;
      if (node.children) count += countFiles(node.children);
    }
    return count;
  };
  const filesCount = totalFilesCount ?? countFiles(tree);

  if (isCollapsed) {
    return (
      <div className="h-full w-full flex flex-col items-center py-3 bg-[var(--landing-surface-1)] border-r border-[var(--landing-border)] select-none">
        <div className="p-2 text-[var(--landing-text-secondary)] hover:text-white" title="Files (Collapsed)">
          <Layers className="w-4 h-4 text-[var(--landing-accent)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--landing-surface-1)] border-r border-[var(--landing-border)] select-none overflow-hidden">
      {/* ── Panel Header (40px) ────────────────────────────────────────────── */}
      <div className="h-10 min-h-10 max-h-10 box-border px-3.5 border-b border-[var(--landing-border)] flex items-center justify-between bg-[var(--landing-bg-ink)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
          <span className="text-xs font-mono font-semibold text-[var(--landing-text-primary)] uppercase tracking-wider">
            FILES
          </span>
        </div>
        <span className="text-[11px] font-mono text-[var(--landing-text-secondary)] opacity-60">
          {filesCount}
        </span>
      </div>

      <div
        role="tree"
        aria-label="Project Files"
        data-lenis-prevent
        className="flex-1 overflow-y-auto p-2 space-y-0.5"
      >
        {isLoading ? (
          <div className="p-3 text-xs font-mono text-[var(--landing-text-secondary)]">
            loading file tree...
          </div>
        ) : tree.length === 0 ? (
          <div className="p-3 text-xs font-mono text-[var(--landing-text-secondary)]">
            no files in workspace
          </div>
        ) : (
          tree.map((node) => (
            <FileTreeNodeItem
              key={node.path}
              node={node}
              activeFilePath={activeFilePath}
              onSelectFile={onSelectFile}
            />
          ))
        )}
      </div>
    </div>
  );
};
