import React, { useRef, useState } from 'react';
import { useDemoTimeline, PRESET_DEMOS } from './useDemoTimeline';
import { FileTree } from './FileTree';
import { EditorPane } from './EditorPane';
import { PreviewPane } from './PreviewPane';
import { Caret } from '../components/Caret';
import { RotateCcw, Check, Sparkles } from 'lucide-react';

export const HeroDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const {
    chapter,
    typedChars,
    filesVisibleCount,
    codeLinesCount,
    previewAssembled,
    statusText,
    isReady,
    progressPercent,
    selectedPreset,
    selectPreset,
    replay,
  } = useDemoTimeline(containerRef);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * -4;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="w-full space-y-3">
      {/* 3D Tilted Workstation Window */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="w-full rounded-[var(--landing-radius-lg)] border border-[var(--landing-border)] bg-[var(--landing-surface-1)] shadow-2xl overflow-hidden flex flex-col aspect-video min-h-[380px] select-none"
        aria-label="Interactive demo of autonomous application generation in Voltrix"
      >
        {/* Screen reader summary */}
        <div className="sr-only">
          <h2>Voltrix Generation Walkthrough</h2>
          <p>Prompt: "{selectedPreset.prompt}".</p>
          <p>Files planned, component synthesized in Monaco, live preview assembled.</p>
        </div>

        {/* Title Bar Chrome */}
        <div className="h-9 px-3.5 bg-[var(--landing-surface-2)] border-b border-[var(--landing-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="ml-2 font-mono text-[11px] text-[var(--landing-text-muted)] truncate">
              voltrix: {selectedPreset.id}-project
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--landing-surface-3)] text-[var(--landing-text-muted)] border border-[var(--landing-border)]">
              Sample data
            </span>
            <button
              type="button"
              onClick={replay}
              aria-label="Restart generation demo"
              className="p-1 rounded-full text-[var(--landing-text-muted)] hover:text-[var(--landing-accent)] hover:bg-[var(--landing-surface-3)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
              title="Replay demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Prompt Strip */}
        <div className="px-3.5 py-2 bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)] flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-[var(--landing-text-secondary)] min-w-0">
            <span className="text-[var(--landing-accent)] font-bold shrink-0">&gt;</span>
            <span className="text-[var(--landing-text-primary)] truncate">
              {selectedPreset.prompt.slice(0, typedChars)}
              {chapter === 1 && <Caret />}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--landing-text-muted)] shrink-0 hidden sm:inline">
            {chapter === 1 ? 'Prompting' : 'Generated'}
          </span>
        </div>

        {/* Three-Pane Workstation Body */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* Left: Files */}
          <div className="col-span-3 sm:col-span-3 overflow-hidden">
            <FileTree files={selectedPreset.files} visibleCount={filesVisibleCount} />
          </div>

          {/* Center: Editor */}
          <div className="col-span-5 sm:col-span-5 overflow-hidden">
            <EditorPane
              codeLines={selectedPreset.codeLines}
              visibleLinesCount={codeLinesCount}
              activeFile={selectedPreset.activeFileName}
              isWriting={chapter === 3}
            />
          </div>

          {/* Right: Live Preview */}
          <div className="col-span-4 sm:col-span-4 overflow-hidden">
            <PreviewPane
              isAssembled={previewAssembled}
              chapter={chapter}
              previewTitle={selectedPreset.previewTitle}
              previewUrl={selectedPreset.previewUrl}
              tasks={selectedPreset.previewTasks}
              progressPercent={progressPercent}
            />
          </div>
        </div>

        {/* Clean Single Status Bar */}
        <div className="h-7 px-3 bg-[var(--landing-surface-2)] border-t border-[var(--landing-border)] flex items-center justify-between text-[11px] font-mono text-[var(--landing-text-muted)] shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isReady ? 'bg-[var(--landing-success)]' : 'bg-[var(--landing-accent)]'
              }`}
            />
            <span className="text-[var(--landing-text-secondary)] truncate">
              {statusText}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-[var(--landing-text-muted)] hidden sm:inline">
              Chapter {chapter} / 5
            </span>
          </div>
        </div>
      </div>

      {/* "Try your own prompt" Preset Selector Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono">
        <span className="text-[var(--landing-text-muted)] text-[11px]">
          Try sample prompts:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_DEMOS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--landing-accent)] text-[#090D0F] border border-[#090D0F] shadow-sm'
                    : 'bg-[var(--landing-surface-2)] text-[var(--landing-text-secondary)] border border-[var(--landing-border)] hover:text-[var(--landing-text-primary)] hover:border-[var(--landing-border-hover)]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
