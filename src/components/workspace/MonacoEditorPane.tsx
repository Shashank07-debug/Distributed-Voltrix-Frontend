import React, { useState, useEffect, useRef } from 'react';
import Editor, { BeforeMount, OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { X, Code2, Lock, WrapText, FileCode, CheckCircle2 } from 'lucide-react';
import { getFileIcon } from './FileExplorerPane';
import { toast } from 'sonner';

interface MonacoEditorPaneProps {
  openTabs: string[];
  activeFilePath: string | null;
  fileContent: string;
  isLoadingContent: boolean;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onCloseOthers?: (path: string) => void;
  onCloseAll?: () => void;
  isStreaming?: boolean;
}

export const MonacoEditorPane: React.FC<MonacoEditorPaneProps> = ({
  openTabs,
  activeFilePath,
  fileContent,
  isLoadingContent,
  onSelectTab,
  onCloseTab,
  onCloseOthers,
  onCloseAll,
  isStreaming = false,
}) => {
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [diagnosticsCount, setDiagnosticsCount] = useState(0);
  const [wordWrap, setWordWrap] = useState(false);
  const [contextMenuTab, setContextMenuTab] = useState<{ path: string; x: number; y: number } | null>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const getLanguage = (filePath: string | null): string => {
    if (!filePath) return 'typescript';
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
      case 'mjs':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
      case 'scss':
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
    // Define custom "voltrix-dark" theme with Lime keywords & dark surfaces
    monaco.editor.defineTheme('voltrix-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'F8F9FA', background: '11171A' },
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'D4FF32', fontStyle: 'bold' },
        { token: 'string', foreground: '10B981' },
        { token: 'number', foreground: 'E4FF68' },
        { token: 'type', foreground: 'F8F9FA' },
        { token: 'identifier', foreground: 'ECECF1' },
        { token: 'delimiter', foreground: '9BA6AD' },
        { token: 'tag', foreground: 'D4FF32' },
        { token: 'attribute.name', foreground: '9BA6AD' },
      ],
      colors: {
        'editor.background': '#11171A',
        'editor.foreground': '#F8F9FA',
        'editorLineNumber.foreground': '#414E56',
        'editorLineNumber.activeForeground': '#D4FF32',
        'editorCursor.foreground': '#D4FF32',
        'editor.selectionBackground': 'rgba(212, 255, 50, 0.22)',
        'editor.inactiveSelectionBackground': 'rgba(212, 255, 50, 0.10)',
        'editor.lineHighlightBackground': 'rgba(255, 255, 255, 0.03)',
        'editor.lineHighlightBorder': 'transparent',
        'editorGutter.background': '#090D0F',
        'editorIndentGuide.background1': 'rgba(255, 255, 255, 0.05)',
        'editorIndentGuide.activeBackground1': 'rgba(212, 255, 50, 0.25)',
        'editorBracketMatch.background': 'rgba(212, 255, 50, 0.20)',
        'editorBracketMatch.border': '#D4FF32',
        // Scrollbar styling — fix the red bar and wide slider
        'scrollbarSlider.background': 'rgba(255, 255, 255, 0.08)',
        'scrollbarSlider.hoverBackground': 'rgba(212, 255, 50, 0.3)',
        'scrollbarSlider.activeBackground': 'rgba(212, 255, 50, 0.5)',
        'scrollbar.shadow': 'transparent',
        // Minimap
        'minimap.background': '#090D0F',
        'minimapSlider.background': 'rgba(255, 255, 255, 0.08)',
        'minimapSlider.hoverBackground': 'rgba(212, 255, 50, 0.2)',
        // Overview ruler — remove thick borders and red bar
        'editorOverviewRuler.border': 'transparent',
        'editorOverviewRuler.background': '#090D0F',
      },
    });

    // Ignore noise diagnostics like 7027 (Unreachable code detected false alarm on JSX)
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      diagnosticCodesToIgnore: [7027, 2695, 2304],
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      diagnosticCodesToIgnore: [7027, 2695, 2304],
    });

    // Enable JSX in TS language service
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowNonTextFiles: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    });
  };

  const handleOnMount: OnMount = (editor, monaco) => {
    setEditorInstance(editor);

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({ line: e.position.lineNumber, col: e.position.column });
    });

    // Track diagnostics
    const updateMarkers = () => {
      const model = editor.getModel();
      if (model) {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        setDiagnosticsCount(markers.length);
      }
    };
    monaco.editor.onDidChangeMarkers(updateMarkers);

    // Keyboard shortcut Ctrl/Cmd+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      toast.success('All files saved to workspace');
    });
  };

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!contextMenuTab) return;
    const handleClose = () => setContextMenuTab(null);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [contextMenuTab]);

  const handleTabContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setContextMenuTab({ path, x: e.clientX, y: e.clientY });
  };

  // Breadcrumb path parts
  const breadcrumbParts = activeFilePath ? activeFilePath.split('/') : [];

  return (
    <div className="flex flex-col h-full bg-[var(--landing-surface-1)] select-none overflow-hidden relative">
      {/* ── Tabs Bar (40px) ────────────────────────────────────────────────── */}
      <div className="h-10 min-h-10 max-h-10 box-border flex items-center justify-between bg-[var(--landing-bg-ink)] border-b border-[var(--landing-border)] shrink-0 overflow-hidden">
        <div
          data-lenis-prevent
          className="flex items-center h-full overflow-x-auto scrollbar-none flex-1 min-w-0 fade-mask-right"
        >
          {openTabs.map((path) => {
            const fileName = path.split('/').pop() || path;
            const isActive = path === activeFilePath;
            return (
              <div
                key={path}
                onClick={() => onSelectTab(path)}
                onMouseDown={(e) => {
                  // Middle click closes tab
                  if (e.button === 1) {
                    e.preventDefault();
                    onCloseTab(path);
                  }
                }}
                onContextMenu={(e) => handleTabContextMenu(e, path)}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTab(path);
                  }
                }}
                className={`group h-full flex items-center gap-2 px-3 text-xs font-mono border-r border-[var(--landing-border)] cursor-pointer transition-colors box-border shrink-0 ${
                  isActive
                    ? 'bg-[var(--landing-surface-1)] text-[var(--landing-text-primary)] border-t-2 border-t-[var(--landing-accent)] font-medium'
                    : 'bg-[var(--landing-bg-ink)] text-[var(--landing-text-secondary)] hover:text-white hover:bg-[var(--landing-surface-2)]/60'
                }`}
              >
                {getFileIcon(fileName)}
                <span className="truncate max-w-[130px]">{fileName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(path);
                  }}
                  title={`Close ${fileName}`}
                  aria-label={`Close ${fileName}`}
                  className={`p-0.5 rounded-md hover:bg-white/10 text-[var(--landing-text-secondary)] hover:text-white transition-opacity ${
                    isActive ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Read-Only Status Chip */}
        <div className="shrink-0 px-3 flex items-center gap-1.5 text-[11px] font-mono text-[var(--landing-text-secondary)] select-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px]">
            <Lock className="w-2.5 h-2.5 text-[var(--landing-accent)]" />
            <span>read only</span>
          </span>
        </div>
      </div>

      {/* ── Sub-Tab Breadcrumb Row (26px) ─────────────────────────────────── */}
      {activeFilePath && (
        <div className="h-6 min-h-6 max-h-6 px-3 bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)]/60 flex items-center justify-between text-[11px] font-mono text-[var(--landing-text-secondary)] shrink-0">
          <div className="flex items-center gap-1 truncate">
            {breadcrumbParts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="opacity-40">/</span>}
                <span className={i === breadcrumbParts.length - 1 ? 'text-[var(--landing-text-primary)] font-medium' : ''}>
                  {part}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Shimmer line if AI generation is editing this file */}
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--landing-accent)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)] animate-ping" />
              <span>streaming edits</span>
            </span>
          )}
        </div>
      )}

      {/* ── Streaming shimmer bar at top of editor ─────────────────────────── */}
      {isStreaming && (
        <div className="h-0.5 w-full bg-[var(--landing-surface-1)] overflow-hidden shrink-0">
          <div className="h-full w-1/3 bg-[var(--landing-accent)] animate-marquee" />
        </div>
      )}

      {/* ── Main Monaco Editor Surface ────────────────────────────────────── */}
      <div className="flex-1 relative bg-[var(--landing-surface-1)] overflow-hidden">
        {isLoadingContent ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--landing-surface-1)] text-xs font-mono text-[var(--landing-text-secondary)] select-none">
            <span className="w-5 h-5 border-2 border-[var(--landing-accent)] border-t-transparent rounded-full animate-spin mb-2" />
            loading file source...
          </div>
        ) : !activeFilePath ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--landing-surface-1)] text-center p-6 select-none">
            <div className="w-12 h-12 rounded-2xl bg-[var(--landing-surface-2)] flex items-center justify-center text-[var(--landing-text-secondary)] mb-3 border border-[var(--landing-border)]">
              <Code2 className="w-6 h-6 text-[var(--landing-accent)]" />
            </div>
            <p className="font-display font-semibold text-sm text-[var(--landing-text-primary)] mb-1">
              no file open.
            </p>
            <p className="text-xs text-[var(--landing-text-secondary)] font-sans">
              select a file from the explorer on the left to inspect code.
            </p>
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguage(activeFilePath)}
            value={fileContent}
            theme="voltrix-dark"
            beforeMount={handleBeforeMount}
            onMount={handleOnMount}
            options={{
              readOnly: true,
              domReadOnly: true,
              fontSize: 14,
              fontFamily: '"JetBrains Mono", monospace',
              fontLigatures: true,
              lineHeight: 22,
              minimap: { enabled: !isMobile, showSlider: 'mouseover' },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              lineNumbersMinChars: 3,
              glyphMargin: false,
              folding: true,
              smoothScrolling: true,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              roundedSelection: true,
              stickyScroll: { enabled: true },
              wordWrap: wordWrap ? 'on' : 'off',
              formatOnPaste: true,
              // Fix overview ruler & red bar
              overviewRulerBorder: false,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                useShadows: false,
              },
            }}
          />
        )}
      </div>

      {/* ── Status Bar (24px) ─────────────────────────────────────────────── */}
      <div className="h-6 min-h-6 max-h-6 px-3 bg-[var(--landing-bg-ink)] border-t border-[var(--landing-border)] flex items-center justify-between text-[11px] font-mono text-[var(--landing-text-secondary)] shrink-0 select-none">
        {/* Left: Position & Language */}
        <div className="flex items-center gap-3">
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.col}
          </span>
          <span className="opacity-30">|</span>
          <span className="uppercase text-[var(--landing-accent)] font-semibold">
            {getLanguage(activeFilePath)}
          </span>
          <span className="opacity-30">|</span>
          <span>Spaces: 2</span>
          <span className="opacity-30 hidden sm:inline">|</span>
          <span className="hidden sm:inline">UTF-8</span>
        </div>

        {/* Right: Diagnostics & WordWrap Toggle */}
        <div className="flex items-center gap-3">
          {diagnosticsCount > 0 ? (
            <span className="text-amber-400 font-semibold">{diagnosticsCount} hints</span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 0 errors
            </span>
          )}

          <button
            type="button"
            onClick={() => setWordWrap((prev) => !prev)}
            className={`px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1 ${
              wordWrap ? 'text-[var(--landing-accent)]' : 'text-[var(--landing-text-secondary)]'
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="w-3 h-3" />
            <span className="hidden md:inline">Wrap</span>
          </button>
        </div>
      </div>

      {/* ── Tab Context Menu ──────────────────────────────────────────────── */}
      {contextMenuTab && (
        <div
          style={{ top: contextMenuTab.y, left: contextMenuTab.x }}
          className="fixed z-50 w-36 py-1 bg-[var(--landing-surface-2)] border border-[var(--landing-border-strong)] rounded-xl shadow-2xl text-xs font-mono"
        >
          <button
            type="button"
            onClick={() => {
              onCloseTab(contextMenuTab.path);
              setContextMenuTab(null);
            }}
            className="w-full px-3 py-1.5 text-left text-[var(--landing-text-primary)] hover:bg-white/10"
          >
            Close
          </button>
          {onCloseOthers && (
            <button
              type="button"
              onClick={() => {
                onCloseOthers(contextMenuTab.path);
                setContextMenuTab(null);
              }}
              className="w-full px-3 py-1.5 text-left text-[var(--landing-text-primary)] hover:bg-white/10"
            >
              Close Others
            </button>
          )}
          {onCloseAll && (
            <button
              type="button"
              onClick={() => {
                onCloseAll();
                setContextMenuTab(null);
              }}
              className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-500/10"
            >
              Close All
            </button>
          )}
        </div>
      )}
    </div>
  );
};
