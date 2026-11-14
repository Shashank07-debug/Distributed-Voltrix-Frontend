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
} from 'lucide-react';
import { FileNode } from '../../utils/fileTree';

interface FileExplorerPaneProps {
  tree: FileNode[];
  activeFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  isLoading?: boolean;
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
    return <Settings className="w-3.5 h-3.5 text-text-tertiary shrink-0" />;
  }

  const ext = lower.split('.').pop();
  switch (ext) {
    case 'tsx':
    case 'jsx':
      return <FileCode className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />;
    case 'ts':
    case 'js':
    case 'mjs':
      return <FileCode className="w-3.5 h-3.5 text-sky-400/80 shrink-0" />;
    case 'css':
    case 'scss':
      return <FileCode className="w-3.5 h-3.5 text-pink-400/80 shrink-0" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />;
    case 'html':
      return <FileCode className="w-3.5 h-3.5 text-orange-400/80 shrink-0" />;
    case 'md':
    case 'txt':
      return <FileText className="w-3.5 h-3.5 text-slate-400/80 shrink-0" />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'ico':
    case 'webp':
      return <FileImage className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />;
    default:
      return <File className="w-3.5 h-3.5 text-text-tertiary shrink-0" />;
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
          className="absolute left-0 top-0 bottom-0 border-l border-white/[0.04]"
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
        className={`w-full h-7 px-2 flex items-center gap-1.5 text-[13px] font-sans transition-colors rounded-md select-none group text-left cursor-pointer focus-visible:outline-accent ${
          isSelected
            ? 'bg-surface-raised text-accent-teal font-medium'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/60'
        }`}
      >
        {node.isDirectory ? (
          <>
            <ChevronRight
              className={`w-3.5 h-3.5 text-text-tertiary shrink-0 transition-transform duration-150 ease-out ${
                isOpen ? 'rotate-90' : ''
              }`}
            />
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-text-secondary shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 h-3.5 shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate flex-1" title={node.path}>
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
}) => {
  return (
    <div className="h-full flex flex-col bg-surface-base select-none">
      {/* 40px Header matching --panel-header-h token */}
      <div className="h-[var(--panel-header-h,40px)] min-h-[40px] max-h-[40px] box-border px-3 border-b border-border-subtle flex items-center justify-between bg-surface-base shrink-0">
        <span className="text-[12px] font-sans font-semibold text-text-tertiary uppercase tracking-wider">
          Files
        </span>
      </div>

      <div
        role="tree"
        aria-label="Project Files"
        className="flex-1 overflow-y-auto p-1.5 space-y-0.5"
      >
        {isLoading ? (
          <div className="p-3 text-[12px] font-sans text-text-tertiary">
            Loading project files...
          </div>
        ) : tree.length === 0 ? (
          <div className="p-3 text-[12px] font-sans text-text-tertiary">
            No files found in workspace
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
