import React from 'react';
import Editor, { BeforeMount } from '@monaco-editor/react';
import { X, Code2, Lock } from 'lucide-react';
import { getFileIcon } from './FileExplorerPane';

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

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('voltrix-precision', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'ECECF1', background: '111116' },
        { token: 'comment', foreground: '6B6B76', fontStyle: 'italic' },
        { token: 'keyword', foreground: '06B6D4' },
        { token: 'string', foreground: 'A0A0AB' },
        { token: 'number', foreground: '22D3EE' },
        { token: 'type', foreground: '38BDF8' },
        { token: 'identifier', foreground: 'ECECF1' },
        { token: 'delimiter', foreground: '8E919F' },
      ],
      colors: {
        'editor.background': '#111116',
        'editor.foreground': '#ECECF1',
        'editorLineNumber.foreground': '#4B4B55',
        'editorLineNumber.activeForeground': '#A0A0AB',
        'editorCursor.foreground': '#06B6D4',
        'editor.selectionBackground': '#06B6D426',
        'editor.inactiveSelectionBackground': '#06B6D414',
        'editor.lineHighlightBackground': '#17171D66',
        'editor.lineHighlightBorder': '#00000000',
        'editorGutter.background': '#111116',
        'editorIndentGuide.background1': 'rgba(255, 255, 255, 0.05)',
        'editorIndentGuide.activeBackground1': 'rgba(255, 255, 255, 0.15)',
        'scrollbarSlider.background': 'rgba(255, 255, 255, 0.08)',
        'scrollbarSlider.hoverBackground': 'rgba(6, 182, 212, 0.3)',
        'scrollbarSlider.activeBackground': 'rgba(6, 182, 212, 0.5)',
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-panel select-none">
      {/* File Tabs Bar matching --panel-header-h token */}
      <div className="h-[var(--panel-header-h,40px)] min-h-[40px] max-h-[40px] box-border flex items-center justify-between bg-surface-base border-b border-border-subtle shrink-0">
        <div className="flex items-center h-full overflow-x-auto scrollbar-none flex-1 min-w-0">
          {openTabs.map((path) => {
            const fileName = path.split('/').pop() || path;
            const isActive = path === activeFilePath;
            return (
              <div
                key={path}
                onClick={() => onSelectTab(path)}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTab(path);
                  }
                }}
                className={`group h-full flex items-center gap-2 px-3 text-[12px] font-mono border-r border-border-subtle cursor-pointer transition-colors box-border shrink-0 ${
                  isActive
                    ? 'bg-surface-panel text-text-primary border-t-2 border-t-accent-teal font-medium'
                    : 'bg-surface-base text-text-tertiary hover:text-text-secondary hover:bg-surface-raised/50'
                }`}
              >
                {getFileIcon(fileName)}
                <span className="truncate max-w-[140px]">{fileName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(path);
                  }}
                  title={`Close ${fileName}`}
                  aria-label={`Close ${fileName}`}
                  className={`p-0.5 rounded hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-opacity ${
                    isActive
                      ? 'opacity-70 hover:opacity-100'
                      : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Read-only status indicator */}
        <div className="shrink-0 px-3 flex items-center gap-1.5 text-[11px] font-sans text-text-tertiary select-none">
          <Lock className="w-3 h-3 text-text-tertiary" />
          <span className="hidden sm:inline">Read only</span>
        </div>
      </div>

      {/* Main Monaco Editor Container */}
      <div className="flex-1 relative bg-surface-panel">
        {isLoadingContent ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-panel text-[12px] font-sans text-text-tertiary select-none">
            Loading file contents...
          </div>
        ) : !activeFilePath ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-panel text-center p-6 select-none">
            <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center text-text-tertiary mb-3 border border-border-subtle">
              <Code2 className="w-5 h-5 text-text-tertiary" />
            </div>
            <p className="text-[13px] font-sans text-text-secondary font-medium mb-1">
              No file selected
            </p>
            <p className="text-[12px] font-sans text-text-tertiary">
              Select a file from the explorer to view source code
            </p>
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguage(activeFilePath)}
            value={fileContent}
            theme="voltrix-precision"
            beforeMount={handleBeforeMount}
            options={{
              readOnly: true,
              domReadOnly: true,
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 20,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              lineNumbersMinChars: 3,
              glyphMargin: false,
              folding: true,
              smoothScrolling: true,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              cursorBlinking: 'smooth',
              cursorStyle: 'line',
              renderLineHighlight: 'all',
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              renderWhitespace: 'none',
              renderControlCharacters: false,
            }}
          />
        )}
      </div>
    </div>
  );
};
