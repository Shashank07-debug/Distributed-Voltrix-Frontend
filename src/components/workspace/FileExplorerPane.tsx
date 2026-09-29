import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, Files } from 'lucide-react';
import { FileNode } from '../../utils/fileTree';

interface FileExplorerPaneProps {
  tree: FileNode[];
  activeFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  isLoading?: boolean;
}

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
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        className={`w-full py-1 pr-3 flex items-center gap-2 text-xs font-mono transition-colors rounded-md ${
          isSelected
            ? 'bg-voltrix-violet/20 text-voltrix-cyan border-l-2 border-voltrix-cyan font-semibold'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {node.isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-voltrix-muted shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-voltrix-muted shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-voltrix-violet-light shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-voltrix-violet-light shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 h-3.5 inline-block shrink-0" />
            <FileCode className="w-3.5 h-3.5 text-voltrix-cyan shrink-0" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {node.isDirectory && isOpen && node.children && (
        <div>
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
    <div className="h-full flex flex-col bg-[#08090E] border-r border-voltrix-border">
      <div className="px-3 py-2 border-b border-voltrix-border flex items-center justify-between bg-voltrix-card/30">
        <div className="flex items-center gap-2">
          <Files className="w-3.5 h-3.5 text-voltrix-violet-light" />
          <span className="font-mono text-xs font-medium text-gray-300 uppercase tracking-wider">
            Files Explorer
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="p-4 text-xs font-mono text-voltrix-muted">Loading project files...</div>
        ) : tree.length === 0 ? (
          <div className="p-4 text-xs font-mono text-voltrix-muted">No files found in workspace</div>
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
