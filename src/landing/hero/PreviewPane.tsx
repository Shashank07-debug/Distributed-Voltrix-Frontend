import React from 'react';
import { Check, Columns3, CheckCircle2 } from 'lucide-react';

export interface PreviewPaneProps {
  isAssembled: boolean;
  chapter: number;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ isAssembled, chapter }) => {
  return (
    <div className="h-full bg-[var(--landing-surface-2)] p-3 flex flex-col justify-between font-sans text-xs select-none overflow-hidden">
      {/* Mini App Window Header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--landing-border)] text-[11px] font-mono text-[var(--landing-text-muted)]">
          <span className="flex items-center gap-1.5 text-[var(--landing-text-secondary)]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                chapter >= 4 ? 'bg-[var(--landing-success)]' : 'bg-[var(--landing-accent)]'
              }`}
            />
            localhost:3000/tasks
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--landing-surface-1)] text-[var(--landing-text-muted)]">
            Live DOM
          </span>
        </div>

        {/* Assembled or Skeleton View */}
        {isAssembled || chapter >= 4 ? (
          <div className="space-y-2.5 animate-in fade-in duration-300">
            {/* Top Stat Bar with Accent Progress */}
            <div className="p-2 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-medium text-[var(--landing-text-primary)]">Sprint Tasks</span>
                <span className="text-[var(--landing-accent)] font-mono font-semibold">12 / 16 (75%)</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--landing-surface-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--landing-accent)] rounded-full transition-all duration-700 ease-out"
                  style={{ width: chapter >= 4 ? '75%' : '0%' }}
                />
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-3 gap-1.5">
              {/* Col 1 */}
              <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] space-y-1">
                <div className="text-[10px] font-mono text-[var(--landing-text-muted)] flex items-center justify-between">
                  <span>TODO</span>
                  <span className="text-[9px]">4</span>
                </div>
                <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] text-[10px] text-[var(--landing-text-secondary)] truncate">
                  Auth endpoint tests
                </div>
              </div>

              {/* Col 2 */}
              <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] space-y-1">
                <div className="text-[10px] font-mono text-[var(--landing-accent)] flex items-center justify-between">
                  <span>ACTIVE</span>
                  <span className="text-[9px]">2</span>
                </div>
                <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-3)] border border-[var(--landing-accent-subtle)] text-[10px] text-[var(--landing-text-primary)] truncate font-medium">
                  Streaming logs
                </div>
              </div>

              {/* Col 3 */}
              <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] space-y-1">
                <div className="text-[10px] font-mono text-[var(--landing-success)] flex items-center justify-between">
                  <span>DONE</span>
                  <span className="text-[9px]">10</span>
                </div>
                <div className="p-1.5 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] text-[10px] text-[var(--landing-text-muted)] truncate line-through">
                  Monaco editor tabs
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Skeleton Placeholder */
          <div className="space-y-2.5 py-2">
            <div className="h-6 rounded bg-[var(--landing-surface-1)] animate-pulse" />
            <div className="grid grid-cols-3 gap-1.5">
              <div className="h-16 rounded bg-[var(--landing-surface-1)] animate-pulse" />
              <div className="h-16 rounded bg-[var(--landing-surface-1)] animate-pulse" />
              <div className="h-16 rounded bg-[var(--landing-surface-1)] animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Deploy State */}
      <div className="pt-2 border-t border-[var(--landing-border)] flex items-center justify-between text-[11px] font-mono">
        <span className="text-[var(--landing-text-muted)]">Container: Ready</span>
        {chapter === 5 && (
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--landing-success-subtle)] text-[var(--landing-success)] font-semibold text-[10px] border border-[var(--landing-success)]/20 animate-in fade-in duration-200"
          >
            <CheckCircle2 className="w-3 h-3" />
            DEPLOYED
          </span>
        )}
      </div>
    </div>
  );
};
