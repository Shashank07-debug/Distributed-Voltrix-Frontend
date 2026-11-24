import React, { useRef, useEffect } from 'react';
import { Send, Square, Lock } from 'lucide-react';

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  isReadOnly?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  isReadOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to 6 rows (~150px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${Math.max(44, nextHeight)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) {
        onSend();
      }
    }
  };

  if (isReadOnly) {
    return (
      <div className="p-3 border-t border-[var(--landing-border)] bg-[var(--landing-bg-ink)] shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[var(--landing-text-secondary)]">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>read-only role (VIEWER). prompting disabled.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-[var(--landing-border)] bg-[var(--landing-bg-ink)] shrink-0">
      <div className="relative flex items-center">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          rows={1}
          placeholder="Ask Voltrix AI to build or edit code... (Enter to send, Shift+Enter for newline)"
          aria-label="Prompt input for Voltrix AI"
          className="w-full bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] focus:border-[var(--landing-accent)] rounded-2xl pl-3.5 pr-12 py-2.5 text-xs text-[var(--landing-text-primary)] placeholder:text-[var(--landing-text-secondary)]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)] resize-none transition-all disabled:opacity-50 font-sans leading-relaxed min-h-[44px] max-h-[160px]"
        />

        {/* Pinned action button inside right edge */}
        <div className="absolute right-2 bottom-2 flex items-center">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop AI generation"
              title="Stop generation"
              className="h-8 w-8 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-transform active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!value.trim()}
              aria-label="Send instruction"
              title="Send instruction (Enter)"
              className="h-8 w-8 rounded-xl bg-[var(--landing-accent)] hover:brightness-110 text-[#090D0F] transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-[#090D0F]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
