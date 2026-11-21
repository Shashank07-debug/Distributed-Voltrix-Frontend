import React, { useRef } from 'react';
import { useDemoTimeline, PROMPT_TEXT } from './useDemoTimeline';
import { FileTree } from './FileTree';
import { EditorPane } from './EditorPane';
import { PreviewPane } from './PreviewPane';
import { Caret } from '../components/Caret';
import { RotateCcw, Check, Sparkles } from 'lucide-react';

export const HeroDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    chapter,
    typedChars,
    filesVisibleCount,
    codeLinesCount,
    previewAssembled,
    statusText,
    isReady,
    replay,
  } = useDemoTimeline(containerRef);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-[var(--landing-radius-lg)] border border-[var(--landing-border)] bg-[var(--landing-surface-1)] shadow-2xl overflow-hidden flex flex-col aspect-video min-h-[380px] select-none"
      aria-label="Interactive demo of autonomous application generation in Voltrix"
    >
      {/* Visually hidden screen reader transcript */}
      <div className="sr-only">
        <h3>Voltrix Generation Walkthrough</h3>
        <p>Step 1: User prompt formulated: "{PROMPT_TEXT}".</p>
        <p>Step 2: File tree generated containing components, hooks, and types.</p>
        <p>Step 3: TaskBoard component code generated with strict TypeScript props.</p>
        <p>Step 4: Live Kanban task board preview compiled and assembled in DOM.</p>
        <p>Step 5: Production container deployed successfully.</p>
      </div>

      {/* Title Bar Chrome */}
      <div className="h-9 px-3.5 bg-[var(--landing-surface-2)] border-b border-[var(--landing-border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="ml-2 font-mono text-[11px] text-[var(--landing-text-muted)] truncate">
            voltrix: sample-task-dashboard
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--landing-surface-3)] text-[var(--landing-text-muted)] border border-[var(--landing-border)]">
            Sample data
          </span>
          <button
            type="button"
            onClick={replay}
            aria-label="Restart generation demo"
            className="p-1 rounded-[var(--landing-radius-sm)] text-[var(--landing-text-muted)] hover:text-[var(--landing-accent)] hover:bg-[var(--landing-surface-3)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
            title="Replay demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Prompt Strip */}
      <div className="px-3.5 py-2 bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)] flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 text-[var(--landing-text-secondary)] min-w-0">
          <span className="text-[var(--landing-accent)] font-semibold shrink-0">&gt;</span>
          <span className="text-[var(--landing-text-primary)] truncate">
            {PROMPT_TEXT.slice(0, typedChars)}
            {chapter === 1 && <Caret />}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--landing-text-muted)] shrink-0 hidden sm:inline">
          {chapter === 1 ? 'Prompting' : 'Generated'}
        </span>
      </div>

      {/* Three-Pane Workstation Body */}
      <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Pane: File Tree */}
        <div className="col-span-3 sm:col-span-3 overflow-hidden">
          <FileTree visibleCount={filesVisibleCount} />
        </div>

        {/* Center Pane: Editor */}
        <div className="col-span-5 sm:col-span-5 overflow-hidden">
          <EditorPane
            visibleLinesCount={codeLinesCount}
            activeFile="TaskBoard.tsx"
            isWriting={chapter === 3}
          />
        </div>

        {/* Right Pane: Live Preview Canvas */}
        <div className="col-span-4 sm:col-span-4 overflow-hidden">
          <PreviewPane isAssembled={previewAssembled} chapter={chapter} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 px-3 bg-[var(--landing-surface-2)] border-t border-[var(--landing-border)] flex items-center justify-between text-[11px] font-mono text-[var(--landing-text-muted)] shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isReady ? 'bg-[var(--landing-success)]' : 'bg-[var(--landing-accent)]'
            }`}
          />
          <span className="text-[var(--landing-text-secondary)] truncate">{statusText}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-[var(--landing-text-muted)] hidden sm:inline">
            Chapter {chapter} / 5
          </span>
          {isReady && (
            <span className="inline-flex items-center gap-1 text-[var(--landing-success)] text-[10px]">
              <Check className="w-3 h-3" /> Ready
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
