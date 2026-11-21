import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface PreviewPaneProps {
  isAssembled: boolean;
  chapter: number;
  previewTitle: string;
  previewUrl: string;
  tasks: { todo: string; active: string; done: string };
  progressPercent: number;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  isAssembled,
  chapter,
  previewTitle,
  previewUrl,
  tasks,
  progressPercent,
}) => {
  return (
    <div className="h-full bg-[var(--landing-surface-2)] p-2.5 sm:p-3 flex flex-col justify-between font-sans text-xs select-none overflow-hidden relative">
      {/* Mini App Window Header - Fixed overlap with clean zones */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-[var(--landing-border)] text-[11px] font-mono text-[var(--landing-text-muted)] gap-2">
          <div className="flex items-center gap-1.5 truncate text-[var(--landing-text-secondary)]">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                chapter >= 4 ? 'bg-[var(--landing-success)]' : 'bg-[var(--landing-accent)]'
              }`}
            />
            <span className="truncate">{previewUrl}</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--landing-surface-1)] text-[var(--landing-accent)] font-semibold shrink-0 border border-[var(--landing-border)]">
            Live
          </span>
        </div>

        {/* Assembled Content */}
        {isAssembled || chapter >= 4 ? (
          <div className="space-y-2 animate-in fade-in duration-300">
            {/* Top Stat Bar with Lime Accent Progress */}
            <div className="p-2 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-[var(--landing-text-primary)] truncate">
                  {previewTitle}
                </span>
                <span className="text-[var(--landing-accent)] font-mono font-bold shrink-0 ml-1">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--landing-surface-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--landing-accent)] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Kanban Columns with Wrapped Titles & Coral Pop */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              {/* Col 1 */}
              <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] flex flex-col justify-between min-h-[58px]">
                <div className="font-mono text-[9px] text-[var(--landing-text-muted)] font-semibold">
                  TODO
                </div>
                <div className="p-1 rounded bg-[var(--landing-surface-2)] text-[10px] text-[var(--landing-text-secondary)] leading-tight line-clamp-2">
                  {tasks.todo}
                </div>
              </div>

              {/* Col 2 - Coral pop highlight */}
              <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-pop-coral)]/40 flex flex-col justify-between min-h-[58px]">
                <div className="font-mono text-[9px] text-[var(--landing-pop-coral)] font-bold">
                  ACTIVE
                </div>
                <div className="p-1 rounded bg-[var(--landing-pop-coral-subtle)] text-[10px] text-[var(--landing-pop-coral)] font-semibold leading-tight line-clamp-2">
                  {tasks.active}
                </div>
              </div>

              {/* Col 3 */}
              <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] flex flex-col justify-between min-h-[58px]">
                <div className="font-mono text-[9px] text-[var(--landing-success)] font-semibold">
                  DONE
                </div>
                <div className="p-1 rounded bg-[var(--landing-surface-2)] text-[10px] text-[var(--landing-text-muted)] line-through leading-tight line-clamp-2">
                  {tasks.done}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Skeleton Placeholder */
          <div className="space-y-2 py-1">
            <div className="h-6 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] animate-pulse" />
            <div className="grid grid-cols-3 gap-1.5">
              <div className="h-14 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] animate-pulse" />
              <div className="h-14 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] animate-pulse" />
              <div className="h-14 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Deploy State with Confetti Delight */}
      <div className="pt-1.5 border-t border-[var(--landing-border)] flex items-center justify-between text-[11px] font-mono relative">
        <span className="text-[var(--landing-text-muted)] text-[10px]">Sandbox: Isolated</span>
        {chapter === 5 && (
          <div className="relative inline-flex items-center">
            {/* Confetti particles */}
            <div className="absolute -inset-2 pointer-events-none overflow-visible" aria-hidden="true">
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const distance = 18 + (i % 3) * 6;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                const color = i % 2 === 0 ? 'var(--landing-accent)' : 'var(--landing-pop-coral)';
                return (
                  <span
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-[1px] animate-in fade-in zoom-in duration-500"
                    style={{
                      backgroundColor: color,
                      left: '50%',
                      top: '50%',
                      transform: `translate(${x}px, ${y}px) rotate(${i * 24}deg)`,
                    }}
                  />
                );
              })}
            </div>

            <span
              aria-hidden="true"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--landing-accent)] text-[#090D0F] font-bold text-[10px] shadow-sm animate-in zoom-in-95 duration-200"
            >
              <CheckCircle2 className="w-3 h-3 text-[#090D0F]" />
              DEPLOYED
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
