import React from 'react';
import Editor from '@monaco-editor/react';
import { X, FileCode, Code2 } from 'lucide-react';

interface MonacoEditorPaneProps {
  openTabs: string[];
  activeFilePath: string | null;
  fileContent: string;
  isLoadingContent: boolean;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
}

export const MonacoEditorPane: React.FC<MonacoEditorPaneProps> = ({
  openTabs,
  activeFilePath,
  fileContent,
  isLoadingContent,
  onSelectTab,
  onCloseTab,
}) => {
  const getLanguage = (filePath: string | null) => {
    if (!filePath) return 'typescript';
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E]">
      {/* File Tabs Bar */}
      <div className="flex items-center bg-[#181818] border-b border-white/10 overflow-x-auto">
        {openTabs.map((path) => {
          const fileName = path.split('/').pop() || path;
          const isActive = path === activeFilePath;
          return (
            <div
              key={path}
              onClick={() => onSelectTab(path)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-mono border-r border-white/5 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[#1E1E1E] text-voltrix-cyan border-t-2 border-t-voltrix-cyan font-medium'
                  : 'bg-[#141414] text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-voltrix-violet-light" />
              <span>{fileName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(path);
                }}
                className="p-0.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Monaco Editor Container */}
      <div className="flex-1 relative">
        {isLoadingContent ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1E1E1E] text-xs font-mono text-voltrix-muted">
            Loading file contents...
          </div>
        ) : !activeFilePath ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E1E1E] text-center p-6">
            <Code2 className="w-12 h-12 text-voltrix-muted mb-2 opacity-50" />
            <p className="text-xs font-mono text-gray-400">Select a file from the explorer to view source code</p>
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguage(activeFilePath)}
            value={fileContent}
            theme="vs-dark"
            options={{
              readOnly: true,
              domReadOnly: true,
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              smoothScrolling: true,
              automaticLayout: true,
              padding: { top: 12 },
            }}
          />
        )}
      </div>
    </div>
  );
};
