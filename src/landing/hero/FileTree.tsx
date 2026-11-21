import React from 'react';
import { Folder, FileCode2, ChevronRight } from 'lucide-react';

export interface FileTreeProps {
  files: { name: string; isDir: boolean; indent: number; active?: boolean }[];
  visibleCount: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ files, visibleCount }) => {
  return (
    <div className="h-full bg-[var(--landing-surface-1)] border-r border-[var(--landing-border)] p-2.5 font-mono text-[11px] select-none overflow-hidden flex flex-col">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--landing-text-muted)] px-1 pb-2 border-b border-[var(--landing-border)] flex items-center justify-between">
        <span>Files</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--landing-surface-2)] text-[var(--landing-accent)] font-semibold">
          {Math.min(visibleCount, files.length)}/{files.length}
        </span>
      </div>

      <div className="flex-1 py-1.5 space-y-0.5 overflow-hidden">
        {files.slice(0, visibleCount).map((item, idx) => {
          const indentClass =
            item.indent === 0 ? 'pl-0.5' : item.indent === 1 ? 'pl-2.5' : 'pl-4';

          return (
            <div
              key={idx}
              className={`flex items-center gap-1.5 py-1 px-1.5 rounded-[var(--landing-radius-sm)] transition-[opacity,transform] duration-140 ${indentClass} ${
                item.active
                  ? 'bg-[var(--landing-surface-3)] text-[var(--landing-accent)] font-semibold border-l-2 border-[var(--landing-accent)]'
                  : 'text-[var(--landing-text-secondary)] hover:bg-[var(--landing-surface-2)]'
              }`}
            >
              {item.isDir ? (
                <>
                  <ChevronRight className="w-3 h-3 text-[var(--landing-text-muted)]" />
                  <Folder className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0" />
                </>
              ) : (
                <>
                  <span className="w-3" />
                  <FileCode2 className="w-3.5 h-3.5 text-[var(--landing-text-muted)] shrink-0" />
                </>
              )}
              <span className="truncate">{item.name}</span>
            </div>
          );
        })}

        {visibleCount === 0 && (
          <div className="text-[11px] text-[var(--landing-text-muted)] italic px-2 py-4">
            planning files...
          </div>
        )}
      </div>
    </div>
  );
};
