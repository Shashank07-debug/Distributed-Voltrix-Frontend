import React from 'react';
import { Caret } from '../components/Caret';

export interface EditorPaneProps {
  codeLines: { num: number; text: string }[];
  visibleLinesCount: number;
  activeFile?: string;
  isWriting?: boolean;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  codeLines,
  visibleLinesCount,
  activeFile = 'HabitBoard.tsx',
  isWriting = false,
}) => {
  return (
    <div className="h-full bg-[#080B0D] flex flex-col font-mono text-[10.5px] sm:text-[11px] leading-relaxed border-r border-[var(--landing-border)] select-none overflow-hidden">
      {/* Tab bar */}
      <div className="h-7 bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)] flex items-center px-2 gap-1 text-[11px] overflow-x-auto [scrollbar-width:none]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-t-[var(--landing-radius-sm)] bg-[#080B0D] border-t border-x border-[var(--landing-border)] text-[var(--landing-accent)] font-semibold shrink-0">
          <span>{activeFile}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
        </div>
        <div className="flex items-center px-2 text-[var(--landing-text-muted)] opacity-50 shrink-0">
          App.tsx
        </div>
      </div>

      {/* Code body with horizontal scroll to prevent token clipping */}
      <div className="flex-1 p-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none] space-y-0.5">
        {codeLines.slice(0, visibleLinesCount).map((line, idx) => {
          const isLatest = idx === visibleLinesCount - 1 && isWriting;

          return (
            <div
              key={line.num}
              className={`flex items-baseline gap-2.5 px-1 rounded-[2px] whitespace-pre min-w-max ${
                isLatest ? 'bg-[var(--landing-accent-subtle)]' : ''
              }`}
            >
              <span className="w-4 text-right text-[10px] text-[var(--landing-text-muted)] shrink-0 select-none">
                {line.num}
              </span>
              <span className="text-[var(--landing-text-secondary)] font-mono">
                {line.text.includes('export function') || line.text.includes('interface') ? (
                  <>
                    <span className="text-[var(--landing-accent)] font-semibold">
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
            streaming code...
          </div>
        )}
      </div>
    </div>
  );
};
