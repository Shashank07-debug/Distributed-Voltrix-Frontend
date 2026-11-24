import React, { useState, useEffect, useRef } from 'react';
import { Eye, Code2, Columns2, MessageSquare } from 'lucide-react';

export type WorkspaceViewMode = 'preview' | 'code' | 'split';
export type MobileViewMode = 'chat' | 'preview' | 'code';

interface WorkspaceLayoutProps {
  chatPanel: React.ReactNode;
  codePanel: React.ReactNode;
  previewPanel: React.ReactNode;
  isStreaming?: boolean;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  chatPanel,
  codePanel,
  previewPanel,
  isStreaming = false,
}) => {
  // Desktop resizable chat width percentage (default 28%, min 320px, max 40%)
  const [chatPercent, setChatPercent] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('voltrix_ws_chat_pct');
      return stored ? Math.min(40, Math.max(20, parseFloat(stored))) : 28;
    } catch {
      return 28;
    }
  });

  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('preview');
  const [mobileMode, setMobileMode] = useState<MobileViewMode>('chat');
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Track window resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Split view is allowed only at >= 1280px
  const isSplitAllowed = windowWidth >= 1280;

  useEffect(() => {
    if (viewMode === 'split' && !isSplitAllowed) {
      setViewMode('preview');
    }
  }, [isSplitAllowed, viewMode]);

  // Pointer drag resizing for two-pane shell
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalW = rect.width;
    let nextPct = (x / totalW) * 100;

    // Enforce bounds: min 320px equivalent, max 40%
    const minPct = (320 / totalW) * 100;
    const clampedPct = Math.min(40, Math.max(minPct, nextPct));

    setChatPercent(clampedPct);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    try {
      localStorage.setItem('voltrix_ws_chat_pct', String(chatPercent));
    } catch {}
  };

  const handleDoubleClickReset = () => {
    setChatPercent(28);
    try {
      localStorage.setItem('voltrix_ws_chat_pct', '28');
    } catch {}
  };

  const isDesktop = windowWidth >= 1024;

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 w-full flex flex-col bg-[var(--landing-bg-ink)] overflow-hidden select-none"
    >
      {/* ── RESPONSIVE VIEW (< 1024px) ──────────────────────────────────────── */}
      {!isDesktop ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Top Segmented Bar: Chat | Preview | Code */}
          <div className="h-10 px-3 bg-[var(--landing-bg-ink)] border-b border-[var(--landing-border)] flex items-center justify-center shrink-0">
            <div className="flex items-center p-1 rounded-full bg-[var(--landing-surface-1)] border border-[var(--landing-border)] gap-1 w-full max-w-xs justify-between">
              <button
                type="button"
                onClick={() => setMobileMode('chat')}
                aria-label="View Chat"
                className={`flex-1 py-1 rounded-full text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mobileMode === 'chat'
                    ? 'bg-[var(--landing-accent)] text-[#090D0F]'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMode('preview')}
                aria-label="View Live Preview"
                className={`flex-1 py-1 rounded-full text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mobileMode === 'preview'
                    ? 'bg-[var(--landing-accent)] text-[#090D0F]'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMode('code')}
                aria-label="View Code"
                className={`flex-1 py-1 rounded-full text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mobileMode === 'code'
                    ? 'bg-[var(--landing-accent)] text-[#090D0F]'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
            </div>
          </div>

          {/* Panels kept mounted in DOM to prevent streaming / buffer loss */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <div className={`h-full w-full ${mobileMode === 'chat' ? 'block' : 'hidden'}`}>
              {chatPanel}
            </div>
            <div className={`h-full w-full ${mobileMode === 'preview' ? 'block' : 'hidden'}`}>
              {previewPanel}
            </div>
            <div className={`h-full w-full ${mobileMode === 'code' ? 'block' : 'hidden'}`}>
              {codePanel}
            </div>
          </div>
        </div>
      ) : (
        /* ── DESKTOP TWO-PANE RESIZABLE SHELL (>= 1024px) ─────────────────── */
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative">
          {/* Left Column: Chat (Resizable, default ~28%, min 320px, max 40%) */}
          <div
            style={{ width: `${chatPercent}%` }}
            className="h-full flex flex-col shrink-0 min-w-[320px] max-w-[40%] overflow-hidden"
          >
            {chatPanel}
          </div>

          {/* Resizer Handle */}
          <div
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleClickReset}
            title="Drag to resize chat panel (Double-click to reset)"
            aria-label="Resize chat panel"
            className="w-1.5 hover:w-2 -ml-0.5 z-20 h-full bg-[var(--landing-border)] hover:bg-[var(--landing-accent)] cursor-col-resize transition-all duration-150 flex items-center justify-center group"
          >
            <div className="w-0.5 h-8 rounded-full bg-white/20 group-hover:bg-[#090D0F]" />
          </div>

          {/* Right Column: Workspace Shell */}
          <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-[var(--landing-surface-1)]">
            {/* ── Segmented Control Bar (40px) ─────────────────────────────── */}
            <div className="h-10 min-h-10 max-h-10 box-border px-3 border-b border-[var(--landing-border)] flex items-center justify-between bg-[var(--landing-bg-ink)] shrink-0">
              {/* Segmented Mode Selector: Preview | Code | Split */}
              <div className="flex items-center p-0.5 rounded-lg bg-[var(--landing-surface-1)] border border-[var(--landing-border)] gap-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  aria-label="Switch to Preview View"
                  className={`px-3 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'preview'
                      ? 'bg-[var(--landing-accent)] text-[#090D0F] shadow-sm'
                      : 'text-[var(--landing-text-secondary)] hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('code')}
                  aria-label="Switch to Code View"
                  className={`px-3 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'code'
                      ? 'bg-[var(--landing-accent)] text-[#090D0F] shadow-sm'
                      : 'text-[var(--landing-text-secondary)] hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code</span>
                </button>

                {isSplitAllowed && (
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    aria-label="Switch to Split View"
                    className={`px-3 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      viewMode === 'split'
                        ? 'bg-[var(--landing-accent)] text-[#090D0F] shadow-sm'
                        : 'text-[var(--landing-text-secondary)] hover:text-white'
                    }`}
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>Split</span>
                  </button>
                )}
              </div>

              {/* Status indicator during AI generation */}
              {isStreaming && (
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--landing-accent)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--landing-accent)] animate-ping" />
                  <span>Voltrix AI editing code</span>
                </div>
              )}
            </div>

            {/* ── Workspace Main Content Area ─────────────────────────────── */}
            <div className="flex-1 min-h-0 w-full overflow-hidden relative">
              {viewMode === 'preview' && (
                <div className="h-full w-full">{previewPanel}</div>
              )}

              {viewMode === 'code' && (
                <div className="h-full w-full">{codePanel}</div>
              )}

              {viewMode === 'split' && (
                <div className="h-full w-full flex flex-row overflow-hidden">
                  <div className="w-1/2 h-full border-r border-[var(--landing-border)] overflow-hidden">
                    {codePanel}
                  </div>
                  <div className="w-1/2 h-full overflow-hidden">
                    {previewPanel}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
