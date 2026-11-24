import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  FileCode,
  FileJson,
  FileText,
  File,
  Check,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Copy,
} from 'lucide-react';
import {
  AssistantView,
  FileBlock,
  TextBlock,
  parseAssistantText,
  mapPersistedMessageToView,
} from '../../utils/assistantParser';
import { ChatMessage } from '../../api/chat';
import { toast } from 'sonner';

interface AssistantMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRetry?: () => void;
  onOpenFile?: (path: string) => void;
  durationSeconds?: number;
}

const getFileIcon = (filePath: string) => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'css':
    case 'html':
      return <FileCode className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    case 'md':
    case 'txt':
      return <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    default:
      return <File className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
  }
};

/* ── Code Block with Copy ──────────────────────────────────────────────────── */
const CodeBlock: React.FC<{ language?: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-ink)] overflow-hidden font-mono text-xs w-full">
      <div className="px-3 py-1.5 bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)] flex items-center justify-between text-[11px] text-[var(--landing-text-secondary)]">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code snippet"
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-[var(--landing-accent)]" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'copied' : 'copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-gray-200 leading-relaxed font-mono text-[11px]" data-lenis-prevent>
        <code>{value}</code>
      </pre>
    </div>
  );
};

/* ── Clamped Text Block Component ─────────────────────────────────────────── */
const ExpandableTextBlock: React.FC<{
  block: TextBlock;
  isLastBlock: boolean;
  isStreaming: boolean;
}> = ({ block, isLastBlock, isStreaming }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = block.text.length > 400;

  return (
    <div className="w-full min-w-0 break-words text-sm text-[var(--landing-text-primary)] leading-[1.5] font-sans my-1">
      <div className={isLong && !isExpanded ? 'line-clamp-4 relative' : ''}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !String(children).includes('\n');
              if (isInline) {
                return (
                  <code
                    className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs text-[var(--landing-accent)]"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <CodeBlock
                  language={match ? match[1] : undefined}
                  value={String(children).replace(/\n$/, '')}
                />
              );
            },
          }}
        >
          {block.text}
        </ReactMarkdown>

        {/* Single blinking caret at the end of the last open text block */}
        {isStreaming && isLastBlock && block.isOpen && (
          <span
            aria-hidden="true"
            className="inline-block w-2 h-4 ml-1 bg-[var(--landing-accent)] animate-pulse align-middle motion-reduce:animate-none"
          />
        )}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="text-xs font-mono text-[var(--landing-accent)] hover:underline mt-1 cursor-pointer"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

/* ── File Cards List Component (ONE card per unique file) ─────────────────── */
const FileCardsList: React.FC<{
  files: FileBlock[];
  onOpenFile?: (path: string) => void;
}> = ({ files, onOpenFile }) => {
  const [showAll, setShowAll] = useState(false);

  if (files.length === 0) return null;

  const hasMoreThan5 = files.length > 5;
  const visibleFiles = hasMoreThan5 && !showAll ? files.slice(0, 4) : files;
  const hiddenCount = files.length - 4;

  return (
    <div className="w-full my-2">
      <ul role="list" className="space-y-1.5 w-full">
        {visibleFiles.map((file) => (
          <li
            key={file.path}
            onClick={() => onOpenFile && onOpenFile(file.path)}
            title={file.path}
            className={`h-9 px-3 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface-2)]/60 flex items-center justify-between text-xs font-mono transition-colors w-full ${
              onOpenFile ? 'hover:border-[var(--landing-accent)]/50 hover:bg-[var(--landing-surface-2)] cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 truncate mr-2">
              {getFileIcon(file.path)}
              <span className="text-[var(--landing-text-secondary)] text-[11px] shrink-0">
                {file.status === 'editing' ? 'Editing' : 'Edited'}
              </span>
              <span className="text-[var(--landing-text-primary)] font-medium truncate">
                {file.path}
              </span>
            </div>

            <div className="shrink-0 flex items-center">
              {file.status === 'editing' && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--landing-accent)]" />
              )}
              {file.status === 'done' && (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {file.status === 'failed' && (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMoreThan5 && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          aria-expanded={showAll}
          className="mt-1.5 px-3 py-1 rounded-lg text-xs font-mono text-[var(--landing-accent)] hover:bg-[var(--landing-surface-2)] transition-colors cursor-pointer"
        >
          {showAll ? 'Show fewer files' : `+${hiddenCount} more files`}
        </button>
      )}
    </div>
  );
};

/* ── Primary Assistant Message Component ─────────────────────────────────── */
const AssistantMessageInternal: React.FC<AssistantMessageProps> = ({
  message,
  isStreaming = false,
  onRetry,
  onOpenFile,
  durationSeconds,
}) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);

  // Compute unified AssistantView from live buffer or persisted message
  const view: AssistantView = useMemo(() => {
    if (isStreaming) {
      return parseAssistantText(message.content || '', true);
    }
    return mapPersistedMessageToView(message);
  }, [message, isStreaming]);

  // Separate text blocks and file blocks
  const textBlocks = useMemo(
    () => view.blocks.filter((b): b is TextBlock => b.kind === 'text'),
    [view.blocks]
  );

  const fileBlocks = useMemo(
    () => view.blocks.filter((b): b is FileBlock => b.kind === 'file'),
    [view.blocks]
  );

  // Active status text for aria-live
  const currentEditingFile = useMemo(() => {
    const active = fileBlocks.find((f) => f.status === 'editing');
    return active ? `Editing ${active.path}...` : null;
  }, [fileBlocks]);

  const introBlock = textBlocks[0];
  const summaryBlocks = textBlocks.slice(1);

  // Thought duration label
  const thoughtTime = durationSeconds || view.reasoning?.durationSeconds;
  const thoughtLabel = isStreaming && !introBlock
    ? 'Thinking...'
    : thoughtTime
    ? `Thought for ${thoughtTime}s`
    : 'Reasoning trace';

  return (
    <div
      data-assistant-message
      data-testid="assistant-message"
      className="w-full flex flex-col items-start text-left select-text"
    >
      {/* ── Screen Reader Polite Live Region (Single small status line only) ── */}
      {isStreaming && currentEditingFile && (
        <span className="sr-only" aria-live="polite">
          {currentEditingFile}
        </span>
      )}

      {/* ── 1. Reasoning Trace Row ────────────────────────────────────────── */}
      {view.reasoning?.text && (
        <div className="w-full my-1">
          <button
            type="button"
            onClick={() => setIsThoughtOpen((prev) => !prev)}
            aria-expanded={isThoughtOpen}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--landing-surface-2)]/80 hover:bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-xs font-mono text-[var(--landing-text-secondary)] transition-colors cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-[var(--landing-accent)]" />
            <span className={isStreaming && !introBlock ? 'animate-pulse text-[var(--landing-accent)]' : ''}>
              {thoughtLabel}
            </span>
            {isThoughtOpen ? (
              <ChevronDown className="w-3 h-3 text-[var(--landing-text-secondary)]" />
            ) : (
              <ChevronRight className="w-3 h-3 text-[var(--landing-text-secondary)]" />
            )}
          </button>

          {isThoughtOpen && (
            <div className="mt-1.5 p-3 rounded-xl bg-[var(--landing-bg-ink)] border border-[var(--landing-border)] font-mono text-xs text-[var(--landing-text-secondary)] whitespace-pre-wrap leading-relaxed w-full">
              {view.reasoning.text}
            </div>
          )}
        </div>
      )}

      {/* ── 2. Intro Text Block ───────────────────────────────────────────── */}
      {introBlock && (
        <ExpandableTextBlock
          block={introBlock}
          isLastBlock={summaryBlocks.length === 0 && fileBlocks.length === 0}
          isStreaming={isStreaming}
        />
      )}

      {/* ── 3. File Cards List ────────────────────────────────────────────── */}
      <FileCardsList files={fileBlocks} onOpenFile={onOpenFile} />

      {/* ── 4. Summary Text Blocks ────────────────────────────────────────── */}
      {summaryBlocks.map((block, idx) => (
        <ExpandableTextBlock
          key={idx}
          block={block}
          isLastBlock={idx === summaryBlocks.length - 1}
          isStreaming={isStreaming}
        />
      ))}

      {/* ── Thinking placeholder while streaming before intro text arrives ── */}
      {isStreaming && !introBlock && fileBlocks.length === 0 && (
        <div className="flex items-center gap-2 py-2 text-xs font-mono text-[var(--landing-text-secondary)]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--landing-accent)]" />
          <span>Generating response...</span>
        </div>
      )}

      {/* ── 5. Compact Inline Error Alert (Does NOT replace content) ───────── */}
      {message.error && (
        <div className="w-full mt-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center justify-between text-xs font-sans gap-2">
          <div className="flex items-center gap-2 truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">{message.error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isStreaming}
              aria-label="Retry generation"
              className="px-2.5 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 text-[11px] font-mono flex items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>retry</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Wrap in React.memo so persisted messages do not re-render when live streaming updates
export const AssistantMessage = React.memo(AssistantMessageInternal);
