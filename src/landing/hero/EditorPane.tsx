import React from 'react';
import { CODE_LINES } from './useDemoTimeline';
import { Caret } from '../components/Caret';

export interface EditorPaneProps {
  visibleLinesCount: number;
  activeFile?: string;
  isWriting?: boolean;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  visibleLinesCount,
  activeFile = 'TaskBoard.tsx',
  isWriting = false,
}) => {
  return (
    <div className="h-full bg-[#0E0E10] flex flex-col font-mono text-[11px] leading-relaxed border-r border-[var(--landing-border)] select-none overflow-hidden">
      {/* Editor Tab Bar */}
      <div className="h-7 bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)] flex items-center px-2 gap-1 text-[11px]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-t-[var(--landing-radius-sm)] bg-[#0E0E10] border-t border-x border-[var(--landing-border)] text-[var(--landing-accent)] font-medium">
          <span>{activeFile}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
        </div>
        <div className="flex items-center px-2 text-[var(--landing-text-muted)] opacity-60">
          Sidebar.tsx
        </div>
      </div>

      {/* Code Body */}
      <div className="flex-1 p-2.5 overflow-hidden space-y-0.5">
        {CODE_LINES.slice(0, visibleLinesCount).map((line, idx) => {
          const isLatest = idx === visibleLinesCount - 1 && isWriting;

          return (
            <div
              key={line.num}
              className={`flex items-baseline gap-3 px-1 rounded-[2px] ${
                isLatest ? 'bg-[var(--landing-accent-subtle)]' : ''
              }`}
            >
              <span className="w-4 text-right text-[10px] text-[var(--landing-text-muted)] shrink-0 select-none">
                {line.num}
              </span>
              <span className="text-[var(--landing-text-secondary)] whitespace-pre truncate font-mono">
                {line.text.includes('interface') || line.text.includes('export function') ? (
                  <>
                    <span className="text-[var(--landing-accent)]">
                      {line.text.split(' ')[0]}{' '}
                    </span>
                    <span className="text-[var(--landing-text-primary)]">
                      {line.text.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : line.text.includes('const') || line.text.includes('return') ? (
                  <>
                    <span className="text-[var(--landing-accent)]">
                      {line.text.trim().split(' ')[0]}{' '}
                    </span>
                    <span className="text-[var(--landing-text-secondary)]">
                      {line.text.trim().split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : (
                  line.text
                )}
                {isLatest && <Caret />}
              </span>
            </div>
          );
        })}

        {visibleLinesCount === 0 && (
          <div className="text-[11px] text-[var(--landing-text-muted)] italic px-2 py-4">
            Waiting for generator pipeline...
          </div>
        )}
      </div>
    </div>
  );
};
